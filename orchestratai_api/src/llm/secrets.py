"""Credential resolution for LLM providers with 1Password support."""

import os
from functools import lru_cache
from pathlib import Path


@lru_cache(maxsize=128)
def resolve_secret(key: str) -> str:
    """Resolve a secret credential with auto-detection of 1Password references.

    Resolution order:
    1. Check system environment (Docker Compose injects resolved values here)
    2. Fall back to reading .env file directly (for local script execution)
    3. Auto-detect op:// references and resolve via 1Password CLI
    4. Otherwise return plain value as-is

    Args:
        key: The credential key to resolve (e.g., "OPENAI_API_KEY")

    Returns:
        The resolved secret value

    Raises:
        RuntimeError: If credential cannot be found or 1Password resolution fails

    Examples:
        >>> # With 1Password (in .env): OPENAI_API_KEY=op://Private/OrchestratAI/OPENAI_API_KEY
        >>> api_key = resolve_secret("OPENAI_API_KEY")  # Returns resolved value

        >>> # Without 1Password (in .env): OPENAI_API_KEY=sk-abc123...
        >>> api_key = resolve_secret("OPENAI_API_KEY")  # Returns plain value
    """
    # Priority 1: Check system environment (Docker Compose injects resolved values)
    value = os.getenv(key)

    # Priority 2: Read from .env file directly (local execution)
    if not value:
        value = _read_from_env_file(key)

    if not value:
        raise RuntimeError(
            f"Credential '{key}' not found in .env file. "
            f"Please add it to orchestratai_api/.env:\n"
            f"  - With 1Password: {key}=op://vault/item/field\n"
            f"  - Without 1Password: {key}=your-actual-key\n"
            f"Example: {key}=op://Private/OrchestratAI/{key}"
        )

    # Auto-detect 1Password reference (op://) and resolve it
    if value.startswith("op://"):
        return _resolve_from_onepassword_reference(value)

    # Plain value - return as-is
    return value


def _read_from_env_file(key: str) -> str | None:
    """Read a value directly from .env file without loading into os.environ.

    Args:
        key: The environment variable name to look up

    Returns:
        The value from .env file, or None if not found
    """
    # Find .env file (look in orchestratai_api directory)
    env_file = Path(__file__).parent.parent.parent / ".env"

    if not env_file.exists():
        return None

    # Parse .env file manually
    with open(env_file) as f:
        for line in f:
            line = line.strip()
            # Skip comments and empty lines
            if not line or line.startswith("#"):
                continue
            # Parse KEY=VALUE
            if "=" in line:
                env_key, env_value = line.split("=", 1)
                if env_key.strip() == key:
                    return env_value.strip()

    return None


def _resolve_from_onepassword_reference(op_reference: str) -> str:
    """Resolve an op:// reference using the 1Password CLI.

    Args:
        op_reference: The 1Password reference (e.g., "op://vault/item/field")

    Returns:
        The resolved secret value

    Raises:
        RuntimeError: If 'op' CLI is not installed, not authenticated, or resolution fails
    """
    import subprocess

    # Check if op CLI is installed
    try:
        result = subprocess.run(["which", "op"], capture_output=True, text=True, timeout=5)
        if result.returncode != 0:
            raise RuntimeError(
                "1Password CLI ('op') is not installed. "
                "Install it from: https://developer.1password.com/docs/cli/get-started/"
            )
    except FileNotFoundError as e:
        raise RuntimeError(
            "1Password CLI ('op') is not installed. "
            "Install it from: https://developer.1password.com/docs/cli/get-started/"
        ) from e

    # Use 'op read' to fetch the secret
    try:
        result = subprocess.run(
            ["op", "read", op_reference], capture_output=True, text=True, timeout=10
        )

        if result.returncode != 0:
            error_msg = result.stderr.strip()
            if "not currently signed in" in error_msg.lower():
                raise RuntimeError("Not signed in to 1Password. Run: op signin")
            elif "isn't a valid" in error_msg.lower() or "doesn't exist" in error_msg.lower():
                raise RuntimeError(
                    f"1Password reference '{op_reference}' is invalid or doesn't exist. "
                    f"Please check your vault/item/field path."
                )
            else:
                raise RuntimeError(f"1Password CLI error: {error_msg}")

        secret_value = result.stdout.strip()
        if not secret_value:
            raise RuntimeError(f"1Password returned empty value for reference: {op_reference}")

        return secret_value

    except subprocess.TimeoutExpired as e:
        raise RuntimeError(
            "1Password CLI timeout. The 'op' command took too long to respond."
        ) from e
    except Exception as e:
        raise RuntimeError(f"Failed to read from 1Password: {e}") from e
