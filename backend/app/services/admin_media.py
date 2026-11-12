"""Admin media asset metadata CRUD and safe deletion service."""

from __future__ import annotations

import uuid

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.exceptions import ConflictError, NotFoundError
from app.models.admin import AdminUser
from app.models.career import Certification
from app.models.enums import StorageProvider
from app.models.media import MediaAsset
from app.models.project import Project
from app.models.site_setting import SiteSetting
from app.models.testimonial import Testimonial
from app.schemas.media import MediaAssetCreate, MediaAssetUpdate
from app.services.common import (
    commit_or_conflict,
    ensure_non_null_patch_fields,
    get_record_or_404,
    paginate_query,
    supports_row_locks,
)

_MEDIA_SORT_COLUMNS = {
    "created_at": MediaAsset.created_at,
    "updated_at": MediaAsset.updated_at,
    "title": MediaAsset.title,
}


def list_media_assets(
    db: Session,
    *,
    storage_provider: StorageProvider | None = None,
    mime_type: str | None = None,
    page: int = 1,
    page_size: int = 20,
    sort_by: str = "created_at",
    sort_order: str = "desc",
) -> tuple[list[MediaAsset], int]:
    """List media asset metadata records with optional provider/mime filters and pagination."""
    stmt = select(MediaAsset)
    if storage_provider is not None:
        stmt = stmt.where(MediaAsset.storage_provider == storage_provider.value)
    if mime_type is not None:
        stmt = stmt.where(MediaAsset.mime_type == mime_type.strip())

    return paginate_query(
        db,
        stmt,
        page=page,
        page_size=page_size,
        sort_by=sort_by,
        sort_order=sort_order,
        sort_columns=_MEDIA_SORT_COLUMNS,
        tie_breaker=MediaAsset.id,
    )


def get_media_asset(db: Session, media_id: uuid.UUID) -> MediaAsset:
    """Fetch a single media asset by ID or raise 404."""
    return get_record_or_404(
        db,
        MediaAsset,
        media_id,
        not_found_message="Media asset was not found.",
    )


def create_media_asset(
    db: Session,
    payload: MediaAssetCreate,
    *,
    admin: AdminUser,
) -> MediaAsset:
    """Create a media asset metadata record using explicit field assignments."""
    asset = MediaAsset(
        title=payload.title,
        file_name=payload.file_name,
        storage_provider=payload.storage_provider.value,
        storage_key=payload.storage_key,
        url=payload.url,
        mime_type=payload.mime_type,
        file_size_bytes=payload.file_size_bytes,
        width=payload.width,
        height=payload.height,
        alt_text=payload.alt_text,
        caption=payload.caption,
        uploaded_by_id=admin.id,
    )
    db.add(asset)
    commit_or_conflict(db, "Media asset creation conflicted with existing data.")
    db.refresh(asset)
    return asset


def update_media_asset(
    db: Session,
    media_id: uuid.UUID,
    payload: MediaAssetUpdate,
) -> MediaAsset:
    """Partially update media asset metadata."""
    asset = get_media_asset(db, media_id)
    ensure_non_null_patch_fields(
        payload, ("title", "file_name", "storage_provider", "url", "mime_type")
    )

    if "title" in payload.model_fields_set and payload.title is not None:
        asset.title = payload.title
    if "file_name" in payload.model_fields_set and payload.file_name is not None:
        asset.file_name = payload.file_name
    if "storage_provider" in payload.model_fields_set and payload.storage_provider is not None:
        asset.storage_provider = payload.storage_provider.value
    if "storage_key" in payload.model_fields_set:
        asset.storage_key = payload.storage_key
    if "url" in payload.model_fields_set and payload.url is not None:
        asset.url = payload.url
    if "mime_type" in payload.model_fields_set and payload.mime_type is not None:
        asset.mime_type = payload.mime_type
    if "file_size_bytes" in payload.model_fields_set:
        asset.file_size_bytes = payload.file_size_bytes
    if "width" in payload.model_fields_set:
        asset.width = payload.width
    if "height" in payload.model_fields_set:
        asset.height = payload.height
    if "alt_text" in payload.model_fields_set:
        asset.alt_text = payload.alt_text
    if "caption" in payload.model_fields_set:
        asset.caption = payload.caption

    commit_or_conflict(db, "Media asset update conflicted with existing data.")
    db.refresh(asset)
    return asset


def _is_media_referenced(db: Session, media_id: uuid.UUID) -> bool:
    if db.scalar(select(Project.id).where(Project.cover_media_id == media_id).limit(1)) is not None:
        return True
    if (
        db.scalar(select(Certification.id).where(Certification.badge_media_id == media_id).limit(1))
        is not None
    ):
        return True
    if (
        db.scalar(select(Testimonial.id).where(Testimonial.avatar_media_id == media_id).limit(1))
        is not None
    ):
        return True
    if (
        db.scalar(select(SiteSetting.id).where(SiteSetting.portrait_media_id == media_id).limit(1))
        is not None
    ):
        return True

    site_general = db.scalar(select(SiteSetting).where(SiteSetting.key == "site_general").limit(1))
    if site_general is not None and isinstance(site_general.value, dict):
        logo_media_id = site_general.value.get("logo_media_id")
        if logo_media_id is not None:
            try:
                if uuid.UUID(str(logo_media_id)) == media_id:
                    return True
            except ValueError:
                if str(logo_media_id) == str(media_id):
                    return True
    return False


def delete_media_asset(db: Session, media_id: uuid.UUID) -> None:
    """Lock the media row and delete only after confirming no portfolio content references it."""
    stmt = select(MediaAsset).where(MediaAsset.id == media_id)
    if supports_row_locks(db):
        stmt = stmt.with_for_update()
    asset = db.scalar(stmt)
    if asset is None:
        raise NotFoundError("Media asset was not found.")

    if _is_media_referenced(db, media_id):
        raise ConflictError(
            "Media asset is currently referenced by existing content and cannot be deleted."
        )
    db.delete(asset)
    commit_or_conflict(db, "Media asset could not be deleted because it is still referenced.")
