"""SQLAlchemy engine lifecycle, session dependency, and connectivity checks."""

from __future__ import annotations

import logging
import time
from collections.abc import Generator
from dataclasses import dataclass

from sqlalchemy import Engine, create_engine, text
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session, sessionmaker

from app.core.config import Settings, get_settings
from app.core.exceptions import DatabaseUnavailableError

logger = logging.getLogger(__name__)

_engine: Engine | None = None
_session_factory: sessionmaker[Session] | None = None
_configured_url: str | None = None


@dataclass(frozen=True, slots=True)
class DatabaseCheckResult:
    """Outcome of a database connectivity check."""

    configured: bool
    connected: bool
    status: str
    latency_ms: float | None = None
    detail: str | None = None


def build_engine(database_url: str, settings: Settings) -> Engine:
    """Create a configured SQLAlchemy Engine for PostgreSQL or test dialects."""
    if database_url.startswith("sqlite"):
        return create_engine(
            database_url,
            echo=settings.db_echo,
            connect_args={"check_same_thread": False},
        )

    return create_engine(
        database_url,
        echo=settings.db_echo,
        pool_pre_ping=True,
        pool_size=settings.db_pool_size,
        max_overflow=settings.db_max_overflow,
        pool_timeout=settings.db_pool_timeout,
        pool_recycle=settings.db_pool_recycle,
    )


def init_db(settings: Settings | None = None) -> Engine | None:
    """Initialize global engine and session factory if database settings are present."""
    global _engine, _session_factory, _configured_url
    active_settings = settings or get_settings()
    database_url = active_settings.sqlalchemy_database_url

    if not database_url:
        _engine = None
        _session_factory = None
        _configured_url = None
        logger.info("Database URL is not configured; skipping engine initialization.")
        return None

    if _engine is not None and _configured_url == database_url:
        return _engine

    if _engine is not None:
        _engine.dispose()

    _engine = build_engine(database_url, active_settings)
    _session_factory = sessionmaker(
        bind=_engine,
        autocommit=False,
        autoflush=False,
        expire_on_commit=False,
    )
    _configured_url = database_url
    logger.info(
        "Initialized SQLAlchemy engine",
        extra={"database_url": active_settings.masked_database_url},
    )
    return _engine


def close_db() -> None:
    """Dispose the global SQLAlchemy engine on application shutdown."""
    global _engine, _session_factory, _configured_url
    if _engine is not None:
        _engine.dispose()
        logger.info("Disposed SQLAlchemy engine.")
    _engine = None
    _session_factory = None
    _configured_url = None


def get_engine(settings: Settings | None = None) -> Engine | None:
    """Return the active SQLAlchemy engine, initializing or rebinding if needed."""
    active_settings = settings or get_settings()
    target_url = active_settings.sqlalchemy_database_url
    if not target_url:
        return None
    if _engine is None or _configured_url != target_url:
        return init_db(active_settings)
    return _engine


def get_session_factory(settings: Settings | None = None) -> sessionmaker[Session] | None:
    """Return the active sessionmaker factory if database is configured."""
    get_engine(settings)
    return _session_factory


def get_db() -> Generator[Session, None, None]:
    """FastAPI dependency yielding a scoped SQLAlchemy session."""
    factory = get_session_factory()
    if factory is None:
        raise DatabaseUnavailableError(
            "Database connection is not configured. Set DATABASE_URL or POSTGRES_* variables."
        )

    session = factory()
    try:
        yield session
    finally:
        session.close()


def check_database_connection(settings: Settings | None = None) -> DatabaseCheckResult:
    """Verify database connectivity by executing `SELECT 1`."""
    active_settings = settings or get_settings()
    engine = get_engine(active_settings)

    if engine is None:
        return DatabaseCheckResult(
            configured=False,
            connected=False,
            status="not_configured",
            detail="Database environment variables are not configured.",
        )

    started_at = time.perf_counter()
    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))
        latency_ms = round((time.perf_counter() - started_at) * 1000, 2)
        return DatabaseCheckResult(
            configured=True,
            connected=True,
            status="connected",
            latency_ms=latency_ms,
        )
    except SQLAlchemyError as exc:
        latency_ms = round((time.perf_counter() - started_at) * 1000, 2)
        logger.warning(
            "Database connectivity check failed",
            extra={"error_type": type(exc).__name__},
        )
        return DatabaseCheckResult(
            configured=True,
            connected=False,
            status="disconnected",
            latency_ms=latency_ms,
            detail=f"Database connection failed ({type(exc).__name__}).",
        )
