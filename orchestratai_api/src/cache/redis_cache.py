"""Redis-based semantic cache for CAG agent."""

import json
from typing import Any

import numpy as np
import redis.asyncio as redis

from src.llm.secrets import resolve_secret


def cosine_similarity(vec1: list[float], vec2: list[float]) -> float:
    """Compute cosine similarity between two vectors.

    Args:
        vec1: First vector
        vec2: Second vector

    Returns:
        Cosine similarity score (0.0-1.0)
        - 1.0 = identical vectors
        - 0.85+ = very similar (typical cache hit threshold)
        - < 0.85 = different enough (cache miss)
    """
    a = np.array(vec1)
    b = np.array(vec2)
    return float(np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b)))


class RedisSemanticCache:
    """Semantic cache using Redis for CAG agent.

    Stores query embeddings and their responses. When a new query comes in,
    computes cosine similarity against cached embeddings to find near-matches.

    This allows cache hits for semantically similar queries like:
    - "Can I get refund?" vs "Can I get a refund?" (same meaning, different text)

    Storage format:
    - Redis list key: "cag_cache"
    - Each item: JSON {"embedding": [...], "payload": {...}}
    - List trimmed to max 1000 items (LRU approximation)
    """

    def __init__(self, *, ttl_seconds: int = 3600):
        """Initialize Redis semantic cache.

        Args:
            ttl_seconds: Time-to-live for cache entries in seconds (default: 1 hour)
        """
        # Resolve REDIS_HOST from environment or 1Password
        redis_host = resolve_secret("REDIS_HOST")

        # Initialize async Redis client
        self._client = redis.from_url(f"redis://{redis_host}")
        self._ttl = ttl_seconds

    async def get(
        self,
        *,
        embedding: list[float],
        threshold: float = 0.85,
    ) -> tuple[dict[str, Any] | None, float]:
        """Look up cached response by embedding similarity.

        Args:
            embedding: Query embedding vector
            threshold: Minimum cosine similarity for cache hit (default: 0.85)

        Returns:
            Tuple of (payload, similarity_score)
            - If cache hit: (payload_dict, score)
            - If cache miss: (None, 0.0)
        """
        # Retrieve all cache entries from list
        items = await self._client.lrange("cag_cache", 0, -1)

        # Check each cached embedding for similarity
        for raw in items:
            record = json.loads(raw)
            score = cosine_similarity(record["embedding"], embedding)

            # Return first match above threshold
            if score >= threshold:
                return record["payload"], score

        # No match found
        return None, 0.0

    async def set(self, *, embedding: list[float], payload: dict[str, Any]) -> None:
        """Store a query embedding and its response in cache.

        Args:
            embedding: Query embedding vector
            payload: Response data to cache
        """
        # Serialize cache entry
        cache_entry = json.dumps(
            {
                "embedding": embedding,
                "payload": payload,
            }
        )

        # Add to front of list (newest first)
        await self._client.lpush("cag_cache", cache_entry)

        # Trim list to max 1000 items (LRU approximation)
        await self._client.ltrim("cag_cache", 0, 999)

        # Set expiration on the entire list
        await self._client.expire("cag_cache", self._ttl)

    async def close(self) -> None:
        """Close Redis connection."""
        await self._client.aclose()
