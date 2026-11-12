"""Tests for SQLAlchemy 2.x models, relational integrity, and Alembic migrations."""

from __future__ import annotations

from datetime import datetime, timedelta, timezone
from decimal import Decimal
from pathlib import Path

import pytest
from alembic import command
from alembic.config import Config
from sqlalchemy import inspect
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.models import (
    AdminSession,
    AdminUser,
    Base,
    Certification,
    ContactMessage,
    Education,
    Experience,
    MediaAsset,
    Project,
    Service,
    SiteSetting,
    Skill,
    Testimonial as TestimonialModel,
)

EXPECTED_TABLES = {
    "admin_users",
    "admin_sessions",
    "site_settings",
    "projects",
    "services",
    "skills",
    "experience",
    "education",
    "certifications",
    "testimonials",
    "contact_messages",
    "media_assets",
}

BACKEND_DIR = Path(__file__).resolve().parents[1]


def test_all_twelve_tables_registered_in_metadata() -> None:
    assert set(Base.metadata.tables.keys()) == EXPECTED_TABLES


def test_alembic_upgrade_and_downgrade_cycle(sqlite_db_url: str) -> None:
    alembic_cfg = Config(str(BACKEND_DIR / "alembic.ini"))
    alembic_cfg.set_main_option("script_location", str(BACKEND_DIR / "alembic"))
    alembic_cfg.set_main_option("sqlalchemy.url", sqlite_db_url)

    command.upgrade(alembic_cfg, "head")

    from sqlalchemy import create_engine

    engine = create_engine(sqlite_db_url)
    try:
        table_names = set(inspect(engine).get_table_names())
        assert EXPECTED_TABLES.issubset(table_names)
        assert "alembic_version" in table_names
    finally:
        engine.dispose()

    command.downgrade(alembic_cfg, "base")

    engine = create_engine(sqlite_db_url)
    try:
        remaining_tables = set(inspect(engine).get_table_names())
        assert EXPECTED_TABLES.isdisjoint(remaining_tables)
    finally:
        engine.dispose()


def test_alembic_offline_postgresql_sql_generation(
    capsys: pytest.CaptureFixture[str],
) -> None:
    alembic_cfg = Config(str(BACKEND_DIR / "alembic.ini"))
    alembic_cfg.set_main_option("script_location", str(BACKEND_DIR / "alembic"))
    alembic_cfg.set_main_option("sqlalchemy.url", "")

    command.upgrade(alembic_cfg, "head", sql=True)
    ddl_sql = capsys.readouterr().out

    for table in EXPECTED_TABLES:
        assert f"CREATE TABLE {table}" in ddl_sql
    assert "JSONB" in ddl_sql
    assert "UUID" in ddl_sql
    assert "TIMESTAMP WITH TIME ZONE" in ddl_sql
    assert "VARCHAR(80)[]" in ddl_sql or "TEXT[]" in ddl_sql


def test_admin_user_session_cascade_and_media_set_null(db_session: Session) -> None:
    admin = AdminUser(
        email="admin@example.com",
        full_name="Test Admin",
        password_hash="hashed-secret-value",
    )
    db_session.add(admin)
    db_session.flush()

    session_record = AdminSession(
        admin_user_id=admin.id,
        refresh_token_hash="token-hash-001",
        expires_at=datetime.now(timezone.utc) + timedelta(days=7),
    )
    media = MediaAsset(
        title="Sample Cover",
        file_name="cover.png",
        storage_provider="external",
        url="https://cdn.example.com/cover.png",
        mime_type="image/png",
        uploaded_by_id=admin.id,
    )
    db_session.add_all([session_record, media])
    db_session.flush()

    project = Project(
        slug="sample-project",
        title="Sample Project",
        category="AI & Machine Learning",
        project_type="Case Study",
        publish_status="published",
        display_order=1,
        summary="A concise summary for the sample project.",
        problem="A concrete problem statement for testing.",
        solution="A structured solution explanation for testing.",
        deliverables=["Deliverable A"],
        tags=["Python", "FastAPI"],
        cover_media_id=media.id,
    )
    db_session.add(project)
    db_session.commit()

    # Deleting media sets project.cover_media_id to NULL rather than deleting project.
    db_session.delete(media)
    db_session.commit()
    db_session.refresh(project)
    assert project.cover_media_id is None

    # Deleting admin cascades to admin_sessions.
    db_session.delete(admin)
    db_session.commit()
    assert db_session.query(AdminSession).count() == 0


def test_unique_and_check_constraints(db_session: Session) -> None:
    p1 = Project(
        slug="unique-slug",
        title="First Project",
        category="Backend & API Development",
        summary="Summary for the first project.",
        problem="Problem for the first project.",
        solution="Solution for the first project.",
    )
    db_session.add(p1)
    db_session.commit()

    p2 = Project(
        slug="unique-slug",
        title="Duplicate Slug Project",
        category="Backend & API Development",
        summary="Summary for duplicate slug test.",
        problem="Problem for duplicate slug test.",
        solution="Solution for duplicate slug test.",
    )
    db_session.add(p2)
    with pytest.raises(IntegrityError):
        db_session.commit()
    db_session.rollback()

    invalid_message = ContactMessage(
        inquiry_mode="project",
        sender_name="Sender",
        sender_email="sender@example.com",
        subject="Test Subject",
        project_type="Backend or API",
        message="This message is long enough to pass validation.",
        status="invalid_status",
    )
    db_session.add(invalid_message)
    with pytest.raises(IntegrityError):
        db_session.commit()
    db_session.rollback()


def test_remaining_portfolio_models_persist(db_session: Session) -> None:
    setting = SiteSetting(
        key="site_profile",
        label="Site Profile",
        category="branding",
        value={"brandName": "SHABNUM H."},
    )
    service = Service(
        category="Backend & Data",
        domain="BACKEND",
        title="FastAPI Architecture",
        description="Production FastAPI services and PostgreSQL modeling.",
        tools=["FastAPI", "PostgreSQL"],
        display_order=1,
    )
    skill = Skill(
        layer="backend",
        domain="API LAYER",
        title="Backend Development",
        description="Typed Python API services and persistence.",
        items=["FastAPI", "SQLAlchemy"],
        display_order=1,
    )
    exp = Experience(
        period="2023 — Present",
        role="AI Engineer",
        organization="Independent",
        summary="Building production AI workflows and Python backends.",
        display_order=1,
    )
    edu = Education(
        period="2015 — 2019",
        degree="B.S. in Computer Science",
        institution="Example University",
        display_order=1,
    )
    cert = Certification(
        year="2024",
        title="Sample Certification",
        issuer="Example Issuer",
        display_order=1,
    )
    testimonial = TestimonialModel(
        title="Sample Engagement",
        rating_score=Decimal("5.0"),
        rating_label="5.0",
        stars=5,
        source="Profile feedback",
        display_order=1,
    )
    db_session.add_all([setting, service, skill, exp, edu, cert, testimonial])
    db_session.commit()

    assert db_session.query(SiteSetting).count() == 1
    assert db_session.query(Service).count() == 1
    assert db_session.query(Skill).count() == 1
    assert db_session.query(Experience).count() == 1
    assert db_session.query(Education).count() == 1
    assert db_session.query(Certification).count() == 1
    assert db_session.query(TestimonialModel).count() == 1
