"""Tests for backend Pydantic schemas to ensure proper validation."""

import pytest
from pydantic import ValidationError

from src.models.enums import (
    AgentColor,
    AgentId,
    AgentStatus,
    LogStatus,
    LogType,
    MessageRole,
    RetrievalStrategy,
)
from src.models.schemas import (
    Agent,
    ChatMetrics,
    ChatRequest,
    ChatResponse,
    DocumentChunk,
    Message,
    RetrievalLog,
)


class TestChatRequest:
    """Test ChatRequest schema validation."""

    def test_valid_chat_request(self) -> None:
        """Test creation of valid chat request."""
        request = ChatRequest(
            message="Hello, how can I help?",
            session_id="550e8400-e29b-41d4-a716-446655440000",
        )
        assert request.message == "Hello, how can I help?"
        assert request.session_id == "550e8400-e29b-41d4-a716-446655440000"

    def test_rejects_empty_message(self) -> None:
        """Test that empty messages are rejected."""
        with pytest.raises(ValidationError) as exc_info:
            ChatRequest(message="", session_id="550e8400-e29b-41d4-a716-446655440000")
        assert "String should have at least 1 character" in str(exc_info.value)

    def test_rejects_message_over_2000_chars(self) -> None:
        """Test that messages over 2000 characters are rejected."""
        with pytest.raises(ValidationError) as exc_info:
            ChatRequest(
                message="a" * 2001, session_id="550e8400-e29b-41d4-a716-446655440000"
            )
        assert "String should have at most 2000 characters" in str(exc_info.value)

    def test_rejects_invalid_uuid(self) -> None:
        """Test that invalid UUIDs are rejected."""
        with pytest.raises(ValidationError) as exc_info:
            ChatRequest(message="test", session_id="not-a-uuid")
        assert "String should match pattern" in str(exc_info.value)


class TestChatMetrics:
    """Test ChatMetrics schema validation."""

    def test_valid_metrics(self) -> None:
        """Test creation of valid metrics."""
        metrics = ChatMetrics(tokensUsed=100, cost=0.01, latency=250)
        assert metrics.tokensUsed == 100
        assert metrics.cost == 0.01
        assert metrics.latency == 250

    def test_rejects_negative_tokens(self) -> None:
        """Test that negative token counts are rejected."""
        with pytest.raises(ValidationError) as exc_info:
            ChatMetrics(tokensUsed=-10, cost=0.01, latency=250)
        assert "Input should be greater than or equal to 0" in str(exc_info.value)

    def test_rejects_negative_cost(self) -> None:
        """Test that negative costs are rejected."""
        with pytest.raises(ValidationError) as exc_info:
            ChatMetrics(tokensUsed=100, cost=-0.01, latency=250)
        assert "Input should be greater than or equal to 0" in str(exc_info.value)

    def test_rejects_negative_latency(self) -> None:
        """Test that negative latency is rejected."""
        with pytest.raises(ValidationError) as exc_info:
            ChatMetrics(tokensUsed=100, cost=0.01, latency=-250)
        assert "Input should be greater than or equal to 0" in str(exc_info.value)


class TestDocumentChunk:
    """Test DocumentChunk schema validation."""

    def test_valid_document_chunk(self) -> None:
        """Test creation of valid document chunk."""
        chunk = DocumentChunk(
            id=1, content="Document content", similarity=0.95, source="/docs/file.pdf"
        )
        assert chunk.id == 1
        assert chunk.content == "Document content"
        assert chunk.similarity == 0.95
        assert chunk.source == "/docs/file.pdf"
        assert chunk.metadata is None

    def test_valid_chunk_with_metadata(self) -> None:
        """Test chunk with optional metadata."""
        chunk = DocumentChunk(
            id=1,
            content="Document content",
            similarity=0.95,
            source="/docs/file.pdf",
            metadata={"author": "John Doe", "year": "2024"},
        )
        assert chunk.metadata == {"author": "John Doe", "year": "2024"}

    def test_rejects_similarity_below_zero(self) -> None:
        """Test that similarity below 0 is rejected."""
        with pytest.raises(ValidationError) as exc_info:
            DocumentChunk(id=1, content="text", similarity=-0.1, source="file.pdf")
        assert "Input should be greater than or equal to 0" in str(exc_info.value)

    def test_rejects_similarity_above_one(self) -> None:
        """Test that similarity above 1 is rejected."""
        with pytest.raises(ValidationError) as exc_info:
            DocumentChunk(id=1, content="text", similarity=1.5, source="file.pdf")
        assert "Input should be less than or equal to 1" in str(exc_info.value)


class TestRetrievalLog:
    """Test RetrievalLog schema validation."""

    def test_valid_retrieval_log(self) -> None:
        """Test creation of valid retrieval log."""
        log = RetrievalLog(
            id="550e8400-e29b-41d4-a716-446655440000",
            type=LogType.ROUTING,
            title="Query routed to billing agent",
            data={"agent": "billing", "confidence": 0.95},
            timestamp="2024-01-01T00:00:00Z",
            status=LogStatus.SUCCESS,
        )
        assert log.id == "550e8400-e29b-41d4-a716-446655440000"
        assert log.type == LogType.ROUTING
        assert log.status == LogStatus.SUCCESS
        assert log.chunks is None

    def test_log_with_chunks(self) -> None:
        """Test log with document chunks."""
        chunks = [
            DocumentChunk(id=1, content="text1", similarity=0.9, source="file1.pdf"),
            DocumentChunk(id=2, content="text2", similarity=0.8, source="file2.pdf"),
        ]
        log = RetrievalLog(
            id="550e8400-e29b-41d4-a716-446655440000",
            type=LogType.VECTOR_SEARCH,
            title="Vector search completed",
            data={},
            timestamp="2024-01-01T00:00:00Z",
            status=LogStatus.SUCCESS,
            chunks=chunks,
        )
        assert log.chunks is not None
        assert len(log.chunks) == 2


class TestMessage:
    """Test Message schema validation."""

    def test_valid_user_message(self) -> None:
        """Test creation of valid user message."""
        message = Message(
            id="550e8400-e29b-41d4-a716-446655440000",
            role=MessageRole.USER,
            content="Hello",
            timestamp="2024-01-01T00:00:00Z",
            sessionId="550e8400-e29b-41d4-a716-446655440001",
        )
        assert message.role == MessageRole.USER
        assert message.content == "Hello"
        assert message.agent is None
        assert message.confidence is None

    def test_valid_assistant_message(self) -> None:
        """Test creation of valid assistant message."""
        message = Message(
            id="550e8400-e29b-41d4-a716-446655440000",
            role=MessageRole.ASSISTANT,
            content="Hi there!",
            agent=AgentId.BILLING,
            confidence=0.95,
            timestamp="2024-01-01T00:00:00Z",
            sessionId="550e8400-e29b-41d4-a716-446655440001",
        )
        assert message.role == MessageRole.ASSISTANT
        assert message.agent == AgentId.BILLING
        assert message.confidence == 0.95


class TestAgent:
    """Test Agent schema validation."""

    def test_valid_agent(self) -> None:
        """Test creation of valid agent."""
        agent = Agent(
            id=AgentId.ORCHESTRATOR,
            name="Orchestrator",
            status=AgentStatus.ACTIVE,
            model="gpt-4",
            color=AgentColor.CYAN,
            tokensUsed=100,
            cost=0.01,
        )
        assert agent.id == AgentId.ORCHESTRATOR
        assert agent.name == "Orchestrator"
        assert agent.status == AgentStatus.ACTIVE
        assert agent.strategy is None
        assert agent.cached is None

    def test_agent_with_strategy(self) -> None:
        """Test agent with retrieval strategy."""
        agent = Agent(
            id=AgentId.BILLING,
            name="Billing Agent",
            status=AgentStatus.ACTIVE,
            model="gpt-4",
            strategy=RetrievalStrategy.PURE_RAG,
            color=AgentColor.GREEN,
            tokensUsed=100,
            cost=0.01,
            cached=True,
        )
        assert agent.strategy == RetrievalStrategy.PURE_RAG
        assert agent.cached is True

    def test_rejects_negative_tokens(self) -> None:
        """Test that negative tokens are rejected."""
        with pytest.raises(ValidationError) as exc_info:
            Agent(
                id=AgentId.ORCHESTRATOR,
                name="Orchestrator",
                status=AgentStatus.ACTIVE,
                model="gpt-4",
                color=AgentColor.CYAN,
                tokensUsed=-100,
                cost=0.01,
            )
        assert "Input should be greater than or equal to 0" in str(exc_info.value)


class TestChatResponse:
    """Test ChatResponse schema validation."""

    def test_valid_chat_response(self) -> None:
        """Test creation of valid chat response."""
        response = ChatResponse(
            message="Here is your answer",
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
        assert response.message == "Here is your answer"
        assert response.agent == AgentId.BILLING
        assert response.confidence == 0.95
        assert len(response.logs) == 0
        assert response.metrics.tokensUsed == 100
        assert response.agent_status[AgentId.BILLING] == AgentStatus.ACTIVE

    def test_response_with_logs(self) -> None:
        """Test response with retrieval logs."""
        logs = [
            RetrievalLog(
                id="550e8400-e29b-41d4-a716-446655440000",
                type=LogType.ROUTING,
                title="Query routed",
                data={},
                timestamp="2024-01-01T00:00:00Z",
                status=LogStatus.SUCCESS,
            )
        ]
        response = ChatResponse(
            message="Answer",
            agent=AgentId.TECHNICAL,
            confidence=0.92,
            logs=logs,
            metrics=ChatMetrics(tokensUsed=150, cost=0.02, latency=300),
            agent_status={
                AgentId.ORCHESTRATOR: AgentStatus.IDLE,
                AgentId.BILLING: AgentStatus.IDLE,
                AgentId.TECHNICAL: AgentStatus.ACTIVE,
                AgentId.POLICY: AgentStatus.IDLE,
            },
        )
        assert len(response.logs) == 1
        assert response.logs[0].type == LogType.ROUTING
