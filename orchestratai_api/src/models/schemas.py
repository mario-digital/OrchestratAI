"""
OrchestratAI Pydantic Schemas

Pydantic models for API request/response validation.
These schemas enforce type safety and validate incoming requests.
"""

from typing import Any, Literal

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

    Tracks token usage, cost, latency, and cache status.
    """

    tokensUsed: int = Field(..., ge=0, description="Total tokens consumed")
    cost: float = Field(..., ge=0, description="Cost in USD")
    latency: int = Field(..., ge=0, description="Response time in milliseconds")
    cache_status: Literal["hit", "miss", "none"] = Field(
        "none", description="Cache hit/miss status for this request"
    )


class QueryAnalysis(BaseModel):
    """
    Query analysis result from orchestrator routing.

    Contains intent classification, confidence, target agent selection, and reasoning.
    """

    intent: str = Field(..., description="Detected user intent")
    confidence: float = Field(..., ge=0, le=1, description="Intent confidence score")
    target_agent: AgentId = Field(..., description="Selected agent for handling query")
    reasoning: str = Field(..., description="Routing decision reasoning")


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


class VectorSearch(BaseModel):
    """
    Vector search operation result.

    Contains search metadata including collection, chunks retrieved, and latency.
    """

    collection: str = Field(..., description="Vector DB collection name")
    chunks_retrieved: int = Field(..., ge=0, description="Number of chunks found")
    chunks: list[DocumentChunk] = Field(..., description="Retrieved document chunks")
    latency: int = Field(..., ge=0, description="Search latency in milliseconds")


class CacheOperation(BaseModel):
    """
    Cache operation result.

    Contains cache hit/miss status, hit rate, and size metrics.
    """

    status: Literal["hit", "miss"] = Field(..., description="Cache result")
    hit_rate: float = Field(..., ge=0, le=1, description="Overall cache hit rate")
    size: str = Field(..., description="Cache size (e.g., '2.3 MB')")


class RetrievalLog(BaseModel):
    """
    Retrieval operation log entry.

    Tracks vector search, routing, cache, and document operations.
    The `data` field is polymorphic and contains different structures based on `type`:
    - type="routing": data contains QueryAnalysis fields (intent, confidence,
      target_agent, reasoning)
    - type="vector_search": data contains VectorSearch fields (collection,
      chunks_retrieved, chunks, latency)
    - type="cache": data contains CacheOperation fields (status, hit_rate, size)
    - type="documents": data contains custom document retrieval metadata
    """

    id: str = Field(..., description="Log entry UUID")
    type: LogType = Field(..., description="Type of retrieval operation")
    title: str = Field(..., description="Human-readable log title")
    data: dict[str, Any] = Field(
        ...,
        description="Operation-specific polymorphic data (structure depends on type field)",
    )
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

    Contains assistant message, agent info, logs, metrics, and agent status mapping.
    """

    message: str = Field(..., description="Assistant response content")
    agent: AgentId = Field(..., description="Agent that handled request")
    confidence: float = Field(..., ge=0, le=1, description="Response confidence score")
    logs: list[RetrievalLog] = Field(..., description="Retrieval operation logs")
    metrics: ChatMetrics = Field(..., description="Performance metrics")
    agent_status: dict[AgentId, AgentStatus] = Field(
        ..., description="Current status of all agents in the system"
    )
