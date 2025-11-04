"""CAG (Cached-Augmented Generation) agent implementation."""

import time
import uuid
from datetime import UTC, datetime
from typing import Any

from langchain_core.documents import Document

from src.agents.base import BaseAgent
from src.cache.redis_cache import RedisSemanticCache
from src.llm.base_provider import BaseLLMProvider
from src.llm.provider_factory import AgentRole
from src.models.enums import AgentId, AgentStatus, LogStatus, LogType
from src.models.schemas import ChatMetrics, ChatRequest, ChatResponse, DocumentChunk, RetrievalLog
from src.retrieval.vector_store import VectorStore


class _NullVectorStore(VectorStore):
    """Fallback vector store used when none is provided.

    This implementation returns empty results and performs no persistence. It
    allows the agent to be instantiated in tests without requiring a concrete
    vector store implementation.
    """

    async def add_documents(self, *, documents: list[Document]) -> None:  # type: ignore[override]
        return None

    async def similarity_search(self, *, query: str, k: int = 5) -> list[Document]:  # type: ignore[override]
        return []

    async def similarity_search_with_scores(
        self, *, query: str, k: int = 5
    ) -> list[tuple[Document, float]]:  # type: ignore[override]
        return []

    async def clear(self) -> None:
        return None

    async def health_check(self) -> bool:
        return True


class CAGAgent(BaseAgent):
    """CAG agent with semantic caching and RAG retrieval.

    This agent:
    1. Embeds the user's query using embeddings provider
    2. Checks semantic cache for similar queries
    3. If cache hit: Returns cached response with cost=0
    4. If cache miss:
       a. Retrieves relevant documents from ChromaDB
       b. Calls LLM provider with retrieved context
       c. Caches result
    5. Returns response with cache metrics

    Cost savings:
    - Cache hit: $0 (instant response)
    - Cache miss: Full LLM cost but with accurate context from knowledge base
    - With 70% hit rate: ~70% cost reduction
    """

    def __init__(
        self,
        *,
        provider: BaseLLMProvider,
        cache: RedisSemanticCache,
        embeddings: BaseLLMProvider,
        vector_store: VectorStore | None = None,
    ):
        """Initialize CAG agent.

        Args:
            provider: LLM provider for generation (Bedrock Haiku)
            cache: Redis semantic cache instance
            embeddings: Embeddings provider (OpenAI text-embedding-3-large)
            vector_store: Vector store for RAG retrieval
        """
        super().__init__(role=AgentRole.CAG, provider=provider)
        self._cache = cache
        self._embeddings = embeddings
        self._vector_store = vector_store or _NullVectorStore()

    @property
    def vector_store(self) -> VectorStore:
        """Vector store accessor (primarily for testing)."""

        return self._vector_store

    @vector_store.setter
    def vector_store(self, value: VectorStore) -> None:
        self._vector_store = value

    async def close(self) -> None:
        """Clean up resources.

        Closes the Redis cache connection to prevent connection leaks.
        Should be called when the agent is no longer needed.
        """
        await self._cache.close()

    async def run(self, request: ChatRequest, **kwargs: Any) -> ChatResponse:
        """Execute CAG workflow: check cache or generate response.

        Args:
            request: Incoming chat request
            **kwargs: Additional parameters including 'intent' for routing

        Returns:
            ChatResponse with message, cache logs, and metrics
        """
        start_time = time.perf_counter()
        query = request.message

        # Extract intent to determine which agent ID to return
        intent = kwargs.get("intent", "")

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
                intent=intent,
            )

        # Step 4: Cache miss - retrieve from ChromaDB
        retrieval_start = time.perf_counter()
        results = await self._vector_store.similarity_search_with_scores(
            query=query,
            k=5,  # Top 5 most relevant documents
        )
        retrieval_latency = int((time.perf_counter() - retrieval_start) * 1000)

        # Extract documents and scores
        documents = [doc for doc, _ in results]
        # ChromaDB returns distance (lower is better), convert to similarity (0-1)
        # Distance of 0 = perfect match (similarity 1.0), distance of 2 = poor match
        similarities = [max(0.0, 1.0 - (score / 2.0)) for _, score in results]

        # Build document chunks for logging
        chunks = [
            DocumentChunk(
                id=i,
                content=doc.page_content,
                similarity=sim,
                source=doc.metadata.get("source", "unknown"),
                metadata=doc.metadata,
            )
            for i, (doc, sim) in enumerate(zip(documents, similarities, strict=False))
        ]

        # Build context from retrieved documents
        context = "\n\n".join(
            [f"[Document {i + 1}]\n{doc.page_content}" for i, (doc, _score) in enumerate(results)]
        )

        # Step 5: Call LLM provider with retrieved context
        llm_start = time.perf_counter()
        system_prompt = (
            "You are a helpful AI assistant specializing in policy and pricing questions. "
            "Use the provided context documents to answer the user's question accurately. "
            "If the context doesn't contain relevant information, acknowledge that and "
            "provide a general response."
        )

        user_message = f"Context:\n{context}\n\nQuestion: {query}"

        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_message},
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
            retrieval_latency=retrieval_latency,
            chunks=chunks,
            intent=intent,
        )

    def _build_cache_hit_response(
        self,
        *,
        cached_payload: dict[str, Any],
        similarity: float,
        total_latency: int,
        cache_latency: int,
        intent: str = "",
    ) -> ChatResponse:
        """Build response for cache hit.

        Args:
            cached_payload: Cached response data
            similarity: Cosine similarity score
            total_latency: Total response time in ms
            cache_latency: Cache lookup time in ms
            intent: Question intent (PRICING_QUESTION or POLICY_QUESTION)

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

        # Determine which agent ID to return based on intent
        # PRICING_QUESTION → BILLING, POLICY_QUESTION → POLICY
        is_policy = intent == "POLICY_QUESTION"
        agent_id = AgentId.POLICY if is_policy else AgentId.BILLING

        # Build agent status
        agent_status = {
            AgentId.ORCHESTRATOR: AgentStatus.COMPLETE,
            AgentId.BILLING: AgentStatus.COMPLETE if not is_policy else AgentStatus.IDLE,
            AgentId.TECHNICAL: AgentStatus.IDLE,
            AgentId.POLICY: AgentStatus.COMPLETE if is_policy else AgentStatus.IDLE,
        }

        return ChatResponse(
            message=cached_payload["message"],
            agent=agent_id,
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
        retrieval_latency: int,
        chunks: list[DocumentChunk],
        intent: str = "",
    ) -> ChatResponse:
        """Build response for cache miss.

        Args:
            result: LLM call result
            metrics_data: Agent metrics from _record
            total_latency: Total response time in ms
            cache_latency: Cache lookup time in ms
            llm_latency: LLM call time in ms
            retrieval_latency: Document retrieval time in ms
            chunks: Retrieved document chunks
            intent: Question intent (PRICING_QUESTION or POLICY_QUESTION)

        Returns:
            ChatResponse with generated message and cache miss metrics
        """
        now = datetime.now(UTC).isoformat()

        # Build retrieval logs
        logs: list[RetrievalLog] = []

        # Add vector search log
        vector_log = RetrievalLog(
            id=str(uuid.uuid4()),
            type=LogType.VECTOR_SEARCH,
            title=f"Retrieved {len(chunks)} documents from knowledge base",
            data={
                "collection_name": "knowledge_base_v1",
                "chunks": len(chunks),
                "latency_ms": retrieval_latency,
            },
            timestamp=now,
            status=LogStatus.SUCCESS,
            chunks=chunks,
        )
        logs.append(vector_log)

        # Add cache log
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
        logs.append(cache_log)

        # Build metrics
        chat_metrics = ChatMetrics(
            tokensUsed=metrics_data.tokens_input + metrics_data.tokens_output,
            cost=metrics_data.cost_total,
            latency=total_latency,
            cache_status="miss",
        )

        # Determine which agent ID to return based on intent
        # PRICING_QUESTION → BILLING, POLICY_QUESTION → POLICY
        is_policy = intent == "POLICY_QUESTION"
        agent_id = AgentId.POLICY if is_policy else AgentId.BILLING

        # Build agent status
        agent_status = {
            AgentId.ORCHESTRATOR: AgentStatus.COMPLETE,
            AgentId.BILLING: AgentStatus.COMPLETE if not is_policy else AgentStatus.IDLE,
            AgentId.TECHNICAL: AgentStatus.IDLE,
            AgentId.POLICY: AgentStatus.COMPLETE if is_policy else AgentStatus.IDLE,
        }

        return ChatResponse(
            message=result.content,
            agent=agent_id,
            confidence=0.85,  # Default confidence for CAG responses
            logs=logs,
            metrics=chat_metrics,
            agent_status=agent_status,
        )
