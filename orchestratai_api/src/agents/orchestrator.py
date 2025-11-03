"""LangGraph orchestrator with guide/delegate routing modes."""

import uuid
from datetime import UTC, datetime
from typing import Any, Literal, TypedDict

from langgraph.graph import END, StateGraph

from src.agents.workers.rag_agent import RAGAgent
from src.llm.provider_factory import AgentRole, ProviderFactory
from src.models.enums import AgentId, AgentStatus, LogStatus, LogType
from src.models.schemas import ChatMetrics, ChatRequest, ChatResponse, RetrievalLog
from src.retrieval.vector_store import VectorStore


class OrchestratorState(TypedDict):
    """State maintained throughout orchestrator workflow.

    The state flows through nodes and is updated at each step.
    """

    messages: list[dict[str, str]]  # Message history
    analysis: dict[str, Any]  # Intent classification result
    route: str  # "guide" or "delegate"
    result: ChatResponse | None  # Final response
    session_id: str  # Session identifier


# Intent classification constants
META_QUESTION = "META_QUESTION"
DOMAIN_QUESTION = "DOMAIN_QUESTION"
POLICY_QUESTION = "POLICY_QUESTION"


async def analyse_query(state: OrchestratorState) -> OrchestratorState:
    """Analyze the user query and classify intent.

    Uses Claude 3.5 Sonnet for strategic routing decisions.

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
- DOMAIN_QUESTION: Questions requiring domain knowledge, document retrieval, or technical info
- POLICY_QUESTION: Questions about policies, rules, or compliance

Respond with JSON only:
{{
    "intent": "META_QUESTION" | "DOMAIN_QUESTION" | "POLICY_QUESTION",
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


def decide_route(state: OrchestratorState) -> Literal["guide", "delegate"]:
    """Decide whether to guide directly or delegate to a worker.

    Args:
        state: Current orchestrator state with analysis

    Returns:
        "guide" for meta questions, "delegate" for domain/policy questions
    """
    intent = state["analysis"].get("intent", DOMAIN_QUESTION)

    if intent == META_QUESTION:
        state["route"] = "guide"
        return "guide"
    else:
        state["route"] = "delegate"
        return "delegate"


async def guide_user(state: OrchestratorState) -> OrchestratorState:
    """Provide direct response without delegating to workers.

    Uses Claude 3 Haiku for fast, cost-effective guide mode.

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


async def delegate_to_worker(
    state: OrchestratorState,
    *,
    vector_store: VectorStore,
) -> OrchestratorState:
    """Delegate query to appropriate worker agent.

    Currently routes DOMAIN_QUESTION to RAG agent.
    Future: Add CAG, Hybrid agents.

    Args:
        state: Current orchestrator state
        vector_store: Vector database for RAG agent

    Returns:
        Updated state with worker response
    """
    intent = state["analysis"].get("intent", DOMAIN_QUESTION)

    # Route based on intent
    if intent == DOMAIN_QUESTION:
        # Use RAG agent for domain questions
        rag_provider = ProviderFactory.for_role(AgentRole.RAG)
        rag_agent = RAGAgent(provider=rag_provider, vector_store=vector_store)

        # Build ChatRequest for RAG agent
        request = ChatRequest(
            message=state["messages"][-1]["content"],
            session_id=state["session_id"],
        )

        # Invoke RAG agent
        response = await rag_agent.run(request)

        # Add routing log to beginning of logs
        now = datetime.now(UTC).isoformat()
        routing_log = RetrievalLog(
            id=str(uuid.uuid4()),
            type=LogType.ROUTING,
            title="Orchestrator routed to RAG agent",
            data={
                "intent": state["analysis"]["intent"],
                "confidence": state["analysis"]["confidence"],
                "target_agent": "technical",
                "reasoning": state["analysis"]["reasoning"],
            },
            timestamp=now,
            status=LogStatus.SUCCESS,
            chunks=None,
        )

        # Prepend routing log
        response.logs.insert(0, routing_log)

        state["result"] = response
        return state
    else:
        # Fallback to guide mode if no worker available
        return await guide_user(state)


def build_orchestrator_graph(*, vector_store: VectorStore) -> StateGraph:
    """Build and compile the LangGraph orchestrator workflow.

    Args:
        vector_store: Vector database for worker agents

    Returns:
        Compiled StateGraph ready for execution
    """

    # Define delegate wrapper to capture vector_store
    async def delegate_wrapper(state: OrchestratorState) -> OrchestratorState:
        return await delegate_to_worker(state, vector_store=vector_store)

    # Create workflow
    workflow = StateGraph(OrchestratorState)

    # Add nodes
    workflow.add_node("analyse", analyse_query)
    workflow.add_node("guide", guide_user)
    workflow.add_node("delegate", delegate_wrapper)

    # Set entry point
    workflow.set_entry_point("analyse")

    # Add conditional routing from analyse
    workflow.add_conditional_edges(
        "analyse",
        decide_route,
        {
            "guide": "guide",
            "delegate": "delegate",
        },
    )

    # Add terminal edges
    workflow.add_edge("guide", END)
    workflow.add_edge("delegate", END)

    # Compile graph
    return workflow.compile()
