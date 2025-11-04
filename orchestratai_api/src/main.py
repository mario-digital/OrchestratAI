"""Main FastAPI application"""

from pathlib import Path

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Ensure dotenv values (including AWS credentials) are available before importing settings.
env_path = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(env_path, override=False)

from src.api.health import router as health_router  # noqa: E402
from src.api.routes.chat import router as chat_router  # noqa: E402
from src.config import settings  # noqa: E402

# Create FastAPI application
app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    debug=settings.debug,
)

# Include routers BEFORE middleware
app.include_router(health_router, prefix="/api", tags=["health"])
app.include_router(chat_router)

# Configure CORS middleware AFTER routers
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root() -> dict[str, str]:
    """Root endpoint"""
    return {
        "message": "Welcome to OrchestratAI API",
        "version": settings.app_version,
        "docs": "/docs",
    }
