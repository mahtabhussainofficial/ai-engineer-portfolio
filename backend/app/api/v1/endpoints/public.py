"""Public read-only portfolio and rate-limited contact submission endpoints."""

from __future__ import annotations

from typing import Literal

from fastapi import APIRouter, Depends, Path, Query, Request, status
from sqlalchemy.orm import Session

from app.api.deps import get_client_ip
from app.core.config import Settings, get_settings
from app.db.session import get_db
from app.models.enums import SkillLayer
from app.schemas.career import PublicBackgroundResponse
from app.schemas.common import ErrorResponse, PaginatedResponse
from app.schemas.contact import ContactMessageCreate, ContactMessagePublicResponse
from app.schemas.project import ProjectRead, ProjectSummary
from app.schemas.service import ServiceRead
from app.schemas.site_setting import PublicSiteSettingsPayload
from app.schemas.skill import SkillRead
from app.schemas.testimonial import TestimonialRead
from app.services.public_portfolio import (
    get_public_background,
    get_public_project_by_slug,
    get_public_site_settings,
    list_public_projects,
    list_public_services,
    list_public_skills,
    list_public_testimonials,
    submit_contact_message,
)

router = APIRouter(prefix="/public", tags=["Public Portfolio"])

_PUBLIC_READ_RESPONSES = {
    status.HTTP_503_SERVICE_UNAVAILABLE: {"model": ErrorResponse},
}
_PUBLIC_LIST_RESPONSES = {
    status.HTTP_422_UNPROCESSABLE_CONTENT: {"model": ErrorResponse},
    status.HTTP_503_SERVICE_UNAVAILABLE: {"model": ErrorResponse},
}
_PUBLIC_DETAIL_RESPONSES = {
    status.HTTP_404_NOT_FOUND: {"model": ErrorResponse},
    status.HTTP_422_UNPROCESSABLE_CONTENT: {"model": ErrorResponse},
    status.HTTP_503_SERVICE_UNAVAILABLE: {"model": ErrorResponse},
}
_CONTACT_RESPONSES = {
    status.HTTP_422_UNPROCESSABLE_CONTENT: {"model": ErrorResponse},
    status.HTTP_429_TOO_MANY_REQUESTS: {"model": ErrorResponse},
    status.HTTP_503_SERVICE_UNAVAILABLE: {"model": ErrorResponse},
}


@router.get(
    "/site",
    response_model=PublicSiteSettingsPayload,
    responses=_PUBLIC_READ_RESPONSES,
    summary="Get whitelisted public site settings",
)
def read_public_site_settings(db: Session = Depends(get_db)) -> PublicSiteSettingsPayload:
    return get_public_site_settings(db)


@router.get(
    "/services",
    response_model=PaginatedResponse[ServiceRead],
    responses=_PUBLIC_LIST_RESPONSES,
    summary="List published services",
)
def read_public_services(
    category: str | None = Query(default=None, min_length=1, max_length=100),
    featured: bool | None = Query(default=None),
    page: int = Query(default=1, ge=1, le=1000),
    page_size: int = Query(default=20, ge=1, le=100),
    sort_by: Literal["display_order", "created_at", "updated_at", "title"] = Query(
        default="display_order"
    ),
    sort_order: Literal["asc", "desc"] = Query(default="asc"),
    db: Session = Depends(get_db),
) -> PaginatedResponse[ServiceRead]:
    items, total = list_public_services(
        db,
        category=category,
        featured=featured,
        page=page,
        page_size=page_size,
        sort_by=sort_by,
        sort_order=sort_order,
    )
    return PaginatedResponse.create(
        items=[ServiceRead.model_validate(item) for item in items],
        total=total,
        page=page,
        page_size=page_size,
    )


@router.get(
    "/skills",
    response_model=PaginatedResponse[SkillRead],
    responses=_PUBLIC_LIST_RESPONSES,
    summary="List published skill groups",
)
def read_public_skills(
    layer: SkillLayer | None = Query(default=None),
    featured: bool | None = Query(default=None),
    page: int = Query(default=1, ge=1, le=1000),
    page_size: int = Query(default=20, ge=1, le=100),
    sort_by: Literal["display_order", "created_at", "updated_at", "title"] = Query(
        default="display_order"
    ),
    sort_order: Literal["asc", "desc"] = Query(default="asc"),
    db: Session = Depends(get_db),
) -> PaginatedResponse[SkillRead]:
    items, total = list_public_skills(
        db,
        layer=layer,
        featured=featured,
        page=page,
        page_size=page_size,
        sort_by=sort_by,
        sort_order=sort_order,
    )
    return PaginatedResponse.create(
        items=[SkillRead.model_validate(item) for item in items],
        total=total,
        page=page,
        page_size=page_size,
    )


@router.get(
    "/projects",
    response_model=PaginatedResponse[ProjectSummary],
    responses=_PUBLIC_LIST_RESPONSES,
    summary="List published portfolio projects",
)
def read_public_projects(
    category: str | None = Query(default=None, min_length=1, max_length=100),
    featured: bool | None = Query(default=None),
    page: int = Query(default=1, ge=1, le=1000),
    page_size: int = Query(default=20, ge=1, le=100),
    sort_by: Literal["display_order", "created_at", "updated_at", "title"] = Query(
        default="display_order"
    ),
    sort_order: Literal["asc", "desc"] = Query(default="asc"),
    db: Session = Depends(get_db),
) -> PaginatedResponse[ProjectSummary]:
    items, total = list_public_projects(
        db,
        category=category,
        featured=featured,
        page=page,
        page_size=page_size,
        sort_by=sort_by,
        sort_order=sort_order,
    )
    return PaginatedResponse.create(
        items=[ProjectSummary.model_validate(item) for item in items],
        total=total,
        page=page,
        page_size=page_size,
    )


@router.get(
    "/projects/{slug}",
    response_model=ProjectRead,
    responses=_PUBLIC_DETAIL_RESPONSES,
    summary="Get published project detail by slug",
)
def read_public_project_detail(
    slug: str = Path(min_length=1, max_length=150),
    db: Session = Depends(get_db),
) -> ProjectRead:
    project = get_public_project_by_slug(db, slug)
    return ProjectRead.model_validate(project)


@router.get(
    "/background",
    response_model=PublicBackgroundResponse,
    responses=_PUBLIC_READ_RESPONSES,
    summary="Get published experience, education, and certifications",
)
def read_public_background(db: Session = Depends(get_db)) -> PublicBackgroundResponse:
    return get_public_background(db)


@router.get(
    "/testimonials",
    response_model=PaginatedResponse[TestimonialRead],
    responses=_PUBLIC_LIST_RESPONSES,
    summary="List published testimonials",
)
def read_public_testimonials(
    featured: bool | None = Query(default=None),
    page: int = Query(default=1, ge=1, le=1000),
    page_size: int = Query(default=20, ge=1, le=100),
    sort_by: Literal["display_order", "created_at", "updated_at", "title"] = Query(
        default="display_order"
    ),
    sort_order: Literal["asc", "desc"] = Query(default="asc"),
    db: Session = Depends(get_db),
) -> PaginatedResponse[TestimonialRead]:
    items, total = list_public_testimonials(
        db,
        featured=featured,
        page=page,
        page_size=page_size,
        sort_by=sort_by,
        sort_order=sort_order,
    )
    return PaginatedResponse.create(
        items=[TestimonialRead.model_validate(item) for item in items],
        total=total,
        page=page,
        page_size=page_size,
    )


@router.post(
    "/contact",
    response_model=ContactMessagePublicResponse,
    status_code=status.HTTP_201_CREATED,
    responses=_CONTACT_RESPONSES,
    summary="Submit a public contact inquiry",
)
def create_public_contact_message(
    request: Request,
    payload: ContactMessageCreate,
    db: Session = Depends(get_db),
    settings: Settings = Depends(get_settings),
) -> ContactMessagePublicResponse:
    msg = submit_contact_message(
        db,
        payload,
        client_ip=get_client_ip(request),
        user_agent=request.headers.get("User-Agent"),
        settings=settings,
    )
    return ContactMessagePublicResponse.model_validate(msg)
