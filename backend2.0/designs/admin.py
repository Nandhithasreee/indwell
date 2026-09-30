from django.contrib import admin

from .models import ActivityLog, Design, DesignVersion, GenerationJob

admin.site.register(Design)
admin.site.register(DesignVersion)
admin.site.register(ActivityLog)
admin.site.register(GenerationJob)
