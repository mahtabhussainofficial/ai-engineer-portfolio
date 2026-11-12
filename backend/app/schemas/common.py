"""Shared Pydantic v2 base classes, validators, pagination, health, and error schemas."""

from __future__ import annotations

import math
import uuid
from datetime import datetime
from typing import Annotated, Any, Generic, Literal, TypeVar
from urllib.parse import urlparse

from pydantic import AfterValidator, BaseModel, ConfigDict, Field

T = TypeVar("T")


class AppBaseSchema(BaseModel):
    """Base schema with consistent ORM mapping and whitespace trimming."""

    model_config = ConfigDict(
        from_attributes=True,
        str_strip_whitespace=True,
    )


class AppWriteSchema(AppBaseSchema):
    """Strict base schema for incoming write payloads preventing extra fields."""

    model_config = ConfigDict(
        from_attributes=False,
        str_strip_whitespace=True,
        extra="forbid",
    )


def validate_asset_url(value: str) -> str:
    """Allow only http(s) URLs with a valid host or safe root-relative `/...` asset paths."""
    if not value or any(ch.isspace() for ch in value):
        raise ValueError("Asset URL must not be empty or contain whitespace.")

    if value.startswith("/"):
        if value.startswith("//"):
            raise ValueError("Protocol-relative URLs ('//...') are not permitted.")
        return value

    parsed = urlparse(value)
    if parsed.scheme in ("https", "http") and bool(parsed.netloc):
        return value

    raise ValueError("URL must be an http(s) URL or root-relative path starting with '/'.")


def validate_link_href(value: str) -> str:
    """Validate navigation/CTA links (http(s), root-relative `/`, `#anchor`, or `mailto:`)."""
    if not value or any(ch.isspace() for ch in value):
        raise ValueError("Link href must not be empty or contain whitespace.")

    if value.startswith("/"):
        if value.startswith("//"):
            raise ValueError("Protocol-relative URLs ('//...') are not permitted.")
        return value

    if value.startswith("#"):
        if len(value) < 2:
            raise ValueError("Anchor link must include a target fragment after '#'.")
        return value

    if value.startswith("mailto:"):
        recipient = value[len("mailto:") :]
        if "@" not in recipient or "." not in recipient.split("@", 1)[-1]:
            raise ValueError("mailto link must contain a valid email address.")
        return value

    parsed = urlparse(value)
    if parsed.scheme in ("https", "http") and bool(parsed.netloc):
        return value

    raise ValueError(
        "Link href must be an http(s) URL, root-relative '/' path, '#anchor', or 'mailto:'."
    )


SafeAssetUrl = Annotated[str, AfterValidator(validate_asset_url)]
SafeLinkHref = Annotated[str, AfterValidator(validate_link_href)]


class UUIDTimestampSchema(AppBaseSchema):
    """Base read schema containing UUID primary key and audit timestamps."""

    id: uuid.UUID
    created_at: datetime
    updated_at: datetime


class PaginationParams(AppWriteSchema):
    """Validated pagination query parameters."""

    page: int = Field(default=1, ge=1, le=1000)
    page_size: int = Field(default=20, ge=1, le=100)


class PaginatedResponse(AppBaseSchema, Generic[T]):
    """Generic paginated collection response wrapper."""

    items: list[T]
    total: int = Field(ge=0)
    page: int = Field(ge=1)
    page_size: int = Field(ge=1)
    total_pages: int = Field(ge=0)

    @classmethod
    def create(
        cls,
        *,
        items: list[T],
        total: int,
        page: int,
        page_size: int,
    ) -> PaginatedResponse[T]:
        """Construct a paginated envelope with calculated total pages."""
        total_pages = math.ceil(total / page_size) if total > 0 else 0
        return cls(
            items=items,
            total=total,
            page=page,
            page_size=page_size,
            total_pages=total_pages,
        )


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
