"""Tests for orchestrator routing decision logic."""

import pytest

from src.agents.orchestrator import (
    DOMAIN_QUESTION,
    META_QUESTION,
    POLICY_QUESTION,
    OrchestratorState,
    decide_route,
)


def test_decide_route_meta_question():
    """Test that META_QUESTION routes to guide mode."""
    state: OrchestratorState = {
        "messages": [{"role": "user", "content": "What can you help with?"}],
        "analysis": {
            "intent": META_QUESTION,
            "confidence": 0.95,
            "reasoning": "User asking about capabilities",
        },
        "route": "",
        "result": None,
        "session_id": "test-session",
    }

    route = decide_route(state)

    assert route == "guide"
    assert state["route"] == "guide"


def test_decide_route_domain_question():
    """Test that DOMAIN_QUESTION routes to delegate mode."""
    state: OrchestratorState = {
        "messages": [{"role": "user", "content": "What is RAG?"}],
        "analysis": {
            "intent": DOMAIN_QUESTION,
            "confidence": 0.92,
            "reasoning": "User asking for domain knowledge",
        },
        "route": "",
        "result": None,
        "session_id": "test-session",
    }

    route = decide_route(state)

    assert route == "delegate"
    assert state["route"] == "delegate"


def test_decide_route_policy_question():
    """Test that POLICY_QUESTION routes to delegate mode."""
    state: OrchestratorState = {
        "messages": [{"role": "user", "content": "What is your privacy policy?"}],
        "analysis": {
            "intent": POLICY_QUESTION,
            "confidence": 0.88,
            "reasoning": "User asking about policies",
        },
        "route": "",
        "result": None,
        "session_id": "test-session",
    }

    route = decide_route(state)

    assert route == "delegate"
    assert state["route"] == "delegate"


def test_decide_route_missing_intent():
    """Test fallback behavior when intent is missing."""
    state: OrchestratorState = {
        "messages": [{"role": "user", "content": "Hello"}],
        "analysis": {},  # Missing intent
        "route": "",
        "result": None,
        "session_id": "test-session",
    }

    route = decide_route(state)

    # Should default to delegate when intent is missing
    assert route == "delegate"
    assert state["route"] == "delegate"


def test_decide_route_preserves_state():
    """Test that decide_route doesn't modify other state fields."""
    state: OrchestratorState = {
        "messages": [{"role": "user", "content": "Test"}],
        "analysis": {
            "intent": META_QUESTION,
            "confidence": 0.9,
            "reasoning": "Test",
        },
        "route": "",
        "result": None,
        "session_id": "test-session-123",
    }

    original_messages = state["messages"].copy()
    original_analysis = state["analysis"].copy()
    original_session = state["session_id"]

    decide_route(state)

    # Verify other fields unchanged
    assert state["messages"] == original_messages
    assert state["analysis"] == original_analysis
    assert state["session_id"] == original_session
    assert state["result"] is None
