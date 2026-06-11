"""Pytest config: use a fast in-memory SQLite DB and dummy cache for tests."""
import os

# Must be set before Django reads settings so dj_database_url builds a complete
# connection dict (with ATOMIC_REQUESTS etc.).
os.environ.setdefault("DATABASE_URL", "sqlite://:memory:")
os.environ.setdefault("SECRET_KEY", "test-secret")
os.environ.setdefault("DEBUG", "True")
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")


def pytest_configure():
    from django.conf import settings

    # Local-memory cache so tests don't need Redis.
    settings.CACHES["default"] = {
        "BACKEND": "django.core.cache.backends.locmem.LocMemCache",
        "LOCATION": "test-cache",
    }
    # Run Celery tasks synchronously in tests.
    settings.CELERY_TASK_ALWAYS_EAGER = True
