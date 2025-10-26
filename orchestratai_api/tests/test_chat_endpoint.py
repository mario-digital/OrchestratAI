"""
Integration tests for chat endpoint.

Tests POST /api/chat for routing, validation, and response format.
"""

import pytest
from httpx import ASGITransport, AsyncClient

from src.main import app
from src.models.enums import AgentId


@pytest.mark.asyncio
async def test_chat_endpoint_billing_routing():
    """Test chat endpoint routes billing keywords to billing agent"""
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as client:
        response = await client.post(
            "/api/chat",
            json={
                "message": "How much does your subscription cost?",
                "session_id": "550e8400-e29b-41d4-a716-446655440000",
            },
        )

    assert response.status_code == 200
    data = response.json()

    # Verify response structure
    assert "message" in data
    assert "agent" in data
    assert "confidence" in data
    assert "logs" in data
    assert "metrics" in data

    # Verify routing to billing agent
    assert data["agent"] == AgentId.BILLING.value

    # Verify confidence score range
    assert 0.0 <= data["confidence"] <= 1.0

    # Verify logs are present
    assert len(data["logs"]) > 0
    assert data["logs"][0]["type"] == "routing"

    # Verify metrics
    assert "tokensUsed" in data["metrics"]
    assert "cost" in data["metrics"]
    assert "latency" in data["metrics"]
    assert data["metrics"]["tokensUsed"] >= 0
    assert data["metrics"]["cost"] >= 0
    assert data["metrics"]["latency"] >= 0


@pytest.mark.asyncio
async def test_chat_endpoint_technical_routing():
    """Test chat endpoint routes technical keywords to technical agent"""
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as client:
        response = await client.post(
            "/api/chat",
            json={
                "message": "I'm getting an error with the API",
                "session_id": "550e8400-e29b-41d4-a716-446655440001",
            },
        )

    assert response.status_code == 200
    data = response.json()
    assert data["agent"] == AgentId.TECHNICAL.value
    assert isinstance(data["message"], str)
    assert len(data["message"]) > 0


@pytest.mark.asyncio
async def test_chat_endpoint_policy_routing():
    """Test chat endpoint routes policy keywords to policy agent"""
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as client:
        response = await client.post(
            "/api/chat",
            json={
                "message": "What's your refund policy?",
                "session_id": "550e8400-e29b-41d4-a716-446655440002",
            },
        )

    assert response.status_code == 200
    data = response.json()
    assert data["agent"] == AgentId.POLICY.value
    assert isinstance(data["message"], str)


@pytest.mark.asyncio
async def test_chat_endpoint_orchestrator_fallback():
    """Test chat endpoint falls back to orchestrator for generic messages"""
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as client:
        response = await client.post(
            "/api/chat",
            json={
                "message": "Hello there",
                "session_id": "550e8400-e29b-41d4-a716-446655440003",
            },
        )

    assert response.status_code == 200
    data = response.json()
    assert data["agent"] == AgentId.ORCHESTRATOR.value
    assert isinstance(data["message"], str)


@pytest.mark.asyncio
async def test_chat_endpoint_missing_message():
    """Test chat endpoint returns 422 for missing message field"""
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as client:
        response = await client.post(
            "/api/chat",
            json={"session_id": "550e8400-e29b-41d4-a716-446655440000"},
        )

    assert response.status_code == 422
    data = response.json()
    assert "detail" in data


@pytest.mark.asyncio
async def test_chat_endpoint_missing_session_id():
    """Test chat endpoint returns 422 for missing session_id field"""
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as client:
        response = await client.post(
            "/api/chat",
            json={"message": "Hello"},
        )

    assert response.status_code == 422
    data = response.json()
    assert "detail" in data


@pytest.mark.asyncio
async def test_chat_endpoint_empty_message():
    """Test chat endpoint returns 422 for empty message (min_length=1)"""
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as client:
        response = await client.post(
            "/api/chat",
            json={"message": "", "session_id": "550e8400-e29b-41d4-a716-446655440000"},
        )

    assert response.status_code == 422
    data = response.json()
    assert "detail" in data


@pytest.mark.asyncio
async def test_chat_endpoint_message_too_long():
    """Test chat endpoint returns 422 for message exceeding 2000 characters"""
    long_message = "x" * 2001
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as client:
        response = await client.post(
            "/api/chat",
            json={
                "message": long_message,
                "session_id": "550e8400-e29b-41d4-a716-446655440000",
            },
        )

    assert response.status_code == 422
    data = response.json()
    assert "detail" in data


@pytest.mark.asyncio
async def test_chat_endpoint_invalid_session_id_format():
    """Test chat endpoint returns 422 for invalid UUID format"""
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as client:
        response = await client.post(
            "/api/chat",
            json={"message": "Hello", "session_id": "not-a-valid-uuid"},
        )

    assert response.status_code == 422
    data = response.json()
    assert "detail" in data


@pytest.mark.asyncio
async def test_chat_endpoint_response_schema():
    """Test chat endpoint returns complete ChatResponse schema"""
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as client:
        response = await client.post(
            "/api/chat",
            json={
                "message": "Test message",
                "session_id": "550e8400-e29b-41d4-a716-446655440000",
            },
        )

    assert response.status_code == 200
    data = response.json()

    # Verify all required fields exist
    assert "message" in data
    assert "agent" in data
    assert "confidence" in data
    assert "logs" in data
    assert "metrics" in data

    # Verify logs structure
    assert isinstance(data["logs"], list)
    assert len(data["logs"]) > 0
    first_log = data["logs"][0]
    assert "id" in first_log
    assert "type" in first_log
    assert "title" in first_log
    assert "data" in first_log
    assert "timestamp" in first_log
    assert "status" in first_log

    # Verify metrics structure
    assert "tokensUsed" in data["metrics"]
    assert "cost" in data["metrics"]
    assert "latency" in data["metrics"]

    # Verify types
    assert isinstance(data["message"], str)
    assert isinstance(data["agent"], str)
    assert isinstance(data["confidence"], (int, float))
    assert isinstance(data["logs"], list)
    assert isinstance(data["metrics"], dict)
