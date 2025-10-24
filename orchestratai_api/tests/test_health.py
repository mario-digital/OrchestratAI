"""Tests for health check endpoints"""

from fastapi.testclient import TestClient

from src.main import app

client = TestClient(app)


def test_root() -> None:
    """Test root endpoint returns welcome message"""
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["message"] == "Welcome to OrchestratAI API"
    assert "version" in data
    assert "docs" in data


def test_health_check() -> None:
    """Test health check endpoint returns healthy status"""
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["message"] == "OrchestratAI API is running successfully"


def test_ping() -> None:
    """Test ping endpoint returns pong"""
    response = client.get("/api/ping")
    assert response.status_code == 200
    data = response.json()
    assert data["ping"] == "pong"
