"""Shared query, validation, and transaction helpers for admin CMS services."""

from __future__ import annotations

import uuid
from collections.abc import Iterable, Mapping, Sequence
from datetime import datetime, timezone
from typing import Any, TypeVar

from fastapi import status
from pydantic import BaseModel, ValidationError
from sqlalchemy import Select, asc, desc, func, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import InstrumentedAttribute, Session, selectinload

from app.core.exceptions import AppError, ConflictError, NotFoundError
from app.models.enums import PublishStatus
from app.models.media import MediaAsset

ModelT = TypeVar("ModelT")


def utc_now() -> datetime:
    """Return a timezone-aware UTC timestamp."""
    return datetime.now(timezone.utc)


def sanitize_pydantic_errors(exc: ValidationError) -> list[dict[str, Any]]:
    """Convert Pydantic validation errors into JSON-safe detail dictionaries."""
    return exc.errors(include_url=False, include_context=False)


def paginate_query(
    db: Session,
    stmt: Select[tuple[ModelT]],
    *,
    page: int,
    page_size: int,
    sort_by: str,
    sort_order: str,
    sort_columns: Mapping[str, Any],
    tie_breaker: Any | None = None,
) -> tuple[list[ModelT], int]:
    """Execute a count query and return paginated, sorted ORM rows."""
    sort_col = sort_columns.get(sort_by)
    if sort_col is None:
        raise AppError(
            f"Unsupported sort field '{sort_by}'.",
            code="invalid_sort",
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
        )

    total = db.scalar(select(func.count()).select_from(stmt.order_by(None).subquery())) or 0
    order_expr = desc(sort_col) if sort_order == "desc" else asc(sort_col)
    ordered_stmt = stmt.order_by(order_expr)
    if tie_breaker is not None:
        ordered_stmt = ordered_stmt.order_by(asc(tie_breaker))

    offset = (page - 1) * page_size
    items = list(db.scalars(ordered_stmt.offset(offset).limit(page_size)).all())
    return items, int(total)


def get_record_or_404(
    db: Session,
    model_cls: type[ModelT],
    record_id: uuid.UUID,
    *,
    not_found_message: str,
    media_relation: InstrumentedAttribute[Any] | None = None,
) -> ModelT:
    """Fetch a single record by primary key with optional media eager loading."""
    stmt = select(model_cls).where(model_cls.id == record_id)  # type: ignore[attr-defined]
    if media_relation is not None:
        stmt = stmt.options(selectinload(media_relation))
    record = db.scalar(stmt)
    if record is None:
        raise NotFoundError(not_found_message)
    return record


def ensure_media_exists(db: Session, media_id: uuid.UUID) -> None:
    """Verify a referenced media asset exists before saving a foreign key."""
    existing_id = db.scalar(select(MediaAsset.id).where(MediaAsset.id == media_id))
    if existing_id is None:
        raise AppError(
            "Referenced media asset was not found.",
            code="invalid_reference",
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
        )


def ensure_non_null_patch_fields(payload: BaseModel, required_fields: Iterable[str]) -> None:
    """Reject explicit `null` values on required columns during partial updates."""
    for field_name in required_fields:
        if field_name in payload.model_fields_set and getattr(payload, field_name) is None:
            raise AppError(
                f"Field '{field_name}' cannot be null.",
                code="validation_error",
                status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            )


def commit_or_conflict(db: Session, conflict_message: str) -> None:
    """Commit the active transaction or convert integrity conflicts into 409 Conflict."""
    try:
        db.commit()
    except IntegrityError as exc:
        db.rollback()
        raise ConflictError(conflict_message) from exc
    # Clear cached relationship state in identity map so subsequent selectinload queries reflect FK edits.
    db.expire_all()


def set_publish_state(record: Any, publish: bool) -> None:
    """Apply explicit publish or draft state transitions with server timestamps."""
    if publish:
        record.publish_status = PublishStatus.PUBLISHED.value
        if record.published_at is None:
            record.published_at = utc_now()
    else:
        record.publish_status = PublishStatus.DRAFT.value


def apply_publish_fields_on_create(record: Any, publish_status: PublishStatus, published_at: datetime | None) -> None:
    """Normalize initial publish status and server timestamp on creation."""
    record.publish_status = publish_status.value
    if publish_status == PublishStatus.PUBLISHED and published_at is None:
        record.published_at = utc_now()
    else:
        record.published_at = published_at


def apply_publish_fields_on_patch(record: Any, payload: BaseModel) -> None:
    """Apply publish_status and published_at updates consistently on partial update."""
    if "published_at" in payload.model_fields_set:
        record.published_at = getattr(payload, "published_at")
    if "publish_status" in payload.model_fields_set:
        next_status: PublishStatus = getattr(payload, "publish_status")
        record.publish_status = next_status.value
        if next_status == PublishStatus.PUBLISHED and record.published_at is None:
            record.published_at = utc_now()
