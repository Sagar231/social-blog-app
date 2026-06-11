from celery import shared_task


@shared_task
def notify(recipient_id, actor_id, verb, target_id):
    """Create a notification (skips self-notifications)."""
    from .models import Notification

    if recipient_id == actor_id:
        return
    Notification.objects.create(
        recipient_id=recipient_id,
        actor_id=actor_id,
        verb=verb,
        target_id=target_id,
    )
