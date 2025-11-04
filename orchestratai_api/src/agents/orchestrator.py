"""LangGraph orchestrator with guide/delegate routing modes and fallback chain."""

import logging
import uuid
from collections.abc import Callable
from datetime import UTC, datetime
from typing import Any, Literal, TypedDict

from langgraph.graph import END, StateGraph

from src.agents.workers.cag_agent import CAGAgent
from src.agents.workers.direct_agent import DirectAgent
from src.agents.workers.hybrid_agent import HybridAgent
from src.agents.workers.rag_agent import RAGAgent
from src.cache.redis_cache import RedisSemanticCache
from src.llm.provider_factory import AgentRole, ProviderFactory
from src.models.enums import AgentId, AgentStatus, LogStatus, LogType
from src.models.schemas import ChatMetrics, ChatRequest, ChatResponse, RetrievalLog
from src.retrieval.vector_store import VectorStore

logger = logging.getLogger(__name__)


class OrchestratorState(TypedDict):
    """State maintained throughout orchestrator workflow.

    The state flows through nodes and is updated at each step.
    """

    messages: list[dict[str, str]]  # Message history
    analysis: dict[str, Any]  # Intent classification result
    route: str  # Route decision (guide, delegate_hybrid, delegate_rag, etc.)
    result: ChatResponse | None  # Final response
    session_id: str  # Session identifier
    attempted_agents: list[str]  # Track fallback attempts
    error_message: str | None  # Store error if all agents fail


# Intent classification constants
META_QUESTION = "META_QUESTION"
COMPLEX_QUESTION = "COMPLEX_QUESTION"
SIMPLE_CHAT = "SIMPLE_CHAT"
DOMAIN_QUESTION = "DOMAIN_QUESTION"
POLICY_QUESTION = "POLICY_QUESTION"
PRICING_QUESTION = "PRICING_QUESTION"


async def analyse_query(state: OrchestratorState) -> OrchestratorState:
    """Analyze the user query and classify intent.

    Uses Gpt4o for strategic routing decisions.

    Args:
        state: Current orchestrator state

    Returns:
        Updated state with analysis results
    """
    # Get orchestrator analysis provider (Claude 3.5 Sonnet)
    provider = ProviderFactory.for_role(AgentRole.ORCHESTRATOR_ANALYSIS)

    # Extract user message
    user_message = state["messages"][-1]["content"]

    # Build analysis prompt
    analysis_prompt = f"""Analyze this user query and classify the intent:

Query: "{user_message}"

Intent types:
- META_QUESTION: Questions about what you can do, your capabilities, how you work
- COMPLEX_QUESTION: Multi-step queries, technical deep-dives requiring synthesis of multiple sources
- SIMPLE_CHAT: Greetings, small talk, simple conversational queries
- DOMAIN_QUESTION: Questions requiring domain knowledge, document retrieval, or technical info
- POLICY_QUESTION: Questions about policies, rules, or compliance
- PRICING_QUESTION: Questions about pricing, costs, billing, or refunds

Respond with JSON only:
{{
    "intent": "META_QUESTION" | "COMPLEX_QUESTION" | "SIMPLE_CHAT" | \
"DOMAIN_QUESTION" | "POLICY_QUESTION" | "PRICING_QUESTION",
    "confidence": 0.0-1.0,
    "reasoning": "brief explanation"
}}"""

    messages = [{"role": "user", "content": analysis_prompt}]

    # Call provider for analysis
    result = await provider.complete(messages=messages)

    # Parse response (simple JSON extraction)
    import json

    content = result.content.strip()
    # Handle markdown code blocks
    if content.startswith("```"):
        content = content.split("```")[1]
        if content.startswith("json"):
            content = content[4:].strip()

    try:
        analysis = json.loads(content)
    except json.JSONDecodeError:
        # Fallback to safe defaults if parsing fails
        analysis = {
            "intent": DOMAIN_QUESTION,
            "confidence": 0.5,
            "reasoning": "Failed to parse analysis, defaulting to domain question",
        }

    # Update state
    state["analysis"] = analysis
    return state


def decide_route(
    state: OrchestratorState,
) -> Literal[
    "guide",
    "delegate_hybrid",
    "delegate_rag",
    "delegate_billing",
    "delegate_policy",
    "delegate_direct",
]:
    """Decide which agent should handle the query.

    Routing logic:
    - META_QUESTION → guide mode (direct orchestrator response)
    - COMPLEX_QUESTION → Hybrid agent (RAG + cache synthesis)
    - SIMPLE_CHAT → Direct agent (fast conversational)
    - DOMAIN_QUESTION → RAG agent (document retrieval)
    - PRICING_QUESTION → Billing agent (cached pricing/billing responses)
    - POLICY_QUESTION → Policy agent (cached policy responses)

    Uses heuristics for classification:
    - Message length > 100 chars → likely complex
    - Keywords: "explain", "compare", "analyze" → complex
    - Keywords: "hello", "thanks", "bye" → simple chat

    Args:
        state: Current orchestrator state with analysis

    Returns:
        Route name for conditional edge routing
    """
    intent = state["analysis"].get("intent", DOMAIN_QUESTION)
    message = state["messages"][-1]["content"]

    # Apply heuristics for complexity
    is_complex = len(message) > 100 or any(
        kw in message.lower()
        for kw in ["explain", "compare", "analyze", "how does", "difference between"]
    )

    # Apply heuristics for simple chat
    is_simple_chat = any(
        kw in message.lower()
        for kw in ["hello", "hi", "hey", "thanks", "thank you", "bye", "goodbye"]
    )

    # Routing decisions
    if intent == META_QUESTION:
        state["route"] = "guide"
        return "guide"
    elif intent == COMPLEX_QUESTION or (intent == DOMAIN_QUESTION and is_complex):
        state["route"] = "delegate_hybrid"
        return "delegate_hybrid"
    elif intent == SIMPLE_CHAT or is_simple_chat:
        state["route"] = "delegate_direct"
        return "delegate_direct"
    elif intent == PRICING_QUESTION:
        state["route"] = "delegate_billing"
        return "delegate_billing"
    elif intent == POLICY_QUESTION:
        state["route"] = "delegate_policy"
        return "delegate_policy"
    elif intent == DOMAIN_QUESTION:
        state["route"] = "delegate_rag"
        return "delegate_rag"
    else:
        # Fallback to direct for unknown intents
        state["route"] = "delegate_direct"
        return "delegate_direct"


async def guide_user(state: OrchestratorState) -> OrchestratorState:
    """Provide direct response without delegating to workers.

    Uses Gpt4o for fast, cost-effective guide mode.

    Args:
        state: Current orchestrator state

    Returns:
        Updated state with response
    """
    # Get orchestrator guide provider (Claude 3 Haiku)
    provider = ProviderFactory.for_role(AgentRole.ORCHESTRATOR_GUIDE)

    # Build guide response prompt
    system_prompt = """You are the OrchestratAI assistant orchestrator.
Provide helpful, concise responses about your capabilities.
You coordinate specialized agents for domain-specific questions."""

    messages = [
        {"role": "system", "content": system_prompt},
        *state["messages"],
    ]

    # Call provider
    result = await provider.complete(messages=messages)

    # Build minimal response (no retrieval logs for guide mode)
    now = datetime.now(UTC).isoformat()
    routing_log = RetrievalLog(
        id=str(uuid.uuid4()),
        type=LogType.ROUTING,
        title="Orchestrator handled query directly (guide mode)",
        data={
            "intent": state["analysis"]["intent"],
            "confidence": state["analysis"]["confidence"],
            "target_agent": "orchestrator",
            "reasoning": state["analysis"]["reasoning"],
        },
        timestamp=now,
        status=LogStatus.SUCCESS,
        chunks=None,
    )

    chat_metrics = ChatMetrics(
        tokensUsed=result.tokens_input + result.tokens_output,
        cost=result.cost,
        latency=500,  # Approximate for guide mode
        cache_status="none",
    )

    agent_status = {
        AgentId.ORCHESTRATOR: AgentStatus.COMPLETE,
        AgentId.BILLING: AgentStatus.IDLE,
        AgentId.TECHNICAL: AgentStatus.IDLE,
        AgentId.POLICY: AgentStatus.IDLE,
    }

    response = ChatResponse(
        message=result.content,
        agent=AgentId.ORCHESTRATOR,
        confidence=state["analysis"]["confidence"],
        logs=[routing_log],
        metrics=chat_metrics,
        agent_status=agent_status,
    )

    state["result"] = response
    return state


async def execute_with_fallback(
    preferred: list[tuple[str, Callable[[], Any]]],
    state: OrchestratorState,
) -> ChatResponse:
    """Execute agents in fallback chain until one succeeds.

    Implements graceful degradation:
    - Tries each agent in order
    - On failure, logs error and tries next agent
    - Tracks attempted agents for transparency
    - Emits ROUTING logs for fallback events
    - If all fail, returns error response

    Args:
        preferred: List of (agent_name, agent_callable) tuples in fallback order
        state: Current orchestrator state

    Returns:
        ChatResponse from first successful agent

    Raises:
        RuntimeError: If all agents fail
    """
    attempted: list[str] = []

    for agent_name, agent_fn in preferred:
        try:
            logger.info(f"Attempting agent: {agent_name}")
            result = await agent_fn()

            # Add attempted agents to response metadata
            if hasattr(result, "logs"):
                # Prepend fallback log if this wasn't the first attempt
                if attempted:
                    now = datetime.now(UTC).isoformat()
                    fallback_log = RetrievalLog(
                        id=str(uuid.uuid4()),
                        type=LogType.ROUTING,
                        title=f"Fallback chain used: {' → '.join(attempted + [agent_name])}",
                        data={
                            "attempted_agents": attempted,
                            "successful_agent": agent_name,
                            "fallback_reason": "previous_agents_failed",
                        },
                        timestamp=now,
                        status=LogStatus.SUCCESS,
                        chunks=None,
                    )
                    result.logs.insert(0, fallback_log)

            logger.info(f"Agent {agent_name} succeeded")
            # Result from agent callable should be ChatResponse
            assert isinstance(result, ChatResponse)
            return result

        except Exception as e:
            logger.error(f"Agent {agent_name} failed: {e}", exc_info=True)
            attempted.append(agent_name)

            # Emit routing log for failure
            now = datetime.now(UTC).isoformat()
            state.setdefault("result", None)

            # Continue to next agent
            continue

    # All agents failed
    error_msg = f"All agents failed: {', '.join(attempted)}"
    logger.error(error_msg)

    # Build error response
    now = datetime.now(UTC).isoformat()
    error_log = RetrievalLog(
        id=str(uuid.uuid4()),
        type=LogType.ROUTING,
        title="All agents failed",
        data={
            "attempted_agents": attempted,
            "error": error_msg,
        },
        timestamp=now,
        status=LogStatus.ERROR,
        chunks=None,
    )

    error_response = ChatResponse(
        message="I apologize, but I'm experiencing technical difficulties. Please try again later.",
        agent=AgentId.ORCHESTRATOR,
        confidence=0.0,
        logs=[error_log],
        metrics=ChatMetrics(
            tokensUsed=0,
            cost=0.0,
            latency=0,
            cache_status="none",
        ),
        agent_status={
            AgentId.ORCHESTRATOR: AgentStatus.IDLE,
            AgentId.BILLING: AgentStatus.IDLE,
            AgentId.TECHNICAL: AgentStatus.IDLE,
            AgentId.POLICY: AgentStatus.IDLE,
        },
    )

    return error_response


async def delegate_hybrid(
    state: OrchestratorState,
    *,
    vector_store: VectorStore,
    cache: RedisSemanticCache,
) -> OrchestratorState:
    """Delegate to Hybrid agent with fallback chain: Hybrid → RAG → CAG → Direct.

    Args:
        state: Current orchestrator state
        vector_store: Vector database for retrieval
        cache: Redis semantic cache

    Returns:
        Updated state with response
    """
    request = ChatRequest(
        message=state["messages"][-1]["content"],
        session_id=state["session_id"],
    )

    # Build fallback chain
    async def try_hybrid() -> ChatResponse:
        hybrid_provider = ProviderFactory.for_role(AgentRole.HYBRID)
        rag_provider = ProviderFactory.for_role(AgentRole.RAG)
        embeddings_provider = ProviderFactory.for_role(AgentRole.EMBEDDINGS)

        rag_agent = RAGAgent(provider=rag_provider, vector_store=vector_store)
        hybrid_agent = HybridAgent(
            provider=hybrid_provider,
            rag_agent=rag_agent,
            cache=cache,
            embeddings=embeddings_provider,
        )
        return await hybrid_agent.run(request)

    async def try_rag() -> ChatResponse:
        rag_provider = ProviderFactory.for_role(AgentRole.RAG)
        rag_agent = RAGAgent(provider=rag_provider, vector_store=vector_store)
        return await rag_agent.run(request)

    async def try_cag() -> ChatResponse:
        cag_provider = ProviderFactory.for_role(AgentRole.CAG)
        embeddings_provider = ProviderFactory.for_role(AgentRole.EMBEDDINGS)
        cag_agent = CAGAgent(
            provider=cag_provider,
            cache=cache,
            embeddings=embeddings_provider,
            vector_store=vector_store,
        )
        return await cag_agent.run(request)

    async def try_direct() -> ChatResponse:
        direct_provider = ProviderFactory.for_role(AgentRole.DIRECT)
        direct_agent = DirectAgent(provider=direct_provider)
        return await direct_agent.run(request)

    fallback_chain = [
        ("hybrid", try_hybrid),
        ("rag", try_rag),
        ("cag", try_cag),
        ("direct", try_direct),
    ]

    response = await execute_with_fallback(fallback_chain, state)
    _add_routing_log(response, state, "hybrid")
    state["result"] = response
    return state


async def delegate_rag(
    state: OrchestratorState,
    *,
    vector_store: VectorStore,
    cache: RedisSemanticCache,
) -> OrchestratorState:
    """Delegate to RAG agent with fallback chain: RAG → CAG → Direct.

    Args:
        state: Current orchestrator state
        vector_store: Vector database for retrieval
        cache: Redis semantic cache

    Returns:
        Updated state with response
    """
    request = ChatRequest(
        message=state["messages"][-1]["content"],
        session_id=state["session_id"],
    )

    async def try_rag() -> ChatResponse:
        rag_provider = ProviderFactory.for_role(AgentRole.RAG)
        rag_agent = RAGAgent(provider=rag_provider, vector_store=vector_store)
        return await rag_agent.run(request)

    async def try_cag() -> ChatResponse:
        cag_provider = ProviderFactory.for_role(AgentRole.CAG)
        embeddings_provider = ProviderFactory.for_role(AgentRole.EMBEDDINGS)
        cag_agent = CAGAgent(
            provider=cag_provider,
            cache=cache,
            embeddings=embeddings_provider,
            vector_store=vector_store,
        )
        return await cag_agent.run(request)

    async def try_direct() -> ChatResponse:
        direct_provider = ProviderFactory.for_role(AgentRole.DIRECT)
        direct_agent = DirectAgent(provider=direct_provider)
        return await direct_agent.run(request)

    fallback_chain = [
        ("rag", try_rag),
        ("cag", try_cag),
        ("direct", try_direct),
    ]

    response = await execute_with_fallback(fallback_chain, state)
    _add_routing_log(response, state, "rag")
    state["result"] = response
    return state


async def delegate_billing(
    state: OrchestratorState,
    *,
    vector_store: VectorStore,
    cache: RedisSemanticCache,
) -> OrchestratorState:
    """Delegate to CAG agent for billing questions with fallback: CAG → Direct.

    Args:
        state: Current orchestrator state
        vector_store: Vector database for retrieval
        cache: Redis semantic cache

    Returns:
        Updated state with response
    """
    request = ChatRequest(
        message=state["messages"][-1]["content"],
        session_id=state["session_id"],
    )

    async def try_cag() -> ChatResponse:
        cag_provider = ProviderFactory.for_role(AgentRole.CAG)
        embeddings_provider = ProviderFactory.for_role(AgentRole.EMBEDDINGS)
        cag_agent = CAGAgent(
            provider=cag_provider,
            cache=cache,
            embeddings=embeddings_provider,
            vector_store=vector_store,
        )
        # Pass PRICING_QUESTION intent for billing questions
        return await cag_agent.run(request, intent=PRICING_QUESTION)

    async def try_direct() -> ChatResponse:
        direct_provider = ProviderFactory.for_role(AgentRole.DIRECT)
        direct_agent = DirectAgent(provider=direct_provider)
        return await direct_agent.run(request)

    fallback_chain = [
        ("cag", try_cag),
        ("direct", try_direct),
    ]

    response = await execute_with_fallback(fallback_chain, state)
    _add_routing_log(response, state, "billing")
    state["result"] = response
    return state


async def delegate_policy(
    state: OrchestratorState,
    *,
    vector_store: VectorStore,
    cache: RedisSemanticCache,
) -> OrchestratorState:
    """Delegate to CAG agent for policy questions with fallback: CAG → Direct.

    Args:
        state: Current orchestrator state
        vector_store: Vector database for retrieval
        cache: Redis semantic cache

    Returns:
        Updated state with response
    """
    request = ChatRequest(
        message=state["messages"][-1]["content"],
        session_id=state["session_id"],
    )

    async def try_cag() -> ChatResponse:
        cag_provider = ProviderFactory.for_role(AgentRole.CAG)
        embeddings_provider = ProviderFactory.for_role(AgentRole.EMBEDDINGS)
        cag_agent = CAGAgent(
            provider=cag_provider,
            cache=cache,
            embeddings=embeddings_provider,
            vector_store=vector_store,
        )
        # Pass POLICY_QUESTION intent for policy questions
        return await cag_agent.run(request, intent=POLICY_QUESTION)

    async def try_direct() -> ChatResponse:
        direct_provider = ProviderFactory.for_role(AgentRole.DIRECT)
        direct_agent = DirectAgent(provider=direct_provider)
        return await direct_agent.run(request)

    fallback_chain = [
        ("cag", try_cag),
        ("direct", try_direct),
    ]

    response = await execute_with_fallback(fallback_chain, state)
    _add_routing_log(response, state, "policy")
    state["result"] = response
    return state


async def delegate_direct(state: OrchestratorState) -> OrchestratorState:
    """Delegate to Direct agent (no fallback needed - always succeeds).

    Args:
        state: Current orchestrator state

    Returns:
        Updated state with response
    """
    request = ChatRequest(
        message=state["messages"][-1]["content"],
        session_id=state["session_id"],
    )

    direct_provider = ProviderFactory.for_role(AgentRole.DIRECT)
    direct_agent = DirectAgent(provider=direct_provider)
    response = await direct_agent.run(request)

    _add_routing_log(response, state, "direct")
    state["result"] = response
    return state


def _add_routing_log(
    response: ChatResponse,
    state: OrchestratorState,
    target_agent: str,
) -> None:
    """Add routing log to response.

    Args:
        response: ChatResponse to modify
        state: Current orchestrator state
        target_agent: Name of target agent
    """
    now = datetime.now(UTC).isoformat()
    name_map = {
        "hybrid": "Hybrid",
        "rag": "RAG",
        "billing": "Billing (CAG)",
        "policy": "Policy (CAG)",
        "direct": "Direct",
        "guide": "Guide",
    }
    display = name_map.get(target_agent, target_agent.title())
    routing_log = RetrievalLog(
        id=str(uuid.uuid4()),
        type=LogType.ROUTING,
        title=f"Orchestrator routed to {display} agent",
        data={
            "intent": state["analysis"].get("intent", "unknown"),
            "confidence": state["analysis"].get("confidence", 0.0),
            "target_agent": target_agent,
            "reasoning": state["analysis"].get("reasoning", ""),
        },
        timestamp=now,
        status=LogStatus.SUCCESS,
        chunks=None,
    )

    # Prepend routing log (if not already added by fallback chain)
    if not any(log.type == LogType.ROUTING and "Fallback" in log.title for log in response.logs):
        response.logs.insert(0, routing_log)


def build_orchestrator_graph(
    *,
    vector_store: VectorStore,
    cache: RedisSemanticCache,
) -> Any:
    """Build and compile the LangGraph orchestrator workflow.

    Graph structure:
    - analyse → decide_route → [guide | delegate_hybrid | delegate_rag |
      delegate_billing | delegate_policy | delegate_direct]
    - Each delegate node has built-in fallback chain
    - All paths lead to END

    Args:
        vector_store: Vector database for RAG agent
        cache: Redis semantic cache for CAG agent

    Returns:
        Compiled StateGraph ready for execution
    """

    # Define delegate wrappers to capture dependencies
    async def hybrid_wrapper(state: OrchestratorState) -> OrchestratorState:
        return await delegate_hybrid(state, vector_store=vector_store, cache=cache)

    async def rag_wrapper(state: OrchestratorState) -> OrchestratorState:
        return await delegate_rag(state, vector_store=vector_store, cache=cache)

    async def billing_wrapper(state: OrchestratorState) -> OrchestratorState:
        return await delegate_billing(state, vector_store=vector_store, cache=cache)

    async def policy_wrapper(state: OrchestratorState) -> OrchestratorState:
        return await delegate_policy(state, vector_store=vector_store, cache=cache)

    # Create workflow
    workflow = StateGraph(OrchestratorState)

    # Add nodes
    workflow.add_node("analyse", analyse_query)
    workflow.add_node("guide", guide_user)
    workflow.add_node("delegate_hybrid", hybrid_wrapper)
    workflow.add_node("delegate_rag", rag_wrapper)
    workflow.add_node("delegate_billing", billing_wrapper)
    workflow.add_node("delegate_policy", policy_wrapper)
    workflow.add_node("delegate_direct", delegate_direct)

    # Set entry point
    workflow.set_entry_point("analyse")

    # Add conditional routing from analyse
    workflow.add_conditional_edges(
        "analyse",
        decide_route,
        {
            "guide": "guide",
            "delegate_hybrid": "delegate_hybrid",
            "delegate_rag": "delegate_rag",
            "delegate_billing": "delegate_billing",
            "delegate_policy": "delegate_policy",
            "delegate_direct": "delegate_direct",
        },
    )

    # Add terminal edges
    workflow.add_edge("guide", END)
    workflow.add_edge("delegate_hybrid", END)
    workflow.add_edge("delegate_rag", END)
    workflow.add_edge("delegate_billing", END)
    workflow.add_edge("delegate_policy", END)
    workflow.add_edge("delegate_direct", END)

    # Compile graph
    return workflow.compile()
