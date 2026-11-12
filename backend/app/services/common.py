"""Shared query, validation, publication-check, and transaction helpers for portfolio services."""

from __future__ import annotations

import uuid
from collections.abc import Iterable, Mapping
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
from app.models.project import Project
from app.models.testimonial import Testimonial
from app.schemas.project import ProjectCreate
from app.schemas.testimonial import TestimonialCreate

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


def supports_row_locks(db: Session) -> bool:
    """Return True when the active SQL dialect supports SELECT ... FOR UPDATE/SHARE locks."""
    bind = db.get_bind()
    return bind is not None and bind.dialect.name != "sqlite"


def ensure_media_ids_exist(db: Session, media_ids: Iterable[uuid.UUID]) -> None:
    """Verify referenced media assets exist and acquire shared locks in canonical order."""
    ordered_ids = sorted(set(media_ids))
    if not ordered_ids:
        return

    stmt = select(MediaAsset.id).where(MediaAsset.id.in_(ordered_ids)).order_by(MediaAsset.id)
    if supports_row_locks(db):
        stmt = stmt.with_for_update(read=True)

    found_ids = set(db.scalars(stmt).all())
    if len(found_ids) != len(ordered_ids):
        raise AppError(
            "Referenced media asset was not found.",
            code="invalid_reference",
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
        )


def ensure_media_exists(db: Session, media_id: uuid.UUID) -> None:
    """Verify a single referenced media asset exists before saving a reference."""
    ensure_media_ids_exist(db, (media_id,))


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


def _validate_publish_schema(
    schema_cls: type[BaseModel],
    payload: dict[str, Any],
    *,
    error_message: str,
) -> None:
    try:
        schema_cls.model_validate(payload)
    except ValidationError as exc:
        raise AppError(
            error_message,
            code="validation_error",
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            details=sanitize_pydantic_errors(exc),
        ) from exc


def _raise_publish_field_errors(
    error_message: str,
    errors: list[dict[str, Any]],
) -> None:
    raise AppError(
        error_message,
        code="validation_error",
        status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
        details=errors,
    )


def validate_project_for_publish(db: Session, project: Project) -> None:
    """Validate project schema fields, non-blank content, URLs, and cover media before publishing."""
    message = "Project does not meet publication requirements."
    _validate_publish_schema(
        ProjectCreate,
        {
            "slug": project.slug,
            "display_number": project.display_number,
            "title": project.title,
            "category": project.category,
            "home_category_label": project.home_category_label,
            "project_type": project.project_type,
            "publish_status": PublishStatus.PUBLISHED,
            "published_at": project.published_at,
            "featured": project.featured,
            "display_order": project.display_order,
            "summary": project.summary,
            "problem": project.problem,
            "solution": project.solution,
            "deliverables": list(project.deliverables or []),
            "tags": list(project.tags or []),
            "live_url": project.live_url,
            "repo_url": project.repo_url,
            "cover_media_id": project.cover_media_id,
        },
        error_message=message,
    )

    errors: list[dict[str, Any]] = []
    for field_name, min_len in (
        ("title", 2),
        ("category", 2),
        ("summary", 10),
        ("problem", 10),
        ("solution", 10),
    ):
        raw = getattr(project, field_name)
        if not isinstance(raw, str) or len(raw.strip()) < min_len:
            errors.append(
                {
                    "type": "string_too_short",
                    "loc": ["body", field_name],
                    "msg": f"Field '{field_name}' must contain at least {min_len} non-whitespace characters.",
                }
            )
    for list_field in ("deliverables", "tags"):
        items = getattr(project, list_field) or []
        if any(not isinstance(entry, str) or not entry.strip() for entry in items):
            errors.append(
                {
                    "type": "value_error",
                    "loc": ["body", list_field],
                    "msg": f"Field '{list_field}' cannot contain blank entries.",
                }
            )
    if errors:
        _raise_publish_field_errors(message, errors)

    if project.cover_media_id is not None:
        ensure_media_exists(db, project.cover_media_id)


def validate_testimonial_for_publish(db: Session, item: Testimonial) -> None:
    """Validate testimonial schema fields and required public-facing content before publishing."""
    message = "Testimonial does not meet publication requirements."
    _validate_publish_schema(
        TestimonialCreate,
        {
            "title": item.title,
            "author_name": item.author_name,
            "author_role": item.author_role,
            "quote": item.quote,
            "rating_score": item.rating_score,
            "rating_label": item.rating_label,
            "stars": item.stars,
            "source": item.source,
            "source_url": item.source_url,
            "avatar_media_id": item.avatar_media_id,
            "featured": item.featured,
            "publish_status": PublishStatus.PUBLISHED,
            "published_at": item.published_at,
            "display_order": item.display_order,
        },
        error_message=message,
    )

    errors: list[dict[str, Any]] = []
    for field_name, min_len in (
        ("title", 2),
        ("author_name", 1),
        ("quote", 1),
        ("rating_label", 1),
        ("source", 2),
    ):
        raw = getattr(item, field_name)
        if not isinstance(raw, str) or len(raw.strip()) < min_len:
            errors.append(
                {
                    "type": "value_error",
                    "loc": ["body", field_name],
                    "msg": f"Field '{field_name}' is required and cannot be blank when publishing.",
                }
            )
    if errors:
        _raise_publish_field_errors(message, errors)

    if item.avatar_media_id is not None:
        ensure_media_exists(db, item.avatar_media_id)
