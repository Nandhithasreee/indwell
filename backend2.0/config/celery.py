"""
Celery app for InDwell. Async design generation is optional -- by default
CELERY_TASK_ALWAYS_EAGER=True in settings, so tasks run synchronously in
the request/response cycle with zero extra setup. Set it to False and run
a worker (see README) once Redis is available for true background jobs.
"""
import os

from celery import Celery

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")

app = Celery("indwell")
app.config_from_object("django.conf:settings", namespace="CELERY")
app.autodiscover_tasks()
