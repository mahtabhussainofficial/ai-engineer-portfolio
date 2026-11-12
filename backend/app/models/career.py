"""Experience, education, and certification ORM models."""

from __future__ import annotations

import uuid
from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import Boolean, CheckConstraint, DateTime, ForeignKey, Index, Integer, String, Text, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin, UUIDPrimaryKeyMixin
from app.models.enums import PublishStatus

if TYPE_CHECKING:
    from app.models.media import MediaAsset


class Experience(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    """Career journey and work experience entry."""

    __tablename__ = "experience"
    __table_args__ = (
        CheckConstraint(
            "publish_status IN ('draft', 'published')",
            name="valid_publish_status",
        ),
        Index("ix_experience_status_order", "publish_status", "display_order"),
    )

    period: Mapped[str] = mapped_column(String(100), nullable=False)
    role: Mapped[str] = mapped_column(String(200), nullable=False)
    organization: Mapped[str] = mapped_column(String(200), nullable=False)
    location: Mapped[str | None] = mapped_column(String(150), nullable=True)
    summary: Mapped[str] = mapped_column(Text, nullable=False)
    is_current: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=False,
        server_default="false",
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
    display_order: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=0,
        server_default="0",
    )


class Education(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    """Academic degree or formal education entry."""

    __tablename__ = "education"
    __table_args__ = (
        CheckConstraint(
            "publish_status IN ('draft', 'published')",
            name="valid_publish_status",
        ),
        Index("ix_education_status_order", "publish_status", "display_order"),
    )

    period: Mapped[str] = mapped_column(String(100), nullable=False)
    degree: Mapped[str] = mapped_column(String(200), nullable=False)
    institution: Mapped[str] = mapped_column(String(200), nullable=False)
    field_of_study: Mapped[str | None] = mapped_column(String(200), nullable=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
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
    display_order: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=0,
        server_default="0",
    )


class Certification(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    """Professional certification or verified credential."""

    __tablename__ = "certifications"
    __table_args__ = (
        CheckConstraint(
            "publish_status IN ('draft', 'published')",
            name="valid_publish_status",
        ),
        Index("ix_certifications_status_order", "publish_status", "display_order"),
    )

    year: Mapped[str] = mapped_column(String(20), nullable=False)
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    issuer: Mapped[str] = mapped_column(String(200), nullable=False)
    credential_id: Mapped[str | None] = mapped_column(String(150), nullable=True)
    credential_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    badge_media_id: Mapped[uuid.UUID | None] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("media_assets.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
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
    display_order: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=0,
        server_default="0",
    )

    badge_media: Mapped[MediaAsset | None] = relationship(back_populates="certifications")
