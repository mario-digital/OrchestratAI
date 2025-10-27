"""
Unit tests for mock data service.

Tests keyword routing, response generation, and field validation.
"""

import pytest

from src.models.enums import AgentId, AgentStatus, LogStatus, LogType
from src.services.mock_data import (
    generate_cache_operation_log,
    generate_document_snippet,
    generate_mock_response,
    generate_mock_retrieval_logs,
    generate_query_analysis_log,
    generate_vector_search_log,
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

    def test_always_includes_query_analysis(self):
        """Test QueryAnalysis log is always present."""
        logs = generate_mock_retrieval_logs(AgentId.BILLING, "What are your prices?")
        assert len(logs) >= 1
        assert logs[0].type == LogType.ROUTING
        assert "intent" in logs[0].data
        assert "target_agent" in logs[0].data

    def test_first_log_is_routing(self):
        """Test first log is always routing type."""
        logs = generate_mock_retrieval_logs(AgentId.BILLING, "Test message")
        assert logs[0].type == LogType.ROUTING

    def test_routing_log_contains_query_analysis_data(self):
        """Test routing log includes QueryAnalysis fields."""
        logs = generate_mock_retrieval_logs(AgentId.POLICY, "Test message")
        query_log = logs[0]
        assert query_log.data["target_agent"] == AgentId.POLICY.value
        assert "intent" in query_log.data
        assert "confidence" in query_log.data
        assert "reasoning" in query_log.data

    def test_all_logs_have_required_fields(self):
        """Test all logs contain required schema fields."""
        logs = generate_mock_retrieval_logs(AgentId.TECHNICAL, "Test message")
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
        logs = generate_mock_retrieval_logs(AgentId.ORCHESTRATOR, "Test message")
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
        assert len(response.logs) >= 1  # At least QueryAnalysis
        # Can have 1-3 logs: QueryAnalysis (always) + VectorSearch (80%) + CacheOp (50%)

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

    def test_response_includes_agent_status(self):
        """Test response includes agent_status for all 4 agents."""
        response = generate_mock_response("What are your prices?")
        assert "agent_status" in response.model_dump()
        agent_status = response.agent_status
        assert AgentId.ORCHESTRATOR in agent_status
        assert AgentId.BILLING in agent_status
        assert AgentId.TECHNICAL in agent_status
        assert AgentId.POLICY in agent_status

    def test_selected_agent_has_complete_status(self):
        """Test that the selected agent has COMPLETE status."""
        response = generate_mock_response("Billing question")
        assert response.agent == AgentId.BILLING
        assert response.agent_status[AgentId.BILLING] == AgentStatus.COMPLETE

    def test_orchestrator_has_idle_status(self):
        """Test that orchestrator always has IDLE status when another agent is selected."""
        response = generate_mock_response("What are your prices?")  # Routes to BILLING
        assert response.agent_status[AgentId.ORCHESTRATOR] == AgentStatus.IDLE

    def test_cache_status_in_metrics(self):
        """Test that cache_status is included in metrics."""
        response = generate_mock_response("Test message")
        assert hasattr(response.metrics, "cache_status")
        assert response.metrics.cache_status in ["hit", "miss", "none"]


class TestQueryAnalysisLog:
    """Test QueryAnalysis log generation."""

    def test_generate_query_analysis_log_for_billing(self):
        """Test QueryAnalysis log for billing agent."""
        log = generate_query_analysis_log(AgentId.BILLING, "Test message")
        assert log.type == LogType.ROUTING
        assert log.data["intent"] == "Billing inquiry detected"
        assert log.data["target_agent"] == AgentId.BILLING.value
        assert "reasoning" in log.data
        assert 0.85 <= log.data["confidence"] <= 0.99

    def test_generate_query_analysis_log_for_technical(self):
        """Test QueryAnalysis log for technical agent."""
        log = generate_query_analysis_log(AgentId.TECHNICAL, "Test message")
        assert log.data["intent"] == "Technical support request detected"
        assert log.data["target_agent"] == AgentId.TECHNICAL.value

    def test_generate_query_analysis_log_for_policy(self):
        """Test QueryAnalysis log for policy agent."""
        log = generate_query_analysis_log(AgentId.POLICY, "Test message")
        assert log.data["intent"] == "Policy question detected"
        assert log.data["target_agent"] == AgentId.POLICY.value

    def test_generate_query_analysis_log_for_orchestrator(self):
        """Test QueryAnalysis log for orchestrator agent."""
        log = generate_query_analysis_log(AgentId.ORCHESTRATOR, "Test message")
        assert log.data["intent"] == "General inquiry detected"
        assert log.data["target_agent"] == AgentId.ORCHESTRATOR.value


class TestVectorSearchLog:
    """Test VectorSearch log generation."""

    def test_generate_vector_search_log_returns_chunks(self):
        """Test VectorSearch log includes document chunks."""
        log = generate_vector_search_log(AgentId.BILLING)
        assert log.type == LogType.VECTOR_SEARCH
        assert 3 <= log.data["chunks_retrieved"] <= 7
        assert len(log.data["chunks"]) == log.data["chunks_retrieved"]

    def test_document_chunks_have_realistic_content(self):
        """Test document chunks contain technical content, not Lorem."""
        log = generate_vector_search_log(AgentId.BILLING)
        for chunk in log.data["chunks"]:
            content = chunk["content"]
            assert len(content) > 50  # Substantial content
            assert "lorem" not in content.lower()  # No placeholder text

    def test_document_chunks_have_similarity_scores(self):
        """Test document chunks have similarity scores in valid range."""
        log = generate_vector_search_log(AgentId.TECHNICAL)
        for chunk in log.data["chunks"]:
            assert 0.75 <= chunk["similarity"] <= 0.95

    def test_vector_search_uses_domain_specific_files(self):
        """Test vector search uses files matching agent domain."""
        log = generate_vector_search_log(AgentId.BILLING)
        sources = [chunk["source"] for chunk in log.data["chunks"]]
        # Check that at least one source is billing-related
        billing_files = ["pricing_faq.md", "subscription_guide.md", "payment_methods.md"]
        assert any(source in billing_files for source in sources)

    def test_vector_search_includes_latency(self):
        """Test VectorSearch log includes latency metric."""
        log = generate_vector_search_log(AgentId.POLICY)
        assert "latency" in log.data
        assert 50 <= log.data["latency"] <= 300


class TestCacheOperationLog:
    """Test CacheOperation log generation."""

    def test_generate_cache_operation_log_returns_hit_or_miss(self):
        """Test CacheOperation log returns valid hit/miss status."""
        log = generate_cache_operation_log()
        assert log.type == LogType.CACHE
        assert log.data["status"] in ["hit", "miss"]

    def test_cache_operation_includes_hit_rate(self):
        """Test CacheOperation log includes hit_rate metric."""
        log = generate_cache_operation_log()
        assert "hit_rate" in log.data
        assert 0.60 <= log.data["hit_rate"] <= 0.90

    def test_cache_operation_includes_size(self):
        """Test CacheOperation log includes size metric."""
        log = generate_cache_operation_log()
        assert "size" in log.data
        assert "MB" in log.data["size"]

    def test_cache_hit_has_success_status(self):
        """Test cache hit results in SUCCESS status."""
        # Run multiple times to ensure we get a hit
        for _ in range(20):
            log = generate_cache_operation_log()
            if log.data["status"] == "hit":
                assert log.status == LogStatus.SUCCESS
                break

    def test_cache_miss_has_warning_status(self):
        """Test cache miss results in WARNING status."""
        # Run multiple times to ensure we get a miss
        for _ in range(20):
            log = generate_cache_operation_log()
            if log.data["status"] == "miss":
                assert log.status == LogStatus.WARNING
                break


class TestDocumentSnippet:
    """Test document snippet generation."""

    def test_generate_document_snippet_for_pricing_faq(self):
        """Test snippet generation for pricing FAQ."""
        snippet = generate_document_snippet("pricing_faq.md")
        assert len(snippet) > 50
        assert "lorem" not in snippet.lower()

    def test_generate_document_snippet_for_api_docs(self):
        """Test snippet generation for API documentation."""
        snippet = generate_document_snippet("api_documentation.md")
        assert len(snippet) > 50
        assert any(word in snippet.lower() for word in ["api", "endpoint", "authentication"])

    def test_generate_document_snippet_for_refund_policy(self):
        """Test snippet generation for refund policy."""
        snippet = generate_document_snippet("refund_policy.md")
        assert len(snippet) > 50
        assert any(word in snippet.lower() for word in ["refund", "customer", "account"])

    def test_generate_document_snippet_truncates_long_content(self):
        """Test snippet is truncated to 200 characters max."""
        snippet = generate_document_snippet("pricing_faq.md")
        assert len(snippet) <= 200

    def test_generate_document_snippet_fallback(self):
        """Test fallback content for unknown files."""
        snippet = generate_document_snippet("unknown_file.md")
        assert len(snippet) > 0
        assert "Documentation content" in snippet
