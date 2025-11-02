"""Document repository for database operations."""

from uuid import UUID

from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession

from src.storage.models import Document


class DocumentRepository:
    """Repository for document CRUD operations."""

    def __init__(self, session: AsyncSession):
        """Initialize repository with database session."""
        self.session = session

    async def create(
        self,
        *,
        source: str,
        content: str,
        doc_metadata: dict,
        page: int | None = None,
        chunk_index: int | None = None,
        collection_name: str = "knowledge_base_v1",
    ) -> Document:
        """Create a new document."""
        document = Document(
            source=source,
            content=content,
            doc_metadata=doc_metadata,
            page=page,
            chunk_index=chunk_index,
            collection_name=collection_name,
        )
        self.session.add(document)
        await self.session.flush()
        return document

    async def get_by_id(self, document_id: UUID) -> Document | None:
        """Get document by ID."""
        result = await self.session.execute(select(Document).where(Document.id == document_id))
        return result.scalar_one_or_none()

    async def get_by_source(
        self, source: str, collection_name: str = "knowledge_base_v1"
    ) -> list[Document]:
        """Get all documents from a specific source."""
        result = await self.session.execute(
            select(Document)
            .where(Document.source == source, Document.collection_name == collection_name)
            .order_by(Document.chunk_index)
        )
        return list(result.scalars().all())

    async def list_by_collection(
        self, collection_name: str = "knowledge_base_v1", limit: int = 100, offset: int = 0
    ) -> list[Document]:
        """List documents in a collection."""
        result = await self.session.execute(
            select(Document)
            .where(Document.collection_name == collection_name)
            .order_by(Document.created_at.desc())
            .limit(limit)
            .offset(offset)
        )
        return list(result.scalars().all())

    async def count_by_collection(self, collection_name: str = "knowledge_base_v1") -> int:
        """Count documents in a collection."""
        from sqlalchemy import func

        result = await self.session.execute(
            select(func.count(Document.id)).where(Document.collection_name == collection_name)
        )
        return result.scalar() or 0

    async def delete_by_id(self, document_id: UUID) -> bool:
        """Delete a document by ID."""
        result = await self.session.execute(delete(Document).where(Document.id == document_id))
        return bool(result.rowcount and result.rowcount > 0)  # type: ignore[attr-defined]

    async def delete_by_collection(self, collection_name: str) -> int:
        """Delete all documents in a collection."""
        result = await self.session.execute(
            delete(Document).where(Document.collection_name == collection_name)
        )
        return result.rowcount or 0  # type: ignore[attr-defined]

    async def delete_by_source(
        self, source: str, collection_name: str = "knowledge_base_v1"
    ) -> int:
        """Delete all documents from a specific source."""
        result = await self.session.execute(
            delete(Document).where(
                Document.source == source, Document.collection_name == collection_name
            )
        )
        return result.rowcount or 0  # type: ignore[attr-defined]
