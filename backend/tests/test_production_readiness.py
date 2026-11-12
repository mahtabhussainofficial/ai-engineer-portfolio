"""Production-readiness tests for session binding, rate limiting, config guardrails, and HTTP hygiene."""

from __future__ import annotations

import uuid
from datetime import datetime, timedelta, timezone

import jwt
import pytest
from fastapi.testclient import TestClient

from app.core.config import Settings
from app.core.exceptions import AuthenticationError
from app.core.rate_limit import SlidingWindowRateLimiter
from app.core.security import decode_access_token
from app.main import create_application

_STRONG_SECRET = "0123456789abcdef0123456789abcdef0123456789abcdef"


def _prod_settings(**overrides: object) -> Settings:
    defaults: dict[str, object] = {
        "_env_file": None,
        "environment": "production",
        "debug": False,
        "secret_key": _STRONG_SECRET,
        "database_url": "sqlite:///:memory:",
        "cors_origins": ["https://portfolio.example.com"],
        "cors_allow_credentials": True,
    }
    defaults.update(overrides)
    return Settings(**defaults)  # type: ignore[arg-type]


def test_access_token_without_sid_claim_is_rejected(
    client_with_db: TestClient,
    configured_settings: Settings,
) -> None:
    """Tokens omitting the `sid` session claim must fail decoding and authentication."""
    now = datetime.now(timezone.utc)
    token = jwt.encode(
        {
            "sub": str(uuid.uuid4()),
            "type": "access",
            "jti": str(uuid.uuid4()),
            "iss": configured_settings.app_name,
            "iat": int(now.timestamp()),
            "nbf": int(now.timestamp()),
            "exp": int((now + timedelta(minutes=10)).timestamp()),
        },
        configured_settings.require_secret_key(),
        algorithm="HS256",
    )
    with pytest.raises(AuthenticationError):
        decode_access_token(token, configured_settings)

    res = client_with_db.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 401


def test_rate_limiter_bounds_memory_and_evicts_expired_keys(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """High-cardinality rate-limit keys must remain bounded and sweep expired buckets."""
    clock = [100.0]
    monkeypatch.setattr("app.core.rate_limit.time.monotonic", lambda: clock[0])

    limiter = SlidingWindowRateLimiter(max_keys=3)
    limiter.record("ip:1", window_seconds=10)
    limiter.record("ip:2", window_seconds=10)
    limiter.record("ip:3", window_seconds=10)

    # Advance past expiry of ip:1..3 and record a fresh key; expired buckets are swept.
    clock[0] = 115.0
    limiter.record("ip:4", window_seconds=10)
    assert list(limiter._attempts.keys()) == ["ip:4"]

    # Fill to capacity and add one more while active; oldest active key is evicted.
    limiter.record("ip:5", window_seconds=10)
    limiter.record("ip:6", window_seconds=10)
    limiter.record("ip:7", window_seconds=10)
    assert len(limiter._attempts) == 3
    assert "ip:4" not in limiter._attempts
    assert set(limiter._attempts.keys()) == {"ip:5", "ip:6", "ip:7"}


@pytest.mark.parametrize(
    "overrides",
    [
        {"secret_key": None},
        {"secret_key": "CHANGE_ME_BEFORE_PHASE_2"},
        {"secret_key": "too-short"},
        {"debug": True},
        {"database_url": None, "postgres_password": None},
        {"cookie_secure": False},
        {"cors_origins": ["*"], "cors_allow_credentials": True},
    ],
)
def test_production_startup_fails_fast_on_unsafe_config(
    overrides: dict[str, object],
) -> None:
    """Production lifespan startup must reject insecure or incomplete configuration."""
    app = create_application(_prod_settings(**overrides))
    with pytest.raises(RuntimeError):
        with TestClient(app):
            pass


def test_production_app_hides_docs_and_sanitizes_request_id() -> None:
    """Production app disables OpenAPI docs and replaces malformed X-Request-ID headers."""
    app = create_application(_prod_settings())
    with TestClient(app) as client:
        assert client.get("/docs").status_code == 404
        assert client.get("/redoc").status_code == 404
        assert client.get("/api/v1/openapi.json").status_code == 404

        bad_header_res = client.get(
            "/health",
            headers={"X-Request-ID": "bad\nrequest id with spaces and way too long " + ("x" * 100)},
        )
        assert bad_header_res.status_code == 200
        returned_id = bad_header_res.headers["X-Request-ID"]
        uuid.UUID(returned_id)
