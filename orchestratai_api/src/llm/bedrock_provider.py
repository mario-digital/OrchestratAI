"""AWS Bedrock LLM provider implementation for Anthropic Claude models."""

import json
import logging
import os
from collections.abc import AsyncGenerator
from typing import Any

import boto3  # type: ignore[import-untyped]

from .base_provider import BaseLLMProvider
from .pricing import dollar_cost
from .secrets import resolve_secret
from .types import LLMCallResult, StreamChunk

logger = logging.getLogger(__name__)


class BedrockProvider(BaseLLMProvider):
    """AWS Bedrock provider for Anthropic Claude models.

    Supports:
    - Claude 3.5 Sonnet (orchestrator analysis mode)
    - Claude 3 Haiku (orchestrator guide, CAG, direct workers)

    Pricing per 1M tokens (as of 2024):
    - claude-3-5-sonnet: $3 input / $15 output
    - claude-3-haiku: $0.25 input / $1.25 output
    """

    pricing = {
        "us.amazon.nova-micro-v1:0": {
            "prompt": 0.003,
            "completion": 0.015,
        },
        "anthropic.claude-3-haiku-20240307-v1:0": {
            "prompt": 0.00025,
            "completion": 0.00125,
        },
    }

    def __init__(
        self,
        model: str,
        *,
        temperature: float = 0.1,
    ):
        """Initialize AWS Bedrock provider.

        Args:
            model: Bedrock model ID (e.g., "us.amazon.nova-micro-v1:0")
            temperature: Sampling temperature (0.0-1.0, default 0.1)

        Raises:
            RuntimeError: If AWS credentials cannot be resolved
        """
        self.model = model
        self.temperature = temperature

        # Resolve AWS credentials from environment or 1Password
        region = resolve_secret("AWS_REGION")
        access_key_id = resolve_secret("AWS_ACCESS_KEY_ID")
        secret_access_key = resolve_secret("AWS_SECRET_ACCESS_KEY")
        session_token = os.getenv("AWS_SESSION_TOKEN")
        if not session_token:
            try:
                session_token = resolve_secret("AWS_SESSION_TOKEN")
            except RuntimeError:
                session_token = None

        # Initialize boto3 bedrock-runtime client
        self._client = boto3.client(
            "bedrock-runtime",
            region_name=region,
            aws_access_key_id=access_key_id,
            aws_secret_access_key=secret_access_key,
            aws_session_token=session_token,
        )

    async def complete(
        self,
        *,
        messages: list[dict[str, str]],
        **kwargs: Any,
    ) -> LLMCallResult:
        """Execute a complete (non-streaming) Bedrock call.

        Args:
            messages: List of message dicts with 'role' and 'content' keys
            **kwargs: Additional parameters (max_tokens, etc.)

        Returns:
            LLMCallResult with content, tokens, and cost information
        """
        # Convert messages to Anthropic format and extract system prompt
        system_prompt, anthropic_messages = self._convert_to_anthropic_format(messages)

        # Prepare request body
        body: dict[str, Any] = {"messages": anthropic_messages}

        if self.model.startswith("anthropic.") or "anthropic." in self.model:
            body["anthropic_version"] = "bedrock-2023-05-31"
            body["temperature"] = self.temperature

        if "max_tokens" in kwargs:
            body["max_tokens"] = kwargs["max_tokens"]

        if system_prompt:
            body["system"] = system_prompt

        # Execute the call
        response = self._client.invoke_model(
            modelId=self.model,
            body=json.dumps(body),
        )

        # Parse response
        response_body = json.loads(response["body"].read())

        # Extract content and usage
        content = self._extract_content(response_body)
        usage = response_body.get("usage", {})
        tokens_input = usage.get("input_tokens", 0)
        tokens_output = usage.get("output_tokens", 0)

        # Calculate cost
        pricing = self.pricing.get(self.model)
        if pricing is None:
            logger.warning(
                "Missing pricing information for Bedrock model %s; defaulting cost to 0",
                self.model,
            )
            cost = 0.0
        else:
            cost = dollar_cost(
                pricing,
                tokens_prompt=tokens_input,
                tokens_completion=tokens_output,
            )

        return LLMCallResult(
            content=content,
            model=self.model,
            tokens_input=tokens_input,
            tokens_output=tokens_output,
            cost=cost,
            raw=response_body,
            logprobs=None,  # Bedrock doesn't provide logprobs
        )

    async def stream(
        self,
        *,
        messages: list[dict[str, str]],
        **kwargs: Any,
    ) -> AsyncGenerator[StreamChunk, None]:
        """Execute a streaming Bedrock call.

        Args:
            messages: List of message dicts with 'role' and 'content' keys
            **kwargs: Additional parameters (max_tokens, etc.)

        Yields:
            StreamChunk instances with incremental content
        """
        # Convert messages to Anthropic format and extract system prompt
        system_prompt, anthropic_messages = self._convert_to_anthropic_format(messages)

        # Prepare request body
        body: dict[str, Any] = {"messages": anthropic_messages}

        if self.model.startswith("anthropic.") or "anthropic." in self.model:
            body["anthropic_version"] = "bedrock-2023-05-31"
            body["temperature"] = self.temperature

        if "max_tokens" in kwargs:
            body["max_tokens"] = kwargs["max_tokens"]

        if system_prompt:
            body["system"] = system_prompt

        # Execute streaming call
        response = self._client.invoke_model_with_response_stream(
            modelId=self.model,
            body=json.dumps(body),
        )

        # Process stream
        cumulative_tokens = 0
        for event in response["body"]:
            chunk_data = json.loads(event["chunk"]["bytes"])

            # Handle different event types
            if chunk_data.get("type") == "content_block_delta":
                delta = chunk_data.get("delta", {})
                if delta.get("type") == "text_delta":
                    content = delta.get("text", "")

                    # Estimate tokens (Bedrock doesn't provide per-chunk counts)
                    # Rough approximation: 1 token ≈ 4 characters
                    chunk_tokens = max(1, len(content) // 4)
                    cumulative_tokens += chunk_tokens

                    yield StreamChunk(
                        content=content,
                        tokens_output=chunk_tokens,
                        raw=chunk_data,
                    )

            elif chunk_data.get("type") == "message_delta":
                # Final usage statistics
                usage = chunk_data.get("usage", {})
                if usage:
                    # Update final token count if available
                    cumulative_tokens = usage.get("output_tokens", cumulative_tokens)

    def count_tokens(
        self,
        *,
        messages: list[dict[str, str]],
    ) -> tuple[int, int]:
        """Count tokens for a message list (approximate for Bedrock).

        Bedrock doesn't provide a dedicated token counting API. This uses
        Claude's approximation: 1 token ≈ 4 characters.

        Args:
            messages: List of message dicts with 'role' and 'content' keys

        Returns:
            Tuple of (prompt_tokens_estimate, 0) - completion unknown until call
        """
        total_chars = 0

        for message in messages:
            # Count role field (adds overhead)
            total_chars += len(message.get("role", ""))
            # Count content
            total_chars += len(message.get("content", ""))
            # Add formatting overhead (approximate)
            total_chars += 10  # JSON formatting, separators, etc.

        # Approximate: 1 token ≈ 4 characters
        estimated_tokens = max(1, total_chars // 4)

        return (estimated_tokens, 0)  # Completion tokens unknown until generation

    def _convert_to_anthropic_format(
        self,
        messages: list[dict[str, str]],
    ) -> tuple[str | None, list[dict[str, Any]]]:
        """Convert generic messages to the format expected by the target model."""

        system_prompt: str | None = None
        formatted_messages: list[dict[str, Any]] = []

        for msg in messages:
            role = msg.get("role", "user")
            content = msg.get("content", "")

            if role == "system":
                system_prompt = f"{system_prompt}\n\n{content}" if system_prompt else content
                continue

            if self.model.startswith("anthropic.") or "anthropic." in self.model:
                anthropic_role = "assistant" if role == "assistant" else "user"
                formatted_messages.append({"role": anthropic_role, "content": content})
            else:
                formatted_messages.append(
                    {
                        "role": "assistant" if role == "assistant" else "user",
                        "content": [{"text": content}]
                        if self.model.startswith("us.amazon")
                        else content,
                    }
                )

        if (
            formatted_messages
            and (self.model.startswith("anthropic.") or "anthropic." in self.model)
            and formatted_messages[0]["role"] != "user"
        ):
            formatted_messages.insert(0, {"role": "user", "content": ""})

        return system_prompt, formatted_messages

    def _extract_content(self, response_body: dict[str, Any]) -> str:
        """Extract text content from Anthropic response.

        Args:
            response_body: Parsed JSON response from Bedrock

        Returns:
            Concatenated text content from all content blocks
        """
        content_blocks = response_body.get("content", [])
        text_parts = []

        for block in content_blocks:
            if block.get("type") == "text":
                text_parts.append(block.get("text", ""))

        return "".join(text_parts)
