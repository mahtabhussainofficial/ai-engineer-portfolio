"""Structured site-level configuration ORM model using PostgreSQL JSONB."""

from __future__ import annotations

import uuid
from typing import TYPE_CHECKING, Any

from sqlalchemy import Boolean, ForeignKey, Index, String, Text, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin, UUIDPrimaryKeyMixin
from app.db.types import JSONBType

if TYPE_CHECKING:
    from app.models.admin import AdminUser
    from app.models.media import MediaAsset


class SiteSetting(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    """Keyed JSONB settings for flexible site profile, hero, and section copy."""

    __tablename__ = "site_settings"
    __table_args__ = (
        Index("ix_site_settings_category_public", "category", "is_public"),
    )

    key: Mapped[str] = mapped_column(String(100), nullable=False, unique=True)
    label: Mapped[str] = mapped_column(String(150), nullable=False)
    category: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        default="general",
        server_default="general",
    )
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    value: Mapped[dict[str, Any]] = mapped_column(JSONBType, nullable=False)
    is_public: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=True,
        server_default="true",
    )
    portrait_media_id: Mapped[uuid.UUID | None] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("media_assets.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    updated_by_id: Mapped[uuid.UUID | None] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("admin_users.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )

    portrait_media: Mapped[MediaAsset | None] = relationship(back_populates="site_settings")
    updated_by: Mapped[AdminUser | None] = relationship(back_populates="updated_settings")
