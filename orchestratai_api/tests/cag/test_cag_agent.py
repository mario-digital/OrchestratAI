"""Tests for CAG agent."""

from unittest.mock import AsyncMock

import pytest

from src.agents.workers.cag_agent import CAGAgent
from src.llm.types import LLMCallResult
from src.models.enums import AgentId, LogType
from src.models.schemas import ChatRequest


class TestCAGAgent:
    """Tests for CAGAgent class."""

    @pytest.fixture
    def mock_provider(self) -> AsyncMock:
        """Create mock LLM provider."""
        provider = AsyncMock()
        provider.complete = AsyncMock(
            return_value=LLMCallResult(
                content="Policy answer",
                model="claude-3-haiku",
                tokens_input=100,
                tokens_output=300,
                cost=0.0004,
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
        cache.set = AsyncMock()
        return cache

    @pytest.fixture
    def agent(
        self,
        mock_provider: AsyncMock,
        mock_cache: AsyncMock,
        mock_embeddings: AsyncMock,
    ) -> CAGAgent:
        """Create CAGAgent instance with mocks."""
        return CAGAgent(
            provider=mock_provider,
            cache=mock_cache,
            embeddings=mock_embeddings,
        )

    @pytest.mark.asyncio
    async def test_cache_miss_workflow(
        self,
        agent: CAGAgent,
        mock_provider: AsyncMock,
        mock_embeddings: AsyncMock,
        mock_cache: AsyncMock,
    ) -> None:
        """Test workflow on cache miss."""
        # Setup
        request = ChatRequest(
            message="Can I get a refund?",
            session_id="12345678-1234-1234-1234-123456789012",
        )

        # Execute
        response = await agent.run(request)

        # Verify: Embedding generated
        mock_embeddings.embed.assert_called_once_with("Can I get a refund?")

        # Verify: Cache lookup performed
        mock_cache.get.assert_called_once()
        call_args = mock_cache.get.call_args
        assert call_args.kwargs["embedding"] == [1.0, 2.0, 3.0]
        assert call_args.kwargs["threshold"] == 0.85

        # Verify: Provider called (cache miss)
        mock_provider.complete.assert_called_once()

        # Verify: Cache set with result
        mock_cache.set.assert_called_once()
        set_args = mock_cache.set.call_args
        assert set_args.kwargs["embedding"] == [1.0, 2.0, 3.0]
        assert "message" in set_args.kwargs["payload"]
        assert set_args.kwargs["payload"]["message"] == "Policy answer"

        # Verify: Response structure
        assert response.message == "Policy answer"
        assert response.agent == AgentId.POLICY
        assert response.confidence == 0.85
        assert response.metrics.cache_status == "miss"
        assert response.metrics.cost > 0  # Non-zero cost for cache miss

        # Verify: Cache miss log emitted
        cache_logs = [log for log in response.logs if log.type == LogType.CACHE]
        assert len(cache_logs) == 1
        assert cache_logs[0].data["operation"] == "miss"

    @pytest.mark.asyncio
    async def test_cache_hit_workflow(
        self,
        agent: CAGAgent,
        mock_provider: AsyncMock,
        mock_embeddings: AsyncMock,
        mock_cache: AsyncMock,
    ) -> None:
        """Test workflow on cache hit."""
        # Setup: Cache returns cached payload
        cached_payload = {
            "message": "Cached policy answer",
            "metrics": {
                "tokens_input": 100,
                "tokens_output": 300,
                "cost": 0.0004,
            },
            "timestamp": 1234567890.123,
        }
        mock_cache.get.return_value = (cached_payload, 0.92)  # Cache hit with 0.92 similarity

        request = ChatRequest(
            message="Can I get refund?",  # Slightly different wording
            session_id="12345678-1234-1234-1234-123456789012",
        )

        # Execute
        response = await agent.run(request)

        # Verify: Embedding generated
        mock_embeddings.embed.assert_called_once()

        # Verify: Cache lookup performed
        mock_cache.get.assert_called_once()

        # Verify: Provider NOT called (cache hit)
        mock_provider.complete.assert_not_called()

        # Verify: Cache NOT set (already cached)
        mock_cache.set.assert_not_called()

        # Verify: Response structure
        assert response.message == "Cached policy answer"
        assert response.agent == AgentId.POLICY
        assert response.confidence == 0.90  # High confidence for cache hits
        assert response.metrics.cache_status == "hit"
        assert response.metrics.cost == 0.0  # Zero cost for cache hit
        assert response.metrics.tokensUsed == 0  # Zero tokens for cache hit

        # Verify: Cache hit log emitted
        cache_logs = [log for log in response.logs if log.type == LogType.CACHE]
        assert len(cache_logs) == 1
        assert cache_logs[0].data["operation"] == "hit"
        assert cache_logs[0].data["similarity_score"] == 0.92
        assert cache_logs[0].data["saved_cost"] == 0.0004

    @pytest.mark.asyncio
    async def test_cache_log_emission(
        self,
        agent: CAGAgent,
        mock_cache: AsyncMock,
    ) -> None:
        """Test cache log emission on cache miss."""
        # Setup
        request = ChatRequest(
            message="What is the refund policy?",
            session_id="12345678-1234-1234-1234-123456789012",
        )

        # Execute
        response = await agent.run(request)

        # Verify: Cache log exists
        cache_logs = [log for log in response.logs if log.type == LogType.CACHE]
        assert len(cache_logs) == 1

        # Verify: Log structure
        log = cache_logs[0]
        assert log.type == LogType.CACHE
        assert "operation" in log.data
        assert "latency_ms" in log.data
        assert log.data["operation"] in ["hit", "miss"]

    @pytest.mark.asyncio
    async def test_metrics_on_cache_miss(
        self,
        agent: CAGAgent,
        mock_provider: AsyncMock,
    ) -> None:
        """Test metrics show cache_hit=False on cache miss."""
        # Setup
        request = ChatRequest(
            message="Pricing question",
            session_id="12345678-1234-1234-1234-123456789012",
        )

        # Execute
        response = await agent.run(request)

        # Verify: Metrics show cache miss
        assert response.metrics.cache_status == "miss"
        assert response.metrics.cost > 0
        assert response.metrics.tokensUsed > 0

        # Verify: Provider was called
        mock_provider.complete.assert_called_once()

    @pytest.mark.asyncio
    async def test_metrics_on_cache_hit(
        self,
        agent: CAGAgent,
        mock_provider: AsyncMock,
        mock_cache: AsyncMock,
    ) -> None:
        """Test metrics show cache_hit=True and cost=0 on cache hit."""
        # Setup: Cache hit
        cached_payload = {
            "message": "Cached answer",
            "metrics": {"cost": 0.0005},
            "timestamp": 123.456,
        }
        mock_cache.get.return_value = (cached_payload, 0.88)

        request = ChatRequest(
            message="Pricing question",
            session_id="12345678-1234-1234-1234-123456789012",
        )

        # Execute
        response = await agent.run(request)

        # Verify: Metrics show cache hit
        assert response.metrics.cache_status == "hit"
        assert response.metrics.cost == 0.0  # Zero cost
        assert response.metrics.tokensUsed == 0  # Zero tokens

        # Verify: Provider NOT called
        mock_provider.complete.assert_not_called()

    @pytest.mark.asyncio
    async def test_agent_id_mapping(self, agent: CAGAgent) -> None:
        """Test CAG agent maps to POLICY agent ID."""
        # Setup
        request = ChatRequest(
            message="Policy question",
            session_id="12345678-1234-1234-1234-123456789012",
        )

        # Execute
        response = await agent.run(request)

        # Verify: Agent ID is POLICY
        assert response.agent == AgentId.POLICY

        # Verify: Agent status includes POLICY as COMPLETE
        assert AgentId.POLICY in response.agent_status

    @pytest.mark.asyncio
    async def test_close_cleanup(self, mock_cache: AsyncMock) -> None:
        """Test that close() properly cleans up cache connection."""
        # Setup
        mock_provider = AsyncMock()
        mock_embeddings = AsyncMock()
        agent = CAGAgent(
            provider=mock_provider,
            cache=mock_cache,
            embeddings=mock_embeddings,
        )

        # Execute
        await agent.close()

        # Verify: Cache close was called
        mock_cache.close.assert_called_once()
