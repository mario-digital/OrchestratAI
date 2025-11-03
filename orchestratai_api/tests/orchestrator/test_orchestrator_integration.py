"""Integration tests for end-to-end orchestrator workflows."""

import os
import tempfile
from typing import Any
from unittest.mock import AsyncMock, patch

import pytest
import pytest_asyncio
from langchain_core.documents import Document

from src.agents.orchestrator import build_orchestrator_graph
from src.cache.redis_cache import RedisSemanticCache
from src.llm.types import LLMCallResult
from src.models.enums import AgentId, AgentStatus, LogType
from src.models.schemas import ChatRequest
from src.retrieval.chroma_store import ChromaVectorStore
from src.services.agent_service import AgentService


@pytest.fixture
def mock_cache() -> AsyncMock:
    """Create mock Redis cache."""
    cache = AsyncMock(spec=RedisSemanticCache)
    cache.get = AsyncMock(return_value=(None, 0.0))  # Default: cache miss
    cache.set = AsyncMock()
    return cache


@pytest_asyncio.fixture
async def temp_vector_store() -> Any:
    """Create temporary ChromaDB for testing."""
    with tempfile.TemporaryDirectory() as tmpdir:
        # Use fake embeddings for tests
        os.environ["USE_FAKE_EMBEDDINGS"] = "true"

        vector_store = ChromaVectorStore(
            persist_directory=tmpdir,
            collection_name="test_collection",
        )

        # Seed with test documents
        test_docs = [
            Document(
                page_content=(
                    "RAG stands for Retrieval-Augmented Generation. "
                    "It's a technique that combines information retrieval with text generation."
                ),
                metadata={"source": "rag_basics.pdf", "page": 1},
            ),
            Document(
                page_content=(
                    "Vector databases store embeddings and enable similarity search. "
                    "ChromaDB is a popular vector database."
                ),
                metadata={"source": "vector_db_guide.pdf", "page": 1},
            ),
            Document(
                page_content=(
                    "LangGraph is a framework for building agent workflows "
                    "with state management and routing."
                ),
                metadata={"source": "langgraph_docs.pdf", "page": 1},
            ),
        ]

        await vector_store.add_documents(documents=test_docs)

        yield vector_store

        # Cleanup
        await vector_store.clear()
        os.environ.pop("USE_FAKE_EMBEDDINGS", None)


@pytest.mark.asyncio
async def test_guide_mode_end_to_end(temp_vector_store, mock_cache):
    """Test guide mode: meta question handled by orchestrator directly."""
    # Mock orchestrator providers
    analysis_result = LLMCallResult(
        content=(
            '{"intent": "META_QUESTION", "confidence": 0.95, '
            '"reasoning": "User asking about capabilities"}'
        ),
        model="claude-3-5-sonnet",
        tokens_input=100,
        tokens_output=50,
        cost=0.001,
    )

    guide_result = LLMCallResult(
        content=(
            "I can help you with document search, technical questions, "
            "and general information retrieval using RAG."
        ),
        model="claude-3-haiku",
        tokens_input=50,
        tokens_output=30,
        cost=0.0005,
    )

    with (
        patch("src.agents.orchestrator.ProviderFactory.for_role") as mock_factory,
    ):

        def get_mock_provider(role):
            from src.llm.provider_factory import AgentRole

            mock_provider = AsyncMock()
            if role == AgentRole.ORCHESTRATOR_ANALYSIS:
                mock_provider.complete = AsyncMock(return_value=analysis_result)
            elif role == AgentRole.ORCHESTRATOR_GUIDE:
                mock_provider.complete = AsyncMock(return_value=guide_result)
            return mock_provider

        mock_factory.side_effect = get_mock_provider

        # Build orchestrator
        orchestrator = build_orchestrator_graph(
            vector_store=temp_vector_store, cache=mock_cache
        )

        # Execute guide mode query
        initial_state = {
            "messages": [{"role": "user", "content": "What can you help with?"}],
            "analysis": {},
            "route": "",
            "result": None,
            "session_id": "550e8400-e29b-41d4-a716-446655440000",
        }

        final_state = await orchestrator.ainvoke(initial_state)

        # Verify result (route is set internally but not always persisted by LangGraph)
        result = final_state["result"]
        assert result is not None
        assert result.agent == AgentId.ORCHESTRATOR
        assert "help you with" in result.message.lower()

        # Verify no worker invoked (only routing log)
        assert len(result.logs) == 1
        assert result.logs[0].type == LogType.ROUTING
        assert "guide mode" in result.logs[0].title.lower()

        # Verify agent status
        assert result.agent_status[AgentId.ORCHESTRATOR] == AgentStatus.COMPLETE
        assert result.agent_status[AgentId.TECHNICAL] == AgentStatus.IDLE


@pytest.mark.asyncio
async def test_delegate_mode_rag_end_to_end(temp_vector_store, mock_cache):
    """Test delegate mode: domain question routed to RAG agent."""
    # Mock orchestrator analysis
    analysis_result = LLMCallResult(
        content=(
            '{"intent": "DOMAIN_QUESTION", "confidence": 0.92, '
            '"reasoning": "Requires domain knowledge"}'
        ),
        model="claude-3-5-sonnet",
        tokens_input=100,
        tokens_output=50,
        cost=0.001,
    )

    # Mock RAG generation
    rag_result = LLMCallResult(
        content=(
            "Based on the retrieved documents, RAG (Retrieval-Augmented Generation) "
            "combines retrieval with generation."
        ),
        model="gpt-4-turbo",
        tokens_input=200,
        tokens_output=40,
        cost=0.006,
    )

    with (
        patch("src.agents.orchestrator.ProviderFactory.for_role") as mock_factory,
    ):

        def get_mock_provider(role):
            from src.llm.provider_factory import AgentRole

            mock_provider = AsyncMock()
            if role == AgentRole.ORCHESTRATOR_ANALYSIS:
                mock_provider.complete = AsyncMock(return_value=analysis_result)
            elif role == AgentRole.RAG:
                mock_provider.complete = AsyncMock(return_value=rag_result)
            return mock_provider

        mock_factory.side_effect = get_mock_provider

        # Build orchestrator
        orchestrator = build_orchestrator_graph(
            vector_store=temp_vector_store, cache=mock_cache
        )

        # Execute delegate mode query
        initial_state = {
            "messages": [{"role": "user", "content": "What is RAG?"}],
            "analysis": {},
            "route": "",
            "result": None,
            "session_id": "550e8400-e29b-41d4-a716-446655440001",
        }

        final_state = await orchestrator.ainvoke(initial_state)

        # Verify result (route is set internally but not always persisted by LangGraph)
        result = final_state["result"]
        assert result is not None
        assert result.agent == AgentId.TECHNICAL  # RAG uses TECHNICAL

        # Verify RAG invoked (routing log + vector search log)
        assert len(result.logs) >= 2
        assert result.logs[0].type == LogType.ROUTING
        assert "RAG agent" in result.logs[0].title

        # Find vector search log
        vector_logs = [log for log in result.logs if log.type == LogType.VECTOR_SEARCH]
        assert len(vector_logs) == 1
        assert vector_logs[0].data["chunks_retrieved"] > 0

        # Verify agent status
        assert result.agent_status[AgentId.TECHNICAL] == AgentStatus.COMPLETE


@pytest.mark.asyncio
async def test_agent_service_integration(temp_vector_store, mock_cache):
    """Test AgentService bridge layer."""
    # Mock providers
    analysis_result = LLMCallResult(
        content='{"intent": "DOMAIN_QUESTION", "confidence": 0.9, "reasoning": "Test"}',
        model="claude-3-5-sonnet",
        tokens_input=100,
        tokens_output=50,
        cost=0.001,
    )

    rag_result = LLMCallResult(
        content="Test response from RAG",
        model="gpt-4-turbo",
        tokens_input=150,
        tokens_output=25,
        cost=0.004,
    )

    with patch("src.agents.orchestrator.ProviderFactory.for_role") as mock_factory, patch(
        "src.services.agent_service.RedisSemanticCache", return_value=mock_cache
    ):

        def get_mock_provider(role):
            from src.llm.provider_factory import AgentRole

            mock_provider = AsyncMock()
            if role == AgentRole.ORCHESTRATOR_ANALYSIS:
                mock_provider.complete = AsyncMock(return_value=analysis_result)
            elif role == AgentRole.RAG:
                mock_provider.complete = AsyncMock(return_value=rag_result)
            return mock_provider

        mock_factory.side_effect = get_mock_provider

        # Create service
        service = AgentService(vector_store=temp_vector_store)

        # Build request
        request = ChatRequest(
            message="What is RAG?", session_id="550e8400-e29b-41d4-a716-446655440000"
        )

        # Process
        response = await service.process_chat(request)

        # Verify response structure matches ChatResponse schema
        assert response.message == "Test response from RAG"
        assert response.agent == AgentId.TECHNICAL
        assert isinstance(response.confidence, float)
        assert len(response.logs) >= 1
        assert response.metrics.tokensUsed > 0
        assert response.metrics.cost > 0


@pytest.mark.asyncio
async def test_streaming_integration(temp_vector_store, mock_cache):
    """Test SSE streaming through agent service."""
    analysis_result = LLMCallResult(
        content='{"intent": "META_QUESTION", "confidence": 0.95, "reasoning": "Test"}',
        model="claude-3-5-sonnet",
        tokens_input=100,
        tokens_output=50,
        cost=0.001,
    )

    guide_result = LLMCallResult(
        content="I can help with test queries",
        model="claude-3-haiku",
        tokens_input=50,
        tokens_output=10,
        cost=0.0005,
    )

    with patch("src.agents.orchestrator.ProviderFactory.for_role") as mock_factory, patch(
        "src.services.agent_service.RedisSemanticCache", return_value=mock_cache
    ):

        def get_mock_provider(role):
            from src.llm.provider_factory import AgentRole

            mock_provider = AsyncMock()
            if role == AgentRole.ORCHESTRATOR_ANALYSIS:
                mock_provider.complete = AsyncMock(return_value=analysis_result)
            elif role == AgentRole.ORCHESTRATOR_GUIDE:
                mock_provider.complete = AsyncMock(return_value=guide_result)
            return mock_provider

        mock_factory.side_effect = get_mock_provider

        # Create service
        service = AgentService(vector_store=temp_vector_store)

        # Build request
        request = ChatRequest(
            message="What can you do?", session_id="550e8400-e29b-41d4-a716-446655440000"
        )

        # Collect streamed events
        events = []
        async for event in service.process_chat_stream(request):
            events.append(event)

        # Verify events streamed
        assert len(events) > 0

        # Verify event types
        import json

        event_types = []
        for event in events:
            if event.startswith("data: "):
                data = json.loads(event[6:])
                event_types.append(data.get("type"))

        # Should have agent_status, message_chunk, and done events
        assert "agent_status" in event_types
        assert "message_chunk" in event_types
        assert "done" in event_types
