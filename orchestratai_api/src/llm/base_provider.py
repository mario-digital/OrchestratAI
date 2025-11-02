"""Base abstract class for LLM providers."""

from abc import ABC, abstractmethod
from collections.abc import AsyncGenerator
from typing import Any

from .types import LLMCallResult, StreamChunk


class BaseLLMProvider(ABC):
    """Abstract base class defining the contract for all LLM providers.

    All providers must implement complete, stream, and count_tokens methods.
    Each provider maintains a pricing dictionary for cost calculation.
    """

    pricing: dict[str, dict[str, float]]

    @abstractmethod
    async def complete(
        self,
        *,
        messages: list[dict[str, str]],
        **kwargs: Any,
    ) -> LLMCallResult:
        """Execute a complete (non-streaming) LLM call.

        Args:
            messages: List of message dicts with 'role' and 'content' keys
            **kwargs: Additional provider-specific parameters

        Returns:
            LLMCallResult with content, tokens, and cost information
        """
        ...

    @abstractmethod
    def stream(
        self,
        *,
        messages: list[dict[str, str]],
        **kwargs: Any,
    ) -> AsyncGenerator[StreamChunk, None]:
        """Execute a streaming LLM call.

        Args:
            messages: List of message dicts with 'role' and 'content' keys
            **kwargs: Additional provider-specific parameters

        Yields:
            StreamChunk instances with incremental content
        """
        ...

    @abstractmethod
    def count_tokens(
        self,
        *,
        messages: list[dict[str, str]],
    ) -> tuple[int, int]:
        """Count tokens for a message list.

        Args:
            messages: List of message dicts with 'role' and 'content' keys

        Returns:
            Tuple of (prompt_tokens, completion_tokens_estimate)
        """
        ...
