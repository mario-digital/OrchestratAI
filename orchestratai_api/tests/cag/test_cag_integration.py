"""Integration tests for CAG agent with real Redis instance.

These tests require a Redis instance to be running. They use mock LLM providers
but test with real Redis connectivity and semantic caching behavior.

Run with: pytest tests/cag/test_cag_integration.py -v -m integration
"""

import asyncio
import time
from unittest.mock import AsyncMock

import pytest
import pytest_asyncio

from src.agents.workers.cag_agent import CAGAgent
from src.cache.redis_cache import RedisSemanticCache
from src.llm.types import LLMCallResult
from src.models.enums import LogType
from src.models.schemas import ChatRequest


@pytest_asyncio.fixture
async def redis_cache():
    """Create RedisSemanticCache with real Redis connection.

    NOTE: This requires Redis to be running locally or in Docker.
    Set REDIS_HOST environment variable or use default localhost:6379
    """
    import os

    # Skip if REDIS_HOST not configured (e.g., in CI without Redis)
    redis_host = os.getenv("REDIS_HOST")
    if not redis_host:
        pytest.skip("REDIS_HOST not configured - skipping Redis integration tests")

    try:
        cache = RedisSemanticCache(ttl_seconds=60)
    except Exception as e:
        pytest.skip(f"Failed to create Redis cache: {e}")

    # Verify Redis is available
    try:
        await cache._client.ping()
    except Exception as e:
        await cache.close()
        pytest.skip(f"Redis not available: {e}")

    # Clean up any existing cache data
    await cache._client.delete("cag_cache")

    yield cache

    # Cleanup
    await cache._client.delete("cag_cache")
    await cache.close()


@pytest.fixture
def mock_llm_provider():
    """Create mock LLM provider for CAG agent."""
    provider = AsyncMock()
    provider.complete = AsyncMock(
        return_value=LLMCallResult(
            content="Based on our refund policy, you can request a full refund within 30 days.",
            model="claude-3-haiku",
            tokens_input=100,
            tokens_output=300,
            cost=0.0004,
            raw=None,
            logprobs=None,
        )
    )
    return provider


@pytest.fixture
def mock_embeddings_provider():
    """Create mock embeddings provider."""
    provider = AsyncMock()
    # Return consistent embeddings for testing
    provider.embed = AsyncMock(return_value=[1.0, 2.0, 3.0, 4.0, 5.0])
    return provider


@pytest.mark.integration
@pytest.mark.asyncio
async def test_cag_cache_miss_then_hit_with_real_redis(
    redis_cache, mock_llm_provider, mock_embeddings_provider
):
    """Test CAG agent: first query is cache miss, second is cache hit."""
    # Create CAG agent with real Redis cache
    agent = CAGAgent(
        provider=mock_llm_provider,
        cache=redis_cache,
        embeddings=mock_embeddings_provider,
    )

    # First query - should be cache miss
    request1 = ChatRequest(
        message="Can I get a refund?",
        session_id="550e8400-e29b-41d4-a716-446655440000",
    )

    start_time = time.perf_counter()
    response1 = await agent.run(request1)
    first_latency = int((time.perf_counter() - start_time) * 1000)

    # Verify cache miss
    assert response1.metrics.cache_status == "miss"
    assert response1.metrics.cost > 0  # Should have LLM cost
    assert response1.metrics.tokensUsed > 0

    # Verify cache log shows miss
    cache_logs1 = [log for log in response1.logs if log.type == LogType.CACHE]
    assert len(cache_logs1) == 1
    assert cache_logs1[0].data["operation"] == "miss"

    # Verify provider was called
    mock_llm_provider.complete.assert_called_once()

    # Reset mock for second call
    mock_llm_provider.complete.reset_mock()

    # Second query - identical, should be cache hit
    request2 = ChatRequest(
        message="Can I get a refund?",
        session_id="550e8400-e29b-41d4-a716-446655440001",
    )

    start_time = time.perf_counter()
    response2 = await agent.run(request2)
    second_latency = int((time.perf_counter() - start_time) * 1000)

    # Verify cache hit
    assert response2.metrics.cache_status == "hit"
    assert response2.metrics.cost == 0.0  # No LLM cost
    assert response2.metrics.tokensUsed == 0

    # Verify cache log shows hit
    cache_logs2 = [log for log in response2.logs if log.type == LogType.CACHE]
    assert len(cache_logs2) == 1
    assert cache_logs2[0].data["operation"] == "hit"
    assert cache_logs2[0].data["similarity_score"] >= 0.99  # Identical embeddings

    # Verify provider was NOT called (cache hit)
    mock_llm_provider.complete.assert_not_called()

    # Verify same response content
    assert response2.message == response1.message

    # Verify cache hit is faster than cache miss
    assert second_latency < first_latency

    # Verify cache hit latency meets <500ms requirement
    assert second_latency < 500, f"Cache hit latency {second_latency}ms exceeds 500ms requirement"


@pytest.mark.integration
@pytest.mark.asyncio
async def test_semantic_similarity_cache_hit_with_real_redis(
    redis_cache, mock_llm_provider, mock_embeddings_provider
):
    """Test semantic cache: similar queries (different wording) hit cache."""
    agent = CAGAgent(
        provider=mock_llm_provider,
        cache=redis_cache,
        embeddings=mock_embeddings_provider,
    )

    # First query
    request1 = ChatRequest(
        message="Can I get a refund?",
        session_id="550e8400-e29b-41d4-a716-446655440000",
    )

    response1 = await agent.run(request1)
    assert response1.metrics.cache_status == "miss"

    # Reset embeddings mock to return similar (but not identical) embedding
    # Simulate semantic similarity with slight variation
    similar_embedding = [1.05, 2.05, 3.05, 4.05, 5.05]
    mock_embeddings_provider.embed = AsyncMock(return_value=similar_embedding)

    # Second query - different wording but semantically similar
    request2 = ChatRequest(
        message="Can I get refund?",  # Slightly different (missing "a")
        session_id="550e8400-e29b-41d4-a716-446655440001",
    )

    mock_llm_provider.complete.reset_mock()
    response2 = await agent.run(request2)

    # Verify cache hit (semantic similarity)
    assert response2.metrics.cache_status == "hit"
    assert response2.metrics.cost == 0.0

    # Verify similarity score is high but not perfect
    cache_logs = [log for log in response2.logs if log.type == LogType.CACHE]
    assert len(cache_logs) == 1
    assert cache_logs[0].data["operation"] == "hit"
    assert 0.85 <= cache_logs[0].data["similarity_score"] < 1.0

    # Verify provider was NOT called
    mock_llm_provider.complete.assert_not_called()


@pytest.mark.integration
@pytest.mark.asyncio
async def test_cache_miss_when_similarity_below_threshold(
    redis_cache, mock_llm_provider, mock_embeddings_provider
):
    """Test cache miss when query similarity is below 0.85 threshold."""
    # Clear cache to ensure clean state
    await redis_cache._client.delete("cag_cache")

    agent = CAGAgent(
        provider=mock_llm_provider,
        cache=redis_cache,
        embeddings=mock_embeddings_provider,
    )

    # First query with specific embedding
    first_embedding = [1.0, 2.0, 3.0, 4.0, 5.0]
    mock_embeddings_provider.embed = AsyncMock(return_value=first_embedding)

    request1 = ChatRequest(
        message="Can I get a refund?",
        session_id="550e8400-e29b-41d4-a716-446655440000",
    )

    response1 = await agent.run(request1)
    assert response1.metrics.cache_status == "miss"

    # Second query - very different embedding (orthogonal vector for low similarity)
    # Use a vector that's orthogonal to [1,2,3,4,5]
    different_embedding = [-2.0, 1.0, 0.0, 0.0, 0.0]  # Will have low cosine similarity
    mock_embeddings_provider.embed = AsyncMock(return_value=different_embedding)

    request2 = ChatRequest(
        message="What is your pricing?",  # Different topic
        session_id="550e8400-e29b-41d4-a716-446655440001",
    )

    mock_llm_provider.complete.reset_mock()
    response2 = await agent.run(request2)

    # Verify cache miss (different topic with low similarity)
    assert response2.metrics.cache_status == "miss"
    assert response2.metrics.cost > 0

    # Verify provider WAS called
    mock_llm_provider.complete.assert_called_once()


@pytest.mark.integration
@pytest.mark.asyncio
async def test_cache_eviction_after_1000_items(
    redis_cache, mock_llm_provider, mock_embeddings_provider
):
    """Test that cache is trimmed to 1000 items (LRU approximation)."""
    # Add 1001 items to cache
    for i in range(1001):
        embedding = [float(i), float(i + 1), float(i + 2)]
        payload = {"message": f"Response {i}", "metrics": {}, "timestamp": time.time()}
        await redis_cache.set(embedding=embedding, payload=payload)

    # Verify cache size is limited to 1000
    cache_size = await redis_cache._client.llen("cag_cache")
    assert cache_size == 1000, f"Expected cache size 1000, got {cache_size}"


@pytest.mark.integration
@pytest.mark.asyncio
async def test_cache_ttl_expiration(redis_cache):
    """Test that cache entries expire after TTL."""
    # Create cache with very short TTL (2 seconds)
    short_ttl_cache = RedisSemanticCache(ttl_seconds=2)

    try:
        # Add item to cache
        embedding = [1.0, 2.0, 3.0]
        payload = {"message": "Test", "metrics": {}, "timestamp": time.time()}
        await short_ttl_cache.set(embedding=embedding, payload=payload)

        # Verify item exists
        cached, score = await short_ttl_cache.get(embedding=embedding)
        assert cached is not None

        # Wait for TTL to expire
        await asyncio.sleep(3)

        # Verify item is gone
        cached_after, score_after = await short_ttl_cache.get(embedding=embedding)
        assert cached_after is None

    finally:
        await short_ttl_cache.close()
