import json
import os
from typing import Any

from pydantic import field_validator, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    database_url: str
    secret_key: str
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 1440
    app_env: str = "development"
    allowed_origins: list[str] = ["http://localhost:3000"]
    cors_origins: str | list[str] | None = None
    geocoding_user_agent: str = "AgendaWeb-Platform/1.0 (contacto@agendaweb.app)"
    geocoding_timeout_seconds: int = 3
    supabase_url: str = ""
    supabase_service_role_key: str = ""
    supabase_storage_bucket: str = "agenda-images"

    @model_validator(mode="after")
    def validate_and_merge_config(self) -> "Settings":
        # Merge CORS_ORIGINS if provided
        if self.cors_origins:
            parsed_extra = self._parse_origins_raw(self.cors_origins)
            if parsed_extra:
                # Merge without duplicating while preserving order
                existing = set(self.allowed_origins)
                for origin in parsed_extra:
                    if origin not in existing:
                        self.allowed_origins.append(origin)
                        existing.add(origin)

        # Check production storage requirements
        if self.app_env.strip().lower() == "production":
            missing = []
            if not self.supabase_url or not self.supabase_url.strip():
                missing.append("SUPABASE_URL")
            if not self.supabase_service_role_key or not self.supabase_service_role_key.strip():
                missing.append("SUPABASE_SERVICE_ROLE_KEY")
            if not self.supabase_storage_bucket or not self.supabase_storage_bucket.strip():
                missing.append("SUPABASE_STORAGE_BUCKET")

            if missing:
                raise ValueError(
                    f"Production startup failed: Missing required storage credentials ({', '.join(missing)}). "
                    "Local filesystem fallback is disabled in production to prevent image loss."
                )
        return self

    @field_validator("database_url")
    @classmethod
    def validate_database_url(cls, value: str) -> str:
        if not value or not value.strip():
            raise ValueError("DATABASE_URL must be provided in environment variables.")
        url = value.strip()
        # Fix legacy postgres:// prefix if provided by cloud providers like Supabase/Heroku
        if url.startswith("postgres://"):
            url = url.replace("postgres://", "postgresql://", 1)
        return url

    @field_validator("secret_key")
    @classmethod
    def validate_secret_key(cls, value: str) -> str:
        weak_keys = {"change-me", "change-me-to-a-long-random-secret", "your-secret-key", "secret"}
        if not value or value.strip() in weak_keys or len(value.strip()) < 16:
            raise ValueError(
                "SECRET_KEY is insecure or missing. You must specify a secure random string of at least 16 characters in environment variables."
            )
        return value.strip()

    @staticmethod
    def _parse_origins_raw(value: Any) -> list[str]:
        if isinstance(value, list):
            return [str(origin).strip() for origin in value if str(origin).strip()]

        if isinstance(value, str):
            raw = value.strip()
            if not raw:
                return []

            if raw.startswith("["):
                try:
                    parsed = json.loads(raw)
                except json.JSONDecodeError as exc:
                    raise ValueError("Origins configuration has invalid JSON format") from exc

                if isinstance(parsed, list):
                    return [
                        str(origin).strip() for origin in parsed if str(origin).strip()
                    ]

            return [origin.strip() for origin in raw.split(",") if origin.strip()]

        raise ValueError("Origins configuration must be a list or comma-separated string")

    @field_validator("allowed_origins", mode="before")
    @classmethod
    def parse_allowed_origins(cls, value: object) -> list[str]:
        return cls._parse_origins_raw(value)


settings = Settings()

