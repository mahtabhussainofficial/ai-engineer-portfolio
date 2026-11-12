"""Shared pytest fixtures for app, settings, and ephemeral test databases."""

from __future__ import annotations

from collections.abc import Generator
from pathlib import Path
import secrets

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker

from app.core.config import Settings, get_settings
from app.core.rate_limit import contact_rate_limiter, login_rate_limiter
from app.db.session import close_db, get_engine, get_session_factory
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
        secret_key=secrets.token_urlsafe(48),
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
    contact_rate_limiter.clear()
    app = create_application(unconfigured_settings)
    app.dependency_overrides[get_settings] = lambda: unconfigured_settings
    with TestClient(app) as client:
        yield client
    contact_rate_limiter.clear()
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


@pytest.fixture
def auth_client(
    configured_settings: Settings,
) -> Generator[tuple[TestClient, sessionmaker[Session], Settings], None, None]:
    """TestClient with initialized SQLite schema and reset rate limiter for auth tests."""
    close_db()
    login_rate_limiter.clear()
    contact_rate_limiter.clear()
    app = create_application(configured_settings)
    app.dependency_overrides[get_settings] = lambda: configured_settings

    with TestClient(app) as client:
        engine = get_engine(configured_settings)
        assert engine is not None
        Base.metadata.create_all(bind=engine)
        session_factory = get_session_factory(configured_settings)
        assert session_factory is not None
        yield client, session_factory, configured_settings
        Base.metadata.drop_all(bind=engine)

    login_rate_limiter.clear()
    contact_rate_limiter.clear()
    close_db()


@pytest.fixture
def authenticated_admin_client(
    auth_client: tuple[TestClient, sessionmaker[Session], Settings],
) -> tuple[TestClient, sessionmaker[Session], dict[str, str]]:
    """Provision the single administrator and return client, session factory, and auth headers."""
    from app.services.auth import create_initial_admin

    client, session_factory, _settings = auth_client
    password = "StrongAdminPassword!123"
    with session_factory() as db:
        create_initial_admin(
            db,
            email="admin@example.com",
            full_name="Portfolio Admin",
            password=password,
        )

    login_res = client.post(
        "/api/v1/auth/login",
        json={"email": "admin@example.com", "password": password},
    )
    assert login_res.status_code == 200
    token = login_res.json()["access_token"]
    return client, session_factory, {"Authorization": f"Bearer {token}"}
