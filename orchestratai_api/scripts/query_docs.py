#!/usr/bin/env python3
"""Interactive document query tool to test retrieval system."""

import asyncio
import sys
from pathlib import Path

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))

from src.retrieval.chroma_store import ChromaVectorStore
from src.storage.database import get_db_session
from src.storage.repository import DocumentRepository


async def query_chromadb(query: str, k: int = 5):
    """Query ChromaDB for semantic search."""
    print(f"\n{'='*80}")
    print("🔍 CHROMADB SEMANTIC SEARCH")
    print(f"{'='*80}")
    print(f"Query: '{query}'")
    print(f"Top {k} results:\n")

    store = ChromaVectorStore(
        persist_directory="../data/chroma_db",
        collection_name="knowledge_base_v1"
    )

    results = await store.similarity_search_with_scores(query=query, k=k)

    if not results:
        print("❌ No results found!")
        return []

    for i, (doc, score) in enumerate(results, 1):
        print(f"\n📄 Result {i} (Similarity Score: {score:.4f})")
        print(f"   Source: {doc.metadata.get('source', 'unknown')}")
        print(f"   Page: {doc.metadata.get('page', 'N/A')}")
        print("   Content Preview:")
        print(f"   {doc.page_content[:200]}...")
        print(f"   {'-'*76}")

    return results


async def query_postgresql(search_term: str, limit: int = 5):
    """Query PostgreSQL for full-text search."""
    print(f"\n{'='*80}")
    print("🗄️  POSTGRESQL FULL-TEXT SEARCH")
    print(f"{'='*80}")
    print(f"Search term: '{search_term}'")
    print(f"Limit: {limit}\n")

    async for session in get_db_session():
        # Get documents matching the search term
        from sqlalchemy import select

        from src.storage.models import Document

        stmt = select(Document).where(
            Document.content.ilike(f"%{search_term}%")
        ).limit(limit)

        result = await session.execute(stmt)
        docs = list(result.scalars().all())

        if not docs:
            print("❌ No results found!")
            return

        for i, doc in enumerate(docs, 1):
            print(f"\n📄 Result {i}")
            print(f"   ID: {doc.id}")
            print(f"   Source: {doc.source}")
            print(f"   Chunk: {doc.chunk_index}")
            print("   Content Preview:")
            print(f"   {doc.content[:200]}...")
            print(f"   {'-'*76}")

        break


async def compare_search(query: str):
    """Compare semantic vs keyword search."""
    print(f"\n{'#'*80}")
    print("📊 COMPARISON: Semantic Search (ChromaDB) vs Keyword Search (PostgreSQL)")
    print(f"{'#'*80}")

    # Semantic search
    await query_chromadb(query, k=3)

    # Keyword search
    await query_postgresql(query, limit=3)


async def interactive_mode():
    """Interactive query mode."""
    print("\n" + "="*80)
    print("🔍 Interactive Document Query Tool")
    print("="*80)
    print("\nCommands:")
    print("  semantic <query>  - Search using ChromaDB semantic similarity")
    print("  keyword <term>    - Search using PostgreSQL keyword matching")
    print("  compare <query>   - Compare both search methods")
    print("  stats            - Show database statistics")
    print("  examples         - Show example queries")
    print("  quit             - Exit")
    print("="*80 + "\n")

    while True:
        try:
            user_input = input("Query> ").strip()

            if not user_input:
                continue

            if user_input.lower() in ['quit', 'exit', 'q']:
                print("\n👋 Goodbye!")
                break

            parts = user_input.split(maxsplit=1)
            command = parts[0].lower()

            if command == 'examples':
                print("\n📚 Example Queries:")
                print("  semantic What is RAG?")
                print("  semantic How do I handle rate limits?")
                print("  semantic vector database embeddings")
                print("  keyword pricing")
                print("  keyword authentication")
                print("  compare What are the pricing tiers?")
                continue

            if command == 'stats':
                print("\n📊 Database Statistics:")
                async for session in get_db_session():
                    repo = DocumentRepository(session)
                    total = await repo.count_by_collection("knowledge_base_v1")
                    print(f"   PostgreSQL: {total} document chunks")
                    break
                print("   ChromaDB: 130 vector embeddings")
                continue

            if len(parts) < 2:
                print("❌ Please provide a query. Type 'examples' for help.")
                continue

            query_text = parts[1]

            if command == 'semantic':
                await query_chromadb(query_text, k=5)
            elif command == 'keyword':
                await query_postgresql(query_text, limit=5)
            elif command == 'compare':
                await compare_search(query_text)
            else:
                print(f"❌ Unknown command: {command}")
                print("   Type 'examples' for help")

        except KeyboardInterrupt:
            print("\n\n👋 Goodbye!")
            break
        except Exception as e:
            print(f"\n❌ Error: {e}")


async def main():
    """Main entry point."""
    if len(sys.argv) > 1:
        # Non-interactive: run query from command line
        query = " ".join(sys.argv[1:])
        await query_chromadb(query, k=5)
    else:
        # Interactive mode
        await interactive_mode()


if __name__ == "__main__":
    asyncio.run(main())
