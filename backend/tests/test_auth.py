"""Tests for single-administrator authentication, JWTs, refresh rotation, CSRF, and rate limiting."""

from __future__ import annotations

import secrets
import uuid
from datetime import datetime, timedelta, timezone

import jwt
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import select
from sqlalchemy.orm import Session, sessionmaker

from app.cli import create_admin as create_admin_cli
from app.core.config import Settings
from app.core.exceptions import ConflictError
from app.core.security import (
    create_access_token,
    hash_password,
    hash_refresh_token,
    verify_password,
)
from app.models import AdminSession, AdminUser
from app.services.auth import create_initial_admin

ADMIN_EMAIL = "admin@example.com"
ADMIN_NAME = "Portfolio Admin"
ADMIN_PASSWORD = "Correct-Horse-Battery-Staple-99!"


def _seed_admin(session_factory: sessionmaker[Session]) -> AdminUser:
    with session_factory() as db:
        return create_initial_admin(
            db,
            email=ADMIN_EMAIL,
            full_name=ADMIN_NAME,
            password=ADMIN_PASSWORD,
        )


def test_argon2id_password_hashing_and_verification() -> None:
    hashed = hash_password(ADMIN_PASSWORD)
    assert hashed.startswith("$argon2id$")
    assert hashed != ADMIN_PASSWORD
    assert verify_password(ADMIN_PASSWORD, hashed) is True
    assert verify_password("Wrong-Password-123!", hashed) is False
    assert verify_password(ADMIN_PASSWORD, "corrupted-hash") is False


def test_create_initial_admin_enforces_single_admin_and_password_policy(
    db_session: Session,
) -> None:
    with pytest.raises(ValueError):
        create_initial_admin(
            db_session,
            email=ADMIN_EMAIL,
            full_name=ADMIN_NAME,
            password="short",
        )

    admin = create_initial_admin(
        db_session,
        email="  Admin@Example.COM ",
        full_name=ADMIN_NAME,
        password=ADMIN_PASSWORD,
    )
    assert admin.email == ADMIN_EMAIL
    assert admin.password_hash.startswith("$argon2id$")
    assert admin.is_active is True

    with pytest.raises(ConflictError):
        create_initial_admin(
            db_session,
            email="second@example.com",
            full_name="Second Admin",
            password=ADMIN_PASSWORD,
        )


def test_no_public_registration_endpoint_exists(
    auth_client: tuple[TestClient, sessionmaker[Session], Settings],
) -> None:
    client, _session_factory, _settings = auth_client
    for path in ("/api/v1/auth/register", "/api/v1/auth/signup", "/api/v1/register"):
        response = client.post(path, json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
        assert response.status_code == 404


def test_secret_key_validation_and_cookie_secure_defaults() -> None:
    unset_settings = Settings(_env_file=None, secret_key=None)
    with pytest.raises(RuntimeError):
        unset_settings.require_secret_key()

    placeholder_settings = Settings(_env_file=None, secret_key="CHANGE_ME_BEFORE_PHASE_2")
    with pytest.raises(RuntimeError):
        placeholder_settings.require_secret_key()

    short_settings = Settings(_env_file=None, secret_key="too-short")
    with pytest.raises(RuntimeError):
        short_settings.require_secret_key()

    assert Settings(_env_file=None, environment="development").effective_cookie_secure is False
    assert Settings(_env_file=None, environment="production").effective_cookie_secure is True
    assert (
        Settings(_env_file=None, environment="development", cookie_secure=True).effective_cookie_secure
        is True
    )


def test_successful_login_sets_cookies_hashes_refresh_token_and_allows_me(
    auth_client: tuple[TestClient, sessionmaker[Session], Settings],
) -> None:
    client, session_factory, settings = auth_client
    admin = _seed_admin(session_factory)

    login_res = client.post(
        "/api/v1/auth/login",
        json={"email": "Admin@Example.com", "password": ADMIN_PASSWORD},
        headers={"User-Agent": "pytest-agent"},
    )
    assert login_res.status_code == 200
    body = login_res.json()
    assert body["token_type"] == "bearer"
    assert body["expires_in"] == settings.access_token_expire_minutes * 60
    assert body["admin"]["email"] == ADMIN_EMAIL
    assert "password_hash" not in body["admin"]
    assert body["csrf_token"]

    raw_refresh = client.cookies.get(settings.refresh_cookie_name)
    csrf_cookie = client.cookies.get(settings.csrf_cookie_name)
    assert raw_refresh is not None
    assert csrf_cookie == body["csrf_token"]

    set_cookie_headers = login_res.headers.get_list("set-cookie")
    refresh_header = next(h for h in set_cookie_headers if settings.refresh_cookie_name in h)
    assert "HttpOnly" in refresh_header
    assert "SameSite=lax" in refresh_header
    assert "Path=/api/v1/auth" in refresh_header

    with session_factory() as db:
        stored_sessions = list(db.scalars(select(AdminSession)).all())
        assert len(stored_sessions) == 1
        assert stored_sessions[0].refresh_token_hash == hash_refresh_token(raw_refresh)
        assert stored_sessions[0].refresh_token_hash != raw_refresh
        refreshed_admin = db.scalar(select(AdminUser).where(AdminUser.id == admin.id))
        assert refreshed_admin is not None
        assert refreshed_admin.last_login_at is not None

    me_res = client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {body['access_token']}"},
    )
    assert me_res.status_code == 200
    assert me_res.json()["id"] == str(admin.id)


def test_invalid_credentials_return_generic_messages_and_rate_limit(
    auth_client: tuple[TestClient, sessionmaker[Session], Settings],
) -> None:
    client, session_factory, settings = auth_client
    admin = _seed_admin(session_factory)

    wrong_pw_res = client.post(
        "/api/v1/auth/login",
        json={"email": ADMIN_EMAIL, "password": "NotTheRightPassword123!"},
    )
    unknown_email_res = client.post(
        "/api/v1/auth/login",
        json={"email": "nobody@example.com", "password": "NotTheRightPassword123!"},
    )
    assert wrong_pw_res.status_code == 401
    assert unknown_email_res.status_code == 401
    assert wrong_pw_res.json()["error"]["message"] == unknown_email_res.json()["error"]["message"]
    assert wrong_pw_res.json()["error"]["message"] == "Invalid authentication credentials."

    # 3 more failures reach max_attempts=5; 6th attempt must trigger 429 rate limit.
    for _ in range(settings.auth_login_rate_limit_max_attempts - 2):
        res = client.post(
            "/api/v1/auth/login",
            json={"email": ADMIN_EMAIL, "password": "WrongPassword123!"},
        )
        assert res.status_code == 401

    limited_res = client.post(
        "/api/v1/auth/login",
        json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD},
    )
    assert limited_res.status_code == 429
    assert limited_res.json()["error"]["code"] == "rate_limit_exceeded"
    assert int(limited_res.headers["Retry-After"]) >= 1

    # Also verify inactive admin returns the same generic 401 message.
    with session_factory() as db:
        db_admin = db.scalar(select(AdminUser).where(AdminUser.id == admin.id))
        assert db_admin is not None
        db_admin.is_active = False
        db.commit()

    from app.core.rate_limit import login_rate_limiter

    login_rate_limiter.clear()
    inactive_res = client.post(
        "/api/v1/auth/login",
        json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD},
    )
    assert inactive_res.status_code == 401
    assert inactive_res.json()["error"]["message"] == "Invalid authentication credentials."


def test_jwt_validation_rejects_missing_expired_tampered_wrong_type_and_inactive(
    auth_client: tuple[TestClient, sessionmaker[Session], Settings],
) -> None:
    client, session_factory, settings = auth_client
    admin = _seed_admin(session_factory)
    signing_key = settings.require_secret_key()

    # Missing Bearer header
    assert client.get("/api/v1/auth/me").status_code == 401

    # Expired JWT
    expired_time = datetime.now(timezone.utc) - timedelta(minutes=5)
    expired_jwt = jwt.encode(
        {
            "sub": str(admin.id),
            "type": "access",
            "jti": str(uuid.uuid4()),
            "iss": settings.app_name,
            "iat": int((expired_time - timedelta(minutes=15)).timestamp()),
            "nbf": int((expired_time - timedelta(minutes=15)).timestamp()),
            "exp": int(expired_time.timestamp()),
        },
        signing_key,
        algorithm="HS256",
    )
    assert (
        client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {expired_jwt}"}).status_code
        == 401
    )

    # Wrong token type claim
    now = datetime.now(timezone.utc)
    wrong_type_jwt = jwt.encode(
        {
            "sub": str(admin.id),
            "type": "refresh",
            "jti": str(uuid.uuid4()),
            "iss": settings.app_name,
            "iat": int(now.timestamp()),
            "nbf": int(now.timestamp()),
            "exp": int((now + timedelta(minutes=10)).timestamp()),
        },
        signing_key,
        algorithm="HS256",
    )
    assert (
        client.get(
            "/api/v1/auth/me", headers={"Authorization": f"Bearer {wrong_type_jwt}"}
        ).status_code
        == 401
    )

    # Valid JWT signed with wrong secret
    valid_jwt, _ = create_access_token(
        subject=admin.id,
        session_id=uuid.uuid4(),
        settings=settings,
    )
    tampered_jwt = valid_jwt[:-4] + "abcd"
    assert (
        client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {tampered_jwt}"}).status_code
        == 401
    )

    # Inactive admin cannot use even an unexpired valid JWT
    with session_factory() as db:
        db_admin = db.scalar(select(AdminUser).where(AdminUser.id == admin.id))
        assert db_admin is not None
        db_admin.is_active = False
        db.commit()

    assert (
        client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {valid_jwt}"}).status_code
        == 401
    )


def test_refresh_rotation_and_reuse_detection_revokes_all_sessions(
    auth_client: tuple[TestClient, sessionmaker[Session], Settings],
) -> None:
    client, session_factory, settings = auth_client
    _seed_admin(session_factory)

    login_res = client.post(
        "/api/v1/auth/login",
        json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD},
    )
    assert login_res.status_code == 200
    old_refresh_token = client.cookies.get(settings.refresh_cookie_name)
    old_csrf = login_res.json()["csrf_token"]
    assert old_refresh_token is not None

    # Rotate refresh token successfully
    refresh_res = client.post(
        "/api/v1/auth/refresh",
        headers={"X-CSRF-Token": old_csrf, "Origin": "http://localhost:3000"},
    )
    assert refresh_res.status_code == 200
    refresh_body = refresh_res.json()
    new_refresh_token = client.cookies.get(settings.refresh_cookie_name)
    new_csrf = refresh_body["csrf_token"]
    assert new_refresh_token is not None
    assert new_refresh_token != old_refresh_token
    assert new_csrf != old_csrf

    with session_factory() as db:
        sessions = list(db.scalars(select(AdminSession).order_by(AdminSession.created_at)).all())
        assert len(sessions) == 2
        assert sessions[0].revoked_at is not None
        assert sessions[1].revoked_at is None

    # Replay of the old rotated refresh token triggers reuse detection and revokes ALL sessions
    client.cookies.set(settings.refresh_cookie_name, old_refresh_token, path="/api/v1/auth")
    client.cookies.set(settings.csrf_cookie_name, new_csrf, path="/api/v1/auth")
    reuse_res = client.post(
        "/api/v1/auth/refresh",
        headers={"X-CSRF-Token": new_csrf},
    )
    assert reuse_res.status_code == 401
    assert reuse_res.json()["error"]["code"] == "refresh_token_reuse"

    with session_factory() as db:
        active_sessions = list(
            db.scalars(select(AdminSession).where(AdminSession.revoked_at.is_(None))).all()
        )
        assert active_sessions == []


def test_refresh_duplicate_cookie_ordering_and_reuse_regression(
    auth_client: tuple[TestClient, sessionmaker[Session], Settings],
) -> None:
    client, session_factory, settings = auth_client
    _seed_admin(session_factory)

    login_res = client.post(
        "/api/v1/auth/login",
        json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD},
    )
    assert login_res.status_code == 200
    token_1 = client.cookies.get(settings.refresh_cookie_name)
    csrf_1 = login_res.json()["csrf_token"]

    # Rotate to get token_2 (active) while token_1 is now revoked
    rotate_res = client.post(
        "/api/v1/auth/refresh",
        headers={"X-CSRF-Token": csrf_1, "Origin": "http://localhost:3000"},
    )
    assert rotate_res.status_code == 200
    token_2 = client.cookies.get(settings.refresh_cookie_name)
    csrf_2 = rotate_res.json()["csrf_token"]
    assert token_1 != token_2

    # Case 1: Replayed/revoked cookie precedes active cookie in Cookie header.
    # Starlette's request.cookies.get() would pick token_2 if blindly updated left-to-right.
    client.cookies.clear()
    res_case1 = client.post(
        "/api/v1/auth/refresh",
        headers={
            "X-CSRF-Token": csrf_2,
            "Cookie": f"{settings.csrf_cookie_name}={csrf_2}; {settings.refresh_cookie_name}={token_1}; {settings.refresh_cookie_name}={token_2}",
        },
    )
    assert res_case1.status_code == 401
    assert res_case1.json()["error"]["code"] == "refresh_token_reuse"

    with session_factory() as db:
        active_sessions = list(
            db.scalars(select(AdminSession).where(AdminSession.revoked_at.is_(None))).all()
        )
        assert active_sessions == []

    # Re-login and re-rotate for Case 2
    login_res_2 = client.post(
        "/api/v1/auth/login",
        json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD},
    )
    token_3 = client.cookies.get(settings.refresh_cookie_name)
    csrf_3 = login_res_2.json()["csrf_token"]
    rotate_res_2 = client.post(
        "/api/v1/auth/refresh",
        headers={"X-CSRF-Token": csrf_3, "Origin": "http://localhost:3000"},
    )
    token_4 = client.cookies.get(settings.refresh_cookie_name)
    csrf_4 = rotate_res_2.json()["csrf_token"]

    # Case 2: Active cookie precedes replayed/revoked cookie in Cookie header.
    client.cookies.clear()
    res_case2 = client.post(
        "/api/v1/auth/refresh",
        headers={
            "X-CSRF-Token": csrf_4,
            "Cookie": f"{settings.csrf_cookie_name}={csrf_4}; {settings.refresh_cookie_name}={token_4}; {settings.refresh_cookie_name}={token_3}",
        },
    )
    assert res_case2.status_code == 401
    assert res_case2.json()["error"]["code"] == "refresh_token_reuse"

    with session_factory() as db:
        active_sessions = list(
            db.scalars(select(AdminSession).where(AdminSession.revoked_at.is_(None))).all()
        )
        assert active_sessions == []

    # Case 3: Multiple unknown/conflicting cookies without revoked token -> invalid_refresh_session
    client.cookies.clear()
    res_case3 = client.post(
        "/api/v1/auth/refresh",
        headers={
            "X-CSRF-Token": csrf_4,
            "Cookie": f"{settings.csrf_cookie_name}={csrf_4}; {settings.refresh_cookie_name}=unknown_token_a; {settings.refresh_cookie_name}=unknown_token_b",
        },
    )
    assert res_case3.status_code == 401
    assert res_case3.json()["error"]["code"] == "invalid_refresh_session"


def test_expired_refresh_session_rejected_and_revoked(
    auth_client: tuple[TestClient, sessionmaker[Session], Settings],
) -> None:
    client, session_factory, settings = auth_client
    admin = _seed_admin(session_factory)

    raw_expired_token = secrets.token_urlsafe(48)
    csrf_value = secrets.token_urlsafe(32)
    with session_factory() as db:
        expired_session = AdminSession(
            admin_user_id=admin.id,
            refresh_token_hash=hash_refresh_token(raw_expired_token),
            expires_at=datetime.now(timezone.utc) - timedelta(minutes=1),
        )
        db.add(expired_session)
        db.commit()
        expired_id = expired_session.id

    client.cookies.set(settings.refresh_cookie_name, raw_expired_token, path="/api/v1/auth")
    client.cookies.set(settings.csrf_cookie_name, csrf_value, path="/api/v1/auth")

    res = client.post("/api/v1/auth/refresh", headers={"X-CSRF-Token": csrf_value})
    assert res.status_code == 401

    with session_factory() as db:
        refreshed = db.scalar(select(AdminSession).where(AdminSession.id == expired_id))
        assert refreshed is not None
        assert refreshed.revoked_at is not None


def test_csrf_protection_enforced_on_refresh_and_logout(
    auth_client: tuple[TestClient, sessionmaker[Session], Settings],
) -> None:
    client, session_factory, settings = auth_client
    _seed_admin(session_factory)

    login_res = client.post(
        "/api/v1/auth/login",
        json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD},
    )
    csrf_token = login_res.json()["csrf_token"]

    # Missing X-CSRF-Token header
    assert client.post("/api/v1/auth/refresh").status_code == 403
    assert client.post("/api/v1/auth/logout").status_code == 403

    # Mismatched X-CSRF-Token header
    assert (
        client.post("/api/v1/auth/refresh", headers={"X-CSRF-Token": "wrong-token"}).status_code
        == 403
    )

    # Disallowed Origin header even with valid CSRF token
    assert (
        client.post(
            "/api/v1/auth/refresh",
            headers={
                "X-CSRF-Token": csrf_token,
                "Origin": "https://attacker.example.com",
            },
        ).status_code
        == 403
    )


def test_logout_session_listing_and_revocation(
    auth_client: tuple[TestClient, sessionmaker[Session], Settings],
) -> None:
    client, session_factory, settings = auth_client
    _seed_admin(session_factory)

    login_1 = client.post(
        "/api/v1/auth/login",
        json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD},
        headers={"User-Agent": "Agent-1"},
    )
    assert login_1.status_code == 200
    token_1 = login_1.json()["access_token"]
    csrf_1 = login_1.json()["csrf_token"]
    refresh_1 = client.cookies.get(settings.refresh_cookie_name)
    assert refresh_1 is not None

    # Second login creates a second concurrent session
    login_2 = client.post(
        "/api/v1/auth/login",
        json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD},
        headers={"User-Agent": "Agent-2"},
    )
    assert login_2.status_code == 200
    token_2 = login_2.json()["access_token"]
    csrf_2 = login_2.json()["csrf_token"]

    # List active sessions (refresh_token_hash must not be exposed)
    sessions_res = client.get(
        "/api/v1/auth/sessions",
        headers={"Authorization": f"Bearer {token_2}"},
    )
    assert sessions_res.status_code == 200
    sessions_list = sessions_res.json()["sessions"]
    assert len(sessions_list) == 2
    assert "refresh_token_hash" not in sessions_list[0]

    # Revoke first session by ID
    first_session_id = next(
        item["id"] for item in sessions_list if item["user_agent"] == "Agent-1"
    )
    del_res = client.delete(
        f"/api/v1/auth/sessions/{first_session_id}",
        headers={"Authorization": f"Bearer {token_2}"},
    )
    assert del_res.status_code == 200
    assert (
        client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token_1}"}).status_code
        == 401
    )

    # Unknown session ID returns 404
    assert (
        client.delete(
            f"/api/v1/auth/sessions/{uuid.uuid4()}",
            headers={"Authorization": f"Bearer {token_2}"},
        ).status_code
        == 404
    )

    # Logout current (second) session clears cookies, revokes session, and invalidates its JWT
    logout_res = client.post(
        "/api/v1/auth/logout",
        headers={"X-CSRF-Token": csrf_2},
    )
    assert logout_res.status_code == 200
    assert logout_res.json()["revoked_sessions"] == 1
    assert client.cookies.get(settings.refresh_cookie_name) is None
    assert (
        client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token_2}"}).status_code
        == 401
    )

    # Subsequent refresh attempt using revoked token_1 fails
    client.cookies.clear()
    client.cookies.set(settings.refresh_cookie_name, refresh_1, path="/api/v1/auth")
    client.cookies.set(settings.csrf_cookie_name, csrf_1, path="/api/v1/auth")
    assert client.post("/api/v1/auth/refresh", headers={"X-CSRF-Token": csrf_1}).status_code == 401

    # New logins then logout-all revokes all active sessions at once and invalidates their JWTs
    client.post("/api/v1/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
    login_4 = client.post(
        "/api/v1/auth/login",
        json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD},
    )
    token_4 = login_4.json()["access_token"]
    logout_all_res = client.post(
        "/api/v1/auth/logout-all",
        headers={"Authorization": f"Bearer {token_4}"},
    )
    assert logout_all_res.status_code == 200
    assert logout_all_res.json()["revoked_sessions"] == 2
    assert token_1 != token_4
    assert (
        client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token_4}"}).status_code
        == 401
    )


def test_cli_create_admin_interactive_and_single_admin_guard(
    auth_client: tuple[TestClient, sessionmaker[Session], Settings],
    monkeypatch: pytest.MonkeyPatch,
    capsys: pytest.CaptureFixture[str],
) -> None:
    _client, session_factory, settings = auth_client

    inputs = iter([ADMIN_EMAIL, ADMIN_NAME])
    passwords = iter([ADMIN_PASSWORD, ADMIN_PASSWORD])
    monkeypatch.setattr("builtins.input", lambda _prompt="": next(inputs))
    monkeypatch.setattr("getpass.getpass", lambda _prompt="": next(passwords))
    monkeypatch.setattr(create_admin_cli, "get_settings", lambda: settings)
    monkeypatch.setattr(create_admin_cli, "get_session_factory", lambda _s: session_factory)
    monkeypatch.setattr(create_admin_cli, "close_db", lambda: None)

    exit_code = create_admin_cli.main()
    assert exit_code == 0
    out = capsys.readouterr().out
    assert ADMIN_EMAIL in out
    assert ADMIN_PASSWORD not in out

    # Running CLI a second time refuses to create a second administrator
    inputs_2 = iter(["second@example.com", "Second Admin"])
    passwords_2 = iter([ADMIN_PASSWORD, ADMIN_PASSWORD])
    monkeypatch.setattr("builtins.input", lambda _prompt="": next(inputs_2))
    monkeypatch.setattr("getpass.getpass", lambda _prompt="": next(passwords_2))

    exit_code_2 = create_admin_cli.main()
    assert exit_code_2 == 1
    err = capsys.readouterr().err
    assert "already exists" in err


def test_session_family_logout_race_and_multi_device_isolation(
    auth_client: tuple[TestClient, sessionmaker[Session], Settings],
) -> None:
    """Verify session-family coordination during refresh/logout races preserves multi-device isolation."""
    client, session_factory, settings = auth_client
    _seed_admin(session_factory)

    # 1. Device A logs in
    login_a = client.post(
        "/api/v1/auth/login",
        json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD},
        headers={"User-Agent": "Device-A"},
    )
    assert login_a.status_code == 200
    token_a1 = login_a.json()["access_token"]
    csrf_a1 = login_a.json()["csrf_token"]
    refresh_a1 = client.cookies.get(settings.refresh_cookie_name)
    assert refresh_a1 is not None

    # 2. Device B logs in
    login_b = client.post(
        "/api/v1/auth/login",
        json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD},
        headers={"User-Agent": "Device-B"},
    )
    assert login_b.status_code == 200
    token_b1 = login_b.json()["access_token"]
    csrf_b1 = login_b.json()["csrf_token"]
    refresh_b1 = client.cookies.get(settings.refresh_cookie_name)
    assert refresh_b1 is not None

    with session_factory() as db:
        sessions = list(db.scalars(select(AdminSession).order_by(AdminSession.created_at)).all())
        assert len(sessions) == 2
        assert sessions[0].family_id != sessions[1].family_id
        family_a = sessions[0].family_id
        family_b = sessions[1].family_id

    # 3. Device A rotates its refresh token (Session A1 -> Session A2)
    client.cookies.clear()
    client.cookies.set(settings.refresh_cookie_name, refresh_a1, domain="testserver.local", path="/api/v1/auth")
    client.cookies.set(settings.csrf_cookie_name, csrf_a1, domain="testserver.local", path="/api/v1/auth")
    rotate_a = client.post(
        "/api/v1/auth/refresh",
        headers={"X-CSRF-Token": csrf_a1, "Origin": "http://localhost:3000"},
    )
    assert rotate_a.status_code == 200
    token_a2 = rotate_a.json()["access_token"]
    refresh_a2 = rotate_a.cookies.get(settings.refresh_cookie_name)
    assert refresh_a2 is not None
    assert refresh_a2 != refresh_a1

    with session_factory() as db:
        sess_a2 = db.scalar(
            select(AdminSession).where(
                AdminSession.refresh_token_hash == hash_refresh_token(refresh_a2)
            )
        )
        assert sess_a2 is not None
        assert sess_a2.family_id == family_a
        assert sess_a2.revoked_at is None

    # 4. Refresh/logout race: Device A sends logout carrying OLD refresh_a1
    client.cookies.clear()
    client.cookies.set(settings.refresh_cookie_name, refresh_a1, domain="testserver.local", path="/api/v1/auth")
    client.cookies.set(settings.csrf_cookie_name, csrf_a1, domain="testserver.local", path="/api/v1/auth")
    logout_race_res = client.post(
        "/api/v1/auth/logout",
        headers={"X-CSRF-Token": csrf_a1},
    )
    assert logout_race_res.status_code == 200
    # Because refresh_a1 belongs to family_a, active replacement session A2 was revoked!
    assert logout_race_res.json()["revoked_sessions"] >= 1

    # 5. Device A's new access token (token_a2) is now revoked!
    assert (
        client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token_a2}"}).status_code
        == 401
    )

    # 6. Device B remains fully active and unaffected (multi-device isolation preserved)
    me_b = client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token_b1}"})
    assert me_b.status_code == 200
    assert me_b.json()["email"] == ADMIN_EMAIL

    # Device B can still rotate its own session
    client.cookies.clear()
    client.cookies.set(settings.refresh_cookie_name, refresh_b1, domain="testserver.local", path="/api/v1/auth")
    client.cookies.set(settings.csrf_cookie_name, csrf_b1, domain="testserver.local", path="/api/v1/auth")
    rotate_b = client.post(
        "/api/v1/auth/refresh",
        headers={"X-CSRF-Token": csrf_b1, "Origin": "http://localhost:3000"},
    )
    assert rotate_b.status_code == 200
    token_b2 = rotate_b.json()["access_token"]
    assert token_b2 != token_b1

