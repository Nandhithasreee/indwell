from django.conf import settings
from django.db import models


class Design(models.Model):
    """
    Field names match src/services/designService.js's mock design object.
    The frontend's Generate Design form now collects room_type, length_ft,
    width_ft, interior_style, color_palette, and a free-text `prompt`
    (no budget/existing_furniture/special_requirements fields anymore) --
    the LLM estimates a reasonable budget itself and rewrites the user's
    short prompt into a professional design brief (`enhanced_prompt`),
    per the "Prompt Enhancement" step of the AI pipeline.
    """

    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="designs")

    room_type = models.CharField(max_length=100)
    length_ft = models.DecimalField(max_digits=6, decimal_places=2)
    width_ft = models.DecimalField(max_digits=6, decimal_places=2)
    interior_style = models.CharField(max_length=100)
    color_palette = models.CharField(max_length=255, blank=True)
    user_prompt = models.TextField(blank=True, help_text="The user's free-text room description, as typed")

    raw_prompt = models.TextField(help_text="Full engineered instruction sent to the LLM provider")
    enhanced_prompt = models.TextField(
        blank=True, help_text="The LLM's professionally rewritten version of the user's prompt"
    )

    summary = models.TextField()
    room_json = models.JSONField(help_text="Schema-validated scene used by the existing A-Frame RoomViewer3D")
    budget = models.DecimalField(
        max_digits=12, decimal_places=2, null=True, blank=True,
        help_text="No longer collected from the user -- estimated by the LLM from budget_breakdown",
    )
    budget_breakdown = models.JSONField(default=dict, blank=True)
    maintenance_tips = models.TextField(blank=True)

    image_url = models.URLField(blank=True, null=True, help_text="Optional AI-generated hero image")
    llm_provider_used = models.CharField(max_length=30, blank=True)
    image_provider_used = models.CharField(max_length=30, blank=True)

    is_saved = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.room_type} design #{self.pk} for {self.owner.email}"


class DesignVersion(models.Model):
    """Keeps regenerate history so users can compare/revert versions of a design."""

    design = models.ForeignKey(Design, on_delete=models.CASCADE, related_name="versions")
    room_json = models.JSONField()
    summary = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]


class ActivityLog(models.Model):
    """Powers the History page's activity feed (designService.history())."""

    ACTION_CHOICES = [
        ("generated", "Generated a design"),
        ("saved", "Saved a design"),
        ("regenerated", "Regenerated a design"),
        ("deleted", "Deleted a design"),
        ("downloaded_pdf", "Downloaded PDF"),
    ]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="activity_logs")
    design = models.ForeignKey(Design, on_delete=models.SET_NULL, null=True, blank=True, related_name="activity_logs")
    action = models.CharField(max_length=20, choices=ACTION_CHOICES)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.user.email} {self.action} at {self.created_at:%Y-%m-%d %H:%M}"


class GenerationJob(models.Model):
    """
    Optional async job tracking for the Celery-backed generation pipeline
    (see ai_engine/tasks.py + GET /api/ai/status/<job_id>/). Not required
    by the current frontend, which calls the synchronous endpoint, but
    available for a future polling-based UI.
    """

    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("processing", "Processing"),
        ("completed", "Completed"),
        ("failed", "Failed"),
    ]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="generation_jobs")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")
    design = models.ForeignKey(Design, on_delete=models.SET_NULL, null=True, blank=True)
    error_message = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
