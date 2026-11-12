"""Shared Pydantic v2 base classes, health schemas, and error envelope schemas."""

from __future__ import annotations

import uuid
from datetime import datetime
from typing import Any, Literal

from pydantic import BaseModel, ConfigDict, Field


class AppBaseSchema(BaseModel):
    """Base schema with consistent ORM mapping and whitespace trimming."""

    model_config = ConfigDict(
        from_attributes=True,
        str_strip_whitespace=True,
    )


class UUIDTimestampSchema(AppBaseSchema):
    """Base read schema containing UUID primary key and audit timestamps."""

    id: uuid.UUID
    created_at: datetime
    updated_at: datetime


class DatabaseHealth(AppBaseSchema):
    """Database connectivity status reported by health endpoints."""

    configured: bool
    connected: bool
    status: Literal["connected", "disconnected", "not_configured"]
    latency_ms: float | None = None
    detail: str | None = None


class HealthCheckResponse(AppBaseSchema):
    """Top-level API health check response payload."""

    status: Literal["ok", "degraded"]
    service: str
    version: str
    environment: str
    timestamp: datetime
    database: DatabaseHealth


class ErrorDetail(AppBaseSchema):
    """Structured error body returned by exception handlers."""

    code: str
    message: str
    request_id: str | None = None
    details: Any = Field(default=None)


class ErrorResponse(AppBaseSchema):
    """Top-level error response envelope."""

    error: ErrorDetail
