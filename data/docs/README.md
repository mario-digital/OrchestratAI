# Knowledge Base Documents

This directory contains the sample corpus for RAG-based retrieval operations.

## How to Add New Documents

1. Place your documents in this directory (or subdirectories)
2. Supported formats: Markdown (.md), JSON (.json), PDF (.pdf)
3. Run the ingestion script to update the vector store

## How to Refresh the Store

To refresh the vector store with new or updated documents:

```bash
# Add documents incrementally
uv run python scripts/ingest_data.py --source data/docs

# Clear and rebuild from scratch
uv run python scripts/ingest_data.py --source data/docs --reset

# Custom chunk size and overlap
uv run python scripts/ingest_data.py --source data/docs --chunk-size 1024 --chunk-overlap 100
```

## Document Structure

Organize your documents logically:
- `faqs/` - Frequently asked questions
- `policies/` - Company policies and procedures
- `api/` - API documentation
- `guides/` - Technical guides and tutorials
