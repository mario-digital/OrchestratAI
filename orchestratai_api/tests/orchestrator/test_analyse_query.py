"""Tests for orchestrator query analysis."""

from unittest.mock import AsyncMock, MagicMock, patch

import pytest

from src.agents.orchestrator import DOMAIN_QUESTION, META_QUESTION, OrchestratorState, analyse_query
from src.llm.types import LLMCallResult


@pytest.mark.asyncio
async def test_analyse_query_meta_question():
    """Test analysis of meta question about capabilities."""
    state: OrchestratorState = {
        "messages": [{"role": "user", "content": "What can you help with?"}],
        "analysis": {},
        "route": "",
        "result": None,
        "session_id": "test-session",
    }

    # Mock provider response
    mock_result = LLMCallResult(
        content='{"intent": "META_QUESTION", "confidence": 0.95, "reasoning": "User asking about capabilities"}',
        model="claude-3-5-sonnet",
        tokens_input=100,
        tokens_output=50,
        cost=0.001,
    )

    with patch("src.agents.orchestrator.ProviderFactory.for_role") as mock_factory:
        mock_provider = AsyncMock()
        mock_provider.complete = AsyncMock(return_value=mock_result)
        mock_factory.return_value = mock_provider

        result_state = await analyse_query(state)

    # Verify analysis populated
    assert result_state["analysis"]["intent"] == META_QUESTION
    assert result_state["analysis"]["confidence"] == 0.95
    assert "capabilities" in result_state["analysis"]["reasoning"].lower()


@pytest.mark.asyncio
async def test_analyse_query_domain_question():
    """Test analysis of domain-specific question."""
    state: OrchestratorState = {
        "messages": [{"role": "user", "content": "What is RAG?"}],
        "analysis": {},
        "route": "",
        "result": None,
        "session_id": "test-session",
    }

    mock_result = LLMCallResult(
        content='{"intent": "DOMAIN_QUESTION", "confidence": 0.92, "reasoning": "Requires domain knowledge"}',
        model="claude-3-5-sonnet",
        tokens_input=100,
        tokens_output=50,
        cost=0.001,
    )

    with patch("src.agents.orchestrator.ProviderFactory.for_role") as mock_factory:
        mock_provider = AsyncMock()
        mock_provider.complete = AsyncMock(return_value=mock_result)
        mock_factory.return_value = mock_provider

        result_state = await analyse_query(state)

    assert result_state["analysis"]["intent"] == DOMAIN_QUESTION
    assert result_state["analysis"]["confidence"] == 0.92


@pytest.mark.asyncio
async def test_analyse_query_with_markdown_json():
    """Test parsing JSON wrapped in markdown code blocks."""
    state: OrchestratorState = {
        "messages": [{"role": "user", "content": "Test query"}],
        "analysis": {},
        "route": "",
        "result": None,
        "session_id": "test-session",
    }

    # Response wrapped in markdown
    mock_result = LLMCallResult(
        content='```json\n{"intent": "META_QUESTION", "confidence": 0.9, "reasoning": "Test"}\n```',
        model="claude-3-5-sonnet",
        tokens_input=100,
        tokens_output=50,
        cost=0.001,
    )

    with patch("src.agents.orchestrator.ProviderFactory.for_role") as mock_factory:
        mock_provider = AsyncMock()
        mock_provider.complete = AsyncMock(return_value=mock_result)
        mock_factory.return_value = mock_provider

        result_state = await analyse_query(state)

    # Should successfully parse despite markdown
    assert result_state["analysis"]["intent"] == META_QUESTION
    assert result_state["analysis"]["confidence"] == 0.9


@pytest.mark.asyncio
async def test_analyse_query_invalid_json_fallback():
    """Test fallback behavior when JSON parsing fails."""
    state: OrchestratorState = {
        "messages": [{"role": "user", "content": "Test"}],
        "analysis": {},
        "route": "",
        "result": None,
        "session_id": "test-session",
    }

    # Invalid JSON response
    mock_result = LLMCallResult(
        content="This is not valid JSON",
        model="claude-3-5-sonnet",
        tokens_input=100,
        tokens_output=50,
        cost=0.001,
    )

    with patch("src.agents.orchestrator.ProviderFactory.for_role") as mock_factory:
        mock_provider = AsyncMock()
        mock_provider.complete = AsyncMock(return_value=mock_result)
        mock_factory.return_value = mock_provider

        result_state = await analyse_query(state)

    # Should use fallback defaults
    assert result_state["analysis"]["intent"] == DOMAIN_QUESTION
    assert result_state["analysis"]["confidence"] == 0.5
    assert "Failed to parse" in result_state["analysis"]["reasoning"]


@pytest.mark.asyncio
async def test_analyse_query_uses_correct_provider():
    """Test that analysis uses ORCHESTRATOR_ANALYSIS provider."""
    state: OrchestratorState = {
        "messages": [{"role": "user", "content": "Test"}],
        "analysis": {},
        "route": "",
        "result": None,
        "session_id": "test-session",
    }

    mock_result = LLMCallResult(
        content='{"intent": "META_QUESTION", "confidence": 0.9, "reasoning": "Test"}',
        model="claude-3-5-sonnet",
        tokens_input=100,
        tokens_output=50,
        cost=0.001,
    )

    with patch("src.agents.orchestrator.ProviderFactory.for_role") as mock_factory:
        mock_provider = AsyncMock()
        mock_provider.complete = AsyncMock(return_value=mock_result)
        mock_factory.return_value = mock_provider

        await analyse_query(state)

        # Verify correct role requested
        from src.llm.provider_factory import AgentRole

        mock_factory.assert_called_once_with(AgentRole.ORCHESTRATOR_ANALYSIS)
