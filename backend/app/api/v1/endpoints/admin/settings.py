"""Protected admin site settings CRUD and visibility management endpoints."""

from __future__ import annotations

from typing import Literal

from fastapi import APIRouter, Depends, Path, Query, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_admin
from app.db.session import get_db
from app.models.admin import AdminUser
from app.schemas.common import ErrorResponse, PaginatedResponse
from app.schemas.site_setting import (
    SiteSettingCreate,
    SiteSettingRead,
    SiteSettingUpdate,
    SiteSettingVisibilityUpdate,
)
from app.services.admin_settings import (
    create_site_setting,
    get_site_setting,
    list_site_settings,
    update_site_setting,
    update_site_setting_visibility,
)

router = APIRouter(prefix="/settings", tags=["Admin Site Settings"])

SettingKeyPath = str


@router.get(
    "",
    response_model=PaginatedResponse[SiteSettingRead],
    status_code=status.HTTP_200_OK,
    responses={status.HTTP_401_UNAUTHORIZED: {"model": ErrorResponse}},
    summary="List site settings",
)
def list_settings(
    category: str | None = Query(default=None, min_length=2, max_length=50),
    is_public: bool | None = Query(default=None),
    page: int = Query(default=1, ge=1, le=1000),
    page_size: int = Query(default=50, ge=1, le=100),
    sort_by: Literal["key", "category", "updated_at"] = Query(default="key"),
    sort_order: Literal["asc", "desc"] = Query(default="asc"),
    db: Session = Depends(get_db),
) -> PaginatedResponse[SiteSettingRead]:
    items, total = list_site_settings(
        db,
        category=category,
        is_public=is_public,
        page=page,
        page_size=page_size,
        sort_by=sort_by,
        sort_order=sort_order,
    )
    return PaginatedResponse.create(
        items=[SiteSettingRead.model_validate(item) for item in items],
        total=total,
        page=page,
        page_size=page_size,
    )


@router.post(
    "",
    response_model=SiteSettingRead,
    status_code=status.HTTP_201_CREATED,
    responses={
        status.HTTP_401_UNAUTHORIZED: {"model": ErrorResponse},
        status.HTTP_409_CONFLICT: {"model": ErrorResponse},
        status.HTTP_422_UNPROCESSABLE_CONTENT: {"model": ErrorResponse},
    },
    summary="Create site setting",
)
def create_setting(
    payload: SiteSettingCreate,
    current_admin: AdminUser = Depends(get_current_admin),
    db: Session = Depends(get_db),
) -> SiteSettingRead:
    created = create_site_setting(db, payload, admin=current_admin)
    return SiteSettingRead.model_validate(created)


@router.get(
    "/{key}",
    response_model=SiteSettingRead,
    status_code=status.HTTP_200_OK,
    responses={
        status.HTTP_401_UNAUTHORIZED: {"model": ErrorResponse},
        status.HTTP_404_NOT_FOUND: {"model": ErrorResponse},
    },
    summary="Retrieve a site setting by key",
)
def get_setting(
    key: str = Path(min_length=2, max_length=100, pattern=r"^[a-z0-9_.-]+$"),
    db: Session = Depends(get_db),
) -> SiteSettingRead:
    setting = get_site_setting(db, key)
    return SiteSettingRead.model_validate(setting)


@router.patch(
    "/{key}",
    response_model=SiteSettingRead,
    status_code=status.HTTP_200_OK,
    responses={
        status.HTTP_401_UNAUTHORIZED: {"model": ErrorResponse},
        status.HTTP_404_NOT_FOUND: {"model": ErrorResponse},
        status.HTTP_422_UNPROCESSABLE_CONTENT: {"model": ErrorResponse},
    },
    summary="Update site setting content and metadata",
)
def patch_setting(
    payload: SiteSettingUpdate,
    key: str = Path(min_length=2, max_length=100, pattern=r"^[a-z0-9_.-]+$"),
    current_admin: AdminUser = Depends(get_current_admin),
    db: Session = Depends(get_db),
) -> SiteSettingRead:
    updated = update_site_setting(db, key, payload, admin=current_admin)
    return SiteSettingRead.model_validate(updated)


@router.patch(
    "/{key}/visibility",
    response_model=SiteSettingRead,
    status_code=status.HTTP_200_OK,
    responses={
        status.HTTP_401_UNAUTHORIZED: {"model": ErrorResponse},
        status.HTTP_404_NOT_FOUND: {"model": ErrorResponse},
        status.HTTP_422_UNPROCESSABLE_CONTENT: {"model": ErrorResponse},
    },
    summary="Update public visibility of a whitelisted site setting",
)
def patch_setting_visibility(
    payload: SiteSettingVisibilityUpdate,
    key: str = Path(min_length=2, max_length=100, pattern=r"^[a-z0-9_.-]+$"),
    current_admin: AdminUser = Depends(get_current_admin),
    db: Session = Depends(get_db),
) -> SiteSettingRead:
    updated = update_site_setting_visibility(db, key, payload, admin=current_admin)
    return SiteSettingRead.model_validate(updated)
