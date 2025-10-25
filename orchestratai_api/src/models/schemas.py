"""
OrchestratAI Pydantic Schemas

Pydantic models for API request/response validation.
These schemas enforce type safety and validate incoming requests.
"""

from typing import Any

from pydantic import BaseModel, Field

from .enums import (
    AgentColor,
    AgentId,
    AgentStatus,
    LogStatus,
    LogType,
    MessageRole,
    RetrievalStrategy,
)


class ChatRequest(BaseModel):
    """
    Incoming chat request from frontend.

    Validates message length and session ID format.
    """

    message: str = Field(..., min_length=1, max_length=2000, description="User message content")
    session_id: str = Field(
        ...,
        pattern=r"^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$",
        description="Chat session UUID",
    )


class ChatMetrics(BaseModel):
    """
    Performance metrics for chat response.

    Tracks token usage, cost, and latency.
    """

    tokensUsed: int = Field(..., ge=0, description="Total tokens consumed")
    cost: float = Field(..., ge=0, description="Cost in USD")
    latency: int = Field(..., ge=0, description="Response time in milliseconds")


class DocumentChunk(BaseModel):
    """
    Vector database document chunk with similarity score.

    Retrieved from RAG/CAG operations.
    """

    id: int = Field(..., description="Chunk identifier")
    content: str = Field(..., description="Chunk text content")
    similarity: float = Field(..., ge=0, le=1, description="Cosine similarity score")
    source: str = Field(..., description="Source document path")
    metadata: dict[str, Any] | None = Field(None, description="Additional chunk metadata")


class RetrievalLog(BaseModel):
    """
    Retrieval operation log entry.

    Tracks vector search, routing, cache, and document operations.
    """

    id: str = Field(..., description="Log entry UUID")
    type: LogType = Field(..., description="Type of retrieval operation")
    title: str = Field(..., description="Human-readable log title")
    data: dict[str, Any] = Field(..., description="Operation-specific data")
    timestamp: str = Field(..., description="ISO 8601 timestamp")
    status: LogStatus = Field(..., description="Operation result status")
    chunks: list[DocumentChunk] | None = Field(None, description="Retrieved document chunks")


class Message(BaseModel):
    """
    Chat message in conversation history.

    Stores user and assistant messages with metadata.
    """

    id: str = Field(..., description="Message UUID")
    role: MessageRole = Field(..., description="Message sender role")
    content: str = Field(..., description="Message text content")
    agent: AgentId | None = Field(None, description="Agent that generated response")
    confidence: float | None = Field(None, ge=0, le=1, description="Agent confidence score")
    timestamp: str = Field(..., description="ISO 8601 timestamp")
    sessionId: str = Field(..., description="Chat session UUID")


class Agent(BaseModel):
    """
    Agent status and configuration.

    Tracks active agent state, tokens, and cost.
    """

    id: AgentId = Field(..., description="Agent identifier")
    name: str = Field(..., description="Agent display name")
    status: AgentStatus = Field(..., description="Current agent state")
    model: str = Field(..., description="LLM model name")
    strategy: RetrievalStrategy | None = Field(None, description="RAG/CAG strategy")
    color: AgentColor = Field(..., description="UI color identifier")
    tokensUsed: int = Field(..., ge=0, description="Tokens consumed by agent")
    cost: float = Field(..., ge=0, description="Cost in USD")
    cached: bool | None = Field(None, description="Cache hit indicator")


class ChatResponse(BaseModel):
    """
    Complete chat API response.

    Contains assistant message, agent info, logs, and metrics.
    """

    message: str = Field(..., description="Assistant response content")
    agent: AgentId = Field(..., description="Agent that handled request")
    confidence: float = Field(..., ge=0, le=1, description="Response confidence score")
    logs: list[RetrievalLog] = Field(..., description="Retrieval operation logs")
    metrics: ChatMetrics = Field(..., description="Performance metrics")
