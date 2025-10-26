"""Tests for backend enums to ensure proper values and JSON serialization."""

from src.models.enums import (
    AgentColor,
    AgentId,
    AgentStatus,
    LogStatus,
    LogType,
    MessageRole,
    RetrievalStrategy,
)


class TestAgentStatus:
    """Test AgentStatus enum."""

    def test_has_correct_values(self) -> None:
        """Verify enum values match specification."""
        assert AgentStatus.IDLE.value == "idle"
        assert AgentStatus.ROUTING.value == "routing"
        assert AgentStatus.ACTIVE.value == "active"

    def test_has_all_expected_members(self) -> None:
        """Verify all expected enum members exist."""
        members = list(AgentStatus)
        assert len(members) == 3
        assert AgentStatus.IDLE in members
        assert AgentStatus.ROUTING in members
        assert AgentStatus.ACTIVE in members

    def test_json_serialization(self) -> None:
        """Verify enum can be serialized to JSON string."""
        assert AgentStatus.IDLE.value == "idle"
        assert AgentStatus.IDLE == "idle"


class TestAgentId:
    """Test AgentId enum."""

    def test_has_correct_values(self) -> None:
        """Verify enum values match specification."""
        assert AgentId.ORCHESTRATOR.value == "orchestrator"
        assert AgentId.BILLING.value == "billing"
        assert AgentId.TECHNICAL.value == "technical"
        assert AgentId.POLICY.value == "policy"

    def test_has_all_expected_members(self) -> None:
        """Verify all expected enum members exist."""
        members = list(AgentId)
        assert len(members) == 4
        assert AgentId.ORCHESTRATOR in members
        assert AgentId.BILLING in members
        assert AgentId.TECHNICAL in members
        assert AgentId.POLICY in members

    def test_json_serialization(self) -> None:
        """Verify enum can be serialized to JSON string."""
        assert AgentId.ORCHESTRATOR.value == "orchestrator"
        assert AgentId.BILLING == "billing"


class TestMessageRole:
    """Test MessageRole enum."""

    def test_has_correct_values(self) -> None:
        """Verify enum values match specification."""
        assert MessageRole.USER.value == "user"
        assert MessageRole.ASSISTANT.value == "assistant"

    def test_has_all_expected_members(self) -> None:
        """Verify all expected enum members exist."""
        members = list(MessageRole)
        assert len(members) == 2
        assert MessageRole.USER in members
        assert MessageRole.ASSISTANT in members

    def test_json_serialization(self) -> None:
        """Verify enum can be serialized to JSON string."""
        assert MessageRole.USER.value == "user"
        assert MessageRole.ASSISTANT == "assistant"


class TestLogType:
    """Test LogType enum."""

    def test_has_correct_values(self) -> None:
        """Verify enum values match specification."""
        assert LogType.ROUTING.value == "routing"
        assert LogType.VECTOR_SEARCH.value == "vector_search"
        assert LogType.CACHE.value == "cache"
        assert LogType.DOCUMENTS.value == "documents"

    def test_has_all_expected_members(self) -> None:
        """Verify all expected enum members exist."""
        members = list(LogType)
        assert len(members) == 4
        assert LogType.ROUTING in members
        assert LogType.VECTOR_SEARCH in members
        assert LogType.CACHE in members
        assert LogType.DOCUMENTS in members

    def test_json_serialization(self) -> None:
        """Verify enum can be serialized to JSON string."""
        assert LogType.ROUTING.value == "routing"
        assert LogType.VECTOR_SEARCH == "vector_search"


class TestLogStatus:
    """Test LogStatus enum."""

    def test_has_correct_values(self) -> None:
        """Verify enum values match specification."""
        assert LogStatus.SUCCESS.value == "success"
        assert LogStatus.WARNING.value == "warning"
        assert LogStatus.ERROR.value == "error"

    def test_has_all_expected_members(self) -> None:
        """Verify all expected enum members exist."""
        members = list(LogStatus)
        assert len(members) == 3
        assert LogStatus.SUCCESS in members
        assert LogStatus.WARNING in members
        assert LogStatus.ERROR in members

    def test_json_serialization(self) -> None:
        """Verify enum can be serialized to JSON string."""
        assert LogStatus.SUCCESS.value == "success"
        assert LogStatus.ERROR == "error"


class TestRetrievalStrategy:
    """Test RetrievalStrategy enum."""

    def test_has_correct_values(self) -> None:
        """Verify enum values match specification."""
        assert RetrievalStrategy.PURE_RAG.value == "Pure RAG"
        assert RetrievalStrategy.PURE_CAG.value == "Pure CAG"
        assert RetrievalStrategy.HYBRID_RAG_CAG.value == "Hybrid RAG/CAG"

    def test_has_all_expected_members(self) -> None:
        """Verify all expected enum members exist."""
        members = list(RetrievalStrategy)
        assert len(members) == 3
        assert RetrievalStrategy.PURE_RAG in members
        assert RetrievalStrategy.PURE_CAG in members
        assert RetrievalStrategy.HYBRID_RAG_CAG in members

    def test_json_serialization(self) -> None:
        """Verify enum can be serialized to JSON string."""
        assert RetrievalStrategy.PURE_RAG.value == "Pure RAG"
        assert RetrievalStrategy.HYBRID_RAG_CAG == "Hybrid RAG/CAG"


class TestAgentColor:
    """Test AgentColor enum."""

    def test_has_correct_values(self) -> None:
        """Verify enum values match specification."""
        assert AgentColor.CYAN.value == "cyan"
        assert AgentColor.GREEN.value == "green"
        assert AgentColor.BLUE.value == "blue"
        assert AgentColor.PURPLE.value == "purple"

    def test_has_all_expected_members(self) -> None:
        """Verify all expected enum members exist."""
        members = list(AgentColor)
        assert len(members) == 4
        assert AgentColor.CYAN in members
        assert AgentColor.GREEN in members
        assert AgentColor.BLUE in members
        assert AgentColor.PURPLE in members

    def test_json_serialization(self) -> None:
        """Verify enum can be serialized to JSON string."""
        assert AgentColor.CYAN.value == "cyan"
        assert AgentColor.PURPLE == "purple"
