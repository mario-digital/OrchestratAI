"""SQLAlchemy models for document storage."""

import uuid
from datetime import UTC, datetime

from sqlalchemy import JSON, Column, DateTime, Integer, String, Text
from sqlalchemy.dialects.postgresql import UUID

from src.storage.database import Base


class Document(Base):
    """Document storage model."""

    __tablename__ = "documents"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    source = Column(String(500), nullable=False, index=True)
    content = Column(Text, nullable=False)
    doc_metadata = Column(JSON, nullable=False, default=dict)
    page = Column(Integer, nullable=True)
    chunk_index = Column(Integer, nullable=True)
    collection_name = Column(String(100), nullable=False, index=True, default="knowledge_base_v1")
    version = Column(Integer, nullable=False, default=1)
    ingested_at = Column(DateTime(timezone=True), nullable=False, default=lambda: datetime.now(UTC))
    created_at = Column(DateTime(timezone=True), nullable=False, default=lambda: datetime.now(UTC))
    updated_at = Column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(UTC),
        onupdate=lambda: datetime.now(UTC),
    )

    def __repr__(self) -> str:
        """String representation."""
        return f"<Document(id={self.id}, source={self.source}, collection={self.collection_name})>"
