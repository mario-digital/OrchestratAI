"""
Mock Data Service for OrchestratAI

Provides keyword-based routing and generates realistic mock responses
for chat interactions during development and testing.
"""

import random
import uuid
from datetime import UTC, datetime
from typing import Literal, cast

from ..models.enums import AgentId, AgentStatus, LogStatus, LogType
from ..models.schemas import ChatMetrics, ChatResponse, DocumentChunk, RetrievalLog

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


# ruff: noqa: E501
# Document content templates - long lines intentional for realistic content
def generate_document_snippet(filename: str) -> str:
    """
    Generate realistic document content snippet based on filename.

    Args:
        filename: Document filename to generate content for

    Returns:
        Realistic content snippet (150-200 characters)
    """
    # Content templates by filename pattern
    content_templates = {
        # Billing domain
        "pricing_faq.md": [
            "Our pricing structure includes three tiers. The Starter plan at $29/month provides essential features for small teams. Professional plan offers advanced analytics at $99/month.",
            "Subscription billing occurs on the first of each month. You can upgrade or downgrade at any time, with prorated charges applied to your next invoice within 24 hours.",
            "Enterprise pricing is customized based on team size and feature requirements. Contact our sales team for a detailed quote and volume discounts for organizations over 100 users.",
        ],
        "subscription_guide.md": [
            "Managing your subscription is simple through the account dashboard. Change plans, update payment methods, or view billing history anytime without contacting support.",
            "Annual subscriptions receive a 20% discount compared to monthly billing. Switch to annual billing to save money and lock in current pricing for 12 months.",
            "Subscription renewals are automatic. We'll send reminders 7 days before each billing cycle. Cancel anytime with no penalties or hidden fees.",
        ],
        "payment_methods.md": [
            "Payment methods accepted include all major credit cards, ACH transfers for enterprise accounts, and PayPal for international customers. Crypto payments coming soon.",
            "Update payment information in your account settings. We encrypt all payment data using industry-standard AES-256 encryption and never store full card numbers.",
            "Failed payments will be retried automatically three times over 7 days. Update your payment method to avoid service interruption and maintain access to your account.",
        ],
        # Technical domain
        "api_documentation.md": [
            "The REST API endpoint /v1/chat requires authentication via Bearer token. Include the token in the Authorization header for all requests. Rate limits apply per API key.",
            "API responses follow JSON:API specification with consistent error formatting. All timestamps use ISO 8601 format. Pagination uses cursor-based navigation for efficiency.",
            "WebSocket connections are available at wss://api.orchestratai.com/ws for real-time updates. Authenticate using the same Bearer token in the connection handshake.",
        ],
        "troubleshooting_guide.md": [
            "Troubleshooting connection timeouts: Check your network firewall settings. API requests timeout after 30 seconds. Implement exponential backoff for retry logic.",
            "Error code 429 indicates rate limit exceeded. Default limits are 100 requests per minute. Contact support to request higher limits for production workloads.",
            "If you receive 401 Unauthorized, verify your API key is valid and not expired. Regenerate keys in the dashboard if needed. Keys expire after 90 days for security.",
        ],
        "sdk_reference.md": [
            "SDK installation via npm: npm install @orchestratai/sdk. Initialize the client with your API key: const client = new OrchestratAI({ apiKey: process.env.API_KEY });",
            "Python SDK supports async operations using asyncio. Install with pip: pip install orchestratai-sdk. Full type hints provided for IDE autocomplete and static analysis.",
            "SDK automatically handles retries, rate limiting, and error recovery. Configure custom timeout values and retry strategies using the SDK configuration options.",
        ],
        # Policy domain
        "terms_of_service.md": [
            "Terms of Service updates are communicated via email 30 days before taking effect. Continued use of the service constitutes acceptance of the updated terms.",
            "Service availability is guaranteed at 99.9% uptime per our SLA. Scheduled maintenance windows are announced 7 days in advance. Emergency maintenance may occur with shorter notice.",
            "Acceptable use policy prohibits illegal activity, spam, malware distribution, or abuse of service resources. Violations may result in immediate account suspension.",
        ],
        "privacy_policy.md": [
            "Data privacy: We comply with GDPR, CCPA, and SOC 2 Type II standards. Customer data is encrypted at rest using AES-256 and in transit using TLS 1.3.",
            "Data retention policies follow regulatory requirements. User data is retained for 90 days after account deletion. Backups are kept for 30 days for disaster recovery.",
            "Third-party data sharing is limited to essential service providers. We never sell customer data. View our data processing addendum for complete details.",
        ],
        "refund_policy.md": [
            "Refund policy: Customers may request a full refund within 30 days of initial purchase. Contact support@orchestratai.com with your account ID to initiate the refund process.",
            "Partial refunds are available for unused portions of annual subscriptions when downgrading or canceling mid-term. Processing takes 5-7 business days.",
            "Enterprise contracts have custom refund terms negotiated during contract signing. Refer to your service agreement for specific refund and cancellation policies.",
        ],
        # Orchestrator/General domain
        "general_faq.md": [
            "Frequently asked questions cover account setup, billing, technical integration, and policy information. Search our knowledge base or contact support for assistance.",
            "Getting started is easy: Create an account, verify your email, generate an API key, and start making requests. Check our quickstart guide for detailed instructions.",
            "Support channels include email (support@orchestratai.com), live chat (business hours), and community forums. Enterprise customers have dedicated Slack channels.",
        ],
        "getting_started.md": [
            "Welcome to OrchestratAI! This guide walks you through account setup, API authentication, making your first request, and exploring advanced features.",
            "Step 1: Create your account at app.orchestratai.com. Step 2: Verify your email address. Step 3: Generate an API key in the dashboard. Step 4: Install the SDK.",
            "Our platform supports multiple programming languages including Python, JavaScript, Ruby, and Go. Choose your preferred language and follow the integration guide.",
        ],
    }

    # Find matching template
    for file_pattern, templates in content_templates.items():
        if file_pattern in filename:
            content = random.choice(templates)
            # Truncate to 150-200 characters for snippet display
            if len(content) > 200:
                return content[:197] + "..."
            return content

    # Default fallback content
    return (
        "Documentation content related to user query. "
        "Contains relevant information from knowledge base."
    )


def generate_query_analysis_log(agent: AgentId, message: str) -> RetrievalLog:
    """
    Generate QueryAnalysis log for routing decision.

    Args:
        agent: The agent selected for handling the query
        message: User input message

    Returns:
        RetrievalLog with QueryAnalysis data
    """
    # Generate intent based on agent type
    intent_map = {
        AgentId.BILLING: "Billing inquiry detected",
        AgentId.TECHNICAL: "Technical support request detected",
        AgentId.POLICY: "Policy question detected",
        AgentId.ORCHESTRATOR: "General inquiry detected",
    }
    intent = intent_map[agent]

    # Generate confidence score
    confidence = round(random.uniform(0.85, 0.99), 3)

    # Generate reasoning based on agent type
    reasoning_map = {
        AgentId.BILLING: "Message contains pricing/billing keywords",
        AgentId.TECHNICAL: "Message contains technical/error keywords",
        AgentId.POLICY: "Message contains policy/refund keywords",
        AgentId.ORCHESTRATOR: "No specific domain keywords detected",
    }
    reasoning = reasoning_map[agent]

    # Create QueryAnalysis data structure
    query_analysis_data = {
        "intent": intent,
        "confidence": confidence,
        "target_agent": agent.value,
        "reasoning": reasoning,
    }

    return RetrievalLog(
        id=str(uuid.uuid4()),
        type=LogType.ROUTING,
        title=f"Query Analysis: Routed to {agent.value}",
        data=query_analysis_data,
        timestamp=datetime.now(UTC).isoformat(),
        status=LogStatus.SUCCESS,
        chunks=None,
    )


def generate_vector_search_log(agent: AgentId) -> RetrievalLog:
    """
    Generate VectorSearch log with realistic document chunks.

    Args:
        agent: The agent handling the request

    Returns:
        RetrievalLog with VectorSearch data and DocumentChunks
    """
    # Filenames by agent domain
    filenames_by_agent = {
        AgentId.BILLING: ["pricing_faq.md", "subscription_guide.md", "payment_methods.md"],
        AgentId.TECHNICAL: ["api_documentation.md", "troubleshooting_guide.md", "sdk_reference.md"],
        AgentId.POLICY: ["terms_of_service.md", "privacy_policy.md", "refund_policy.md"],
        AgentId.ORCHESTRATOR: ["general_faq.md", "getting_started.md"],
    }

    filenames = filenames_by_agent[agent]
    chunks_retrieved = random.randint(3, 7)

    # Generate document chunks
    chunks = []
    for i in range(chunks_retrieved):
        filename = random.choice(filenames)
        content = generate_document_snippet(filename)
        similarity = round(random.uniform(0.75, 0.95), 3)

        chunk = DocumentChunk(
            id=i,
            content=content,
            similarity=similarity,
            source=filename,
            metadata={"chunk_index": i, "collection": "knowledge_base_v1"},
        )
        chunks.append(chunk)

    # Create VectorSearch data structure
    latency = random.randint(50, 300)
    vector_search_data = {
        "collection": "knowledge_base_v1",
        "chunks_retrieved": chunks_retrieved,
        "chunks": [chunk.model_dump() for chunk in chunks],
        "latency": latency,
    }

    return RetrievalLog(
        id=str(uuid.uuid4()),
        type=LogType.VECTOR_SEARCH,
        title=f"Vector Search: Retrieved {chunks_retrieved} chunks",
        data=vector_search_data,
        timestamp=datetime.now(UTC).isoformat(),
        status=LogStatus.SUCCESS,
        chunks=chunks,
    )


def generate_cache_operation_log() -> RetrievalLog:
    """
    Generate CacheOperation log with hit/miss status.

    Returns:
        RetrievalLog with CacheOperation data
    """
    # Random status: hit or miss
    status = random.choice(["hit", "miss"])

    # Generate hit_rate
    hit_rate = round(random.uniform(0.60, 0.90), 3)

    # Generate cache size
    size = f"{random.uniform(1.0, 5.0):.1f} MB"

    # Create CacheOperation data structure
    cache_operation_data = {
        "status": status,
        "hit_rate": hit_rate,
        "size": size,
    }

    title = f"Cache {'Hit' if status == 'hit' else 'Miss'}: {size} cached"
    log_status = LogStatus.SUCCESS if status == "hit" else LogStatus.WARNING

    return RetrievalLog(
        id=str(uuid.uuid4()),
        type=LogType.CACHE,
        title=title,
        data=cache_operation_data,
        timestamp=datetime.now(UTC).isoformat(),
        status=log_status,
        chunks=None,
    )


def generate_mock_retrieval_logs(agent: AgentId, message: str) -> list[RetrievalLog]:
    """
    Generate realistic retrieval logs using specialized log generators.

    Args:
        agent: The agent handling the request
        message: User input message

    Returns:
        List of RetrievalLog objects with QueryAnalysis, VectorSearch, and CacheOperation
    """
    logs = []

    # 1. Always include QueryAnalysis log first (routing decision)
    logs.append(generate_query_analysis_log(agent, message))

    # 2. 80% chance: Add VectorSearch log
    if random.random() < 0.8:
        logs.append(generate_vector_search_log(agent))

    # 3. 50% chance: Add CacheOperation log
    if random.random() < 0.5:
        logs.append(generate_cache_operation_log())

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
    logs = generate_mock_retrieval_logs(agent, message)

    # Generate realistic metrics
    tokens_used = random.randint(200, 800)
    latency_ms = random.randint(800, 2000)
    cost = round(random.uniform(0.001, 0.005), 5)
    cache_status = cast(
        Literal["hit", "miss", "none"],
        random.choices(["hit", "miss", "none"], weights=[0.3, 0.3, 0.4])[0],
    )

    metrics = ChatMetrics(
        tokensUsed=tokens_used,
        cost=cost,
        latency=latency_ms,
        cache_status=cache_status,
    )

    # Set agent status - orchestrator IDLE (already routed),
    # selected agent COMPLETE (finished processing)
    agent_status = {
        AgentId.ORCHESTRATOR: AgentStatus.IDLE,
        AgentId.BILLING: AgentStatus.IDLE,
        AgentId.TECHNICAL: AgentStatus.IDLE,
        AgentId.POLICY: AgentStatus.IDLE,
    }
    agent_status[agent] = AgentStatus.COMPLETE

    return ChatResponse(
        message=response_text,
        agent=agent,
        confidence=round(confidence, 3),
        logs=logs,
        metrics=metrics,
        agent_status=agent_status,
    )
