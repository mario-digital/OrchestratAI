"""Tests for Redis semantic cache."""

import json
from unittest.mock import AsyncMock, patch

import pytest

from src.cache.redis_cache import RedisSemanticCache, cosine_similarity


class TestCosineSimilarity:
    """Tests for cosine similarity calculation."""

    def test_identical_vectors(self) -> None:
        """Test cosine similarity of identical vectors."""
        vec = [1.0, 2.0, 3.0]
        similarity = cosine_similarity(vec, vec)
        assert similarity == pytest.approx(1.0, abs=1e-6)

    def test_orthogonal_vectors(self) -> None:
        """Test cosine similarity of orthogonal vectors."""
        vec1 = [1.0, 0.0, 0.0]
        vec2 = [0.0, 1.0, 0.0]
        similarity = cosine_similarity(vec1, vec2)
        assert similarity == pytest.approx(0.0, abs=1e-6)

    def test_opposite_vectors(self) -> None:
        """Test cosine similarity of opposite vectors."""
        vec1 = [1.0, 2.0, 3.0]
        vec2 = [-1.0, -2.0, -3.0]
        similarity = cosine_similarity(vec1, vec2)
        assert similarity == pytest.approx(-1.0, abs=1e-6)

    def test_similar_vectors(self) -> None:
        """Test cosine similarity of similar vectors."""
        vec1 = [1.0, 2.0, 3.0]
        vec2 = [1.1, 2.1, 2.9]
        similarity = cosine_similarity(vec1, vec2)
        assert similarity > 0.99  # Very similar


class TestRedisSemanticCache:
    """Tests for RedisSemanticCache class."""

    @pytest.fixture
    def mock_redis(self) -> AsyncMock:
        """Create mock Redis client."""
        mock = AsyncMock()
        mock.lrange = AsyncMock(return_value=[])
        mock.lpush = AsyncMock(return_value=1)
        mock.ltrim = AsyncMock(return_value=True)
        mock.expire = AsyncMock(return_value=True)
        mock.aclose = AsyncMock()
        return mock

    @pytest.fixture
    def cache(self, mock_redis: AsyncMock) -> RedisSemanticCache:
        """Create RedisSemanticCache instance with mocked Redis."""
        with patch("src.cache.redis_cache.redis.from_url", return_value=mock_redis):
            with patch("src.cache.redis_cache.resolve_secret", return_value="localhost:6379"):
                cache_instance = RedisSemanticCache(ttl_seconds=3600)
                return cache_instance

    @pytest.mark.asyncio
    async def test_cache_miss(self, cache: RedisSemanticCache, mock_redis: AsyncMock) -> None:
        """Test cache miss when no entries exist."""
        # Setup: Empty cache
        mock_redis.lrange.return_value = []

        # Execute
        embedding = [1.0, 2.0, 3.0]
        payload, score = await cache.get(embedding=embedding)

        # Verify
        assert payload is None
        assert score == 0.0
        mock_redis.lrange.assert_called_once_with("cag_cache", 0, -1)

    @pytest.mark.asyncio
    async def test_cache_hit(self, cache: RedisSemanticCache, mock_redis: AsyncMock) -> None:
        """Test cache hit when similar embedding exists."""
        # Setup: Cache with similar embedding
        cached_embedding = [1.0, 2.0, 3.0]
        cached_payload = {"message": "Cached response", "timestamp": 123.456}
        cache_entry = json.dumps({
            "embedding": cached_embedding,
            "payload": cached_payload,
        })
        mock_redis.lrange.return_value = [cache_entry]

        # Execute: Query with identical embedding
        query_embedding = [1.0, 2.0, 3.0]
        payload, score = await cache.get(embedding=query_embedding, threshold=0.85)

        # Verify
        assert payload == cached_payload
        assert score == pytest.approx(1.0, abs=1e-6)  # Identical vectors

    @pytest.mark.asyncio
    async def test_cache_threshold(self, cache: RedisSemanticCache, mock_redis: AsyncMock) -> None:
        """Test cache miss when similarity below threshold."""
        # Setup: Cache with different embedding
        cached_embedding = [1.0, 0.0, 0.0]  # Orthogonal to query
        cached_payload = {"message": "Cached response"}
        cache_entry = json.dumps({
            "embedding": cached_embedding,
            "payload": cached_payload,
        })
        mock_redis.lrange.return_value = [cache_entry]

        # Execute: Query with orthogonal embedding (similarity ~ 0.0)
        query_embedding = [0.0, 1.0, 0.0]
        payload, score = await cache.get(embedding=query_embedding, threshold=0.85)

        # Verify: Should be cache miss due to low similarity
        assert payload is None
        assert score == 0.0

    @pytest.mark.asyncio
    async def test_set_cache(self, cache: RedisSemanticCache, mock_redis: AsyncMock) -> None:
        """Test setting cache entry."""
        # Setup
        embedding = [1.0, 2.0, 3.0]
        payload = {"message": "New response", "timestamp": 789.012}

        # Execute
        await cache.set(embedding=embedding, payload=payload)

        # Verify: lpush called with serialized entry
        call_args = mock_redis.lpush.call_args
        assert call_args[0][0] == "cag_cache"
        entry_data = json.loads(call_args[0][1])
        assert entry_data["embedding"] == embedding
        assert entry_data["payload"] == payload

        # Verify: ltrim called to limit cache size
        mock_redis.ltrim.assert_called_once_with("cag_cache", 0, 999)

        # Verify: expire called to set TTL
        mock_redis.expire.assert_called_once_with("cag_cache", 3600)

    @pytest.mark.asyncio
    async def test_cache_eviction(self, cache: RedisSemanticCache, mock_redis: AsyncMock) -> None:
        """Test cache eviction (list trimmed to 1000 items)."""
        # Setup
        embedding = [1.0, 2.0, 3.0]
        payload = {"message": "Response"}

        # Execute
        await cache.set(embedding=embedding, payload=payload)

        # Verify: ltrim called with correct limits (0-999 = 1000 items)
        mock_redis.ltrim.assert_called_once_with("cag_cache", 0, 999)

    @pytest.mark.asyncio
    async def test_ttl_setting(self, cache: RedisSemanticCache, mock_redis: AsyncMock) -> None:
        """Test TTL setting on cache entry."""
        # Setup
        embedding = [1.0, 2.0, 3.0]
        payload = {"message": "Response"}

        # Execute
        await cache.set(embedding=embedding, payload=payload)

        # Verify: expire called with TTL
        mock_redis.expire.assert_called_once_with("cag_cache", 3600)

    @pytest.mark.asyncio
    async def test_custom_ttl(self, mock_redis: AsyncMock) -> None:
        """Test custom TTL parameter."""
        # Setup: Create cache with custom TTL
        with patch("src.cache.redis_cache.redis.from_url", return_value=mock_redis):
            with patch("src.cache.redis_cache.resolve_secret", return_value="localhost:6379"):
                custom_cache = RedisSemanticCache(ttl_seconds=7200)

        # Execute
        await custom_cache.set(embedding=[1.0, 2.0], payload={"msg": "test"})

        # Verify: expire called with custom TTL
        mock_redis.expire.assert_called_once_with("cag_cache", 7200)

    @pytest.mark.asyncio
    async def test_close(self, cache: RedisSemanticCache, mock_redis: AsyncMock) -> None:
        """Test closing Redis connection."""
        # Execute
        await cache.close()

        # Verify
        mock_redis.aclose.assert_called_once()
