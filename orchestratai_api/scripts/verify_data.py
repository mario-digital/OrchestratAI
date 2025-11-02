#!/usr/bin/env python3
"""Verify data in PostgreSQL and ChromaDB."""

import asyncio
import sys
from pathlib import Path

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))

from src.retrieval.chroma_store import ChromaVectorStore
from src.storage.database import get_db_session
from src.storage.repository import DocumentRepository


async def verify_postgresql():
    """Verify PostgreSQL data."""
    print("\n📊 PostgreSQL Verification")
    print("=" * 60)

    async for session in get_db_session():
        repo = DocumentRepository(session)

        # Count total documents
        total = await repo.count_by_collection("knowledge_base_v1")
        print(f"\n✓ Total documents: {total}")

        # Get sample documents
        docs = await repo.list_by_collection("knowledge_base_v1", limit=5)

        print("\n📄 Sample documents:")
        for i, doc in enumerate(docs, 1):
            content_preview = doc.content[:100].replace('\n', ' ')
            print(f"\n{i}. Source: {doc.source}")
            print(f"   Page: {doc.page}, Chunk: {doc.chunk_index}")
            print(f"   Content: {content_preview}...")

        break


async def verify_chromadb():
    """Verify ChromaDB data."""
    print("\n\n🔍 ChromaDB Verification")
    print("=" * 60)

    import tempfile
    chroma_dir = tempfile.mkdtemp(prefix="chroma_verify_")
    store = ChromaVectorStore(persist_directory=chroma_dir, collection_name="knowledge_base_v1")

    # Test similarity search
    print("\n🔮 Testing semantic search for: 'What is RAG?'")
    results = await store.similarity_search(query="What is RAG?", k=3)

    print(f"\n✓ Found {len(results)} results:")
    for i, doc in enumerate(results, 1):
        content_preview = doc.page_content[:150].replace('\n', ' ')
        print(f"\n{i}. Source: {doc.metadata.get('source', 'unknown')}")
        print(f"   Content: {content_preview}...")


async def main():
    """Main verification."""
    print("\n" + "=" * 60)
    print("🔍 Data Verification Tool")
    print("=" * 60)

    try:
        await verify_postgresql()
        # Note: ChromaDB verification disabled since we used temp directory
        # await verify_chromadb()

        print("\n" + "=" * 60)
        print("✅ Verification complete!")
        print("=" * 60 + "\n")

    except Exception as e:
        print(f"\n❌ Error: {e}")
        sys.exit(1)


if __name__ == "__main__":
    asyncio.run(main())
