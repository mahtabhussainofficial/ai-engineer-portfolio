"""Pydantic v2 schemas for experience, education, and certifications."""

from __future__ import annotations

import uuid
from datetime import datetime

from pydantic import Field, HttpUrl

from app.models.enums import PublishStatus
from app.schemas.common import AppBaseSchema, UUIDTimestampSchema


class ExperienceBase(AppBaseSchema):
    """Shared fields for career experience entries."""

    period: str = Field(min_length=2, max_length=100)
    role: str = Field(min_length=2, max_length=200)
    organization: str = Field(min_length=2, max_length=200)
    location: str | None = Field(default=None, max_length=150)
    summary: str = Field(min_length=10)
    is_current: bool = False
    publish_status: PublishStatus = PublishStatus.DRAFT
    published_at: datetime | None = None
    display_order: int = Field(default=0, ge=0)


class ExperienceCreate(ExperienceBase):
    """Schema for creating an experience entry."""


class ExperienceUpdate(AppBaseSchema):
    """Partial update schema for an experience entry."""

    period: str | None = Field(default=None, min_length=2, max_length=100)
    role: str | None = Field(default=None, min_length=2, max_length=200)
    organization: str | None = Field(default=None, min_length=2, max_length=200)
    location: str | None = Field(default=None, max_length=150)
    summary: str | None = Field(default=None, min_length=10)
    is_current: bool | None = None
    publish_status: PublishStatus | None = None
    published_at: datetime | None = None
    display_order: int | None = Field(default=None, ge=0)


class ExperienceRead(UUIDTimestampSchema, ExperienceBase):
    """Read schema for an experience entry."""


class EducationBase(AppBaseSchema):
    """Shared fields for academic education entries."""

    period: str = Field(min_length=2, max_length=100)
    degree: str = Field(min_length=2, max_length=200)
    institution: str = Field(min_length=2, max_length=200)
    field_of_study: str | None = Field(default=None, max_length=200)
    description: str | None = None
    publish_status: PublishStatus = PublishStatus.DRAFT
    published_at: datetime | None = None
    display_order: int = Field(default=0, ge=0)


class EducationCreate(EducationBase):
    """Schema for creating an education entry."""


class EducationUpdate(AppBaseSchema):
    """Partial update schema for an education entry."""

    period: str | None = Field(default=None, min_length=2, max_length=100)
    degree: str | None = Field(default=None, min_length=2, max_length=200)
    institution: str | None = Field(default=None, min_length=2, max_length=200)
    field_of_study: str | None = Field(default=None, max_length=200)
    description: str | None = None
    publish_status: PublishStatus | None = None
    published_at: datetime | None = None
    display_order: int | None = Field(default=None, ge=0)


class EducationRead(UUIDTimestampSchema, EducationBase):
    """Read schema for an education entry."""


class CertificationBase(AppBaseSchema):
    """Shared fields for certification entries."""

    year: str = Field(min_length=4, max_length=20)
    title: str = Field(min_length=2, max_length=200)
    issuer: str = Field(min_length=2, max_length=200)
    credential_id: str | None = Field(default=None, max_length=150)
    credential_url: HttpUrl | None = None
    badge_media_id: uuid.UUID | None = None
    publish_status: PublishStatus = PublishStatus.DRAFT
    published_at: datetime | None = None
    display_order: int = Field(default=0, ge=0)


class CertificationCreate(CertificationBase):
    """Schema for creating a certification entry."""


class CertificationUpdate(AppBaseSchema):
    """Partial update schema for a certification entry."""

    year: str | None = Field(default=None, min_length=4, max_length=20)
    title: str | None = Field(default=None, min_length=2, max_length=200)
    issuer: str | None = Field(default=None, min_length=2, max_length=200)
    credential_id: str | None = Field(default=None, max_length=150)
    credential_url: HttpUrl | None = None
    badge_media_id: uuid.UUID | None = None
    publish_status: PublishStatus | None = None
    published_at: datetime | None = None
    display_order: int | None = Field(default=None, ge=0)


class CertificationRead(UUIDTimestampSchema, CertificationBase):
    """Read schema for a certification entry."""
