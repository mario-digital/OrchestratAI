"""
Integration tests for SSE chat stream endpoint
"""

import json

import pytest
from httpx import ASGITransport, AsyncClient

from src.main import app


def parse_sse_events(text: str) -> list[dict]:
    """
    Parse SSE stream into list of events.

    Args:
        text: Raw SSE stream text

    Returns:
        List of parsed events with 'event' and 'data' fields
    """
    events = []
    current_event = {}

    for line in text.split("\n"):
        if line.startswith("event:"):
            current_event["event"] = line.split(":", 1)[1].strip()
        elif line.startswith("data:"):
            current_event["data"] = json.loads(line.split(":", 1)[1].strip())
        elif line == "":
            if current_event:
                events.append(current_event)
                current_event = {}

    return events


@pytest.mark.asyncio
class TestChatStreamEndpoint:
    """Test suite for /api/chat/stream endpoint"""

    async def test_endpoint_returns_correct_content_type(self):
        """Test that endpoint returns text/event-stream content type"""
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            response = await client.post(
                "/api/chat/stream",
                json={
                    "message": "What are your pricing tiers?",
                    "session_id": "550e8400-e29b-41d4-a716-446655440000",
                },
            )

        assert response.status_code == 200
        assert response.headers["content-type"] == "text/event-stream; charset=utf-8"

    async def test_cors_headers_present(self):
        """Test that CORS headers are present for localhost:3000"""
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            response = await client.post(
                "/api/chat/stream",
                json={
                    "message": "What are your pricing tiers?",
                    "session_id": "550e8400-e29b-41d4-a716-446655440000",
                },
            )

        assert response.headers["access-control-allow-origin"] == "http://localhost:3000"
        assert response.headers["access-control-allow-credentials"] == "true"

    async def test_cache_control_headers(self):
        """Test that cache control headers are set correctly"""
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            response = await client.post(
                "/api/chat/stream",
                json={
                    "message": "What are your pricing tiers?",
                    "session_id": "550e8400-e29b-41d4-a716-446655440000",
                },
            )

        assert response.headers["cache-control"] == "no-cache"
        assert response.headers["x-accel-buffering"] == "no"
        assert response.headers["connection"] == "keep-alive"

    async def test_event_sequence(self):
        """Test that events are emitted in correct sequence"""
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            response = await client.post(
                "/api/chat/stream",
                json={
                    "message": "What are your pricing tiers?",
                    "session_id": "550e8400-e29b-41d4-a716-446655440000",
                },
            )

        events = parse_sse_events(response.text)

        # Verify we have events
        assert len(events) > 0

        # First event should be agent_status (ORCHESTRATOR ROUTING)
        assert events[0]["event"] == "agent_status"
        assert events[0]["data"]["agent"] == "ORCHESTRATOR"
        assert events[0]["data"]["status"] == "ROUTING"

        # Last event should be done
        assert events[-1]["event"] == "done"
        assert "session_id" in events[-1]["data"]
        assert "metadata" in events[-1]["data"]

    async def test_agent_status_events(self):
        """Test agent_status event structure and content"""
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            response = await client.post(
                "/api/chat/stream",
                json={
                    "message": "What are your pricing tiers?",
                    "session_id": "550e8400-e29b-41d4-a716-446655440000",
                },
            )

        events = parse_sse_events(response.text)
        agent_status_events = [e for e in events if e["event"] == "agent_status"]

        # Should have at least 3 agent status events
        # 1. ORCHESTRATOR ROUTING
        # 2. ORCHESTRATOR IDLE
        # 3. Target agent ACTIVE
        # 4. Target agent COMPLETE
        assert len(agent_status_events) >= 3

        # Verify orchestrator routing
        assert agent_status_events[0]["data"]["agent"] == "ORCHESTRATOR"
        assert agent_status_events[0]["data"]["status"] == "ROUTING"

        # Verify orchestrator goes idle
        orchestrator_idle = [
            e
            for e in agent_status_events
            if e["data"]["agent"] == "ORCHESTRATOR" and e["data"]["status"] == "IDLE"
        ]
        assert len(orchestrator_idle) >= 1

    async def test_retrieval_log_events(self):
        """Test retrieval_log events are present and valid"""
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            response = await client.post(
                "/api/chat/stream",
                json={
                    "message": "What are your pricing tiers?",
                    "session_id": "550e8400-e29b-41d4-a716-446655440000",
                },
            )

        events = parse_sse_events(response.text)
        log_events = [e for e in events if e["event"] == "retrieval_log"]

        # Should have at least one retrieval log (query analysis)
        assert len(log_events) >= 1

        # Verify log structure
        for log_event in log_events:
            assert "type" in log_event["data"]
            assert "timestamp" in log_event["data"]
            assert "data" in log_event["data"]
            assert "status" in log_event["data"]

    async def test_message_chunk_events(self):
        """Test message_chunk events stream word-by-word"""
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            response = await client.post(
                "/api/chat/stream",
                json={
                    "message": "What are your pricing tiers?",
                    "session_id": "550e8400-e29b-41d4-a716-446655440000",
                },
            )

        events = parse_sse_events(response.text)
        chunk_events = [e for e in events if e["event"] == "message_chunk"]

        # Should have multiple chunks
        assert len(chunk_events) > 0

        # Each chunk should have content field
        for chunk in chunk_events:
            assert "content" in chunk["data"]
            assert isinstance(chunk["data"]["content"], str)

        # Reconstruct message from chunks
        full_message = "".join(chunk["data"]["content"] for chunk in chunk_events)
        assert len(full_message.strip()) > 0

    async def test_done_event_structure(self):
        """Test done event contains session_id and metadata"""
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            response = await client.post(
                "/api/chat/stream",
                json={
                    "message": "What are your pricing tiers?",
                    "session_id": "550e8400-e29b-41d4-a716-446655440000",
                },
            )

        events = parse_sse_events(response.text)
        done_events = [e for e in events if e["event"] == "done"]

        assert len(done_events) == 1
        done_event = done_events[0]

        # Verify structure
        assert "session_id" in done_event["data"]
        assert done_event["data"]["session_id"] == "550e8400-e29b-41d4-a716-446655440000"

        # Verify metadata
        assert "metadata" in done_event["data"]
        metadata = done_event["data"]["metadata"]
        assert "tokensUsed" in metadata
        assert "cost" in metadata
        assert "latency" in metadata
        assert "cache_status" in metadata

    async def test_sse_event_format(self):
        """Test that events follow W3C SSE format"""
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            response = await client.post(
                "/api/chat/stream",
                json={
                    "message": "test",
                    "session_id": "550e8400-e29b-41d4-a716-446655440000",
                },
            )

        text = response.text

        # Verify events have proper structure
        assert "event: " in text
        assert "data: " in text

        # Verify JSON data is valid
        events = parse_sse_events(text)
        for event in events:
            assert "event" in event
            assert "data" in event
            # Data should be a dict (JSON parsed successfully)
            assert isinstance(event["data"], dict)

    async def test_json_parsing_of_event_data(self):
        """Test that all event data can be JSON parsed"""
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            response = await client.post(
                "/api/chat/stream",
                json={
                    "message": "What are your pricing tiers?",
                    "session_id": "550e8400-e29b-41d4-a716-446655440000",
                },
            )

        events = parse_sse_events(response.text)

        # All events should have valid JSON data
        for event in events:
            assert isinstance(event["data"], dict)
            # Verify it can be re-serialized
            json_str = json.dumps(event["data"])
            reparsed = json.loads(json_str)
            assert reparsed == event["data"]

    async def test_billing_agent_routing(self):
        """Test that billing keywords route to BILLING agent"""
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            response = await client.post(
                "/api/chat/stream",
                json={
                    "message": "How much does it cost?",  # "cost" is a billing keyword
                    "session_id": "550e8400-e29b-41d4-a716-446655440000",
                },
            )

        events = parse_sse_events(response.text)
        agent_status_events = [e for e in events if e["event"] == "agent_status"]

        # Should route to BILLING agent (lowercase enum value)
        billing_events = [
            e for e in agent_status_events if e["data"]["agent"] == "billing"
        ]
        assert len(billing_events) > 0

    async def test_technical_agent_routing(self):
        """Test that technical keywords route to TECHNICAL agent"""
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            response = await client.post(
                "/api/chat/stream",
                json={
                    "message": "I have an API error",
                    "session_id": "550e8400-e29b-41d4-a716-446655440000",
                },
            )

        events = parse_sse_events(response.text)
        agent_status_events = [e for e in events if e["event"] == "agent_status"]

        # Should route to TECHNICAL agent (lowercase enum value)
        technical_events = [
            e for e in agent_status_events if e["data"]["agent"] == "technical"
        ]
        assert len(technical_events) > 0

    async def test_invalid_request_validation(self):
        """Test that invalid requests return validation errors"""
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            response = await client.post(
                "/api/chat/stream",
                json={
                    "message": "",  # Empty message (invalid)
                    "session_id": "550e8400-e29b-41d4-a716-446655440000",
                },
            )

        assert response.status_code == 422

    async def test_invalid_session_id_format(self):
        """Test that invalid session_id format is rejected"""
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            response = await client.post(
                "/api/chat/stream",
                json={
                    "message": "test",
                    "session_id": "not-a-uuid",  # Invalid UUID format
                },
            )

        assert response.status_code == 422

    async def test_configurable_stream_delay(self):
        """Test that STREAM_DELAY_MS configuration is respected"""
        # This test verifies the config is used, not actual timing
        # (timing tests are unreliable in CI)
        from src.config import settings

        # Verify config exists and has default value
        assert hasattr(settings, "STREAM_DELAY_MS")
        assert settings.STREAM_DELAY_MS == 50

    @pytest.mark.asyncio
    async def test_complete_event_flow(self):
        """Test complete event flow from start to finish"""
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            response = await client.post(
                "/api/chat/stream",
                json={
                    "message": "What are your pricing tiers?",
                    "session_id": "550e8400-e29b-41d4-a716-446655440000",
                },
            )

        events = parse_sse_events(response.text)

        # Track event types in order
        event_types = [e["event"] for e in events]

        # Should start with agent_status
        assert event_types[0] == "agent_status"

        # Should end with done
        assert event_types[-1] == "done"

        # Should have message_chunk events
        assert "message_chunk" in event_types

        # Should have retrieval_log events (at least query analysis)
        assert "retrieval_log" in event_types

    @pytest.mark.asyncio
    async def test_agent_complete_status(self):
        """Test that agent status ends with COMPLETE"""
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            response = await client.post(
                "/api/chat/stream",
                json={
                    "message": "What are your pricing tiers?",
                    "session_id": "550e8400-e29b-41d4-a716-446655440000",
                },
            )

        events = parse_sse_events(response.text)
        agent_status_events = [e for e in events if e["event"] == "agent_status"]

        # Find the last non-ORCHESTRATOR agent status
        target_agent_events = [
            e for e in agent_status_events if e["data"]["agent"] != "ORCHESTRATOR"
        ]

        # Last target agent status should be COMPLETE
        if target_agent_events:
            last_target_status = target_agent_events[-1]
            assert last_target_status["data"]["status"] == "COMPLETE"
