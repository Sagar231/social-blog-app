from rest_framework import serializers

from apps.accounts.serializers import UserMiniSerializer
from apps.posts.models import Post

from .models import Notification


class NotificationSerializer(serializers.ModelSerializer):
    actor = UserMiniSerializer(read_only=True)
    target = serializers.SerializerMethodField()

    class Meta:
        model = Notification
        fields = ("id", "actor", "verb", "target_id", "target", "is_read", "created_at")
        read_only_fields = fields

    def get_target(self, obj):
        if not obj.target_id:
            return None
        post = Post.objects.filter(pk=obj.target_id).values("title", "slug").first()
        return post
