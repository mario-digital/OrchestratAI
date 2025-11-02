# Database & Vector Store Instructions

Complete guide for managing the OrchestratAI document storage and retrieval system.

## Table of Contents
- [Architecture Overview](#architecture-overview)
- [Credential Management (1Password)](#credential-management-1password)
- [Prerequisites](#prerequisites)
- [Database Management](#database-management)
- [Document Ingestion](#document-ingestion)
- [Testing & Verification](#testing--verification)
- [Common Tasks](#common-tasks)
- [Troubleshooting](#troubleshooting)

---

## Architecture Overview

The system uses a **dual-storage architecture**:

```
┌─────────────────┐         ┌──────────────────┐
│   data/docs/    │         │  PostgreSQL      │
│  (Source Files) │────────▶│  Port: 5432      │
│   51 .md files  │         │  Raw Chunks      │
└─────────────────┘         └──────────────────┘
        │
        │ Ingestion
        │ Pipeline
        │
        ▼
┌──────────────────┐
│   ChromaDB       │
│   Port: 8001     │
│   Embeddings     │
└──────────────────┘
```

### PostgreSQL (Port 5432)
- **Purpose:** Store raw document chunks with metadata
- **Database:** `orchestratai`
- **Table:** `documents`
- **Stores:** Full text content, source file, page numbers, timestamps

### ChromaDB (Port 8001)
- **Purpose:** Vector embeddings for semantic similarity search
- **Location:** `data/chroma_db/`
- **Model:** OpenAI text-embedding-3-large
- **Stores:** Vector embeddings of document chunks

---

## Credential Management (1Password)

**OrchestratAI uses 1Password as the default credential manager.** This provides secure secret management for OpenAI API keys, AWS credentials, and other sensitive data.

### Setup Instructions

#### 1. Install 1Password CLI

```bash
# macOS
brew install --cask 1password-cli

# Verify installation
op --version
```

#### 2. Sign in to 1Password

```bash
# Sign in to your 1Password account
op signin

# Or if already signed in, verify:
op whoami
```

#### 3. Configure Environment Variables

The `.env` file should contain **1Password secret references** (not actual secrets):

```bash
# Copy template and update with your 1Password vault references
cp orchestratai_api/.env.template orchestratai_api/.env

# Edit .env with your 1Password references:
USE_ONEPASSWORD=true

# OpenAI Configuration (using 1Password references)
OPENAI_API_KEY=op://Private/OrchestratAI/OPENAI_API_KEY

# AWS Bedrock Configuration (using 1Password references)
AWS_ACCESS_KEY_ID=op://Private/OrchestratAI/AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY=op://Private/OrchestratAI/AWS_SECRET_ACCESS_KEY
AWS_REGION=us-east-1
```

**1Password Reference Format:** `op://vault-name/item-name/field-name`

#### 4. Store Secrets in 1Password

Create an item in your 1Password vault named **"OrchestratAI"** with the following fields:
- `OPENAI_API_KEY` - Your OpenAI API key (starts with `sk-`)
- `AWS_ACCESS_KEY_ID` - AWS access key (starts with `AKIA`)
- `AWS_SECRET_ACCESS_KEY` - AWS secret key

### How It Works

**When running scripts locally:**
```bash
# The resolve_secret() function calls: op read op://vault/item/field
uv run python scripts/ingest_data.py --source data/docs
```

**When running with Docker Compose:**
```bash
# 1Password CLI automatically injects secrets BEFORE Docker starts
# Docker sees the resolved values, not the op:// references
docker compose up -d
```

### Resolution Behavior

**If `USE_ONEPASSWORD=true` (default):**
- ✅ ONLY checks 1Password for credentials
- ❌ NO fallback to environment variables
- 🚫 Fails with clear error if 1Password unavailable

**If `USE_ONEPASSWORD=false`:**
- ✅ ONLY checks environment variables
- ❌ Skips 1Password entirely
- 🚫 Fails if environment variable not set

### Disabling 1Password (Development Only)

If you need to temporarily disable 1Password integration:

```bash
# Set in .env
USE_ONEPASSWORD=false

# Then set actual API keys in environment variables
export OPENAI_API_KEY="sk-your-key-here"
export AWS_ACCESS_KEY_ID="AKIA..."
export AWS_SECRET_ACCESS_KEY="your-secret"
```

⚠️ **Warning:** Never commit actual API keys to git! Only commit 1Password references.

---

## Prerequisites

### 1. Start Docker Containers

```bash
# Start both databases
docker compose up postgres chromadb -d

# Verify containers are running
docker ps
```

Expected output:
```
CONTAINER ID   IMAGE                    PORTS                    NAMES
xxxxxxxxxxxx   postgres:16-alpine       0.0.0.0:5432->5432/tcp   orchestratai-postgres
xxxxxxxxxxxx   chromadb/chroma:latest   0.0.0.0:8001->8000/tcp   orchestratai-chromadb
```

### 2. Initialize PostgreSQL Tables

**First time only** - create the database schema:

```bash
uv run --directory orchestratai_api python scripts/init_database.py
```

Expected output:
```
🗄️  Initializing PostgreSQL database tables...
✓ Database initialized successfully
✓ Tables created: documents
✅ 'documents' table is ready!
```

---

## Database Management

### Connection Details

**PostgreSQL:**
```
Host:     localhost
Port:     5432
Database: orchestratai
Username: orchestratai
Password: orchestratai_dev_password
```

**Connect via psql:**
```bash
docker exec -it orchestratai-postgres psql -U orchestratai -d orchestratai
```

**Connect via GUI (Chat2DB, TablePlus, etc.):**
Use the credentials above.

### Useful PostgreSQL Queries

#### Basic Document Statistics

```sql
-- Count total documents
SELECT COUNT(*) FROM documents;

-- Count documents by collection
SELECT collection_name, COUNT(*) as total
FROM documents
GROUP BY collection_name;

-- See all unique source files
SELECT DISTINCT source
FROM documents
ORDER BY source;

-- Count chunks per source file
SELECT
    source,
    COUNT(*) as chunks,
    MIN(chunk_index) as first_chunk,
    MAX(chunk_index) as last_chunk
FROM documents
GROUP BY source
ORDER BY chunks DESC;
```

#### Viewing Document Content

```sql
-- View first 10 documents with previews
SELECT
    id,
    source,
    LEFT(content, 100) as preview,
    page,
    chunk_index,
    ingested_at
FROM documents
ORDER BY ingested_at DESC
LIMIT 10;

-- View full content of a specific document chunk
SELECT
    source,
    chunk_index,
    content,
    doc_metadata,
    ingested_at
FROM documents
WHERE source LIKE '%pricing%'
ORDER BY chunk_index;

-- Get all chunks from a specific file in order
SELECT
    chunk_index,
    LEFT(content, 200) as content_preview,
    page
FROM documents
WHERE source = '../data/docs/faqs/pricing.md'
ORDER BY chunk_index;
```

#### Searching Document Content

```sql
-- Search for specific term (case-insensitive)
SELECT
    source,
    chunk_index,
    LEFT(content, 150) as matching_content
FROM documents
WHERE content ILIKE '%RAG%'
ORDER BY source, chunk_index
LIMIT 10;

-- Search for multiple terms
SELECT
    source,
    chunk_index,
    content
FROM documents
WHERE content ILIKE '%authentication%'
   OR content ILIKE '%API key%'
LIMIT 10;

-- Find documents about specific topics
SELECT
    source,
    COUNT(*) as mentions
FROM documents
WHERE content ILIKE '%pricing%'
   OR content ILIKE '%billing%'
   OR content ILIKE '%cost%'
GROUP BY source
ORDER BY mentions DESC;
```

#### Document Categories

```sql
-- List all FAQ documents
SELECT DISTINCT source
FROM documents
WHERE source LIKE '%faqs%'
ORDER BY source;

-- List all policy documents
SELECT DISTINCT source
FROM documents
WHERE source LIKE '%policies%'
ORDER BY source;

-- List all API documentation
SELECT DISTINCT source
FROM documents
WHERE source LIKE '%api%'
ORDER BY source;

-- List all guides
SELECT DISTINCT source
FROM documents
WHERE source LIKE '%guides%'
ORDER BY source;
```

#### Recent Activity

```sql
-- Most recently ingested documents
SELECT
    source,
    COUNT(*) as chunks,
    MAX(ingested_at) as last_ingested
FROM documents
GROUP BY source
ORDER BY last_ingested DESC
LIMIT 10;

-- Documents ingested today
SELECT
    source,
    COUNT(*) as chunks
FROM documents
WHERE DATE(ingested_at) = CURRENT_DATE
GROUP BY source;

-- All documents with timestamps
SELECT
    source,
    chunk_index,
    created_at,
    updated_at,
    ingested_at
FROM documents
ORDER BY created_at DESC
LIMIT 20;
```

#### Metadata Analysis

```sql
-- View document metadata (JSON)
SELECT
    source,
    chunk_index,
    doc_metadata
FROM documents
LIMIT 5;

-- Extract specific metadata field
SELECT
    source,
    doc_metadata->>'source' as metadata_source,
    doc_metadata->>'page' as metadata_page,
    doc_metadata->>'ingested_at' as metadata_timestamp
FROM documents
LIMIT 10;

-- Find documents with specific metadata
SELECT
    source,
    chunk_index,
    doc_metadata
FROM documents
WHERE doc_metadata->>'page' = '0'
LIMIT 10;
```

#### Advanced Queries

```sql
-- Find longest document chunks
SELECT
    source,
    chunk_index,
    LENGTH(content) as content_length,
    LEFT(content, 100) as preview
FROM documents
ORDER BY content_length DESC
LIMIT 10;

-- Find shortest document chunks
SELECT
    source,
    chunk_index,
    LENGTH(content) as content_length,
    content
FROM documents
WHERE LENGTH(content) > 0
ORDER BY content_length ASC
LIMIT 10;

-- Document diversity (how many unique words per source)
SELECT
    source,
    COUNT(*) as chunks,
    SUM(LENGTH(content)) as total_chars,
    AVG(LENGTH(content))::INT as avg_chunk_size
FROM documents
GROUP BY source
ORDER BY total_chars DESC;

-- Full-text search with ranking
SELECT
    source,
    chunk_index,
    LEFT(content, 200) as preview,
    ts_rank(
        to_tsvector('english', content),
        to_tsquery('english', 'RAG | retrieval | agent')
    ) as relevance
FROM documents
WHERE to_tsvector('english', content) @@ to_tsquery('english', 'RAG | retrieval | agent')
ORDER BY relevance DESC
LIMIT 10;
```

#### Data Quality Checks

```sql
-- Check for empty content
SELECT COUNT(*)
FROM documents
WHERE content IS NULL OR content = '';

-- Check for missing metadata
SELECT
    source,
    chunk_index
FROM documents
WHERE doc_metadata IS NULL
   OR doc_metadata = '{}'::jsonb
LIMIT 10;

-- Check for duplicates (same source and chunk_index)
SELECT
    source,
    chunk_index,
    COUNT(*) as duplicate_count
FROM documents
GROUP BY source, chunk_index
HAVING COUNT(*) > 1;

-- View collection statistics
SELECT
    collection_name,
    COUNT(*) as total_chunks,
    COUNT(DISTINCT source) as unique_sources,
    MIN(ingested_at) as first_ingestion,
    MAX(ingested_at) as last_ingestion
FROM documents
GROUP BY collection_name;
```

#### Export Queries

```sql
-- Export document list to CSV format
COPY (
    SELECT
        source,
        COUNT(*) as chunk_count,
        MAX(ingested_at) as last_updated
    FROM documents
    GROUP BY source
    ORDER BY source
) TO '/tmp/document_list.csv' WITH CSV HEADER;

-- Create summary report
SELECT
    'Total Documents' as metric,
    COUNT(DISTINCT source)::TEXT as value
FROM documents
UNION ALL
SELECT
    'Total Chunks',
    COUNT(*)::TEXT
FROM documents
UNION ALL
SELECT
    'Average Chunks per Document',
    (COUNT(*) / COUNT(DISTINCT source))::TEXT
FROM documents;
```

---

## Document Ingestion

### Full Ingestion Command

```bash
uv run --directory orchestratai_api python scripts/ingest_data.py --source ../data/docs --reset
```

**What this does:**
1. ✅ Initializes PostgreSQL database schema
2. 🧹 Clears existing data in both databases (due to `--reset` flag)
3. 📚 Loads all documents from `data/docs/` directory
4. ✂️ Splits documents into chunks (512 chars, 80 char overlap)
5. 🗄️ Stores raw chunks in PostgreSQL with metadata
6. 🔮 Generates vector embeddings using OpenAI
7. 💾 Stores embeddings in ChromaDB

**Expected output:**
```
🚀 Starting document ingestion from ../data/docs
   Collection: knowledge_base_v1
   Chunk size: 512, overlap: 80

🗄️  Initializing PostgreSQL database...
   ✓ Database initialized

🧹 Clearing existing collections...
   ✓ ChromaDB collection cleared
   ✓ PostgreSQL: Deleted X documents

📚 Loading documents...
   ✓ Loaded 51 documents

✂️  Splitting documents into chunks...
   ✓ Created 130 chunks

🗄️  Storing raw documents in PostgreSQL...
   Progress: 50/130 chunks stored
   Progress: 100/130 chunks stored
   Progress: 130/130 chunks stored
   ✓ Stored 130 document chunks in PostgreSQL

🔮 Embedding and persisting to ChromaDB...
   Processing batch 1... ✓ 100/130 chunks embedded
   Processing batch 2... ✓ 130/130 chunks embedded
   ✓ Successfully embedded and persisted 130 chunks to ChromaDB

✅ Ingestion complete!
   Total documents: 51
   Total chunks: 130
   Collection: knowledge_base_v1
   Stored in: PostgreSQL (raw) + ChromaDB (embeddings)
```

### Command Line Options

```bash
# Full command with all options
uv run --directory orchestratai_api python scripts/ingest_data.py \
  --source ../data/docs \
  --collection knowledge_base_v1 \
  --chunk-size 512 \
  --chunk-overlap 80 \
  --reset
```

**Parameters:**
- `--source`: Directory containing documents to ingest (required)
- `--collection`: Collection name (default: `knowledge_base_v1`)
- `--chunk-size`: Maximum chunk size in characters (default: `512`)
- `--chunk-overlap`: Overlap between chunks (default: `80`)
- `--reset`: Clear existing data before ingestion (optional, recommended)

### Supported File Types

- **Markdown** (`.md`) - Documentation, guides, FAQs
- **JSON** (`.json`) - Structured data
- **PDF** (`.pdf`) - Policy documents, reports

---

## Testing & Verification

### 1. Test ChromaDB Vector Search

```bash
uv run --directory orchestratai_api python scripts/test_chromadb.py
```

**What it tests:**
- Connection to ChromaDB
- Semantic similarity search
- Retrieval with scores
- Metadata population

**Expected output:**
```
============================================================
🔍 ChromaDB Vector Search Test
============================================================

📊 Testing similarity search for: 'What is RAG?'

✅ Found 3 results!

Result 1:
  Source: ../data/docs/guides/agent-types.md
  Content: Agent Types Guide...

Result 2:
  Source: ../data/docs/faqs/changelog.md
  Content: 2025-10-01 Initial Release...

============================================================
✅ ChromaDB is working!
============================================================
```

### 2. Interactive Query Tool

```bash
uv run --directory orchestratai_api python scripts/query_docs.py
```

**Interactive commands:**
- `semantic <query>` - Semantic search via ChromaDB
- `keyword <term>` - Keyword search via PostgreSQL
- `compare <query>` - Compare both methods
- `stats` - Show database statistics
- `examples` - Show example queries
- `quit` - Exit

**Example session:**
```
Query> semantic What is RAG?

🔍 CHROMADB SEMANTIC SEARCH
================================================================================
Query: 'What is RAG?'
Top 5 results:

📄 Result 1 (Similarity Score: 1.0801)
   Source: ../data/docs/guides/agent-types.md
   Content: Agent Types Guide...
```

### 3. Quick Command-Line Query

```bash
# Single query without interactive mode
uv run --directory orchestratai_api python scripts/query_docs.py "What is RAG?"
```

### 4. PostgreSQL Verification Script

```bash
uv run --directory orchestratai_api python scripts/verify_data.py
```

Shows PostgreSQL document count and sample data.

---

## Common Tasks

### Adding New Documents

1. **Add files to `data/docs/` directory:**
   ```bash
   # Add new markdown file
   echo "# New Document" > data/docs/new-guide.md
   ```

2. **Re-ingest to update databases:**
   ```bash
   uv run --directory orchestratai_api python scripts/ingest_data.py \
     --source ../data/docs \
     --reset
   ```

   **Note:** The `--reset` flag clears existing data and re-ingests everything.

### Updating Existing Documents

1. **Edit files in `data/docs/`**
2. **Re-run ingestion with `--reset`:**
   ```bash
   uv run --directory orchestratai_api python scripts/ingest_data.py \
     --source ../data/docs \
     --reset
   ```

### Incremental Updates (Without --reset)

```bash
# Add new documents without clearing existing ones
uv run --directory orchestratai_api python scripts/ingest_data.py \
  --source ../data/docs
```

**⚠️ Warning:** This may create duplicates if documents were already ingested.

### Changing Chunk Size

If you want different chunk sizes (e.g., for longer context):

```bash
uv run --directory orchestratai_api python scripts/ingest_data.py \
  --source ../data/docs \
  --chunk-size 1024 \
  --chunk-overlap 100 \
  --reset
```

### Rebuilding Indexes from Scratch

```bash
# 1. Stop containers (optional but recommended)
docker compose down

# 2. Remove persisted data
rm -rf data/chroma_db/
docker volume rm orchestratai_postgres_data

# 3. Start containers
docker compose up postgres chromadb -d

# 4. Initialize database
uv run --directory orchestratai_api python scripts/init_database.py

# 5. Re-ingest documents
uv run --directory orchestratai_api python scripts/ingest_data.py \
  --source ../data/docs \
  --reset
```

### Backing Up Data

**Backup source documents:**
```bash
tar -czf documents-backup-$(date +%Y%m%d).tar.gz data/docs/
```

**Backup PostgreSQL:**
```bash
docker exec orchestratai-postgres pg_dump -U orchestratai orchestratai > backup.sql
```

**Backup ChromaDB:**
```bash
tar -czf chromadb-backup-$(date +%Y%m%d).tar.gz data/chroma_db/
```

### Restoring from Backup

**Restore PostgreSQL:**
```bash
docker exec -i orchestratai-postgres psql -U orchestratai orchestratai < backup.sql
```

**Restore ChromaDB:**
```bash
tar -xzf chromadb-backup-YYYYMMDD.tar.gz
```

**Restore source files:**
```bash
tar -xzf documents-backup-YYYYMMDD.tar.gz
```

---

## Troubleshooting

### Issue: "relation 'documents' does not exist"

**Solution:** Initialize the database schema:
```bash
uv run --directory orchestratai_api python scripts/init_database.py
```

### Issue: PostgreSQL COUNT returns 0 after ingestion

**Cause:** Transaction not committed (fixed in current version)

**Solution:** Re-run ingestion with latest code:
```bash
uv run --directory orchestratai_api python scripts/ingest_data.py \
  --source ../data/docs \
  --reset
```

### Issue: ChromaDB returns no results

**Possible causes:**
1. Data stored in temporary directory (fixed in current version)
2. Wrong persist directory path

**Solution:**
```bash
# Check if chroma_db exists
ls -la data/chroma_db/

# Re-ingest if missing
uv run --directory orchestratai_api python scripts/ingest_data.py \
  --source ../data/docs \
  --reset
```

### Issue: "Cannot connect to Docker daemon"

**Solution:** Start Docker Desktop:
```bash
# On macOS, start Docker Desktop app
open -a Docker

# Wait for Docker to start, then verify
docker ps
```

### Issue: Port conflicts (5432 or 8001 already in use)

**Solution:** Stop conflicting services:
```bash
# Check what's using the ports
lsof -i :5432
lsof -i :8001

# Stop our containers and restart
docker compose down
docker compose up postgres chromadb -d
```

### Issue: "ModuleNotFoundError: No module named 'langchain_community'"

**Solution:** Install dependencies:
```bash
uv sync --directory orchestratai_api
```

### Issue: OpenAI API errors during embedding

**Check API key configuration:**

The system uses **1Password integration by default** (from Story 7.1):

```bash
# Check if USE_ONEPASSWORD is enabled (default: true)
grep USE_ONEPASSWORD orchestratai_api/.env.template

# Option 1: Use 1Password (default, recommended)
# Set USE_ONEPASSWORD=true in .env
# Configure OPENAI_API_KEY in your 1Password vault

# Option 2: Use environment variables only
# Set USE_ONEPASSWORD=false in .env
# Set OPENAI_API_KEY in environment or .env file
```

**Credential Resolution (NO FALLBACK):**

**If `USE_ONEPASSWORD=true` (DEFAULT):**
- ✅ **ONLY checks 1Password** - No fallback to environment variables
- ❌ **Fails immediately** if 1Password unavailable or key not found
- 💡 Clear error message tells you to either configure 1Password or set `USE_ONEPASSWORD=false`

**If `USE_ONEPASSWORD=false`:**
- ✅ **ONLY checks environment variables** - Skips 1Password entirely
- ❌ **Fails immediately** if key not in environment variables

**Current State:**
The 1Password CLI integration (`_resolve_from_onepassword`) is a placeholder. To use the system now:

```bash
# Option 1: Disable 1Password temporarily (use env vars)
# Create orchestratai_api/.env file:
USE_ONEPASSWORD=false
OPENAI_API_KEY=sk-your-key-here

# Option 2: Set as environment variable
export USE_ONEPASSWORD=false
export OPENAI_API_KEY=sk-your-key-here
```

**When 1Password is fully implemented:**
- Set `USE_ONEPASSWORD=true` (default)
- Configure `OPENAI_API_KEY` in your 1Password vault
- System will fetch from 1Password only (no env var fallback)

**Verify key is accessible:**
```bash
# Check if key is in environment
echo $OPENAI_API_KEY

# Test credential resolution
uv run --directory orchestratai_api python -c "from src.llm.secrets import resolve_secret; print('✅ Key found' if resolve_secret('OPENAI_API_KEY') else '❌ No key')"
```

---

## Performance Considerations

### Chunk Size Guidelines

| Chunk Size | Use Case | Pros | Cons |
|------------|----------|------|------|
| 256-512 | Precise retrieval | More granular, faster search | More chunks, less context |
| 512-1024 | Balanced (default) | Good trade-off | Balanced |
| 1024-2048 | Long context | More context per chunk | Slower, less precise |

**Default:** 512 characters with 80 character overlap

### Embedding Costs

- **Model:** OpenAI text-embedding-3-large
- **Cost:** ~$0.13 per 1M tokens
- **130 chunks:** ~$0.01-0.02 per full ingestion

### Database Sizes

After ingesting 51 documents (130 chunks):
- **PostgreSQL:** ~50 KB
- **ChromaDB:** ~2-3 MB (includes embeddings)

---

## Quick Reference

### Essential Commands

```bash
# Start databases
docker compose up postgres chromadb -d

# Initialize database (first time only)
uv run --directory orchestratai_api python scripts/init_database.py

# Ingest documents
uv run --directory orchestratai_api python scripts/ingest_data.py --source ../data/docs --reset

# Test ChromaDB
uv run --directory orchestratai_api python scripts/test_chromadb.py

# Interactive queries
uv run --directory orchestratai_api python scripts/query_docs.py

# Quick query
uv run --directory orchestratai_api python scripts/query_docs.py "your query here"
```

### File Locations

- **Source documents:** `data/docs/`
- **ChromaDB storage:** `data/chroma_db/`
- **PostgreSQL data:** Docker volume `orchestratai_postgres_data`
- **Scripts:** `orchestratai_api/scripts/`
- **Environment config:** `orchestratai_api/.env.template`

### Connection URLs

- **PostgreSQL:** `postgresql://orchestratai:orchestratai_dev_password@localhost:5432/orchestratai`
- **ChromaDB API:** `http://localhost:8001/api/v1/`

---

## Next Steps

After completing document ingestion:
- ✅ Documents stored in PostgreSQL
- ✅ Embeddings in ChromaDB
- ➡️ **Story 7.3:** Implement RAG Agent to use this retrieval infrastructure

---

**Last Updated:** 2025-11-02
**Story:** 7.2 - Vector Database Document Ingestion
