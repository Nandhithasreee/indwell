import base64
import uuid

import requests
from django.conf import settings
from django.core.files.base import ContentFile
from django.core.files.storage import default_storage

from common.ai_errors import AIProviderError

from .base import BaseImageProvider


def _save_image_bytes(content: bytes, provider_name: str) -> str:
    """Saves raw image bytes to MEDIA_ROOT and returns a servable URL."""
    filename = f"generated/{provider_name}-{uuid.uuid4().hex}.jpg"
    path = default_storage.save(filename, ContentFile(content))
    return default_storage.url(path)


class StabilityProvider(BaseImageProvider):
    name = "stability"

    def generate(self, prompt: str) -> str:
        try:
            response = requests.post(
                "https://api.stability.ai/v2beta/stable-image/generate/core",
                headers={"authorization": f"Bearer {self.api_key}", "accept": "image/*"},
                files={"none": ""},
                data={"prompt": prompt, "output_format": "jpeg", "aspect_ratio": "16:9"},
                timeout=60,
            )
            response.raise_for_status()
            return _save_image_bytes(response.content, "stability")
        except requests.RequestException as exc:
            raise AIProviderError(f"Stability request failed: {exc}") from exc

