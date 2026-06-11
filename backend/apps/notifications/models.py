from django.conf import settings
from django.db import models


class Notification(models.Model):
    class Verb(models.TextChoices):
        LIKE = "like", "Liked your post"
        COMMENT = "comment", "Commented on your post"
        FOLLOW = "follow", "Followed you"

    recipient = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="notifications",
    )
    actor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="actions",
    )
    verb = models.CharField(max_length=20, choices=Verb.choices)
    # Loose reference to a Post (target). Null for follow events.
    target_id = models.PositiveBigIntegerField(null=True, blank=True)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [models.Index(fields=["recipient", "is_read"])]

    def __str__(self):
        return f"{self.actor} {self.verb} -> {self.recipient}"
