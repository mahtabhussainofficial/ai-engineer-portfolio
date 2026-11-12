"""Pydantic v2 schemas for portfolio service offerings."""

from __future__ import annotations

from datetime import datetime

from pydantic import Field

from app.models.enums import PublishStatus
from app.schemas.common import AppBaseSchema, UUIDTimestampSchema


class ServiceBase(AppBaseSchema):
    """Shared fields for AI engineering and backend service records."""

    display_number: str | None = Field(default=None, max_length=16)
    category: str = Field(min_length=2, max_length=100)
    domain: str = Field(min_length=2, max_length=100)
    title: str = Field(min_length=2, max_length=200)
    description: str = Field(min_length=10)
    tools: list[str] = Field(default_factory=list)
    featured: bool = False
    home_category_label: str | None = Field(default=None, max_length=100)
    home_title: str | None = Field(default=None, max_length=200)
    home_description: str | None = None
    home_tags: list[str] | None = None
    publish_status: PublishStatus = PublishStatus.DRAFT
    published_at: datetime | None = None
    display_order: int = Field(default=0, ge=0)


class ServiceCreate(ServiceBase):
    """Schema for creating a service offering."""


class ServiceUpdate(AppBaseSchema):
    """Partial update schema for a service offering."""

    display_number: str | None = Field(default=None, max_length=16)
    category: str | None = Field(default=None, min_length=2, max_length=100)
    domain: str | None = Field(default=None, min_length=2, max_length=100)
    title: str | None = Field(default=None, min_length=2, max_length=200)
    description: str | None = Field(default=None, min_length=10)
    tools: list[str] | None = None
    featured: bool | None = None
    home_category_label: str | None = Field(default=None, max_length=100)
    home_title: str | None = Field(default=None, max_length=200)
    home_description: str | None = None
    home_tags: list[str] | None = None
    publish_status: PublishStatus | None = None
    published_at: datetime | None = None
    display_order: int | None = Field(default=None, ge=0)


class ServiceRead(UUIDTimestampSchema, ServiceBase):
    """Read schema for a service offering."""
