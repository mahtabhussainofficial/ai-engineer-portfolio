"""Structured application configuration loaded from environment variables."""

from __future__ import annotations

import json
from functools import lru_cache
from pathlib import Path
from typing import Annotated, Literal

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, NoDecode, SettingsConfigDict
from sqlalchemy.engine import URL, make_url

BACKEND_ROOT = Path(__file__).resolve().parents[2]
ENV_FILE_PATH = BACKEND_ROOT / ".env"

_PLACEHOLDER_SECRETS = frozenset(
    {
        "CHANGE_ME",
        "CHANGE_ME_BEFORE_PHASE_2",
        "secret",
        "changeme",
    }
)


class Settings(BaseSettings):
    """Application settings sourced from environment variables and optional `.env`."""

    model_config = SettingsConfigDict(
        env_file=ENV_FILE_PATH,
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    app_name: str = "Shabnum H. Portfolio API"
    app_version: str = "0.1.0"
    environment: Literal["development", "test", "staging", "production"] = "development"
    debug: bool = False
    api_v1_prefix: str = "/api/v1"

    log_level: Literal["DEBUG", "INFO", "WARNING", "ERROR", "CRITICAL"] = "INFO"
    log_format: Literal["console", "json"] = "console"

    cors_origins: Annotated[list[str], NoDecode] = Field(
        default_factory=lambda: ["http://localhost:3000", "http://127.0.0.1:3000"]
    )
    cors_allow_credentials: bool = True

    database_url: str | None = None
    postgres_host: str = "localhost"
    postgres_port: int = Field(default=5432, ge=1, le=65535)
    postgres_user: str = "postgres"
    postgres_password: str | None = None
    postgres_db: str = "portfolio_db"

    db_echo: bool = False
    db_pool_size: int = Field(default=5, ge=1, le=100)
    db_max_overflow: int = Field(default=10, ge=0, le=100)
    db_pool_timeout: int = Field(default=30, ge=1, le=300)
    db_pool_recycle: int = Field(default=1800, ge=60, le=86400)

    # Authentication & session settings
    secret_key: str | None = None
    jwt_algorithm: Literal["HS256"] = "HS256"
    access_token_expire_minutes: int = Field(default=15, ge=1, le=60)
    refresh_token_expire_days: int = Field(default=7, ge=1, le=90)

    refresh_cookie_name: str = "portfolio_refresh_token"
    csrf_cookie_name: str = "portfolio_csrf_token"
    csrf_header_name: str = "X-CSRF-Token"
    cookie_secure: bool | None = None
    cookie_samesite: Literal["lax", "strict", "none"] = "lax"

    auth_login_rate_limit_max_attempts: int = Field(default=5, ge=1, le=100)
    auth_login_rate_limit_window_seconds: int = Field(default=300, ge=10, le=86400)

    @field_validator("cors_origins", mode="before")
    @classmethod
    def parse_cors_origins(cls, value: object) -> list[str]:
        """Accept either a JSON array string or comma-separated origin list."""
        if value is None or value == "":
            return []
        if isinstance(value, list):
            return [str(origin).strip() for origin in value if str(origin).strip()]
        if isinstance(value, str):
            stripped = value.strip()
            if stripped.startswith("["):
                parsed = json.loads(stripped)
                if not isinstance(parsed, list):
                    raise ValueError("CORS_ORIGINS JSON value must be a list")
                return [str(origin).strip() for origin in parsed if str(origin).strip()]
            return [origin.strip() for origin in stripped.split(",") if origin.strip()]
        raise ValueError("CORS_ORIGINS must be a list or comma-separated string")

    @field_validator("database_url", "postgres_password", "secret_key", mode="before")
    @classmethod
    def empty_string_to_none(cls, value: object) -> object:
        """Normalize empty optional strings to None."""
        if isinstance(value, str) and value.strip() == "":
            return None
        return value

    @property
    def effective_cookie_secure(self) -> bool:
        """Resolve Secure cookie attribute based on explicit setting or environment."""
        if self.cookie_secure is not None:
            return self.cookie_secure
        return self.environment in ("staging", "production")

    def require_secret_key(self) -> str:
        """Return validated signing key or raise RuntimeError if missing/weak."""
        if (
            not self.secret_key
            or self.secret_key in _PLACEHOLDER_SECRETS
            or len(self.secret_key) < 32
        ):
            raise RuntimeError(
                "SECRET_KEY must be configured with at least 32 random characters."
            )
        return self.secret_key

    @property
    def sqlalchemy_database_url(self) -> str | None:
        """Resolve SQLAlchemy connection URL from `DATABASE_URL` or discrete Postgres vars."""
        if self.database_url:
            if self.database_url.startswith("postgres://"):
                return self.database_url.replace("postgres://", "postgresql+psycopg://", 1)
            if self.database_url.startswith("postgresql://"):
                return self.database_url.replace(
                    "postgresql://", "postgresql+psycopg://", 1
                )
            return self.database_url

        if self.postgres_password is not None:
            url = URL.create(
                drivername="postgresql+psycopg",
                username=self.postgres_user,
                password=self.postgres_password,
                host=self.postgres_host,
                port=self.postgres_port,
                database=self.postgres_db,
            )
            return url.render_as_string(hide_password=False)

        return None

    @property
    def masked_database_url(self) -> str | None:
        """Return the configured database URL with credentials redacted for logging."""
        raw_url = self.sqlalchemy_database_url
        if not raw_url:
            return None
        return make_url(raw_url).render_as_string(hide_password=True)


@lru_cache
def get_settings() -> Settings:
    """Return cached application settings instance."""
    return Settings()
