from django.contrib.auth import get_user_model
from django.db.models import F
from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.notifications.tasks import create_notification
from apps.posts.models import Post
from apps.posts.serializers import PostListSerializer

from .models import Bookmark, Follow

User = get_user_model()


class FollowToggleView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, username):
        target = generics.get_object_or_404(User, username=username)
        if target.id == request.user.id:
            return Response({"detail": "You cannot follow yourself."}, status=400)

        follow, created = Follow.objects.get_or_create(
            follower=request.user, following=target
        )
        if created:
            User.objects.filter(pk=target.pk).update(
                follower_count=F("follower_count") + 1
            )
            User.objects.filter(pk=request.user.pk).update(
                following_count=F("following_count") + 1
            )
            create_notification(target.id, request.user.id, "follow", None)
            following = True
        else:
            follow.delete()
            User.objects.filter(pk=target.pk).update(
                follower_count=F("follower_count") - 1
            )
            User.objects.filter(pk=request.user.pk).update(
                following_count=F("following_count") - 1
            )
            following = False

        target.refresh_from_db(fields=["follower_count"])
        return Response({"following": following, "follower_count": target.follower_count})


class BookmarkListView(generics.ListAPIView):
    serializer_class = PostListSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        post_ids = Bookmark.objects.filter(user=self.request.user).values_list(
            "post_id", flat=True
        )
        return (
            Post.objects.filter(id__in=post_ids)
            .select_related("author")
            .prefetch_related("tags")
        )
