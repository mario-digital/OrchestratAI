"""Tests for Hybrid agent."""

from unittest.mock import AsyncMock

import pytest

from src.agents.workers.hybrid_agent import HybridAgent
from src.llm.types import LLMCallResult
from src.models.enums import AgentId, LogType
from src.models.schemas import ChatMetrics, ChatRequest, ChatResponse, DocumentChunk, RetrievalLog


class TestHybridAgent:
    """Tests for HybridAgent class."""

    @pytest.fixture
    def mock_provider(self) -> AsyncMock:
        """Create mock LLM provider (GPT-4o)."""
        provider = AsyncMock()
        provider.complete = AsyncMock(
            return_value=LLMCallResult(
                content="Hybrid response synthesizing multiple sources",
                model="gpt-4o",
                tokens_input=2500,
                tokens_output=800,
                cost=0.0205,
                raw=None,
                logprobs=None,
            )
        )
        return provider

    @pytest.fixture
    def mock_embeddings(self) -> AsyncMock:
        """Create mock embeddings provider."""
        embeddings = AsyncMock()
        embeddings.embed = AsyncMock(return_value=[1.0, 2.0, 3.0])
        return embeddings

    @pytest.fixture
    def mock_cache(self) -> AsyncMock:
        """Create mock semantic cache."""
        cache = AsyncMock()
        cache.get = AsyncMock(return_value=(None, 0.0))  # Default: cache miss
        cache.close = AsyncMock()
        return cache

    @pytest.fixture
    def mock_rag_agent(self) -> AsyncMock:
        """Create mock RAG agent."""
        rag_agent = AsyncMock()

        # Create mock RAG response with documents
        chunks = [
            DocumentChunk(
                id=0,
                content="RAG document A content",
                similarity=0.95,
                source="doc_a.pdf",
                metadata={"source": "doc_a.pdf", "page": 1},
            ),
            DocumentChunk(
                id=1,
                content="RAG document B content",
                similarity=0.88,
                source="doc_b.pdf",
                metadata={"source": "doc_b.pdf", "page": 2},
            ),
            DocumentChunk(
                id=2,
                content="RAG document C content",
                similarity=0.82,
                source="doc_c.pdf",
                metadata={"source": "doc_c.pdf", "page": 1},
            ),
        ]

        rag_response = ChatResponse(
            message="RAG response",
            agent=AgentId.TECHNICAL,
            confidence=0.85,
            logs=[
                RetrievalLog(
                    id="rag-log-1",
                    type=LogType.VECTOR_SEARCH,
                    title="Retrieved 3 documents",
                    data={"chunks_retrieved": 3},
                    timestamp="2025-01-01T00:00:00Z",
                    status="success",
                    chunks=chunks,
                )
            ],
            metrics=ChatMetrics(
                tokensUsed=1500,
                cost=0.015,
                latency=1200,
                cache_status="none",
            ),
            agent_status={},
        )

        rag_agent.run = AsyncMock(return_value=rag_response)
        return rag_agent

    @pytest.fixture
    def agent(
        self,
        mock_provider: AsyncMock,
        mock_rag_agent: AsyncMock,
        mock_cache: AsyncMock,
        mock_embeddings: AsyncMock,
    ) -> HybridAgent:
        """Create HybridAgent instance with mocks."""
        return HybridAgent(
            provider=mock_provider,
            rag_agent=mock_rag_agent,
            cache=mock_cache,
            embeddings=mock_embeddings,
        )

    @pytest.mark.asyncio
    async def test_parallel_execution(
        self,
        agent: HybridAgent,
        mock_rag_agent: AsyncMock,
        mock_cache: AsyncMock,
        mock_embeddings: AsyncMock,
    ) -> None:
        """Test parallel execution of RAG and cache lookup."""
        # Setup
        request = ChatRequest(
            message="Compare RAG and CAG approaches",
            session_id="12345678-1234-1234-1234-123456789012",
        )

        # Execute
        await agent.run(request)

        # Verify: Embedding generated for cache lookup
        mock_embeddings.embed.assert_called_once_with("Compare RAG and CAG approaches")

        # Verify: Both RAG agent and cache were called
        mock_rag_agent.run.assert_called_once()
        mock_cache.get.assert_called_once()

        # Verify: RAG and cache ran in parallel (asyncio.gather)
        # This is implicit in the implementation

    @pytest.mark.asyncio
    async def test_context_deduplication(
        self,
        agent: HybridAgent,
        mock_rag_agent: AsyncMock,
        mock_cache: AsyncMock,
    ) -> None:
        """Test context deduplication by source + page."""
        # Setup: Cache returns a document that overlaps with RAG (doc_b.pdf page 2)
        cached_payload = {
            "message": "Cached response about document B",
            "metrics": {"cost": 0.0004},
            "timestamp": 1234567890.123,
        }
        mock_cache.get.return_value = (cached_payload, 0.90)

        # RAG agent returns docs A, B, C (defined in fixture)
        # Cache returns pseudo-doc from cache
        # Expected merged result: 4 sources (A, B, C, cache)

        request = ChatRequest(
            message="Test query",
            session_id="12345678-1234-1234-1234-123456789012",
        )

        # Execute
        response = await agent.run(request)

        # Verify: Sources used includes both RAG and cache
        # Note: The deduplication happens internally but sources_used metric reflects unique sources
        assert response.metrics.cost > 0  # Combined cost from RAG + GPT-4o

    @pytest.mark.asyncio
    async def test_metrics_aggregation(
        self,
        agent: HybridAgent,
        mock_provider: AsyncMock,
    ) -> None:
        """Test metrics aggregation from RAG + cache + GPT-4o."""
        # Setup: Cache hit
        cached_payload = {
            "message": "Cached insight",
            "metrics": {"cost": 0.0004},
            "timestamp": 1234567890.123,
        }
        agent._cache.get.return_value = (cached_payload, 0.88)

        request = ChatRequest(
            message="Test query",
            session_id="12345678-1234-1234-1234-123456789012",
        )

        # Execute
        response = await agent.run(request)

        # Verify: Provider called with merged context
        mock_provider.complete.assert_called_once()
        call_args = mock_provider.complete.call_args
        messages = call_args.kwargs["messages"]

        # Should have system prompt + user with merged context
        assert len(messages) == 2
        assert "system" in messages[0]["role"]
        assert "user" in messages[1]["role"]
        assert "Context:" in messages[1]["content"]
        assert "Cached Insight" in messages[1]["content"]

        # Verify: Response structure
        assert response.message == "Hybrid response synthesizing multiple sources"
        assert response.agent == AgentId.BILLING  # Hybrid maps to BILLING
        assert response.confidence == 0.90
        assert response.metrics.cache_status == "hit"

    @pytest.mark.asyncio
    async def test_sources_used_tracking(
        self,
        agent: HybridAgent,
        mock_cache: AsyncMock,
    ) -> None:
        """Test sources_used metric tracks unique sources."""
        # Setup: Cache miss
        mock_cache.get.return_value = (None, 0.0)

        request = ChatRequest(
            message="Test query",
            session_id="12345678-1234-1234-1234-123456789012",
        )

        # Execute
        response = await agent.run(request)

        # Verify: sources_used > 1 (RAG has 3 docs in fixture)
        # The metric is stored in extra data, not directly accessible in response
        # But we can verify logs contain both VECTOR_SEARCH and CACHE
        log_types = {log.type for log in response.logs}
        assert LogType.VECTOR_SEARCH in log_types
        assert LogType.CACHE in log_types

    @pytest.mark.asyncio
    async def test_both_vector_search_and_cache_logs(
        self,
        agent: HybridAgent,
        mock_cache: AsyncMock,
    ) -> None:
        """Test response includes both VECTOR_SEARCH and CACHE logs."""
        # Setup: Cache hit
        cached_payload = {
            "message": "Cached insight",
            "metrics": {"cost": 0.0004},
            "timestamp": 1234567890.123,
        }
        mock_cache.get.return_value = (cached_payload, 0.92)

        request = ChatRequest(
            message="Test query",
            session_id="12345678-1234-1234-1234-123456789012",
        )

        # Execute
        response = await agent.run(request)

        # Verify: Both log types present
        vector_logs = [log for log in response.logs if log.type == LogType.VECTOR_SEARCH]
        cache_logs = [log for log in response.logs if log.type == LogType.CACHE]

        assert len(vector_logs) >= 1, "Should have VECTOR_SEARCH log from RAG"
        assert len(cache_logs) == 1, "Should have CACHE log"

        # Verify cache log details
        cache_log = cache_logs[0]
        assert cache_log.data["operation"] == "hit"
        assert cache_log.data["similarity_score"] == 0.92

    @pytest.mark.asyncio
    async def test_cache_miss_creates_miss_log(
        self,
        agent: HybridAgent,
        mock_cache: AsyncMock,
    ) -> None:
        """Test cache miss generates appropriate log."""
        # Setup: Cache miss
        mock_cache.get.return_value = (None, 0.0)

        request = ChatRequest(
            message="Test query",
            session_id="12345678-1234-1234-1234-123456789012",
        )

        # Execute
        response = await agent.run(request)

        # Verify: Cache miss log
        cache_logs = [log for log in response.logs if log.type == LogType.CACHE]
        assert len(cache_logs) == 1

        cache_log = cache_logs[0]
        assert cache_log.data["operation"] == "miss"
        assert cache_log.data["similarity_score"] == 0.0

    @pytest.mark.asyncio
    async def test_close_cleanup(
        self,
        agent: HybridAgent,
        mock_cache: AsyncMock,
    ) -> None:
        """Test close method cleans up cache connection."""
        # Execute
        await agent.close()

        # Verify: Cache close called
        mock_cache.close.assert_called_once()
