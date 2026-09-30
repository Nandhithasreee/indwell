import requests

from common.ai_errors import ProviderCallError

from .base import BaseLLMProvider


class GeminiProvider(BaseLLMProvider):
    name = "gemini"
    BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models"

    def _call_raw(self, prompt: str) -> str:
        try:
            url = f"{self.BASE_URL}/{self.model}:generateContent?key={self.api_key}"
            payload = {
                "contents": [
                    {
                        "parts": [
                            {"text": prompt}
                        ]
                    }
                ],
                "generationConfig": {
                    "responseMimeType": "application/json",
                    "temperature": 0.9,
                },
            }
            response = requests.post(url, json=payload, timeout=60)
            if response.status_code != 200:
                error_msg = response.text
                try:
                    err_json = response.json()
                    error_msg = err_json.get("error", {}).get("message", error_msg)
                except Exception:
                    pass
                raise ProviderCallError(f"Gemini request failed (status {response.status_code}): {error_msg}")

            data = response.json()
            candidates = data.get("candidates", [])
            if not candidates:
                raise ProviderCallError("Gemini returned an empty candidates list.")
            parts = candidates[0].get("content", {}).get("parts", [])
            if not parts:
                raise ProviderCallError("Gemini returned empty parts.")
            return parts[0].get("text", "")
        except ProviderCallError:
            raise
        except requests.RequestException as exc:
            raise ProviderCallError(f"Gemini network request failed: {exc}") from exc
        except Exception as exc:
            raise ProviderCallError(f"Gemini request failed: {exc}") from exc
