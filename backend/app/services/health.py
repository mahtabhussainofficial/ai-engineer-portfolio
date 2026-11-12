"""Health and database readiness inspection services."""

from __future__ import annotations

from datetime import datetime, timezone

from app.core.config import Settings
from app.core.exceptions import DatabaseUnavailableError
from app.db.session import check_database_connection
from app.schemas.common import DatabaseHealth, HealthCheckResponse


def build_health_response(settings: Settings) -> HealthCheckResponse:
    """Build service health payload including non-fatal database status."""
    db_result = check_database_connection(settings)
    db_health = DatabaseHealth(
        configured=db_result.configured,
        connected=db_result.connected,
        status=db_result.status,  # type: ignore[arg-type]
        latency_ms=db_result.latency_ms,
        detail=db_result.detail,
    )
    overall_status = "ok" if db_result.connected else "degraded"
    return HealthCheckResponse(
        status=overall_status,
        service=settings.app_name,
        version=settings.app_version,
        environment=settings.environment,
        timestamp=datetime.now(timezone.utc),
        database=db_health,
    )


def check_database_readiness(settings: Settings) -> DatabaseHealth:
    """Verify database connectivity strictly, raising 503 if unavailable."""
    db_result = check_database_connection(settings)
    if not db_result.connected:
        raise DatabaseUnavailableError(
            db_result.detail or "Database connectivity check failed."
        )
    return DatabaseHealth(
        configured=db_result.configured,
        connected=db_result.connected,
        status=db_result.status,  # type: ignore[arg-type]
        latency_ms=db_result.latency_ms,
        detail=db_result.detail,
    )
