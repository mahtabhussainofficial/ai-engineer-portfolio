"""Tests for FastAPI bootstrap, health endpoints, CORS, and error handling."""

from __future__ import annotations

from fastapi.testclient import TestClient


def test_health_endpoint_when_db_unconfigured(client_without_db: TestClient) -> None:
    response = client_without_db.get("/api/v1/health")
    assert response.status_code == 200
    payload = response.json()
    assert payload["status"] == "degraded"
    assert payload["environment"] == "test"
    assert payload["database"]["configured"] is False
    assert payload["database"]["connected"] is False
    assert payload["database"]["status"] == "not_configured"
    assert "X-Request-ID" in response.headers


def test_root_health_endpoint_works(client_without_db: TestClient) -> None:
    response = client_without_db.get("/health")
    assert response.status_code == 200
    assert response.json()["database"]["status"] == "not_configured"


def test_db_readiness_returns_503_when_unconfigured(client_without_db: TestClient) -> None:
    response = client_without_db.get("/api/v1/health/db")
    assert response.status_code == 503
    payload = response.json()
    assert payload["error"]["code"] == "database_unavailable"
    assert payload["error"]["request_id"] == response.headers["X-Request-ID"]


def test_health_and_db_readiness_when_connected(client_with_db: TestClient) -> None:
    health_res = client_with_db.get("/api/v1/health")
    assert health_res.status_code == 200
    health_payload = health_res.json()
    assert health_payload["status"] == "ok"
    assert health_payload["database"]["configured"] is True
    assert health_payload["database"]["connected"] is True
    assert health_payload["database"]["status"] == "connected"
    assert isinstance(health_payload["database"]["latency_ms"], float)

    db_res = client_with_db.get("/api/v1/health/db")
    assert db_res.status_code == 200
    assert db_res.json()["connected"] is True


def test_cors_allows_nextjs_local_origin(client_without_db: TestClient) -> None:
    response = client_without_db.options(
        "/api/v1/health",
        headers={
            "Origin": "http://localhost:3000",
            "Access-Control-Request-Method": "GET",
        },
    )
    assert response.status_code == 200
    assert response.headers["access-control-allow-origin"] == "http://localhost:3000"


def test_request_id_and_http_error_envelope(client_without_db: TestClient) -> None:
    response = client_without_db.get(
        "/api/v1/does-not-exist",
        headers={"X-Request-ID": "req-test-123"},
    )
    assert response.status_code == 404
    assert response.headers["X-Request-ID"] == "req-test-123"
    payload = response.json()
    assert payload["error"]["code"] == "http_error"
    assert payload["error"]["request_id"] == "req-test-123"


def test_security_headers_present_on_responses(client_without_db: TestClient) -> None:
    """Standard security headers must be injected on HTTP responses."""
    res = client_without_db.get("/api/v1/health")
    assert res.headers.get("X-Content-Type-Options") == "nosniff"
    assert res.headers.get("X-Frame-Options") == "DENY"
    assert res.headers.get("Referrer-Policy") == "strict-origin-when-cross-origin"
    assert "X-Request-ID" in res.headers
