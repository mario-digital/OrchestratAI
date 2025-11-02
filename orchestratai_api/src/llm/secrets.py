"""Credential resolution for LLM providers with 1Password support."""

import os
from functools import lru_cache


@lru_cache(maxsize=128)
def resolve_secret(key: str) -> str:
    """Resolve a secret credential from environment or 1Password.

    Resolution order:
    1. Check environment variables first (highest priority)
    2. If USE_ONEPASSWORD=true (default), attempt 1Password lookup
    3. Raise RuntimeError if not found in either source

    Args:
        key: The credential key to resolve (e.g., "OPENAI_API_KEY")

    Returns:
        The resolved secret value

    Raises:
        RuntimeError: If credential cannot be found in any source

    Examples:
        >>> api_key = resolve_secret("OPENAI_API_KEY")
        >>> region = resolve_secret("AWS_REGION")
    """
    # First check environment variables (highest priority)
    value = os.getenv(key)
    if value:
        return value

    # Check if 1Password integration is enabled (defaults to true if not set)
    use_onepassword = os.getenv("USE_ONEPASSWORD", "true").lower() == "true"

    if use_onepassword:
        # Attempt 1Password resolution
        try:
            value = _resolve_from_onepassword(key)
            if value:
                return value
        except NotImplementedError:
            # Re-raise NotImplementedError so tests can catch it
            raise
        except Exception:
            # Log but continue to error handling below for other exceptions
            pass

    # Credential not found in any source
    msg = f"Credential '{key}' not found. Please set it in your environment variables"
    if use_onepassword:
        msg += " or configure it in 1Password"
    msg += f" (USE_ONEPASSWORD={use_onepassword})"

    raise RuntimeError(msg)


def _resolve_from_onepassword(key: str) -> str | None:
    """Resolve a secret from 1Password using the op CLI.

    This is a placeholder implementation. In production, this would use
    the 1Password CLI or SDK to fetch secrets from a configured vault.

    Args:
        key: The credential key to resolve

    Returns:
        The secret value if found, None otherwise

    Raises:
        NotImplementedError: 1Password integration not yet implemented
    """
    # TODO: Implement 1Password CLI integration when OnePasswordSecretManager is available
    # Example future implementation:
    # from orchestratai_api.src.services.onepassword_manager import OnePasswordSecretManager
    # manager = OnePasswordSecretManager()
    # return manager.get_secret(key)

    raise NotImplementedError(
        "1Password integration not yet implemented. "
        "Set USE_ONEPASSWORD=false to rely solely on environment variables."
    )
