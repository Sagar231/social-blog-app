from celery import shared_task
from django.core.cache import cache
from django.db.models import Count
from django.utils import timezone
from datetime import timedelta


@shared_task
def compute_trending_tags():
    """Periodic (Celery Beat): cache the most-used tags from the last 7 days."""
    from .models import Tag

    since = timezone.now() - timedelta(days=7)
    trending = list(
        Tag.objects.filter(posts__created_at__gte=since)
        .annotate(post_count=Count("posts"))
        .order_by("-post_count")
        .values("name", "slug", "post_count")[:10]
    )
    cache.set("trending_tags", trending, timeout=60 * 30)
    return trending


@shared_task
def fan_out_post(post_id):
    """Optional fan-out hook: invalidate follower feed caches on new post."""
    from .models import Post

    try:
        post = Post.objects.select_related("author").get(pk=post_id)
    except Post.DoesNotExist:
        return
    follower_ids = post.author.followers.values_list("follower_id", flat=True)
    for fid in follower_ids:
        cache.delete(f"feed:{fid}")
    return len(follower_ids)
