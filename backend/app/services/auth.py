"""Single-administrator authentication, session rotation, and revocation services."""

from __future__ import annotations

import logging
import uuid
from dataclasses import dataclass
from datetime import datetime, timedelta, timezone

from sqlalchemy import func, select, update
from sqlalchemy.orm import Session

from app.core.config import Settings
from app.core.exceptions import AuthenticationError, ConflictError, NotFoundError, RateLimitExceededError
from app.core.rate_limit import login_rate_limiter
from app.core.security import (
    create_access_token,
    generate_csrf_token,
    generate_refresh_token,
    hash_password,
    hash_refresh_token,
    password_needs_rehash,
    verify_password_constant_time,
)
from app.models.admin import AdminSession, AdminUser
from app.models.enums import AdminRole

logger = logging.getLogger(__name__)


@dataclass(frozen=True, slots=True)
class AuthTokensBundle:
    """Issued access token, opaque refresh token, CSRF token, and authenticated admin."""

    admin: AdminUser
    session: AdminSession
    access_token: str
    expires_in: int
    raw_refresh_token: str
    csrf_token: str


def _utc_now() -> datetime:
    return datetime.now(timezone.utc)


def _as_utc(value: datetime) -> datetime:
    if value.tzinfo is None:
        return value.replace(tzinfo=timezone.utc)
    return value.astimezone(timezone.utc)


def _rate_limit_keys(ip_address: str | None, normalized_email: str) -> tuple[str, str]:
    client_ip = ip_address or "unknown"
    return f"login:ip:{client_ip}", f"login:ip_email:{client_ip}:{normalized_email}"


def create_initial_admin(
    db: Session,
    *,
    email: str,
    full_name: str,
    password: str,
) -> AdminUser:
    """Create the sole portfolio administrator account if none exists yet."""
    existing_count = db.scalar(select(func.count()).select_from(AdminUser)) or 0
    if existing_count > 0:
        raise ConflictError(
            "An administrator account already exists. Only one administrator is permitted."
        )

    if len(password) < 12 or len(password) > 128 or password.strip() == "":
        raise ValueError("Password must be between 12 and 128 non-blank characters.")

    normalized_email = email.strip().lower()
    cleaned_name = full_name.strip()
    if len(cleaned_name) < 2:
        raise ValueError("Full name must be at least 2 characters.")

    admin = AdminUser(
        email=normalized_email,
        full_name=cleaned_name,
        password_hash=hash_password(password),
        role=AdminRole.ADMIN.value,
        is_active=True,
    )
    db.add(admin)
    db.commit()
    db.refresh(admin)
    logger.info("Created initial administrator account", extra={"admin_id": str(admin.id)})
    return admin


def _issue_session_and_tokens(
    db: Session,
    *,
    admin: AdminUser,
    settings: Settings,
    ip_address: str | None,
    user_agent: str | None,
    now: datetime,
) -> AuthTokensBundle:
    raw_refresh_token = generate_refresh_token()
    refresh_hash = hash_refresh_token(raw_refresh_token)
    expires_at = now + timedelta(days=settings.refresh_token_expire_days)

    session = AdminSession(
        admin_user_id=admin.id,
        refresh_token_hash=refresh_hash,
        user_agent=user_agent[:512] if user_agent else None,
        ip_address=ip_address[:45] if ip_address else None,
        expires_at=expires_at,
    )
    db.add(session)
    db.flush()

    access_token, expires_in = create_access_token(
        subject=admin.id,
        session_id=session.id,
        settings=settings,
    )
    csrf_token = generate_csrf_token()
    return AuthTokensBundle(
        admin=admin,
        session=session,
        access_token=access_token,
        expires_in=expires_in,
        raw_refresh_token=raw_refresh_token,
        csrf_token=csrf_token,
    )


def authenticate_admin(
    db: Session,
    settings: Settings,
    *,
    email: str,
    password: str,
    ip_address: str | None,
    user_agent: str | None,
) -> AuthTokensBundle:
    """Authenticate the administrator with rate limiting and timing-safe Argon2id verification."""
    normalized_email = email.strip().lower()
    ip_key, account_key = _rate_limit_keys(ip_address, normalized_email)

    for key in (ip_key, account_key):
        retry_after = login_rate_limiter.check(
            key,
            max_attempts=settings.auth_login_rate_limit_max_attempts,
            window_seconds=settings.auth_login_rate_limit_window_seconds,
        )
        if retry_after is not None:
            logger.warning("Login rate limit exceeded", extra={"rate_key": key})
            raise RateLimitExceededError(retry_after)

    admin = db.scalar(select(AdminUser).where(AdminUser.email == normalized_email))
    password_ok = verify_password_constant_time(
        password,
        admin.password_hash if admin is not None else None,
    )

    if admin is None or not password_ok or not admin.is_active:
        login_rate_limiter.record_failure(
            ip_key,
            window_seconds=settings.auth_login_rate_limit_window_seconds,
        )
        login_rate_limiter.record_failure(
            account_key,
            window_seconds=settings.auth_login_rate_limit_window_seconds,
        )
        logger.warning("Failed admin login attempt")
        raise AuthenticationError("Invalid authentication credentials.")

    login_rate_limiter.reset(account_key)
    login_rate_limiter.reset(ip_key)

    now = _utc_now()
    if password_needs_rehash(admin.password_hash):
        admin.password_hash = hash_password(password)
    admin.last_login_at = now

    bundle = _issue_session_and_tokens(
        db,
        admin=admin,
        settings=settings,
        ip_address=ip_address,
        user_agent=user_agent,
        now=now,
    )
    db.commit()
    db.refresh(admin)
    db.refresh(bundle.session)
    logger.info("Admin login succeeded", extra={"session_id": str(bundle.session.id)})
    return bundle


def revoke_all_admin_sessions(db: Session, *, admin_user_id: uuid.UUID) -> int:
    """Revoke all active refresh sessions belonging to the administrator."""
    now = _utc_now()
    result = db.execute(
        update(AdminSession)
        .where(
            AdminSession.admin_user_id == admin_user_id,
            AdminSession.revoked_at.is_(None),
        )
        .values(revoked_at=now)
    )
    db.commit()
    return int(result.rowcount or 0)


def refresh_admin_session(
    db: Session,
    settings: Settings,
    *,
    raw_refresh_token: str | None,
    ip_address: str | None,
    user_agent: str | None,
) -> AuthTokensBundle:
    """Validate, rotate, and protect against reuse of refresh tokens."""
    if not raw_refresh_token:
        raise AuthenticationError(
            "Invalid or expired refresh session.",
            code="invalid_refresh_session",
        )

    token_hash = hash_refresh_token(raw_refresh_token)
    existing_session = db.scalar(
        select(AdminSession).where(AdminSession.refresh_token_hash == token_hash)
    )
    if existing_session is None:
        raise AuthenticationError(
            "Invalid or expired refresh session.",
            code="invalid_refresh_session",
        )

    now = _utc_now()

    # Replay of a rotated or logged-out refresh token revokes all active sessions.
    if existing_session.revoked_at is not None:
        revoked_count = revoke_all_admin_sessions(
            db,
            admin_user_id=existing_session.admin_user_id,
        )
        logger.warning(
            "Refresh token reuse detected; revoked all active sessions",
            extra={
                "admin_id": str(existing_session.admin_user_id),
                "revoked_sessions": revoked_count,
            },
        )
        raise AuthenticationError(
            "Invalid or expired refresh session.",
            code="refresh_token_reuse",
        )

    admin = db.scalar(select(AdminUser).where(AdminUser.id == existing_session.admin_user_id))
    if admin is None or not admin.is_active or _as_utc(existing_session.expires_at) <= now:
        db.execute(
            update(AdminSession)
            .where(
                AdminSession.id == existing_session.id,
                AdminSession.revoked_at.is_(None),
            )
            .values(revoked_at=now)
        )
        db.commit()
        raise AuthenticationError(
            "Invalid or expired refresh session.",
            code="invalid_refresh_session",
        )

    # Atomically revoke the consumed session before issuing its replacement.
    claim_result = db.execute(
        update(AdminSession)
        .where(
            AdminSession.id == existing_session.id,
            AdminSession.revoked_at.is_(None),
        )
        .values(revoked_at=now)
    )
    if (claim_result.rowcount or 0) != 1:
        revoke_all_admin_sessions(db, admin_user_id=existing_session.admin_user_id)
        logger.warning(
            "Concurrent refresh token replay detected; revoked all active sessions",
            extra={"admin_id": str(existing_session.admin_user_id)},
        )
        raise AuthenticationError(
            "Invalid or expired refresh session.",
            code="refresh_token_reuse",
        )

    bundle = _issue_session_and_tokens(
        db,
        admin=admin,
        settings=settings,
        ip_address=ip_address,
        user_agent=user_agent,
        now=now,
    )
    db.commit()
    db.refresh(bundle.session)
    logger.info(
        "Rotated admin refresh session",
        extra={
            "previous_session_id": str(existing_session.id),
            "new_session_id": str(bundle.session.id),
        },
    )
    return bundle


def revoke_session_by_refresh_token(db: Session, *, raw_refresh_token: str | None) -> int:
    """Revoke the session matching `raw_refresh_token` if active."""
    if not raw_refresh_token:
        return 0

    token_hash = hash_refresh_token(raw_refresh_token)
    now = _utc_now()
    result = db.execute(
        update(AdminSession)
        .where(
            AdminSession.refresh_token_hash == token_hash,
            AdminSession.revoked_at.is_(None),
        )
        .values(revoked_at=now)
    )
    db.commit()
    return int(result.rowcount or 0)


def list_admin_sessions(
    db: Session,
    *,
    admin_user_id: uuid.UUID,
    include_revoked: bool = False,
) -> list[AdminSession]:
    """Return refresh sessions owned by the authenticated administrator."""
    stmt = select(AdminSession).where(AdminSession.admin_user_id == admin_user_id)
    if not include_revoked:
        now = _utc_now()
        stmt = stmt.where(
            AdminSession.revoked_at.is_(None),
            AdminSession.expires_at > now,
        )
    stmt = stmt.order_by(AdminSession.created_at.desc())
    return list(db.scalars(stmt).all())


def revoke_session_by_id(
    db: Session,
    *,
    admin_user_id: uuid.UUID,
    session_id: uuid.UUID,
) -> None:
    """Revoke a specific session owned by the administrator."""
    session = db.scalar(
        select(AdminSession).where(
            AdminSession.id == session_id,
            AdminSession.admin_user_id == admin_user_id,
        )
    )
    if session is None:
        raise NotFoundError("Admin session was not found.")

    if session.revoked_at is None:
        session.revoked_at = _utc_now()
        db.commit()
