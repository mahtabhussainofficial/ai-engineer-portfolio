"""Protected admin media asset metadata CRUD endpoints."""

from __future__ import annotations

import uuid
from typing import Literal

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_admin
from app.db.session import get_db
from app.models.admin import AdminUser
from app.models.enums import StorageProvider
from app.schemas.admin import DeleteResponse
from app.schemas.common import ErrorResponse, PaginatedResponse
from app.schemas.media import MediaAssetCreate, MediaAssetRead, MediaAssetUpdate
from app.services.admin_media import (
    create_media_asset,
    delete_media_asset,
    get_media_asset,
    list_media_assets,
    update_media_asset,
)

router = APIRouter(prefix="/media", tags=["Admin Media Assets"])


@router.get(
    "",
    response_model=PaginatedResponse[MediaAssetRead],
    status_code=status.HTTP_200_OK,
    responses={status.HTTP_401_UNAUTHORIZED: {"model": ErrorResponse}},
    summary="List media assets",
)
def list_media(
    storage_provider: StorageProvider | None = Query(default=None),
    mime_type: str | None = Query(default=None, min_length=3, max_length=100),
    page: int = Query(default=1, ge=1, le=1000),
    page_size: int = Query(default=20, ge=1, le=100),
    sort_by: Literal["created_at", "updated_at", "title"] = Query(default="created_at"),
    sort_order: Literal["asc", "desc"] = Query(default="desc"),
    db: Session = Depends(get_db),
) -> PaginatedResponse[MediaAssetRead]:
    items, total = list_media_assets(
        db,
        storage_provider=storage_provider,
        mime_type=mime_type,
        page=page,
        page_size=page_size,
        sort_by=sort_by,
        sort_order=sort_order,
    )
    return PaginatedResponse.create(
        items=[MediaAssetRead.model_validate(item) for item in items],
        total=total,
        page=page,
        page_size=page_size,
    )


@router.post(
    "",
    response_model=MediaAssetRead,
    status_code=status.HTTP_201_CREATED,
    responses={
        status.HTTP_401_UNAUTHORIZED: {"model": ErrorResponse},
        status.HTTP_422_UNPROCESSABLE_CONTENT: {"model": ErrorResponse},
    },
    summary="Register media asset metadata",
)
def create_media(
    payload: MediaAssetCreate,
    current_admin: AdminUser = Depends(get_current_admin),
    db: Session = Depends(get_db),
) -> MediaAssetRead:
    created = create_media_asset(db, payload, admin=current_admin)
    return MediaAssetRead.model_validate(created)


@router.get(
    "/{media_id}",
    response_model=MediaAssetRead,
    status_code=status.HTTP_200_OK,
    responses={
        status.HTTP_401_UNAUTHORIZED: {"model": ErrorResponse},
        status.HTTP_404_NOT_FOUND: {"model": ErrorResponse},
    },
    summary="Retrieve media asset metadata",
)
def get_media(
    media_id: uuid.UUID,
    db: Session = Depends(get_db),
) -> MediaAssetRead:
    asset = get_media_asset(db, media_id)
    return MediaAssetRead.model_validate(asset)


@router.patch(
    "/{media_id}",
    response_model=MediaAssetRead,
    status_code=status.HTTP_200_OK,
    responses={
        status.HTTP_401_UNAUTHORIZED: {"model": ErrorResponse},
        status.HTTP_404_NOT_FOUND: {"model": ErrorResponse},
        status.HTTP_422_UNPROCESSABLE_CONTENT: {"model": ErrorResponse},
    },
    summary="Update media asset metadata",
)
def patch_media(
    media_id: uuid.UUID,
    payload: MediaAssetUpdate,
    db: Session = Depends(get_db),
) -> MediaAssetRead:
    updated = update_media_asset(db, media_id, payload)
    return MediaAssetRead.model_validate(updated)


@router.delete(
    "/{media_id}",
    response_model=DeleteResponse,
    status_code=status.HTTP_200_OK,
    responses={
        status.HTTP_401_UNAUTHORIZED: {"model": ErrorResponse},
        status.HTTP_404_NOT_FOUND: {"model": ErrorResponse},
        status.HTTP_409_CONFLICT: {"model": ErrorResponse},
    },
    summary="Delete unreferenced media asset metadata",
)
def remove_media(
    media_id: uuid.UUID,
    db: Session = Depends(get_db),
) -> DeleteResponse:
    delete_media_asset(db, media_id)
    return DeleteResponse(message="Media asset deleted successfully.", id=media_id)
