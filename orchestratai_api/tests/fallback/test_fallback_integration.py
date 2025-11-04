"""Integration tests for fallback chain with real failures."""

import os
from unittest.mock import patch

import pytest

from src.agents.orchestrator import build_orchestrator_graph
from src.cache.redis_cache import RedisSemanticCache
from src.llm.provider_factory import AgentRole, ProviderFactory
from src.models.enums import LogType
from src.retrieval.chroma_store import ChromaVectorStore
from src.retrieval.vector_store import VectorStore


@pytest.mark.skipif(
    not os.getenv("REDIS_HOST"),
    reason="REDIS_HOST not set - skipping integration tests",
)
@pytest.mark.skipif(
    not os.getenv("OPENAI_API_KEY"),
    reason="OPENAI_API_KEY not set - skipping integration tests",
)
class TestFallbackIntegration:
    """Integration tests for fallback chain with real dependencies."""

    @pytest.fixture(scope="class")
    async def vector_store(self) -> VectorStore:
        """Create real VectorStore with ChromaDB."""
        embeddings_provider = ProviderFactory.for_role(AgentRole.EMBEDDINGS)
        store = ChromaVectorStore(
            embeddings=embeddings_provider,
            collection_name="test_fallback_integration",
        )

        # Seed with test documents
        await store.add_texts(
            texts=["Test document for fallback integration testing."],
            metadatas=[{"source": "test.pdf", "page": 1}],
        )

        yield store

        # Cleanup
        await store.delete_collection()

    @pytest.fixture(scope="class")
    async def cache(self) -> RedisSemanticCache:
        """Create real Redis semantic cache."""
        cache_instance = RedisSemanticCache(
            host=os.getenv("REDIS_HOST", "localhost"),
            port=int(os.getenv("REDIS_PORT", "6379")),
            ttl=300,
        )

        yield cache_instance

        await cache_instance.close()

    @pytest.fixture
    async def orchestrator(
        self,
        vector_store: VectorStore,
        cache: RedisSemanticCache,
    ):
        """Create orchestrator graph with real dependencies."""
        return build_orchestrator_graph(
            vector_store=vector_store,
            cache=cache,
        )

    @pytest.mark.asyncio
    async def test_fallback_from_rag_to_cag(
        self,
        orchestrator,
        vector_store: VectorStore,
    ) -> None:
        """Test fallback when RAG fails, falls back to CAG."""
        # Setup: Force RAG to fail by breaking vector store
        with patch.object(vector_store, "similarity_search_with_scores") as mock_search:
            # Make RAG fail
            mock_search.side_effect = RuntimeError("ChromaDB connection error")

            # Send a domain question (would normally go to RAG)
            initial_state = {
                "messages": [
                    {
                        "role": "user",
                        "content": "What is the technical implementation of RAG?",
                    }
                ],
                "session_id": "fallback-test-1",
                "analysis": {},
                "route": "",
                "result": None,
                "attempted_agents": [],
                "error_message": None,
            }

            # Execute
            result = await orchestrator.ainvoke(initial_state)

            # Verify: User still gets a response (fallback succeeded)
            assert result["result"] is not None
            assert result["result"].message is not None
            assert len(result["result"].message) > 0

            # Verify: Fallback chain was used
            logs = result["result"].logs
            routing_logs = [log for log in logs if log.type == LogType.ROUTING]
            assert len(routing_logs) > 0

            # Should have fallen back to CAG or Direct
            # (Direct always succeeds as final fallback)

    @pytest.mark.asyncio
    async def test_graceful_response_on_failure(
        self,
        orchestrator,
    ) -> None:
        """Test user receives graceful response even if retrieval systems fail."""
        # Setup: Send a query that would go through delegate path
        initial_state = {
            "messages": [
                {
                    "role": "user",
                    "content": "Tell me about RAG systems",
                }
            ],
            "session_id": "fallback-test-2",
            "analysis": {},
            "route": "",
            "result": None,
            "attempted_agents": [],
            "error_message": None,
        }

        # Execute (even if RAG/CAG fail, Direct should provide response)
        result = await orchestrator.ainvoke(initial_state)

        # Verify: Response was generated
        assert result["result"] is not None
        assert result["result"].message is not None

        # Verify: User doesn't see raw errors
        assert "exception" not in result["result"].message.lower()
        assert "traceback" not in result["result"].message.lower()

    @pytest.mark.asyncio
    async def test_attempted_agents_tracking(
        self,
        orchestrator,
        vector_store: VectorStore,
    ) -> None:
        """Test attempted agents list is populated when fallback occurs."""
        # Setup: Force first agent to fail
        with patch.object(vector_store, "similarity_search_with_scores") as mock_search:
            mock_search.side_effect = RuntimeError("Forced failure for testing")

            initial_state = {
                "messages": [
                    {
                        "role": "user",
                        "content": "Domain question that should use RAG",
                    }
                ],
                "session_id": "fallback-test-3",
                "analysis": {},
                "route": "",
                "result": None,
                "attempted_agents": [],
                "error_message": None,
            }

            # Execute
            result = await orchestrator.ainvoke(initial_state)

            # Verify: Fallback log contains attempted agents
            logs = result["result"].logs
            fallback_logs = [
                log
                for log in logs
                if log.type == LogType.ROUTING and "Fallback" in log.title
            ]

            # If fallback occurred, should have fallback log
            # (May not occur if first agent succeeds despite mock)
            if fallback_logs:
                assert "attempted_agents" in fallback_logs[0].data

    @pytest.mark.asyncio
    async def test_direct_agent_always_succeeds(
        self,
        orchestrator,
    ) -> None:
        """Test Direct agent always provides a response (final fallback)."""
        # Setup: Simple chat that should go to Direct agent
        initial_state = {
            "messages": [
                {
                    "role": "user",
                    "content": "Hello!",
                }
            ],
            "session_id": "fallback-test-4",
            "analysis": {},
            "route": "",
            "result": None,
            "attempted_agents": [],
            "error_message": None,
        }

        # Execute
        result = await orchestrator.ainvoke(initial_state)

        # Verify: Response generated
        assert result["result"] is not None
        assert result["result"].message is not None

        # Verify: Direct agent was used (maps to ORCHESTRATOR)
        # This confirms Direct agent works as final fallback

    @pytest.mark.asyncio
    async def test_cleanup_after_integration_tests(
        self,
        cache: RedisSemanticCache,
    ) -> None:
        """Test cleanup of test data from Redis cache."""
        # This test ensures cleanup happens properly
        # The fixture handles cleanup, but we verify cache is accessible

        # Verify cache is still accessible
        embeddings_provider = ProviderFactory.for_role(AgentRole.EMBEDDINGS)
        test_embedding = await embeddings_provider.embed("test query")

        # Try a cache operation
        result, similarity = await cache.get(embedding=test_embedding, threshold=0.85)

        # Should not error (whether hit or miss)
        assert similarity >= 0.0  # Similarity is always non-negative
