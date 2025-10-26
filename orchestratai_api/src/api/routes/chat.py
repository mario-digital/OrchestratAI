"""
Chat endpoint for OrchestratAI

Handles POST /api/chat requests, routes to appropriate agent,
and returns mock responses during development.
"""

from fastapi import APIRouter

from src.models.schemas import ChatRequest, ChatResponse
from src.services.mock_data import generate_mock_response

# Create router with /api prefix
router = APIRouter(prefix="/api", tags=["chat"])


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
