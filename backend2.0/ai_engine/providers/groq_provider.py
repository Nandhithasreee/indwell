from common.ai_errors import ProviderCallError

from .base import BaseLLMProvider


class GroqProvider(BaseLLMProvider):
    """
    Groq hosts open models (Llama 3.x, etc.) behind an OpenAI-compatible
    API, so this reuses the `openai` SDK with a different base_url rather
    than needing a separate dependency. Groq's free tier is generous and
    very fast, which is why it's first in the default priority chain --
    see LLM_PROVIDER_PRIORITY in settings.
    """

    name = "groq"
    BASE_URL = "https://api.groq.com/openai/v1"

    def _call_raw(self, prompt: str) -> str:
        try:
            from openai import OpenAI
        except ImportError as exc:
            raise ProviderCallError("openai package is not installed (required for Groq's compatible API).") from exc

        try:
            client = OpenAI(api_key=self.api_key, base_url=self.BASE_URL)
            response = client.chat.completions.create(
                model=self.model,
                messages=[
                    {
                        "role": "system",
                        "content": "You are an expert interior designer and 3D scene planner. Always respond with raw JSON only.",
                    },
                    {"role": "user", "content": prompt},
                ],
                response_format={"type": "json_object"},
                temperature=0.9,
            )
            return response.choices[0].message.content
        except Exception as exc:
            raise ProviderCallError(f"Groq request failed: {exc}") from exc
