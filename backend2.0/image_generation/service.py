"""
generate_image(prompt) -> str | None

Entirely optional and non-blocking: if no image provider is configured, or
every configured one fails, this returns None rather than raising -- the
core 3D room generation flow must never be blocked by image generation.
"""
import logging

from django.conf import settings

from common.ai_errors import AIProviderError

from .providers.fal_provider import FalProvider
from .providers.flux_provider import FluxProvider
from .providers.openai_image_provider import OpenAIImageProvider
from .providers.pollinations_provider import PollinationsProvider
from .providers.replicate_provider import ReplicateProvider
from .providers.stability_provider import StabilityProvider

logger = logging.getLogger(__name__)


def _build_providers() -> dict:
    return {
        "openai": OpenAIImageProvider(api_key=settings.OPENAI_API_KEY),
        "pollinations": PollinationsProvider(),
        "stability": StabilityProvider(api_key=settings.STABILITY_API_KEY),
        "replicate": ReplicateProvider(api_key=settings.REPLICATE_API_KEY),
        "flux": FluxProvider(api_key=settings.REPLICATE_API_KEY),
        "fal": FalProvider(api_key=settings.FAL_API_KEY),
    }


def generate_image(prompt: str) -> tuple[str | None, str | None]:
    """Returns (image_url_or_None, provider_name_or_None). Never raises."""
    if not settings.IMAGE_GENERATION_ENABLED:
        return None, None

    providers = _build_providers()
    for provider_key in settings.IMAGE_PROVIDER_PRIORITY:
        provider = providers.get(provider_key.strip())
        if provider is None or not provider.is_configured:
            continue
        try:
            url = provider.generate(prompt)
            logger.info("Image generated successfully via %s.", provider.name)
            return url, provider.name
        except AIProviderError as exc:
            logger.warning("Image provider %s failed: %s", provider.name, exc)
            continue
        except Exception as exc:  # noqa: BLE001 - image generation must never break the core flow
            logger.exception("Image provider %s raised an unexpected error", provider.name)
            continue

    logger.info("No image provider succeeded (or none configured) -- continuing without an image.")
    return None, None
