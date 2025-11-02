# Agent Types Guide

## Overview

OrchestratAI supports four agent types, each optimized for different use cases.

## RAG Agent

**Best for:** Question answering over documents

Uses retrieval-augmented generation to fetch relevant context before generating responses.

```python
client.agents.execute(
    agent_type="rag",
    query="What are the pricing tiers?",
    config={
        "model": "gpt-4",
        "retrieval_k": 5  # Number of documents to retrieve
    }
)
```

### When to Use
- Documentation Q&A
- Knowledge base search
- Customer support
- Research assistance

## CAG Agent

**Best for:** Computational tasks

Computation-augmented generation integrates with code execution and APIs.

```python
client.agents.execute(
    agent_type="cag",
    query="Calculate the compound interest on $10,000 at 5% for 10 years",
    config={
        "model": "gpt-4",
        "allow_code_execution": True
    }
)
```

### When to Use
- Mathematical calculations
- Data analysis
- API integrations
- Automated workflows

## Hybrid Agent

**Best for:** Complex multi-step tasks

Combines retrieval and computation capabilities.

```python
client.agents.execute(
    agent_type="hybrid",
    query="Find our refund policy and calculate a pro-rated refund",
    config={
        "model": "gpt-4o",
        "retrieval_k": 3
    }
)
```

### When to Use
- Multi-step reasoning
- Tasks requiring context + computation
- Complex customer requests

## Direct Agent

**Best for:** Simple queries without context

Direct LLM invocation without retrieval or computation.

```python
client.agents.execute(
    agent_type="direct",
    query="Write a professional email",
    config={
        "model": "claude-3-haiku",
        "temperature": 0.9
    }
)
```

### When to Use
- Creative writing
- General conversation
- Simple queries
- Fast responses needed

## Choosing the Right Agent

| Use Case | Agent Type |
|----------|------------|
| Document search | RAG |
| Calculations | CAG |
| Multi-step tasks | Hybrid |
| Creative writing | Direct |
| Fast responses | Direct |
| Complex workflows | Hybrid |
