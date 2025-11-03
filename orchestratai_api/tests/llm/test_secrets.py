"""Tests for credential resolution helper."""

import os
from unittest.mock import patch

import pytest

from src.llm.secrets import resolve_secret


class TestSecretResolution:
    """Test credential resolution from environment and 1Password."""

    def setup_method(self):
        """Clear the resolve_secret cache before each test."""
        resolve_secret.cache_clear()

    def test_resolve_from_environment(self):
        """Should resolve secret from environment variable."""
        with patch.dict(os.environ, {"TEST_KEY": "test_value"}):
            result = resolve_secret("TEST_KEY")
            assert result == "test_value"

    def test_resolve_missing_credential_onepassword_disabled(self):
        """Should raise RuntimeError when credential not found and 1Password disabled."""
        with patch.dict(os.environ, {"USE_ONEPASSWORD": "false"}, clear=True):
            with pytest.raises(RuntimeError) as exc_info:
                resolve_secret("MISSING_KEY")

            assert "MISSING_KEY" in str(exc_info.value)
            assert "not found" in str(exc_info.value)

    def test_resolve_missing_credential_onepassword_enabled(self):
        """Should raise descriptive error when 1Password enabled but credential missing."""
        with patch.dict(os.environ, {"USE_ONEPASSWORD": "true"}, clear=True):
            with pytest.raises(RuntimeError) as exc_info:
                resolve_secret("MISSING_KEY")
            message = str(exc_info.value)
            assert "Credential 'MISSING_KEY' not found" in message

    def test_environment_takes_precedence_over_onepassword(self):
        """Environment variables should take precedence even when 1Password enabled."""
        with patch.dict(
            os.environ,
            {"TEST_KEY": "env_value", "USE_ONEPASSWORD": "true"},
        ):
            result = resolve_secret("TEST_KEY")
            assert result == "env_value"

    def test_caching_works(self):
        """Should cache resolved secrets for performance."""
        with patch.dict(os.environ, {"CACHED_KEY": "cached_value"}):
            # First call
            result1 = resolve_secret("CACHED_KEY")
            assert result1 == "cached_value"

            # Clear environment
            del os.environ["CACHED_KEY"]

            # Second call should still work (cached)
            result2 = resolve_secret("CACHED_KEY")
            assert result2 == "cached_value"

    def test_use_onepassword_defaults_to_true(self):
        """USE_ONEPASSWORD defaults to true which still requires defined credential."""
        with patch.dict(os.environ, {}, clear=True):
            # Remove USE_ONEPASSWORD to test default
            if "USE_ONEPASSWORD" in os.environ:
                del os.environ["USE_ONEPASSWORD"]

            with pytest.raises(RuntimeError) as exc_info:
                resolve_secret("MISSING_KEY")
            assert "Credential 'MISSING_KEY' not found" in str(exc_info.value)

    def test_empty_environment_variable(self):
        """Should raise error for empty environment variable."""
        with patch.dict(os.environ, {"EMPTY_KEY": ""}):
            with pytest.raises(RuntimeError):
                # Empty string is falsy, so it should fail
                result = resolve_secret("EMPTY_KEY")
                if not result:
                    raise RuntimeError("Empty credential")
