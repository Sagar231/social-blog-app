from django.core.cache import cache
from django.db.models import F
from rest_framework import generics, permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from apps.notifications.tasks import create_notification
from apps.social.models import Bookmark, Like

from .filters import PostFilter
from .models import Comment, Post
from .serializers import (
    CommentSerializer,
    PostDetailSerializer,
    PostListSerializer,
)


def invalidate_post_cache(slug):
    """Clear all per-user cached copies of a post detail. No-op on cache
    backends without pattern deletion (e.g. local-memory used in tests)."""
    try:
        cache.delete_pattern(f"post_detail:{slug}:*")
    except (AttributeError, NotImplementedError):
        pass


class IsAuthorOrReadOnly(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return obj.author_id == request.user.id


class PostViewSet(viewsets.ModelViewSet):
    lookup_field = "slug"
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsAuthorOrReadOnly]
    filterset_class = PostFilter
    search_fields = ["title", "body"]
    ordering_fields = ["created_at", "like_count", "comment_count"]

    def get_queryset(self):
        qs = (
            Post.objects.select_related("author")
            .prefetch_related("tags")
        )
        # Only the author can see their own drafts; everyone else: published only.
        if self.action == "list":
            user = self.request.user
            if user.is_authenticated:
                from django.db.models import Q

                return qs.filter(
                    Q(status=Post.Status.PUBLISHED) | Q(author=user)
                ).distinct()
            return qs.filter(status=Post.Status.PUBLISHED)
        return qs

    def get_serializer_class(self):
        if self.action == "list":
            return PostListSerializer
        return PostDetailSerializer

    def retrieve(self, request, *args, **kwargs):
        slug = kwargs.get("slug")
        cache_key = f"post_detail:{slug}:{request.user.id or 'anon'}"
        data = cache.get(cache_key)
        if data is None:
            instance = self.get_object()
            data = self.get_serializer(instance).data
            cache.set(cache_key, data, timeout=30)
        return Response(data)

    def perform_update(self, serializer):
        serializer.save()
        invalidate_post_cache(serializer.instance.slug)

    @action(detail=True, methods=["post"], permission_classes=[permissions.IsAuthenticated])
    def like(self, request, slug=None):
        post = self.get_object()
        like, created = Like.objects.get_or_create(user=request.user, post=post)
        if created:
            Post.objects.filter(pk=post.pk).update(like_count=F("like_count") + 1)
            create_notification(post.author_id, request.user.id, "like", post.id)
            liked = True
        else:
            like.delete()
            Post.objects.filter(pk=post.pk).update(like_count=F("like_count") - 1)
            liked = False
        post.refresh_from_db(fields=["like_count"])
        invalidate_post_cache(post.slug)
        return Response({"liked": liked, "like_count": post.like_count})

    @action(detail=True, methods=["post"], permission_classes=[permissions.IsAuthenticated])
    def bookmark(self, request, slug=None):
        post = self.get_object()
        bm, created = Bookmark.objects.get_or_create(user=request.user, post=post)
        if not created:
            bm.delete()
        invalidate_post_cache(post.slug)
        return Response({"bookmarked": created})


class CommentListCreateView(generics.ListCreateAPIView):
    serializer_class = CommentSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_post(self):
        return generics.get_object_or_404(Post, slug=self.kwargs["slug"])

    def get_queryset(self):
        return (
            Comment.objects.filter(post=self.get_post(), parent__isnull=True)
            .select_related("author")
            .prefetch_related("replies__author")
        )

    def perform_create(self, serializer):
        post = self.get_post()
        comment = serializer.save(author=self.request.user, post=post)
        Post.objects.filter(pk=post.pk).update(comment_count=F("comment_count") + 1)
        if post.author_id != self.request.user.id:
            create_notification(
                post.author_id, self.request.user.id, "comment", post.id
            )


class FeedView(generics.ListAPIView):
    """Personalized feed: posts from people the user follows, their own posts,
    and posts they've liked."""

    serializer_class = PostListSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        from django.db.models import Q

        user = self.request.user
        following_ids = list(
            user.following.values_list("following_id", flat=True)
        )
        following_ids.append(user.id)
        liked_ids = list(user.likes.values_list("post_id", flat=True))

        return (
            Post.objects.filter(
                Q(author_id__in=following_ids) | Q(id__in=liked_ids),
                status=Post.Status.PUBLISHED,
            )
            .select_related("author")
            .prefetch_related("tags")
            .distinct()
        )
