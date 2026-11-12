"""Pydantic v2 schemas for admin users and sessions."""

from __future__ import annotations

import uuid
from datetime import datetime

from pydantic import EmailStr, Field

from app.models.enums import AdminRole
from app.schemas.common import AppBaseSchema, UUIDTimestampSchema


class AdminUserBase(AppBaseSchema):
    """Shared fields for portfolio administrators."""

    email: EmailStr
    full_name: str = Field(min_length=2, max_length=120)
    role: AdminRole = AdminRole.ADMIN
    is_active: bool = True


class AdminUserCreate(AdminUserBase):
    """Schema for creating an admin account (raw password handled in auth service)."""

    password: str = Field(min_length=12, max_length=128)


class AdminUserUpdate(AppBaseSchema):
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
