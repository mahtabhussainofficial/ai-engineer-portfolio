"""Client feedback and testimonial ORM model."""

from __future__ import annotations

import uuid
from datetime import datetime
from decimal import Decimal
from typing import TYPE_CHECKING

from sqlalchemy import (
    Boolean,
    CheckConstraint,
    DateTime,
    ForeignKey,
    Index,
    Integer,
    Numeric,
    SmallInteger,
    String,
    Text,
    Uuid,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin, UUIDPrimaryKeyMixin
from app.models.enums import PublishStatus

if TYPE_CHECKING:
    from app.models.media import MediaAsset


class Testimonial(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    """Client feedback or testimonial record displayed on the portfolio."""

    __tablename__ = "testimonials"
    __table_args__ = (
        CheckConstraint("stars >= 1 AND stars <= 5", name="valid_stars_range"),
        CheckConstraint(
            "rating_score IS NULL OR (rating_score >= 1.0 AND rating_score <= 5.0)",
            name="valid_rating_score",
        ),
        CheckConstraint(
            "publish_status IN ('draft', 'published')",
            name="valid_publish_status",
        ),
        Index("ix_testimonials_status_order", "publish_status", "display_order"),
        Index(
            "ix_testimonials_featured_status_order",
            "featured",
            "publish_status",
            "display_order",
        ),
    )

    title: Mapped[str] = mapped_column(String(200), nullable=False)
    author_name: Mapped[str | None] = mapped_column(String(150), nullable=True)
    author_role: Mapped[str | None] = mapped_column(String(150), nullable=True)
    quote: Mapped[str | None] = mapped_column(Text, nullable=True)
    rating_score: Mapped[Decimal | None] = mapped_column(Numeric(2, 1), nullable=True)
    rating_label: Mapped[str] = mapped_column(String(50), nullable=False)
    stars: Mapped[int] = mapped_column(
        SmallInteger,
        nullable=False,
        default=5,
        server_default="5",
    )
    source: Mapped[str] = mapped_column(String(150), nullable=False)
    source_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    avatar_media_id: Mapped[uuid.UUID | None] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("media_assets.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    featured: Mapped[bool] = mapped_column(
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

    avatar_media: Mapped[MediaAsset | None] = relationship(back_populates="testimonials")
