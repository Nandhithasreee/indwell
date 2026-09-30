"""
The single entry point the rest of the app calls: generate_room_design(prompt).
It never depends on one vendor -- it walks the configured provider priority
list, tries each one, and falls back to the next on failure. Every provider
returns the same validated JSON shape regardless of which one actually ran.
"""
import logging

from django.conf import settings
from jsonschema import ValidationError, validate

from common.ai_errors import AIProviderError, AllProvidersFailedError, ProviderCallError

from .providers.claude_provider import ClaudeProvider
from .providers.gemini_provider import GeminiProvider
from .providers.groq_provider import GroqProvider
from .providers.ollama_provider import OllamaProvider
from .providers.openai_provider import OpenAIProvider
from .schema import PRESENTATION_REQUIRED_KEYS, ROOM_SCHEMA

logger = logging.getLogger(__name__)


def _build_providers() -> dict:
    return {
        "groq": GroqProvider(api_key=settings.GROQ_API_KEY, model=settings.GROQ_MODEL),
        "gemini": GeminiProvider(api_key=settings.GEMINI_API_KEY, model=settings.GEMINI_MODEL),
        "openai": OpenAIProvider(api_key=settings.OPENAI_API_KEY, model=settings.OPENAI_MODEL),
        "claude": ClaudeProvider(api_key=settings.CLAUDE_API_KEY, model=settings.CLAUDE_MODEL),
        "ollama": OllamaProvider(base_url=settings.OLLAMA_BASE_URL, model=settings.OLLAMA_MODEL),
    }


def _validate(parsed: dict) -> dict:
    if "presentation" not in parsed or "scene" not in parsed:
        raise AIProviderError("Response missing 'presentation' or 'scene' key.")
    if not PRESENTATION_REQUIRED_KEYS.issubset(parsed["presentation"].keys()):
        missing = PRESENTATION_REQUIRED_KEYS - parsed["presentation"].keys()
        raise AIProviderError(f"Presentation missing keys: {missing}")
    validate(instance=parsed["scene"], schema=ROOM_SCHEMA)
    return parsed


def generate_room_design(prompt: str, max_attempts_per_provider: int = 2) -> tuple[dict, str]:
    """
    Returns (validated_json, provider_name_used).

    Tries providers in settings.LLM_PROVIDER_PRIORITY order. Two different
    failure modes are handled differently:
      - ProviderCallError (rate limit, quota exceeded, auth failure, network
        error, service outage): there's nothing a retry can fix, so this
        skips straight to the NEXT provider in the chain -- e.g. if Groq's
        free daily tokens run out, it moves on to Gemini immediately rather
        than wasting time retrying Groq.
      - Malformed JSON / schema validation failure: often just a formatting
        slip, so this retries the SAME provider once more with a corrective
        follow-up prompt before giving up on it.
    """
    providers = _build_providers()
    attempts = []

    for provider_key in settings.LLM_PROVIDER_PRIORITY:
        provider = providers.get(provider_key.strip())
        if provider is None or not provider.is_configured:
            continue

        current_prompt = prompt
        for attempt in range(1, max_attempts_per_provider + 1):
            try:
                parsed = provider.generate(current_prompt)
                validated = _validate(parsed)
                logger.info("Design generated successfully via %s (attempt %s).", provider.name, attempt)
                return validated, provider.name

            except ProviderCallError as exc:
                # Rate limit / quota / auth / network -- move on immediately,
                # no point retrying the same provider.
                logger.warning("%s is unavailable (likely rate limit/quota/auth) -- moving to next provider: %s", provider.name, exc)
                attempts.append((provider.name, str(exc)))
                break

            except (AIProviderError, ValidationError) as exc:
                logger.warning("%s attempt %s/%s failed: %s", provider.name, attempt, max_attempts_per_provider, exc)
                attempts.append((provider.name, str(exc)))
                current_prompt = prompt + (
                    "\n\nYour previous response was invalid JSON or did not match the required "
                    "schema exactly. Re-read the instructions and return ONLY a single valid raw "
                    "JSON object with keys 'presentation' and 'scene'."
                )

            except Exception as exc:  # noqa: BLE001 - any unexpected provider/SDK failure must not break fallback
                logger.exception("%s attempt %s/%s raised an unexpected error", provider.name, attempt, max_attempts_per_provider)
                attempts.append((provider.name, f"unexpected error: {exc}"))
                break  # don't retry this provider again for a non-JSON-shaped failure; move to the next one

    raise AllProvidersFailedError(attempts)
