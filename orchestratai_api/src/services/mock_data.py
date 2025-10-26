"""
Mock Data Service for OrchestratAI

Provides keyword-based routing and generates realistic mock responses
for chat interactions during development and testing.
"""

import random
import uuid
from datetime import UTC, datetime

from ..models.enums import AgentId, LogStatus, LogType
from ..models.schemas import ChatMetrics, ChatResponse, RetrievalLog

# Response templates for each agent type
BILLING_RESPONSES = [
    (
        "We offer three pricing tiers: Starter ($29/mo), Professional ($99/mo), "
        "and Enterprise (custom). Which would you like to learn more about?"
    ),
    (
        "Your current subscription is the Professional plan at $99/month. "
        "Would you like to upgrade to Enterprise for advanced features?"
    ),
    "I can help you with billing inquiries. Our pricing includes all core features.",
    (
        "Let me explain our subscription options. The Starter plan is perfect for "
        "small teams, while Enterprise offers dedicated support."
    ),
    (
        "For billing questions, I can provide detailed breakdowns of charges, "
        "payment history, and plan comparisons."
    ),
]

TECHNICAL_RESPONSES = [
    (
        "I can help troubleshoot that technical issue. Could you provide more details "
        "about the error message you're seeing?"
    ),
    (
        "This appears to be an API integration issue. Let me walk you through "
        "the authentication process step by step."
    ),
    (
        "For technical support, I'll need to check your system configuration. "
        "Are you using the latest SDK version?"
    ),
    (
        "That bug has been reported and our engineering team is working on a fix. "
        "I can provide a temporary workaround."
    ),
    (
        "Let me analyze the error logs. This might be related to rate limiting "
        "or network connectivity issues."
    ),
]

POLICY_RESPONSES = [
    (
        "Our refund policy allows cancellations within 30 days for a full refund. "
        "Would you like me to process that for you?"
    ),
    (
        "According to our terms of service, data retention follows GDPR guidelines. "
        "I can explain our privacy policy in detail."
    ),
    (
        "For policy questions, I can help with cancellations, refunds, data privacy, "
        "and compliance requirements."
    ),
    (
        "Our service level agreement (SLA) guarantees 99.9% uptime. "
        "Let me explain our commitment to reliability."
    ),
    (
        "Regarding your policy inquiry, we comply with SOC 2 Type II and HIPAA standards "
        "for enterprise customers."
    ),
]

ORCHESTRATOR_RESPONSES = [
    (
        "I'm here to help route your question to the right specialist. "
        "Could you provide more details about what you need assistance with?"
    ),
    (
        "I can connect you with our billing, technical, or policy specialists. "
        "What area does your question relate to?"
    ),
    (
        "Let me understand your needs better. Are you asking about pricing, "
        "technical issues, or our policies?"
    ),
    (
        "I'm the orchestrator agent. I'll analyze your query and direct you "
        "to the most appropriate specialist."
    ),
    "To best assist you, I need a bit more context. What type of support are you looking for?",
]

# Template mapping by agent
RESPONSE_TEMPLATES = {
    AgentId.BILLING: BILLING_RESPONSES,
    AgentId.TECHNICAL: TECHNICAL_RESPONSES,
    AgentId.POLICY: POLICY_RESPONSES,
    AgentId.ORCHESTRATOR: ORCHESTRATOR_RESPONSES,
}


def route_message(message: str) -> AgentId:
    """
    Route message to appropriate agent based on keyword matching.

    Args:
        message: User input message to analyze

    Returns:
        AgentId enum indicating which agent should handle the request
    """
    message_lower = message.lower()

    # Billing keywords
    billing_keywords = ["price", "billing", "cost", "subscription", "pay", "plan"]
    if any(word in message_lower for word in billing_keywords):
        return AgentId.BILLING

    # Technical keywords
    technical_keywords = ["error", "bug", "technical", "api", "sdk", "crash"]
    if any(word in message_lower for word in technical_keywords):
        return AgentId.TECHNICAL

    # Policy keywords
    policy_keywords = ["policy", "refund", "terms", "cancel", "privacy", "gdpr"]
    if any(word in message_lower for word in policy_keywords):
        return AgentId.POLICY

    # Default to orchestrator
    return AgentId.ORCHESTRATOR


def generate_mock_retrieval_logs(
    agent: AgentId, num_logs: int | None = None
) -> list[RetrievalLog]:
    """
    Generate realistic retrieval logs for mock responses.

    Args:
        agent: The agent handling the request
        num_logs: Number of logs to generate (2-4 if not specified)

    Returns:
        List of RetrievalLog objects with varying types and statuses
    """
    if num_logs is None:
        num_logs = random.randint(2, 4)

    logs = []
    log_types = [LogType.ROUTING, LogType.VECTOR_SEARCH, LogType.CACHE, LogType.DOCUMENTS]

    # Always include a routing log first
    logs.append(
        RetrievalLog(
            id=str(uuid.uuid4()),
            type=LogType.ROUTING,
            title=f"Routed to {agent.value} agent",
            data={"agent": agent.value, "confidence": random.uniform(0.85, 0.98)},
            timestamp=datetime.now(UTC).isoformat(),
            status=LogStatus.SUCCESS,
            chunks=None,
        )
    )

    # Add additional random logs
    for _ in range(num_logs - 1):
        log_type = random.choice(log_types[1:])  # Skip ROUTING for remaining logs
        status = random.choices(
            [LogStatus.SUCCESS, LogStatus.WARNING, LogStatus.ERROR],
            weights=[0.7, 0.2, 0.1],  # 70% success, 20% warning, 10% error
        )[0]

        log_data = {}
        if log_type == LogType.VECTOR_SEARCH:
            log_data = {
                "query": "user query embedding",
                "resultsFound": random.randint(3, 15),
                "topSimilarity": round(random.uniform(0.75, 0.95), 3),
            }
        elif log_type == LogType.CACHE:
            log_data = {
                "cacheHit": random.choice([True, False]),
                "key": f"cache_{uuid.uuid4().hex[:8]}",
            }
        elif log_type == LogType.DOCUMENTS:
            log_data = {
                "documentsRetrieved": random.randint(2, 8),
                "sources": ["kb_doc_1", "kb_doc_2"],
            }

        logs.append(
            RetrievalLog(
                id=str(uuid.uuid4()),
                type=log_type,
                title=f"{log_type.value.replace('_', ' ').title()} operation",
                data=log_data,
                timestamp=datetime.now(UTC).isoformat(),
                status=status,
                chunks=None,
            )
        )

    return logs


def generate_mock_response(message: str) -> ChatResponse:
    """
    Generate complete mock chat response based on message routing.

    Args:
        message: User input message

    Returns:
        ChatResponse with routed agent, message, logs, and metrics
    """
    # Route to appropriate agent
    agent = route_message(message)

    # Select random response template
    response_text = random.choice(RESPONSE_TEMPLATES[agent])

    # Generate confidence score based on agent type
    if agent == AgentId.ORCHESTRATOR:
        confidence = random.uniform(0.70, 0.85)  # Lower confidence for orchestrator
    else:
        confidence = random.uniform(0.85, 0.98)  # Higher confidence for specialized agents

    # Generate mock retrieval logs
    logs = generate_mock_retrieval_logs(agent)

    # Generate realistic metrics
    tokens_used = random.randint(200, 800)
    latency_ms = random.randint(800, 2000)
    cost = round(random.uniform(0.001, 0.005), 5)

    metrics = ChatMetrics(
        tokensUsed=tokens_used,
        cost=cost,
        latency=latency_ms,
    )

    return ChatResponse(
        message=response_text,
        agent=agent,
        confidence=round(confidence, 3),
        logs=logs,
        metrics=metrics,
    )
