"""Admin contact inquiry inbox listing, detail, and triage services."""

from __future__ import annotations

import uuid

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.admin import AdminUser
from app.models.contact import ContactMessage
from app.models.enums import ContactInquiryMode, ContactMessageStatus
from app.schemas.contact import ContactMessageUpdate
from app.services.common import (
    commit_or_conflict,
    ensure_non_null_patch_fields,
    get_record_or_404,
    paginate_query,
    utc_now,
)

_MESSAGE_SORT_COLUMNS = {
    "created_at": ContactMessage.created_at,
    "updated_at": ContactMessage.updated_at,
    "status": ContactMessage.status,
}


def list_contact_messages(
    db: Session,
    *,
    message_status: ContactMessageStatus | None = None,
    inquiry_mode: ContactInquiryMode | None = None,
    page: int = 1,
    page_size: int = 20,
    sort_by: str = "created_at",
    sort_order: str = "desc",
) -> tuple[list[ContactMessage], int]:
    """List contact messages with status/mode filters, pagination, and sorting."""
    stmt = select(ContactMessage)
    if message_status is not None:
        stmt = stmt.where(ContactMessage.status == message_status.value)
    if inquiry_mode is not None:
        stmt = stmt.where(ContactMessage.inquiry_mode == inquiry_mode.value)

    return paginate_query(
        db,
        stmt,
        page=page,
        page_size=page_size,
        sort_by=sort_by,
        sort_order=sort_order,
        sort_columns=_MESSAGE_SORT_COLUMNS,
        tie_breaker=ContactMessage.id,
    )


def get_contact_message(db: Session, message_id: uuid.UUID) -> ContactMessage:
    """Retrieve a single contact inquiry by ID or raise 404."""
    return get_record_or_404(
        db,
        ContactMessage,
        message_id,
        not_found_message="Contact message was not found.",
    )


def update_contact_message(
    db: Session,
    message_id: uuid.UUID,
    payload: ContactMessageUpdate,
    *,
    admin: AdminUser,
) -> ContactMessage:
    """Update triage status/notes while managing server-side read/archived timestamps."""
    msg = get_contact_message(db, message_id)
    ensure_non_null_patch_fields(payload, ("status",))

    if "admin_notes" in payload.model_fields_set:
        msg.admin_notes = payload.admin_notes

    if "status" in payload.model_fields_set and payload.status is not None:
        now = utc_now()
        msg.status = payload.status.value
        if payload.status == ContactMessageStatus.UNREAD:
            msg.read_at = None
            msg.archived_at = None
        elif payload.status == ContactMessageStatus.READ:
            if msg.read_at is None:
                msg.read_at = now
            msg.archived_at = None
        elif payload.status == ContactMessageStatus.ARCHIVED:
            if msg.read_at is None:
                msg.read_at = now
            msg.archived_at = now

    msg.handled_by_id = admin.id
    commit_or_conflict(db, "Contact message update conflicted with existing data.")
    db.refresh(msg)
    return msg


def delete_contact_message(db: Session, message_id: uuid.UUID) -> None:
    """Delete a contact message by ID."""
    msg = get_contact_message(db, message_id)
    db.delete(msg)
    commit_or_conflict(db, "Contact message could not be deleted.")
