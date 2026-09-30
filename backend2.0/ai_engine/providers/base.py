import json
from abc import ABC, abstractmethod

from common.ai_errors import AIProviderError


class BaseLLMProvider(ABC):
    """
    Every LLM provider must implement `generate(prompt) -> dict` returning
    a parsed JSON object with "presentation" and "scene" keys. Providers
    only handle "how to talk to this vendor's API" -- JSON parsing safety
    and schema validation are shared here / done by the caller (service.py).
    """

    name = "base"

    def __init__(self, api_key: str = "", model: str = ""):
        self.api_key = api_key
        self.model = model

    @property
    def is_configured(self) -> bool:
        return bool(self.api_key)

    @abstractmethod
    def _call_raw(self, prompt: str) -> str:
        """Calls the vendor API and returns the raw text response."""
        raise NotImplementedError

    def generate(self, prompt: str) -> dict:
        if not self.is_configured:
            raise AIProviderError(f"{self.name} is not configured (missing API key).")
        raw_text = self._call_raw(prompt)
        return self._extract_json(raw_text)

    @staticmethod
    def _extract_json(raw_text: str) -> dict:
        """Strips markdown fences some models add despite instructions not to."""
        text = raw_text.strip()
        if text.startswith("```"):
            text = text.split("```")[1]
            if text.startswith("json"):
                text = text[4:]
        try:
            return json.loads(text.strip())
        except json.JSONDecodeError as exc:
            raise AIProviderError(f"Could not parse JSON response: {exc}") from exc
