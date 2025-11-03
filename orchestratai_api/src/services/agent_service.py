"""Agent service bridge between HTTP and LangGraph orchestrator."""

import json
from collections.abc import AsyncIterator
from typing import Any

from src.agents.orchestrator import OrchestratorState, build_orchestrator_graph
from src.models.schemas import ChatRequest, ChatResponse
from src.retrieval.vector_store import VectorStore


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
        self._orchestrator: Any | None = None

    def _get_orchestrator(self) -> Any:
        """Lazy initialization of orchestrator graph.

        Returns:
            Compiled LangGraph orchestrator
        """
        if self._orchestrator is None:
            self._orchestrator = build_orchestrator_graph(vector_store=self.vector_store)
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
        }

        # Track what we've emitted
        emitted_agent_status = False
        emitted_retrieval = False

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
                    "type": "agent_status",
                    "agent": "orchestrator",
                    "status": "active",
                }
                yield f"data: {json.dumps(agent_status_event)}\n\n"
                emitted_agent_status = True

            # Emit retrieval_log when delegate node runs (indicates RAG)
            elif (
                event_type == "on_chain_start"
                and event_name == "delegate"
                and not emitted_retrieval
            ):
                retrieval_event = {
                    "type": "retrieval_log",
                    "log_type": "vector_search",
                    "message": "Searching knowledge base...",
                }
                yield f"data: {json.dumps(retrieval_event)}\n\n"
                emitted_retrieval = True

            # Note: Actual message streaming requires provider.stream() integration
            # For now, we'll emit the complete response at the end

        # Execute to get final result
        final_state = await orchestrator.ainvoke(state)
        result = final_state.get("result")

        if result is None:
            msg = "Orchestrator failed to produce a result"
            raise RuntimeError(msg)

        # Emit message chunks (split response into words for streaming effect)
        words = result.message.split()
        for word in words:
            chunk_event = {
                "type": "message_chunk",
                "content": word + " ",
            }
            yield f"data: {json.dumps(chunk_event)}\n\n"

        # Emit done event with complete response
        done_event = {
            "type": "done",
            "response": {
                "message": result.message,
                "agent": result.agent.value,
                "confidence": result.confidence,
                "logs": [log.model_dump() for log in result.logs],
                "metrics": result.metrics.model_dump(),
                "agent_status": {k.value: v.value for k, v in result.agent_status.items()},
            },
        }
        yield f"data: {json.dumps(done_event)}\n\n"
