"""AWS Bedrock LLM provider implementation for Anthropic Claude models."""

import json
from collections.abc import AsyncGenerator
from typing import Any

import boto3  # type: ignore[import-untyped]

from .base_provider import BaseLLMProvider
from .pricing import dollar_cost
from .secrets import resolve_secret
from .types import LLMCallResult, StreamChunk


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
        "anthropic.claude-3-5-sonnet-20241022-v2:0": {
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
            model: Bedrock model ID (e.g., "anthropic.claude-3-5-sonnet-20241022-v2:0")
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

        # Initialize boto3 bedrock-runtime client
        self._client = boto3.client(
            "bedrock-runtime",
            region_name=region,
            aws_access_key_id=access_key_id,
            aws_secret_access_key=secret_access_key,
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
        body = {
            "anthropic_version": "bedrock-2023-05-31",
            "messages": anthropic_messages,
            "temperature": self.temperature,
            "max_tokens": kwargs.get("max_tokens", 4096),
        }

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
        cost = dollar_cost(
            self.pricing[self.model],
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
        body = {
            "anthropic_version": "bedrock-2023-05-31",
            "messages": anthropic_messages,
            "temperature": self.temperature,
            "max_tokens": kwargs.get("max_tokens", 4096),
        }

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
        """Convert generic messages to Anthropic's format.

        Anthropic requires:
        1. System messages extracted into a separate 'system' field
        2. Messages alternate between 'user' and 'assistant'
        3. First message must be 'user' role

        Args:
            messages: List of dicts with 'role' and 'content' keys

        Returns:
            Tuple of (system_prompt, anthropic_messages)
        """
        system_prompt = None
        anthropic_messages = []

        for msg in messages:
            role = msg.get("role", "user")
            content = msg.get("content", "")

            if role == "system":
                # Extract system message
                if system_prompt:
                    system_prompt += f"\n\n{content}"
                else:
                    system_prompt = content
            else:
                # Map to Anthropic roles
                anthropic_role = "assistant" if role == "assistant" else "user"
                anthropic_messages.append(
                    {
                        "role": anthropic_role,
                        "content": content,
                    }
                )

        # Ensure first message is 'user' (Anthropic requirement)
        if anthropic_messages and anthropic_messages[0]["role"] != "user":
            # Prepend empty user message if needed
            anthropic_messages.insert(0, {"role": "user", "content": ""})

        return system_prompt, anthropic_messages

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
