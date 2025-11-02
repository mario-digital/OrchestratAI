"""
Chat endpoint for OrchestratAI

Handles POST /api/chat requests, routes to appropriate agent,
and returns mock responses during development.
"""

import asyncio
import logging
import uuid
from collections.abc import AsyncGenerator
from datetime import datetime, timedelta

from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse

from src.config import settings
from src.models.schemas import ChatRequest, ChatResponse
from src.services.mock_data import generate_mock_response
from src.services.sse_utils import create_sse_event

# Create router with /api prefix
router = APIRouter(prefix="/api", tags=["chat"])

# Logger for SSE streams
logger = logging.getLogger(__name__)

# In-memory stream session storage
# Production: Use Redis with TTL for distributed systems
stream_sessions: dict[str, dict] = {}


@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest) -> ChatResponse:
    """
    Process chat message and return mock agent response.

    Args:
        request: ChatRequest containing message and session_id

    Returns:
        ChatResponse with agent message, logs, and metrics

    Raises:
        422: Pydantic validation error for invalid request format
    """
    # Generate mock response using routing logic
    response = generate_mock_response(request.message)
    return response


@router.post("/chat/stream")
async def chat_stream(request: ChatRequest) -> StreamingResponse:
    """
    Stream chat response using Server-Sent Events (SSE).

    Returns real-time updates for agent status, message chunks, and retrieval logs.
    Streams four event types:
    - `agent_status`: Agent state updates (ROUTING, ACTIVE, COMPLETE)
    - `retrieval_log`: Log entries as they're generated
    - `message_chunk`: Partial message content (word-by-word streaming)
    - `done`: Stream completion signal with final metadata

    Args:
        request: ChatRequest containing message and session_id

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
        - Configurable streaming speed via STREAM_DELAY_MS setting
    """

    async def event_generator() -> AsyncGenerator[str, None]:
        """
        Generate SSE events for streaming chat response.

        Yields SSE-formatted events in sequence:
        1. Orchestrator routing
        2. Target agent activation
        3. Retrieval logs (if any)
        4. Message chunks (word-by-word)
        5. Final agent status
        6. Done event with metadata
        """
        try:
            # Generate mock response (reuse existing service)
            mock_response = generate_mock_response(request.message)

            # 1. Emit orchestrator routing status
            yield create_sse_event("agent_status", {"agent": "ORCHESTRATOR", "status": "ROUTING"})
            await asyncio.sleep(0.1)  # 100ms delay

            # 2. Orchestrator idle, target agent active
            yield create_sse_event("agent_status", {"agent": "ORCHESTRATOR", "status": "IDLE"})
            yield create_sse_event(
                "agent_status", {"agent": mock_response.agent.value, "status": "ACTIVE"}
            )
            await asyncio.sleep(0.1)

            # 3. Emit retrieval logs
            for log in mock_response.logs:
                yield create_sse_event("retrieval_log", log.model_dump())
                await asyncio.sleep(0.05)  # 50ms between logs

            # 4. Stream message chunks (word-by-word)
            words = mock_response.message.split()
            for word in words:
                yield create_sse_event("message_chunk", {"content": word + " "})
                await asyncio.sleep(settings.STREAM_DELAY_MS / 1000)

            # 5. Final agent status
            yield create_sse_event(
                "agent_status", {"agent": mock_response.agent.value, "status": "COMPLETE"}
            )

            # 6. Done event with metadata
            yield create_sse_event(
                "done",
                {
                    "session_id": str(request.session_id),
                    "metadata": mock_response.metrics.model_dump(),
                },
            )

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
async def initiate_stream(request: ChatRequest) -> dict:
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
async def stream_by_id(stream_id: str) -> StreamingResponse:
    """
    Stream chat response by ID (Step 2 of two-step streaming).

    Security: Uses stream_id to retrieve message from server-side storage.
    Message never appears in URL or logs.

    Reconnection: EventSource can reconnect to this endpoint automatically.
    Each reconnection uses the same stream_id to resume/restart the stream.

    Args:
        stream_id: UUID from /chat/stream/initiate endpoint

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
        Generate SSE events using stored message.

        Note: Message retrieved from server-side storage, never from URL.
        """
        try:
            # Generate mock response using stored message
            mock_response = generate_mock_response(message)

            # 1. Emit orchestrator routing status
            yield create_sse_event("agent_status", {"agent": "ORCHESTRATOR", "status": "ROUTING"})
            await asyncio.sleep(0.1)

            # 2. Orchestrator idle, target agent active
            yield create_sse_event("agent_status", {"agent": "ORCHESTRATOR", "status": "IDLE"})
            yield create_sse_event(
                "agent_status", {"agent": mock_response.agent.value, "status": "ACTIVE"}
            )
            await asyncio.sleep(0.1)

            # 3. Emit retrieval logs
            for log in mock_response.logs:
                yield create_sse_event("retrieval_log", log.model_dump())
                await asyncio.sleep(0.05)

            # 4. Stream message chunks (word-by-word)
            words = mock_response.message.split()
            for word in words:
                yield create_sse_event("message_chunk", {"content": word + " "})
                await asyncio.sleep(settings.STREAM_DELAY_MS / 1000)

            # 5. Final agent status
            yield create_sse_event(
                "agent_status", {"agent": mock_response.agent.value, "status": "COMPLETE"}
            )

            # 6. Done event with metadata
            yield create_sse_event(
                "done",
                {
                    "session_id": session_id,
                    "metadata": mock_response.metrics.model_dump(),
                },
            )

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
