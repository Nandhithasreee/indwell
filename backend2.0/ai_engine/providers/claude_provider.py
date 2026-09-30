from common.ai_errors import ProviderCallError

from .base import BaseLLMProvider


class ClaudeProvider(BaseLLMProvider):
    name = "claude"

    def _call_raw(self, prompt: str) -> str:
        try:
            import anthropic
        except ImportError as exc:
            raise ProviderCallError("anthropic package is not installed.") from exc

        try:
            client = anthropic.Anthropic(api_key=self.api_key)
            response = client.messages.create(
                model=self.model,
                max_tokens=4000,
                temperature=0.9,
                messages=[{"role": "user", "content": prompt}],
            )
            return "".join(block.text for block in response.content if block.type == "text")
        except Exception as exc:
            raise ProviderCallError(f"Claude request failed: {exc}") from exc
