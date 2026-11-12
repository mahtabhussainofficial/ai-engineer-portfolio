"""Pydantic v2 schemas for admin users and sessions."""

from __future__ import annotations

import uuid
from datetime import datetime

from pydantic import EmailStr, Field

from app.models.enums import AdminRole, ContactInquiryMode, ContactMessageStatus
from app.schemas.common import AppBaseSchema, AppWriteSchema, UUIDTimestampSchema


class AdminUserBase(AppBaseSchema):
    """Shared fields for portfolio administrators."""

    email: EmailStr
    full_name: str = Field(min_length=2, max_length=120)
    role: AdminRole = AdminRole.ADMIN
    is_active: bool = True


class AdminUserCreate(AppWriteSchema, AdminUserBase):
    """Schema for creating an admin account (raw password handled in auth service)."""

    password: str = Field(min_length=12, max_length=128)


class AdminUserUpdate(AppWriteSchema):
    """Partial update schema for an admin account."""

    email: EmailStr | None = None
    full_name: str | None = Field(default=None, min_length=2, max_length=120)
    role: AdminRole | None = None
    is_active: bool | None = None


class AdminUserRead(UUIDTimestampSchema):
    """Public-safe admin user representation excluding password hash."""

    email: EmailStr
    full_name: str
    role: AdminRole
    is_active: bool
    last_login_at: datetime | None = None


class AdminSessionRead(UUIDTimestampSchema):
    """Admin session metadata representation excluding refresh token hash."""

    admin_user_id: uuid.UUID
    user_agent: str | None = None
    ip_address: str | None = None
    expires_at: datetime
    revoked_at: datetime | None = None


class ContentCountSummary(AppBaseSchema):
    """Aggregate total, published, and draft counts for a publishable resource."""

    total: int = Field(ge=0)
    published: int = Field(ge=0)
    draft: int = Field(ge=0)


class ContactOverviewCounts(AppBaseSchema):
    """Contact inquiry counts grouped by triage status."""

    total: int = Field(ge=0)
    unread: int = Field(ge=0)
    read: int = Field(ge=0)
    archived: int = Field(ge=0)


class ContactMessageOverviewItem(AppBaseSchema):
    """Recent contact inquiry summary embedded in the admin dashboard overview."""

    id: uuid.UUID
    inquiry_mode: ContactInquiryMode
    sender_name: str
    sender_email: EmailStr
    subject: str
    project_type: str
    status: ContactMessageStatus
    created_at: datetime


class AdminOverviewResponse(AppBaseSchema):
    """Protected dashboard summary counts and recent contact inquiries."""

    projects: ContentCountSummary
    services: ContentCountSummary
    skills: ContentCountSummary
    experience: ContentCountSummary
    education: ContentCountSummary
    certifications: ContentCountSummary
    testimonials: ContentCountSummary
    media_assets: int = Field(ge=0)
    site_settings: int = Field(ge=0)
    public_site_settings: int = Field(ge=0)
    messages: ContactOverviewCounts
    recent_messages: list[ContactMessageOverviewItem]


class DeleteResponse(AppBaseSchema):
    """Confirmation payload returned when an admin record is deleted."""

    message: str
    id: uuid.UUID
