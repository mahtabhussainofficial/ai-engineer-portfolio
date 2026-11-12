"""Portfolio service offering ORM model."""

from __future__ import annotations

from datetime import datetime

from sqlalchemy import Boolean, CheckConstraint, DateTime, Index, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base, TimestampMixin, UUIDPrimaryKeyMixin
from app.db.types import string_array_type
from app.models.enums import PublishStatus


class Service(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    """AI engineering or backend service catalog item."""

    __tablename__ = "services"
    __table_args__ = (
        CheckConstraint(
            "publish_status IN ('draft', 'published')",
            name="valid_publish_status",
        ),
        Index("ix_services_status_order", "publish_status", "display_order"),
        Index(
            "ix_services_featured_status_order",
            "featured",
            "publish_status",
            "display_order",
        ),
    )

    display_number: Mapped[str | None] = mapped_column(String(16), nullable=True)
    category: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    domain: Mapped[str] = mapped_column(String(100), nullable=False)
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    tools: Mapped[list[str]] = mapped_column(
        string_array_type(100),
        nullable=False,
        default=list,
    )
    featured: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=False,
        server_default="false",
    )
    home_category_label: Mapped[str | None] = mapped_column(String(100), nullable=True)
    home_title: Mapped[str | None] = mapped_column(String(200), nullable=True)
    home_description: Mapped[str | None] = mapped_column(Text, nullable=True)
    home_tags: Mapped[list[str] | None] = mapped_column(
        string_array_type(100),
        nullable=True,
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
