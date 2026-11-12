"""External media asset metadata ORM model."""

from __future__ import annotations

import uuid
from typing import TYPE_CHECKING

from sqlalchemy import BigInteger, CheckConstraint, ForeignKey, Index, Integer, String, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin, UUIDPrimaryKeyMixin
from app.models.enums import StorageProvider

if TYPE_CHECKING:
    from app.models.admin import AdminUser
    from app.models.career import Certification
    from app.models.project import Project
    from app.models.site_setting import SiteSetting
    from app.models.testimonial import Testimonial


class MediaAsset(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    """Metadata for externally hosted images and downloadable portfolio files."""

    __tablename__ = "media_assets"
    __table_args__ = (
        CheckConstraint(
            "storage_provider IN ('external', 's3', 'r2', 'cloudinary', 'local_public')",
            name="valid_storage_provider",
        ),
        CheckConstraint(
            "file_size_bytes IS NULL OR file_size_bytes >= 0",
            name="non_negative_file_size",
        ),
        CheckConstraint(
            "(width IS NULL OR width > 0) AND (height IS NULL OR height > 0)",
            name="positive_dimensions",
        ),
        Index("ix_media_assets_provider_mime", "storage_provider", "mime_type"),
    )

    title: Mapped[str] = mapped_column(String(200), nullable=False)
    file_name: Mapped[str] = mapped_column(String(255), nullable=False)
    storage_provider: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        default=StorageProvider.EXTERNAL.value,
        server_default=StorageProvider.EXTERNAL.value,
    )
    storage_key: Mapped[str | None] = mapped_column(String(512), nullable=True)
    url: Mapped[str] = mapped_column(String(1000), nullable=False)
    mime_type: Mapped[str] = mapped_column(String(100), nullable=False)
    file_size_bytes: Mapped[int | None] = mapped_column(BigInteger, nullable=True)
    width: Mapped[int | None] = mapped_column(Integer, nullable=True)
    height: Mapped[int | None] = mapped_column(Integer, nullable=True)
    alt_text: Mapped[str | None] = mapped_column(String(300), nullable=True)
    caption: Mapped[str | None] = mapped_column(String(500), nullable=True)
    uploaded_by_id: Mapped[uuid.UUID | None] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("admin_users.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )

    uploaded_by: Mapped[AdminUser | None] = relationship(back_populates="uploaded_media")
    projects: Mapped[list[Project]] = relationship(back_populates="cover_media")
    certifications: Mapped[list[Certification]] = relationship(back_populates="badge_media")
    testimonials: Mapped[list[Testimonial]] = relationship(back_populates="avatar_media")
    site_settings: Mapped[list[SiteSetting]] = relationship(back_populates="portrait_media")
