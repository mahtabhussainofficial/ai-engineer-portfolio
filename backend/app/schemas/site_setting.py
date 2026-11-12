"""Pydantic v2 schemas for structured JSONB site settings."""

from __future__ import annotations

import uuid
from typing import Any

from pydantic import Field

from app.schemas.common import AppBaseSchema, UUIDTimestampSchema


class SiteSettingBase(AppBaseSchema):
    """Shared schema for keyed JSONB site settings."""

    key: str = Field(min_length=2, max_length=100, pattern=r"^[a-z0-9_.-]+$")
    label: str = Field(min_length=2, max_length=150)
    category: str = Field(default="general", min_length=2, max_length=50)
    description: str | None = None
    value: dict[str, Any]
    is_public: bool = True
    portrait_media_id: uuid.UUID | None = None


class SiteSettingCreate(SiteSettingBase):
    """Schema for creating a site setting entry."""


class SiteSettingUpdate(AppBaseSchema):
    """Partial update schema for a site setting entry."""

    label: str | None = Field(default=None, min_length=2, max_length=150)
    category: str | None = Field(default=None, min_length=2, max_length=50)
    description: str | None = None
    value: dict[str, Any] | None = None
    is_public: bool | None = None
    portrait_media_id: uuid.UUID | None = None


class SiteSettingRead(UUIDTimestampSchema, SiteSettingBase):
    """Read schema for site settings."""

    updated_by_id: uuid.UUID | None = None
