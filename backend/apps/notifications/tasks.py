from celery import shared_task


def create_notification(recipient_id, actor_id, verb, target_id):
    """Create a notification synchronously (skips self-notifications).

    Called directly from views so notifications work without a Celery worker.
    """
    from .models import Notification

    if recipient_id == actor_id:
        return
    Notification.objects.create(
        recipient_id=recipient_id,
        actor_id=actor_id,
        verb=verb,
        target_id=target_id,
    )


@shared_task
def notify(recipient_id, actor_id, verb, target_id):
    """Celery wrapper (kept for compatibility / future async use)."""
    create_notification(recipient_id, actor_id, verb, target_id)
