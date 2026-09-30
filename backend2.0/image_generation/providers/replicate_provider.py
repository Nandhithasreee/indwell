import time

import requests

from common.ai_errors import AIProviderError

from .base import BaseImageProvider

# Stable Diffusion 3.5 Large Turbo on Replicate
DEFAULT_MODEL_VERSION = "stability-ai/stable-diffusion-3.5-large-turbo"


class ReplicateProvider(BaseImageProvider):
    name = "replicate"

    def generate(self, prompt: str) -> str:
        headers = {"Authorization": f"Bearer {self.api_key}", "Content-Type": "application/json"}
        try:
            create_response = requests.post(
                f"https://api.replicate.com/v1/models/{DEFAULT_MODEL_VERSION}/predictions",
                headers=headers,
                json={"input": {"prompt": prompt}},
                timeout=30,
            )
            create_response.raise_for_status()
            prediction = create_response.json()

            # Poll for completion -- Replicate predictions are async.
            get_url = prediction["urls"]["get"]
            for _ in range(30):  # ~60s max
                time.sleep(2)
                poll_response = requests.get(get_url, headers=headers, timeout=15)
                poll_response.raise_for_status()
                result = poll_response.json()
                if result["status"] == "succeeded":
                    output = result["output"]
                    return output[0] if isinstance(output, list) else output
                if result["status"] == "failed":
                    raise AIProviderError(f"Replicate prediction failed: {result.get('error')}")

            raise AIProviderError("Replicate prediction timed out.")
        except requests.RequestException as exc:
            raise AIProviderError(f"Replicate request failed: {exc}") from exc
