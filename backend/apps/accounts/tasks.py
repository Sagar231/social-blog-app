from celery import shared_task
from django.conf import settings
from django.contrib.auth import get_user_model
from django.core.mail import send_mail

User = get_user_model()


@shared_task
def send_welcome_email(user_id):
    """Send a welcome/verification email asynchronously on registration."""
    try:
        user = User.objects.get(pk=user_id)
    except User.DoesNotExist:
        return

    if not user.email:
        return

    send_mail(
        subject="Welcome to the community 🎉",
        message=(
            f"Hi {user.username},\n\n"
            "Thanks for joining! Start by writing your first post or "
            f"following a few people.\n\n{settings.FRONTEND_URL}\n"
        ),
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[user.email],
        fail_silently=True,
    )
