#!/usr/bin/env python3
"""Document ingestion script for ChromaDB vector store and PostgreSQL document store.

Usage:
    uv run python scripts/ingest_data.py --source data/docs
    uv run python scripts/ingest_data.py --source data/docs --reset
    uv run python scripts/ingest_data.py --source data/docs --chunk-size 1024 --chunk-overlap 100
"""

import argparse
import asyncio
import sys
from datetime import UTC, datetime
from pathlib import Path

from langchain_community.document_loaders import DirectoryLoader, PyPDFLoader
from langchain_core.documents import Document
from langchain_text_splitters import RecursiveCharacterTextSplitter

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))

from src.retrieval.chroma_store import ChromaVectorStore
from src.storage.database import get_db_session, init_db
from src.storage.repository import DocumentRepository


def load_documents(source_dir: Path) -> list[Document]:
    """Load documents from source directory.

    Args:
        source_dir: Directory containing documents to load

    Returns:
        List of loaded documents
    """
    documents: list[Document] = []

    # Load Markdown files
    md_loader = DirectoryLoader(
        str(source_dir),
        glob="**/*.md",
        show_progress=True,
    )
    documents.extend(md_loader.load())

    # Load JSON files
    json_loader = DirectoryLoader(
        str(source_dir),
        glob="**/*.json",
        show_progress=True,
    )
    documents.extend(json_loader.load())

    # Load PDF files
    pdf_loader = DirectoryLoader(
        str(source_dir),
        glob="**/*.pdf",
        loader_cls=PyPDFLoader,
        show_progress=True,
    )
    documents.extend(pdf_loader.load())

    return documents


def split_documents(
    documents: list[Document], chunk_size: int, chunk_overlap: int
) -> list[Document]:
    """Split documents into chunks.

    Args:
        documents: List of documents to split
        chunk_size: Maximum chunk size in characters
        chunk_overlap: Overlap between chunks in characters

    Returns:
        List of document chunks
    """
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=chunk_size,
        chunk_overlap=chunk_overlap,
        length_function=len,
        is_separator_regex=False,
    )

    chunks = splitter.split_documents(documents)

    # Add ingestion timestamp to metadata
    ingested_at = datetime.now(UTC).isoformat()
    for chunk in chunks:
        chunk.metadata["ingested_at"] = ingested_at
        # Ensure source and page metadata are present
        if "source" not in chunk.metadata:
            chunk.metadata["source"] = "unknown"
        if "page" not in chunk.metadata:
            chunk.metadata["page"] = 0

    return chunks


async def ingest_documents(
    source_dir: Path,
    collection: str,
    chunk_size: int,
    chunk_overlap: int,
    reset: bool,
) -> None:
    """Ingest documents into ChromaDB and PostgreSQL.

    Args:
        source_dir: Source directory containing documents
        collection: Collection name to use
        chunk_size: Maximum chunk size in characters
        chunk_overlap: Overlap between chunks in characters
        reset: Whether to clear existing collection before ingestion
    """
    print(f"🚀 Starting document ingestion from {source_dir}")
    print(f"   Collection: {collection}")
    print(f"   Chunk size: {chunk_size}, overlap: {chunk_overlap}")
    print()

    # Initialize database
    print("🗄️  Initializing PostgreSQL database...")
    try:
        await init_db()
        print("   ✓ Database initialized")
    except Exception as e:
        print(f"   ✗ Error initializing database: {e}")
        sys.exit(1)
    print()

    # Initialize vector store with persistent directory
    chroma_dir = source_dir.parent / "chroma_db"  # Store at repo root level
    chroma_dir.mkdir(exist_ok=True)
    store = ChromaVectorStore(persist_directory=str(chroma_dir), collection_name=collection)

    # Clear collection if reset flag is set
    if reset:
        print("🧹 Clearing existing collections...")
        try:
            # Clear vector store
            await store.clear()
            print("   ✓ ChromaDB collection cleared")

            # Clear PostgreSQL documents
            async for session in get_db_session():
                repo = DocumentRepository(session)
                deleted = await repo.delete_by_collection(collection)
                print(f"   ✓ PostgreSQL: Deleted {deleted} documents")
                break
        except Exception as e:
            print(f"   ⚠️  Warning: Could not clear collections: {e}")
        print()

    # Load documents
    print("📚 Loading documents...")
    try:
        documents = load_documents(source_dir)
        print(f"   ✓ Loaded {len(documents)} documents")
    except Exception as e:
        print(f"   ✗ Error loading documents: {e}")
        sys.exit(1)
    print()

    if not documents:
        print("   ⚠️  No documents found in source directory")
        sys.exit(0)

    # Split documents
    print("✂️  Splitting documents into chunks...")
    try:
        chunks = split_documents(documents, chunk_size, chunk_overlap)
        print(f"   ✓ Created {len(chunks)} chunks")
    except Exception as e:
        print(f"   ✗ Error splitting documents: {e}")
        sys.exit(1)
    print()

    # Store in PostgreSQL
    print("🗄️  Storing raw documents in PostgreSQL...")
    try:
        async for session in get_db_session():
            repo = DocumentRepository(session)
            batch_size = 50
            for idx, chunk in enumerate(chunks):
                await repo.create(
                    source=chunk.metadata.get("source", "unknown"),
                    content=chunk.page_content,
                    doc_metadata=chunk.metadata,
                    page=chunk.metadata.get("page"),
                    chunk_index=idx,
                    collection_name=collection,
                )
                # Show progress every batch_size chunks
                if (idx + 1) % batch_size == 0 or (idx + 1) == len(chunks):
                    print(f"   Progress: {idx + 1}/{len(chunks)} chunks stored", flush=True)
            # Session will auto-commit when the async context manager exits
        print(f"   ✓ Stored {len(chunks)} document chunks in PostgreSQL")
    except Exception as e:
        print(f"   ✗ Error storing documents in PostgreSQL: {e}")
        sys.exit(1)
    print()

    # Embed and persist to ChromaDB
    # NOTE: All chunks are loaded into memory before batch processing.
    # For very large datasets (>10k documents), consider implementing a streaming
    # generator pattern to avoid OOM errors. Current implementation is suitable
    # for initial corpus setup and moderate-sized datasets.
    print("🔮 Embedding and persisting to ChromaDB...")
    print("   (This may take a while - generating embeddings for each chunk...)")
    try:
        batch_size = 100
        for i in range(0, len(chunks), batch_size):
            batch = chunks[i : i + batch_size]
            print(f"   Processing batch {(i // batch_size) + 1}...", end=" ", flush=True)
            await store.add_documents(documents=batch)
            progress = min(i + batch_size, len(chunks))
            print(f"✓ {progress}/{len(chunks)} chunks embedded", flush=True)
        print(f"   ✓ Successfully embedded and persisted {len(chunks)} chunks to ChromaDB")
    except Exception as e:
        print(f"   ✗ Error embedding documents: {e}")
        sys.exit(1)
    print()

    print("✅ Ingestion complete!")
    print(f"   Total documents: {len(documents)}")
    print(f"   Total chunks: {len(chunks)}")
    print(f"   Collection: {collection}")
    print("   Stored in: PostgreSQL (raw) + ChromaDB (embeddings)")


def main() -> None:
    """Main entry point."""
    parser = argparse.ArgumentParser(
        description="Ingest documents into ChromaDB vector store"
    )
    parser.add_argument(
        "--source",
        type=Path,
        required=True,
        help="Source directory containing documents",
    )
    parser.add_argument(
        "--collection",
        type=str,
        default="knowledge_base_v1",
        help="Collection name (default: knowledge_base_v1)",
    )
    parser.add_argument(
        "--chunk-size",
        type=int,
        default=512,
        help="Maximum chunk size in characters (default: 512)",
    )
    parser.add_argument(
        "--chunk-overlap",
        type=int,
        default=80,
        help="Overlap between chunks in characters (default: 80)",
    )
    parser.add_argument(
        "--reset",
        action="store_true",
        help="Clear collection before ingestion",
    )

    args = parser.parse_args()

    # Validate source directory
    if not args.source.exists():
        print(f"Error: Source directory does not exist: {args.source}")
        sys.exit(1)

    if not args.source.is_dir():
        print(f"Error: Source path is not a directory: {args.source}")
        sys.exit(1)

    # Run ingestion
    try:
        asyncio.run(
            ingest_documents(
                args.source,
                args.collection,
                args.chunk_size,
                args.chunk_overlap,
                args.reset,
            )
        )
    except KeyboardInterrupt:
        print("\n\n⚠️  Ingestion interrupted by user")
        sys.exit(130)
    except Exception as e:
        print(f"\n\n✗ Fatal error: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
