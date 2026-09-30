import requests

from common.ai_errors import ProviderCallError

from .base import BaseLLMProvider


class OllamaProvider(BaseLLMProvider):
    """
    Local model via Ollama. Uses `base_url` (stored in `api_key` for a
    uniform constructor signature across all providers) instead of a
    real API key, since Ollama runs on the developer's own machine.
    """

    name = "ollama"

    def __init__(self, base_url: str = "", model: str = ""):
        super().__init__(api_key=base_url, model=model)

    @property
    def is_configured(self) -> bool:
        return bool(self.api_key)  # api_key holds the base_url here

    def _call_raw(self, prompt: str) -> str:
        try:
            response = requests.post(
                f"{self.api_key.rstrip('/')}/api/generate",
                json={"model": self.model, "prompt": prompt, "stream": False, "format": "json"},
                timeout=120,
            )
            response.raise_for_status()
            return response.json().get("response", "")
        except requests.RequestException as exc:
            raise ProviderCallError(f"Ollama request failed: {exc}") from exc
