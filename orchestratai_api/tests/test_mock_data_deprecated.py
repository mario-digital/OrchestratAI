"""Minimal tests for deprecated mock_data module.

This module is obsolete after implementing the real LangGraph orchestrator,
but we keep minimal tests to maintain coverage threshold until it's fully removed.
"""

from src.services.mock_data import generate_mock_response


def test_generate_mock_response_billing():
    """Test mock response generation for billing queries."""
    response = generate_mock_response("billing question")
    assert response is not None
    assert response.message is not None
    assert len(response.message) > 0


def test_generate_mock_response_technical():
    """Test mock response generation for technical queries."""
    response = generate_mock_response("technical question")
    assert response is not None
    assert response.message is not None


def test_generate_mock_response_policy():
    """Test mock response generation for policy queries."""
    response = generate_mock_response("policy question")
    assert response is not None
    assert response.message is not None


def test_generate_mock_response_orchestrator():
    """Test mock response generation for orchestrator queries."""
    response = generate_mock_response("what can you help with")
    assert response is not None
    assert response.message is not None


def test_mock_response_has_required_fields():
    """Test that mock response has all required fields."""
    response = generate_mock_response("test")
    assert response.agent is not None
    assert response.confidence > 0
    assert response.logs is not None
    assert response.metrics is not None
    assert response.agent_status is not None
