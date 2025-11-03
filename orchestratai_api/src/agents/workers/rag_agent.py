"""RAG (Retrieval-Augmented Generation) agent implementation."""

import time
import uuid
from datetime import UTC, datetime
from typing import Any

from src.agents.base import BaseAgent
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
from src.retrieval.vector_store import VectorStore


class RAGAgent(BaseAgent):
    """RAG agent that retrieves documents and generates contextual responses.

    This agent:
    1. Embeds the user's query
    2. Searches the vector database for relevant documents
    3. Assembles context from retrieved chunks
    4. Calls the LLM with system prompt + context + query
    5. Returns response with retrieval logs and metrics
    """

    def __init__(
        self,
        *,
        provider: BaseLLMProvider,
        vector_store: VectorStore,
        top_k: int = 5,
    ):
        """Initialize RAG agent.

        Args:
            provider: LLM provider for generation
            vector_store: Vector database for retrieval
            top_k: Number of documents to retrieve
        """
        super().__init__(role=AgentRole.RAG, provider=provider)
        self.vector_store = vector_store
        self.top_k = top_k

    async def run(self, request: ChatRequest, **kwargs: Any) -> ChatResponse:
        """Execute RAG workflow: retrieve documents and generate response.

        Args:
            request: Incoming chat request
            **kwargs: Additional parameters (unused)

        Returns:
            ChatResponse with message, retrieval logs, and metrics
        """
        start_time = time.perf_counter()
        query = request.message

        # Step 1: Retrieve documents with similarity scores
        retrieval_start = time.perf_counter()
        results = await self.vector_store.similarity_search_with_scores(
            query=query,
            k=self.top_k,
        )
        retrieval_latency = int((time.perf_counter() - retrieval_start) * 1000)

        # Step 2: Extract documents and scores
        documents = [doc for doc, _ in results]
        # ChromaDB returns distance (lower is better), convert to similarity (0-1)
        # Distance of 0 = perfect match (similarity 1.0), distance of 2 = poor match
        similarities = [max(0.0, 1.0 - (score / 2.0)) for _, score in results]

        # Step 3: Build document chunks for logging
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

        # Step 4: Assemble context from retrieved documents
        context = "\n\n".join(
            [
                f"Document {i + 1} (similarity: {sim:.2f}):\n{doc.page_content}"
                for i, (doc, sim) in enumerate(zip(documents, similarities, strict=False))
            ]
        )

        # Step 5: Build messages with system prompt + context + query
        system_prompt = """You are a helpful AI assistant with access to relevant documents.
Use the provided context to answer the user's question accurately.
If the context doesn't contain enough information, say so clearly.
Always cite which documents you used in your response."""

        messages = [
            {"role": "system", "content": system_prompt},
            {
                "role": "user",
                "content": f"Context:\n{context}\n\nQuestion: {query}",
            },
        ]

        # Step 6: Call LLM provider
        llm_start = time.perf_counter()
        result = await self.provider.complete(messages=messages)
        llm_latency = int((time.perf_counter() - llm_start) * 1000)

        # Step 7: Record metrics
        metrics_data = await self._record(
            start=start_time,
            result=result,
            extra={
                "sources_used": len(chunks),
                "retrieval_latency_ms": retrieval_latency,
                "llm_latency_ms": llm_latency,
            },
        )

        # Step 8: Build retrieval logs
        now = datetime.now(UTC).isoformat()
        logs = [
            RetrievalLog(
                id=str(uuid.uuid4()),
                type=LogType.VECTOR_SEARCH,
                title=f"Retrieved {len(chunks)} documents from knowledge base",
                data={
                    "collection": "knowledge_base_v1",
                    "chunks_retrieved": len(chunks),
                    "chunks": [
                        {
                            "id": chunk.id,
                            "content": chunk.content[:200] + "..."
                            if len(chunk.content) > 200
                            else chunk.content,
                            "similarity": chunk.similarity,
                            "source": chunk.source,
                        }
                        for chunk in chunks
                    ],
                    "latency": retrieval_latency,
                },
                timestamp=now,
                status=LogStatus.SUCCESS,
                chunks=chunks,
            ),
        ]

        # Step 9: Build chat metrics
        total_latency = int((time.perf_counter() - start_time) * 1000)
        chat_metrics = ChatMetrics(
            tokensUsed=metrics_data.tokens_input + metrics_data.tokens_output,
            cost=metrics_data.cost_total,
            latency=total_latency,
            cache_status="none",
        )

        # Step 10: Build agent status map
        agent_status = {
            AgentId.ORCHESTRATOR: AgentStatus.COMPLETE,
            AgentId.BILLING: AgentStatus.IDLE,
            AgentId.TECHNICAL: AgentStatus.COMPLETE,  # RAG agent uses TECHNICAL id
            AgentId.POLICY: AgentStatus.IDLE,
        }

        # Step 11: Return complete response
        return ChatResponse(
            message=result.content,
            agent=AgentId.TECHNICAL,  # RAG agent maps to TECHNICAL
            confidence=0.85,  # Default confidence for RAG responses
            logs=logs,
            metrics=chat_metrics,
            agent_status=agent_status,
        )
