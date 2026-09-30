from django.conf import settings
from django.db import models


class Feedback(models.Model):
    CATEGORY_CHOICES = [
        ("bug", "Bug report"),
        ("feature", "Feature request"),
        ("design", "Design feedback"),
        ("other", "Other"),
    ]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="feedback")
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES, default="other")
    rating = models.PositiveSmallIntegerField(help_text="1-5 stars")
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.category} feedback from {self.user.email}"
