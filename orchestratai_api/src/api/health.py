"""Health check endpoints"""

from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()


class HealthResponse(BaseModel):
    """Health check response model"""

    status: str
    message: str


@router.get("/health", response_model=HealthResponse)
async def health_check() -> HealthResponse:
    """
    Health check endpoint to verify the API is running.

    Returns:
        HealthResponse with status and message
    """
    return HealthResponse(
        status="healthy",
        message="OrchestratAI API is running successfully",
    )


@router.get("/ping")
async def ping() -> dict[str, str]:
    """
    Simple ping endpoint for quick connectivity checks.

    Returns:
        Dictionary with pong message
    """
    return {"ping": "pong"}
