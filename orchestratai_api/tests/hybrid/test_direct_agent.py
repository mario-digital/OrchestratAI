"""Tests for Direct agent."""

from unittest.mock import AsyncMock

import pytest

from src.agents.workers.direct_agent import DirectAgent
from src.llm.types import LLMCallResult
from src.models.enums import AgentId, LogType
from src.models.schemas import ChatRequest


class TestDirectAgent:
    """Tests for DirectAgent class."""

    @pytest.fixture
    def mock_provider(self) -> AsyncMock:
        """Create mock LLM provider (Bedrock Haiku)."""
        provider = AsyncMock()
        provider.complete = AsyncMock(
            return_value=LLMCallResult(
                content="Hello! How can I help you today?",
                model="claude-3-haiku",
                tokens_input=50,
                tokens_output=15,
                cost=0.00008,  # Very low cost for Haiku
                raw=None,
                logprobs=None,
            )
        )
        return provider

    @pytest.fixture
    def agent(self, mock_provider: AsyncMock) -> DirectAgent:
        """Create DirectAgent instance with mock."""
        return DirectAgent(provider=mock_provider)

    @pytest.mark.asyncio
    async def test_simple_conversational_flow(
        self,
        agent: DirectAgent,
        mock_provider: AsyncMock,
    ) -> None:
        """Test simple conversational workflow."""
        # Setup
        request = ChatRequest(
            message="Hello!",
            session_id="12345678-1234-1234-1234-123456789012",
        )

        # Execute
        response = await agent.run(request)

        # Verify: Provider called with simple messages
        mock_provider.complete.assert_called_once()
        call_args = mock_provider.complete.call_args
        messages = call_args.kwargs["messages"]

        assert len(messages) == 2
        assert messages[0]["role"] == "system"
        assert messages[1]["role"] == "user"
        assert messages[1]["content"] == "Hello!"

        # Verify: Response structure
        assert response.message == "Hello! How can I help you today?"
        assert response.agent == AgentId.ORCHESTRATOR  # Direct maps to ORCHESTRATOR
        assert response.confidence == 0.70  # Lower confidence for direct

    @pytest.mark.asyncio
    async def test_low_latency_target(
        self,
        agent: DirectAgent,
    ) -> None:
        """Test that latency is under 1 second (simulated)."""
        # Setup
        request = ChatRequest(
            message="Thanks!",
            session_id="12345678-1234-1234-1234-123456789012",
        )

        # Execute
        response = await agent.run(request)

        # Verify: Latency is reasonable (in production should be < 1000ms)
        # In tests with mocks, it will be very fast
        assert response.metrics.latency < 1000, "Latency should be under 1 second"

    @pytest.mark.asyncio
    async def test_low_cost(
        self,
        agent: DirectAgent,
    ) -> None:
        """Test cost is under $0.001 per query."""
        # Setup
        request = ChatRequest(
            message="Bye!",
            session_id="12345678-1234-1234-1234-123456789012",
        )

        # Execute
        response = await agent.run(request)

        # Verify: Cost is very low (Haiku pricing)
        assert response.metrics.cost < 0.001, "Cost should be under $0.001"

    @pytest.mark.asyncio
    async def test_no_retrieval_logs(
        self,
        agent: DirectAgent,
    ) -> None:
        """Test no retrieval logs emitted (only routing log)."""
        # Setup
        request = ChatRequest(
            message="Hello!",
            session_id="12345678-1234-1234-1234-123456789012",
        )

        # Execute
        response = await agent.run(request)

        # Verify: Only routing log, no VECTOR_SEARCH or CACHE logs
        log_types = {log.type for log in response.logs}
        assert LogType.ROUTING in log_types
        assert LogType.VECTOR_SEARCH not in log_types
        assert LogType.CACHE not in log_types

        # Verify routing log details
        routing_logs = [log for log in response.logs if log.type == LogType.ROUTING]
        assert len(routing_logs) == 1
        assert "Direct" in routing_logs[0].title or "direct" in routing_logs[0].title
        assert routing_logs[0].data["retrieval"] is False

    @pytest.mark.asyncio
    async def test_cache_status_none(
        self,
        agent: DirectAgent,
    ) -> None:
        """Test cache_status is 'none' for direct mode."""
        # Setup
        request = ChatRequest(
            message="Hello!",
            session_id="12345678-1234-1234-1234-123456789012",
        )

        # Execute
        response = await agent.run(request)

        # Verify: No caching in direct mode
        assert response.metrics.cache_status == "none"

    @pytest.mark.asyncio
    async def test_agent_status_map(
        self,
        agent: DirectAgent,
    ) -> None:
        """Test agent status shows orchestrator complete, others idle."""
        # Setup
        request = ChatRequest(
            message="Hello!",
            session_id="12345678-1234-1234-1234-123456789012",
        )

        # Execute
        response = await agent.run(request)

        # Verify: Agent status
        assert response.agent_status[AgentId.ORCHESTRATOR].value == "complete"
        assert response.agent_status[AgentId.BILLING].value == "idle"
        assert response.agent_status[AgentId.TECHNICAL].value == "idle"
        assert response.agent_status[AgentId.POLICY].value == "idle"

    @pytest.mark.asyncio
    async def test_fallback_use_case(
        self,
        agent: DirectAgent,
    ) -> None:
        """Test direct agent serves as final fallback."""
        # Setup: Unknown intent / fallback scenario
        request = ChatRequest(
            message="I don't know what to ask",
            session_id="12345678-1234-1234-1234-123456789012",
        )

        # Execute
        response = await agent.run(request)

        # Verify: Still provides a response (never fails)
        assert response.message is not None
        assert len(response.message) > 0
        assert response.metrics.cost < 0.001
