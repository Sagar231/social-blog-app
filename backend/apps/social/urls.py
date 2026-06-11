from django.urls import path

from .views import BookmarkListView, FollowToggleView

urlpatterns = [
    path("users/<str:username>/follow", FollowToggleView.as_view(), name="follow"),
    path("bookmarks", BookmarkListView.as_view(), name="bookmarks"),
]
