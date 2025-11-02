"""Type definitions for LLM provider abstraction layer."""

from dataclasses import dataclass
from typing import Any


@dataclass(slots=True)
class LLMCallResult:
    """Result from a complete LLM call with token and cost tracking.

    Attributes:
        content: The generated text response
        model: Model identifier used for the call
        tokens_input: Number of tokens in the prompt
        tokens_output: Number of tokens in the completion
        cost: Calculated cost in dollars for this call
        raw: Original response object from the provider (optional)
        logprobs: Log probabilities if requested (optional)
    """

    content: str
    model: str
    tokens_input: int
    tokens_output: int
    cost: float
    raw: Any | None = None
    logprobs: Any | None = None


@dataclass(slots=True)
class StreamChunk:
    """Single chunk from a streaming LLM response.

    Attributes:
        content: Text content in this chunk
        tokens_output: Incremental token count for this chunk
        raw: Original chunk object from the provider (optional)
    """

    content: str
    tokens_output: int
    raw: Any | None = None
