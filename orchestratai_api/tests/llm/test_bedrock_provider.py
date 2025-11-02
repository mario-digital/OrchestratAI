"""Tests for AWS Bedrock LLM provider."""

import json
from io import BytesIO
from unittest.mock import Mock, patch

import pytest

from src.llm.bedrock_provider import BedrockProvider
from src.llm.types import LLMCallResult, StreamChunk


@pytest.fixture
def mock_env():
    """Mock environment with AWS credentials."""
    with patch.dict(
        "os.environ",
        {
            "AWS_REGION": "us-east-1",
            "AWS_ACCESS_KEY_ID": "AKIATEST",
            "AWS_SECRET_ACCESS_KEY": "test-secret-key",
        },
    ):
        yield


@pytest.fixture
def provider(mock_env):
    """Create Bedrock provider instance for testing."""
    with patch("src.llm.bedrock_provider.boto3.client") as mock_boto:
        mock_client = Mock()
        mock_boto.return_value = mock_client

        provider = BedrockProvider(
            model="anthropic.claude-3-haiku-20240307-v1:0",
            temperature=0.1,
        )
        provider._client = mock_client
        yield provider


class TestBedrockProviderInit:
    """Test Bedrock provider initialization."""

    def test_init_with_valid_credentials(self, mock_env):
        """Should initialize successfully with valid AWS credentials."""
        with patch("src.llm.bedrock_provider.boto3.client") as mock_boto:
            provider = BedrockProvider(
                model="anthropic.claude-3-haiku-20240307-v1:0"
            )
            assert provider.model == "anthropic.claude-3-haiku-20240307-v1:0"
            assert provider.temperature == 0.1

            # Verify boto3 client was created with credentials
            mock_boto.assert_called_once()
            call_kwargs = mock_boto.call_args[1]
            assert call_kwargs["region_name"] == "us-east-1"
            assert call_kwargs["aws_access_key_id"] == "AKIATEST"

    def test_init_custom_temperature(self, mock_env):
        """Should accept custom temperature."""
        with patch("src.llm.bedrock_provider.boto3.client"):
            provider = BedrockProvider(
                model="anthropic.claude-3-5-sonnet-20241022-v2:0",
                temperature=0.5,
            )
            assert provider.temperature == 0.5

    def test_init_missing_credentials(self):
        """Should raise RuntimeError when AWS credentials missing."""
        from src.llm.secrets import resolve_secret
        resolve_secret.cache_clear()  # Clear cache to ensure clean test

        with patch.dict("os.environ", {"USE_ONEPASSWORD": "false"}, clear=True):
            # Don't mock boto3 client so we can test credential resolution
            with pytest.raises(RuntimeError) as exc_info:
                BedrockProvider(model="anthropic.claude-3-haiku-20240307-v1:0")
            assert "AWS_REGION" in str(exc_info.value)


class TestBedrockProviderComplete:
    """Test complete (non-streaming) calls."""

    @pytest.mark.asyncio
    async def test_complete_success(self, provider):
        """Should return LLMCallResult with correct data."""
        # Mock Bedrock response
        response_body = {
            "content": [{"type": "text", "text": "Hello, how can I help?"}],
            "usage": {
                "input_tokens": 12,
                "output_tokens": 18,
            },
        }

        mock_response = {
            "body": BytesIO(json.dumps(response_body).encode()),
        }

        provider._client.invoke_model = Mock(return_value=mock_response)

        messages = [{"role": "user", "content": "Hi"}]
        result = await provider.complete(messages=messages)

        assert isinstance(result, LLMCallResult)
        assert result.content == "Hello, how can I help?"
        assert result.model == "anthropic.claude-3-haiku-20240307-v1:0"
        assert result.tokens_input == 12
        assert result.tokens_output == 18
        assert result.cost > 0

    @pytest.mark.asyncio
    async def test_complete_with_system_message(self, provider):
        """Should extract system message correctly."""
        response_body = {
            "content": [{"type": "text", "text": "Response"}],
            "usage": {"input_tokens": 20, "output_tokens": 10},
        }

        provider._client.invoke_model = Mock(
            return_value={"body": BytesIO(json.dumps(response_body).encode())}
        )

        messages = [
            {"role": "system", "content": "You are helpful"},
            {"role": "user", "content": "Hello"},
        ]
        await provider.complete(messages=messages)

        # Verify system message was passed in request body
        call_args = provider._client.invoke_model.call_args
        body = json.loads(call_args[1]["body"])
        assert body["system"] == "You are helpful"

    @pytest.mark.asyncio
    async def test_complete_cost_calculation(self, provider):
        """Should calculate cost accurately for Haiku."""
        response_body = {
            "content": [{"type": "text", "text": "Test"}],
            "usage": {
                "input_tokens": 10000,
                "output_tokens": 5000,
            },
        }

        provider._client.invoke_model = Mock(
            return_value={"body": BytesIO(json.dumps(response_body).encode())}
        )

        messages = [{"role": "user", "content": "Test"}]
        result = await provider.complete(messages=messages)

        # Haiku: $0.00025 per 1K prompt, $0.00125 per 1K completion
        expected_cost = (10000 / 1000 * 0.00025) + (5000 / 1000 * 0.00125)
        assert result.cost == pytest.approx(expected_cost)

    @pytest.mark.asyncio
    async def test_complete_multiple_content_blocks(self, provider):
        """Should concatenate multiple content blocks."""
        response_body = {
            "content": [
                {"type": "text", "text": "Hello "},
                {"type": "text", "text": "world!"},
            ],
            "usage": {"input_tokens": 5, "output_tokens": 8},
        }

        provider._client.invoke_model = Mock(
            return_value={"body": BytesIO(json.dumps(response_body).encode())}
        )

        messages = [{"role": "user", "content": "Hi"}]
        result = await provider.complete(messages=messages)

        assert result.content == "Hello world!"


class TestBedrockProviderStream:
    """Test streaming calls."""

    @pytest.mark.asyncio
    async def test_stream_yields_chunks(self, provider):
        """Should yield StreamChunk instances."""
        # Mock streaming response
        stream_events = [
            {
                "chunk": {
                    "bytes": json.dumps({
                        "type": "content_block_delta",
                        "delta": {"type": "text_delta", "text": "Hello"},
                    }).encode()
                }
            },
            {
                "chunk": {
                    "bytes": json.dumps({
                        "type": "content_block_delta",
                        "delta": {"type": "text_delta", "text": " world"},
                    }).encode()
                }
            },
            {
                "chunk": {
                    "bytes": json.dumps({
                        "type": "message_delta",
                        "usage": {"output_tokens": 15},
                    }).encode()
                }
            },
        ]

        mock_response = {"body": iter(stream_events)}
        provider._client.invoke_model_with_response_stream = Mock(
            return_value=mock_response
        )

        messages = [{"role": "user", "content": "Hi"}]
        chunks = []
        async for chunk in provider.stream(messages=messages):
            chunks.append(chunk)

        assert len(chunks) == 2  # Only text deltas
        assert all(isinstance(c, StreamChunk) for c in chunks)
        assert chunks[0].content == "Hello"
        assert chunks[1].content == " world"

    @pytest.mark.asyncio
    async def test_stream_token_estimation(self, provider):
        """Should estimate tokens per chunk."""
        stream_events = [
            {
                "chunk": {
                    "bytes": json.dumps({
                        "type": "content_block_delta",
                        "delta": {"type": "text_delta", "text": "Test content here"},
                    }).encode()
                }
            }
        ]

        mock_response = {"body": iter(stream_events)}
        provider._client.invoke_model_with_response_stream = Mock(
            return_value=mock_response
        )

        messages = [{"role": "user", "content": "Hi"}]
        chunks = []
        async for chunk in provider.stream(messages=messages):
            chunks.append(chunk)

        # "Test content here" = 17 chars, ~4 tokens
        assert chunks[0].tokens_output > 0


class TestBedrockProviderTokenCounting:
    """Test token counting functionality."""

    def test_count_tokens_approximate(self, provider):
        """Should approximate token count (1 token ≈ 4 chars)."""
        messages = [{"role": "user", "content": "Hello world"}]
        prompt_tokens, completion_tokens = provider.count_tokens(messages=messages)

        # "Hello world" = 11 chars + overhead ≈ 5+ tokens
        assert prompt_tokens > 0
        assert completion_tokens == 0

    def test_count_tokens_multiple_messages(self, provider):
        """Should count tokens for all messages."""
        messages = [
            {"role": "system", "content": "You are helpful"},
            {"role": "user", "content": "Hi"},
            {"role": "assistant", "content": "Hello!"},
        ]
        prompt_tokens, _ = provider.count_tokens(messages=messages)

        assert prompt_tokens > 0


class TestBedrockMessageConversion:
    """Test message format conversion to Anthropic format."""

    def test_convert_system_message(self, provider):
        """Should extract system message to separate field."""
        messages = [
            {"role": "system", "content": "Be helpful"},
            {"role": "user", "content": "Hello"},
        ]
        system, anthropic_msgs = provider._convert_to_anthropic_format(messages)

        assert system == "Be helpful"
        assert len(anthropic_msgs) == 1
        assert anthropic_msgs[0]["role"] == "user"

    def test_convert_multiple_system_messages(self, provider):
        """Should concatenate multiple system messages."""
        messages = [
            {"role": "system", "content": "First instruction"},
            {"role": "system", "content": "Second instruction"},
            {"role": "user", "content": "Hello"},
        ]
        system, anthropic_msgs = provider._convert_to_anthropic_format(messages)

        assert system == "First instruction\n\nSecond instruction"

    def test_convert_ensures_user_first(self, provider):
        """Should ensure first message is user role."""
        messages = [{"role": "assistant", "content": "Hello"}]
        system, anthropic_msgs = provider._convert_to_anthropic_format(messages)

        assert len(anthropic_msgs) == 2
        assert anthropic_msgs[0]["role"] == "user"
        assert anthropic_msgs[0]["content"] == ""
        assert anthropic_msgs[1]["role"] == "assistant"

    def test_convert_user_and_assistant(self, provider):
        """Should preserve user and assistant roles."""
        messages = [
            {"role": "user", "content": "Hi"},
            {"role": "assistant", "content": "Hello"},
            {"role": "user", "content": "How are you?"},
        ]
        system, anthropic_msgs = provider._convert_to_anthropic_format(messages)

        assert system is None
        assert len(anthropic_msgs) == 3
        assert anthropic_msgs[0]["role"] == "user"
        assert anthropic_msgs[1]["role"] == "assistant"
        assert anthropic_msgs[2]["role"] == "user"


class TestBedrockContentExtraction:
    """Test content extraction from Anthropic responses."""

    def test_extract_single_text_block(self, provider):
        """Should extract single text block."""
        response_body = {
            "content": [{"type": "text", "text": "Hello"}]
        }
        content = provider._extract_content(response_body)
        assert content == "Hello"

    def test_extract_multiple_text_blocks(self, provider):
        """Should concatenate multiple text blocks."""
        response_body = {
            "content": [
                {"type": "text", "text": "Hello "},
                {"type": "text", "text": "world"},
                {"type": "text", "text": "!"},
            ]
        }
        content = provider._extract_content(response_body)
        assert content == "Hello world!"

    def test_extract_empty_content(self, provider):
        """Should handle empty content list."""
        response_body = {"content": []}
        content = provider._extract_content(response_body)
        assert content == ""

    def test_extract_ignores_non_text(self, provider):
        """Should ignore non-text content blocks."""
        response_body = {
            "content": [
                {"type": "text", "text": "Hello"},
                {"type": "image", "data": "base64..."},
                {"type": "text", "text": " world"},
            ]
        }
        content = provider._extract_content(response_body)
        assert content == "Hello world"
