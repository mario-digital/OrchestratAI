"""Base agent abstraction for all worker agents."""

import time
from abc import ABC, abstractmethod
from dataclasses import dataclass
from typing import Any

from src.llm.base_provider import BaseLLMProvider
from src.llm.provider_factory import AgentRole
from src.llm.types import LLMCallResult
from src.models.schemas import ChatRequest, ChatResponse


@dataclass
class AgentMetrics:
    """Metrics collected from an agent execution.

    Tracks token usage, cost, latency, and additional agent-specific data.
    """

    agent_id: str
    provider: str
    model: str
    tokens_input: int
    tokens_output: int
    cost_total: float
    latency_ms: float
    extra: dict[str, Any]


class BaseAgent(ABC):
    """Abstract base class for all worker agents.

    Provides standardized metrics recording and abstracts the run interface.
    All agents must implement the run method to process chat requests.
    """

    def __init__(self, *, role: AgentRole, provider: BaseLLMProvider):
        """Initialize base agent.

        Args:
            role: The agent's role identifier
            provider: LLM provider instance for this agent
        """
        self.role = role
        self.provider = provider

    async def _record(
        self,
        *,
        start: float,
        result: LLMCallResult,
        extra: dict[str, Any] | None = None,
    ) -> AgentMetrics:
        """Record metrics from an LLM call.

        Args:
            start: Start time from time.perf_counter()
            result: LLM call result containing tokens and cost
            extra: Additional agent-specific metrics

        Returns:
            AgentMetrics instance with complete metrics
        """
        return AgentMetrics(
            agent_id=self.role.value,
            provider=self.provider.__class__.__name__.lower().replace("provider", ""),
            model=result.model,
            tokens_input=result.tokens_input,
            tokens_output=result.tokens_output,
            cost_total=result.cost,
            latency_ms=(time.perf_counter() - start) * 1000,
            extra=extra or {},
        )

    @abstractmethod
    async def run(self, request: ChatRequest, **kwargs: Any) -> ChatResponse:
        """Process a chat request and return a response.

        Args:
            request: Incoming chat request
            **kwargs: Additional agent-specific parameters

        Returns:
            ChatResponse with message, logs, and metrics
        """
        ...
