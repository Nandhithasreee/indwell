import requests

from common.ai_errors import AIProviderError

from .base import BaseImageProvider


class FalProvider(BaseImageProvider):
    name = "fal"

    def generate(self, prompt: str) -> str:
        try:
            response = requests.post(
                "https://fal.run/fal-ai/flux/schnell",
                headers={"Authorization": f"Key {self.api_key}", "Content-Type": "application/json"},
                json={"prompt": prompt, "image_size": "square_hd"},
                timeout=60,
            )
            response.raise_for_status()
            data = response.json()
            return data["images"][0]["url"]
        except (requests.RequestException, KeyError, IndexError) as exc:
            raise AIProviderError(f"Fal.ai request failed: {exc}") from exc
