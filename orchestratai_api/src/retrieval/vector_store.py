"""Vector store abstract base class."""

from abc import ABC, abstractmethod

from langchain_core.documents import Document


class VectorStore(ABC):
    """Abstract base class for vector store implementations."""

    @abstractmethod
    async def add_documents(self, *, documents: list[Document]) -> None:
        """Add documents to the vector store.

        Args:
            documents: List of documents to add
        """
        ...

    @abstractmethod
    async def similarity_search(self, *, query: str, k: int = 5) -> list[Document]:
        """Search for similar documents.

        Args:
            query: Search query string
            k: Number of results to return

        Returns:
            List of documents ordered by similarity
        """
        ...

    @abstractmethod
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
        ...

    @abstractmethod
    async def clear(self) -> None:
        """Clear all documents from the vector store."""
        ...
