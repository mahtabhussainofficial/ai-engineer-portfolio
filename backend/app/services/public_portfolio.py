"""Public read-only portfolio and contact submission services."""

from __future__ import annotations

from typing import Any

from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.core.config import Settings
from app.core.exceptions import NotFoundError, RateLimitExceededError
from app.core.rate_limit import contact_rate_limiter
from app.models.career import Certification, Education, Experience
from app.models.contact import ContactMessage
from app.models.enums import ContactMessageStatus, PublishStatus, SkillLayer
from app.models.media import MediaAsset
from app.models.project import Project
from app.models.service import Service
from app.models.site_setting import SiteSetting
from app.models.skill import Skill
from app.models.testimonial import Testimonial
from app.schemas.career import (
    CertificationRead,
    EducationRead,
    ExperienceRead,
    PublicBackgroundResponse,
)
from app.schemas.contact import ContactMessageCreate
from app.schemas.media import MediaAssetSummary
from app.schemas.site_setting import (
    PUBLIC_SETTING_KEYS,
    SITE_SETTING_VALUE_SCHEMAS,
    PublicSiteSettingsPayload,
)
from app.services.common import commit_or_conflict, paginate_query

_PROJECT_SORT_COLUMNS = {
    "display_order": Project.display_order,
    "created_at": Project.created_at,
    "updated_at": Project.updated_at,
    "title": Project.title,
}
_SERVICE_SORT_COLUMNS = {
    "display_order": Service.display_order,
    "created_at": Service.created_at,
    "updated_at": Service.updated_at,
    "title": Service.title,
}
_SKILL_SORT_COLUMNS = {
    "display_order": Skill.display_order,
    "created_at": Skill.created_at,
    "updated_at": Skill.updated_at,
    "title": Skill.title,
}
_TESTIMONIAL_SORT_COLUMNS = {
    "display_order": Testimonial.display_order,
    "created_at": Testimonial.created_at,
    "updated_at": Testimonial.updated_at,
    "title": Testimonial.title,
}
_PORTRAIT_SETTING_PRIORITY = (
    "home_page",
    "about_page",
    "site_general",
    "contact_page",
    "skills_page",
)


def get_public_site_settings(db: Session) -> PublicSiteSettingsPayload:
    """Return validated whitelisted public site settings and resolved public media summaries."""
    rows = list(
        db.scalars(
            select(SiteSetting)
            .options(selectinload(SiteSetting.portrait_media))
            .where(
                SiteSetting.is_public.is_(True),
                SiteSetting.key.in_(PUBLIC_SETTING_KEYS),
            )
            .order_by(SiteSetting.key.asc())
        ).all()
    )
    rows_by_key = {row.key: row for row in rows}

    parsed_sections: dict[str, Any] = {}
    for key in PUBLIC_SETTING_KEYS:
        row = rows_by_key.get(key)
        if row is None:
            parsed_sections[key] = None
            continue
        schema_cls = SITE_SETTING_VALUE_SCHEMAS[key]
        parsed_sections[key] = schema_cls.model_validate(row.value)

    portrait_media: MediaAssetSummary | None = None
    for key in _PORTRAIT_SETTING_PRIORITY:
        row = rows_by_key.get(key)
        if row is not None and row.portrait_media is not None:
            portrait_media = MediaAssetSummary.model_validate(row.portrait_media)
            break

    logo_media: MediaAssetSummary | None = None
    site_general = parsed_sections.get("site_general")
    if site_general is not None and site_general.logo_media_id is not None:
        logo_asset = db.scalar(select(MediaAsset).where(MediaAsset.id == site_general.logo_media_id))
        if logo_asset is not None:
            logo_media = MediaAssetSummary.model_validate(logo_asset)

    return PublicSiteSettingsPayload(
        site_general=parsed_sections.get("site_general"),
        home_page=parsed_sections.get("home_page"),
        about_page=parsed_sections.get("about_page"),
        contact_page=parsed_sections.get("contact_page"),
        skills_page=parsed_sections.get("skills_page"),
        portrait_media=portrait_media,
        logo_media=logo_media,
    )


def list_public_services(
    db: Session,
    *,
    category: str | None = None,
    featured: bool | None = None,
    page: int = 1,
    page_size: int = 20,
    sort_by: str = "display_order",
    sort_order: str = "asc",
) -> tuple[list[Service], int]:
    """List published services with optional filtering, allowlisted sorting, and pagination."""
    stmt = select(Service).where(Service.publish_status == PublishStatus.PUBLISHED.value)
    if category is not None:
        stmt = stmt.where(Service.category == category)
    if featured is not None:
        stmt = stmt.where(Service.featured.is_(featured))

    return paginate_query(
        db,
        stmt,
        page=page,
        page_size=page_size,
        sort_by=sort_by,
        sort_order=sort_order,
        sort_columns=_SERVICE_SORT_COLUMNS,
        tie_breaker=Service.id,
    )


def list_public_skills(
    db: Session,
    *,
    layer: SkillLayer | None = None,
    featured: bool | None = None,
    page: int = 1,
    page_size: int = 20,
    sort_by: str = "display_order",
    sort_order: str = "asc",
) -> tuple[list[Skill], int]:
    """List published skill groups with optional filtering, allowlisted sorting, and pagination."""
    stmt = select(Skill).where(Skill.publish_status == PublishStatus.PUBLISHED.value)
    if layer is not None:
        stmt = stmt.where(Skill.layer == layer.value)
    if featured is not None:
        stmt = stmt.where(Skill.featured.is_(featured))

    return paginate_query(
        db,
        stmt,
        page=page,
        page_size=page_size,
        sort_by=sort_by,
        sort_order=sort_order,
        sort_columns=_SKILL_SORT_COLUMNS,
        tie_breaker=Skill.id,
    )


def list_public_projects(
    db: Session,
    *,
    category: str | None = None,
    featured: bool | None = None,
    page: int = 1,
    page_size: int = 20,
    sort_by: str = "display_order",
    sort_order: str = "asc",
) -> tuple[list[Project], int]:
    """List published projects with eager-loaded cover media, filtering, and pagination."""
    stmt = (
        select(Project)
        .options(selectinload(Project.cover_media))
        .where(Project.publish_status == PublishStatus.PUBLISHED.value)
    )
    if category is not None:
        stmt = stmt.where(Project.category == category)
    if featured is not None:
        stmt = stmt.where(Project.featured.is_(featured))

    return paginate_query(
        db,
        stmt,
        page=page,
        page_size=page_size,
        sort_by=sort_by,
        sort_order=sort_order,
        sort_columns=_PROJECT_SORT_COLUMNS,
        tie_breaker=Project.id,
    )


def get_public_project_by_slug(db: Session, slug: str) -> Project:
    """Fetch a single published project by unique slug or raise 404."""
    project = db.scalar(
        select(Project)
        .options(selectinload(Project.cover_media))
        .where(
            Project.slug == slug,
            Project.publish_status == PublishStatus.PUBLISHED.value,
        )
    )
    if project is None:
        raise NotFoundError(f"Project '{slug}' was not found.")
    return project


def get_public_background(db: Session) -> PublicBackgroundResponse:
    """Fetch published experience, education, and certification records ordered for display."""
    experiences = list(
        db.scalars(
            select(Experience)
            .where(Experience.publish_status == PublishStatus.PUBLISHED.value)
            .order_by(Experience.display_order.asc(), Experience.id.asc())
        ).all()
    )
    educations = list(
        db.scalars(
            select(Education)
            .where(Education.publish_status == PublishStatus.PUBLISHED.value)
            .order_by(Education.display_order.asc(), Education.id.asc())
        ).all()
    )
    certifications = list(
        db.scalars(
            select(Certification)
            .options(selectinload(Certification.badge_media))
            .where(Certification.publish_status == PublishStatus.PUBLISHED.value)
            .order_by(Certification.display_order.asc(), Certification.id.asc())
        ).all()
    )
    return PublicBackgroundResponse(
        experience=[ExperienceRead.model_validate(item) for item in experiences],
        education=[EducationRead.model_validate(item) for item in educations],
        certifications=[CertificationRead.model_validate(item) for item in certifications],
    )


def list_public_testimonials(
    db: Session,
    *,
    featured: bool | None = None,
    page: int = 1,
    page_size: int = 20,
    sort_by: str = "display_order",
    sort_order: str = "asc",
) -> tuple[list[Testimonial], int]:
    """List published testimonials with eager-loaded avatar media, filtering, and pagination."""
    stmt = (
        select(Testimonial)
        .options(selectinload(Testimonial.avatar_media))
        .where(Testimonial.publish_status == PublishStatus.PUBLISHED.value)
    )
    if featured is not None:
        stmt = stmt.where(Testimonial.featured.is_(featured))

    return paginate_query(
        db,
        stmt,
        page=page,
        page_size=page_size,
        sort_by=sort_by,
        sort_order=sort_order,
        sort_columns=_TESTIMONIAL_SORT_COLUMNS,
        tie_breaker=Testimonial.id,
    )


def submit_contact_message(
    db: Session,
    payload: ContactMessageCreate,
    *,
    client_ip: str | None,
    user_agent: str | None,
    settings: Settings,
) -> ContactMessage:
    """Validate rate limit, store a public contact inquiry, and return the persisted record."""
    rate_limit_key = f"contact:{client_ip or 'unknown'}"
    retry_after = contact_rate_limiter.check(
        rate_limit_key,
        max_attempts=settings.contact_rate_limit_max_requests,
        window_seconds=settings.contact_rate_limit_window_seconds,
    )
    if retry_after is not None:
        raise RateLimitExceededError(
            retry_after_seconds=retry_after,
            message="Too many contact submissions. Please try again later.",
        )

    truncated_user_agent = user_agent[:512] if user_agent else None
    msg = ContactMessage(
        inquiry_mode=payload.inquiry_mode.value,
        sender_name=payload.sender_name,
        sender_email=str(payload.sender_email),
        subject=payload.subject,
        project_type=payload.project_type,
        message=payload.message,
        status=ContactMessageStatus.UNREAD.value,
        source_ip=client_ip,
        user_agent=truncated_user_agent,
    )
    db.add(msg)
    commit_or_conflict(
        db,
        conflict_message="Unable to save contact message due to a conflicting record.",
    )
    db.refresh(msg)
    contact_rate_limiter.record(
        rate_limit_key,
        window_seconds=settings.contact_rate_limit_window_seconds,
    )
    return msg
