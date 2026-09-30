from urllib.parse import quote

from .base import BaseImageProvider


class PollinationsProvider(BaseImageProvider):
	"""Provides a hosted generated image without requiring an API key."""

	name = "pollinations"

	@property
	def is_configured(self) -> bool:
		return True

	def generate(self, prompt: str) -> str:
		panorama_prompt = (
			"Create a photorealistic equirectangular 360-degree interior panorama, "
			"with the room centered at eye level and no text or borders. "
			f"Interior brief: {prompt}"
		)
		return (
			"https://image.pollinations.ai/prompt/"
			f"{quote(panorama_prompt, safe='')}?width=2048&height=1024&nologo=true"
		)
