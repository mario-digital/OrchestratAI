"""
Unit tests for SSE utility functions
"""

import json

from src.services.sse_utils import create_sse_event


class TestCreateSSEEvent:
    """Test suite for create_sse_event function"""

    def test_basic_event_format(self):
        """Test basic SSE event formatting"""
        result = create_sse_event("test_event", {"key": "value"})

        assert result.startswith("event: test_event\n")
        assert "data: " in result
        assert result.endswith("\n\n")

    def test_message_chunk_event(self):
        """Test message_chunk event formatting"""
        result = create_sse_event("message_chunk", {"content": "Hello "})

        expected = 'event: message_chunk\ndata: {"content": "Hello "}\n\n'
        assert result == expected

    def test_agent_status_event(self):
        """Test agent_status event formatting"""
        result = create_sse_event("agent_status", {"agent": "BILLING", "status": "ACTIVE"})

        assert "event: agent_status\n" in result
        assert '"agent": "BILLING"' in result
        assert '"status": "ACTIVE"' in result

    def test_retrieval_log_event(self):
        """Test retrieval_log event formatting"""
        log_data = {
            "type": "query_analysis",
            "timestamp": "2025-01-01T00:00:00Z",
            "data": {"intent": "billing", "confidence": 0.95},
        }
        result = create_sse_event("retrieval_log", log_data)

        assert "event: retrieval_log\n" in result
        assert '"type": "query_analysis"' in result

    def test_done_event(self):
        """Test done event formatting"""
        result = create_sse_event(
            "done",
            {
                "session_id": "550e8400-e29b-41d4-a716-446655440000",
                "metadata": {"tokens_used": 500, "cost_usd": 0.002},
            },
        )

        assert "event: done\n" in result
        assert '"session_id"' in result
        assert '"metadata"' in result

    def test_json_serialization(self):
        """Test that data is properly JSON serialized"""
        data = {"number": 42, "text": "hello", "nested": {"key": "value"}}
        result = create_sse_event("test", data)

        # Extract data portion
        lines = result.split("\n")
        data_line = [line for line in lines if line.startswith("data: ")][0]
        json_str = data_line.replace("data: ", "")

        # Verify valid JSON
        parsed = json.loads(json_str)
        assert parsed == data

    def test_empty_data(self):
        """Test event with empty data object"""
        result = create_sse_event("empty", {})

        expected = "event: empty\ndata: {}\n\n"
        assert result == expected

    def test_special_characters_in_data(self):
        """Test handling of special characters in data"""
        data = {"text": 'Hello "world"\nNew line\tTab'}
        result = create_sse_event("special", data)

        # Verify it contains valid JSON
        lines = result.split("\n")
        data_line = [line for line in lines if line.startswith("data: ")][0]
        json_str = data_line.replace("data: ", "")

        parsed = json.loads(json_str)
        assert parsed["text"] == 'Hello "world"\nNew line\tTab'

    def test_unicode_characters(self):
        """Test handling of unicode characters"""
        data = {"content": "Hello 世界 🌍"}
        result = create_sse_event("unicode", data)

        lines = result.split("\n")
        data_line = [line for line in lines if line.startswith("data: ")][0]
        json_str = data_line.replace("data: ", "")

        parsed = json.loads(json_str)
        assert parsed["content"] == "Hello 世界 🌍"

    def test_event_format_structure(self):
        """Test the exact structure of SSE format"""
        result = create_sse_event("test", {"key": "value"})

        lines = result.split("\n")
        assert len(lines) == 4  # event line, data line, empty line, final empty string
        assert lines[0].startswith("event: ")
        assert lines[1].startswith("data: ")
        assert lines[2] == ""
        assert lines[3] == ""

    def test_numeric_values(self):
        """Test handling of various numeric types"""
        data = {"int": 42, "float": 3.14, "negative": -10, "zero": 0}
        result = create_sse_event("numbers", data)

        lines = result.split("\n")
        data_line = [line for line in lines if line.startswith("data: ")][0]
        json_str = data_line.replace("data: ", "")

        parsed = json.loads(json_str)
        assert parsed == data

    def test_boolean_and_null_values(self):
        """Test handling of boolean and null values"""
        data = {"true_val": True, "false_val": False, "null_val": None}
        result = create_sse_event("booleans", data)

        lines = result.split("\n")
        data_line = [line for line in lines if line.startswith("data: ")][0]
        json_str = data_line.replace("data: ", "")

        parsed = json.loads(json_str)
        assert parsed == data

    def test_nested_objects(self):
        """Test handling of deeply nested objects"""
        data = {
            "level1": {
                "level2": {"level3": {"message": "deep"}},
                "array": [1, 2, {"nested": True}],
            }
        }
        result = create_sse_event("nested", data)

        lines = result.split("\n")
        data_line = [line for line in lines if line.startswith("data: ")][0]
        json_str = data_line.replace("data: ", "")

        parsed = json.loads(json_str)
        assert parsed == data
        assert parsed["level1"]["level2"]["level3"]["message"] == "deep"
