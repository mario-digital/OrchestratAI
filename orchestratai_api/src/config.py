"""Application configuration using pydantic-settings"""

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings loaded from environment variables"""

    # API Configuration
    app_name: str = "OrchestratAI API"
    app_version: str = "0.1.0"
    debug: bool = False

    # Server Configuration
    host: str = "0.0.0.0"
    port: int = 8000

    # CORS Configuration
    cors_origins: list[str] = ["http://localhost:3000", "http://localhost:5173"]

    # Database Configuration (for future use)
    mongodb_url: str = "mongodb://localhost:27017"
    mongodb_db_name: str = "orchestratai"

    # SSE Streaming Configuration
    STREAM_DELAY_MS: int = 50  # Milliseconds between message chunks

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
    )


# Global settings instance
settings = Settings()
