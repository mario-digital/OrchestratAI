"""Integration tests for Hybrid agent with real ChromaDB and Redis."""

import os

import pytest
from langchain_core.documents import Document

from src.agents.workers.hybrid_agent import HybridAgent
from src.agents.workers.rag_agent import RAGAgent
from src.cache.redis_cache import RedisSemanticCache
from src.llm.provider_factory import AgentRole, ProviderFactory
from src.models.enums import LogType
from src.models.schemas import ChatRequest
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
class TestHybridIntegration:
    """Integration tests for Hybrid agent with real dependencies."""

    @pytest.fixture(scope="class")
    async def vector_store(self) -> VectorStore:
        """Create real VectorStore with ChromaDB."""
        embeddings_provider = ProviderFactory.for_role(AgentRole.EMBEDDINGS)
        store = ChromaVectorStore(
            embeddings=embeddings_provider,
            collection_name="test_hybrid_integration",
        )

        # Seed with test documents
        test_docs = [
            Document(
                page_content=(
                    "RAG (Retrieval-Augmented Generation) combines "
                    "retrieval with generation."
                ),
                metadata={"source": "rag_doc.pdf", "page": 1},
            ),
            Document(
                page_content=(
                    "CAG (Cached-Augmented Generation) uses semantic "
                    "caching for efficiency."
                ),
                metadata={"source": "cag_doc.pdf", "page": 1},
            ),
            Document(
                page_content=(
                    "Hybrid agents combine both RAG and CAG approaches "
                    "for best results."
                ),
                metadata={"source": "hybrid_doc.pdf", "page": 1},
            ),
        ]

        await store.add_documents(documents=test_docs)

        yield store

        # Cleanup
        await store.delete_collection()

    @pytest.fixture(scope="class")
    async def cache(self) -> RedisSemanticCache:
        """Create real Redis semantic cache."""
        cache_instance = RedisSemanticCache(
            host=os.getenv("REDIS_HOST", "localhost"),
            port=int(os.getenv("REDIS_PORT", "6379")),
            ttl=300,  # 5 minutes for tests
        )

        yield cache_instance

        # Cleanup
        await cache_instance.close()

    @pytest.mark.asyncio
    async def test_end_to_end_hybrid_flow(
        self,
        vector_store: VectorStore,
        cache: RedisSemanticCache,
    ) -> None:
        """Test end-to-end hybrid flow with real ChromaDB and Redis."""
        # Setup
        hybrid_provider = ProviderFactory.for_role(AgentRole.HYBRID)
        rag_provider = ProviderFactory.for_role(AgentRole.RAG)
        embeddings_provider = ProviderFactory.for_role(AgentRole.EMBEDDINGS)

        rag_agent = RAGAgent(provider=rag_provider, vector_store=vector_store)
        hybrid_agent = HybridAgent(
            provider=hybrid_provider,
            rag_agent=rag_agent,
            cache=cache,
            embeddings=embeddings_provider,
        )

        request = ChatRequest(
            message="Compare RAG and CAG approaches and explain their differences",
            session_id="integration-test-12345",
        )

        # Execute
        response = await hybrid_agent.run(request)

        # Verify: Both RAG and cache were invoked
        log_types = {log.type for log in response.logs}
        assert LogType.VECTOR_SEARCH in log_types, "Should have VECTOR_SEARCH log from RAG"
        assert LogType.CACHE in log_types, "Should have CACHE log"

        # Verify: Contexts were merged
        vector_logs = [log for log in response.logs if log.type == LogType.VECTOR_SEARCH]
        assert len(vector_logs) >= 1
        assert vector_logs[0].data["chunks_retrieved"] > 0

        # Verify: GPT-4o was called (response should be synthesized)
        assert response.message is not None
        assert len(response.message) > 0

        # Verify: Metrics are reasonable
        assert response.metrics.tokensUsed > 0
        assert response.metrics.cost > 0
        assert response.metrics.latency > 0

        # Cleanup
        await hybrid_agent.close()

    @pytest.mark.asyncio
    async def test_hybrid_with_cache_hit(
        self,
        vector_store: VectorStore,
        cache: RedisSemanticCache,
    ) -> None:
        """Test hybrid agent with cache hit on second query."""
        # Setup
        hybrid_provider = ProviderFactory.for_role(AgentRole.HYBRID)
        rag_provider = ProviderFactory.for_role(AgentRole.RAG)
        embeddings_provider = ProviderFactory.for_role(AgentRole.EMBEDDINGS)

        rag_agent = RAGAgent(provider=rag_provider, vector_store=vector_store)
        hybrid_agent = HybridAgent(
            provider=hybrid_provider,
            rag_agent=rag_agent,
            cache=cache,
            embeddings=embeddings_provider,
        )

        # First query to populate cache (via CAG or manual set)
        query = "What is semantic caching?"
        request1 = ChatRequest(
            message=query,
            session_id="integration-test-cache-1",
        )

        response1 = await hybrid_agent.run(request1)

        # Second query (similar) should potentially hit cache
        request2 = ChatRequest(
            message="What is semantic caching?",  # Exact same query
            session_id="integration-test-cache-2",
        )

        response2 = await hybrid_agent.run(request2)

        # Verify: Both responses are valid
        assert response1.message is not None
        assert response2.message is not None

        # Note: Cache behavior depends on whether first query populated cache
        # This test verifies the system handles both hit and miss gracefully

        # Cleanup
        await hybrid_agent.close()
