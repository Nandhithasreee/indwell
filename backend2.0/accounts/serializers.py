from django.contrib.auth import password_validation
from rest_framework import serializers

from .models import User, UserPreference


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ["id", "username", "email", "password"]

    def validate_password(self, value):
        password_validation.validate_password(value)
        return value

    def validate_username(self, value):
        if User.objects.filter(username__iexact=value).exists():
            raise serializers.ValidationError("That name is already registered. Try signing in instead.")
        return value

    def validate_email(self, value):
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("An account with this email already exists.")
        return value

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data["username"],
            email=validated_data["email"],
            password=validated_data["password"],
        )
        UserPreference.objects.create(user=user)
        return user


class UserPreferenceSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserPreference
        fields = ["preferred_style", "preferred_palette", "currency", "measurement_unit"]


class UserProfileSerializer(serializers.ModelSerializer):
    """Shape matches exactly what authService.js / AuthContext expect on `user`."""

    preferences = UserPreferenceSerializer(required=False)

    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "email",
            "avatar",
            "phone_number",
            "theme_preference",
            "date_joined",
            "preferences",
        ]
        read_only_fields = ["id", "email", "date_joined"]

    def update(self, instance, validated_data):
        preferences_data = validated_data.pop("preferences", None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        if preferences_data:
            UserPreference.objects.update_or_create(user=instance, defaults=preferences_data)
        return instance


class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True)

    def validate_new_password(self, value):
        password_validation.validate_password(value)
        return value
