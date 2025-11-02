"""Tests for OpenAI LLM provider."""

from unittest.mock import AsyncMock, Mock, patch

import pytest
from langchain_core.messages import AIMessage

from src.llm.openai_provider import OpenAIProvider
from src.llm.types import LLMCallResult, StreamChunk


@pytest.fixture
def mock_env():
    """Mock environment with OpenAI API key."""
    with patch.dict("os.environ", {"OPENAI_API_KEY": "sk-test-key"}):
        yield


@pytest.fixture
def provider(mock_env):
    """Create OpenAI provider instance for testing."""
    with patch("src.llm.openai_provider.tiktoken.encoding_for_model") as mock_tiktoken:
        with patch("src.llm.openai_provider.ChatOpenAI") as mock_chat_openai:
            mock_encoder = Mock()
            mock_encoder.encode = Mock(return_value=[1, 2, 3, 4])  # 4 tokens
            mock_tiktoken.return_value = mock_encoder

            # Create a mock client
            mock_client = Mock()
            mock_chat_openai.return_value = mock_client

            provider = OpenAIProvider(model="gpt-4-turbo", temperature=0.1)
            provider._encoder = mock_encoder
            yield provider


class TestOpenAIProviderInit:
    """Test OpenAI provider initialization."""

    def test_init_with_valid_credentials(self, mock_env):
        """Should initialize successfully with valid API key."""
        with patch("src.llm.openai_provider.tiktoken.encoding_for_model"):
            provider = OpenAIProvider(model="gpt-4-turbo")
            assert provider.model == "gpt-4-turbo"
            assert provider.temperature == 0.1

    def test_init_custom_parameters(self, mock_env):
        """Should accept custom temperature and timeout."""
        with patch("src.llm.openai_provider.tiktoken.encoding_for_model"):
            provider = OpenAIProvider(
                model="gpt-4o",
                temperature=0.7,
                timeout=60,
            )
            assert provider.temperature == 0.7
            assert provider.timeout == 60

    def test_init_missing_api_key(self):
        """Should raise RuntimeError when API key missing."""
        from src.llm.secrets import resolve_secret
        resolve_secret.cache_clear()  # Clear cache to ensure clean test

        with patch.dict("os.environ", {"USE_ONEPASSWORD": "false"}, clear=True):
            # Don't mock ChatOpenAI so we can test credential resolution
            with patch("src.llm.openai_provider.tiktoken.encoding_for_model"):
                with pytest.raises(RuntimeError) as exc_info:
                    OpenAIProvider(model="gpt-4-turbo")
                assert "OPENAI_API_KEY" in str(exc_info.value)


class TestOpenAIProviderComplete:
    """Test complete (non-streaming) calls."""

    @pytest.mark.asyncio
    async def test_complete_success(self, provider):
        """Should return LLMCallResult with correct data."""
        # Mock the LangChain client response
        mock_response = AIMessage(content="Hello, how can I help?")
        mock_response.response_metadata = {
            "token_usage": {
                "prompt_tokens": 10,
                "completion_tokens": 15,
            }
        }

        provider._client.ainvoke = AsyncMock(return_value=mock_response)

        messages = [{"role": "user", "content": "Hi"}]
        result = await provider.complete(messages=messages)

        assert isinstance(result, LLMCallResult)
        assert result.content == "Hello, how can I help?"
        assert result.model == "gpt-4-turbo"
        assert result.tokens_input == 10
        assert result.tokens_output == 15
        assert result.cost > 0  # Should calculate cost

    @pytest.mark.asyncio
    async def test_complete_with_system_message(self, provider):
        """Should handle system messages correctly."""
        mock_response = AIMessage(content="Response")
        mock_response.response_metadata = {
            "token_usage": {"prompt_tokens": 20, "completion_tokens": 10}
        }

        provider._client.ainvoke = AsyncMock(return_value=mock_response)

        messages = [
            {"role": "system", "content": "You are helpful"},
            {"role": "user", "content": "Hello"},
        ]
        result = await provider.complete(messages=messages)

        assert result.content == "Response"
        assert provider._client.ainvoke.called

    @pytest.mark.asyncio
    async def test_complete_cost_calculation(self, provider):
        """Should calculate cost accurately."""
        mock_response = AIMessage(content="Test")
        mock_response.response_metadata = {
            "token_usage": {
                "prompt_tokens": 1000,
                "completion_tokens": 500,
            }
        }

        provider._client.ainvoke = AsyncMock(return_value=mock_response)

        messages = [{"role": "user", "content": "Test"}]
        result = await provider.complete(messages=messages)

        # GPT-4 Turbo: $0.01 per 1K prompt, $0.03 per 1K completion
        expected_cost = (1000 / 1000 * 0.01) + (500 / 1000 * 0.03)
        assert result.cost == pytest.approx(expected_cost)


class TestOpenAIProviderStream:
    """Test streaming calls."""

    @pytest.mark.asyncio
    async def test_stream_yields_chunks(self, provider):
        """Should yield StreamChunk instances."""
        # Mock streaming response
        async def mock_astream(*args, **kwargs):
            chunks = [
                Mock(content="Hello"),
                Mock(content=" world"),
                Mock(content="!"),
            ]
            for chunk in chunks:
                yield chunk

        provider._client.astream = mock_astream

        messages = [{"role": "user", "content": "Hi"}]
        chunks = []
        async for chunk in provider.stream(messages=messages):
            chunks.append(chunk)

        assert len(chunks) == 3
        assert all(isinstance(c, StreamChunk) for c in chunks)
        assert chunks[0].content == "Hello"
        assert chunks[1].content == " world"

    @pytest.mark.asyncio
    async def test_stream_token_counting(self, provider):
        """Should estimate tokens per chunk."""
        async def mock_astream(*args, **kwargs):
            yield Mock(content="Test content")

        provider._client.astream = mock_astream

        messages = [{"role": "user", "content": "Hi"}]
        chunks = []
        async for chunk in provider.stream(messages=messages):
            chunks.append(chunk)

        assert chunks[0].tokens_output == 4  # Mocked encoder returns 4 tokens


class TestOpenAIProviderTokenCounting:
    """Test token counting functionality."""

    def test_count_tokens_simple_message(self, provider):
        """Should count tokens for simple messages."""
        messages = [{"role": "user", "content": "Hello"}]
        prompt_tokens, completion_tokens = provider.count_tokens(messages=messages)

        assert prompt_tokens > 0
        assert completion_tokens == 0  # Unknown until generation

    def test_count_tokens_multiple_messages(self, provider):
        """Should count tokens for conversation."""
        messages = [
            {"role": "system", "content": "You are helpful"},
            {"role": "user", "content": "Hi"},
            {"role": "assistant", "content": "Hello!"},
            {"role": "user", "content": "How are you?"},
        ]
        prompt_tokens, completion_tokens = provider.count_tokens(messages=messages)

        assert prompt_tokens > 0
        assert completion_tokens == 0

    def test_count_tokens_overhead(self, provider):
        """Should include formatting overhead in token count."""
        # Each message has ~3 token overhead for formatting
        messages = [{"role": "user", "content": "Hi"}]
        tokens, _ = provider.count_tokens(messages=messages)

        # Should be more than just content tokens due to formatting
        content_tokens = 4  # Mocked encoder
        assert tokens > content_tokens


class TestOpenAIProviderMessageConversion:
    """Test message format conversion."""

    def test_convert_user_message(self, provider):
        """Should convert user messages to HumanMessage."""
        messages = [{"role": "user", "content": "Hello"}]
        lc_messages = provider._convert_to_langchain_messages(messages)

        assert len(lc_messages) == 1
        assert lc_messages[0].content == "Hello"

    def test_convert_system_message(self, provider):
        """Should convert system messages to SystemMessage."""
        messages = [{"role": "system", "content": "Be helpful"}]
        lc_messages = provider._convert_to_langchain_messages(messages)

        assert len(lc_messages) == 1
        assert lc_messages[0].content == "Be helpful"

    def test_convert_assistant_message(self, provider):
        """Should convert assistant messages to AIMessage."""
        messages = [{"role": "assistant", "content": "Hi there"}]
        lc_messages = provider._convert_to_langchain_messages(messages)

        assert len(lc_messages) == 1
        assert lc_messages[0].content == "Hi there"

    def test_convert_mixed_messages(self, provider):
        """Should handle mixed message types."""
        messages = [
            {"role": "system", "content": "System"},
            {"role": "user", "content": "User"},
            {"role": "assistant", "content": "Assistant"},
        ]
        lc_messages = provider._convert_to_langchain_messages(messages)

        assert len(lc_messages) == 3
