"""Shared FastAPI dependencies for authentication, CSRF verification, and request context."""

from __future__ import annotations

import secrets
from urllib.parse import urlparse

from fastapi import Depends, Request
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.config import Settings, get_settings
from app.core.exceptions import AuthenticationError, ForbiddenError
from app.core.security import decode_access_token
from app.db.session import get_db
from app.models.admin import AdminUser

_bearer_scheme = HTTPBearer(auto_error=False)


def get_client_ip(request: Request) -> str | None:
    """Extract client IP address from the ASGI connection scope."""
    if request.client and request.client.host:
        return request.client.host
    return None


def _extract_origin(url_value: str) -> str | None:
    parsed = urlparse(url_value.strip())
    if parsed.scheme and parsed.netloc:
        return f"{parsed.scheme.lower()}://{parsed.netloc.lower()}"
    return None


def verify_csrf(
    request: Request,
    settings: Settings = Depends(get_settings),
) -> None:
    """Validate browser origin (when sent) and double-submit CSRF token for cookie routes."""
    allowed_origins = {origin.rstrip("/").lower() for origin in settings.cors_origins}
    origin_header = request.headers.get("Origin")
    referer_header = request.headers.get("Referer")

    if origin_header and allowed_origins:
        if origin_header.rstrip("/").lower() not in allowed_origins:
            raise ForbiddenError(
                "Cross-origin request rejected.",
                code="csrf_validation_failed",
            )
    elif referer_header and allowed_origins:
        referer_origin = _extract_origin(referer_header)
        if referer_origin is None or referer_origin not in allowed_origins:
            raise ForbiddenError(
                "Cross-origin referer rejected.",
                code="csrf_validation_failed",
            )

    cookie_token = request.cookies.get(settings.csrf_cookie_name)
    header_token = request.headers.get(settings.csrf_header_name)
    if (
        not cookie_token
        or not header_token
        or not secrets.compare_digest(cookie_token, header_token)
    ):
        raise ForbiddenError(
            "CSRF validation failed.",
            code="csrf_validation_failed",
        )


def get_current_admin(
    credentials: HTTPAuthorizationCredentials | None = Depends(_bearer_scheme),
    db: Session = Depends(get_db),
    settings: Settings = Depends(get_settings),
) -> AdminUser:
    """Authenticate the active portfolio administrator from a Bearer JWT access token."""
    if credentials is None or credentials.scheme.lower() != "bearer":
        raise AuthenticationError(
            "Invalid or expired authentication token.",
            code="invalid_token",
        )

    claims = decode_access_token(credentials.credentials, settings)
    admin = db.scalar(select(AdminUser).where(AdminUser.id == claims.subject))
    if admin is None or not admin.is_active:
        raise AuthenticationError(
            "Invalid or expired authentication token.",
            code="invalid_token",
        )
    return admin
