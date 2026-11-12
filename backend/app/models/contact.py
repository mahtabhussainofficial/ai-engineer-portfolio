"""Contact inquiry message ORM model."""

from __future__ import annotations

import uuid
from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import CheckConstraint, DateTime, ForeignKey, Index, String, Text, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin, UUIDPrimaryKeyMixin
from app.models.enums import ContactInquiryMode, ContactMessageStatus

if TYPE_CHECKING:
    from app.models.admin import AdminUser


class ContactMessage(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    """Inbound project or advisory inquiry submitted from the portfolio contact form."""

    __tablename__ = "contact_messages"
    __table_args__ = (
        CheckConstraint(
            "inquiry_mode IN ('project', 'advisory')",
            name="valid_inquiry_mode",
        ),
        CheckConstraint(
            "status IN ('unread', 'read', 'archived')",
            name="valid_message_status",
        ),
        Index("ix_contact_messages_status_created", "status", "created_at"),
    )

    inquiry_mode: Mapped[str] = mapped_column(
        String(32),
        nullable=False,
        default=ContactInquiryMode.PROJECT.value,
        server_default=ContactInquiryMode.PROJECT.value,
    )
    sender_name: Mapped[str] = mapped_column(String(150), nullable=False)
    sender_email: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    subject: Mapped[str] = mapped_column(String(255), nullable=False)
    project_type: Mapped[str] = mapped_column(String(100), nullable=False)
    message: Mapped[str] = mapped_column(Text, nullable=False)
    status: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        default=ContactMessageStatus.UNREAD.value,
        server_default=ContactMessageStatus.UNREAD.value,
    )
    admin_notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    source_ip: Mapped[str | None] = mapped_column(String(45), nullable=True)
    user_agent: Mapped[str | None] = mapped_column(String(512), nullable=True)
    read_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )
    archived_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )
    handled_by_id: Mapped[uuid.UUID | None] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("admin_users.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )

    handled_by: Mapped[AdminUser | None] = relationship(back_populates="handled_messages")
