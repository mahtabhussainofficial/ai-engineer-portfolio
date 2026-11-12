"""Protected admin contact inquiry inbox endpoints."""

from __future__ import annotations

import uuid
from typing import Literal

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_admin
from app.db.session import get_db
from app.models.admin import AdminUser
from app.models.enums import ContactInquiryMode, ContactMessageStatus
from app.schemas.admin import DeleteResponse
from app.schemas.common import ErrorResponse, PaginatedResponse
from app.schemas.contact import ContactMessageRead, ContactMessageUpdate
from app.services.admin_messages import (
    delete_contact_message,
    get_contact_message,
    list_contact_messages,
    update_contact_message,
)

router = APIRouter(prefix="/messages", tags=["Admin Contact Messages"])


@router.get(
    "",
    response_model=PaginatedResponse[ContactMessageRead],
    status_code=status.HTTP_200_OK,
    responses={status.HTTP_401_UNAUTHORIZED: {"model": ErrorResponse}},
    summary="List contact messages",
)
def list_messages(
    message_status: ContactMessageStatus | None = Query(default=None, alias="status"),
    inquiry_mode: ContactInquiryMode | None = Query(default=None),
    page: int = Query(default=1, ge=1, le=1000),
    page_size: int = Query(default=20, ge=1, le=100),
    sort_by: Literal["created_at", "updated_at", "status"] = Query(default="created_at"),
    sort_order: Literal["asc", "desc"] = Query(default="desc"),
    db: Session = Depends(get_db),
) -> PaginatedResponse[ContactMessageRead]:
    items, total = list_contact_messages(
        db,
        message_status=message_status,
        inquiry_mode=inquiry_mode,
        page=page,
        page_size=page_size,
        sort_by=sort_by,
        sort_order=sort_order,
    )
    return PaginatedResponse.create(
        items=[ContactMessageRead.model_validate(item) for item in items],
        total=total,
        page=page,
        page_size=page_size,
    )


@router.get(
    "/{message_id}",
    response_model=ContactMessageRead,
    status_code=status.HTTP_200_OK,
    responses={
        status.HTTP_401_UNAUTHORIZED: {"model": ErrorResponse},
        status.HTTP_404_NOT_FOUND: {"model": ErrorResponse},
    },
    summary="Retrieve contact message details",
)
def get_message(
    message_id: uuid.UUID,
    db: Session = Depends(get_db),
) -> ContactMessageRead:
    msg = get_contact_message(db, message_id)
    return ContactMessageRead.model_validate(msg)


@router.patch(
    "/{message_id}",
    response_model=ContactMessageRead,
    status_code=status.HTTP_200_OK,
    responses={
        status.HTTP_401_UNAUTHORIZED: {"model": ErrorResponse},
        status.HTTP_404_NOT_FOUND: {"model": ErrorResponse},
        status.HTTP_422_UNPROCESSABLE_CONTENT: {"model": ErrorResponse},
    },
    summary="Update contact message status or admin notes",
)
def patch_message(
    message_id: uuid.UUID,
    payload: ContactMessageUpdate,
    current_admin: AdminUser = Depends(get_current_admin),
    db: Session = Depends(get_db),
) -> ContactMessageRead:
    updated = update_contact_message(db, message_id, payload, admin=current_admin)
    return ContactMessageRead.model_validate(updated)


@router.delete(
    "/{message_id}",
    response_model=DeleteResponse,
    status_code=status.HTTP_200_OK,
    responses={
        status.HTTP_401_UNAUTHORIZED: {"model": ErrorResponse},
        status.HTTP_404_NOT_FOUND: {"model": ErrorResponse},
    },
    summary="Delete contact message",
)
def remove_message(
    message_id: uuid.UUID,
    db: Session = Depends(get_db),
) -> DeleteResponse:
    delete_contact_message(db, message_id)
    return DeleteResponse(message="Contact message deleted successfully.", id=message_id)
