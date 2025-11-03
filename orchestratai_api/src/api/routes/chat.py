"""
Chat endpoint for OrchestratAI

Handles POST /api/chat requests, routes through LangGraph orchestrator,
and returns real agent responses with RAG capabilities.
"""

import asyncio
import logging
import uuid
from collections.abc import AsyncGenerator
from datetime import datetime, timedelta
from typing import Any

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse

from src.models.schemas import ChatRequest, ChatResponse
from src.retrieval.chroma_store import ChromaVectorStore
from src.services.agent_service import AgentService

# Create router with /api prefix
router = APIRouter(prefix="/api", tags=["chat"])

# Logger for SSE streams
logger = logging.getLogger(__name__)

# In-memory stream session storage
# Production: Use Redis with TTL for distributed systems
stream_sessions: dict[str, dict[str, Any]] = {}


# Dependency: Agent service singleton
def get_agent_service() -> AgentService:
    """Get or create agent service instance.

    Returns:
        AgentService configured with ChromaVectorStore
    """
    if not hasattr(get_agent_service, "_instance"):
        vector_store = ChromaVectorStore()
        get_agent_service._instance = AgentService(vector_store=vector_store)
    return get_agent_service._instance


@router.post("/chat", response_model=ChatResponse)
async def chat(
    request: ChatRequest,
    agent_service: AgentService = Depends(get_agent_service),  # noqa: B008
) -> ChatResponse:
    """
    Process chat message through LangGraph orchestrator.

    Routes query through orchestrator with guide/delegate modes.
    Returns real agent response with RAG retrieval when needed.

    Args:
        request: ChatRequest containing message and session_id
        agent_service: Injected agent service instance

    Returns:
        ChatResponse with agent message, logs, and metrics

    Raises:
        422: Pydantic validation error for invalid request format
        500: Orchestrator execution error
    """
    # Process through orchestrator
    response = await agent_service.process_chat(request)
    return response


@router.post("/chat/stream")
async def chat_stream(
    request: ChatRequest,
    agent_service: AgentService = Depends(get_agent_service),  # noqa: B008
) -> StreamingResponse:
    """
    Stream chat response using Server-Sent Events (SSE) via LangGraph orchestrator.

    Returns real-time updates for agent status, message chunks, and retrieval logs.
    Streams four event types:
    - `agent_status`: Agent state updates (ROUTING, ACTIVE, COMPLETE)
    - `retrieval_log`: Log entries as they're generated
    - `message_chunk`: Partial message content (word-by-word streaming)
    - `done`: Stream completion signal with final metadata

    Args:
        request: ChatRequest containing message and session_id
        agent_service: Injected agent service instance

    Returns:
        StreamingResponse with text/event-stream content type

    Event Format:
        Each SSE event follows W3C format:
        ```
        event: {type}
        data: {json}

        ```

    Example Stream:
        ```
        event: agent_status
        data: {"agent": "ORCHESTRATOR", "status": "ROUTING"}

        event: message_chunk
        data: {"content": "Hello "}

        event: done
        data: {"session_id": "550e8400-...", "metadata": {...}}
        ```

    Note:
        - Connection closes cleanly after `done` event
        - Client disconnect handled gracefully (no errors logged)
        - Streams events from real LangGraph orchestrator
    """

    async def event_generator() -> AsyncGenerator[str, None]:
        """
        Generate SSE events from orchestrator stream.

        Yields SSE-formatted events from agent service.
        """
        try:
            # Stream from orchestrator
            async for event in agent_service.process_chat_stream(request):
                yield event

        except asyncio.CancelledError:
            # Client disconnected - log at INFO level (normal behavior)
            logger.info(f"Client disconnected from SSE stream (session: {request.session_id})")
            raise  # Re-raise to properly close connection

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",  # Disable nginx buffering
            "Connection": "keep-alive",
            "Access-Control-Allow-Origin": "http://localhost:3000",  # CORS for frontend
            "Access-Control-Allow-Credentials": "true",
        },
    )


@router.post("/chat/stream/initiate")
async def initiate_stream(request: ChatRequest) -> dict[str, str]:
    """
    Initiate a streaming session (Step 1 of two-step streaming).

    Security: Message is sent via POST body and stored server-side.
    The returned stream_id contains no sensitive information.

    Args:
        request: ChatRequest containing message and session_id

    Returns:
        dict with stream_id for use in GET /chat/stream/{stream_id}

    Example:
        POST /api/chat/stream/initiate
        Body: {"message": "Hello", "session_id": "abc-123"}
        Response: {"stream_id": "f47ac10b-58cc-4372-a567-0e02b2c3d479"}
    """
    # Generate unique stream ID
    stream_id = str(uuid.uuid4())

    # Store session data securely server-side
    # Message is NOT in the URL - only in this server-side storage
    stream_sessions[stream_id] = {
        "message": request.message,
        "session_id": str(request.session_id),
        "created_at": datetime.now(),
        "expires_at": datetime.now() + timedelta(minutes=5),  # 5-minute TTL
    }

    logger.info(f"Stream initiated: {stream_id} (session: {request.session_id})")

    return {"stream_id": stream_id}


@router.get("/chat/stream/{stream_id}")
async def stream_by_id(
    stream_id: str,
    agent_service: AgentService = Depends(get_agent_service),  # noqa: B008
) -> StreamingResponse:
    """
    Stream chat response by ID (Step 2 of two-step streaming) via LangGraph orchestrator.

    Security: Uses stream_id to retrieve message from server-side storage.
    Message never appears in URL or logs.

    Reconnection: EventSource can reconnect to this endpoint automatically.
    Each reconnection uses the same stream_id to resume/restart the stream.

    Args:
        stream_id: UUID from /chat/stream/initiate endpoint
        agent_service: Injected agent service instance

    Returns:
        StreamingResponse with SSE events

    Raises:
        404: Stream not found or expired

    Example:
        GET /api/chat/stream/f47ac10b-58cc-4372-a567-0e02b2c3d479
        (EventSource connects here with automatic reconnection)
    """
    # Retrieve session from storage
    session = stream_sessions.get(stream_id)

    if not session:
        logger.warning(f"Stream not found: {stream_id}")
        raise HTTPException(status_code=404, detail="Stream not found or expired")

    # Check if session has expired
    if session["expires_at"] < datetime.now():
        logger.warning(f"Stream expired: {stream_id}")
        del stream_sessions[stream_id]
        raise HTTPException(status_code=404, detail="Stream expired")

    # Retrieve message from secure storage (not from URL!)
    message = session["message"]
    session_id = session["session_id"]

    logger.info(f"Stream started: {stream_id} (session: {session_id})")

    async def event_generator() -> AsyncGenerator[str, None]:
        """
        Generate SSE events using stored message via orchestrator.

        Note: Message retrieved from server-side storage, never from URL.
        """
        try:
            # Build request from stored data
            request = ChatRequest(message=message, session_id=session_id)

            # Stream from orchestrator
            async for event in agent_service.process_chat_stream(request):
                yield event

            # Clean up session after successful completion
            if stream_id in stream_sessions:
                del stream_sessions[stream_id]
                logger.info(f"Stream completed and cleaned up: {stream_id}")

        except asyncio.CancelledError:
            # Client disconnected - normal for reconnection
            logger.info(f"Client disconnected from stream: {stream_id}")
            # Keep session for potential reconnection (will expire naturally)
            raise

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
            "Connection": "keep-alive",
            "Access-Control-Allow-Origin": "http://localhost:3000",
            "Access-Control-Allow-Credentials": "true",
        },
    )
