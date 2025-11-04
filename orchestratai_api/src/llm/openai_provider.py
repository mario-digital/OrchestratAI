"""OpenAI LLM provider implementation using LangChain."""

import logging
from collections.abc import AsyncGenerator
from typing import Any

import tiktoken
from langchain_core.messages import AIMessage, HumanMessage, SystemMessage
from langchain_openai import ChatOpenAI, OpenAIEmbeddings
from pydantic import SecretStr

from .base_provider import BaseLLMProvider
from .pricing import dollar_cost
from .secrets import resolve_secret
from .types import LLMCallResult, StreamChunk

logger = logging.getLogger(__name__)


class OpenAIProvider(BaseLLMProvider):
    """OpenAI provider for GPT models and embeddings.

    Supports:
    - GPT-4 Turbo (RAG worker)
    - GPT-4o (Hybrid worker)
    - text-embedding-3-large (embeddings)

    Pricing per 1M tokens (as of 2024):
    - gpt-4-turbo: $10 input / $30 output
    - gpt-4o: $5 input / $15 output
    - text-embedding-3-large: $0.13 input (no output tokens)
    """

    pricing = {
        "gpt-4-turbo": {"prompt": 0.01, "completion": 0.03},
        "gpt-4o": {"prompt": 0.005, "completion": 0.015},
        "text-embedding-3-large": {"prompt": 0.00013, "completion": 0.0},
    }

    def __init__(
        self,
        model: str,
        *,
        temperature: float = 0.1,
        timeout: int = 30,
    ):
        """Initialize OpenAI provider.

        Args:
            model: Model identifier (e.g., "gpt-4-turbo", "gpt-4o")
            temperature: Sampling temperature (0.0-2.0, default 0.1)
            timeout: Request timeout in seconds (default 30)

        Raises:
            RuntimeError: If OPENAI_API_KEY cannot be resolved
        """
        self.model = model
        self.temperature = temperature
        self.timeout = timeout

        # Resolve API key from environment or 1Password
        api_key = resolve_secret("OPENAI_API_KEY")

        # Initialize LangChain client
        self._client = ChatOpenAI(
            model=model,
            api_key=SecretStr(api_key),
            timeout=timeout,
            temperature=temperature,
        )

        # Initialize tiktoken encoder for accurate token counting
        try:
            self._encoder = tiktoken.encoding_for_model(model)
        except KeyError:
            # Fallback to cl100k_base for newer models
            self._encoder = tiktoken.get_encoding("cl100k_base")

        # Initialize embeddings client if this is an embeddings model
        self._embeddings: OpenAIEmbeddings | None
        if "embedding" in model:
            self._embeddings = OpenAIEmbeddings(
                model=model,
                api_key=SecretStr(api_key),
            )
        else:
            self._embeddings = None

    async def complete(
        self,
        *,
        messages: list[dict[str, str]],
        **kwargs: Any,
    ) -> LLMCallResult:
        """Execute a complete (non-streaming) OpenAI call.

        Args:
            messages: List of message dicts with 'role' and 'content' keys
            **kwargs: Additional parameters (max_tokens, etc.)

        Returns:
            LLMCallResult with content, tokens, and cost information
        """
        # Convert dict messages to LangChain message objects
        lc_messages = self._convert_to_langchain_messages(messages)

        # Execute the call
        response = await self._client.ainvoke(lc_messages, **kwargs)

        # Extract token usage from response
        usage = response.response_metadata.get("token_usage", {})
        tokens_input = usage.get("prompt_tokens", 0)
        tokens_output = usage.get("completion_tokens", 0)

        # Calculate cost
        pricing = self.pricing.get(self.model)
        if pricing is None:
            logger.warning(
                "Missing pricing information for OpenAI model %s; defaulting cost to 0",
                self.model,
            )
            cost = 0.0
        else:
            cost = dollar_cost(
                pricing,
                tokens_prompt=tokens_input,
                tokens_completion=tokens_output,
            )

        # Extract content (handle both string and list formats)
        content_str = (
            response.content if isinstance(response.content, str) else str(response.content)
        )

        return LLMCallResult(
            content=content_str,
            model=self.model,
            tokens_input=tokens_input,
            tokens_output=tokens_output,
            cost=cost,
            raw=response,
            logprobs=response.response_metadata.get("logprobs"),
        )

    async def stream(
        self,
        *,
        messages: list[dict[str, str]],
        **kwargs: Any,
    ) -> AsyncGenerator[StreamChunk, None]:
        """Execute a streaming OpenAI call.

        Args:
            messages: List of message dicts with 'role' and 'content' keys
            **kwargs: Additional parameters (max_tokens, etc.)

        Yields:
            StreamChunk instances with incremental content
        """
        # Convert dict messages to LangChain message objects
        lc_messages = self._convert_to_langchain_messages(messages)

        # Track cumulative tokens (OpenAI doesn't provide per-chunk counts)
        total_tokens = 0

        # Stream the response
        async for chunk in self._client.astream(lc_messages, **kwargs):
            # Handle both string and list content formats
            raw_content = chunk.content if hasattr(chunk, "content") else ""
            content = raw_content if isinstance(raw_content, str) else str(raw_content)

            # Estimate tokens for this chunk
            chunk_tokens = len(self._encoder.encode(content)) if content else 0
            total_tokens += chunk_tokens

            yield StreamChunk(
                content=content,
                tokens_output=chunk_tokens,
                raw=chunk,
            )

    def count_tokens(
        self,
        *,
        messages: list[dict[str, str]],
    ) -> tuple[int, int]:
        """Count tokens for a message list using tiktoken.

        Args:
            messages: List of message dicts with 'role' and 'content' keys

        Returns:
            Tuple of (prompt_tokens, 0) - completion tokens unknown until call
        """
        # Format messages according to OpenAI's token counting rules
        # See: https://github.com/openai/openai-cookbook/blob/main/examples/How_to_count_tokens_with_tiktoken.ipynb

        tokens_per_message = 3  # Every message follows <|start|>{role/name}\n{content}<|end|>\n
        tokens_per_name = 1  # If there's a name, the role is omitted

        num_tokens = 0
        for message in messages:
            num_tokens += tokens_per_message
            for key, value in message.items():
                num_tokens += len(self._encoder.encode(str(value)))
                if key == "name":
                    num_tokens += tokens_per_name

        num_tokens += 3  # Every reply is primed with <|start|>assistant<|message|>

        return (num_tokens, 0)  # Completion tokens unknown until generation

    async def embed(self, text: str) -> list[float]:
        """Generate embedding vector for text.

        Args:
            text: Text to embed

        Returns:
            Embedding vector as list of floats

        Raises:
            RuntimeError: If this provider is not configured for embeddings
        """
        if not self._embeddings:
            raise RuntimeError(
                f"Provider '{self.model}' is not configured for embeddings. "
                "Use a model like 'text-embedding-3-large'."
            )

        # Generate embedding using LangChain
        result = await self._embeddings.aembed_query(text)
        return result

    def _convert_to_langchain_messages(
        self,
        messages: list[dict[str, str]],
    ) -> list[SystemMessage | HumanMessage | AIMessage]:
        """Convert dict messages to LangChain message objects.

        Args:
            messages: List of dicts with 'role' and 'content' keys

        Returns:
            List of LangChain message objects
        """
        lc_messages: list[SystemMessage | HumanMessage | AIMessage] = []
        for msg in messages:
            role = msg.get("role", "user")
            content = msg.get("content", "")

            if role == "system":
                lc_messages.append(SystemMessage(content=content))
            elif role == "assistant":
                lc_messages.append(AIMessage(content=content))
            else:  # user or any other role defaults to HumanMessage
                lc_messages.append(HumanMessage(content=content))

        return lc_messages
