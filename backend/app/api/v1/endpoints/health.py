"""Health check and database readiness endpoints."""

from __future__ import annotations

from fastapi import APIRouter, Depends, status

from app.core.config import Settings, get_settings
from app.schemas.common import DatabaseHealth, ErrorResponse, HealthCheckResponse
from app.services.health import build_health_response, check_database_readiness

router = APIRouter(prefix="/health", tags=["Health"])


@router.get(
    "",
    response_model=HealthCheckResponse,
    status_code=status.HTTP_200_OK,
    summary="Service health check",
    description="Reports application liveness and current PostgreSQL connectivity status.",
)
def health_check(settings: Settings = Depends(get_settings)) -> HealthCheckResponse:
    """Return service health metadata and non-fatal database connectivity status."""
    return build_health_response(settings)


@router.get(
    "/db",
    response_model=DatabaseHealth,
    status_code=status.HTTP_200_OK,
    responses={
        status.HTTP_503_SERVICE_UNAVAILABLE: {
            "model": ErrorResponse,
            "description": "Database is unconfigured or unreachable.",
        }
    },
    summary="Database connectivity readiness check",
    description="Executes `SELECT 1` against PostgreSQL and returns 503 if unavailable.",
)
def database_health_check(settings: Settings = Depends(get_settings)) -> DatabaseHealth:
    """Strict readiness probe verifying database connectivity."""
    return check_database_readiness(settings)
