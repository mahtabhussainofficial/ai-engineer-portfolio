"""Admin CRUD and publishing services for projects, services, skills, career, and testimonials."""

from __future__ import annotations

import uuid
from typing import Any, TypeVar

from sqlalchemy import select
from sqlalchemy.orm import InstrumentedAttribute, Session

from app.core.exceptions import ConflictError
from app.models.career import Certification, Education, Experience
from app.models.enums import PublishStatus, SkillLayer
from app.models.project import Project
from app.models.service import Service
from app.models.skill import Skill
from app.models.testimonial import Testimonial
from app.schemas.career import (
    CertificationCreate,
    CertificationUpdate,
    EducationCreate,
    EducationUpdate,
    ExperienceCreate,
    ExperienceUpdate,
)
from app.schemas.project import ProjectCreate, ProjectUpdate
from app.schemas.service import ServiceCreate, ServiceUpdate
from app.schemas.skill import SkillCreate, SkillUpdate
from app.schemas.testimonial import TestimonialCreate, TestimonialUpdate
from app.services.admin_common import (
    apply_publish_fields_on_create,
    apply_publish_fields_on_patch,
    commit_or_conflict,
    ensure_media_exists,
    ensure_non_null_patch_fields,
    get_record_or_404,
    paginate_query,
    set_publish_state,
)

ModelT = TypeVar("ModelT")

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
_EXPERIENCE_SORT_COLUMNS = {
    "display_order": Experience.display_order,
    "created_at": Experience.created_at,
    "updated_at": Experience.updated_at,
}
_EDUCATION_SORT_COLUMNS = {
    "display_order": Education.display_order,
    "created_at": Education.created_at,
    "updated_at": Education.updated_at,
}
_CERTIFICATION_SORT_COLUMNS = {
    "display_order": Certification.display_order,
    "created_at": Certification.created_at,
    "updated_at": Certification.updated_at,
    "year": Certification.year,
}
_TESTIMONIAL_SORT_COLUMNS = {
    "display_order": Testimonial.display_order,
    "created_at": Testimonial.created_at,
    "updated_at": Testimonial.updated_at,
    "title": Testimonial.title,
}


def _url_to_str(value: Any) -> str | None:
    return str(value) if value is not None else None


def _delete_content_record(
    db: Session,
    model_cls: type[ModelT],
    record_id: uuid.UUID,
    *,
    not_found_message: str,
) -> None:
    record = get_record_or_404(db, model_cls, record_id, not_found_message=not_found_message)
    db.delete(record)
    commit_or_conflict(db, "Record could not be deleted due to existing references.")


def _toggle_publish_record(
    db: Session,
    model_cls: type[ModelT],
    record_id: uuid.UUID,
    *,
    publish: bool,
    not_found_message: str,
    media_relation: InstrumentedAttribute[Any] | None = None,
) -> ModelT:
    record = get_record_or_404(
        db,
        model_cls,
        record_id,
        not_found_message=not_found_message,
        media_relation=media_relation,
    )
    set_publish_state(record, publish)
    commit_or_conflict(db, "Failed to update publish state.")
    return get_record_or_404(
        db,
        model_cls,
        record_id,
        not_found_message=not_found_message,
        media_relation=media_relation,
    )


# ---------------------------------------------------------------------------
# Projects
# ---------------------------------------------------------------------------


def list_projects(
    db: Session,
    *,
    publish_status: PublishStatus | None = None,
    category: str | None = None,
    featured: bool | None = None,
    page: int = 1,
    page_size: int = 20,
    sort_by: str = "display_order",
    sort_order: str = "asc",
) -> tuple[list[Project], int]:
    from sqlalchemy.orm import selectinload

    stmt = select(Project).options(selectinload(Project.cover_media))
    if publish_status is not None:
        stmt = stmt.where(Project.publish_status == publish_status.value)
    if category is not None:
        stmt = stmt.where(Project.category == category.strip())
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


def get_project(db: Session, project_id: uuid.UUID) -> Project:
    return get_record_or_404(
        db,
        Project,
        project_id,
        not_found_message="Project was not found.",
        media_relation=Project.cover_media,
    )


def create_project(db: Session, payload: ProjectCreate) -> Project:
    existing_slug = db.scalar(select(Project.id).where(Project.slug == payload.slug))
    if existing_slug is not None:
        raise ConflictError(f"A project with slug '{payload.slug}' already exists.")
    if payload.cover_media_id is not None:
        ensure_media_exists(db, payload.cover_media_id)

    project = Project(
        slug=payload.slug,
        display_number=payload.display_number,
        title=payload.title,
        category=payload.category,
        home_category_label=payload.home_category_label,
        project_type=payload.project_type.value,
        featured=payload.featured,
        display_order=payload.display_order,
        summary=payload.summary,
        problem=payload.problem,
        solution=payload.solution,
        deliverables=list(payload.deliverables),
        tags=list(payload.tags),
        live_url=_url_to_str(payload.live_url),
        repo_url=_url_to_str(payload.repo_url),
        cover_media_id=payload.cover_media_id,
    )
    apply_publish_fields_on_create(project, payload.publish_status, payload.published_at)
    db.add(project)
    commit_or_conflict(db, f"A project with slug '{payload.slug}' already exists.")
    return get_project(db, project.id)


def update_project(db: Session, project_id: uuid.UUID, payload: ProjectUpdate) -> Project:
    project = get_project(db, project_id)
    ensure_non_null_patch_fields(
        payload,
        (
            "slug",
            "title",
            "category",
            "project_type",
            "publish_status",
            "featured",
            "display_order",
            "summary",
            "problem",
            "solution",
            "deliverables",
            "tags",
        ),
    )

    if "slug" in payload.model_fields_set and payload.slug is not None:
        duplicate_id = db.scalar(
            select(Project.id).where(Project.slug == payload.slug, Project.id != project_id)
        )
        if duplicate_id is not None:
            raise ConflictError(f"A project with slug '{payload.slug}' already exists.")
        project.slug = payload.slug
    if "display_number" in payload.model_fields_set:
        project.display_number = payload.display_number
    if "title" in payload.model_fields_set and payload.title is not None:
        project.title = payload.title
    if "category" in payload.model_fields_set and payload.category is not None:
        project.category = payload.category
    if "home_category_label" in payload.model_fields_set:
        project.home_category_label = payload.home_category_label
    if "project_type" in payload.model_fields_set and payload.project_type is not None:
        project.project_type = payload.project_type.value
    if "featured" in payload.model_fields_set and payload.featured is not None:
        project.featured = payload.featured
    if "display_order" in payload.model_fields_set and payload.display_order is not None:
        project.display_order = payload.display_order
    if "summary" in payload.model_fields_set and payload.summary is not None:
        project.summary = payload.summary
    if "problem" in payload.model_fields_set and payload.problem is not None:
        project.problem = payload.problem
    if "solution" in payload.model_fields_set and payload.solution is not None:
        project.solution = payload.solution
    if "deliverables" in payload.model_fields_set and payload.deliverables is not None:
        project.deliverables = list(payload.deliverables)
    if "tags" in payload.model_fields_set and payload.tags is not None:
        project.tags = list(payload.tags)
    if "live_url" in payload.model_fields_set:
        project.live_url = _url_to_str(payload.live_url)
    if "repo_url" in payload.model_fields_set:
        project.repo_url = _url_to_str(payload.repo_url)
    if "cover_media_id" in payload.model_fields_set:
        if payload.cover_media_id is not None:
            ensure_media_exists(db, payload.cover_media_id)
        project.cover_media_id = payload.cover_media_id
    apply_publish_fields_on_patch(project, payload)

    commit_or_conflict(db, "Project update conflicted with existing data.")
    return get_project(db, project.id)


def delete_project(db: Session, project_id: uuid.UUID) -> None:
    _delete_content_record(db, Project, project_id, not_found_message="Project was not found.")


def set_project_publish_state(db: Session, project_id: uuid.UUID, *, publish: bool) -> Project:
    return _toggle_publish_record(
        db,
        Project,
        project_id,
        publish=publish,
        not_found_message="Project was not found.",
        media_relation=Project.cover_media,
    )


# ---------------------------------------------------------------------------
# Services
# ---------------------------------------------------------------------------


def list_services(
    db: Session,
    *,
    publish_status: PublishStatus | None = None,
    category: str | None = None,
    featured: bool | None = None,
    page: int = 1,
    page_size: int = 20,
    sort_by: str = "display_order",
    sort_order: str = "asc",
) -> tuple[list[Service], int]:
    stmt = select(Service)
    if publish_status is not None:
        stmt = stmt.where(Service.publish_status == publish_status.value)
    if category is not None:
        stmt = stmt.where(Service.category == category.strip())
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


def get_service(db: Session, service_id: uuid.UUID) -> Service:
    return get_record_or_404(db, Service, service_id, not_found_message="Service was not found.")


def create_service(db: Session, payload: ServiceCreate) -> Service:
    service = Service(
        display_number=payload.display_number,
        category=payload.category,
        domain=payload.domain,
        title=payload.title,
        description=payload.description,
        tools=list(payload.tools),
        featured=payload.featured,
        home_category_label=payload.home_category_label,
        home_title=payload.home_title,
        home_description=payload.home_description,
        home_tags=list(payload.home_tags) if payload.home_tags is not None else None,
        display_order=payload.display_order,
    )
    apply_publish_fields_on_create(service, payload.publish_status, payload.published_at)
    db.add(service)
    commit_or_conflict(db, "Service creation conflicted with existing data.")
    db.refresh(service)
    return service


def update_service(db: Session, service_id: uuid.UUID, payload: ServiceUpdate) -> Service:
    service = get_service(db, service_id)
    ensure_non_null_patch_fields(
        payload,
        ("category", "domain", "title", "description", "tools", "featured", "publish_status", "display_order"),
    )

    if "display_number" in payload.model_fields_set:
        service.display_number = payload.display_number
    if "category" in payload.model_fields_set and payload.category is not None:
        service.category = payload.category
    if "domain" in payload.model_fields_set and payload.domain is not None:
        service.domain = payload.domain
    if "title" in payload.model_fields_set and payload.title is not None:
        service.title = payload.title
    if "description" in payload.model_fields_set and payload.description is not None:
        service.description = payload.description
    if "tools" in payload.model_fields_set and payload.tools is not None:
        service.tools = list(payload.tools)
    if "featured" in payload.model_fields_set and payload.featured is not None:
        service.featured = payload.featured
    if "home_category_label" in payload.model_fields_set:
        service.home_category_label = payload.home_category_label
    if "home_title" in payload.model_fields_set:
        service.home_title = payload.home_title
    if "home_description" in payload.model_fields_set:
        service.home_description = payload.home_description
    if "home_tags" in payload.model_fields_set:
        service.home_tags = list(payload.home_tags) if payload.home_tags is not None else None
    if "display_order" in payload.model_fields_set and payload.display_order is not None:
        service.display_order = payload.display_order
    apply_publish_fields_on_patch(service, payload)

    commit_or_conflict(db, "Service update conflicted with existing data.")
    db.refresh(service)
    return service


def delete_service(db: Session, service_id: uuid.UUID) -> None:
    _delete_content_record(db, Service, service_id, not_found_message="Service was not found.")


# ---------------------------------------------------------------------------
# Skills
# ---------------------------------------------------------------------------


def list_skills(
    db: Session,
    *,
    publish_status: PublishStatus | None = None,
    layer: SkillLayer | None = None,
    featured: bool | None = None,
    page: int = 1,
    page_size: int = 20,
    sort_by: str = "display_order",
    sort_order: str = "asc",
) -> tuple[list[Skill], int]:
    stmt = select(Skill)
    if publish_status is not None:
        stmt = stmt.where(Skill.publish_status == publish_status.value)
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


def get_skill(db: Session, skill_id: uuid.UUID) -> Skill:
    return get_record_or_404(db, Skill, skill_id, not_found_message="Skill group was not found.")


def create_skill(db: Session, payload: SkillCreate) -> Skill:
    skill = Skill(
        layer=payload.layer.value,
        display_number=payload.display_number,
        domain=payload.domain,
        title=payload.title,
        description=payload.description,
        items=list(payload.items),
        featured=payload.featured,
        featured_category=payload.featured_category,
        featured_title=payload.featured_title,
        featured_description=payload.featured_description,
        featured_tags=list(payload.featured_tags) if payload.featured_tags is not None else None,
        display_order=payload.display_order,
    )
    apply_publish_fields_on_create(skill, payload.publish_status, payload.published_at)
    db.add(skill)
    commit_or_conflict(db, "Skill creation conflicted with existing data.")
    db.refresh(skill)
    return skill


def update_skill(db: Session, skill_id: uuid.UUID, payload: SkillUpdate) -> Skill:
    skill = get_skill(db, skill_id)
    ensure_non_null_patch_fields(
        payload,
        ("layer", "domain", "title", "description", "items", "featured", "publish_status", "display_order"),
    )

    if "layer" in payload.model_fields_set and payload.layer is not None:
        skill.layer = payload.layer.value
    if "display_number" in payload.model_fields_set:
        skill.display_number = payload.display_number
    if "domain" in payload.model_fields_set and payload.domain is not None:
        skill.domain = payload.domain
    if "title" in payload.model_fields_set and payload.title is not None:
        skill.title = payload.title
    if "description" in payload.model_fields_set and payload.description is not None:
        skill.description = payload.description
    if "items" in payload.model_fields_set and payload.items is not None:
        skill.items = list(payload.items)
    if "featured" in payload.model_fields_set and payload.featured is not None:
        skill.featured = payload.featured
    if "featured_category" in payload.model_fields_set:
        skill.featured_category = payload.featured_category
    if "featured_title" in payload.model_fields_set:
        skill.featured_title = payload.featured_title
    if "featured_description" in payload.model_fields_set:
        skill.featured_description = payload.featured_description
    if "featured_tags" in payload.model_fields_set:
        skill.featured_tags = (
            list(payload.featured_tags) if payload.featured_tags is not None else None
        )
    if "display_order" in payload.model_fields_set and payload.display_order is not None:
        skill.display_order = payload.display_order
    apply_publish_fields_on_patch(skill, payload)

    commit_or_conflict(db, "Skill update conflicted with existing data.")
    db.refresh(skill)
    return skill


def delete_skill(db: Session, skill_id: uuid.UUID) -> None:
    _delete_content_record(db, Skill, skill_id, not_found_message="Skill group was not found.")


# ---------------------------------------------------------------------------
# Experience
# ---------------------------------------------------------------------------


def list_experiences(
    db: Session,
    *,
    publish_status: PublishStatus | None = None,
    is_current: bool | None = None,
    page: int = 1,
    page_size: int = 20,
    sort_by: str = "display_order",
    sort_order: str = "asc",
) -> tuple[list[Experience], int]:
    stmt = select(Experience)
    if publish_status is not None:
        stmt = stmt.where(Experience.publish_status == publish_status.value)
    if is_current is not None:
        stmt = stmt.where(Experience.is_current.is_(is_current))
    return paginate_query(
        db,
        stmt,
        page=page,
        page_size=page_size,
        sort_by=sort_by,
        sort_order=sort_order,
        sort_columns=_EXPERIENCE_SORT_COLUMNS,
        tie_breaker=Experience.id,
    )


def get_experience(db: Session, experience_id: uuid.UUID) -> Experience:
    return get_record_or_404(
        db, Experience, experience_id, not_found_message="Experience entry was not found."
    )


def create_experience(db: Session, payload: ExperienceCreate) -> Experience:
    entry = Experience(
        period=payload.period,
        role=payload.role,
        organization=payload.organization,
        location=payload.location,
        summary=payload.summary,
        is_current=payload.is_current,
        display_order=payload.display_order,
    )
    apply_publish_fields_on_create(entry, payload.publish_status, payload.published_at)
    db.add(entry)
    commit_or_conflict(db, "Experience creation conflicted with existing data.")
    db.refresh(entry)
    return entry


def update_experience(
    db: Session, experience_id: uuid.UUID, payload: ExperienceUpdate
) -> Experience:
    entry = get_experience(db, experience_id)
    ensure_non_null_patch_fields(
        payload,
        ("period", "role", "organization", "summary", "is_current", "publish_status", "display_order"),
    )

    if "period" in payload.model_fields_set and payload.period is not None:
        entry.period = payload.period
    if "role" in payload.model_fields_set and payload.role is not None:
        entry.role = payload.role
    if "organization" in payload.model_fields_set and payload.organization is not None:
        entry.organization = payload.organization
    if "location" in payload.model_fields_set:
        entry.location = payload.location
    if "summary" in payload.model_fields_set and payload.summary is not None:
        entry.summary = payload.summary
    if "is_current" in payload.model_fields_set and payload.is_current is not None:
        entry.is_current = payload.is_current
    if "display_order" in payload.model_fields_set and payload.display_order is not None:
        entry.display_order = payload.display_order
    apply_publish_fields_on_patch(entry, payload)

    commit_or_conflict(db, "Experience update conflicted with existing data.")
    db.refresh(entry)
    return entry


def delete_experience(db: Session, experience_id: uuid.UUID) -> None:
    _delete_content_record(
        db, Experience, experience_id, not_found_message="Experience entry was not found."
    )


# ---------------------------------------------------------------------------
# Education
# ---------------------------------------------------------------------------


def list_educations(
    db: Session,
    *,
    publish_status: PublishStatus | None = None,
    page: int = 1,
    page_size: int = 20,
    sort_by: str = "display_order",
    sort_order: str = "asc",
) -> tuple[list[Education], int]:
    stmt = select(Education)
    if publish_status is not None:
        stmt = stmt.where(Education.publish_status == publish_status.value)
    return paginate_query(
        db,
        stmt,
        page=page,
        page_size=page_size,
        sort_by=sort_by,
        sort_order=sort_order,
        sort_columns=_EDUCATION_SORT_COLUMNS,
        tie_breaker=Education.id,
    )


def get_education(db: Session, education_id: uuid.UUID) -> Education:
    return get_record_or_404(
        db, Education, education_id, not_found_message="Education entry was not found."
    )


def create_education(db: Session, payload: EducationCreate) -> Education:
    entry = Education(
        period=payload.period,
        degree=payload.degree,
        institution=payload.institution,
        field_of_study=payload.field_of_study,
        description=payload.description,
        display_order=payload.display_order,
    )
    apply_publish_fields_on_create(entry, payload.publish_status, payload.published_at)
    db.add(entry)
    commit_or_conflict(db, "Education creation conflicted with existing data.")
    db.refresh(entry)
    return entry


def update_education(db: Session, education_id: uuid.UUID, payload: EducationUpdate) -> Education:
    entry = get_education(db, education_id)
    ensure_non_null_patch_fields(
        payload, ("period", "degree", "institution", "publish_status", "display_order")
    )

    if "period" in payload.model_fields_set and payload.period is not None:
        entry.period = payload.period
    if "degree" in payload.model_fields_set and payload.degree is not None:
        entry.degree = payload.degree
    if "institution" in payload.model_fields_set and payload.institution is not None:
        entry.institution = payload.institution
    if "field_of_study" in payload.model_fields_set:
        entry.field_of_study = payload.field_of_study
    if "description" in payload.model_fields_set:
        entry.description = payload.description
    if "display_order" in payload.model_fields_set and payload.display_order is not None:
        entry.display_order = payload.display_order
    apply_publish_fields_on_patch(entry, payload)

    commit_or_conflict(db, "Education update conflicted with existing data.")
    db.refresh(entry)
    return entry


def delete_education(db: Session, education_id: uuid.UUID) -> None:
    _delete_content_record(
        db, Education, education_id, not_found_message="Education entry was not found."
    )


# ---------------------------------------------------------------------------
# Certifications
# ---------------------------------------------------------------------------


def list_certifications(
    db: Session,
    *,
    publish_status: PublishStatus | None = None,
    page: int = 1,
    page_size: int = 20,
    sort_by: str = "display_order",
    sort_order: str = "asc",
) -> tuple[list[Certification], int]:
    from sqlalchemy.orm import selectinload

    stmt = select(Certification).options(selectinload(Certification.badge_media))
    if publish_status is not None:
        stmt = stmt.where(Certification.publish_status == publish_status.value)
    return paginate_query(
        db,
        stmt,
        page=page,
        page_size=page_size,
        sort_by=sort_by,
        sort_order=sort_order,
        sort_columns=_CERTIFICATION_SORT_COLUMNS,
        tie_breaker=Certification.id,
    )


def get_certification(db: Session, certification_id: uuid.UUID) -> Certification:
    return get_record_or_404(
        db,
        Certification,
        certification_id,
        not_found_message="Certification was not found.",
        media_relation=Certification.badge_media,
    )


def create_certification(db: Session, payload: CertificationCreate) -> Certification:
    if payload.badge_media_id is not None:
        ensure_media_exists(db, payload.badge_media_id)

    cert = Certification(
        year=payload.year,
        title=payload.title,
        issuer=payload.issuer,
        credential_id=payload.credential_id,
        credential_url=_url_to_str(payload.credential_url),
        badge_media_id=payload.badge_media_id,
        display_order=payload.display_order,
    )
    apply_publish_fields_on_create(cert, payload.publish_status, payload.published_at)
    db.add(cert)
    commit_or_conflict(db, "Certification creation conflicted with existing data.")
    return get_certification(db, cert.id)


def update_certification(
    db: Session, certification_id: uuid.UUID, payload: CertificationUpdate
) -> Certification:
    cert = get_certification(db, certification_id)
    ensure_non_null_patch_fields(
        payload, ("year", "title", "issuer", "publish_status", "display_order")
    )

    if "year" in payload.model_fields_set and payload.year is not None:
        cert.year = payload.year
    if "title" in payload.model_fields_set and payload.title is not None:
        cert.title = payload.title
    if "issuer" in payload.model_fields_set and payload.issuer is not None:
        cert.issuer = payload.issuer
    if "credential_id" in payload.model_fields_set:
        cert.credential_id = payload.credential_id
    if "credential_url" in payload.model_fields_set:
        cert.credential_url = _url_to_str(payload.credential_url)
    if "badge_media_id" in payload.model_fields_set:
        if payload.badge_media_id is not None:
            ensure_media_exists(db, payload.badge_media_id)
        cert.badge_media_id = payload.badge_media_id
    if "display_order" in payload.model_fields_set and payload.display_order is not None:
        cert.display_order = payload.display_order
    apply_publish_fields_on_patch(cert, payload)

    commit_or_conflict(db, "Certification update conflicted with existing data.")
    return get_certification(db, cert.id)


def delete_certification(db: Session, certification_id: uuid.UUID) -> None:
    _delete_content_record(
        db, Certification, certification_id, not_found_message="Certification was not found."
    )


# ---------------------------------------------------------------------------
# Testimonials
# ---------------------------------------------------------------------------


def list_testimonials(
    db: Session,
    *,
    publish_status: PublishStatus | None = None,
    featured: bool | None = None,
    page: int = 1,
    page_size: int = 20,
    sort_by: str = "display_order",
    sort_order: str = "asc",
) -> tuple[list[Testimonial], int]:
    from sqlalchemy.orm import selectinload

    stmt = select(Testimonial).options(selectinload(Testimonial.avatar_media))
    if publish_status is not None:
        stmt = stmt.where(Testimonial.publish_status == publish_status.value)
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


def get_testimonial(db: Session, testimonial_id: uuid.UUID) -> Testimonial:
    return get_record_or_404(
        db,
        Testimonial,
        testimonial_id,
        not_found_message="Testimonial was not found.",
        media_relation=Testimonial.avatar_media,
    )


def create_testimonial(db: Session, payload: TestimonialCreate) -> Testimonial:
    if payload.avatar_media_id is not None:
        ensure_media_exists(db, payload.avatar_media_id)

    item = Testimonial(
        title=payload.title,
        author_name=payload.author_name,
        author_role=payload.author_role,
        quote=payload.quote,
        rating_score=payload.rating_score,
        rating_label=payload.rating_label,
        stars=payload.stars,
        source=payload.source,
        source_url=_url_to_str(payload.source_url),
        avatar_media_id=payload.avatar_media_id,
        featured=payload.featured,
        display_order=payload.display_order,
    )
    apply_publish_fields_on_create(item, payload.publish_status, payload.published_at)
    db.add(item)
    commit_or_conflict(db, "Testimonial creation conflicted with existing data.")
    return get_testimonial(db, item.id)


def update_testimonial(
    db: Session, testimonial_id: uuid.UUID, payload: TestimonialUpdate
) -> Testimonial:
    item = get_testimonial(db, testimonial_id)
    ensure_non_null_patch_fields(
        payload,
        ("title", "rating_label", "stars", "source", "featured", "publish_status", "display_order"),
    )

    if "title" in payload.model_fields_set and payload.title is not None:
        item.title = payload.title
    if "author_name" in payload.model_fields_set:
        item.author_name = payload.author_name
    if "author_role" in payload.model_fields_set:
        item.author_role = payload.author_role
    if "quote" in payload.model_fields_set:
        item.quote = payload.quote
    if "rating_score" in payload.model_fields_set:
        item.rating_score = payload.rating_score
    if "rating_label" in payload.model_fields_set and payload.rating_label is not None:
        item.rating_label = payload.rating_label
    if "stars" in payload.model_fields_set and payload.stars is not None:
        item.stars = payload.stars
    if "source" in payload.model_fields_set and payload.source is not None:
        item.source = payload.source
    if "source_url" in payload.model_fields_set:
        item.source_url = _url_to_str(payload.source_url)
    if "avatar_media_id" in payload.model_fields_set:
        if payload.avatar_media_id is not None:
            ensure_media_exists(db, payload.avatar_media_id)
        item.avatar_media_id = payload.avatar_media_id
    if "featured" in payload.model_fields_set and payload.featured is not None:
        item.featured = payload.featured
    if "display_order" in payload.model_fields_set and payload.display_order is not None:
        item.display_order = payload.display_order
    apply_publish_fields_on_patch(item, payload)

    commit_or_conflict(db, "Testimonial update conflicted with existing data.")
    return get_testimonial(db, item.id)


def delete_testimonial(db: Session, testimonial_id: uuid.UUID) -> None:
    _delete_content_record(
        db, Testimonial, testimonial_id, not_found_message="Testimonial was not found."
    )


def set_testimonial_publish_state(
    db: Session, testimonial_id: uuid.UUID, *, publish: bool
) -> Testimonial:
    return _toggle_publish_record(
        db,
        Testimonial,
        testimonial_id,
        publish=publish,
        not_found_message="Testimonial was not found.",
        media_relation=Testimonial.avatar_media,
    )
