"""Database connection and session management."""

import os
from collections.abc import AsyncGenerator

from sqlalchemy.ext.asyncio import (
    AsyncEngine,
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)
from sqlalchemy.orm import DeclarativeBase

from src.llm.secrets import resolve_secret


def _get_database_url() -> str:
    """Get database URL from environment with 1Password support.

    Automatically resolves credentials via resolve_secret():
    - POSTGRES_PASSWORD can be op://Private/OrchestratAI/POSTGRES_PASSWORD
    - Falls back to plain password if not using 1Password

    Returns:
        Database URL with resolved credentials

    Raises:
        RuntimeError: If required environment variables are not set
    """
    # Check if DATABASE_URL is directly provided (legacy support)
    database_url = os.getenv("DATABASE_URL")
    if database_url:
        # If it contains op://, we need to parse and resolve it
        # For now, return as-is since it's already constructed
        return database_url

    # Build DATABASE_URL from components with 1Password support
    postgres_host = os.getenv("POSTGRES_HOST", "postgres")
    postgres_port = os.getenv("POSTGRES_PORT", "5432")
    postgres_db = os.getenv("POSTGRES_DB", "orchestratai")
    postgres_user = os.getenv("POSTGRES_USER", "orchestratai")

    # Resolve password via 1Password (supports op:// references)
    try:
        postgres_password = resolve_secret("POSTGRES_PASSWORD")
    except RuntimeError as e:
        raise RuntimeError(
            f"Failed to resolve POSTGRES_PASSWORD: {e}\n"
            "Please configure it in orchestratai_api/.env:\n"
            "  - With 1Password: POSTGRES_PASSWORD=op://Private/OrchestratAI/POSTGRES_PASSWORD\n"
            "  - Without 1Password: POSTGRES_PASSWORD=your-secure-password"
        ) from e

    # Construct DATABASE_URL with resolved password
    return f"postgresql://{postgres_user}:{postgres_password}@{postgres_host}:{postgres_port}/{postgres_db}"


# Lazy initialization - only fails when actually used, not on import
_database_url = None
_engine = None
_async_session_maker = None


def _get_engine() -> AsyncEngine:
    """Get or create database engine."""
    global _engine, _database_url
    if _engine is None:
        _database_url = _get_database_url()
        _engine = create_async_engine(
            _database_url.replace("postgresql://", "postgresql+asyncpg://"),
            echo=False,
            pool_pre_ping=True,
        )
    return _engine


def _get_session_maker() -> async_sessionmaker[AsyncSession]:
    """Get or create session maker."""
    global _async_session_maker
    if _async_session_maker is None:
        engine = _get_engine()
        _async_session_maker = async_sessionmaker(
            engine, class_=AsyncSession, expire_on_commit=False
        )
    return _async_session_maker


# Base class for models using SQLAlchemy 2.0 style
class Base(DeclarativeBase):
    """Base class for all database models."""

    pass


async def get_db_session() -> AsyncGenerator[AsyncSession, None]:
    """Get database session."""
    session_maker = _get_session_maker()
    async with session_maker() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


async def init_db() -> None:
    """Initialize database tables."""
    engine = _get_engine()
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
