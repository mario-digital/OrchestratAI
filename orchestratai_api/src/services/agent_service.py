"""Agent service bridge between HTTP and LangGraph orchestrator."""

import json
import logging
from collections.abc import AsyncIterator
from typing import Any

from src.agents.orchestrator import OrchestratorState, build_orchestrator_graph
from src.cache.redis_cache import RedisSemanticCache
from src.models.schemas import ChatRequest, ChatResponse
from src.retrieval.vector_store import VectorStore

logger = logging.getLogger(__name__)


class AgentService:
    """Service layer for orchestrator integration.

    Translates HTTP requests to LangGraph state and back.
    Handles both complete and streaming responses.
    """

    def __init__(self, *, vector_store: VectorStore):
        """Initialize agent service.

        Args:
            vector_store: Vector database for RAG agents
        """
        self.vector_store = vector_store
        self.cache = RedisSemanticCache()
        self._orchestrator: Any | None = None

    def _get_orchestrator(self) -> Any:
        """Lazy initialization of orchestrator graph.

        Returns:
            Compiled LangGraph orchestrator
        """
        if self._orchestrator is None:
            self._orchestrator = build_orchestrator_graph(
                vector_store=self.vector_store, cache=self.cache
            )
        return self._orchestrator

    async def process_chat(self, request: ChatRequest) -> ChatResponse:
        """Process chat request through orchestrator (non-streaming).

        Args:
            request: Incoming chat request

        Returns:
            Complete ChatResponse with all logs and metrics
        """
        orchestrator = self._get_orchestrator()

        # Build initial state
        state: OrchestratorState = {
            "messages": [{"role": "user", "content": request.message}],
            "analysis": {},
            "route": "",
            "result": None,
            "session_id": request.session_id,
            "attempted_agents": [],
            "error_message": None,
        }

        # Execute orchestrator workflow
        final_state = await orchestrator.ainvoke(state)

        # Extract result
        result = final_state.get("result")
        if result is None:
            msg = "Orchestrator failed to produce a result"
            raise RuntimeError(msg)

        # Type assertion for mypy
        assert isinstance(result, ChatResponse)
        return result

    async def process_chat_stream(self, request: ChatRequest) -> AsyncIterator[str]:
        """Process chat request with SSE streaming.

        Emits events in order:
        1. agent_status - When agents become active
        2. retrieval_log - When documents are retrieved
        3. message_chunk - Incremental response text
        4. done - Final complete response

        Args:
            request: Incoming chat request

        Yields:
            SSE-formatted event strings (data: {json}\\n\\n)
        """
        orchestrator = self._get_orchestrator()

        # Build initial state
        state: OrchestratorState = {
            "messages": [{"role": "user", "content": request.message}],
            "analysis": {},
            "route": "",
            "result": None,
            "session_id": request.session_id,
            "attempted_agents": [],
            "error_message": None,
        }

        # Helper to emit SSE events with proper event field
        def format_event(event_type: str, payload: dict[str, Any]) -> str:
            return f"event: {event_type}\ndata: {json.dumps(payload)}\n\n"

        # Track what we've emitted
        emitted_agent_status = False
        emitted_retrieval = False

        try:
            # Stream events from LangGraph
            async for event in orchestrator.astream_events(state, version="v2"):
                event_type = event.get("event")
                event_name = event.get("name", "")

                # Emit agent_status when analysis starts
                if (
                    event_type == "on_chain_start"
                    and event_name == "analyse"
                    and not emitted_agent_status
                ):
                    agent_status_event = {
                        "agent": "orchestrator",
                        "status": "active",
                    }
                    yield format_event("agent_status", agent_status_event)
                    emitted_agent_status = True

                # Emit retrieval_log when delegate node runs (indicates RAG)
                elif (
                    event_type == "on_chain_start"
                    and event_name == "delegate"
                    and not emitted_retrieval
                ):
                    retrieval_event = {
                        "log_type": "vector_search",
                        "message": "Searching knowledge base...",
                    }
                    yield format_event("retrieval_log", retrieval_event)
                    emitted_retrieval = True

                # Note: Actual message streaming requires provider.stream() integration
                # For now, we'll emit the complete response at the end

            # Execute to get final result
            final_state = await orchestrator.ainvoke(state)
            result = final_state.get("result")
        except Exception as exc:  # pragma: no cover - defensive path
            logger.exception("LangGraph streaming failed: %s", exc)
            error_event = {
                "message": "Agent orchestration failed",
                "code": "SERVER_ERROR",
                "retryable": False,
            }
            yield format_event("stream_error", error_event)
            # Stop streaming to keep the SSE pipe stable; upstream logger will capture
            return

        if result is None:
            msg = "Orchestrator failed to produce a result"
            raise RuntimeError(msg)

        # Emit message chunks (split response into words for streaming effect)
        words = result.message.split()
        for word in words:
            chunk_event = {
                "content": word + " ",
            }
            yield format_event("message_chunk", chunk_event)

        # Emit done event with complete response
        done_event = {
            "message": result.message,
            "logs": [log.model_dump() for log in result.logs],
            "agent_status": {
                key.value: status.value for key, status in result.agent_status.items()
            },
            "metadata": {
                **result.metrics.model_dump(),
                "agent": result.agent.value,
                "confidence": result.confidence,
            },
        }
        yield format_event("done", done_event)
