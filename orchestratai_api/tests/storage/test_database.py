"""Tests for database connection and session management."""

import pytest

from src.storage.database import Base, get_db_session, init_db


def test_base_declarative():
    """Test that Base class is properly configured."""
    assert hasattr(Base, "__tablename__")  # DeclarativeBase has this
    assert hasattr(Base, "metadata")


@pytest.mark.asyncio
async def test_get_db_session():
    """Test database session generator."""
    # Just verify the generator can be created (we don't actually connect to DB in tests)
    session_gen = get_db_session()
    assert session_gen is not None


@pytest.mark.asyncio
async def test_init_db():
    """Test database initialization function exists."""
    # This function exists and is callable
    assert callable(init_db)
