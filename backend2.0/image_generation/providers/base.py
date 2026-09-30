from abc import ABC, abstractmethod


class BaseImageProvider(ABC):
    """
    Every image provider implements `generate(prompt) -> str` returning a
    hosted image URL. Image generation is intentionally decoupled from the
    LLM layer -- the LLM only ever prepares text prompts; it never touches
    pixels, and this module never touches room JSON.
    """

    name = "base"

    def __init__(self, api_key: str = ""):
        self.api_key = api_key

    @property
    def is_configured(self) -> bool:
        return bool(self.api_key)

    @abstractmethod
    def generate(self, prompt: str) -> str:
        """Returns a hosted image URL."""
        raise NotImplementedError
