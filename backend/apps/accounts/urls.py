from django.urls import path

from .views import MeView, UserDetailView

urlpatterns = [
    path("users/me", MeView.as_view(), name="me"),
    path("users/<str:username>", UserDetailView.as_view(), name="user-detail"),
]
