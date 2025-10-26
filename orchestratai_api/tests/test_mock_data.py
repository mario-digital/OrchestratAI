"""
Unit tests for mock data service.

Tests keyword routing, response generation, and field validation.
"""

import pytest

from src.models.enums import AgentId, LogStatus, LogType
from src.services.mock_data import (
    generate_mock_response,
    generate_mock_retrieval_logs,
    route_message,
)


class TestRouting:
    """Test message routing logic."""

    def test_billing_keyword_price(self):
        """Test routing with 'price' keyword."""
        assert route_message("What is the price of your service?") == AgentId.BILLING

    def test_billing_keyword_billing(self):
        """Test routing with 'billing' keyword."""
        assert route_message("I have a billing question") == AgentId.BILLING

    def test_billing_keyword_cost(self):
        """Test routing with 'cost' keyword."""
        assert route_message("How much does it cost?") == AgentId.BILLING

    def test_billing_keyword_subscription(self):
        """Test routing with 'subscription' keyword."""
        assert route_message("I want to cancel my subscription") == AgentId.BILLING

    def test_billing_keyword_pay(self):
        """Test routing with 'pay' keyword."""
        assert route_message("How do I pay for this?") == AgentId.BILLING

    def test_billing_keyword_plan(self):
        """Test routing with 'plan' keyword."""
        assert route_message("What plan should I choose?") == AgentId.BILLING

    def test_technical_keyword_error(self):
        """Test routing with 'error' keyword."""
        assert route_message("I'm getting an error message") == AgentId.TECHNICAL

    def test_technical_keyword_bug(self):
        """Test routing with 'bug' keyword."""
        assert route_message("I found a bug in the application") == AgentId.TECHNICAL

    def test_technical_keyword_technical(self):
        """Test routing with 'technical' keyword."""
        assert route_message("I need technical support") == AgentId.TECHNICAL

    def test_technical_keyword_api(self):
        """Test routing with 'api' keyword."""
        assert route_message("The API is not responding") == AgentId.TECHNICAL

    def test_technical_keyword_sdk(self):
        """Test routing with 'sdk' keyword."""
        assert route_message("SDK integration help needed") == AgentId.TECHNICAL

    def test_policy_keyword_policy(self):
        """Test routing with 'policy' keyword."""
        assert route_message("What is your privacy policy?") == AgentId.POLICY

    def test_policy_keyword_refund(self):
        """Test routing with 'refund' keyword."""
        assert route_message("I want a refund") == AgentId.POLICY

    def test_policy_keyword_terms(self):
        """Test routing with 'terms' keyword."""
        assert route_message("Show me the terms of service") == AgentId.POLICY

    def test_policy_keyword_cancel(self):
        """Test routing with 'cancel' keyword."""
        assert route_message("How do I cancel my account?") == AgentId.POLICY

    def test_policy_keyword_privacy(self):
        """Test routing with 'privacy' keyword."""
        assert route_message("Privacy concerns about my data") == AgentId.POLICY

    def test_orchestrator_fallback_generic(self):
        """Test orchestrator fallback for generic message."""
        assert route_message("Hello, how are you?") == AgentId.ORCHESTRATOR

    def test_orchestrator_fallback_ambiguous(self):
        """Test orchestrator fallback for ambiguous message."""
        assert route_message("I need help with something") == AgentId.ORCHESTRATOR

    def test_routing_case_insensitive(self):
        """Test routing is case-insensitive."""
        assert route_message("BILLING QUESTION") == AgentId.BILLING
        assert route_message("Technical ERROR") == AgentId.TECHNICAL
        assert route_message("REFUND Policy") == AgentId.POLICY


class TestRetrievalLogs:
    """Test retrieval log generation."""

    def test_generates_correct_number_of_logs(self):
        """Test log count matches specification."""
        logs = generate_mock_retrieval_logs(AgentId.BILLING, num_logs=3)
        assert len(logs) == 3

    def test_generates_random_number_of_logs(self):
        """Test random log generation (2-4 logs)."""
        logs = generate_mock_retrieval_logs(AgentId.TECHNICAL)
        assert 2 <= len(logs) <= 4

    def test_first_log_is_routing(self):
        """Test first log is always routing type."""
        logs = generate_mock_retrieval_logs(AgentId.BILLING)
        assert logs[0].type == LogType.ROUTING

    def test_routing_log_contains_agent_data(self):
        """Test routing log includes agent information."""
        logs = generate_mock_retrieval_logs(AgentId.POLICY)
        assert logs[0].data["agent"] == AgentId.POLICY.value
        assert "confidence" in logs[0].data

    def test_all_logs_have_required_fields(self):
        """Test all logs contain required schema fields."""
        logs = generate_mock_retrieval_logs(AgentId.TECHNICAL)
        for log in logs:
            assert log.id is not None
            valid_types = [
                LogType.ROUTING,
                LogType.VECTOR_SEARCH,
                LogType.CACHE,
                LogType.DOCUMENTS,
            ]
            assert log.type in valid_types
            assert log.title is not None
            assert log.data is not None
            assert log.timestamp is not None
            assert log.status in [LogStatus.SUCCESS, LogStatus.WARNING, LogStatus.ERROR]

    def test_log_ids_are_unique(self):
        """Test each log has unique ID."""
        logs = generate_mock_retrieval_logs(AgentId.ORCHESTRATOR, num_logs=4)
        log_ids = [log.id for log in logs]
        assert len(log_ids) == len(set(log_ids))  # All unique


class TestMockResponse:
    """Test complete mock response generation."""

    def test_response_routes_to_billing(self):
        """Test billing routing generates billing response."""
        response = generate_mock_response("What are your prices?")
        assert response.agent == AgentId.BILLING

    def test_response_routes_to_technical(self):
        """Test technical routing generates technical response."""
        response = generate_mock_response("I found a bug")
        assert response.agent == AgentId.TECHNICAL

    def test_response_routes_to_policy(self):
        """Test policy routing generates policy response."""
        response = generate_mock_response("I need a refund")
        assert response.agent == AgentId.POLICY

    def test_response_routes_to_orchestrator(self):
        """Test orchestrator routing generates orchestrator response."""
        response = generate_mock_response("Hello there")
        assert response.agent == AgentId.ORCHESTRATOR

    def test_response_has_all_required_fields(self):
        """Test response contains all required schema fields."""
        response = generate_mock_response("Test message")
        assert response.message is not None
        assert response.agent is not None
        assert response.confidence is not None
        assert response.logs is not None
        assert response.metrics is not None

    def test_confidence_in_valid_range(self):
        """Test confidence score is between 0.0 and 1.0."""
        response = generate_mock_response("Test message")
        assert 0.0 <= response.confidence <= 1.0

    def test_specialized_agent_confidence_higher(self):
        """Test specialized agents have higher confidence than orchestrator."""
        # Run multiple times to account for randomness
        billing_confidences = [
            generate_mock_response("billing question").confidence for _ in range(10)
        ]
        orchestrator_confidences = [
            generate_mock_response("hello").confidence for _ in range(10)
        ]

        avg_billing = sum(billing_confidences) / len(billing_confidences)
        avg_orchestrator = sum(orchestrator_confidences) / len(orchestrator_confidences)

        assert avg_billing > avg_orchestrator

    def test_response_includes_logs(self):
        """Test response includes retrieval logs."""
        response = generate_mock_response("Test message")
        assert len(response.logs) >= 2
        assert len(response.logs) <= 4

    def test_metrics_tokens_in_range(self):
        """Test metrics tokensUsed is within expected range."""
        response = generate_mock_response("Test message")
        assert 200 <= response.metrics.tokensUsed <= 800

    def test_metrics_cost_in_range(self):
        """Test metrics cost is within expected range."""
        response = generate_mock_response("Test message")
        assert 0.001 <= response.metrics.cost <= 0.005

    def test_metrics_latency_in_range(self):
        """Test metrics latency is within expected range."""
        response = generate_mock_response("Test message")
        assert 800 <= response.metrics.latency <= 2000

    def test_metrics_fields_are_positive(self):
        """Test all metrics fields are positive numbers."""
        response = generate_mock_response("Test message")
        assert response.metrics.tokensUsed > 0
        assert response.metrics.cost > 0
        assert response.metrics.latency > 0

    def test_message_content_is_string(self):
        """Test response message is non-empty string."""
        response = generate_mock_response("Test message")
        assert isinstance(response.message, str)
        assert len(response.message) > 0

    def test_response_varies_across_calls(self):
        """Test responses are randomized (not identical each time)."""
        responses = [generate_mock_response("billing question") for _ in range(5)]
        messages = [r.message for r in responses]
        # At least some variation in responses
        assert len(set(messages)) > 1


class TestFieldValidation:
    """Test Pydantic field validation works correctly."""

    def test_confidence_not_above_one(self):
        """Test confidence cannot exceed 1.0."""
        # This should be caught by Pydantic validation
        from pydantic import ValidationError

        from src.models.schemas import ChatResponse

        with pytest.raises(ValidationError):
            ChatResponse(
                message="test",
                agent=AgentId.BILLING,
                confidence=1.5,  # Invalid
                logs=[],
                metrics={"tokensUsed": 100, "cost": 0.001, "latency": 1000},
            )

    def test_confidence_not_negative(self):
        """Test confidence cannot be negative."""
        from pydantic import ValidationError

        from src.models.schemas import ChatResponse

        with pytest.raises(ValidationError):
            ChatResponse(
                message="test",
                agent=AgentId.BILLING,
                confidence=-0.1,  # Invalid
                logs=[],
                metrics={"tokensUsed": 100, "cost": 0.001, "latency": 1000},
            )

    def test_generated_response_passes_validation(self):
        """Test generated mock responses pass Pydantic validation."""
        # Should not raise any exceptions
        response = generate_mock_response("Test message")
        assert response.model_validate(response.model_dump())
