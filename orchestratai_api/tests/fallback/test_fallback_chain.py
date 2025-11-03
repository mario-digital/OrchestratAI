"""Tests for orchestrator fallback chain."""

from unittest.mock import AsyncMock

import pytest

from src.agents.orchestrator import OrchestratorState, execute_with_fallback
from src.models.enums import AgentId, LogType
from src.models.schemas import ChatMetrics, ChatResponse


class TestFallbackChain:
    """Tests for fallback chain execution."""

    @pytest.fixture
    def mock_state(self) -> OrchestratorState:
        """Create mock orchestrator state."""
        return OrchestratorState(
            messages=[{"role": "user", "content": "Test query"}],
            analysis={"intent": "DOMAIN_QUESTION", "confidence": 0.8},
            route="delegate_hybrid",
            result=None,
            session_id="12345678-1234-1234-1234-123456789012",
            attempted_agents=[],
            error_message=None,
        )

    @pytest.mark.asyncio
    async def test_first_agent_succeeds(
        self,
        mock_state: OrchestratorState,
    ) -> None:
        """Test when first agent succeeds, no fallback needed."""
        # Setup: First agent succeeds
        async def successful_agent():
            return ChatResponse(
                message="Success from first agent",
                agent=AgentId.BILLING,
                confidence=0.9,
                logs=[],
                metrics=ChatMetrics(
                    tokensUsed=100,
                    cost=0.01,
                    latency=500,
                    cache_status="none",
                ),
                agent_status={},
            )

        fallback_chain = [
            ("hybrid", successful_agent),
            ("rag", AsyncMock()),  # Should not be called
            ("direct", AsyncMock()),  # Should not be called
        ]

        # Execute
        response = await execute_with_fallback(fallback_chain, mock_state)

        # Verify: First agent succeeded
        assert response.message == "Success from first agent"
        assert response.agent == AgentId.BILLING

        # No fallback log should be added (first attempt succeeded)
        fallback_logs = [log for log in response.logs if "Fallback" in log.title]
        assert len(fallback_logs) == 0

    @pytest.mark.asyncio
    async def test_fallback_from_hybrid_to_rag(
        self,
        mock_state: OrchestratorState,
    ) -> None:
        """Test fallback: Hybrid fails → RAG succeeds."""
        # Setup: Hybrid fails, RAG succeeds
        async def failing_hybrid():
            raise RuntimeError("Hybrid agent failed")

        async def successful_rag():
            return ChatResponse(
                message="Success from RAG fallback",
                agent=AgentId.TECHNICAL,
                confidence=0.85,
                logs=[],
                metrics=ChatMetrics(
                    tokensUsed=150,
                    cost=0.015,
                    latency=800,
                    cache_status="none",
                ),
                agent_status={},
            )

        fallback_chain = [
            ("hybrid", failing_hybrid),
            ("rag", successful_rag),
            ("direct", AsyncMock()),  # Should not be called
        ]

        # Execute
        response = await execute_with_fallback(fallback_chain, mock_state)

        # Verify: RAG succeeded
        assert response.message == "Success from RAG fallback"
        assert response.agent == AgentId.TECHNICAL

        # Verify: Fallback log added
        fallback_logs = [
            log
            for log in response.logs
            if log.type == LogType.ROUTING and "Fallback" in log.title
        ]
        assert len(fallback_logs) == 1

        # Verify fallback log details
        fallback_log = fallback_logs[0]
        assert fallback_log.data["attempted_agents"] == ["hybrid"]
        assert fallback_log.data["successful_agent"] == "rag"

    @pytest.mark.asyncio
    async def test_fallback_chain_order(
        self,
        mock_state: OrchestratorState,
    ) -> None:
        """Test fallback order: Hybrid → RAG → CAG → Direct."""
        # Setup: First three fail, Direct succeeds
        async def failing_agent():
            raise RuntimeError("Agent failed")

        async def successful_direct():
            return ChatResponse(
                message="Success from Direct (final fallback)",
                agent=AgentId.ORCHESTRATOR,
                confidence=0.70,
                logs=[],
                metrics=ChatMetrics(
                    tokensUsed=50,
                    cost=0.0001,
                    latency=300,
                    cache_status="none",
                ),
                agent_status={},
            )

        fallback_chain = [
            ("hybrid", failing_agent),
            ("rag", failing_agent),
            ("cag", failing_agent),
            ("direct", successful_direct),
        ]

        # Execute
        response = await execute_with_fallback(fallback_chain, mock_state)

        # Verify: Direct succeeded (final fallback)
        assert response.message == "Success from Direct (final fallback)"
        assert response.agent == AgentId.ORCHESTRATOR

        # Verify: Fallback log shows all attempted agents
        fallback_logs = [
            log
            for log in response.logs
            if log.type == LogType.ROUTING and "Fallback" in log.title
        ]
        assert len(fallback_logs) == 1

        fallback_log = fallback_logs[0]
        assert fallback_log.data["attempted_agents"] == ["hybrid", "rag", "cag"]
        assert fallback_log.data["successful_agent"] == "direct"

    @pytest.mark.asyncio
    async def test_all_agents_fail(
        self,
        mock_state: OrchestratorState,
    ) -> None:
        """Test when all agents fail, error response returned."""
        # Setup: All agents fail
        async def failing_agent():
            raise RuntimeError("Agent failed")

        fallback_chain = [
            ("hybrid", failing_agent),
            ("rag", failing_agent),
            ("cag", failing_agent),
            ("direct", failing_agent),
        ]

        # Execute
        response = await execute_with_fallback(fallback_chain, mock_state)

        # Verify: Error response returned
        assert "technical difficulties" in response.message.lower()
        assert response.agent == AgentId.ORCHESTRATOR
        assert response.confidence == 0.0

        # Verify: Error log present
        error_logs = [log for log in response.logs if log.status.value == "error"]
        assert len(error_logs) == 1

        error_log = error_logs[0]
        assert error_log.data["attempted_agents"] == ["hybrid", "rag", "cag", "direct"]

        # Verify: Agent status shows error
        assert response.agent_status[AgentId.ORCHESTRATOR].value == "error"

    @pytest.mark.asyncio
    async def test_fallback_logs_emitted(
        self,
        mock_state: OrchestratorState,
    ) -> None:
        """Test ROUTING logs emitted for fallback events."""
        # Setup: First agent fails, second succeeds
        async def failing_agent():
            raise RuntimeError("First agent failed")

        async def successful_agent():
            return ChatResponse(
                message="Success",
                agent=AgentId.TECHNICAL,
                confidence=0.85,
                logs=[],
                metrics=ChatMetrics(
                    tokensUsed=100,
                    cost=0.01,
                    latency=500,
                    cache_status="none",
                ),
                agent_status={},
            )

        fallback_chain = [
            ("hybrid", failing_agent),
            ("rag", successful_agent),
        ]

        # Execute
        response = await execute_with_fallback(fallback_chain, mock_state)

        # Verify: ROUTING log for fallback
        routing_logs = [log for log in response.logs if log.type == LogType.ROUTING]
        assert len(routing_logs) >= 1

        # Find the fallback log
        fallback_log = next(log for log in routing_logs if "Fallback" in log.title)
        assert fallback_log is not None
        assert fallback_log.status.value == "success"

    @pytest.mark.asyncio
    async def test_attempted_agents_tracked(
        self,
        mock_state: OrchestratorState,
    ) -> None:
        """Test attempted agents list is tracked correctly."""
        # Setup: Multiple failures
        async def failing_agent():
            raise RuntimeError("Failed")

        async def successful_agent():
            return ChatResponse(
                message="Success",
                agent=AgentId.ORCHESTRATOR,
                confidence=0.70,
                logs=[],
                metrics=ChatMetrics(
                    tokensUsed=50,
                    cost=0.0001,
                    latency=200,
                    cache_status="none",
                ),
                agent_status={},
            )

        fallback_chain = [
            ("hybrid", failing_agent),
            ("rag", failing_agent),
            ("direct", successful_agent),
        ]

        # Execute
        response = await execute_with_fallback(fallback_chain, mock_state)

        # Verify: Attempted agents tracked in fallback log
        fallback_logs = [log for log in response.logs if "Fallback" in log.title]
        assert len(fallback_logs) == 1

        assert fallback_logs[0].data["attempted_agents"] == ["hybrid", "rag"]
