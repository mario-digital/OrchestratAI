"""Tests for ProviderFactory and AgentRole mapping."""

import os
from unittest.mock import patch

import pytest

from src.llm.bedrock_provider import BedrockProvider
from src.llm.openai_provider import OpenAIProvider
from src.llm.provider_factory import AgentRole, ProviderFactory


@pytest.fixture
def mock_env():
    """Mock environment with all required credentials.

    Uses clear=True to remove any .env file variables, ensuring tests
    use code defaults for model selection.
    """
    with patch.dict(
        "os.environ",
        {
            "OPENAI_API_KEY": "sk-test",
            "AWS_REGION": "us-east-1",
            "AWS_ACCESS_KEY_ID": "AKIATEST",
            "AWS_SECRET_ACCESS_KEY": "test-secret",
        },
        clear=True,
    ):
        yield


@pytest.fixture(autouse=True)
def clear_cache():
    """Clear provider cache before each test."""
    ProviderFactory.clear_cache()
    yield
    ProviderFactory.clear_cache()


class TestAgentRoleEnum:
    """Test AgentRole enum values."""

    def test_all_roles_defined(self):
        """Should have all required agent roles."""
        expected_roles = {
            "ORCHESTRATOR_ANALYSIS",
            "ORCHESTRATOR_GUIDE",
            "RAG",
            "CAG",
            "HYBRID",
            "DIRECT",
            "EMBEDDINGS",
        }

        actual_roles = {role.name for role in AgentRole}
        assert actual_roles == expected_roles

    def test_role_values(self):
        """Should have correct string values."""
        assert AgentRole.ORCHESTRATOR_ANALYSIS.value == "orchestrator_analysis"
        assert AgentRole.ORCHESTRATOR_GUIDE.value == "orchestrator_guide"
        assert AgentRole.RAG.value == "rag"


class TestProviderFactoryRoleMapping:
    """Test role-to-provider mappings."""

    def test_orchestrator_analysis_uses_bedrock_sonnet(self, mock_env):
        """Should map orchestrator analysis to Bedrock Claude 3.5 Sonnet."""
        with patch("src.llm.bedrock_provider.boto3.client"):
            provider = ProviderFactory.for_role(AgentRole.ORCHESTRATOR_ANALYSIS)

            assert isinstance(provider, BedrockProvider)
            assert "sonnet" in provider.model.lower()

    def test_orchestrator_guide_uses_bedrock_haiku(self, mock_env):
        """Should map orchestrator guide to Bedrock Claude 3 Haiku."""
        with patch("src.llm.bedrock_provider.boto3.client"):
            provider = ProviderFactory.for_role(AgentRole.ORCHESTRATOR_GUIDE)

            assert isinstance(provider, BedrockProvider)
            assert "haiku" in provider.model.lower()

    def test_rag_uses_openai_gpt4_turbo(self, mock_env):
        """Should map RAG to OpenAI GPT-4 Turbo."""
        with patch("src.llm.openai_provider.tiktoken.encoding_for_model"):
            provider = ProviderFactory.for_role(AgentRole.RAG)

            assert isinstance(provider, OpenAIProvider)
            assert provider.model == "gpt-4-turbo"

    def test_cag_uses_bedrock_haiku(self, mock_env):
        """Should map CAG to Bedrock Claude 3 Haiku."""
        with patch("src.llm.bedrock_provider.boto3.client"):
            provider = ProviderFactory.for_role(AgentRole.CAG)

            assert isinstance(provider, BedrockProvider)
            assert "haiku" in provider.model.lower()

    def test_hybrid_uses_openai_gpt4o(self, mock_env):
        """Should map Hybrid to OpenAI GPT-4o."""
        with patch("src.llm.openai_provider.tiktoken.encoding_for_model"):
            provider = ProviderFactory.for_role(AgentRole.HYBRID)

            assert isinstance(provider, OpenAIProvider)
            assert provider.model == "gpt-4o"

    def test_direct_uses_bedrock_haiku(self, mock_env):
        """Should map Direct to Bedrock Claude 3 Haiku."""
        with patch("src.llm.bedrock_provider.boto3.client"):
            provider = ProviderFactory.for_role(AgentRole.DIRECT)

            assert isinstance(provider, BedrockProvider)
            assert "haiku" in provider.model.lower()

    def test_embeddings_uses_openai(self, mock_env):
        """Should map Embeddings to OpenAI text-embedding-3-large."""
        with patch("src.llm.openai_provider.tiktoken.encoding_for_model"):
            provider = ProviderFactory.for_role(AgentRole.EMBEDDINGS)

            assert isinstance(provider, OpenAIProvider)
            assert "embedding" in provider.model.lower()


class TestProviderFactoryCaching:
    """Test provider instance caching."""

    def test_same_role_returns_cached_instance(self, mock_env):
        """Should return same provider instance for repeated calls."""
        with patch("src.llm.openai_provider.tiktoken.encoding_for_model"):
            provider1 = ProviderFactory.for_role(AgentRole.RAG)
            provider2 = ProviderFactory.for_role(AgentRole.RAG)

            assert provider1 is provider2  # Same object reference

    def test_different_roles_return_different_instances(self, mock_env):
        """Should return different providers for different roles."""
        with patch("src.llm.openai_provider.tiktoken.encoding_for_model"):
            with patch("src.llm.bedrock_provider.boto3.client"):
                rag_provider = ProviderFactory.for_role(AgentRole.RAG)
                cag_provider = ProviderFactory.for_role(AgentRole.CAG)

                assert rag_provider is not cag_provider

    def test_clear_cache_invalidates_instances(self, mock_env):
        """Should create new instances after cache clear."""
        with patch("src.llm.openai_provider.tiktoken.encoding_for_model"):
            provider1 = ProviderFactory.for_role(AgentRole.RAG)

            ProviderFactory.clear_cache()

            provider2 = ProviderFactory.for_role(AgentRole.RAG)

            assert provider1 is not provider2


class TestProviderFactoryEnvironmentOverrides:
    """Test environment variable overrides for model selection."""

    def test_orchestrator_analysis_model_override(self, mock_env):
        """Should use ORCHESTRATOR_ANALYSIS_MODEL from env."""
        custom_model = "anthropic.claude-3-5-sonnet-custom:0"
        with patch.dict(os.environ, {"ORCHESTRATOR_ANALYSIS_MODEL": custom_model}):
            with patch("src.llm.bedrock_provider.boto3.client"):
                provider = ProviderFactory.for_role(AgentRole.ORCHESTRATOR_ANALYSIS)

                assert provider.model == custom_model

    def test_orchestrator_guide_model_override(self, mock_env):
        """Should use ORCHESTRATOR_GUIDE_MODEL from env."""
        custom_model = "anthropic.claude-3-haiku-custom:0"
        with patch.dict(os.environ, {"ORCHESTRATOR_GUIDE_MODEL": custom_model}):
            with patch("src.llm.bedrock_provider.boto3.client"):
                provider = ProviderFactory.for_role(AgentRole.ORCHESTRATOR_GUIDE)

                assert provider.model == custom_model

    def test_rag_model_override(self, mock_env):
        """Should use DEFAULT_RAG_MODEL from env."""
        custom_model = "gpt-4-custom"
        with patch.dict(os.environ, {"DEFAULT_RAG_MODEL": custom_model}):
            with patch("src.llm.openai_provider.tiktoken.encoding_for_model"):
                provider = ProviderFactory.for_role(AgentRole.RAG)

                assert provider.model == custom_model

    def test_hybrid_model_override(self, mock_env):
        """Should use DEFAULT_HYBRID_MODEL from env."""
        custom_model = "gpt-4o-custom"
        with patch.dict(os.environ, {"DEFAULT_HYBRID_MODEL": custom_model}):
            with patch("src.llm.openai_provider.tiktoken.encoding_for_model"):
                provider = ProviderFactory.for_role(AgentRole.HYBRID)

                assert provider.model == custom_model

    def test_embeddings_model_override(self, mock_env):
        """Should use DEFAULT_EMBEDDING_MODEL from env."""
        custom_model = "text-embedding-custom"
        with patch.dict(os.environ, {"DEFAULT_EMBEDDING_MODEL": custom_model}):
            with patch("src.llm.openai_provider.tiktoken.encoding_for_model"):
                provider = ProviderFactory.for_role(AgentRole.EMBEDDINGS)

                assert provider.model == custom_model


class TestProviderFactoryTemperature:
    """Test temperature settings for different roles."""

    def test_orchestrator_analysis_temperature(self, mock_env):
        """Should use low temperature for analysis."""
        with patch("src.llm.bedrock_provider.boto3.client"):
            provider = ProviderFactory.for_role(AgentRole.ORCHESTRATOR_ANALYSIS)

            assert provider.temperature == 0.1

    def test_orchestrator_guide_temperature(self, mock_env):
        """Should use moderate temperature for guide."""
        with patch("src.llm.bedrock_provider.boto3.client"):
            provider = ProviderFactory.for_role(AgentRole.ORCHESTRATOR_GUIDE)

            assert provider.temperature == 0.3

    def test_direct_temperature(self, mock_env):
        """Should use higher temperature for direct chat."""
        with patch("src.llm.bedrock_provider.boto3.client"):
            provider = ProviderFactory.for_role(AgentRole.DIRECT)

            assert provider.temperature == 0.5


class TestProviderFactoryErrors:
    """Test error handling in ProviderFactory."""

    def test_invalid_role_raises_error(self, mock_env):
        """Should raise ValueError for invalid role."""
        with pytest.raises((ValueError, AttributeError)):
            # Attempt to create provider for non-existent role
            ProviderFactory.for_role("invalid_role")
