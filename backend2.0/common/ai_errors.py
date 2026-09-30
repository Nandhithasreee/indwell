class AIProviderError(Exception):
    """
    Raised when a provider's response can't be used -- e.g. malformed JSON
    or a schema mismatch. This is worth retrying the *same* provider once
    with a corrective follow-up prompt, since it's often just a formatting
    slip rather than the provider being unavailable.
    """


class ProviderCallError(AIProviderError):
    """
    Raised when the underlying vendor API call itself fails: invalid key,
    network error, service outage, or -- most commonly -- a rate limit or
    daily quota being exceeded. There's nothing a corrective prompt can
    fix here, so the service layer skips straight to the next provider in
    the priority chain instead of wasting a retry on the same one.
    """


class AllProvidersFailedError(Exception):
    """Raised when every configured provider in the priority chain has failed."""

    def __init__(self, attempts):
        self.attempts = attempts  # list of (provider_name, error_message)
        summary = "; ".join(f"{name}: {err}" for name, err in attempts) or "no provider configured"
        super().__init__(f"All providers failed -- {summary}")
