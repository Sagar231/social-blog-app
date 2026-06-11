from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    """Custom user with profile fields and denormalized social counts."""

    bio = models.TextField(blank=True, max_length=500)
    avatar = models.ImageField(upload_to="avatars/", blank=True, null=True)
    banner = models.ImageField(upload_to="banners/", blank=True, null=True)

    follower_count = models.PositiveIntegerField(default=0)
    following_count = models.PositiveIntegerField(default=0)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.username
