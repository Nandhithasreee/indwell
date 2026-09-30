from decimal import Decimal

from rest_framework import serializers

from .models import ActivityLog, Design, GenerationJob


class DesignListSerializer(serializers.ModelSerializer):
    """Lightweight shape for grid/list views (Dashboard, Saved Designs)."""

    class Meta:
        model = Design
        fields = [
            "id",
            "room_type",
            "interior_style",
            "length_ft",
            "width_ft",
            "budget",
            "is_saved",
            "image_url",
            "created_at",
        ]


class DesignDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = Design
        fields = [
            "id",
            "room_type",
            "length_ft",
            "width_ft",
            "interior_style",
            "color_palette",
            "user_prompt",
            "enhanced_prompt",
            "summary",
            "room_json",
            "image_url",
            "llm_provider_used",
            "image_provider_used",
            "is_saved",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "enhanced_prompt",
            "summary",
            "room_json",
            "image_url",
            "created_at",
            "updated_at",
        ]


class GenerateDesignInputSerializer(serializers.Serializer):
    """
    Validates the Generate Design form -- matches GenerateDesign.jsx's
    current fields exactly: room_type, length_ft, width_ft, interior_style,
    color_palette, and a free-text `prompt` describing the room. There is
    no budget field anymore; the LLM estimates one itself.
    """

    room_type = serializers.CharField(max_length=100)
    length_ft = serializers.DecimalField(max_digits=6, decimal_places=2, min_value=Decimal("1"))
    width_ft = serializers.DecimalField(max_digits=6, decimal_places=2, min_value=Decimal("1"))
    interior_style = serializers.CharField(max_length=100)
    color_palette = serializers.CharField(max_length=255, required=False, allow_blank=True)
    prompt = serializers.CharField(required=False, allow_blank=True)


class ActivityLogSerializer(serializers.ModelSerializer):
    design_room_type = serializers.CharField(source="design.room_type", default=None, read_only=True)

    class Meta:
        model = ActivityLog
        fields = ["id", "action", "design", "design_room_type", "created_at"]


class GenerationJobSerializer(serializers.ModelSerializer):
    class Meta:
        model = GenerationJob
        fields = ["id", "status", "design", "error_message", "created_at", "updated_at"]
