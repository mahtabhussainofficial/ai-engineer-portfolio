"""Pydantic v2 schemas for portfolio projects."""

from __future__ import annotations

import uuid
from datetime import datetime

from pydantic import Field, HttpUrl

from app.models.enums import ProjectType, PublishStatus
from app.schemas.common import AppBaseSchema, UUIDTimestampSchema


class ProjectBase(AppBaseSchema):
    """Shared fields for project briefs and case studies."""

    slug: str = Field(min_length=2, max_length=150, pattern=r"^[a-z0-9]+(?:-[a-z0-9]+)*$")
    display_number: str | None = Field(default=None, max_length=16)
    title: str = Field(min_length=2, max_length=200)
    category: str = Field(min_length=2, max_length=100)
    home_category_label: str | None = Field(default=None, max_length=100)
    project_type: ProjectType = ProjectType.CASE_STUDY
    publish_status: PublishStatus = PublishStatus.DRAFT
    published_at: datetime | None = None
    featured: bool = False
    display_order: int = Field(default=0, ge=0)
    summary: str = Field(min_length=10)
    problem: str = Field(min_length=10)
    solution: str = Field(min_length=10)
    deliverables: list[str] = Field(default_factory=list)
    tags: list[str] = Field(default_factory=list)
    live_url: HttpUrl | None = None
    repo_url: HttpUrl | None = None
    cover_media_id: uuid.UUID | None = None


class ProjectCreate(ProjectBase):
    """Schema for creating a portfolio project."""


class ProjectUpdate(AppBaseSchema):
    """Partial update schema for a portfolio project."""

    slug: str | None = Field(
        default=None, min_length=2, max_length=150, pattern=r"^[a-z0-9]+(?:-[a-z0-9]+)*$"
    )
    display_number: str | None = Field(default=None, max_length=16)
    title: str | None = Field(default=None, min_length=2, max_length=200)
    category: str | None = Field(default=None, min_length=2, max_length=100)
    home_category_label: str | None = Field(default=None, max_length=100)
    project_type: ProjectType | None = None
    publish_status: PublishStatus | None = None
    published_at: datetime | None = None
    featured: bool | None = None
    display_order: int | None = Field(default=None, ge=0)
    summary: str | None = Field(default=None, min_length=10)
    problem: str | None = Field(default=None, min_length=10)
    solution: str | None = Field(default=None, min_length=10)
    deliverables: list[str] | None = None
    tags: list[str] | None = None
    live_url: HttpUrl | None = None
    repo_url: HttpUrl | None = None
    cover_media_id: uuid.UUID | None = None


class ProjectSummary(UUIDTimestampSchema):
    """Compact project schema for list and homepage preview views."""

    slug: str
    display_number: str | None = None
    title: str
    category: str
    home_category_label: str | None = None
    project_type: ProjectType
    publish_status: PublishStatus
    featured: bool
    display_order: int
    summary: str
    tags: list[str]
    cover_media_id: uuid.UUID | None = None


class ProjectRead(UUIDTimestampSchema, ProjectBase):
    """Full project read schema."""
