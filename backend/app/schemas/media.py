"""Pydantic v2 schemas for externally hosted and local-public media assets."""

from __future__ import annotations

import uuid

from pydantic import Field

from app.models.enums import StorageProvider
from app.schemas.common import AppBaseSchema, AppWriteSchema, SafeAssetUrl, UUIDTimestampSchema


class MediaAssetBase(AppBaseSchema):
    """Shared attributes for media asset records."""

    title: str = Field(min_length=1, max_length=200)
    file_name: str = Field(min_length=1, max_length=255)
    storage_provider: StorageProvider = StorageProvider.EXTERNAL
    storage_key: str | None = Field(default=None, max_length=512)
    url: SafeAssetUrl = Field(min_length=1, max_length=1000)
    mime_type: str = Field(min_length=3, max_length=100)
    file_size_bytes: int | None = Field(default=None, ge=0)
    width: int | None = Field(default=None, gt=0)
    height: int | None = Field(default=None, gt=0)
    alt_text: str | None = Field(default=None, max_length=300)
    caption: str | None = Field(default=None, max_length=500)


class MediaAssetCreate(AppWriteSchema, MediaAssetBase):
    """Schema for registering an external or local-public media asset."""


class MediaAssetUpdate(AppWriteSchema):
    """Partial update schema for media metadata."""

    title: str | None = Field(default=None, min_length=1, max_length=200)
    file_name: str | None = Field(default=None, min_length=1, max_length=255)
    storage_provider: StorageProvider | None = None
    storage_key: str | None = Field(default=None, max_length=512)
    url: SafeAssetUrl | None = Field(default=None, min_length=1, max_length=1000)
    mime_type: str | None = Field(default=None, min_length=3, max_length=100)
    file_size_bytes: int | None = Field(default=None, ge=0)
    width: int | None = Field(default=None, gt=0)
    height: int | None = Field(default=None, gt=0)
    alt_text: str | None = Field(default=None, max_length=300)
    caption: str | None = Field(default=None, max_length=500)


class MediaAssetSummary(AppBaseSchema):
    """Compact media representation embedded inside public and admin content payloads."""

    id: uuid.UUID
    title: str
    url: str
    mime_type: str
    width: int | None = None
    height: int | None = None
    alt_text: str | None = None
    caption: str | None = None


class MediaAssetRead(UUIDTimestampSchema, MediaAssetBase):
    """Full read schema for media asset records."""

    uploaded_by_id: uuid.UUID | None = None
