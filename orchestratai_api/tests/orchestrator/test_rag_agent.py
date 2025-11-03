"""Tests for RAG agent retrieval workflow."""

from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from langchain_core.documents import Document

from src.agents.workers.rag_agent import RAGAgent
from src.llm.provider_factory import AgentRole
from src.llm.types import LLMCallResult
from src.models.enums import AgentId, LogType
from src.models.schemas import ChatRequest


@pytest.mark.asyncio
async def test_rag_agent_retrieval_workflow():
    """Test complete RAG workflow: retrieve, assemble context, generate."""
    # Mock documents
    mock_docs = [
        (
            Document(page_content="RAG stands for Retrieval-Augmented Generation", metadata={"source": "doc1.pdf"}),
            0.1,
        ),  # Low distance = high similarity
        (
            Document(page_content="It combines retrieval with generation", metadata={"source": "doc2.pdf"}),
            0.15,
        ),
    ]

    # Mock vector store
    mock_vector_store = AsyncMock()
    mock_vector_store.similarity_search_with_scores = AsyncMock(return_value=mock_docs)

    # Mock LLM response
    mock_llm_result = LLMCallResult(
        content="RAG (Retrieval-Augmented Generation) is a technique that enhances LLMs by retrieving relevant documents.",
        model="gpt-4-turbo",
        tokens_input=150,
        tokens_output=30,
        cost=0.005,
    )

    mock_provider = AsyncMock()
    mock_provider.complete = AsyncMock(return_value=mock_llm_result)

    # Create RAG agent
    agent = RAGAgent(provider=mock_provider, vector_store=mock_vector_store, top_k=2)

    # Build request
    request = ChatRequest(message="What is RAG?", session_id="550e8400-e29b-41d4-a716-446655440000")

    # Execute
    response = await agent.run(request)

    # Verify vector search called
    mock_vector_store.similarity_search_with_scores.assert_called_once_with(query="What is RAG?", k=2)

    # Verify provider called with context
    mock_provider.complete.assert_called_once()
    call_messages = mock_provider.complete.call_args.kwargs["messages"]
    assert len(call_messages) == 2
    assert call_messages[0]["role"] == "system"
    assert "helpful AI assistant" in call_messages[0]["content"]
    assert "Context:" in call_messages[1]["content"]
    assert "RAG stands for" in call_messages[1]["content"]

    # Verify response structure
    assert response.message == mock_llm_result.content
    assert response.agent == AgentId.TECHNICAL
    assert response.confidence == 0.85

    # Verify retrieval logs
    assert len(response.logs) == 1
    log = response.logs[0]
    assert log.type == LogType.VECTOR_SEARCH
    assert "Retrieved 2 documents" in log.title
    assert log.data["chunks_retrieved"] == 2
    assert log.data["collection"] == "knowledge_base_v1"

    # Verify chunks in log
    assert len(log.data["chunks"]) == 2
    assert log.data["chunks"][0]["source"] == "doc1.pdf"

    # Verify metrics
    assert response.metrics.tokensUsed == 180  # 150 + 30
    assert response.metrics.cost == 0.005


@pytest.mark.asyncio
async def test_rag_agent_records_metrics():
    """Test that RAG agent records comprehensive metrics."""
    mock_docs = [
        (Document(page_content="Test content", metadata={"source": "test.pdf"}), 0.2),
    ]

    mock_vector_store = AsyncMock()
    mock_vector_store.similarity_search_with_scores = AsyncMock(return_value=mock_docs)

    mock_llm_result = LLMCallResult(
        content="Test response",
        model="gpt-4-turbo",
        tokens_input=100,
        tokens_output=20,
        cost=0.003,
    )

    mock_provider = AsyncMock()
    mock_provider.complete = AsyncMock(return_value=mock_llm_result)

    agent = RAGAgent(provider=mock_provider, vector_store=mock_vector_store)
    request = ChatRequest(message="Test", session_id="550e8400-e29b-41d4-a716-446655440000")

    response = await agent.run(request)

    # Verify metrics populated
    assert response.metrics.tokensUsed == 120
    assert response.metrics.cost == 0.003
    assert response.metrics.latency >= 0  # Should record latency (may be 0 in mocked tests)
    assert response.metrics.cache_status == "none"

    # Verify retrieval latency in log
    log_data = response.logs[0].data
    assert "latency" in log_data
    assert log_data["latency"] >= 0


@pytest.mark.asyncio
async def test_rag_agent_similarity_score_conversion():
    """Test that ChromaDB distance scores are converted to similarity."""
    # ChromaDB returns distance (lower = better)
    # We convert to similarity: 1.0 - (distance / 2.0)
    mock_docs = [
        (Document(page_content="Perfect match", metadata={"source": "doc1.pdf"}), 0.0),  # Distance 0 = similarity 1.0
        (Document(page_content="Good match", metadata={"source": "doc2.pdf"}), 0.5),  # Distance 0.5 = similarity 0.75
        (Document(page_content="Fair match", metadata={"source": "doc3.pdf"}), 1.0),  # Distance 1.0 = similarity 0.5
    ]

    mock_vector_store = AsyncMock()
    mock_vector_store.similarity_search_with_scores = AsyncMock(return_value=mock_docs)

    mock_provider = AsyncMock()
    mock_provider.complete = AsyncMock(
        return_value=LLMCallResult(
            content="Response",
            model="gpt-4-turbo",
            tokens_input=50,
            tokens_output=10,
            cost=0.001,
        )
    )

    agent = RAGAgent(provider=mock_provider, vector_store=mock_vector_store, top_k=3)
    request = ChatRequest(message="Test", session_id="550e8400-e29b-41d4-a716-446655440000")

    response = await agent.run(request)

    # Check converted similarities in chunks
    chunks = response.logs[0].data["chunks"]
    assert chunks[0]["similarity"] == 1.0  # Perfect match
    assert chunks[1]["similarity"] == 0.75  # Good match
    assert chunks[2]["similarity"] == 0.5  # Fair match


@pytest.mark.asyncio
async def test_rag_agent_with_no_documents():
    """Test RAG agent behavior when no documents retrieved."""
    mock_vector_store = AsyncMock()
    mock_vector_store.similarity_search_with_scores = AsyncMock(return_value=[])

    mock_provider = AsyncMock()
    mock_provider.complete = AsyncMock(
        return_value=LLMCallResult(
            content="I don't have relevant documents to answer that.",
            model="gpt-4-turbo",
            tokens_input=50,
            tokens_output=15,
            cost=0.001,
        )
    )

    agent = RAGAgent(provider=mock_provider, vector_store=mock_vector_store)
    request = ChatRequest(message="Unknown topic", session_id="550e8400-e29b-41d4-a716-446655440000")

    response = await agent.run(request)

    # Should still return valid response
    assert response.message == "I don't have relevant documents to answer that."
    assert len(response.logs) == 1
    assert response.logs[0].data["chunks_retrieved"] == 0


@pytest.mark.asyncio
async def test_rag_agent_uses_correct_role():
    """Test that RAG agent is initialized with RAG role."""
    mock_vector_store = AsyncMock()
    mock_provider = AsyncMock()

    agent = RAGAgent(provider=mock_provider, vector_store=mock_vector_store)

    assert agent.role == AgentRole.RAG
