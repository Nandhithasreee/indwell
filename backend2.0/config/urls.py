from django.contrib import admin
from django.conf import settings
from django.conf.urls.static import static
from django.urls import include, path

from common.views import health_check

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/health/", health_check, name="health_check"),
    path("api/auth/", include("accounts.urls")),
    path("api/ai/", include("ai_engine.urls")),
    path("api/designs/", include("designs.urls")),
    path("api/feedback/", include("feedback.urls")),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
