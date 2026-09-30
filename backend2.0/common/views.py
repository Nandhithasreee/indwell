from django.conf import settings
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response


@api_view(["GET"])
@permission_classes([AllowAny])
def health_check(request):
    """GET /api/health/ -- reports which AI/image providers are actually configured."""
    llm_configured = {
        "groq": bool(settings.GROQ_API_KEY),
        "gemini": bool(settings.GEMINI_API_KEY),
        "openai": bool(settings.OPENAI_API_KEY),
        "claude": bool(settings.CLAUDE_API_KEY),
        "ollama": bool(settings.OLLAMA_BASE_URL),
    }
    image_configured = {
        "flux": bool(settings.REPLICATE_API_KEY),
        "openai": bool(settings.OPENAI_API_KEY),
        "stability": bool(settings.STABILITY_API_KEY),
        "replicate": bool(settings.REPLICATE_API_KEY),
        "fal": bool(settings.FAL_API_KEY),
    }
    return Response(
        {
            "success": True,
            "status": "ok",
            "database": settings.DATABASES["default"]["ENGINE"].split(".")[-1],
            "llm_providers_configured": llm_configured,
            "image_providers_configured": image_configured,
            "image_generation_enabled": settings.IMAGE_GENERATION_ENABLED,
        }
    )
