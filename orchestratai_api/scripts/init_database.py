#!/usr/bin/env python3
"""Initialize database tables."""

import asyncio
import sys
from pathlib import Path

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))

from src.storage.database import engine, init_db


async def main():
    """Initialize database tables."""
    print("🗄️  Initializing PostgreSQL database tables...")

    try:
        await init_db()

        # Verify tables were created
        from sqlalchemy import text
        async with engine.connect() as conn:
            result = await conn.execute(
                text(
                    "SELECT table_name FROM information_schema.tables "
                    "WHERE table_schema = 'public'"
                )
            )
            tables = [row[0] for row in result]

        print("✓ Database initialized successfully")
        print(f"✓ Tables created: {', '.join(tables) if tables else 'None'}")

        if 'documents' in tables:
            print("\n✅ 'documents' table is ready!")
        else:
            print("\n⚠️  'documents' table was not created")

    except Exception as e:
        print(f"✗ Error initializing database: {e}")
        sys.exit(1)


if __name__ == "__main__":
    asyncio.run(main())
