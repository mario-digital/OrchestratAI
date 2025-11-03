#!/usr/bin/env python3
"""Test ChromaDB vector search."""

__test__ = False  # prevent pytest from collecting this module

import asyncio
import os
import sys
from pathlib import Path

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))

# Ensure local testing doesn't require real credentials
os.environ.setdefault("USE_ONEPASSWORD", "false")
os.environ.setdefault("OPENAI_API_KEY", "test-openai-key")
os.environ.setdefault("USE_FAKE_EMBEDDINGS", "true")

from src.retrieval.chroma_store import ChromaVectorStore


async def test_chromadb():
    """Test ChromaDB vector search."""
    print("\n" + "=" * 60)
    print("🔍 ChromaDB Vector Search Test")
    print("=" * 60 + "\n")

    # Connect to ChromaDB (using actual persisted data)
    # Note: The ingestion script uses a temp directory, so we need to check if
    # ChromaDB container has persisted data

    print("⚠️  NOTE: The ingestion script currently uses a temporary directory")
    print("   Let's test by connecting to the ChromaDB container directly\n")

    try:
        # Try connecting with the persisted directory from ingestion
        store = ChromaVectorStore(
            persist_directory="../data/chroma_db",
            collection_name="knowledge_base_v1",
        )

        print("📊 Testing similarity search for: 'What is RAG?'\n")

        results = await store.similarity_search(query="What is RAG?", k=3)

        if not results:
            print("❌ No results found!")
            print("   This means ChromaDB is either:")
            print("   1. Empty (data not persisted)")
            print("   2. Using a different persist directory")
            return False

        print(f"✅ Found {len(results)} results!\n")

        for i, doc in enumerate(results, 1):
            print(f"Result {i}:")
            print(f"  Source: {doc.metadata.get('source', 'unknown')}")
            print(f"  Content: {doc.page_content[:150]}...")
            print()

        # Test with scores
        print("📊 Testing similarity search WITH SCORES:\n")
        results_with_scores = await store.similarity_search_with_scores(
            query="What is RAG?", k=3
        )

        for i, (doc, score) in enumerate(results_with_scores, 1):
            print(f"Result {i} (score: {score:.4f}):")
            print(f"  Source: {doc.metadata.get('source', 'unknown')}")
            print(f"  Content: {doc.page_content[:100]}...")
            print()

        return True

    except Exception as e:
        print(f"❌ Error: {e}")
        return False


async def main():
    """Main test."""
    try:
        success = await test_chromadb()

        print("=" * 60)
        if success:
            print("✅ ChromaDB is working!")
        else:
            print("⚠️  ChromaDB may not have persisted data")
            print("\nThe issue: ingestion script uses a temp directory")
            print("Solution: We need to fix the ingestion script to use")
            print("the actual ChromaDB container's persist directory")
        print("=" * 60 + "\n")

    except Exception as e:
        print(f"\n❌ Test failed: {e}\n")
        sys.exit(1)


if __name__ == "__main__":
    asyncio.run(main())
