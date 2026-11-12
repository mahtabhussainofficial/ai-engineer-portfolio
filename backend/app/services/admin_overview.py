"""Admin dashboard overview aggregation service."""

from __future__ import annotations

from typing import Any

from sqlalchemy import case, func, select
from sqlalchemy.orm import Session

from app.models.career import Certification, Education, Experience
from app.models.contact import ContactMessage
from app.models.enums import ContactMessageStatus, PublishStatus
from app.models.media import MediaAsset
from app.models.project import Project
from app.models.service import Service
from app.models.site_setting import SiteSetting
from app.models.skill import Skill
from app.models.testimonial import Testimonial
from app.schemas.admin import (
    AdminOverviewResponse,
    ContactMessageOverviewItem,
    ContactOverviewCounts,
    ContentCountSummary,
)


def _count_publishable(db: Session, model_cls: type[Any]) -> ContentCountSummary:
    row = db.execute(
        select(
            func.count().label("total"),
            func.coalesce(
                func.sum(
                    case(
                        (model_cls.publish_status == PublishStatus.PUBLISHED.value, 1),
                        else_=0,
                    )
                ),
                0,
            ).label("published"),
            func.coalesce(
                func.sum(
                    case(
                        (model_cls.publish_status == PublishStatus.DRAFT.value, 1),
                        else_=0,
                    )
                ),
                0,
            ).label("draft"),
        )
    ).one()
    return ContentCountSummary(
        total=int(row.total),
        published=int(row.published),
        draft=int(row.draft),
    )


def get_admin_overview(db: Session) -> AdminOverviewResponse:
    """Gather CMS content counts, message counts, and recent contact inquiries."""
    media_assets = int(db.scalar(select(func.count()).select_from(MediaAsset)) or 0)

    settings_row = db.execute(
        select(
            func.count().label("total"),
            func.coalesce(
                func.sum(case((SiteSetting.is_public.is_(True), 1), else_=0)),
                0,
            ).label("public_count"),
        )
    ).one()

    msg_row = db.execute(
        select(
            func.count().label("total"),
            func.coalesce(
                func.sum(
                    case((ContactMessage.status == ContactMessageStatus.UNREAD.value, 1), else_=0)
                ),
                0,
            ).label("unread"),
            func.coalesce(
                func.sum(
                    case((ContactMessage.status == ContactMessageStatus.READ.value, 1), else_=0)
                ),
                0,
            ).label("read"),
            func.coalesce(
                func.sum(
                    case((ContactMessage.status == ContactMessageStatus.ARCHIVED.value, 1), else_=0)
                ),
                0,
            ).label("archived"),
        )
    ).one()

    recent = db.scalars(
        select(ContactMessage)
        .order_by(ContactMessage.created_at.desc(), ContactMessage.id.desc())
        .limit(5)
    ).all()

    return AdminOverviewResponse(
        projects=_count_publishable(db, Project),
        services=_count_publishable(db, Service),
        skills=_count_publishable(db, Skill),
        experience=_count_publishable(db, Experience),
        education=_count_publishable(db, Education),
        certifications=_count_publishable(db, Certification),
        testimonials=_count_publishable(db, Testimonial),
        media_assets=media_assets,
        site_settings=int(settings_row.total),
        public_site_settings=int(settings_row.public_count),
        messages=ContactOverviewCounts(
            total=int(msg_row.total),
            unread=int(msg_row.unread),
            read=int(msg_row.read),
            archived=int(msg_row.archived),
        ),
        recent_messages=[ContactMessageOverviewItem.model_validate(item) for item in recent],
    )
