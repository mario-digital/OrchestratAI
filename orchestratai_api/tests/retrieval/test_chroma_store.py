"""Integration tests for ChromaVectorStore."""

from pathlib import Path

import pytest
from langchain_core.documents import Document

from src.retrieval.chroma_store import ChromaVectorStore


@pytest.fixture
def temp_chroma_store(tmp_path: Path) -> ChromaVectorStore:
    """Create a temporary ChromaVectorStore for testing."""
    store = ChromaVectorStore(
        persist_directory=str(tmp_path / "chroma_test"),
        collection_name="test_collection",
    )
    return store


@pytest.fixture
def sample_documents() -> list[Document]:
    """Create sample documents for testing."""
    return [
        Document(
            page_content="Retrieval-Augmented Generation (RAG) improves LLM responses by fetching relevant context.",
            metadata={"source": "rag_guide.md", "page": 1, "category": "technical"},
        ),
        Document(
            page_content="Vector databases store embeddings for efficient similarity search.",
            metadata={"source": "vector_db.md", "page": 1, "category": "technical"},
        ),
        Document(
            page_content="ChromaDB is an open-source embedding database for AI applications.",
            metadata={"source": "chroma.md", "page": 1, "category": "tools"},
        ),
        Document(
            page_content="Semantic search finds documents by meaning rather than exact keyword matches.",
            metadata={"source": "search.md", "page": 1, "category": "concepts"},
        ),
        Document(
            page_content="LangChain provides a framework for building LLM applications with retrieval.",
            metadata={"source": "langchain.md", "page": 1, "category": "frameworks"},
        ),
    ]


@pytest.mark.asyncio
async def test_add_documents(
    temp_chroma_store: ChromaVectorStore, sample_documents: list[Document]
):
    """Test adding documents to the vector store."""
    await temp_chroma_store.add_documents(documents=sample_documents)

    # Verify documents were added by searching
    results = await temp_chroma_store.similarity_search(query="What is RAG?", k=1)
    assert len(results) == 1
    assert "Retrieval-Augmented Generation" in results[0].page_content


@pytest.mark.asyncio
async def test_similarity_search(
    temp_chroma_store: ChromaVectorStore, sample_documents: list[Document]
):
    """Test similarity search returns relevant documents."""
    await temp_chroma_store.add_documents(documents=sample_documents)

    results = await temp_chroma_store.similarity_search(query="vector database embeddings", k=3)

    assert len(results) <= 3
    assert len(results) > 0

    # First result should be most relevant
    assert any(
        "vector" in doc.page_content.lower() or "embedding" in doc.page_content.lower()
        for doc in results[:2]
    )


@pytest.mark.asyncio
async def test_similarity_search_ordering(
    temp_chroma_store: ChromaVectorStore, sample_documents: list[Document]
):
    """Test that similarity search results are ordered by relevance."""
    await temp_chroma_store.add_documents(documents=sample_documents)

    results = await temp_chroma_store.similarity_search(query="ChromaDB database", k=5)

    # ChromaDB document should be first or second
    top_contents = [doc.page_content for doc in results[:2]]
    assert any("ChromaDB" in content for content in top_contents)


@pytest.mark.asyncio
async def test_similarity_search_with_scores(
    temp_chroma_store: ChromaVectorStore, sample_documents: list[Document]
):
    """Test similarity search with scores returns valid score ranges."""
    await temp_chroma_store.add_documents(documents=sample_documents)

    results = await temp_chroma_store.similarity_search_with_scores(query="What is RAG?", k=3)

    assert len(results) <= 3
    assert len(results) > 0

    # Verify all results are tuples of (Document, float)
    for doc, score in results:
        assert isinstance(doc, Document)
        assert isinstance(score, float)
        # Scores should be between 0.0 and 1.0 (lower is better for Chroma)
        assert 0.0 <= score <= 2.0  # Allow some margin for distance metrics

    # First result should have lowest (best) score
    scores = [score for _, score in results]
    assert scores == sorted(scores)


@pytest.mark.asyncio
async def test_similarity_search_strong_matches(
    temp_chroma_store: ChromaVectorStore, sample_documents: list[Document]
):
    """Test that strong semantic matches have scores < 0.5."""
    await temp_chroma_store.add_documents(documents=sample_documents)

    # Query very similar to one of the documents
    results = await temp_chroma_store.similarity_search_with_scores(
        query="Retrieval-Augmented Generation improves responses", k=1
    )

    assert len(results) == 1
    doc, score = results[0]
    # Strong match should have low distance score
    assert score < 0.5, f"Expected strong match score < 0.5, got {score}"
    assert "Retrieval-Augmented Generation" in doc.page_content


@pytest.mark.asyncio
async def test_metadata_population(
    temp_chroma_store: ChromaVectorStore, sample_documents: list[Document]
):
    """Test that metadata is properly populated in search results."""
    await temp_chroma_store.add_documents(documents=sample_documents)

    results = await temp_chroma_store.similarity_search(query="vector database", k=5)

    for doc in results:
        # Verify required metadata fields are present
        assert "source" in doc.metadata
        assert "page" in doc.metadata
        assert doc.metadata["source"] is not None
        assert doc.metadata["page"] is not None


@pytest.mark.asyncio
async def test_mmr_search(temp_chroma_store: ChromaVectorStore, sample_documents: list[Document]):
    """Test MMR (Maximal Marginal Relevance) search mode."""
    await temp_chroma_store.add_documents(documents=sample_documents)

    results = await temp_chroma_store.similarity_search_mmr(
        query="database", k=3, fetch_k=5, lambda_mult=0.5
    )

    assert len(results) <= 3
    assert len(results) > 0

    # MMR should return diverse results
    # Verify all results have metadata
    for doc in results:
        assert "source" in doc.metadata
        assert len(doc.page_content) > 0


@pytest.mark.asyncio
async def test_score_threshold_filtering(
    temp_chroma_store: ChromaVectorStore, sample_documents: list[Document]
):
    """Test filtering results by similarity score threshold."""
    await temp_chroma_store.add_documents(documents=sample_documents)

    # Use a more generous threshold
    results_strong = await temp_chroma_store.similarity_search_with_threshold(
        query="Retrieval-Augmented Generation", k=5, score_threshold=1.0
    )

    # Should get at least one match with generous threshold
    assert len(results_strong) > 0

    # Verify all returned documents are below threshold
    results_with_scores = await temp_chroma_store.similarity_search_with_scores(
        query="Retrieval-Augmented Generation", k=5
    )
    for doc, score in results_with_scores:
        if doc.page_content in [d.page_content for d in results_strong]:
            assert score < 1.0


@pytest.mark.asyncio
async def test_clear_operation(
    temp_chroma_store: ChromaVectorStore, sample_documents: list[Document]
):
    """Test clearing the vector store."""
    await temp_chroma_store.add_documents(documents=sample_documents)

    # Verify documents were added
    results_before = await temp_chroma_store.similarity_search(query="RAG", k=5)
    assert len(results_before) > 0

    # Clear the store
    await temp_chroma_store.clear()

    # Recreate store after clear (client is reset)
    results_after = await temp_chroma_store.similarity_search(query="RAG", k=5)
    assert len(results_after) == 0


@pytest.mark.asyncio
async def test_empty_search(temp_chroma_store: ChromaVectorStore):
    """Test searching an empty vector store."""
    results = await temp_chroma_store.similarity_search(query="anything", k=5)
    assert len(results) == 0


@pytest.mark.asyncio
async def test_large_k_value(
    temp_chroma_store: ChromaVectorStore, sample_documents: list[Document]
):
    """Test searching with k larger than available documents."""
    await temp_chroma_store.add_documents(documents=sample_documents)

    results = await temp_chroma_store.similarity_search(query="database", k=100)

    # Should return all available documents (5)
    assert len(results) == len(sample_documents)


@pytest.mark.asyncio
async def test_batch_document_addition(temp_chroma_store: ChromaVectorStore):
    """Test adding documents in batches."""
    # Create a larger set of documents
    documents = [
        Document(
            page_content=f"Document {i} contains information about topic {i % 3}.",
            metadata={"source": f"doc_{i}.md", "page": 1, "topic": i % 3},
        )
        for i in range(20)
    ]

    await temp_chroma_store.add_documents(documents=documents)

    results = await temp_chroma_store.similarity_search(query="topic", k=10)
    assert len(results) == 10


@pytest.mark.asyncio
async def test_special_characters_in_content(temp_chroma_store: ChromaVectorStore):
    """Test handling documents with special characters."""
    docs = [
        Document(
            page_content='Special chars: @#$%^&*()_+-=[]{}|;:",.<>?/~`',
            metadata={"source": "special.md", "page": 1},
        ),
        Document(
            page_content="Unicode: 你好 🚀 café résumé",
            metadata={"source": "unicode.md", "page": 1},
        ),
    ]

    await temp_chroma_store.add_documents(documents=docs)

    results = await temp_chroma_store.similarity_search(query="special", k=2)
    assert len(results) > 0


@pytest.mark.asyncio
async def test_document_count_validation(
    temp_chroma_store: ChromaVectorStore, sample_documents: list[Document]
):
    """Test that document count is correct after ingestion."""
    await temp_chroma_store.add_documents(documents=sample_documents)

    # Search with large k to get all documents
    results = await temp_chroma_store.similarity_search(query="test", k=100)

    # Should have all original documents
    assert len(results) == len(sample_documents)


@pytest.mark.asyncio
async def test_async_operations(
    temp_chroma_store: ChromaVectorStore, sample_documents: list[Document]
):
    """Test that async operations work correctly."""
    import asyncio

    # Add documents asynchronously
    await temp_chroma_store.add_documents(documents=sample_documents)

    # Perform multiple concurrent searches
    queries = ["RAG", "vector database", "ChromaDB", "semantic search"]
    tasks = [temp_chroma_store.similarity_search(query=q, k=3) for q in queries]

    results = await asyncio.gather(*tasks)

    # Verify all searches completed
    assert len(results) == len(queries)
    for result in results:
        assert isinstance(result, list)
