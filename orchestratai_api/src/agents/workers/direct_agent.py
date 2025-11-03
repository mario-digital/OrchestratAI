"""Direct agent for simple conversational queries without retrieval."""

import time
import uuid
from datetime import UTC, datetime
from typing import Any

from src.agents.base import BaseAgent
from src.llm.base_provider import BaseLLMProvider
from src.llm.provider_factory import AgentRole
from src.models.enums import AgentId, AgentStatus, LogStatus, LogType
from src.models.schemas import ChatMetrics, ChatRequest, ChatResponse, RetrievalLog


class DirectAgent(BaseAgent):
    """Direct agent for fast conversational responses.

    This agent:
    1. Handles simple queries without retrieval or caching
    2. Uses Bedrock Claude 3 Haiku for low cost and latency
    3. Provides conversational responses for greetings, small talk
    4. Serves as final fallback when other agents fail
    5. Returns minimal response with no retrieval logs

    Performance targets:
    - Latency: < 1 second
    - Cost: < $0.001 per query
    - Use cases: greetings, unknown intents, fallback
    """

    def __init__(self, *, provider: BaseLLMProvider):
        """Initialize Direct agent.

        Args:
            provider: LLM provider (Bedrock Claude 3 Haiku)
        """
        super().__init__(role=AgentRole.DIRECT, provider=provider)

    async def run(self, request: ChatRequest, **kwargs: Any) -> ChatResponse:
        """Execute Direct workflow: simple LLM call without retrieval.

        Args:
            request: Incoming chat request
            **kwargs: Additional parameters (unused)

        Returns:
            ChatResponse with conversational message and minimal metrics
        """
        start_time = time.perf_counter()
        query = request.message

        # Step 1: Build simple conversational prompt
        system_prompt = """You are a helpful AI assistant.
Provide friendly, concise responses to user queries.
If asked about complex topics, acknowledge that specialized assistance may be needed."""

        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": query},
        ]

        # Step 2: Call LLM provider (Bedrock Haiku)
        llm_start = time.perf_counter()
        result = await self.provider.complete(messages=messages)
        llm_latency = int((time.perf_counter() - llm_start) * 1000)

        # Step 3: Record metrics
        metrics_data = await self._record(
            start=start_time,
            result=result,
            extra={
                "llm_latency_ms": llm_latency,
                "mode": "direct",
            },
        )

        # Step 4: Build routing log (no retrieval logs for direct mode)
        now = datetime.now(UTC).isoformat()
        routing_log = RetrievalLog(
            id=str(uuid.uuid4()),
            type=LogType.ROUTING,
            title="Direct conversational response (no retrieval)",
            data={
                "agent": "direct",
                "mode": "conversational",
                "retrieval": False,
                "latency_ms": llm_latency,
            },
            timestamp=now,
            status=LogStatus.SUCCESS,
            chunks=None,
        )

        # Step 5: Build chat metrics
        total_latency = int((time.perf_counter() - start_time) * 1000)
        chat_metrics = ChatMetrics(
            tokensUsed=metrics_data.tokens_input + metrics_data.tokens_output,
            cost=metrics_data.cost_total,
            latency=total_latency,
            cache_status="none",
        )

        # Step 6: Build agent status map
        agent_status = {
            AgentId.ORCHESTRATOR: AgentStatus.COMPLETE,
            AgentId.BILLING: AgentStatus.IDLE,
            AgentId.TECHNICAL: AgentStatus.IDLE,
            AgentId.POLICY: AgentStatus.IDLE,
        }

        # Step 7: Return complete response
        return ChatResponse(
            message=result.content,
            agent=AgentId.ORCHESTRATOR,  # Direct maps to ORCHESTRATOR
            confidence=0.70,  # Lower confidence for direct responses
            logs=[routing_log],
            metrics=chat_metrics,
            agent_status=agent_status,
        )
