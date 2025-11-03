"""CAG (Cached-Augmented Generation) agent implementation."""

import time
import uuid
from datetime import UTC, datetime
from typing import Any

from src.agents.base import BaseAgent
from src.cache.redis_cache import RedisSemanticCache
from src.llm.base_provider import BaseLLMProvider
from src.llm.provider_factory import AgentRole
from src.models.enums import AgentId, AgentStatus, LogStatus, LogType
from src.models.schemas import ChatMetrics, ChatRequest, ChatResponse, RetrievalLog


class CAGAgent(BaseAgent):
    """CAG agent with semantic caching in Redis.

    This agent:
    1. Embeds the user's query using embeddings provider
    2. Checks semantic cache for similar queries
    3. If cache hit: Returns cached response with cost=0
    4. If cache miss: Calls LLM provider and caches result
    5. Returns response with cache metrics

    Cost savings:
    - Cache hit: $0 (instant response)
    - Cache miss: Full LLM cost (Bedrock Haiku ~$0.0004 per query)
    - With 70% hit rate: ~70% cost reduction
    """

    def __init__(
        self,
        *,
        provider: BaseLLMProvider,
        cache: RedisSemanticCache,
        embeddings: BaseLLMProvider,
    ):
        """Initialize CAG agent.

        Args:
            provider: LLM provider for generation (Bedrock Haiku)
            cache: Redis semantic cache instance
            embeddings: Embeddings provider (OpenAI text-embedding-3-large)
        """
        super().__init__(role=AgentRole.CAG, provider=provider)
        self._cache = cache
        self._embeddings = embeddings

    async def run(self, request: ChatRequest, **kwargs: Any) -> ChatResponse:
        """Execute CAG workflow: check cache or generate response.

        Args:
            request: Incoming chat request
            **kwargs: Additional parameters (unused)

        Returns:
            ChatResponse with message, cache logs, and metrics
        """
        start_time = time.perf_counter()
        query = request.message

        # Step 1: Embed query using embeddings provider
        embedding_start = time.perf_counter()
        query_embedding = await self._embeddings.embed(query)
        embedding_latency = int((time.perf_counter() - embedding_start) * 1000)

        # Step 2: Check cache for similar queries
        cache_start = time.perf_counter()
        cached, similarity = await self._cache.get(embedding=query_embedding, threshold=0.85)
        cache_latency = int((time.perf_counter() - cache_start) * 1000)

        # Step 3: Handle cache hit
        if cached:
            return self._build_cache_hit_response(
                cached_payload=cached,
                similarity=similarity,
                total_latency=int((time.perf_counter() - start_time) * 1000),
                cache_latency=cache_latency,
            )

        # Step 4: Cache miss - call LLM provider
        llm_start = time.perf_counter()
        system_prompt = (
            "You are a helpful AI assistant specializing in policy and pricing questions. "
            "Provide clear, concise answers based on company policies. "
            "If you're unsure, acknowledge the uncertainty."
        )

        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": query},
        ]

        result = await self.provider.complete(messages=messages)
        llm_latency = int((time.perf_counter() - llm_start) * 1000)

        # Step 5: Record metrics
        metrics_data = await self._record(
            start=start_time,
            result=result,
            extra={
                "cache_hit": False,
                "embedding_latency_ms": embedding_latency,
                "cache_lookup_latency_ms": cache_latency,
                "llm_latency_ms": llm_latency,
            },
        )

        # Step 6: Persist to cache
        payload = {
            "message": result.content,
            "metrics": {
                "tokens_input": result.tokens_input,
                "tokens_output": result.tokens_output,
                "cost": result.cost,
            },
            "timestamp": time.time(),
        }
        await self._cache.set(embedding=query_embedding, payload=payload)

        # Step 7: Build response with cache miss logs
        return self._build_cache_miss_response(
            result=result,
            metrics_data=metrics_data,
            total_latency=int((time.perf_counter() - start_time) * 1000),
            cache_latency=cache_latency,
            llm_latency=llm_latency,
        )

    def _build_cache_hit_response(
        self,
        *,
        cached_payload: dict[str, Any],
        similarity: float,
        total_latency: int,
        cache_latency: int,
    ) -> ChatResponse:
        """Build response for cache hit.

        Args:
            cached_payload: Cached response data
            similarity: Cosine similarity score
            total_latency: Total response time in ms
            cache_latency: Cache lookup time in ms

        Returns:
            ChatResponse with cached message and cache hit metrics
        """
        now = datetime.now(UTC).isoformat()

        # Extract cached metrics
        cached_metrics = cached_payload.get("metrics", {})
        saved_cost = cached_metrics.get("cost", 0.0)

        # Build cache log
        cache_log = RetrievalLog(
            id=str(uuid.uuid4()),
            type=LogType.CACHE,
            title=f"Cache hit (similarity: {similarity:.2f})",
            data={
                "operation": "hit",
                "latency_ms": cache_latency,
                "similarity_score": similarity,
                "saved_cost": saved_cost,
            },
            timestamp=now,
            status=LogStatus.SUCCESS,
            chunks=None,
        )

        # Build metrics (cost=0 for cache hit)
        chat_metrics = ChatMetrics(
            tokensUsed=0,
            cost=0.0,
            latency=total_latency,
            cache_status="hit",
        )

        # Build agent status
        agent_status = {
            AgentId.ORCHESTRATOR: AgentStatus.COMPLETE,
            AgentId.BILLING: AgentStatus.IDLE,
            AgentId.TECHNICAL: AgentStatus.IDLE,
            AgentId.POLICY: AgentStatus.COMPLETE,  # CAG agent maps to POLICY
        }

        return ChatResponse(
            message=cached_payload["message"],
            agent=AgentId.POLICY,  # CAG agent maps to POLICY
            confidence=0.90,  # High confidence for cached responses
            logs=[cache_log],
            metrics=chat_metrics,
            agent_status=agent_status,
        )

    def _build_cache_miss_response(
        self,
        *,
        result: Any,
        metrics_data: Any,
        total_latency: int,
        cache_latency: int,
        llm_latency: int,
    ) -> ChatResponse:
        """Build response for cache miss.

        Args:
            result: LLM call result
            metrics_data: Agent metrics from _record
            total_latency: Total response time in ms
            cache_latency: Cache lookup time in ms
            llm_latency: LLM call time in ms

        Returns:
            ChatResponse with generated message and cache miss metrics
        """
        now = datetime.now(UTC).isoformat()

        # Build cache log
        cache_log = RetrievalLog(
            id=str(uuid.uuid4()),
            type=LogType.CACHE,
            title="Cache miss - generated new response",
            data={
                "operation": "miss",
                "latency_ms": cache_latency,
                "similarity_score": 0.0,
                "saved_cost": 0.0,
            },
            timestamp=now,
            status=LogStatus.SUCCESS,
            chunks=None,
        )

        # Build metrics
        chat_metrics = ChatMetrics(
            tokensUsed=metrics_data.tokens_input + metrics_data.tokens_output,
            cost=metrics_data.cost_total,
            latency=total_latency,
            cache_status="miss",
        )

        # Build agent status
        agent_status = {
            AgentId.ORCHESTRATOR: AgentStatus.COMPLETE,
            AgentId.BILLING: AgentStatus.IDLE,
            AgentId.TECHNICAL: AgentStatus.IDLE,
            AgentId.POLICY: AgentStatus.COMPLETE,  # CAG agent maps to POLICY
        }

        return ChatResponse(
            message=result.content,
            agent=AgentId.POLICY,  # CAG agent maps to POLICY
            confidence=0.85,  # Default confidence for CAG responses
            logs=[cache_log],
            metrics=chat_metrics,
            agent_status=agent_status,
        )
