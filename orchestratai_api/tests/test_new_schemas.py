"""Tests for new Epic 3 Pydantic schemas."""

import pytest
from pydantic import ValidationError

from src.models.enums import AgentId, AgentStatus, LogStatus, LogType
from src.models.schemas import (
    CacheOperation,
    ChatMetrics,
    ChatResponse,
    DocumentChunk,
    QueryAnalysis,
    RetrievalLog,
    VectorSearch,
)


class TestAgentStatusEnum:
    """Test AgentStatus enum has all required states."""

    def test_has_all_four_states(self) -> None:
        """Test that AgentStatus has IDLE, ROUTING, ACTIVE, COMPLETE."""
        assert hasattr(AgentStatus, "IDLE")
        assert hasattr(AgentStatus, "ROUTING")
        assert hasattr(AgentStatus, "ACTIVE")
        assert hasattr(AgentStatus, "COMPLETE")
        assert AgentStatus.IDLE == "idle"
        assert AgentStatus.ROUTING == "routing"
        assert AgentStatus.ACTIVE == "active"
        assert AgentStatus.COMPLETE == "complete"


class TestChatMetricsWithCache:
    """Test ChatMetrics with cache_status field."""

    def test_cache_status_defaults_to_none(self) -> None:
        """Test that cache_status defaults to 'none'."""
        metrics = ChatMetrics(tokensUsed=100, cost=0.01, latency=250)
        assert metrics.cache_status == "none"

    def test_cache_status_hit(self) -> None:
        """Test cache_status with 'hit' value."""
        metrics = ChatMetrics(
            tokensUsed=100, cost=0.01, latency=250, cache_status="hit"
        )
        assert metrics.cache_status == "hit"

    def test_cache_status_miss(self) -> None:
        """Test cache_status with 'miss' value."""
        metrics = ChatMetrics(
            tokensUsed=100, cost=0.01, latency=250, cache_status="miss"
        )
        assert metrics.cache_status == "miss"

    def test_rejects_invalid_cache_status(self) -> None:
        """Test that invalid cache_status values are rejected."""
        with pytest.raises(ValidationError) as exc_info:
            ChatMetrics(
                tokensUsed=100, cost=0.01, latency=250, cache_status="invalid"
            )
        assert "Input should be 'hit', 'miss' or 'none'" in str(exc_info.value)


class TestChatResponseWithAgentStatus:
    """Test ChatResponse with agent_status field."""

    def test_valid_agent_status_mapping(self) -> None:
        """Test ChatResponse with valid agent_status mapping."""
        response = ChatResponse(
            message="Test response",
            agent=AgentId.BILLING,
            confidence=0.95,
            logs=[],
            metrics=ChatMetrics(tokensUsed=100, cost=0.01, latency=250),
            agent_status={
                AgentId.ORCHESTRATOR: AgentStatus.IDLE,
                AgentId.BILLING: AgentStatus.ACTIVE,
                AgentId.TECHNICAL: AgentStatus.IDLE,
                AgentId.POLICY: AgentStatus.IDLE,
            },
        )
        assert len(response.agent_status) == 4
        assert response.agent_status[AgentId.ORCHESTRATOR] == AgentStatus.IDLE
        assert response.agent_status[AgentId.BILLING] == AgentStatus.ACTIVE
        assert response.agent_status[AgentId.TECHNICAL] == AgentStatus.IDLE
        assert response.agent_status[AgentId.POLICY] == AgentStatus.IDLE

    def test_agent_status_with_complete_state(self) -> None:
        """Test agent_status can use COMPLETE state."""
        response = ChatResponse(
            message="Test response",
            agent=AgentId.BILLING,
            confidence=0.95,
            logs=[],
            metrics=ChatMetrics(tokensUsed=100, cost=0.01, latency=250),
            agent_status={
                AgentId.ORCHESTRATOR: AgentStatus.IDLE,
                AgentId.BILLING: AgentStatus.COMPLETE,
                AgentId.TECHNICAL: AgentStatus.IDLE,
                AgentId.POLICY: AgentStatus.IDLE,
            },
        )
        assert response.agent_status[AgentId.BILLING] == AgentStatus.COMPLETE


class TestQueryAnalysis:
    """Test QueryAnalysis schema validation."""

    def test_valid_query_analysis(self) -> None:
        """Test creation of valid QueryAnalysis."""
        analysis = QueryAnalysis(
            intent="Billing inquiry detected",
            confidence=0.95,
            target_agent=AgentId.BILLING,
            reasoning="Keywords matched billing domain",
        )
        assert analysis.intent == "Billing inquiry detected"
        assert analysis.confidence == 0.95
        assert analysis.target_agent == AgentId.BILLING
        assert analysis.reasoning == "Keywords matched billing domain"

    def test_rejects_confidence_below_zero(self) -> None:
        """Test that confidence below 0 is rejected."""
        with pytest.raises(ValidationError) as exc_info:
            QueryAnalysis(
                intent="Test",
                confidence=-0.1,
                target_agent=AgentId.BILLING,
                reasoning="Test",
            )
        assert "Input should be greater than or equal to 0" in str(exc_info.value)

    def test_rejects_confidence_above_one(self) -> None:
        """Test that confidence above 1 is rejected."""
        with pytest.raises(ValidationError) as exc_info:
            QueryAnalysis(
                intent="Test",
                confidence=1.5,
                target_agent=AgentId.BILLING,
                reasoning="Test",
            )
        assert "Input should be less than or equal to 1" in str(exc_info.value)

    def test_requires_all_fields(self) -> None:
        """Test that all fields are required."""
        with pytest.raises(ValidationError) as exc_info:
            QueryAnalysis(intent="Test", confidence=0.95)
        assert "Field required" in str(exc_info.value)


class TestVectorSearch:
    """Test VectorSearch schema validation."""

    def test_valid_vector_search(self) -> None:
        """Test creation of valid VectorSearch."""
        chunks = [
            DocumentChunk(
                id=1, content="Test content", similarity=0.9, source="file1.pdf"
            ),
            DocumentChunk(
                id=2, content="More content", similarity=0.8, source="file2.pdf"
            ),
        ]
        search = VectorSearch(
            collection="billing_docs", chunks_retrieved=2, chunks=chunks, latency=150
        )
        assert search.collection == "billing_docs"
        assert search.chunks_retrieved == 2
        assert len(search.chunks) == 2
        assert search.latency == 150

    def test_rejects_negative_chunks_retrieved(self) -> None:
        """Test that negative chunks_retrieved is rejected."""
        with pytest.raises(ValidationError) as exc_info:
            VectorSearch(
                collection="test",
                chunks_retrieved=-1,
                chunks=[],
                latency=100,
            )
        assert "Input should be greater than or equal to 0" in str(exc_info.value)

    def test_rejects_negative_latency(self) -> None:
        """Test that negative latency is rejected."""
        with pytest.raises(ValidationError) as exc_info:
            VectorSearch(
                collection="test",
                chunks_retrieved=0,
                chunks=[],
                latency=-100,
            )
        assert "Input should be greater than or equal to 0" in str(exc_info.value)

    def test_empty_chunks_list_valid(self) -> None:
        """Test that empty chunks list is valid (no results)."""
        search = VectorSearch(
            collection="test", chunks_retrieved=0, chunks=[], latency=50
        )
        assert search.chunks_retrieved == 0
        assert len(search.chunks) == 0


class TestCacheOperation:
    """Test CacheOperation schema validation."""

    def test_valid_cache_hit(self) -> None:
        """Test creation of valid cache hit operation."""
        cache_op = CacheOperation(status="hit", hit_rate=0.85, size="2.3 MB")
        assert cache_op.status == "hit"
        assert cache_op.hit_rate == 0.85
        assert cache_op.size == "2.3 MB"

    def test_valid_cache_miss(self) -> None:
        """Test creation of valid cache miss operation."""
        cache_op = CacheOperation(status="miss", hit_rate=0.75, size="1.8 MB")
        assert cache_op.status == "miss"
        assert cache_op.hit_rate == 0.75

    def test_rejects_invalid_status(self) -> None:
        """Test that invalid status values are rejected."""
        with pytest.raises(ValidationError) as exc_info:
            CacheOperation(status="invalid", hit_rate=0.8, size="1 MB")
        assert "Input should be 'hit' or 'miss'" in str(exc_info.value)

    def test_rejects_hit_rate_below_zero(self) -> None:
        """Test that hit_rate below 0 is rejected."""
        with pytest.raises(ValidationError) as exc_info:
            CacheOperation(status="hit", hit_rate=-0.1, size="1 MB")
        assert "Input should be greater than or equal to 0" in str(exc_info.value)

    def test_rejects_hit_rate_above_one(self) -> None:
        """Test that hit_rate above 1 is rejected."""
        with pytest.raises(ValidationError) as exc_info:
            CacheOperation(status="hit", hit_rate=1.5, size="1 MB")
        assert "Input should be less than or equal to 1" in str(exc_info.value)


class TestRetrievalLogPolymorphic:
    """Test RetrievalLog with polymorphic data for different log types."""

    def test_routing_log_with_query_analysis_data(self) -> None:
        """Test RetrievalLog with query_analysis type data."""
        log = RetrievalLog(
            id="550e8400-e29b-41d4-a716-446655440000",
            type=LogType.ROUTING,
            title="Query Analysis",
            data={
                "intent": "Billing inquiry detected",
                "confidence": 0.95,
                "target_agent": "billing",
                "reasoning": "Keywords matched billing domain",
            },
            timestamp="2024-01-01T00:00:00Z",
            status=LogStatus.SUCCESS,
        )
        assert log.type == LogType.ROUTING
        assert log.data["intent"] == "Billing inquiry detected"
        assert log.data["confidence"] == 0.95
        assert log.data["target_agent"] == "billing"

    def test_vector_search_log_with_search_data(self) -> None:
        """Test RetrievalLog with vector_search type data."""
        log = RetrievalLog(
            id="550e8400-e29b-41d4-a716-446655440001",
            type=LogType.VECTOR_SEARCH,
            title="Vector Search Completed",
            data={
                "collection": "billing_docs",
                "chunks_retrieved": 5,
                "latency": 120,
            },
            timestamp="2024-01-01T00:00:01Z",
            status=LogStatus.SUCCESS,
        )
        assert log.type == LogType.VECTOR_SEARCH
        assert log.data["collection"] == "billing_docs"
        assert log.data["chunks_retrieved"] == 5
        assert log.data["latency"] == 120

    def test_cache_log_with_operation_data(self) -> None:
        """Test RetrievalLog with cache type data."""
        log = RetrievalLog(
            id="550e8400-e29b-41d4-a716-446655440002",
            type=LogType.CACHE,
            title="Cache Lookup",
            data={"status": "hit", "hit_rate": 0.85, "size": "2.3 MB"},
            timestamp="2024-01-01T00:00:02Z",
            status=LogStatus.SUCCESS,
        )
        assert log.type == LogType.CACHE
        assert log.data["status"] == "hit"
        assert log.data["hit_rate"] == 0.85
        assert log.data["size"] == "2.3 MB"
