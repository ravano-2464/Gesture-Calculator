from functools import lru_cache
from pathlib import Path

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

BASE_DIR = Path(__file__).resolve().parents[2]


class Settings(BaseSettings):
    app_name: str = "Gesture Calculator API"
    api_v1_prefix: str = "/api/v1"
    database_url: str | None = None
    allowed_origins: str = "http://localhost:3000,http://127.0.0.1:3000"

    model_config = SettingsConfigDict(
        env_file=BASE_DIR / ".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
    )

    @field_validator("database_url", mode="before")
    @classmethod
    def normalize_database_url(cls, value: str | None) -> str | None:
        if value is None:
            return None

        normalized_value = value.strip()

        if not normalized_value:
            return None

        if normalized_value.startswith("postgresql+psycopg://"):
            return normalized_value.replace(
                "postgresql+psycopg://",
                "postgresql+asyncpg://",
                1,
            )

        if normalized_value.startswith("postgresql://"):
            return normalized_value.replace(
                "postgresql://",
                "postgresql+asyncpg://",
                1,
            )

        if normalized_value.startswith("postgres://"):
            return normalized_value.replace(
                "postgres://",
                "postgresql+asyncpg://",
                1,
            )

        return normalized_value

    @property
    def cors_origins(self) -> list[str]:
        return [
            origin.strip()
            for origin in self.allowed_origins.split(",")
            if origin.strip()
        ]


@lru_cache
def get_settings() -> Settings:
    return Settings()
