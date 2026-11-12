"""Pydantic v2 schemas for client feedback and testimonials."""

from __future__ import annotations

import uuid
from datetime import datetime
from decimal import Decimal

from pydantic import Field, HttpUrl

from app.models.enums import PublishStatus
from app.schemas.common import AppBaseSchema, UUIDTimestampSchema


class TestimonialBase(AppBaseSchema):
    """Shared fields for client feedback and testimonial entries."""

    title: str = Field(min_length=2, max_length=200)
    author_name: str | None = Field(default=None, max_length=150)
    author_role: str | None = Field(default=None, max_length=150)
    quote: str | None = None
    rating_score: Decimal | None = Field(default=None, ge=Decimal("1.0"), le=Decimal("5.0"))
    rating_label: str = Field(min_length=1, max_length=50)
    stars: int = Field(default=5, ge=1, le=5)
    source: str = Field(min_length=2, max_length=150)
    source_url: HttpUrl | None = None
    avatar_media_id: uuid.UUID | None = None
    featured: bool = False
    publish_status: PublishStatus = PublishStatus.DRAFT
    published_at: datetime | None = None
    display_order: int = Field(default=0, ge=0)


class TestimonialCreate(TestimonialBase):
    """Schema for creating a testimonial record."""


class TestimonialUpdate(AppBaseSchema):
    """Partial update schema for a testimonial record."""

    title: str | None = Field(default=None, min_length=2, max_length=200)
    author_name: str | None = Field(default=None, max_length=150)
    author_role: str | None = Field(default=None, max_length=150)
    quote: str | None = None
    rating_score: Decimal | None = Field(default=None, ge=Decimal("1.0"), le=Decimal("5.0"))
    rating_label: str | None = Field(default=None, min_length=1, max_length=50)
    stars: int | None = Field(default=None, ge=1, le=5)
    source: str | None = Field(default=None, min_length=2, max_length=150)
    source_url: HttpUrl | None = None
    avatar_media_id: uuid.UUID | None = None
    featured: bool | None = None
    publish_status: PublishStatus | None = None
    published_at: datetime | None = None
    display_order: int | None = Field(default=None, ge=0)


class TestimonialRead(UUIDTimestampSchema, TestimonialBase):
    """Read schema for a testimonial record."""
