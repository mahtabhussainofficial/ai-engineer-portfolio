"""Cryptographic primitives for Argon2id passwords, JWT access tokens, and refresh tokens."""

from __future__ import annotations

import hashlib
import secrets
import uuid
from dataclasses import dataclass
from datetime import datetime, timedelta, timezone

import jwt
from argon2 import PasswordHasher, Type
from argon2.exceptions import InvalidHashError, VerificationError, VerifyMismatchError
from jwt import PyJWTError

from app.core.config import Settings
from app.core.exceptions import AuthenticationError

_PASSWORD_HASHER = PasswordHasher(
    time_cost=3,
    memory_cost=65536,
    parallelism=4,
    hash_len=32,
    salt_len=16,
    type=Type.ID,
)

# Precomputed Argon2id hash used to equalize verification timing when an email is unknown.
_DUMMY_PASSWORD_HASH = _PASSWORD_HASHER.hash("timing-equalization-placeholder-secret")


@dataclass(frozen=True, slots=True)
class AccessTokenClaims:
    """Validated claims extracted from a JWT access token."""

    subject: uuid.UUID
    session_id: uuid.UUID | None
    jti: str


def hash_password(plain_password: str) -> str:
    """Hash a plaintext password using Argon2id."""
    return _PASSWORD_HASHER.hash(plain_password)


def verify_password(plain_password: str, stored_hash: str) -> bool:
    """Verify a plaintext password against a stored Argon2id hash."""
    try:
        return _PASSWORD_HASHER.verify(stored_hash, plain_password)
    except (VerifyMismatchError, VerificationError, InvalidHashError):
        return False


def verify_password_constant_time(plain_password: str, stored_hash: str | None) -> bool:
    """Verify password while performing an Argon2id check even when user is absent."""
    target_hash = stored_hash if stored_hash is not None else _DUMMY_PASSWORD_HASH
    verified = verify_password(plain_password, target_hash)
    return stored_hash is not None and verified


def password_needs_rehash(stored_hash: str) -> bool:
    """Return True if the stored Argon2id hash parameters are outdated."""
    try:
        return _PASSWORD_HASHER.check_needs_rehash(stored_hash)
    except InvalidHashError:
        return False


def generate_refresh_token() -> str:
    """Generate a high-entropy opaque refresh token."""
    return secrets.token_urlsafe(48)


def hash_refresh_token(raw_token: str) -> str:
    """Return the SHA-256 hex digest of an opaque refresh token."""
    return hashlib.sha256(raw_token.encode("utf-8")).hexdigest()


def generate_csrf_token() -> str:
    """Generate a high-entropy CSRF double-submit token."""
    return secrets.token_urlsafe(32)


def create_access_token(
    *,
    subject: uuid.UUID,
    session_id: uuid.UUID,
    settings: Settings,
) -> tuple[str, int]:
    """Create a short-lived signed JWT access token and return `(token, expires_in_seconds)`."""
    signing_key = settings.require_secret_key()
    now = datetime.now(timezone.utc)
    expires_in_seconds = settings.access_token_expire_minutes * 60
    expires_at = now + timedelta(seconds=expires_in_seconds)

    payload = {
        "sub": str(subject),
        "sid": str(session_id),
        "type": "access",
        "jti": str(uuid.uuid4()),
        "iss": settings.app_name,
        "iat": int(now.timestamp()),
        "nbf": int(now.timestamp()),
        "exp": int(expires_at.timestamp()),
    }
    token = jwt.encode(payload, signing_key, algorithm=settings.jwt_algorithm)
    return token, expires_in_seconds


def decode_access_token(token: str, settings: Settings) -> AccessTokenClaims:
    """Validate and decode a JWT access token into typed claims."""
    signing_key = settings.require_secret_key()
    try:
        payload = jwt.decode(
            token,
            signing_key,
            algorithms=[settings.jwt_algorithm],
            issuer=settings.app_name,
            options={"require": ["exp", "iat", "nbf", "sub", "type", "jti"]},
        )
    except PyJWTError as exc:
        raise AuthenticationError(
            "Invalid or expired authentication token.",
            code="invalid_token",
        ) from exc

    if payload.get("type") != "access":
        raise AuthenticationError(
            "Invalid or expired authentication token.",
            code="invalid_token",
        )

    try:
        subject = uuid.UUID(str(payload["sub"]))
        raw_sid = payload.get("sid")
        session_id = uuid.UUID(str(raw_sid)) if raw_sid is not None else None
        jti = str(payload["jti"])
    except (ValueError, TypeError) as exc:
        raise AuthenticationError(
            "Invalid or expired authentication token.",
            code="invalid_token",
        ) from exc

    return AccessTokenClaims(subject=subject, session_id=session_id, jti=jti)
