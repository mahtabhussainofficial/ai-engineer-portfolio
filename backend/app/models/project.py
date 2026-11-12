"""Portfolio project case-study ORM model."""

from __future__ import annotations

import uuid
from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import Boolean, CheckConstraint, DateTime, ForeignKey, Index, Integer, String, Text, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin, UUIDPrimaryKeyMixin
from app.db.types import string_array_type, text_array_type
from app.models.enums import ProjectType, PublishStatus

if TYPE_CHECKING:
    from app.models.media import MediaAsset


class Project(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    """Portfolio project brief or case study."""

    __tablename__ = "projects"
    __table_args__ = (
        CheckConstraint(
            "publish_status IN ('draft', 'published')",
            name="valid_publish_status",
        ),
        CheckConstraint(
            "project_type IN ('Concept Brief', 'Case Study')",
            name="valid_project_type",
        ),
        Index("ix_projects_status_order", "publish_status", "display_order"),
        Index(
            "ix_projects_featured_status_order",
            "featured",
            "publish_status",
            "display_order",
        ),
    )

    slug: Mapped[str] = mapped_column(String(150), nullable=False, unique=True)
    display_number: Mapped[str | None] = mapped_column(String(16), nullable=True)
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    category: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    home_category_label: Mapped[str | None] = mapped_column(String(100), nullable=True)
    project_type: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        default=ProjectType.CASE_STUDY.value,
        server_default=ProjectType.CASE_STUDY.value,
    )
    publish_status: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        default=PublishStatus.DRAFT.value,
        server_default=PublishStatus.DRAFT.value,
    )
    published_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )
    featured: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=False,
        server_default="false",
    )
    display_order: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=0,
        server_default="0",
    )
    summary: Mapped[str] = mapped_column(Text, nullable=False)
    problem: Mapped[str] = mapped_column(Text, nullable=False)
    solution: Mapped[str] = mapped_column(Text, nullable=False)
    deliverables: Mapped[list[str]] = mapped_column(
        text_array_type(),
        nullable=False,
        default=list,
    )
    tags: Mapped[list[str]] = mapped_column(
        string_array_type(80),
        nullable=False,
        default=list,
    )
    live_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    repo_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    cover_media_id: Mapped[uuid.UUID | None] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("media_assets.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )

    cover_media: Mapped[MediaAsset | None] = relationship(back_populates="projects")
