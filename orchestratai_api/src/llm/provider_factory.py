"""Provider factory for mapping agent roles to LLM providers."""

import os
from enum import Enum
from functools import cache

from .base_provider import BaseLLMProvider
from .bedrock_provider import BedrockProvider
from .openai_provider import OpenAIProvider


class AgentRole(str, Enum):
    """Agent roles with specific LLM provider assignments.

    Each role is mapped to an optimal model based on:
    - Cost efficiency
    - Response quality requirements
    - Speed requirements
    """

    ORCHESTRATOR_ANALYSIS = "orchestrator_analysis"  # Strategic routing with Sonnet
    ORCHESTRATOR_GUIDE = "orchestrator_guide"  # Fast meta responses with Haiku
    RAG = "rag"  # Document Q&A with GPT-4 Turbo
    CAG = "cag"  # Cached queries with Haiku
    HYBRID = "hybrid"  # Complex reasoning with GPT-4o
    DIRECT = "direct"  # Simple chat with Haiku
    EMBEDDINGS = "embeddings"  # Vector embeddings with OpenAI


class ProviderFactory:
    """Factory for creating and caching LLM providers per agent role.

    Providers are cached per-process to reuse SDK clients and connections.
    The orchestrator uses TWO different models:
    - Claude 3.5 Sonnet for analysis/routing (higher quality)
    - Claude 3 Haiku for guide mode (faster, cheaper)
    """

    @staticmethod
    @cache
    def for_role(role: AgentRole) -> BaseLLMProvider:
        """Get or create a cached provider for the specified agent role.

        Args:
            role: The agent role requiring an LLM provider

        Returns:
            Cached BaseLLMProvider instance configured for the role

        Examples:
            >>> factory = ProviderFactory()
            >>> orchestrator = factory.for_role(AgentRole.ORCHESTRATOR_ANALYSIS)
            >>> guide = factory.for_role(AgentRole.ORCHESTRATOR_GUIDE)
            >>> rag_worker = factory.for_role(AgentRole.RAG)
        """
        if role == AgentRole.ORCHESTRATOR_ANALYSIS:
            # High-quality analysis and routing
            model = os.getenv(
                "ORCHESTRATOR_ANALYSIS_MODEL",
                "anthropic.claude-3-5-sonnet-20241022-v2:0",
            )
            return BedrockProvider(model=model, temperature=0.1)

        elif role == AgentRole.ORCHESTRATOR_GUIDE:
            # Fast guide mode responses
            model = os.getenv(
                "ORCHESTRATOR_GUIDE_MODEL",
                "anthropic.claude-3-haiku-20240307-v1:0",
            )
            return BedrockProvider(model=model, temperature=0.3)

        elif role == AgentRole.RAG:
            # Document Q&A with strong reasoning
            model = os.getenv("DEFAULT_RAG_MODEL", "gpt-4-turbo")
            return OpenAIProvider(model=model, temperature=0.1)

        elif role == AgentRole.CAG:
            # Cached queries - optimize for cost
            model = os.getenv(
                "DEFAULT_CAG_MODEL",
                "anthropic.claude-3-haiku-20240307-v1:0",
            )
            return BedrockProvider(model=model, temperature=0.1)

        elif role == AgentRole.HYBRID:
            # Complex reasoning combining retrieval + generation
            model = os.getenv("DEFAULT_HYBRID_MODEL", "gpt-4o")
            return OpenAIProvider(model=model, temperature=0.2)

        elif role == AgentRole.DIRECT:
            # Simple direct chat
            model = os.getenv(
                "DEFAULT_DIRECT_MODEL",
                "anthropic.claude-3-haiku-20240307-v1:0",
            )
            return BedrockProvider(model=model, temperature=0.5)

        elif role == AgentRole.EMBEDDINGS:
            # Vector embeddings
            model = os.getenv("DEFAULT_EMBEDDING_MODEL", "text-embedding-3-large")
            return OpenAIProvider(model=model, temperature=0.0)

        else:
            msg = f"Unknown agent role: {role}"
            raise ValueError(msg)

    @staticmethod
    def clear_cache() -> None:
        """Clear the provider cache.

        Useful for testing or when credential rotation requires new clients.
        """
        ProviderFactory.for_role.cache_clear()
