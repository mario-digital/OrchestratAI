# OrchestratAI - Multi-Agent System Architecture Plan

**Document Created:** November 2, 2025
**Last Updated:** November 2, 2025
**Architect:** Winston (Architect Agent)
**Status:** ✅ Final - Ready for Story Creation
**Target Epic:** Epic 7 - Real Agent Integration

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Key Objectives](#key-objectives)
3. [System Architecture](#system-architecture)
4. [Multi-Provider LLM Strategy](#multi-provider-llm-strategy)
5. [Infrastructure Setup](#infrastructure-setup)
6. [Epic 7 Story Breakdown](#epic-7-story-breakdown)
7. [Acceptance Criteria](#acceptance-criteria)
8. [Testing Strategy](#testing-strategy)

---

## Executive Summary

This document provides the **final, approved plan** to transform OrchestratAI from a mock-based chat interface into a production-ready **multi-agent AI system** with intelligent orchestration, advanced retrieval strategies (RAG, CAG, Hybrid), and multi-provider LLM integration (OpenAI + AWS Bedrock).

### Key Decisions

✅ **Zero UI Design Changes**
- Existing 14 panel components already built and perfect
- Simply swap mock data for real data
- Same API contracts maintained
- No new components needed

✅ **LangGraph Orchestration**
- No custom framework - use LangGraph from day 1
- Guide/Delegate mode for intelligent routing
- Built-in state management and streaming
- Visual graph representation

✅ **Service Bridge Pattern**
- `agent_service.py` bridges FastAPI ↔ LangGraph
- Clean separation of HTTP and agent logic
- Keeps existing architecture patterns
- Enables testing agents in isolation

✅ **ChromaDB → Pinecone Migration Path**
- Start with ChromaDB (Docker, local dev)
- Clean abstraction for easy Pinecone migration
- Production-ready vector store strategy

### Timeline & Scope

**Epic 7: 8 Stories over 6-8 weeks**
- Stories 7.1-7.2: Foundation (LLM providers, vector DB) - 2 weeks
- Stories 7.3-7.5: Orchestration & Workers (RAG, CAG, Hybrid agents) - 3 weeks
- Stories 7.6-7.7: Integration & Testing (Frontend hookup, E2E tests) - 2 weeks
- Story 7.8: Production deployment - 1 week

**Cost Target:** ~$0.01/query average (with 70% cache hit rate)

**No Mock Data Removal:** Keep `mock_data.py` for testing only

---

## Key Objectives

### 1. Build a Multi-Agent System
Create a **hierarchical agent workflow** where a central orchestrator intelligently routes user queries to specialized worker agents with guide/delegate modes.

### 2. Implement Advanced Retrieval
Showcase different **augmented generation strategies** tailored to specific needs:
- **RAG** (Retrieval-Augmented Generation) - Document-based Q&A with vector search
- **CAG** (Cached-Augmented Generation) - Fast, cost-optimized responses with Redis caching
- **Hybrid** - Complex queries requiring both retrieval + reasoning
- **Direct** - Simple conversational queries without retrieval

### 3. Leverage Multi-Provider LLM Strategy
Integrate LLMs from both **OpenAI** and **AWS Bedrock**, assigning them strategically to optimize for cost and performance:
- **Bedrock Claude 3.5 Sonnet**: Orchestrator (strategic routing)
- **OpenAI GPT-4 Turbo**: RAG agent (best retrieval synthesis)
- **Bedrock Claude 3 Haiku**: CAG & Direct agents (fast, cheap)
- **OpenAI GPT-4o**: Hybrid agent (balanced performance)

---

## System Architecture

### Architecture Diagram

```
┌──────────────────────────────────────────────────────────────────────┐
│                         USER INTERFACE                               │
│                    (Next.js 15 + React 19)                           │
│                     Already Built - No Changes                       │
│                                                                      │
│  ┌────────────┐  ┌─────────────┐  ┌──────────────┐                   │
│  │ Agent      │  │ Retrieval   │  │ Execution    │                   │
│  │ Panel      │  │ Panel       │  │ Graph        │  14 Panels        │
│  │ (138 lines)│  │ (385 lines) │  │ (219 lines)  │  Ready            │
│  └────────────┘  └─────────────┘  └──────────────┘                   │
│         ▲               ▲                 ▲                          │
│         │               │                 │                          │
│         └───────────────┴─────────────────┘                          │
│                         │                                            │
│                    SSE Streaming                                     │
│                  (use-streaming.ts)                                  │
│                    524 lines - Ready                                 │
└──────────────────────┬───────────────────────────────────────────────┘
                       │ HTTP/SSE
                       ▼
┌──────────────────────────────────────────────────────────────────────┐
│                      FASTAPI BACKEND                                 │
│                    /api/chat endpoint                                │
│                         │                                            │
│                         ▼                                            │
│              ┌─────────────────────┐                                 │
│              │  AGENT SERVICE      │  ← NEW: Bridge Layer            │
│              │  (agent_service.py) │    Translates HTTP ↔ LangGraph  │
│              └──────────┬──────────┘                                 │
│                         │                                            │
│                         ▼                                            │
│           ┌─────────────────────────────┐                            │
│           │   LANGGRAPH ORCHESTRATOR    │  ← NEW: Orchestration      │
│           │   (Bedrock Claude 3.5)      │                            │
│           │                             │                            │
│           │  ┌────────────────────┐     │                            │
│           │  │ 1. Analyze Query   │─────┼── META_ROUTING?            │
│           │  └────────────────────┘     │      │                     │
│           │           │                 │      ├─Yes─→ GUIDE MODE    │
│           │           ▼                 │      │      (Answer        │
│           │  ┌────────────────────┐     │      │       directly)     │
│           │  │ 2. Route Decision  │─────┼──────┘                     │
│           │  └────────────────────┘     │      └─No──→ DELEGATE      │
│           │           │                 │              MODE          │
│           └───────────┼─────────────────┘                            │
│                       │                                              │
│        ┌──────────────┼──────────────┬──────────────┬──────────┐     │
│        │              │              │              │          │     │
│        ▼              ▼              ▼              ▼          ▼     │
│   ┌────────┐    ┌─────────┐   ┌──────────┐   ┌─────────┐             │
│   │  RAG   │    │   CAG   │   │  HYBRID  │   │ DIRECT  │  ← NEW      │
│   │ AGENT  │    │  AGENT  │   │  AGENT   │   │  AGENT  │             │
│   │        │    │         │   │          │   │         │             │
│   │ OpenAI │    │ Bedrock │   │  OpenAI  │   │ Bedrock │             │
│   │ GPT-4  │    │  Haiku  │   │  GPT-4o  │   │  Haiku  │             │ 
│   │ Turbo  │    │         │   │          │   │         │             │ 
│   │        │    │         │   │          │   │         │             │
│   │ Use:   │    │  Use:   │   │   Use:   │   │  Use:   │             │
│   │ Doc    │    │ Cached  │   │ Complex  │   │ Simple  │             │
│   │ Q&A    │    │ Queries │   │ Multi-   │   │ Chat    │             │
│   │ Knowledge   │ Fast    │   │ step     │   │         │             │
│   └────┬───┘    └────┬────┘   └─────┬────┘   └────┬────┘             │
│        │             │              │             │                  │
│        │             │              │             │                  │
└────────┼─────────────┼──────────────┼─────────────┼──────────────────┘
         │             │              │             │
         ▼             ▼              ▼             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        DATA LAYER                                   │
│                                                                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐           │
│  │ VECTOR DB    │  │ REDIS CACHE  │  │ DOCUMENT STORE   │           │
│  │ (ChromaDB)   │  │ (Semantic    │  │ (PostgreSQL)     │           │
│  │              │  │  Caching)    │  │                  │           │
│  │ • Embeddings │  │ • Query Hash │  │ • Raw Documents  │           │
│  │ • Similarity │  │ • Hit/Miss   │  │ • Metadata       │           │
│  │ • Retrieval  │  │ • TTL        │  │ • Version        │           │
│  └──────────────┘  └──────────────┘  └──────────────────┘           │
│        ▲                  ▲                    ▲                    │
│        │                  │                    │                    │
│   NEW: Docker       Already Running       NEW: Docker               │
│   Container         (Redis)               Container                 │
│   (Port 8001)       (Port 6379)           (Port 5432)               │
└─────────────────────────────────────────────────────────────────────┘
```

### Data Flow Example

**User Query: "What is RAG?"**

```
1. User types in chat → Frontend (React)
2. Frontend → POST /api/chat → FastAPI
3. FastAPI → AgentService.process_chat()
4. AgentService → LangGraph Orchestrator.ainvoke()
5. Orchestrator → Analyze: "DOMAIN_QUESTION" → DELEGATE MODE
6. Orchestrator → Route to RAG Agent (requires retrieval)
7. RAG Agent → Embed query (OpenAI text-embedding-3-large)
8. RAG Agent → ChromaDB.similarity_search(top_k=5)
9. RAG Agent → GPT-4 Turbo.generate(context + query)
10. RAG Agent → Return ChatResponse + metrics
11. AgentService → Convert LangGraph output to ChatResponse
12. FastAPI → Stream events via SSE to Frontend
13. Frontend → Existing panels display real data (no code changes)
```

**Metrics Automatically Returned:**
- Orchestrator: 200 tokens, $0.0006, 800ms (Bedrock Sonnet)
- RAG Agent: 3,500 tokens, $0.0405, 2,800ms (OpenAI GPT-4)
- **Total: $0.0411, 3,600ms, 5 documents retrieved**

**Existing UI Automatically Shows:**
- Agent Panel: "Orchestrator → RAG" (no changes needed)
- Retrieval Panel: 5 documents with real similarity scores
- Execution Graph: analyze_query → route → vector_search → generate
- Metrics Panel: Real tokens, real cost, real latency

---

## Multi-Provider LLM Strategy

### Cost/Performance Optimization Matrix

| Role | Provider | Model | Cost/1M Tokens | Latency | Use Case |
|------|----------|-------|----------------|---------|----------|
| **Orchestrator (Analysis)** | AWS Bedrock | Claude 3.5 Sonnet | $3 in / $15 out | ~1-2s | Query analysis & routing decisions |
| **Orchestrator (Guide Mode)** | AWS Bedrock | Claude 3 Haiku | $0.25 in / $1.25 out | <500ms | Fast meta/routing responses |
| **RAG Worker** | OpenAI | GPT-4 Turbo | $10 in / $30 out | ~2-4s | Document Q&A, best quality |
| **CAG Worker** | AWS Bedrock | Claude 3 Haiku | $0.25 in / $1.25 out | <1s | Cached/repeated queries |
| **Hybrid Worker** | OpenAI | GPT-4o | $5 in / $15 out | ~2-3s | Complex multi-step reasoning |
| **Direct Worker** | AWS Bedrock | Claude 3 Haiku | $0.25 in / $1.25 out | <1s | Simple conversational queries |
| **Embeddings** | OpenAI | text-embedding-3-large | $0.13 / 1M | ~100ms | Vector embeddings for RAG |

### Orchestrator Model Selection Strategy

The orchestrator uses **two different models** depending on the operation:

**1. Analysis & Routing (Claude 3.5 Sonnet)**
- Used for: Query analysis, intent classification, routing decisions
- Why: Superior reasoning for strategic decisions
- Cost: ~200 tokens × $3/1M = $0.0006 per query
- All queries use this for initial analysis

**2. Guide Mode Responses (Claude 3 Haiku)**
- Used for: Direct responses to meta/routing questions
- Why: Ultra-fast (<500ms), cheap for simple explanatory responses
- Cost: ~400 tokens × $0.25/1M = $0.0001 per query
- Only ~10-15% of queries use this

**ProviderFactory Implementation:**
```python
class ProviderFactory:
    def get_orchestrator_provider(self, mode: str):
        if mode == "analysis":
            return BedrockProvider(model="claude-3-5-sonnet")  # Strategic
        elif mode == "guide":
            return BedrockProvider(model="claude-3-haiku")      # Fast replies
        else:
            raise ValueError(f"Unknown mode: {mode}")
```

### Expected Query Distribution

```
70% → CAG Agent (cached)     = $0.0007/query
20% → RAG Agent (retrieval)  = $0.0400/query
7%  → Hybrid Agent (complex) = $0.0200/query
3%  → Direct Agent (simple)  = $0.0007/query

Note: All queries incur orchestrator analysis cost (~$0.0006)
15% of queries use guide mode (additional ~$0.0001)

Weighted Average: ~$0.010/query
```

**Monthly Cost (10,000 queries):** ~$100/month

---

## Infrastructure Setup

### Docker Compose Configuration

Add to existing `docker-compose.yml`:

```yaml
services:
  # Existing services: backend, frontend, redis

  # NEW: PostgreSQL for document metadata and app data
  postgres:
    image: postgres:16-alpine
    container_name: orchestratai-postgres
    ports:
      - "5432:5432"
    environment:
      - POSTGRES_DB=orchestratai
      - POSTGRES_USER=orchestratai_user
      - POSTGRES_PASSWORD=orchestratai_pass
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - orchestratai-network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U orchestratai_user -d orchestratai"]
      interval: 10s
      timeout: 5s
      retries: 5

  # NEW: ChromaDB for vector storage
  chromadb:
    image: chromadb/chroma:latest
    container_name: orchestratai-chromadb
    ports:
      - "8001:8000"  # Expose on 8001 (avoid conflict with FastAPI on 8000)
    volumes:
      - chroma_data:/chroma/chroma
    environment:
      - IS_PERSISTENT=TRUE
      - ANONYMIZED_TELEMETRY=FALSE
    networks:
      - orchestratai-network
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/api/v1/heartbeat"]
      interval: 30s
      timeout: 10s
      retries: 3

volumes:
  postgres_data:
    driver: local
  chroma_data:
    driver: local
  redis_data:
    driver: local
```

### Environment Variables

Developers can choose between direct `.env` credentials or 1Password-backed secrets. Set `USE_ONEPASSWORD=true` (default) to resolve keys via the 1Password CLI helper; set `false` to rely solely on environment variables.

Add to `orchestratai_api/.env`:

```bash
# Secret sourcing
USE_ONEPASSWORD=true  # defaults to true; set false to skip vault lookup

# OpenAI
OPENAI_API_KEY=sk-...

# AWS Bedrock
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...
AWS_REGION=us-east-1

# Vector DB
VECTOR_DB_BACKEND=chromadb  # or 'pinecone' for production
CHROMADB_HOST=chromadb
CHROMADB_PORT=8000
PINECONE_API_KEY=...  # for future production use
PINECONE_ENVIRONMENT=...

# Redis (already configured)
REDIS_HOST=redis
REDIS_PORT=6379

# PostgreSQL (NEW)
POSTGRES_HOST=postgres
POSTGRES_PORT=5432
POSTGRES_DB=orchestratai
POSTGRES_USER=orchestratai_user
POSTGRES_PASSWORD=orchestratai_pass
DATABASE_URL=postgresql://orchestratai_user:userpass@postgres:5432/orchestratai

# Agent Configuration
# Orchestrator uses TWO models:
ORCHESTRATOR_ANALYSIS_MODEL=anthropic.claude-3-5-sonnet-20241022-v2:0  # Strategic routing
ORCHESTRATOR_GUIDE_MODEL=anthropic.claude-3-haiku-20240307-v1:0        # Fast guide mode

# Worker agent models:
DEFAULT_RAG_MODEL=gpt-4-turbo
DEFAULT_CAG_MODEL=anthropic.claude-3-haiku-20240307-v1:0
DEFAULT_HYBRID_MODEL=gpt-4o
DEFAULT_DIRECT_MODEL=anthropic.claude-3-haiku-20240307-v1:0

# Embeddings:
DEFAULT_EMBEDDING_MODEL=text-embedding-3-large

# Performance
CACHE_TTL=3600
SIMILARITY_THRESHOLD=0.7
RERANK_TOP_K=5
MAX_TOKENS_DEFAULT=1000
```

### Python Dependencies

Add to `orchestratai_api/pyproject.toml`:

```toml
dependencies = [
    # Existing
    "fastapi>=0.109.0",
    "uvicorn>=0.27.0",
    "pydantic>=2.5.0",

    # NEW: LLM Providers
    "openai>=1.12.0",
    "boto3>=1.34.0",

    # NEW: Orchestration
    "langgraph>=0.0.20",
    "langchain-core>=0.1.0",

    # NEW: Vector DB & Retrieval
    "chromadb>=0.4.22",
    "sentence-transformers>=2.3.0",  # Optional: local embeddings

    # NEW: Redis (already may have redis)
    "redis>=5.0.0",

    # NEW: Utilities
    "tiktoken>=0.5.0",  # Token counting
    "tenacity>=8.2.0",  # Retry logic
]
```

---

## Epic 7 Story Breakdown

### Story 7.1: LLM Provider Integration & Infrastructure

**Epic:** Epic 7 - Real Agent Integration  
**Story Points:** 5  
**Priority:** P0 (Critical - Foundation)  
**Assignee:** Backend Engineer  
**Dependencies:** None

#### Description
Stand up the provider abstraction that the LangGraph workflow will call. The layer mirrors the patterns from the `langchain` learning repo (see `agent_direct_1password.py:16` and `onepassword_utils.py:14`) but is adapted for our FastAPI backend. Every agent (orchestrator + specialists) will flow through this layer, so we need:

1. A typed response object for consistent metrics/cost reporting.  
2. A base provider that normalises sync/stream calls and exposes token counting.  
3. Concrete OpenAI and Bedrock providers that source credentials from either `.env` or 1Password (when available).  
4. A `ProviderFactory` that maps agent roles → (provider, model, pricing profile) and supports the orchestrator’s dual-model mode (analysis vs. guide).

#### Tasks
- [ ] **Scaffold provider contracts**
  - Create `src/llm/types.py` with strongly typed results:
    ```python
    # src/llm/types.py
    from dataclasses import dataclass
    from typing import Any

    @dataclass(slots=True)
    class LLMCallResult:
        content: str
        model: str
        tokens_input: int
        tokens_output: int
        cost: float
        raw: Any | None = None
        logprobs: Any | None = None

    @dataclass(slots=True)
    class StreamChunk:
        content: str
        tokens_output: int
        raw: Any | None = None
    ```
  - Create `src/llm/base_provider.py` inspired by the repo’s tooling patterns:
    ```python
    from abc import ABC, abstractmethod
    from collections.abc import AsyncIterator
    from .types import LLMCallResult, StreamChunk

    class BaseLLMProvider(ABC):
        pricing: dict[str, dict[str, float]]

        @abstractmethod
        async def complete(self, *, messages: list[dict[str, str]], **kwargs) -> LLMCallResult: ...

        @abstractmethod
        async def stream(self, *, messages: list[dict[str, str]], **kwargs) -> AsyncIterator[StreamChunk]: ...

        @abstractmethod
        def count_tokens(self, *, messages: list[dict[str, str]]) -> tuple[int, int]: ...
    ```

- [ ] **Credential resolution helper**
  - Add `src/llm/secrets.py` that first checks environment variables, then (optionally) falls back to 1Password’s `OnePasswordSecretManager` so local devs can keep using `.env` while secure setups can adopt the repo’s direct vault approach:
    ```python
    import os
    from functools import cache

    try:
        from onepassword_utils import get_secret as _get_secret
    except ImportError:  # pragma: no cover
        _get_secret = None

    @cache
    def resolve_secret(key: str) -> str:
        use_1password = os.getenv("USE_ONEPASSWORD", "true").lower() == "true"
        if value := os.getenv(key):
            return value
        if use_1password and _get_secret is not None:
            return _get_secret(key)
        raise RuntimeError(f"Missing credential: {key}")
    ```
  - Document the helper in `.env.template` so developers know both options.

- [ ] **Implement OpenAI provider (`src/llm/openai_provider.py`)**
  - Use `langchain_openai.ChatOpenAI` just like `my_first_agent.py:16`, wrap it behind our abstraction, and capture usage metadata:
    ```python
    from langchain_openai import ChatOpenAI
    import tiktoken

    class OpenAIProvider(BaseLLMProvider):
        pricing = {
            "gpt-4-turbo": {"prompt": 0.01, "completion": 0.03},
            "gpt-4o": {"prompt": 0.005, "completion": 0.015},
            "text-embedding-3-large": {"prompt": 0.00013, "completion": 0.0},
        }

        def __init__(self, model: str, *, temperature: float = 0.1, timeout: int = 30):
            self.model = model
            self._client = ChatOpenAI(
                model=model,
                api_key=resolve_secret("OPENAI_API_KEY"),
                timeout=timeout,
                temperature=temperature,
            )
            self._encoder = tiktoken.encoding_for_model(model)
    ```
  - Implement `complete`, `stream`, and `count_tokens` so that every call returns an `LLMCallResult` with cost derived from the `pricing` table (cost per 1K tokens like in the LangChain examples).

- [ ] **Implement AWS Bedrock provider (`src/llm/bedrock_provider.py`)**
  - Follow the same shape but call `boto3.client("bedrock-runtime")` and normalise Anthropic’s usage payload:
    ```python
    import boto3

    class BedrockProvider(BaseLLMProvider):
        pricing = {
            "anthropic.claude-3-5-sonnet-20241022-v2:0": {"prompt": 0.003, "completion": 0.015},
            "anthropic.claude-3-haiku-20240307-v1:0": {"prompt": 0.00025, "completion": 0.00125},
        }

        def __init__(self, model: str, *, temperature: float = 0.1):
            self.model = model
            self._client = boto3.client(
                "bedrock-runtime",
                region_name=resolve_secret("AWS_REGION"),
                aws_access_key_id=resolve_secret("AWS_ACCESS_KEY_ID"),
                aws_secret_access_key=resolve_secret("AWS_SECRET_ACCESS_KEY"),
            )
    ```
  - Convert the JSON response (`response["output"]`) into `LLMCallResult` with cost derived from the usage metadata the same way the LangChain repo exposes it in `agent-output.py`.

- [ ] **Build ProviderFactory (`src/llm/provider_factory.py`)**
  - Map agent roles to providers using an enum so orchestration code can request `ProviderFactory.for_role(AgentRole.RAG)`:
    ```python
    from enum import Enum

    class AgentRole(str, Enum):
        ORCHESTRATOR_ANALYSIS = "orchestrator_analysis"
        ORCHESTRATOR_GUIDE = "orchestrator_guide"
        RAG = "rag"
        CAG = "cag"
        HYBRID = "hybrid"
        DIRECT = "direct"
        EMBEDDINGS = "embeddings"
    ```
  - Cache provider instances so we reuse SDK clients per-process (pattern lifted from the repo’s `ProviderFactory` sketch).

- [ ] **Token + cost helpers**
  - Add `src/llm/pricing.py` with utilities:
    ```python
    def dollar_cost(model_pricing: dict[str, float], *, tokens_prompt: int, tokens_completion: int) -> float:
        return (
            (tokens_prompt / 1000) * model_pricing["prompt"]
            + (tokens_completion / 1000) * model_pricing.get("completion", 0.0)
        )
    ```
  - Ensure embedding calls use `tokens_completion = 0` so cost is prompt-only.

- [ ] **Unit tests (`tests/llm/`)**
  - Mock `ChatOpenAI` / `boto3` responses and verify: credential resolution order, token counting, cost math, streaming chunk aggregation, orchestrator dual-mode (analysis vs guide) selection, and error surfaces when credentials are missing.

#### Acceptance Criteria
- [ ] Providers return `LLMCallResult` instances with accurate token + cost information for every call path (sync + stream + embeddings).  
- [ ] `ProviderFactory` supplies cached providers and switches the orchestrator between Sonnet (analysis) and Haiku (guide).  
- [ ] Embedding provider path produces vectors compatible with Chroma ingestion.  
- [ ] Unit tests cover success and failure paths with ≥90 % coverage.  
- [ ] `.env.template` and developer docs spell out both `.env` and optional 1Password secret sourcing.  
- [ ] `pytest tests/llm` passes locally and in CI.

#### Testing Notes
```python
import pytest
from unittest.mock import AsyncMock

@pytest.mark.asyncio
async def test_openai_provider_complete(monkeypatch):
    provider = OpenAIProvider(model="gpt-4-turbo")
    provider._client.apredict = AsyncMock(return_value="Hello")
    result = await provider.complete(messages=[{"role": "user", "content": "hi"}])

    assert result.content == "Hello"
    assert result.model == "gpt-4-turbo"
    assert result.tokens_input >= 1
    assert result.cost > 0
```

---

### Story 7.2: Vector Database Setup & Document Ingestion

**Epic:** Epic 7 - Real Agent Integration  
**Story Points:** 5  
**Priority:** P0 (Critical - Foundation)  
**Assignee:** Backend Engineer  
**Dependencies:** Story 7.1 (embeddings + provider layer)

#### Description
Bootstrap the retrieval layer exactly like the LangChain learning repo (`rag/7-document-loaders-and-text-splitter.md` and `rag/8-retrieval.md`). We need a Chroma container for development, a thin abstraction so we can swap Pinecone later, and an ingestion script capable of loading PDFs/Markdown into the store.

#### Tasks
- [ ] **Container + configuration**  
  - Extend `docker-compose.yml` with the Chroma service (port `8001`, persistent volume), mirroring the example earlier in this document.  
  - Ensure health checks succeed locally (`curl http://localhost:8001/api/v1/heartbeat`).

- [ ] **Vector store abstraction (`src/retrieval/vector_store.py`)**  
  - Define a protocol similar to the `VectorStore` interface referenced in the repo docs:
    ```python
    from abc import ABC, abstractmethod
    from langchain_core.documents import Document

    class VectorStore(ABC):
        @abstractmethod
        async def add_documents(self, *, documents: list[Document]) -> None: ...

        @abstractmethod
        async def similarity_search(self, *, query: str, k: int = 5) -> list[Document]: ...

        @abstractmethod
        async def similarity_search_with_scores(self, *, query: str, k: int = 5) -> list[tuple[Document, float]]: ...

        @abstractmethod
        async def clear(self) -> None: ...
    ```
  - Provide an async-friendly signature even though Chroma’s SDK is sync (wrap with `anyio.to_thread.run_sync`).

- [ ] **Chroma implementation (`src/retrieval/chroma_store.py`)**  
  - Use the same pattern from `rag/8-retrieval.md`:
    ```python
    from langchain_community.vectorstores import Chroma
    from langchain_openai import OpenAIEmbeddings

    class ChromaVectorStore(VectorStore):
        def __init__(self, *, persist_directory: str = "/app/chroma_db"):
            self._embeddings = OpenAIEmbeddings(model="text-embedding-3-large")
            self._client = Chroma(
                persist_directory=persist_directory,
                embedding_function=self._embeddings,
            )
    ```
  - Expose helpers for similarity search modes (`mmr`, `score_threshold`) so we can switch strategies from the agents.

- [ ] **Ingestion pipeline (`scripts/ingest_data.py`)**  
  - Port the end-to-end flow from the repo’s PDF demo: load → split → embed → persist.  
  - Support Markdown, JSON, and PDF by composing loaders (`DirectoryLoader`, `PyPDFLoader`) and `RecursiveCharacterTextSplitter` with `chunk_size=512`, `chunk_overlap=80`.  
  - CLI usage:
    ```bash
    uv run python scripts/ingest_data.py \
      --source ./data/docs \
      --collection knowledge_base_v1 \
      --chunk-size 512 \
      --chunk-overlap 80
    ```
  - Record metadata (`source`, `page`, `ingested_at`) on each `Document` the same way the reference repo prints page numbers.

- [ ] **Sample corpus**  
  - Seed `data/docs/` with at least 50 documents (mix of pricing FAQs, policy PDFs, API guides). For PDFs reuse `docs/agent-planning/sample-doc.pdf` or convert Markdown to PDF for testing.  
  - Document how to refresh the store (`scripts/ingest_data.py --reset`).

- [ ] **Integration tests (`tests/retrieval/`)**  
  - Use `pytest` + `pytest-asyncio` to spin up a temporary Chroma instance (point `persist_directory` to a temp folder).  
  - Validate ingestion (document count), similarity search ordering, MMR behaviour, and score-threshold filtering.  
  - Ensure embeddings are generated via our provider factory’s embedding role, not direct SDK calls.

#### Acceptance Criteria
- [ ] `docker compose up chromadb` succeeds with healthy status.  
- [ ] Running `uv run python scripts/ingest_data.py --source data/docs` ingests the sample corpus without errors.  
- [ ] `ChromaVectorStore.similarity_search` returns documents with metadata populated (source + page).  
- [ ] `ChromaVectorStore.similarity_search_with_scores` returns cosine scores consistent with LangChain expectations (< 0.5 for strong matches).  
- [ ] Tests in `tests/retrieval` pass with ≥90 % coverage and clean up temporary directories.  
- [ ] README snippet documents how to add new documents and re-run ingestion.

#### Testing Notes
```python
import pytest
from pathlib import Path
from langchain_core.documents import Document

@pytest.mark.asyncio
async def test_ingest_and_search(tmp_path: Path):
    store = ChromaVectorStore(persist_directory=tmp_path.as_posix())
    doc = Document(page_content="Retrieval-Augmented Generation improves answers", metadata={"source": "demo.md"})
    await store.add_documents(documents=[doc])

    results = await store.similarity_search(query="What is RAG?", k=1)
    assert results and results[0].metadata["source"] == "demo.md"
```

---

### Story 7.3: LangGraph Orchestrator & RAG Agent

**Epic:** Epic 7 - Real Agent Integration  
**Story Points:** 8  
**Priority:** P0 (Critical - Core Functionality)  
**Assignee:** Backend Engineer  
**Dependencies:** Stories 7.1, 7.2

#### Description
Replace the mock response pipeline with a LangGraph workflow that mirrors the multi-agent supervisor pattern described in `multi-agent/11-multi-agent.md`. This story delivers an orchestrator with guide/delegate modes plus the first real worker (RAG). The orchestrator will:

1. Analyse every request with Claude 3.5 Sonnet (analysis mode).  
2. Decide between `guide` (answer directly) or `delegate` (route to RAG).  
3. Stream events via SSE so the existing frontend panels light up with real data.

#### Tasks
- [ ] **Agent instrumentation (`src/agents/base.py`)**  
  - Create a `BaseAgent` class that wraps provider calls and captures metrics (tokens, cost, latency).  
  - Use the structure from `agent-output.py` to map raw usage metadata into our `AgentMetrics` schema.  
  - Expose `async def run(self, request: ChatRequest, **kwargs) -> ChatResponse` to standardise worker signatures.
    ```python
    class BaseAgent(ABC):
        def __init__(self, *, role: AgentRole, provider: BaseLLMProvider):
            self.role = role
            self.provider = provider

        async def _record(self, *, start: float, result: LLMCallResult, extra: dict | None = None) -> AgentMetrics:
            return AgentMetrics(
                agent_id=self.role.value,
                provider=self.provider.__class__.__name__.lower(),
                model=result.model,
                tokens_input=result.tokens_input,
                tokens_output=result.tokens_output,
                cost_total=result.cost,
                latency_ms=(time.perf_counter() - start) * 1000,
                extra=extra or {},
            )
    ```

- [ ] **RAG worker (`src/agents/workers/rag_agent.py`)**  
  - Implement the retrieval workflow exactly like the repo’s agentic RAG example (`rag/10-agentic-rag.md`): embed query → `ChromaVectorStore.similarity_search` → assemble context → call provider.  
  - Return both the `ChatResponse` (message + logs) and the `AgentMetrics` object from `_record`.

- [ ] **LangGraph state + nodes (`src/agents/orchestrator.py`)**  
  - Define an `OrchestratorState` `TypedDict` capturing `messages`, `analysis`, `route`, and `result`.  
  - Build the graph using `StateGraph`:
    ```python
    from langgraph.graph import StateGraph, END

    workflow = StateGraph(OrchestratorState)
    workflow.add_node("analyse", analyse_query)
    workflow.add_node("guide", guide_user)
    workflow.add_node("delegate", delegate_to_worker)

    workflow.set_entry_point("analyse")
    workflow.add_conditional_edges(
        "analyse",
        decide_route,
        {"guide": "guide", "delegate": "delegate"},
    )
    workflow.add_edge("guide", END)
    workflow.add_edge("delegate", END)
    orchestrator = workflow.compile()
    ```
  - `analyse_query` should call the orchestrator analysis provider (Claude Sonnet) and return intent/confidence metadata similar to the mock service.  
  - `guide_user` uses the orchestrator guide provider (Claude Haiku) to produce the final response without touching workers.  
  - `delegate_to_worker` invokes the RAG agent and stores the resulting message/metrics in state.

- [ ] **Agent service bridge (`src/services/agent_service.py`)**  
  - Translate incoming `ChatRequest` → `OrchestratorState` (include history + session).  
  - Call `orchestrator.astream_events` to surface SSE events mirroring the existing mock event types (`agent_status`, `retrieval_log`, `message_chunk`, `done`).  
  - Convert the final state back into our existing `ChatResponse` schema.

- [ ] **FastAPI endpoints**  
  - Swap `/api/chat` and `/api/chat/stream` to use `AgentService`. Keep the response contract unchanged so the frontend requires zero changes.  
  - Ensure streaming headers remain identical (CORS, `Cache-Control`, etc.).

- [ ] **Testing (`tests/orchestrator/`)**  
  - Unit-test decision logic (`decide_route`) with meta questions (guide) vs domain questions (delegate).  
  - Mock provider responses to assert the orchestrator updates `agent_status` events correctly.  
  - Integration test the RAG path end-to-end using a temp Chroma store seeded with a small document.

#### Acceptance Criteria
- [ ] Meta questions such as “What can you help with?” return orchestrator-only responses (guide mode) with accurate metrics and SSE events.  
- [ ] Domain questions trigger the RAG agent, yielding retrieval logs, metrics, and documents from Chroma.  
- [ ] `/api/chat` returns the exact schema consumed by the frontend today.  
- [ ] SSE stream emits `agent_status`, `retrieval_log`, `message_chunk`, and `done` in the order expected by `useStreaming`.  
- [ ] Tests in `tests/orchestrator` run green with ≥90 % coverage.  
- [ ] Manual run (`uv run python -m pytest tests/orchestrator`) plus a smoke test via `uv run uvicorn src.main:app --reload` confirm the UI renders live data.

#### Testing Notes
```python
import pytest

@pytest.mark.asyncio
async def test_decide_route_meta_question(orchestrator):
    state = await orchestrator.ainvoke({"messages": [{"role": "user", "content": "What can you do?"}]})
    assert state["route"] == "guide"
    assert "orchestrator" in state["result"].agent_status
```

---

### Story 7.4: CAG Agent with Redis Caching

**Epic:** Epic 7 - Real Agent Integration  
**Story Points:** 5  
**Priority:** P1 (High)  
**Assignee:** Backend Engineer  
**Dependencies:** Story 7.3

#### Description
Introduce the Cached-Augmented Generation (CAG) worker. It mirrors the LangChain repo’s semantic caching approach: compute an embedding for the query, look up a near neighbour in Redis, and fall back to generation when the cache misses. This keeps repeated/policy questions cheap by routing them to Claude 3 Haiku.

#### Tasks
- [ ] **Semantic cache (`src/cache/redis_cache.py`)**  
  - Create a reusable `RedisSemanticCache` that stores `(embedding, payload)` pairs with cosine similarity lookups:
    ```python
    import json
    import numpy as np
    import redis.asyncio as redis

    class RedisSemanticCache:
        def __init__(self, *, ttl_seconds: int = 3600):
            self._client = redis.from_url("redis://" + resolve_secret("REDIS_HOST"))
            self._ttl = ttl_seconds

        async def get(self, *, embedding: list[float], threshold: float = 0.85):
            items = await self._client.lrange("cag_cache", 0, -1)
            for raw in items:
                record = json.loads(raw)
                score = cosine_similarity(record["embedding"], embedding)
                if score >= threshold:
                    return record["payload"], score
            return None, 0.0

        async def set(self, *, embedding: list[float], payload: dict) -> None:
            await self._client.lpush("cag_cache", json.dumps({"embedding": embedding, "payload": payload}))
            await self._client.ltrim("cag_cache", 0, 999)
    ```
  - Reuse the embedding provider from Story 7.1 so cache keys align with the vector store.

- [ ] **CAG agent (`src/agents/workers/cag_agent.py`)**  
  - Implement the flow: embed query → cache lookup → on hit return cached result, on miss call Bedrock Haiku and persist the payload (message + metrics).  
  - Output `AgentMetrics` with `cache_hit` flag and cost savings.

- [ ] **Routing updates**  
  - Extend the orchestrator decision logic to send policy/pricing questions to the CAG agent.  
  - Record fallback path so the frontend can display when CAG short-circuits the response.

- [ ] **Observability**  
  - Emit `cache` retrieval logs mirroring the mock implementation (`LogType.CACHE`). Include hit/miss status and effective latency.  
  - Update `metrics.agent_status` to show Haiku cost/token usage even on cache hits (zeros when served from cache).

- [ ] **Tests (`tests/cag/`)**  
  - Unit-test cache hit/miss branches (mock Redis).  
  - Integration test: send the same query twice and assert the second response is instant and cost-free.  
  - Verify orchestrator routes the expected intents to CAG.

#### Acceptance Criteria
- [ ] First request for a policy/pricing question triggers Bedrock Haiku and persists the result in Redis.  
- [ ] Subsequent similar queries return from cache with cost = 0 and latency < 500 ms.  
- [ ] SSE stream includes `cache_hit` data in retrieval logs and metrics.  
- [ ] Orchestrator routing reflects CAG usage (guide vs delegate vs CAG).  
- [ ] Automated tests in `tests/cag` pass with ≥90 % coverage.

#### Testing Notes
```python
import pytest

@pytest.mark.asyncio
async def test_cag_cache_hit(cag_agent):
    first = await cag_agent.run("Can I get a refund?", session_id="abc")
    second = await cag_agent.run("Can I get a refund?", session_id="abc")
    assert second.metrics.cache_hit is True
    assert second.metrics.cost_total == 0
```

---

### Story 7.5: Hybrid & Direct Agents

**Epic:** Epic 7 - Real Agent Integration  
**Story Points:** 5  
**Priority:** P1 (High)  
**Assignee:** Backend Engineer  
**Dependencies:** Stories 7.3, 7.4

#### Description
Deliver the remaining worker agents and the resilience layer. The Hybrid agent combines retrieval + cache signals (parallelised with `asyncio.gather`), while the Direct agent provides a fast fallback for small-talk/unsupported queries. This story also wires in the orchestrator fallback chain (Hybrid → RAG → CAG → Direct) so failures degrade gracefully.

#### Tasks
- [ ] **Hybrid agent (`src/agents/workers/hybrid_agent.py`)**  
  - Run RAG retrieval and semantic cache lookup concurrently:
    ```python
    rag_task = asyncio.create_task(self._rag_agent.run(message, session_id=session_id))
    cache_task = asyncio.create_task(self._cache.get(embedding=query_embedding))
    rag_result, cache_hit = await asyncio.gather(rag_task, cache_task)
    ```
  - Merge contexts by ranking unique chunks (deduplicate by `source + page`) and feed them into GPT-4o.  
  - Aggregate metrics from both sources (`retrieval_latency`, `cache_latency`, token totals).

- [ ] **Direct agent (`src/agents/workers/direct_agent.py`)**  
  - Thin wrapper around Bedrock Haiku that simply returns a conversational answer.  
  - Used for chit-chat, unknown intents, or as the final fallback when other agents fail.

- [ ] **Fallback chain**  
  - Extend orchestrator state with `attempted_agents` list.  
  - Implement helper `async def execute_with_fallback(preferred: list[Callable])` that iterates through agents, capturing exceptions and logging fallback events to retrieval logs (type `LogType.ROUTING`).  
  - Ensure metrics mark failures (`success=False`, `error_message`) for transparency.

- [ ] **Routing rules**  
  - Update `decide_route` to detect multi-step/technical queries via heuristics (keywords, message length) and route to Hybrid.  
  - Keep RAG for pure knowledge-base lookups, CAG for policy/billing, Direct for chit-chat.

- [ ] **Tests (`tests/hybrid/` & `tests/fallback/`)**  
  - Unit tests for Hybrid dedupe/merge logic.  
  - Integration test verifying fallback order when RAG is forced to raise an exception (matches example in this document).  
  - Test Direct agent latency (< 1 s) and cost (< $0.001) to confirm configuration.

#### Acceptance Criteria
- [ ] Hybrid agent combines cache + retrieval context and reports `sources_used > 1`.  
- [ ] Direct agent handles unsupported queries with low latency and cost.  
- [ ] Fallback chain escalates through Hybrid → RAG → CAG → Direct when earlier agents fail, and surfaces the fallback path in metrics/logs.  
- [ ] Automated tests in `tests/hybrid` and `tests/fallback` pass with ≥90 % coverage.  
- [ ] Manual smoke test confirms users still receive a graceful response even if RAG or CAG throws.

#### Testing Notes
```python
import pytest

@pytest.mark.asyncio
async def test_fallback_chain(orchestrator, monkeypatch):
    async def failing_run(self, message, session_id):  # pragma: no cover - test helper
        raise RuntimeError("boom")

    monkeypatch.setattr(RAGAgent, "run", failing_run)
    response = await orchestrator.ainvoke({"messages": [{"role": "user", "content": "Need help"}]})
    assert response["result"].agents[-1].id in {AgentId.CAG.value, AgentId.DIRECT.value}
    assert response["result"].fallback_from == ["rag"]
```

---

### Story 7.6: Frontend Integration - Wire Real Data

**Epic:** Epic 7 - Real Agent Integration
**Story Points:** 3
**Priority:** P1 (High)
**Assignee:** Frontend Engineer
**Dependencies:** Stories 7.3, 7.4, 7.5

#### Description
Connect existing frontend components to real agent data via SSE streaming. No UI design changes - just wire real data to existing panels. Verify all 14 panel components display real metrics, logs, and execution graphs.

#### Tasks
- [ ] Update SSE event handlers (`src/hooks/use-streaming.ts`)
  - No changes needed - already handles all event types
  - Verify event types match backend SSE messages

- [ ] Test existing panels with real data
  - AgentPanel: Shows real agent status (Orchestrator + workers)
  - AgentMetrics: Shows real tokens, cost, latency
  - RetrievalPanel: Shows real documents with similarity scores
  - ExecutionGraph: Shows real LangGraph node execution
  - DocumentModal: Shows real retrieved document content
  - CacheOperationCard: Shows real cache hits/misses
  - VectorSearchCard: Shows real vector similarity scores
  - QueryAnalysisCard: Shows real orchestrator routing decisions

- [ ] Verify chat provider integration
  - ChatProvider receives real ChatResponse objects
  - Message history updates correctly
  - Error handling works with real errors
  - Optimistic UI updates function correctly

- [ ] Test SSE streaming
  - Real-time agent status updates
  - Real-time retrieval log streaming
  - Real-time execution graph updates
  - Real-time metrics streaming

- [ ] Manual QA testing
  - Test all 4 agent types (RAG, CAG, Hybrid, Direct)
  - Test guide mode vs delegate mode
  - Test cache hits show correctly
  - Test fallback scenarios display correctly

- [ ] Update environment configuration
  - Point frontend to backend with real agents
  - No code changes needed - just API endpoints

#### Acceptance Criteria
- [ ] All 14 existing panel components work with real data
- [ ] No UI design changes or new components added
- [ ] SSE streaming shows real-time updates
- [ ] Agent metrics display real values (not mocks)
- [ ] Retrieval panel shows real documents from ChromaDB
- [ ] Execution graph shows real LangGraph workflow
- [ ] Cache hit/miss indicators show real cache status
- [ ] Error states handled gracefully
- [ ] Manual QA confirms all features working

#### Testing Notes
```typescript
// Example manual test
1. Type: "What is RAG?"
   ✓ Orchestrator shows "Delegate Mode"
   ✓ RAG agent shows "Processing"
   ✓ Retrieval panel shows 5 documents
   ✓ Metrics show real tokens/cost/latency
   ✓ Execution graph shows: analyze → route → vector_search → generate

2. Type same question again
   ✓ CAG agent shows "Cache Hit"
   ✓ Response instant (<500ms)
   ✓ Cost shows $0.00
   ✓ Cache operation card shows "HIT"
```

---

### Story 7.7: End-to-End Testing & Optimization

**Epic:** Epic 7 - Real Agent Integration
**Story Points:** 5
**Priority:** P1 (High)
**Assignee:** QA Engineer + Backend Engineer
**Dependencies:** Story 7.6

#### Description
Comprehensive end-to-end testing of the complete multi-agent system. Load testing, performance optimization, cost validation, and ensuring production readiness.

#### Tasks
- [ ] Write E2E integration tests
  - Test complete user journeys for each agent type
  - Test guide mode → delegate mode transitions
  - Test fallback chains
  - Test cache warming and hit rates
  - Test concurrent queries (10+ simultaneous)

- [ ] Performance testing
  - Measure latency per agent type
  - Identify bottlenecks (vector search, LLM calls, etc.)
  - Optimize slow operations
  - Ensure p95 latency < 5 seconds

- [ ] Cost validation
  - Run 100 diverse queries
  - Measure actual cost per query type
  - Validate cost distribution matches projections
  - Target: average ≤ $0.015/query

- [ ] Load testing
  - Simulate 100 concurrent users
  - Test ChromaDB performance under load
  - Test Redis cache performance
  - Ensure system stability

- [ ] Cache optimization
  - Tune similarity threshold for cache hits
  - Test cache hit rate over diverse queries
  - Target: 60%+ cache hit rate
  - Adjust TTL based on query patterns

- [ ] Error resilience testing
  - Test with OpenAI API failures
  - Test with Bedrock API failures
  - Test with ChromaDB failures
  - Verify fallback chain works
  - Verify graceful error messages to users

- [ ] Documentation
  - Update README with multi-agent setup
  - Document cost per agent type
  - Document expected performance metrics
  - Document troubleshooting guide

#### Acceptance Criteria
- [ ] E2E tests cover all user journeys (90%+ coverage)
- [ ] p95 latency < 5 seconds for all agent types
- [ ] Average cost per query ≤ $0.015
- [ ] Cache hit rate ≥ 60% over diverse queries
- [ ] System stable under 100 concurrent users
- [ ] Fallback chain works for all failure scenarios
- [ ] Documentation complete and accurate
- [ ] All tests pass (unit, integration, E2E)

#### Testing Notes
```python
# Example E2E test
async def test_full_user_journey():
    # 1. RAG query
    response1 = await client.post("/api/chat", json={
        "message": "What is RAG?"
    })
    assert response1.status_code == 200
    data1 = response1.json()
    assert data1["agents"][1]["id"] == "rag"
    assert len(data1["retrieval_logs"]) > 0

    # 2. Same query again (should cache)
    response2 = await client.post("/api/chat", json={
        "message": "What is RAG?"
    })
    data2 = response2.json()
    assert data2["agents"][1]["id"] == "cag"
    assert data2["agents"][1]["metrics"]["cache_hit"] == True

    # 3. Meta question (guide mode)
    response3 = await client.post("/api/chat", json={
        "message": "What can you help with?"
    })
    data3 = response3.json()
    assert len(data3["agents"]) == 1  # Only orchestrator
```

---

### Story 7.8: Production Deployment & Monitoring

**Epic:** Epic 7 - Real Agent Integration
**Story Points:** 3
**Priority:** P2 (Medium)
**Assignee:** DevOps Engineer
**Dependencies:** Story 7.7

#### Description
Deploy the multi-agent system to production with monitoring, alerting, and cost tracking. Set up observability to track agent performance, costs, and errors in production.

#### Tasks
- [ ] Production environment setup
  - Deploy ChromaDB with persistent storage
  - Configure production Redis for caching
  - Set up OpenAI and Bedrock production API keys
  - Configure environment variables for production

- [ ] Switch to production-ready vector DB (optional)
  - If staying with ChromaDB: configure backups
  - If migrating to Pinecone: execute migration
  - Test vector search in production environment

- [ ] Monitoring & observability
  - Set up CloudWatch/Datadog dashboards
  - Track metrics: query volume, latency, cost per agent
  - Track cache hit rate
  - Track error rates per agent/provider

- [ ] Alerting
  - Alert on high error rates (>5%)
  - Alert on high costs (daily budget exceeded)
  - Alert on high latency (p95 >10s)
  - Alert on low cache hit rate (<50%)

- [ ] Cost tracking
  - Daily cost reports by agent type
  - Weekly cost trends
  - Budget alerts at 80% and 100%

- [ ] Documentation for operations
  - Runbook for common issues
  - Scaling guide for high load
  - Incident response procedures
  - Cost optimization guide

- [ ] Gradual rollout (if applicable)
  - Start with 10% traffic to real agents
  - Monitor for 24 hours
  - Increase to 50% if stable
  - Increase to 100% after validation

#### Acceptance Criteria
- [ ] Multi-agent system deployed to production
- [ ] ChromaDB or Pinecone running in production
- [ ] Monitoring dashboards show real-time metrics
- [ ] Alerts configured and tested
- [ ] Cost tracking active with budget alerts
- [ ] Documentation complete for operations team
- [ ] System stable in production for 48+ hours
- [ ] No regression in user experience

#### Testing Notes
```bash
# Production validation checklist
1. ✓ Send test query → verify response
2. ✓ Check CloudWatch metrics → verify data flowing
3. ✓ Check cost dashboard → verify costs tracked
4. ✓ Trigger alert → verify alert fires
5. ✓ Test fallback → verify resilience
6. ✓ Load test → verify performance
```

---

## Acceptance Criteria

### Epic-Level Acceptance Criteria

**Epic 7 is considered complete when:**

✅ **All Agents Operational**
- Orchestrator routes queries intelligently (guide/delegate modes)
- RAG agent retrieves and generates from documents
- CAG agent caches and returns fast responses
- Hybrid agent combines strategies for complex queries
- Direct agent handles simple conversational queries

✅ **Infrastructure Running**
- ChromaDB container operational in Docker
- Redis caching functional
- All API keys configured and working
- Environment properly configured for dev/prod

✅ **Frontend Integration Complete**
- Existing UI components display real data
- No UI design changes made
- SSE streaming shows real-time updates
- All 14 panel components functional

✅ **Cost & Performance Targets Met**
- Average cost per query ≤ $0.015
- p95 latency ≤ 5 seconds
- Cache hit rate ≥ 60%
- 90%+ test coverage maintained

✅ **Production Ready**
- Deployed to production environment
- Monitoring and alerting configured
- Documentation complete
- System stable under load

---

## Testing Strategy

### Unit Tests (90%+ Coverage Required)

**Backend:**
```python
# Provider tests
tests/llm/test_openai_provider.py
tests/llm/test_bedrock_provider.py
tests/llm/test_provider_factory.py

# Agent tests
tests/agents/test_orchestrator.py
tests/agents/test_rag_agent.py
tests/agents/test_cag_agent.py
tests/agents/test_hybrid_agent.py
tests/agents/test_direct_agent.py

# Retrieval tests
tests/retrieval/test_vector_store.py
tests/retrieval/test_chroma_store.py
tests/cache/test_redis_cache.py

# Service tests
tests/services/test_agent_service.py
```

**Frontend:**
- No new tests needed - existing tests already validate components
- Existing tests use mock data which has same structure as real data

### Integration Tests

```python
# End-to-end agent workflows
tests/integration/test_rag_workflow.py
tests/integration/test_cag_workflow.py
tests/integration/test_hybrid_workflow.py
tests/integration/test_fallback_chain.py

# API integration
tests/integration/test_chat_api.py
tests/integration/test_sse_streaming.py
```

### E2E Tests

```python
# Complete user journeys
tests/e2e/test_user_journey_rag.py
tests/e2e/test_user_journey_cag.py
tests/e2e/test_user_journey_guide_mode.py
tests/e2e/test_concurrent_queries.py
```

### Performance Tests

```python
# Load and performance
tests/performance/test_load_100_concurrent.py
tests/performance/test_latency_targets.py
tests/performance/test_cache_hit_rate.py
```

### Manual QA Checklist

- [ ] Test each agent type with appropriate queries
- [ ] Verify guide mode for meta questions
- [ ] Verify delegate mode for domain questions
- [ ] Check cache hits show correctly
- [ ] Check retrieval logs display documents
- [ ] Check execution graph shows workflow
- [ ] Check all metrics display (tokens, cost, latency)
- [ ] Test error scenarios and fallback
- [ ] Verify no UI regressions

---

## Deployment Plan

### Phase 1: Development (Weeks 1-4)
- Stories 7.1-7.5 completed
- All agents working locally
- Docker Compose with ChromaDB
- Unit and integration tests passing

### Phase 2: Integration & Testing (Weeks 5-6)
- Story 7.6: Frontend integration
- Story 7.7: E2E testing and optimization
- Performance tuning
- Cost validation

### Phase 3: Production Deployment (Week 7-8)
- Story 7.8: Production deployment
- Monitoring and alerting setup
- Gradual rollout if needed
- 48-hour stability validation

### Rollback Plan
If production issues occur:
1. Revert API route change (3 lines) - switch back to mock_data
2. Keep new infrastructure running (ChromaDB, etc.)
3. Debug issues in staging
4. Redeploy when fixed

**Risk:** Low - simple revert path, same API contracts

---

## Success Metrics

### Technical Metrics
- **Latency:** p50 <2s, p95 <5s, p99 <10s
- **Cost:** Average $0.010-0.015 per query
- **Cache Hit Rate:** 60-70%
- **Error Rate:** <1%
- **Test Coverage:** 90%+

### Business Metrics
- **User Satisfaction:** Responses are relevant and accurate
- **Cost Efficiency:** 60-70% cost savings from caching
- **System Reliability:** 99.9% uptime
- **Response Quality:** High-quality answers from RAG agent

### Monitoring Dashboards
1. **Agent Performance:** Latency, tokens, cost per agent type
2. **Cache Performance:** Hit rate, cost savings, cache size
3. **Error Tracking:** Error rates by agent, provider failures
4. **Cost Tracking:** Daily/weekly costs, budget burn rate
5. **User Activity:** Query volume, agent usage distribution

---

**Document Status:** ✅ Final - Ready for Story Creation
**Next Action:** Scrum Master to create Jira/Linear stories from this breakdown
**Estimated Timeline:** 6-8 weeks (Epic 7 complete)

---

*End of Document*
