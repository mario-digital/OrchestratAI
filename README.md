# OrchestratAI

> ⚠️ **Status:** Under active development

OrchestratAI is an advanced customer service AI application featuring a multi-agent architecture with intelligent routing and specialized support capabilities. The application showcases a modular monolith architecture - a single deployable unit with clearly separated, loosely-coupled modules that can be easily extracted into microservices in the future.

## Tech Stack

- **Frontend:** Next.js 15, React 19, TypeScript, Tailwind CSS v4
- **Backend:** FastAPI, Python 3.12, uv
- **Infrastructure:** Docker, Redis
- **Package Manager:** Bun

## Getting Started

### Prerequisites

- Docker and Docker Compose
- Bun (for local development)

### Running with Docker

**Development mode (with hot reload):**
```bash
docker compose up
```

**Run in background:**
```bash
docker compose up -d
```

**View logs:**
```bash
docker compose logs -f
```

**Stop containers:**
```bash
docker compose down
```

**Production mode:**
```bash
docker compose -f docker-compose.prod.yml up
```

### Access the Application

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:8000
- **API Documentation:** http://localhost:8000/docs
- **ChromaDB:** http://localhost:8001

## Data Ingestion

### Populating ChromaDB with Documents

After starting the Docker containers, you need to ingest documents into ChromaDB for the RAG (Retrieval Augmented Generation) agents to work properly.

**Ingest documents:**
```bash
cd orchestratai_api && \
  CHROMADB_HOST=localhost \
  CHROMADB_PORT=8001 \
  uv run python scripts/ingest_to_server.py
```

**What this does:**
- Loads all Markdown files from `data/docs/`
- Chunks documents into 512-character pieces with 80-character overlap
- Generates OpenAI embeddings (text-embedding-3-large, 3072 dimensions)
- Stores ~130 document chunks in ChromaDB's `knowledge_base_v1` collection

**When to run:**
- After `docker-compose down` (ChromaDB container data is lost)
- After adding new documents to `data/docs/`
- After updating existing documents you want to re-index

**Verify ingestion:**
```bash
# Check document count in ChromaDB
docker exec orchestratai-backend-1 python -c "import chromadb; client = chromadb.HttpClient(host='chromadb', port=8000); coll = client.get_or_create_collection('knowledge_base_v1'); print(f'Documents: {coll.count()}')"
```

### Available Document Categories

The knowledge base includes:
- **API Documentation** (`data/docs/api/`): Authentication, endpoints, error codes, webhooks, etc.
- **FAQs** (`data/docs/faqs/`): Pricing, billing, features, integrations, limits, etc.
- **Guides** (`data/docs/guides/`): Python SDK, deployment, RAG best practices, scaling, security, etc.
- **Policies** (`data/docs/policies/`): Privacy policy, terms of service, SLA, acceptable use, copyright

## RAG-Enabled Agents

### 1. CAG Agent (Billing & Policy)
Handles pricing and policy questions with semantic caching and RAG retrieval.

**Example questions:**
- "What are the pricing tiers?"
- "Do you offer annual discounts?"
- "What is your privacy policy?"
- "What is your SLA uptime guarantee?"

### 2. RAG Agent (Technical/Domain)
Handles technical and domain knowledge questions with document retrieval.

**Example questions:**
- "How do I authenticate with the API?"
- "How do I use the Python SDK?"
- "What are the best practices for RAG?"
- "How do I deploy to production?"

### 3. Hybrid Agent (Complex Questions)
Handles complex, multi-part questions that require both retrieval and reasoning.

**Example questions:**
- "How do I set up authentication and implement webhooks for production?"
- "What's the difference between agent types and which should I use?"

## Cache Management

### Clear Redis Cache

The system uses Redis for semantic caching to reduce costs and latency. Sometimes you may need to clear the cache (e.g., after updating documents or testing).

**Clear all cache:**
```bash
docker exec orchestratai-redis-1 redis-cli FLUSHALL
```

**Clear specific pattern:**
```bash
docker exec orchestratai-redis-1 redis-cli --scan --pattern "cache:*" | xargs docker exec -i orchestratai-redis-1 redis-cli DEL
```

**Check cache size:**
```bash
docker exec orchestratai-redis-1 redis-cli DBSIZE
```

## Configuration

### Important Environment Variables

**`.env` file settings:**

- `USE_FAKE_EMBEDDINGS=false` - **Must be false** for production (uses real OpenAI embeddings)
- `CHROMADB_HOST=chromadb` - ChromaDB hostname (inside Docker network)
- `CHROMADB_PORT=8000` - ChromaDB port (inside Docker network)
- `OPENAI_API_KEY=<your-key>` - Required for embeddings and LLM calls

**Note:** When ChromaDB is accessed from outside Docker (e.g., ingestion script), use `localhost:8001`