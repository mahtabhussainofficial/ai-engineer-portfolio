"""Pydantic v2 schemas for externally hosted media assets."""

from __future__ import annotations

import uuid

from pydantic import Field, field_validator

from app.models.enums import StorageProvider
from app.schemas.common import AppBaseSchema, UUIDTimestampSchema


def _validate_asset_url(value: str) -> str:
    if value.startswith(("https://", "http://", "/")):
        return value
    raise ValueError("URL must be an http(s) URL or root-relative path starting with '/'")


class MediaAssetBase(AppBaseSchema):
    """Shared attributes for media asset records."""

    title: str = Field(min_length=1, max_length=200)
    file_name: str = Field(min_length=1, max_length=255)
    storage_provider: StorageProvider = StorageProvider.EXTERNAL
    storage_key: str | None = Field(default=None, max_length=512)
    url: str = Field(min_length=1, max_length=1000)
    mime_type: str = Field(min_length=3, max_length=100)
    file_size_bytes: int | None = Field(default=None, ge=0)
    width: int | None = Field(default=None, gt=0)
    height: int | None = Field(default=None, gt=0)
    alt_text: str | None = Field(default=None, max_length=300)
    caption: str | None = Field(default=None, max_length=500)

    @field_validator("url")
    @classmethod
    def validate_url(cls, value: str) -> str:
        return _validate_asset_url(value)


class MediaAssetCreate(MediaAssetBase):
    """Schema for registering an external media asset."""


class MediaAssetUpdate(AppBaseSchema):
    """Partial update schema for media metadata."""

    title: str | None = Field(default=None, min_length=1, max_length=200)
    file_name: str | None = Field(default=None, min_length=1, max_length=255)
    storage_provider: StorageProvider | None = None
    storage_key: str | None = Field(default=None, max_length=512)
    url: str | None = Field(default=None, min_length=1, max_length=1000)
    mime_type: str | None = Field(default=None, min_length=3, max_length=100)
    file_size_bytes: int | None = Field(default=None, ge=0)
    width: int | None = Field(default=None, gt=0)
    height: int | None = Field(default=None, gt=0)
    alt_text: str | None = Field(default=None, max_length=300)
    caption: str | None = Field(default=None, max_length=500)

    @field_validator("url")
    @classmethod
    def validate_optional_url(cls, value: str | None) -> str | None:
        if value is None:
            return None
        return _validate_asset_url(value)


class MediaAssetRead(UUIDTimestampSchema, MediaAssetBase):
    """Read schema for media asset records."""

    uploaded_by_id: uuid.UUID | None = None
