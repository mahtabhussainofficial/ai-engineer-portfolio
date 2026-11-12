"""Shared pytest fixtures for app, settings, and ephemeral test databases."""

from __future__ import annotations

from collections.abc import Generator
from pathlib import Path

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker

from app.core.config import Settings, get_settings
from app.db.session import close_db
from app.main import create_application
from app.models import Base


@pytest.fixture
def unconfigured_settings() -> Settings:
    """Settings instance with no database credentials configured."""
    return Settings(
        _env_file=None,
        environment="test",
        database_url=None,
        postgres_password=None,
        cors_origins=["http://localhost:3000"],
    )


@pytest.fixture
def sqlite_db_url(tmp_path: Path) -> str:
    """Ephemeral file-backed SQLite URL for isolated DB and migration tests."""
    db_file = tmp_path / "test_portfolio.db"
    return f"sqlite+pysqlite:///{db_file.as_posix()}"


@pytest.fixture
def configured_settings(sqlite_db_url: str) -> Settings:
    """Settings instance pointing at an ephemeral SQLite test database."""
    return Settings(
        _env_file=None,
        environment="test",
        database_url=sqlite_db_url,
        cors_origins=["http://localhost:3000"],
    )


@pytest.fixture
def db_session(sqlite_db_url: str) -> Generator[Session, None, None]:
    """Yield an initialized SQLAlchemy session with schema created and torn down."""
    engine = create_engine(sqlite_db_url, connect_args={"check_same_thread": False})
    if sqlite_db_url.startswith("sqlite"):
        from sqlalchemy import event

        @event.listens_for(engine, "connect")
        def _enable_sqlite_fk(dbapi_connection, _connection_record):
            cursor = dbapi_connection.cursor()
            cursor.execute("PRAGMA foreign_keys=ON")
            cursor.close()

    Base.metadata.create_all(bind=engine)
    TestingSessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False)
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(bind=engine)
        engine.dispose()


@pytest.fixture
def client_without_db(unconfigured_settings: Settings) -> Generator[TestClient, None, None]:
    """FastAPI TestClient running without a configured database."""
    close_db()
    app = create_application(unconfigured_settings)
    app.dependency_overrides[get_settings] = lambda: unconfigured_settings
    with TestClient(app) as client:
        yield client
    close_db()


@pytest.fixture
def client_with_db(configured_settings: Settings) -> Generator[TestClient, None, None]:
    """FastAPI TestClient backed by an active SQLite test database."""
    close_db()
    app = create_application(configured_settings)
    app.dependency_overrides[get_settings] = lambda: configured_settings
    with TestClient(app) as client:
        yield client
    close_db()
