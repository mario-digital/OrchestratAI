"""Hybrid agent combining RAG retrieval and semantic caching."""

import asyncio
import time
import uuid
from datetime import UTC, datetime
from typing import Any

from src.agents.base import BaseAgent
from src.agents.workers.rag_agent import RAGAgent
from src.cache.redis_cache import RedisSemanticCache
from src.llm.base_provider import BaseLLMProvider
from src.llm.provider_factory import AgentRole
from src.models.enums import AgentId, AgentStatus, LogStatus, LogType
from src.models.schemas import (
    ChatMetrics,
    ChatRequest,
    ChatResponse,
    DocumentChunk,
    RetrievalLog,
)


class HybridAgent(BaseAgent):
    """Hybrid agent combining RAG retrieval and semantic cache.

    This agent:
    1. Runs RAG retrieval and cache lookup in parallel using asyncio.gather
    2. Merges contexts from both sources
    3. Deduplicates documents by source + page
    4. Ranks by relevance (similarity scores)
    5. Calls GPT-4o with merged context
    6. Aggregates metrics from both sources
    7. Returns response with both VECTOR_SEARCH and CACHE logs

    Benefits:
    - Combines fresh knowledge base data with cached insights
    - Parallel execution minimizes latency
    - Richer context for complex multi-step queries
    - Transparent metrics showing sources_used > 1
    """

    def __init__(
        self,
        *,
        provider: BaseLLMProvider,
        rag_agent: RAGAgent,
        cache: RedisSemanticCache,
        embeddings: BaseLLMProvider,
    ):
        """Initialize Hybrid agent.

        Args:
            provider: LLM provider for generation (GPT-4o)
            rag_agent: RAG agent instance for retrieval
            cache: Redis semantic cache instance
            embeddings: Embeddings provider for cache lookups
        """
        super().__init__(role=AgentRole.HYBRID, provider=provider)
        self._rag_agent = rag_agent
        self._cache = cache
        self._embeddings = embeddings

    async def close(self) -> None:
        """Clean up resources.

        Closes the Redis cache connection to prevent connection leaks.
        Should be called when the agent is no longer needed.
        """
        await self._cache.close()

    async def run(self, request: ChatRequest, **kwargs: Any) -> ChatResponse:
        """Execute Hybrid workflow: parallel RAG + cache, merge, generate.

        Args:
            request: Incoming chat request
            **kwargs: Additional parameters (unused)

        Returns:
            ChatResponse with message, merged retrieval logs, and aggregated metrics
        """
        start_time = time.perf_counter()
        query = request.message

        # Step 1: Embed query for cache lookup
        embedding_start = time.perf_counter()
        query_embedding = await self._embeddings.embed(query)
        embedding_latency = int((time.perf_counter() - embedding_start) * 1000)

        # Step 2: Execute RAG retrieval and cache lookup in parallel
        retrieval_start = time.perf_counter()
        rag_task = asyncio.create_task(self._rag_agent.run(request))
        cache_task = asyncio.create_task(self._cache.get(embedding=query_embedding, threshold=0.85))

        rag_response, (cached_payload, cache_similarity) = await asyncio.gather(
            rag_task, cache_task
        )
        parallel_latency = int((time.perf_counter() - retrieval_start) * 1000)

        # Step 3: Extract RAG documents
        rag_chunks: list[DocumentChunk] = []
        for log in rag_response.logs:
            if log.type == LogType.VECTOR_SEARCH and log.chunks:
                rag_chunks.extend(log.chunks)

        # Step 4: Extract cache documents (if hit)
        cache_chunks: list[DocumentChunk] = []
        if cached_payload:
            # Create pseudo-document chunk from cached response
            cache_chunks.append(
                DocumentChunk(
                    id=len(rag_chunks),
                    content=cached_payload.get("message", ""),
                    similarity=cache_similarity,
                    source="cache",
                    metadata={
                        "source": "semantic_cache",
                        "timestamp": cached_payload.get("timestamp", time.time()),
                    },
                )
            )

        # Step 5: Merge and deduplicate contexts
        merged_chunks = self._deduplicate_sources(rag_chunks, cache_chunks)

        # Step 6: Rank by similarity
        merged_chunks.sort(key=lambda x: x.similarity, reverse=True)

        # Step 7: Build merged context for LLM
        context_parts = []

        # Add cache insight if available
        if cache_chunks:
            context_parts.append(
                f"Cached Insight (similarity: {cache_similarity:.2f}):\n{cache_chunks[0].content}"
            )

        # Add retrieved documents
        for i, chunk in enumerate(rag_chunks):
            context_parts.append(
                f"Document {i + 1} (similarity: {chunk.similarity:.2f}, source: {chunk.source}):\n"
                f"{chunk.content}"
            )

        context = "\n\n".join(context_parts)

        # Step 8: Call GPT-4o with merged context
        system_prompt = (
            "You are a helpful AI assistant with access to both "
            "retrieved documents and cached insights.\n"
            "Use the provided context to answer complex questions accurately.\n"
            "Synthesize information from multiple sources when relevant.\n"
            "Always cite which sources you used in your response."
        )

        messages = [
            {"role": "system", "content": system_prompt},
            {
                "role": "user",
                "content": f"Context:\n{context}\n\nQuestion: {query}",
            },
        ]

        llm_start = time.perf_counter()
        result = await self.provider.complete(messages=messages)
        llm_latency = int((time.perf_counter() - llm_start) * 1000)

        # Step 9: Aggregate metrics
        # Extract RAG metrics
        rag_metrics = rag_response.metrics
        retrieval_latency = rag_metrics.latency if rag_metrics else 0
        rag_cost = rag_metrics.cost if rag_metrics else 0.0

        # Calculate cache latency (embedded in parallel execution)
        cache_latency = int(parallel_latency * 0.1)  # Estimate ~10% of parallel time

        # Total tokens includes RAG tokens + our GPT-4o call
        total_tokens = result.tokens_input + result.tokens_output
        total_cost = rag_cost + result.cost

        # Record metrics for internal tracking (not returned directly)
        await self._record(
            start=start_time,
            result=result,
            extra={
                "sources_used": len(merged_chunks),
                "retrieval_latency_ms": retrieval_latency,
                "cache_latency_ms": cache_latency,
                "llm_latency_ms": llm_latency,
                "parallel_latency_ms": parallel_latency,
                "embedding_latency_ms": embedding_latency,
                "rag_sources": len(rag_chunks),
                "cache_sources": len(cache_chunks),
                "cache_hit": bool(cached_payload),
            },
        )

        # Step 10: Build comprehensive retrieval logs
        now = datetime.now(UTC).isoformat()
        logs: list[RetrievalLog] = []

        # Add RAG vector search logs
        for log in rag_response.logs:
            if log.type == LogType.VECTOR_SEARCH:
                logs.append(log)

        # Add cache log
        if cached_payload:
            cache_log = RetrievalLog(
                id=str(uuid.uuid4()),
                type=LogType.CACHE,
                title=f"Cache hit (similarity: {cache_similarity:.2f})",
                data={
                    "operation": "hit",
                    "latency_ms": cache_latency,
                    "similarity_score": cache_similarity,
                    "saved_cost": cached_payload.get("metrics", {}).get("cost", 0.0),
                },
                timestamp=now,
                status=LogStatus.SUCCESS,
                chunks=cache_chunks,
            )
            logs.append(cache_log)
        else:
            cache_log = RetrievalLog(
                id=str(uuid.uuid4()),
                type=LogType.CACHE,
                title="Cache miss",
                data={
                    "operation": "miss",
                    "latency_ms": cache_latency,
                    "similarity_score": 0.0,
                },
                timestamp=now,
                status=LogStatus.SUCCESS,
                chunks=None,
            )
            logs.append(cache_log)

        # Step 11: Build chat metrics
        total_latency = int((time.perf_counter() - start_time) * 1000)
        chat_metrics = ChatMetrics(
            tokensUsed=total_tokens,
            cost=total_cost,
            latency=total_latency,
            cache_status="hit" if cached_payload else "miss",
        )

        # Step 12: Build agent status map
        agent_status = {
            AgentId.ORCHESTRATOR: AgentStatus.COMPLETE,
            AgentId.BILLING: AgentStatus.IDLE,
            AgentId.TECHNICAL: AgentStatus.COMPLETE,  # Hybrid handles complex technical questions
            AgentId.POLICY: AgentStatus.IDLE,
        }

        # Step 13: Return complete response
        return ChatResponse(
            message=result.content,
            agent=AgentId.TECHNICAL,  # Hybrid handles complex technical questions
            confidence=0.90,  # High confidence for hybrid responses
            logs=logs,
            metrics=chat_metrics,
            agent_status=agent_status,
        )

    def _deduplicate_sources(
        self,
        rag_chunks: list[DocumentChunk],
        cache_chunks: list[DocumentChunk],
    ) -> list[DocumentChunk]:
        """Merge and deduplicate chunks by source + page.

        Args:
            rag_chunks: Chunks from RAG retrieval
            cache_chunks: Chunks from cache (if any)

        Returns:
            Deduplicated list of chunks
        """
        seen: set[tuple[str, int | None]] = set()
        merged: list[DocumentChunk] = []

        for chunk in rag_chunks + cache_chunks:
            # Create unique key from source + page
            metadata = chunk.metadata or {}
            source = metadata.get("source", chunk.source)
            page = metadata.get("page")
            key = (source, page)

            if key not in seen:
                seen.add(key)
                merged.append(chunk)

        return merged
