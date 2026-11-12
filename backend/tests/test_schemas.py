"""Tests for Pydantic v2 schema validation and ORM serialization."""

from __future__ import annotations

import uuid
from datetime import datetime, timezone

import pytest
from pydantic import ValidationError

from app.models import AdminUser
from app.models.enums import ContactInquiryMode, ContactMessageStatus
from app.schemas import (
    AdminUserRead,
    ContactMessageCreate,
    MediaAssetCreate,
    ProjectCreate,
    TestimonialCreate as TestimonialCreateSchema,
)


def test_admin_user_read_excludes_password_hash() -> None:
    now = datetime.now(timezone.utc)
    orm_user = AdminUser(
        id=uuid.uuid4(),
        email="owner@example.com",
        full_name="Portfolio Owner",
        password_hash="argon2id$supersecret",
        role="super_admin",
        is_active=True,
        created_at=now,
        updated_at=now,
    )
    schema = AdminUserRead.model_validate(orm_user)
    dumped = schema.model_dump()
    assert "password_hash" not in dumped
    assert dumped["email"] == "owner@example.com"


def test_contact_message_create_validation() -> None:
    valid = ContactMessageCreate(
        inquiry_mode=ContactInquiryMode.PROJECT,
        sender_name="  Alex Rivera  ",
        sender_email="alex@example.com",
        subject="RAG Pipeline",
        project_type="RAG or knowledge system",
        message="We need a production RAG pipeline over internal documentation.",
    )
    assert valid.sender_name == "Alex Rivera"

    with pytest.raises(ValidationError):
        ContactMessageCreate(
            inquiry_mode=ContactInquiryMode.PROJECT,
            sender_name="A",
            sender_email="not-an-email",
            subject="Hi",
            project_type="AI",
            message="Too short",
        )


def test_project_slug_and_media_url_validation() -> None:
    project = ProjectCreate(
        slug="knowledge-assistant",
        title="Knowledge Assistant",
        category="AI & Machine Learning",
        summary="Grounded RAG architecture over verified documents.",
        problem="Teams lose time searching scattered operational guides.",
        solution="Built a hybrid search and citation-constrained RAG API.",
        deliverables=["Ingestion pipeline"],
        tags=["Python", "FastAPI"],
    )
    assert project.slug == "knowledge-assistant"

    with pytest.raises(ValidationError):
        ProjectCreate(
            slug="Invalid Slug!",
            title="Bad Slug",
            category="AI & Machine Learning",
            summary="Grounded RAG architecture over verified documents.",
            problem="Teams lose time searching scattered operational guides.",
            solution="Built a hybrid search and citation-constrained RAG API.",
        )

    asset = MediaAssetCreate(
        title="Portrait",
        file_name="portrait.jpg",
        url="/shabnum-portrait.jpg",
        mime_type="image/jpeg",
    )
    assert asset.url == "/shabnum-portrait.jpg"

    with pytest.raises(ValidationError):
        MediaAssetCreate(
            title="Bad Asset",
            file_name="bad.jpg",
            url="ftp://invalid.example.com/bad.jpg",
            mime_type="image/jpeg",
        )


def test_testimonial_star_bounds() -> None:
    with pytest.raises(ValidationError):
        TestimonialCreateSchema(
            title="Invalid Stars",
            rating_label="6.0",
            stars=6,
            source="Test",
        )
    assert ContactMessageStatus.UNREAD.value == "unread"
