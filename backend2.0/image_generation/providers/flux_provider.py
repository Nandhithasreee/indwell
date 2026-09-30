import time

import requests

from common.ai_errors import AIProviderError

from .base import BaseImageProvider

FLUX_MODEL = "black-forest-labs/flux-schnell"


class FluxProvider(BaseImageProvider):
    """
    FLUX, listed explicitly in the spec's image provider list, run via
    Replicate (reuses REPLICATE_API_KEY -- same account, different model
    from ReplicateProvider's default). Kept as its own named provider so
    it can be prioritized independently in IMAGE_PROVIDER_PRIORITY.
    """

    name = "flux"

    def generate(self, prompt: str) -> str:
        headers = {"Authorization": f"Bearer {self.api_key}", "Content-Type": "application/json"}
        try:
            create_response = requests.post(
                f"https://api.replicate.com/v1/models/{FLUX_MODEL}/predictions",
                headers=headers,
                json={"input": {"prompt": prompt}},
                timeout=30,
            )
            create_response.raise_for_status()
            prediction = create_response.json()

            get_url = prediction["urls"]["get"]
            for _ in range(20):  # ~40s max -- flux-schnell is fast
                time.sleep(2)
                poll_response = requests.get(get_url, headers=headers, timeout=15)
                poll_response.raise_for_status()
                result = poll_response.json()
                if result["status"] == "succeeded":
                    output = result["output"]
                    return output[0] if isinstance(output, list) else output
                if result["status"] == "failed":
                    raise AIProviderError(f"FLUX prediction failed: {result.get('error')}")

            raise AIProviderError("FLUX prediction timed out.")
        except requests.RequestException as exc:
            raise AIProviderError(f"FLUX request failed: {exc}") from exc
