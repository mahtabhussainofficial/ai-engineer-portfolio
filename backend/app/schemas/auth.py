"""Pydantic v2 schemas for single-administrator authentication and sessions."""

from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator

from app.schemas.admin import AdminSessionRead, AdminUserRead
from app.schemas.common import AppBaseSchema


class LoginRequest(BaseModel):
    """Administrator login credentials payload (preserves exact password characters)."""

    model_config = ConfigDict(str_strip_whitespace=False)

    email: EmailStr
    password: str = Field(min_length=1, max_length=128)

    @field_validator("email", mode="before")
    @classmethod
    def normalize_email(cls, value: object) -> object:
        if isinstance(value, str):
            return value.strip().lower()
        return value


class TokenResponse(AppBaseSchema):
    """Access token and CSRF token payload returned on login and refresh."""

    access_token: str
    token_type: Literal["bearer"] = "bearer"
    expires_in: int
    csrf_token: str
    admin: AdminUserRead


class LogoutResponse(AppBaseSchema):
    """Confirmation payload returned on logout or session revocation."""

    message: str
    revoked_sessions: int = 0


class SessionListResponse(AppBaseSchema):
    """List of administrator refresh sessions."""

    sessions: list[AdminSessionRead]
