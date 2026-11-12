"""Pydantic v2 schemas for layered skill groups."""

from __future__ import annotations

from datetime import datetime

from pydantic import Field

from app.models.enums import PublishStatus, SkillLayer
from app.schemas.common import AppBaseSchema, UUIDTimestampSchema


class SkillBase(AppBaseSchema):
    """Shared fields for skill groups across AI, backend, and delivery layers."""

    layer: SkillLayer = SkillLayer.AI
    display_number: str | None = Field(default=None, max_length=16)
    domain: str = Field(min_length=2, max_length=100)
    title: str = Field(min_length=2, max_length=200)
    description: str = Field(min_length=10)
    items: list[str] = Field(default_factory=list)
    featured: bool = False
    featured_category: str | None = Field(default=None, max_length=100)
    featured_title: str | None = Field(default=None, max_length=200)
    featured_description: str | None = None
    featured_tags: list[str] | None = None
    publish_status: PublishStatus = PublishStatus.DRAFT
    published_at: datetime | None = None
    display_order: int = Field(default=0, ge=0)


class SkillCreate(SkillBase):
    """Schema for creating a skill group."""


class SkillUpdate(AppBaseSchema):
    """Partial update schema for a skill group."""

    layer: SkillLayer | None = None
    display_number: str | None = Field(default=None, max_length=16)
    domain: str | None = Field(default=None, min_length=2, max_length=100)
    title: str | None = Field(default=None, min_length=2, max_length=200)
    description: str | None = Field(default=None, min_length=10)
    items: list[str] | None = None
    featured: bool | None = None
    featured_category: str | None = Field(default=None, max_length=100)
    featured_title: str | None = Field(default=None, max_length=200)
    featured_description: str | None = None
    featured_tags: list[str] | None = None
    publish_status: PublishStatus | None = None
    published_at: datetime | None = None
    display_order: int | None = Field(default=None, ge=0)


class SkillRead(UUIDTimestampSchema, SkillBase):
    """Read schema for a skill group."""
