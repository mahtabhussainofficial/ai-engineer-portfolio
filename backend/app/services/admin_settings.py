"""Admin site settings CRUD and public-visibility management service."""

from __future__ import annotations

import uuid
from typing import Any

from fastapi import status
from pydantic import ValidationError
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.core.exceptions import AppError, ConflictError, NotFoundError
from app.models.admin import AdminUser
from app.models.site_setting import SiteSetting
from app.schemas.site_setting import (
    SiteSettingCreate,
    SiteSettingUpdate,
    SiteSettingVisibilityUpdate,
    ensure_public_setting_allowed,
    validate_site_setting_value,
)
from app.services.common import (
    commit_or_conflict,
    ensure_media_ids_exist,
    ensure_non_null_patch_fields,
    paginate_query,
    sanitize_pydantic_errors,
)

_SETTING_SORT_COLUMNS = {
    "key": SiteSetting.key,
    "category": SiteSetting.category,
    "updated_at": SiteSetting.updated_at,
}


def _ensure_public_policy(key: str, is_public: bool) -> None:
    try:
        ensure_public_setting_allowed(key, is_public)
    except ValueError as exc:
        raise AppError(
            str(exc),
            code="forbidden_public_setting",
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
        ) from exc


def _validate_setting_payload(key: str, value: dict[str, Any]) -> dict[str, Any]:
    try:
        return validate_site_setting_value(key, value)
    except ValidationError as exc:
        raise AppError(
            f"Validation failed for setting '{key}'.",
            code="validation_error",
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            details=sanitize_pydantic_errors(exc),
        ) from exc


def _validate_setting_media_references(
    db: Session,
    *,
    key: str,
    value: dict[str, Any] | None,
    portrait_media_id: uuid.UUID | None,
) -> None:
    media_ids: list[uuid.UUID] = []
    if portrait_media_id is not None:
        media_ids.append(portrait_media_id)

    if key == "site_general" and isinstance(value, dict) and value.get("logo_media_id") is not None:
        try:
            logo_uuid = uuid.UUID(str(value["logo_media_id"]))
        except ValueError as exc:
            raise AppError(
                "Invalid logo_media_id UUID in site_general setting.",
                code="invalid_reference",
                status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            ) from exc
        media_ids.append(logo_uuid)

    ensure_media_ids_exist(db, media_ids)


def _get_setting_with_media(db: Session, key: str) -> SiteSetting:
    setting = db.scalar(
        select(SiteSetting)
        .options(selectinload(SiteSetting.portrait_media))
        .where(SiteSetting.key == key)
    )
    if setting is None:
        raise NotFoundError(f"Site setting '{key}' was not found.")
    return setting


def list_site_settings(
    db: Session,
    *,
    category: str | None = None,
    is_public: bool | None = None,
    page: int = 1,
    page_size: int = 50,
    sort_by: str = "key",
    sort_order: str = "asc",
) -> tuple[list[SiteSetting], int]:
    """List site settings with optional category/visibility filters and pagination."""
    stmt = select(SiteSetting).options(selectinload(SiteSetting.portrait_media))
    if category is not None:
        stmt = stmt.where(SiteSetting.category == category.strip())
    if is_public is not None:
        stmt = stmt.where(SiteSetting.is_public.is_(is_public))

    return paginate_query(
        db,
        stmt,
        page=page,
        page_size=page_size,
        sort_by=sort_by,
        sort_order=sort_order,
        sort_columns=_SETTING_SORT_COLUMNS,
        tie_breaker=SiteSetting.key,
    )


def get_site_setting(db: Session, key: str) -> SiteSetting:
    """Retrieve a single site setting by key with eager-loaded portrait media."""
    return _get_setting_with_media(db, key)


def create_site_setting(
    db: Session,
    payload: SiteSettingCreate,
    *,
    admin: AdminUser,
) -> SiteSetting:
    """Create a keyed site setting enforcing public whitelist, typed values, and media refs."""
    existing = db.scalar(select(SiteSetting.id).where(SiteSetting.key == payload.key))
    if existing is not None:
        raise ConflictError(f"Site setting '{payload.key}' already exists.")

    _ensure_public_policy(payload.key, payload.is_public)
    normalized_value = _validate_setting_payload(payload.key, payload.value)
    _validate_setting_media_references(
        db,
        key=payload.key,
        value=normalized_value,
        portrait_media_id=payload.portrait_media_id,
    )

    setting = SiteSetting(
        key=payload.key,
        label=payload.label,
        category=payload.category,
        description=payload.description,
        value=normalized_value,
        is_public=payload.is_public,
        portrait_media_id=payload.portrait_media_id,
        updated_by_id=admin.id,
    )
    db.add(setting)
    commit_or_conflict(db, f"Site setting '{payload.key}' already exists.")
    db.expire(setting)
    return _get_setting_with_media(db, setting.key)


def update_site_setting(
    db: Session,
    key: str,
    payload: SiteSettingUpdate,
    *,
    admin: AdminUser,
) -> SiteSetting:
    """Update setting metadata/value without altering `key` or `is_public` visibility."""
    setting = _get_setting_with_media(db, key)
    ensure_non_null_patch_fields(payload, ("label", "category", "value"))

    normalized_value: dict[str, Any] | None = None
    if "value" in payload.model_fields_set and payload.value is not None:
        normalized_value = _validate_setting_payload(setting.key, payload.value)

    next_portrait_id = (
        payload.portrait_media_id if "portrait_media_id" in payload.model_fields_set else None
    )
    _validate_setting_media_references(
        db,
        key=setting.key,
        value=normalized_value,
        portrait_media_id=next_portrait_id,
    )

    if "label" in payload.model_fields_set and payload.label is not None:
        setting.label = payload.label
    if "category" in payload.model_fields_set and payload.category is not None:
        setting.category = payload.category
    if "description" in payload.model_fields_set:
        setting.description = payload.description
    if "portrait_media_id" in payload.model_fields_set:
        setting.portrait_media_id = payload.portrait_media_id
    if normalized_value is not None:
        setting.value = normalized_value

    setting.updated_by_id = admin.id
    commit_or_conflict(db, f"Site setting '{key}' update conflicted with existing data.")
    db.expire(setting)
    return _get_setting_with_media(db, setting.key)


def update_site_setting_visibility(
    db: Session,
    key: str,
    payload: SiteSettingVisibilityUpdate,
    *,
    admin: AdminUser,
) -> SiteSetting:
    """Intentionally publish or unpublish a whitelisted setting after full value validation."""
    setting = _get_setting_with_media(db, key)
    _ensure_public_policy(setting.key, payload.is_public)

    if payload.is_public:
        normalized_value = _validate_setting_payload(setting.key, setting.value)
        _validate_setting_media_references(
            db,
            key=setting.key,
            value=normalized_value,
            portrait_media_id=setting.portrait_media_id,
        )
        setting.value = normalized_value

    setting.is_public = payload.is_public
    setting.updated_by_id = admin.id
    commit_or_conflict(db, f"Site setting '{key}' visibility update conflicted.")
    db.expire(setting)
    return _get_setting_with_media(db, setting.key)
