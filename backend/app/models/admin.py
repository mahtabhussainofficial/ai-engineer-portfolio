"""Admin user and admin session ORM models."""

from __future__ import annotations

import uuid
from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import Boolean, CheckConstraint, DateTime, ForeignKey, Index, String, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin, UUIDPrimaryKeyMixin
from app.models.enums import AdminRole

if TYPE_CHECKING:
    from app.models.contact import ContactMessage
    from app.models.media import MediaAsset
    from app.models.site_setting import SiteSetting


class AdminUser(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    """Portfolio administrator account."""

    __tablename__ = "admin_users"
    __table_args__ = (
        CheckConstraint("role IN ('super_admin', 'admin')", name="valid_role"),
    )

    email: Mapped[str] = mapped_column(String(255), nullable=False, unique=True)
    full_name: Mapped[str] = mapped_column(String(120), nullable=False)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[str] = mapped_column(
        String(32),
        nullable=False,
        default=AdminRole.ADMIN.value,
        server_default=AdminRole.ADMIN.value,
    )
    is_active: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=True,
        server_default="true",
    )
    last_login_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    sessions: Mapped[list[AdminSession]] = relationship(
        back_populates="admin_user",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )
    uploaded_media: Mapped[list[MediaAsset]] = relationship(
        back_populates="uploaded_by",
    )
    updated_settings: Mapped[list[SiteSetting]] = relationship(
        back_populates="updated_by",
    )
    handled_messages: Mapped[list[ContactMessage]] = relationship(
        back_populates="handled_by",
    )


class AdminSession(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    """Persisted admin refresh/session record for revocation and auditability."""

    __tablename__ = "admin_sessions"
    __table_args__ = (
        Index("ix_admin_sessions_user_expires", "admin_user_id", "expires_at"),
    )

    admin_user_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("admin_users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    refresh_token_hash: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
        unique=True,
    )
    user_agent: Mapped[str | None] = mapped_column(String(512), nullable=True)
    ip_address: Mapped[str | None] = mapped_column(String(45), nullable=True)
    expires_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        index=True,
    )
    revoked_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    admin_user: Mapped[AdminUser] = relationship(back_populates="sessions")
