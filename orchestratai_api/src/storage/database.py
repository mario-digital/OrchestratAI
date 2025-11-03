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


def _get_database_url() -> str:
    """Get database URL from environment with validation."""
    url = os.getenv("DATABASE_URL")
    if not url:
        raise RuntimeError(
            "DATABASE_URL environment variable is not set. "
            "Please configure it in orchestratai_api/.env:\n"
            "  DATABASE_URL=postgresql://user:password@host:port/dbname\n"
            "For local development, see .env.template for the default configuration."
        )
    return url


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
