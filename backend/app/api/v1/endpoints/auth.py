"""Single-administrator authentication, token rotation, logout, and session endpoints."""

from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends, Query, Request, Response, status
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session

from app.api.deps import get_client_ip, get_current_admin, verify_csrf
from app.core.config import Settings, get_settings
from app.core.exceptions import AuthenticationError, _error_response
from app.db.session import get_db
from app.models.admin import AdminUser
from app.schemas.admin import AdminSessionRead, AdminUserRead
from app.schemas.auth import LoginRequest, LogoutResponse, SessionListResponse, TokenResponse
from app.schemas.common import ErrorResponse
from app.services.auth import (
    AuthTokensBundle,
    authenticate_admin,
    list_admin_sessions,
    refresh_admin_session,
    revoke_all_admin_sessions,
    revoke_session_by_id,
    revoke_session_by_refresh_token,
)

router = APIRouter(prefix="/auth", tags=["Authentication"])


def _auth_cookie_path(settings: Settings) -> str:
    return f"{settings.api_v1_prefix.rstrip('/')}/auth"


def _set_auth_cookies(
    response: Response,
    *,
    raw_refresh_token: str,
    csrf_token: str,
    settings: Settings,
) -> None:
    max_age = settings.refresh_token_expire_days * 24 * 60 * 60
    auth_path = _auth_cookie_path(settings)
    secure = settings.effective_cookie_secure

    response.set_cookie(
        key=settings.refresh_cookie_name,
        value=raw_refresh_token,
        max_age=max_age,
        path=auth_path,
        secure=secure,
        httponly=True,
        samesite=settings.cookie_samesite,
    )
    response.set_cookie(
        key=settings.csrf_cookie_name,
        value=csrf_token,
        max_age=max_age,
        path=auth_path,
        secure=secure,
        httponly=False,
        samesite=settings.cookie_samesite,
    )


def _clear_auth_cookies(response: Response, settings: Settings) -> None:
    auth_path = _auth_cookie_path(settings)
    secure = settings.effective_cookie_secure

    response.delete_cookie(
        key=settings.refresh_cookie_name,
        path=auth_path,
        secure=secure,
        httponly=True,
        samesite=settings.cookie_samesite,
    )
    response.delete_cookie(
        key=settings.csrf_cookie_name,
        path=auth_path,
        secure=secure,
        httponly=False,
        samesite=settings.cookie_samesite,
    )


def _token_response_from_bundle(bundle: AuthTokensBundle) -> TokenResponse:
    return TokenResponse(
        access_token=bundle.access_token,
        expires_in=bundle.expires_in,
        csrf_token=bundle.csrf_token,
        admin=AdminUserRead.model_validate(bundle.admin),
    )


@router.post(
    "/login",
    response_model=TokenResponse,
    status_code=status.HTTP_200_OK,
    responses={
        status.HTTP_401_UNAUTHORIZED: {"model": ErrorResponse},
        status.HTTP_429_TOO_MANY_REQUESTS: {"model": ErrorResponse},
    },
    summary="Administrator login",
    description="Authenticate the portfolio administrator and issue a JWT access token and HttpOnly refresh cookie.",
)
def login(
    payload: LoginRequest,
    request: Request,
    response: Response,
    db: Session = Depends(get_db),
    settings: Settings = Depends(get_settings),
) -> TokenResponse:
    bundle = authenticate_admin(
        db,
        settings,
        email=str(payload.email),
        password=payload.password,
        ip_address=get_client_ip(request),
        user_agent=request.headers.get("User-Agent"),
    )
    _set_auth_cookies(
        response,
        raw_refresh_token=bundle.raw_refresh_token,
        csrf_token=bundle.csrf_token,
        settings=settings,
    )
    return _token_response_from_bundle(bundle)


def _extract_refresh_tokens(request: Request, cookie_name: str) -> list[str]:
    """Extract all refresh token values present in request Cookie headers and cookie jar."""
    tokens: list[str] = []
    for header in request.headers.getlist("cookie"):
        for chunk in header.split(";"):
            chunk = chunk.strip()
            if not chunk:
                continue
            if "=" in chunk:
                key, val = chunk.split("=", 1)
                if key.strip() == cookie_name:
                    cleaned = val.strip()
                    if cleaned.startswith('"') and cleaned.endswith('"') and len(cleaned) >= 2:
                        cleaned = cleaned[1:-1]
                    if cleaned and cleaned not in tokens:
                        tokens.append(cleaned)
    single = request.cookies.get(cookie_name)
    if single:
        single_clean = single.strip()
        if single_clean.startswith('"') and single_clean.endswith('"') and len(single_clean) >= 2:
            single_clean = single_clean[1:-1]
        if single_clean and single_clean not in tokens:
            tokens.append(single_clean)
    return tokens


@router.post(
    "/refresh",
    response_model=TokenResponse,
    status_code=status.HTTP_200_OK,
    dependencies=[Depends(verify_csrf)],
    responses={
        status.HTTP_401_UNAUTHORIZED: {"model": ErrorResponse},
        status.HTTP_403_FORBIDDEN: {"model": ErrorResponse},
    },
    summary="Rotate refresh session and issue new access token",
    description="Validates CSRF protection and rotates the HttpOnly refresh token cookie.",
)
def refresh_tokens(
    request: Request,
    response: Response,
    db: Session = Depends(get_db),
    settings: Settings = Depends(get_settings),
) -> TokenResponse:
    raw_refresh_tokens = _extract_refresh_tokens(request, settings.refresh_cookie_name)
    try:
        bundle = refresh_admin_session(
            db,
            settings,
            raw_refresh_tokens=raw_refresh_tokens,
            ip_address=get_client_ip(request),
            user_agent=request.headers.get("User-Agent"),
        )
    except AuthenticationError as exc:
        err_response = _error_response(
            status_code=exc.status_code,
            code=exc.code,
            message=exc.message,
            headers=exc.headers,
        )
        _clear_auth_cookies(err_response, settings)
        return err_response  # type: ignore[return-value]

    _set_auth_cookies(
        response,
        raw_refresh_token=bundle.raw_refresh_token,
        csrf_token=bundle.csrf_token,
        settings=settings,
    )
    return _token_response_from_bundle(bundle)


@router.post(
    "/logout",
    response_model=LogoutResponse,
    status_code=status.HTTP_200_OK,
    dependencies=[Depends(verify_csrf)],
    responses={status.HTTP_403_FORBIDDEN: {"model": ErrorResponse}},
    summary="Logout current administrator session",
    description="Revokes the refresh session matching the HttpOnly cookie and clears auth cookies.",
)
def logout(
    request: Request,
    response: Response,
    db: Session = Depends(get_db),
    settings: Settings = Depends(get_settings),
) -> LogoutResponse:
    raw_refresh_tokens = _extract_refresh_tokens(request, settings.refresh_cookie_name)
    revoked = 0
    if raw_refresh_tokens:
        for tok in raw_refresh_tokens:
            revoked += revoke_session_by_refresh_token(db, raw_refresh_token=tok)
    else:
        raw_refresh_token = request.cookies.get(settings.refresh_cookie_name)
        revoked = revoke_session_by_refresh_token(db, raw_refresh_token=raw_refresh_token)
    _clear_auth_cookies(response, settings)
    return LogoutResponse(message="Logged out successfully.", revoked_sessions=revoked)


@router.post(
    "/logout-all",
    response_model=LogoutResponse,
    status_code=status.HTTP_200_OK,
    responses={status.HTTP_401_UNAUTHORIZED: {"model": ErrorResponse}},
    summary="Revoke all active administrator sessions",
    description="Revokes all active refresh sessions for the authenticated administrator.",
)
def logout_all_sessions(
    response: Response,
    current_admin: AdminUser = Depends(get_current_admin),
    db: Session = Depends(get_db),
    settings: Settings = Depends(get_settings),
) -> LogoutResponse:
    revoked = revoke_all_admin_sessions(db, admin_user_id=current_admin.id)
    _clear_auth_cookies(response, settings)
    return LogoutResponse(
        message="All active sessions revoked.",
        revoked_sessions=revoked,
    )


@router.get(
    "/me",
    response_model=AdminUserRead,
    status_code=status.HTTP_200_OK,
    responses={status.HTTP_401_UNAUTHORIZED: {"model": ErrorResponse}},
    summary="Get authenticated administrator profile",
)
def get_me(current_admin: AdminUser = Depends(get_current_admin)) -> AdminUserRead:
    return AdminUserRead.model_validate(current_admin)


@router.get(
    "/sessions",
    response_model=SessionListResponse,
    status_code=status.HTTP_200_OK,
    responses={status.HTTP_401_UNAUTHORIZED: {"model": ErrorResponse}},
    summary="List administrator refresh sessions",
)
def list_sessions(
    include_revoked: bool = Query(default=False),
    current_admin: AdminUser = Depends(get_current_admin),
    db: Session = Depends(get_db),
) -> SessionListResponse:
    sessions = list_admin_sessions(
        db,
        admin_user_id=current_admin.id,
        include_revoked=include_revoked,
    )
    return SessionListResponse(
        sessions=[AdminSessionRead.model_validate(item) for item in sessions]
    )


@router.delete(
    "/sessions/{session_id}",
    response_model=LogoutResponse,
    status_code=status.HTTP_200_OK,
    responses={
        status.HTTP_401_UNAUTHORIZED: {"model": ErrorResponse},
        status.HTTP_404_NOT_FOUND: {"model": ErrorResponse},
    },
    summary="Revoke a specific administrator session",
)
def revoke_session(
    session_id: uuid.UUID,
    current_admin: AdminUser = Depends(get_current_admin),
    db: Session = Depends(get_db),
) -> LogoutResponse:
    revoked = revoke_session_by_id(db, admin_user_id=current_admin.id, session_id=session_id)
    return LogoutResponse(message="Session revoked successfully.", revoked_sessions=revoked)
