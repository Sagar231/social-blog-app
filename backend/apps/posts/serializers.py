from rest_framework import serializers

from apps.accounts.serializers import UserMiniSerializer

from .models import Comment, Post, Tag


class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = ("id", "name", "slug")


class CommentSerializer(serializers.ModelSerializer):
    author = UserMiniSerializer(read_only=True)
    replies = serializers.SerializerMethodField()

    class Meta:
        model = Comment
        fields = (
            "id",
            "post",
            "author",
            "body",
            "parent",
            "replies",
            "created_at",
        )
        read_only_fields = ("id", "author", "post", "replies", "created_at")

    def get_replies(self, obj):
        if obj.parent_id is not None:
            return []
        return CommentSerializer(obj.replies.all(), many=True, context=self.context).data


class PostListSerializer(serializers.ModelSerializer):
    author = UserMiniSerializer(read_only=True)
    tags = TagSerializer(many=True, read_only=True)
    is_liked = serializers.SerializerMethodField()
    is_bookmarked = serializers.SerializerMethodField()

    class Meta:
        model = Post
        fields = (
            "id",
            "author",
            "title",
            "slug",
            "cover_image",
            "cover_image_url",
            "tags",
            "status",
            "like_count",
            "comment_count",
            "is_liked",
            "is_bookmarked",
            "created_at",
        )

    def _user(self):
        request = self.context.get("request")
        return request.user if request and request.user.is_authenticated else None

    def get_is_liked(self, obj):
        user = self._user()
        return bool(user) and obj.likes.filter(user=user).exists()

    def get_is_bookmarked(self, obj):
        user = self._user()
        return bool(user) and obj.bookmarks.filter(user=user).exists()


class PostDetailSerializer(PostListSerializer):
    tag_names = serializers.ListField(
        child=serializers.CharField(max_length=50),
        write_only=True,
        required=False,
    )

    class Meta(PostListSerializer.Meta):
        fields = PostListSerializer.Meta.fields + ("body", "tag_names", "updated_at")

    def _set_tags(self, post, tag_names):
        tags = []
        for name in tag_names:
            name = name.strip().lower()
            if not name:
                continue
            tag, _ = Tag.objects.get_or_create(name=name)
            tags.append(tag)
        post.tags.set(tags)

    def create(self, validated_data):
        tag_names = validated_data.pop("tag_names", [])
        post = Post.objects.create(
            author=self.context["request"].user, **validated_data
        )
        self._set_tags(post, tag_names)
        return post

    def update(self, instance, validated_data):
        tag_names = validated_data.pop("tag_names", None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        if tag_names is not None:
            self._set_tags(instance, tag_names)
        return instance
