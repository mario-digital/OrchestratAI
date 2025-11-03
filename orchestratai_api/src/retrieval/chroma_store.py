"""ChromaDB vector store implementation."""

import os
from collections.abc import Iterable

import anyio
from langchain_chroma import Chroma
from langchain_core.documents import Document
from langchain_core.embeddings import Embeddings
from langchain_openai import OpenAIEmbeddings
from pydantic import SecretStr

from src.llm.secrets import resolve_secret
from src.retrieval.vector_store import VectorStore


def _should_use_fake_embeddings() -> bool:
    """Return True when fake embeddings are requested via configuration."""

    value = os.getenv("USE_FAKE_EMBEDDINGS", "")
    return value.lower() in {"true", "1", "yes", "y"}


class BagOfWordsEmbeddings(Embeddings):
    """Lightweight deterministic embeddings for local testing/dev."""

    def __init__(self, dimension: int = 128) -> None:
        self.dimension = dimension

    def _embed(self, text: str) -> list[float]:
        vector = [0.0] * self.dimension
        for token in text.lower().split():
            index = hash(token) % self.dimension
            vector[index] += 1.0
        return vector

    def embed_documents(self, texts: Iterable[str]) -> list[list[float]]:
        return [self._embed(text) for text in texts]

    def embed_query(self, text: str) -> list[float]:
        return self._embed(text)


class ChromaVectorStore(VectorStore):
    """ChromaDB implementation of VectorStore."""

    def __init__(
        self,
        *,
        persist_directory: str = "/app/chroma_db",
        collection_name: str = "knowledge_base_v1",
        embeddings: Embeddings | None = None,
    ):
        """Initialize ChromaVectorStore.

        Args:
            persist_directory: Directory for persistent storage
            collection_name: Name of the collection to use
        """
        if embeddings is not None:
            self._embeddings = embeddings
        elif _should_use_fake_embeddings():
            self._embeddings = BagOfWordsEmbeddings()
        else:
            # Resolve OpenAI API key using 1Password integration (respects USE_ONEPASSWORD)
            api_key = resolve_secret("OPENAI_API_KEY")
            self._embeddings = OpenAIEmbeddings(
                model="text-embedding-3-large", api_key=SecretStr(api_key)
            )
        self._persist_directory = persist_directory
        self._collection_name = collection_name
        self._client: Chroma | None = None

    def _get_client(self) -> Chroma:
        """Lazy initialization of Chroma client."""
        if self._client is None:
            self._client = Chroma(
                persist_directory=self._persist_directory,
                embedding_function=self._embeddings,
                collection_name=self._collection_name,
            )
        return self._client

    async def add_documents(self, *, documents: list[Document]) -> None:
        """Add documents to the vector store.

        Args:
            documents: List of documents to add
        """
        client = self._get_client()
        await anyio.to_thread.run_sync(client.add_documents, documents)

    async def similarity_search(self, *, query: str, k: int = 5) -> list[Document]:
        """Search for similar documents.

        Args:
            query: Search query string
            k: Number of results to return

        Returns:
            List of documents ordered by similarity
        """
        client = self._get_client()
        return await anyio.to_thread.run_sync(client.similarity_search, query, k)

    async def similarity_search_with_scores(
        self, *, query: str, k: int = 5
    ) -> list[tuple[Document, float]]:
        """Search for similar documents with similarity scores.

        Args:
            query: Search query string
            k: Number of results to return

        Returns:
            List of (document, score) tuples where lower scores indicate stronger matches
        """
        client = self._get_client()
        return await anyio.to_thread.run_sync(client.similarity_search_with_score, query, k)

    async def similarity_search_mmr(
        self, *, query: str, k: int = 5, fetch_k: int = 20, lambda_mult: float = 0.5
    ) -> list[Document]:
        """Search using Maximal Marginal Relevance (MMR) for diversity.

        Args:
            query: Search query string
            k: Number of results to return
            fetch_k: Number of documents to fetch for MMR reranking
            lambda_mult: Diversity parameter (0=max diversity, 1=max relevance)

        Returns:
            List of documents ordered by MMR score
        """
        client = self._get_client()
        return await anyio.to_thread.run_sync(
            client.max_marginal_relevance_search, query, k, fetch_k, lambda_mult
        )

    async def similarity_search_with_threshold(
        self, *, query: str, k: int = 5, score_threshold: float = 0.5
    ) -> list[Document]:
        """Search for documents above a similarity threshold.

        Args:
            query: Search query string
            k: Maximum number of results to return
            score_threshold: Minimum similarity score (lower is more similar)

        Returns:
            List of documents with scores below threshold
        """
        results = await self.similarity_search_with_scores(query=query, k=k)
        return [doc for doc, score in results if score < score_threshold]

    async def clear(self) -> None:
        """Clear all documents from the vector store."""
        client = self._get_client()
        await anyio.to_thread.run_sync(client.delete_collection)
        # Reset client to force reinitialization
        self._client = None
