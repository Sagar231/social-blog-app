from django.urls import path
from rest_framework.routers import DefaultRouter

from .views import CommentListCreateView, FeedView, PostViewSet

router = DefaultRouter(trailing_slash=False)
router.register("posts", PostViewSet, basename="post")

urlpatterns = [
    path("feed", FeedView.as_view(), name="feed"),
    path(
        "posts/<slug:slug>/comments",
        CommentListCreateView.as_view(),
        name="post-comments",
    ),
] + router.urls
