from common.ai_errors import ProviderCallError

from .base import BaseLLMProvider


class OpenAIProvider(BaseLLMProvider):
    name = "openai"

    def _call_raw(self, prompt: str) -> str:
        try:
            from openai import OpenAI
        except ImportError as exc:
            raise ProviderCallError("openai package is not installed.") from exc

        try:
            client = OpenAI(api_key=self.api_key)
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
            raise ProviderCallError(f"OpenAI request failed: {exc}") from exc
