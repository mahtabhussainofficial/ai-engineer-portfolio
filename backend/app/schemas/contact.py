"""Pydantic v2 schemas for public contact inquiries and admin triage."""

from __future__ import annotations

import uuid
from datetime import datetime

from pydantic import EmailStr, Field

from app.models.enums import ContactInquiryMode, ContactMessageStatus
from app.schemas.common import AppBaseSchema, AppWriteSchema, UUIDTimestampSchema


class ContactMessageCreate(AppWriteSchema):
    """Inbound inquiry payload aligned with the portfolio contact form."""

    inquiry_mode: ContactInquiryMode = ContactInquiryMode.PROJECT
    sender_name: str = Field(min_length=2, max_length=150)
    sender_email: EmailStr
    subject: str = Field(min_length=3, max_length=255)
    project_type: str = Field(min_length=2, max_length=100)
    message: str = Field(min_length=15, max_length=5000)


class ContactMessageUpdate(AppWriteSchema):
    """Admin triage update schema for contact message status and notes."""

    status: ContactMessageStatus | None = None
    admin_notes: str | None = None


class ContactMessagePublicResponse(AppBaseSchema):
    """Minimal safe confirmation returned after a public contact inquiry submission."""

    id: uuid.UUID
    status: ContactMessageStatus
    created_at: datetime


class ContactMessageRead(UUIDTimestampSchema):
    """Read schema for stored contact inquiry records."""

    inquiry_mode: ContactInquiryMode
    sender_name: str
    sender_email: EmailStr
    subject: str
    project_type: str
    message: str
    status: ContactMessageStatus
    admin_notes: str | None = None
    read_at: datetime | None = None
    archived_at: datetime | None = None
    handled_by_id: uuid.UUID | None = None
