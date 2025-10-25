"""
OrchestratAI Backend Enums

CRITICAL: These MUST match frontend enums exactly! Validation script will check.

All enums inherit from str, Enum for JSON serialization compatibility.
This ensures FastAPI can automatically convert to/from JSON strings.
"""

from enum import Enum


class AgentStatus(str, Enum):
    """Agent execution states synchronized with frontend."""

    IDLE = "idle"
    ROUTING = "routing"
    ACTIVE = "active"


class AgentId(str, Enum):
    """Agent identifiers synchronized with frontend."""

    ORCHESTRATOR = "orchestrator"
    BILLING = "billing"
    TECHNICAL = "technical"
    POLICY = "policy"


class MessageRole(str, Enum):
    """Chat message role identifiers synchronized with frontend."""

    USER = "user"
    ASSISTANT = "assistant"


class LogType(str, Enum):
    """Retrieval log type categories synchronized with frontend."""

    ROUTING = "routing"
    VECTOR_SEARCH = "vector_search"
    CACHE = "cache"
    DOCUMENTS = "documents"


class LogStatus(str, Enum):
    """Log entry status levels synchronized with frontend."""

    SUCCESS = "success"
    WARNING = "warning"
    ERROR = "error"


class RetrievalStrategy(str, Enum):
    """RAG/CAG retrieval strategies synchronized with frontend."""

    PURE_RAG = "Pure RAG"
    PURE_CAG = "Pure CAG"
    HYBRID_RAG_CAG = "Hybrid RAG/CAG"


class AgentColor(str, Enum):
    """Agent UI color identifiers synchronized with frontend."""

    CYAN = "cyan"
    GREEN = "green"
    BLUE = "blue"
    PURPLE = "purple"
