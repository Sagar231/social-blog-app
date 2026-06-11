from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/auth/", include("apps.accounts.urls_auth")),
    path("api/auth/refresh", TokenRefreshView.as_view(), name="token_refresh"),
    path("api/", include("apps.accounts.urls")),
    path("api/", include("apps.posts.urls")),
    path("api/", include("apps.social.urls")),
    path("api/", include("apps.notifications.urls")),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
