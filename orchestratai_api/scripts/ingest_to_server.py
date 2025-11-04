#!/usr/bin/env python3
"""Ingest documents directly into ChromaDB server."""

import os
import sys
from pathlib import Path

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))

import chromadb
from langchain_chroma import Chroma
from langchain_community.document_loaders import DirectoryLoader
from langchain_core.documents import Document
from langchain_openai import OpenAIEmbeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter
from pydantic import SecretStr

from src.llm.secrets import resolve_secret


def load_documents(source_dir: Path) -> list[Document]:
    """Load documents from source directory."""
    documents: list[Document] = []

    # Load Markdown files
    print(f"Loading Markdown files from {source_dir}...")
    md_loader = DirectoryLoader(
        str(source_dir),
        glob="**/*.md",
        show_progress=True,
    )
    documents.extend(md_loader.load())

    print(f"Loaded {len(documents)} documents")
    return documents


def chunk_documents(documents: list[Document], chunk_size: int = 512, chunk_overlap: int = 80) -> list[Document]:
    """Split documents into chunks."""
    print(f"Chunking documents (size={chunk_size}, overlap={chunk_overlap})...")
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=chunk_size,
        chunk_overlap=chunk_overlap,
        length_function=len,
        is_separator_regex=False,
    )
    chunks = text_splitter.split_documents(documents)
    print(f"Created {len(chunks)} chunks")
    return chunks


def main():
    """Main ingestion function."""
    # Configuration
    source_dir = Path(__file__).parent.parent.parent / "data" / "docs"
    chroma_host = os.getenv("CHROMADB_HOST", "localhost")
    chroma_port = int(os.getenv("CHROMADB_PORT", "8001"))
    collection_name = "knowledge_base_v1"

    print(f"🚀 Ingesting documents from {source_dir}")
    print(f"   Target: {chroma_host}:{chroma_port}")
    print(f"   Collection: {collection_name}")
    print()

    # Load documents
    documents = load_documents(source_dir)
    if not documents:
        print("❌ No documents found!")
        return

    # Chunk documents
    chunks = chunk_documents(documents)

    # Setup embeddings
    print("Setting up OpenAI embeddings...")
    api_key = resolve_secret("OPENAI_API_KEY")
    embeddings = OpenAIEmbeddings(
        model="text-embedding-3-large",
        api_key=SecretStr(api_key)
    )

    # Connect to ChromaDB server
    print(f"Connecting to ChromaDB server at {chroma_host}:{chroma_port}...")
    chroma_client = chromadb.HttpClient(host=chroma_host, port=chroma_port)

    # Delete existing collection if it exists
    try:
        chroma_client.delete_collection(name=collection_name)
        print(f"✓ Deleted existing collection '{collection_name}'")
    except Exception:
        print(f"✓ Collection '{collection_name}' doesn't exist (will create new)")

    # Create vector store and add documents
    print(f"Adding {len(chunks)} chunks to ChromaDB...")
    vector_store = Chroma(
        client=chroma_client,
        collection_name=collection_name,
        embedding_function=embeddings,
    )

    # Add documents in batches to avoid timeouts
    batch_size = 50
    for i in range(0, len(chunks), batch_size):
        batch = chunks[i:i + batch_size]
        vector_store.add_documents(batch)
        print(f"  Added batch {i//batch_size + 1}/{(len(chunks)-1)//batch_size + 1}")

    # Verify
    collection = chroma_client.get_collection(name=collection_name)
    count = collection.count()
    print()
    print(f"✅ Success! {count} documents in ChromaDB server")

    # Test query
    print()
    print("Testing query: 'pricing tiers'")
    results = vector_store.similarity_search("pricing tiers", k=3)
    for i, doc in enumerate(results, 1):
        print(f"  Result {i}: {doc.page_content[:100]}...")


if __name__ == "__main__":
    main()
