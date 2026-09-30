from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    """
    Extends Django's user with the exact fields the frontend already
    expects on `user` (see src/services/authService.js and Settings.jsx).

    NOTE: the frontend's Signup page sends the user's free-text "Full Name"
    (e.g. "Ananya Rao", with a space) into this `username` field -- it is
    used purely as a display name, never for login (email is the
    USERNAME_FIELD). Django's default username field rejects spaces via
    its built-in regex validator, so it's overridden here to accept any
    text rather than requiring a frontend change.
    """

    username = models.CharField(max_length=150, validators=[])
    email = models.EmailField(unique=True)
    avatar = models.ImageField(upload_to="avatars/", blank=True, null=True)
    phone_number = models.CharField(max_length=20, blank=True)
    theme_preference = models.CharField(
        max_length=10, choices=[("light", "Light"), ("dark", "Dark")], default="dark"
    )
    daily_generations_used = models.PositiveIntegerField(default=0)
    generations_reset_at = models.DateField(auto_now_add=True)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["username"]

    def __str__(self):
        return self.email


class UserPreference(models.Model):
    """Matches user.preferences.{preferred_style,preferred_palette,currency,measurement_unit}."""

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="preferences")
    preferred_style = models.CharField(max_length=100, blank=True)
    preferred_palette = models.CharField(max_length=255, blank=True)
    currency = models.CharField(max_length=10, default="INR")
    measurement_unit = models.CharField(max_length=10, choices=[("ft", "Feet"), ("m", "Meters")], default="ft")

    def __str__(self):
        return f"Preferences for {self.user.email}"
