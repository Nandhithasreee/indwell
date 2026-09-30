from common.ai_errors import AIProviderError

from .base import BaseImageProvider


class OpenAIImageProvider(BaseImageProvider):
    name = "openai"

    def generate(self, prompt: str) -> str:
        try:
            from openai import OpenAI
        except ImportError as exc:
            raise AIProviderError("openai package is not installed.") from exc

        try:
            client = OpenAI(api_key=self.api_key)
            response = client.images.generate(
                model="dall-e-3", prompt=prompt, size="1024x1024", quality="standard", n=1
            )
            return response.data[0].url
        except Exception as exc:
            raise AIProviderError(f"OpenAI image request failed: {exc}") from exc
