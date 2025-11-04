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

        # Map node names to agent IDs (based on worker agent implementations)
        node_to_agent = {
            "guide": "orchestrator",  # Orchestrator guide mode
            "delegate_hybrid": "technical",  # Hybrid agent → TECHNICAL (complex questions)
            "delegate_rag": "technical",  # RAG agent → TECHNICAL (domain questions)
            "delegate_billing": "billing",  # CAG agent → BILLING (pricing questions)
            "delegate_policy": "policy",  # CAG agent → POLICY (policy questions)
            "delegate_direct": "orchestrator",  # Direct agent → ORCHESTRATOR (simple chat)
        }

        # Track what we've emitted
        emitted_orchestrator_start = False
        emitted_orchestrator_complete = False
        emitted_worker_start = False
        responding_agent = None
        final_state = None

        try:
            # Stream events from LangGraph - this executes the graph in real-time
            async for event in orchestrator.astream_events(state, version="v2"):
                event_type = event.get("event")
                event_name = event.get("name", "")

                # Debug logging to understand event structure
                if event_name in [
                    "guide",
                    "delegate_hybrid",
                    "delegate_rag",
                    "delegate_billing",
                    "delegate_policy",
                    "delegate_direct",
                    "__end__",
                ]:
                    logger.info(
                        f"Event: type={event_type}, name={event_name}, keys={list(event.keys())}"
                    )

                # Emit agent_status when orchestrator analysis starts
                if (
                    event_type == "on_chain_start"
                    and event_name == "analyse"
                    and not emitted_orchestrator_start
                ):
                    logger.info("Orchestrator analysis started")
                    agent_status_event = {
                        "agent": "orchestrator",
                        "status": "active",
                    }
                    yield format_event("agent_status", agent_status_event)
                    emitted_orchestrator_start = True

                # Detect when orchestrator finishes routing and delegate/guide starts
                elif (
                    event_type == "on_chain_start"
                    and event_name in node_to_agent
                    and not emitted_worker_start
                ):
                    # Get the agent from mapping - now works for ALL nodes including billing/policy
                    responding_agent = node_to_agent[event_name]
                    logger.info(f"Node {event_name} started, agent: {responding_agent}")

                    # If it's NOT orchestrator answering directly, mark orchestrator complete
                    if responding_agent != "orchestrator":
                        if not emitted_orchestrator_complete:
                            logger.info("Orchestrator routing complete")
                            orchestrator_complete_event = {
                                "agent": "orchestrator",
                                "status": "complete",
                            }
                            yield format_event("agent_status", orchestrator_complete_event)
                            emitted_orchestrator_complete = True

                        # Mark worker agent as active
                        logger.info(f"Worker agent {responding_agent} is now active")
                        worker_agent_status_event = {
                            "agent": responding_agent,
                            "status": "active",
                        }
                        yield format_event("agent_status", worker_agent_status_event)
                        emitted_worker_start = True

                # Capture final state when a delegate/guide node completes
                elif event_type == "on_chain_end" and event_name in node_to_agent:
                    logger.info(f"on_chain_end event for {event_name}")
                    # Extract state from the node's output
                    if "data" in event and "output" in event["data"]:
                        final_state = event["data"]["output"]
                        logger.info(f"Captured final state from {event_name} node completion")

            # If we didn't capture final state from events, fall back to getting result
            if final_state is None:
                logger.warning("Final state not captured from events, using stored state")
                final_state = state

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

        # Type assertion for mypy
        assert isinstance(result, ChatResponse)

        # Use the responding_agent we captured during streaming
        if responding_agent is None:
            # This should not happen with split nodes, but fallback just in case
            responding_agent = result.agent.value
            logger.warning(
                f"Responding agent not captured during streaming, using result: {responding_agent}"
            )

        logger.info(f"Streaming response from agent: {responding_agent}")

        # Emit message chunks (split response into words for streaming effect)
        words = result.message.split()
        for word in words:
            chunk_event = {
                "content": word + " ",
            }
            yield format_event("message_chunk", chunk_event)

        # Mark the responding agent as complete now that response is done
        responding_agent_complete_event = {
            "agent": responding_agent,
            "status": "complete",
        }
        yield format_event("agent_status", responding_agent_complete_event)
        logger.info(f"Agent {responding_agent} marked as complete")

        # Emit done event with complete response
        # NOTE: We don't include agent_status here because we've been emitting
        # individual agent_status events throughout the stream. Including it here
        # would overwrite our carefully timed status updates.
        done_event = {
            "message": result.message,
            "logs": [log.model_dump() for log in result.logs],
            "metadata": {
                **result.metrics.model_dump(),
                "agent": result.agent.value,
                "confidence": result.confidence,
            },
        }
        yield format_event("done", done_event)
