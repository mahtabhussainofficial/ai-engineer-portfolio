"""Protected admin CRUD endpoints for portfolio content resources."""

from __future__ import annotations

import uuid
from typing import Literal

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.enums import PublishStatus, SkillLayer
from app.schemas.admin import DeleteResponse
from app.schemas.career import (
    CertificationCreate,
    CertificationRead,
    CertificationUpdate,
    EducationCreate,
    EducationRead,
    EducationUpdate,
    ExperienceCreate,
    ExperienceRead,
    ExperienceUpdate,
)
from app.schemas.common import ErrorResponse, PaginatedResponse
from app.schemas.project import ProjectCreate, ProjectRead, ProjectSummary, ProjectUpdate
from app.schemas.service import ServiceCreate, ServiceRead, ServiceUpdate
from app.schemas.skill import SkillCreate, SkillRead, SkillUpdate
from app.schemas.testimonial import TestimonialCreate, TestimonialRead, TestimonialUpdate
from app.services.admin_content import (
    create_certification,
    create_education,
    create_experience,
    create_project,
    create_service,
    create_skill,
    create_testimonial,
    delete_certification,
    delete_education,
    delete_experience,
    delete_project,
    delete_service,
    delete_skill,
    delete_testimonial,
    get_certification,
    get_education,
    get_experience,
    get_project,
    get_service,
    get_skill,
    get_testimonial,
    list_certifications,
    list_educations,
    list_experiences,
    list_projects,
    list_services,
    list_skills,
    list_testimonials,
    set_project_publish_state,
    set_testimonial_publish_state,
    update_certification,
    update_education,
    update_experience,
    update_project,
    update_service,
    update_skill,
    update_testimonial,
)

router = APIRouter()

_AUTH_401 = {status.HTTP_401_UNAUTHORIZED: {"model": ErrorResponse}}
_CRUD_RESPONSES = {
    status.HTTP_401_UNAUTHORIZED: {"model": ErrorResponse},
    status.HTTP_404_NOT_FOUND: {"model": ErrorResponse},
    status.HTTP_422_UNPROCESSABLE_CONTENT: {"model": ErrorResponse},
}


# ---------------------------------------------------------------------------
# Projects
# ---------------------------------------------------------------------------


@router.get(
    "/projects",
    response_model=PaginatedResponse[ProjectSummary],
    tags=["Admin Projects"],
    responses=_AUTH_401,
    summary="List portfolio projects",
)
def list_admin_projects(
    publish_status: PublishStatus | None = Query(default=None),
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
    items, total = list_projects(
        db,
        publish_status=publish_status,
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


@router.post(
    "/projects",
    response_model=ProjectRead,
    status_code=status.HTTP_201_CREATED,
    tags=["Admin Projects"],
    responses={
        status.HTTP_401_UNAUTHORIZED: {"model": ErrorResponse},
        status.HTTP_409_CONFLICT: {"model": ErrorResponse},
        status.HTTP_422_UNPROCESSABLE_CONTENT: {"model": ErrorResponse},
    },
    summary="Create portfolio project",
)
def create_admin_project(payload: ProjectCreate, db: Session = Depends(get_db)) -> ProjectRead:
    return ProjectRead.model_validate(create_project(db, payload))


@router.get(
    "/projects/{project_id}",
    response_model=ProjectRead,
    tags=["Admin Projects"],
    responses={
        status.HTTP_401_UNAUTHORIZED: {"model": ErrorResponse},
        status.HTTP_404_NOT_FOUND: {"model": ErrorResponse},
    },
    summary="Retrieve portfolio project",
)
def get_admin_project(project_id: uuid.UUID, db: Session = Depends(get_db)) -> ProjectRead:
    return ProjectRead.model_validate(get_project(db, project_id))


@router.patch(
    "/projects/{project_id}",
    response_model=ProjectRead,
    tags=["Admin Projects"],
    responses={**_CRUD_RESPONSES, status.HTTP_409_CONFLICT: {"model": ErrorResponse}},
    summary="Update portfolio project",
)
def patch_admin_project(
    project_id: uuid.UUID, payload: ProjectUpdate, db: Session = Depends(get_db)
) -> ProjectRead:
    return ProjectRead.model_validate(update_project(db, project_id, payload))


@router.delete(
    "/projects/{project_id}",
    response_model=DeleteResponse,
    tags=["Admin Projects"],
    responses={
        status.HTTP_401_UNAUTHORIZED: {"model": ErrorResponse},
        status.HTTP_404_NOT_FOUND: {"model": ErrorResponse},
    },
    summary="Delete portfolio project",
)
def delete_admin_project(project_id: uuid.UUID, db: Session = Depends(get_db)) -> DeleteResponse:
    delete_project(db, project_id)
    return DeleteResponse(message="Project deleted successfully.", id=project_id)


@router.post(
    "/projects/{project_id}/publish",
    response_model=ProjectRead,
    tags=["Admin Projects"],
    responses=_CRUD_RESPONSES,
    summary="Publish portfolio project",
)
def publish_admin_project(project_id: uuid.UUID, db: Session = Depends(get_db)) -> ProjectRead:
    return ProjectRead.model_validate(set_project_publish_state(db, project_id, publish=True))


@router.post(
    "/projects/{project_id}/unpublish",
    response_model=ProjectRead,
    tags=["Admin Projects"],
    responses={
        status.HTTP_401_UNAUTHORIZED: {"model": ErrorResponse},
        status.HTTP_404_NOT_FOUND: {"model": ErrorResponse},
    },
    summary="Unpublish portfolio project",
)
def unpublish_admin_project(project_id: uuid.UUID, db: Session = Depends(get_db)) -> ProjectRead:
    return ProjectRead.model_validate(set_project_publish_state(db, project_id, publish=False))


# ---------------------------------------------------------------------------
# Services
# ---------------------------------------------------------------------------


@router.get(
    "/services",
    response_model=PaginatedResponse[ServiceRead],
    tags=["Admin Services"],
    responses=_AUTH_401,
    summary="List services",
)
def list_admin_services(
    publish_status: PublishStatus | None = Query(default=None),
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
    items, total = list_services(
        db,
        publish_status=publish_status,
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


@router.post(
    "/services",
    response_model=ServiceRead,
    status_code=status.HTTP_201_CREATED,
    tags=["Admin Services"],
    responses={**_AUTH_401, status.HTTP_422_UNPROCESSABLE_CONTENT: {"model": ErrorResponse}},
    summary="Create service",
)
def create_admin_service(payload: ServiceCreate, db: Session = Depends(get_db)) -> ServiceRead:
    return ServiceRead.model_validate(create_service(db, payload))


@router.get(
    "/services/{service_id}",
    response_model=ServiceRead,
    tags=["Admin Services"],
    responses={**_AUTH_401, status.HTTP_404_NOT_FOUND: {"model": ErrorResponse}},
    summary="Retrieve service",
)
def get_admin_service(service_id: uuid.UUID, db: Session = Depends(get_db)) -> ServiceRead:
    return ServiceRead.model_validate(get_service(db, service_id))


@router.patch(
    "/services/{service_id}",
    response_model=ServiceRead,
    tags=["Admin Services"],
    responses=_CRUD_RESPONSES,
    summary="Update service",
)
def patch_admin_service(
    service_id: uuid.UUID, payload: ServiceUpdate, db: Session = Depends(get_db)
) -> ServiceRead:
    return ServiceRead.model_validate(update_service(db, service_id, payload))


@router.delete(
    "/services/{service_id}",
    response_model=DeleteResponse,
    tags=["Admin Services"],
    responses={**_AUTH_401, status.HTTP_404_NOT_FOUND: {"model": ErrorResponse}},
    summary="Delete service",
)
def delete_admin_service(service_id: uuid.UUID, db: Session = Depends(get_db)) -> DeleteResponse:
    delete_service(db, service_id)
    return DeleteResponse(message="Service deleted successfully.", id=service_id)


# ---------------------------------------------------------------------------
# Skills
# ---------------------------------------------------------------------------


@router.get(
    "/skills",
    response_model=PaginatedResponse[SkillRead],
    tags=["Admin Skills"],
    responses=_AUTH_401,
    summary="List skill groups",
)
def list_admin_skills(
    publish_status: PublishStatus | None = Query(default=None),
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
    items, total = list_skills(
        db,
        publish_status=publish_status,
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


@router.post(
    "/skills",
    response_model=SkillRead,
    status_code=status.HTTP_201_CREATED,
    tags=["Admin Skills"],
    responses={**_AUTH_401, status.HTTP_422_UNPROCESSABLE_CONTENT: {"model": ErrorResponse}},
    summary="Create skill group",
)
def create_admin_skill(payload: SkillCreate, db: Session = Depends(get_db)) -> SkillRead:
    return SkillRead.model_validate(create_skill(db, payload))


@router.get(
    "/skills/{skill_id}",
    response_model=SkillRead,
    tags=["Admin Skills"],
    responses={**_AUTH_401, status.HTTP_404_NOT_FOUND: {"model": ErrorResponse}},
    summary="Retrieve skill group",
)
def get_admin_skill(skill_id: uuid.UUID, db: Session = Depends(get_db)) -> SkillRead:
    return SkillRead.model_validate(get_skill(db, skill_id))


@router.patch(
    "/skills/{skill_id}",
    response_model=SkillRead,
    tags=["Admin Skills"],
    responses=_CRUD_RESPONSES,
    summary="Update skill group",
)
def patch_admin_skill(
    skill_id: uuid.UUID, payload: SkillUpdate, db: Session = Depends(get_db)
) -> SkillRead:
    return SkillRead.model_validate(update_skill(db, skill_id, payload))


@router.delete(
    "/skills/{skill_id}",
    response_model=DeleteResponse,
    tags=["Admin Skills"],
    responses={**_AUTH_401, status.HTTP_404_NOT_FOUND: {"model": ErrorResponse}},
    summary="Delete skill group",
)
def delete_admin_skill(skill_id: uuid.UUID, db: Session = Depends(get_db)) -> DeleteResponse:
    delete_skill(db, skill_id)
    return DeleteResponse(message="Skill group deleted successfully.", id=skill_id)


# ---------------------------------------------------------------------------
# Experience
# ---------------------------------------------------------------------------


@router.get(
    "/experience",
    response_model=PaginatedResponse[ExperienceRead],
    tags=["Admin Career"],
    responses=_AUTH_401,
    summary="List experience entries",
)
def list_admin_experiences(
    publish_status: PublishStatus | None = Query(default=None),
    is_current: bool | None = Query(default=None),
    page: int = Query(default=1, ge=1, le=1000),
    page_size: int = Query(default=20, ge=1, le=100),
    sort_by: Literal["display_order", "created_at", "updated_at"] = Query(
        default="display_order"
    ),
    sort_order: Literal["asc", "desc"] = Query(default="asc"),
    db: Session = Depends(get_db),
) -> PaginatedResponse[ExperienceRead]:
    items, total = list_experiences(
        db,
        publish_status=publish_status,
        is_current=is_current,
        page=page,
        page_size=page_size,
        sort_by=sort_by,
        sort_order=sort_order,
    )
    return PaginatedResponse.create(
        items=[ExperienceRead.model_validate(item) for item in items],
        total=total,
        page=page,
        page_size=page_size,
    )


@router.post(
    "/experience",
    response_model=ExperienceRead,
    status_code=status.HTTP_201_CREATED,
    tags=["Admin Career"],
    responses={**_AUTH_401, status.HTTP_422_UNPROCESSABLE_CONTENT: {"model": ErrorResponse}},
    summary="Create experience entry",
)
def create_admin_experience(
    payload: ExperienceCreate, db: Session = Depends(get_db)
) -> ExperienceRead:
    return ExperienceRead.model_validate(create_experience(db, payload))


@router.get(
    "/experience/{experience_id}",
    response_model=ExperienceRead,
    tags=["Admin Career"],
    responses={**_AUTH_401, status.HTTP_404_NOT_FOUND: {"model": ErrorResponse}},
    summary="Retrieve experience entry",
)
def get_admin_experience(experience_id: uuid.UUID, db: Session = Depends(get_db)) -> ExperienceRead:
    return ExperienceRead.model_validate(get_experience(db, experience_id))


@router.patch(
    "/experience/{experience_id}",
    response_model=ExperienceRead,
    tags=["Admin Career"],
    responses=_CRUD_RESPONSES,
    summary="Update experience entry",
)
def patch_admin_experience(
    experience_id: uuid.UUID, payload: ExperienceUpdate, db: Session = Depends(get_db)
) -> ExperienceRead:
    return ExperienceRead.model_validate(update_experience(db, experience_id, payload))


@router.delete(
    "/experience/{experience_id}",
    response_model=DeleteResponse,
    tags=["Admin Career"],
    responses={**_AUTH_401, status.HTTP_404_NOT_FOUND: {"model": ErrorResponse}},
    summary="Delete experience entry",
)
def delete_admin_experience(
    experience_id: uuid.UUID, db: Session = Depends(get_db)
) -> DeleteResponse:
    delete_experience(db, experience_id)
    return DeleteResponse(message="Experience entry deleted successfully.", id=experience_id)


# ---------------------------------------------------------------------------
# Education
# ---------------------------------------------------------------------------


@router.get(
    "/education",
    response_model=PaginatedResponse[EducationRead],
    tags=["Admin Career"],
    responses=_AUTH_401,
    summary="List education entries",
)
def list_admin_education(
    publish_status: PublishStatus | None = Query(default=None),
    page: int = Query(default=1, ge=1, le=1000),
    page_size: int = Query(default=20, ge=1, le=100),
    sort_by: Literal["display_order", "created_at", "updated_at"] = Query(
        default="display_order"
    ),
    sort_order: Literal["asc", "desc"] = Query(default="asc"),
    db: Session = Depends(get_db),
) -> PaginatedResponse[EducationRead]:
    items, total = list_educations(
        db,
        publish_status=publish_status,
        page=page,
        page_size=page_size,
        sort_by=sort_by,
        sort_order=sort_order,
    )
    return PaginatedResponse.create(
        items=[EducationRead.model_validate(item) for item in items],
        total=total,
        page=page,
        page_size=page_size,
    )


@router.post(
    "/education",
    response_model=EducationRead,
    status_code=status.HTTP_201_CREATED,
    tags=["Admin Career"],
    responses={**_AUTH_401, status.HTTP_422_UNPROCESSABLE_CONTENT: {"model": ErrorResponse}},
    summary="Create education entry",
)
def create_admin_education(
    payload: EducationCreate, db: Session = Depends(get_db)
) -> EducationRead:
    return EducationRead.model_validate(create_education(db, payload))


@router.get(
    "/education/{education_id}",
    response_model=EducationRead,
    tags=["Admin Career"],
    responses={**_AUTH_401, status.HTTP_404_NOT_FOUND: {"model": ErrorResponse}},
    summary="Retrieve education entry",
)
def get_admin_education(education_id: uuid.UUID, db: Session = Depends(get_db)) -> EducationRead:
    return EducationRead.model_validate(get_education(db, education_id))


@router.patch(
    "/education/{education_id}",
    response_model=EducationRead,
    tags=["Admin Career"],
    responses=_CRUD_RESPONSES,
    summary="Update education entry",
)
def patch_admin_education(
    education_id: uuid.UUID, payload: EducationUpdate, db: Session = Depends(get_db)
) -> EducationRead:
    return EducationRead.model_validate(update_education(db, education_id, payload))


@router.delete(
    "/education/{education_id}",
    response_model=DeleteResponse,
    tags=["Admin Career"],
    responses={**_AUTH_401, status.HTTP_404_NOT_FOUND: {"model": ErrorResponse}},
    summary="Delete education entry",
)
def delete_admin_education(education_id: uuid.UUID, db: Session = Depends(get_db)) -> DeleteResponse:
    delete_education(db, education_id)
    return DeleteResponse(message="Education entry deleted successfully.", id=education_id)


# ---------------------------------------------------------------------------
# Certifications
# ---------------------------------------------------------------------------


@router.get(
    "/certifications",
    response_model=PaginatedResponse[CertificationRead],
    tags=["Admin Career"],
    responses=_AUTH_401,
    summary="List certifications",
)
def list_admin_certifications(
    publish_status: PublishStatus | None = Query(default=None),
    page: int = Query(default=1, ge=1, le=1000),
    page_size: int = Query(default=20, ge=1, le=100),
    sort_by: Literal["display_order", "created_at", "updated_at", "year"] = Query(
        default="display_order"
    ),
    sort_order: Literal["asc", "desc"] = Query(default="asc"),
    db: Session = Depends(get_db),
) -> PaginatedResponse[CertificationRead]:
    items, total = list_certifications(
        db,
        publish_status=publish_status,
        page=page,
        page_size=page_size,
        sort_by=sort_by,
        sort_order=sort_order,
    )
    return PaginatedResponse.create(
        items=[CertificationRead.model_validate(item) for item in items],
        total=total,
        page=page,
        page_size=page_size,
    )


@router.post(
    "/certifications",
    response_model=CertificationRead,
    status_code=status.HTTP_201_CREATED,
    tags=["Admin Career"],
    responses={**_AUTH_401, status.HTTP_422_UNPROCESSABLE_CONTENT: {"model": ErrorResponse}},
    summary="Create certification",
)
def create_admin_certification(
    payload: CertificationCreate, db: Session = Depends(get_db)
) -> CertificationRead:
    return CertificationRead.model_validate(create_certification(db, payload))


@router.get(
    "/certifications/{certification_id}",
    response_model=CertificationRead,
    tags=["Admin Career"],
    responses={**_AUTH_401, status.HTTP_404_NOT_FOUND: {"model": ErrorResponse}},
    summary="Retrieve certification",
)
def get_admin_certification(
    certification_id: uuid.UUID, db: Session = Depends(get_db)
) -> CertificationRead:
    return CertificationRead.model_validate(get_certification(db, certification_id))


@router.patch(
    "/certifications/{certification_id}",
    response_model=CertificationRead,
    tags=["Admin Career"],
    responses=_CRUD_RESPONSES,
    summary="Update certification",
)
def patch_admin_certification(
    certification_id: uuid.UUID,
    payload: CertificationUpdate,
    db: Session = Depends(get_db),
) -> CertificationRead:
    return CertificationRead.model_validate(update_certification(db, certification_id, payload))


@router.delete(
    "/certifications/{certification_id}",
    response_model=DeleteResponse,
    tags=["Admin Career"],
    responses={**_AUTH_401, status.HTTP_404_NOT_FOUND: {"model": ErrorResponse}},
    summary="Delete certification",
)
def delete_admin_certification(
    certification_id: uuid.UUID, db: Session = Depends(get_db)
) -> DeleteResponse:
    delete_certification(db, certification_id)
    return DeleteResponse(message="Certification deleted successfully.", id=certification_id)


# ---------------------------------------------------------------------------
# Testimonials
# ---------------------------------------------------------------------------


@router.get(
    "/testimonials",
    response_model=PaginatedResponse[TestimonialRead],
    tags=["Admin Testimonials"],
    responses=_AUTH_401,
    summary="List testimonials",
)
def list_admin_testimonials(
    publish_status: PublishStatus | None = Query(default=None),
    featured: bool | None = Query(default=None),
    page: int = Query(default=1, ge=1, le=1000),
    page_size: int = Query(default=20, ge=1, le=100),
    sort_by: Literal["display_order", "created_at", "updated_at", "title"] = Query(
        default="display_order"
    ),
    sort_order: Literal["asc", "desc"] = Query(default="asc"),
    db: Session = Depends(get_db),
) -> PaginatedResponse[TestimonialRead]:
    items, total = list_testimonials(
        db,
        publish_status=publish_status,
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
    "/testimonials",
    response_model=TestimonialRead,
    status_code=status.HTTP_201_CREATED,
    tags=["Admin Testimonials"],
    responses={**_AUTH_401, status.HTTP_422_UNPROCESSABLE_CONTENT: {"model": ErrorResponse}},
    summary="Create testimonial",
)
def create_admin_testimonial(
    payload: TestimonialCreate, db: Session = Depends(get_db)
) -> TestimonialRead:
    return TestimonialRead.model_validate(create_testimonial(db, payload))


@router.get(
    "/testimonials/{testimonial_id}",
    response_model=TestimonialRead,
    tags=["Admin Testimonials"],
    responses={**_AUTH_401, status.HTTP_404_NOT_FOUND: {"model": ErrorResponse}},
    summary="Retrieve testimonial",
)
def get_admin_testimonial(
    testimonial_id: uuid.UUID, db: Session = Depends(get_db)
) -> TestimonialRead:
    return TestimonialRead.model_validate(get_testimonial(db, testimonial_id))


@router.patch(
    "/testimonials/{testimonial_id}",
    response_model=TestimonialRead,
    tags=["Admin Testimonials"],
    responses=_CRUD_RESPONSES,
    summary="Update testimonial",
)
def patch_admin_testimonial(
    testimonial_id: uuid.UUID,
    payload: TestimonialUpdate,
    db: Session = Depends(get_db),
) -> TestimonialRead:
    return TestimonialRead.model_validate(update_testimonial(db, testimonial_id, payload))


@router.delete(
    "/testimonials/{testimonial_id}",
    response_model=DeleteResponse,
    tags=["Admin Testimonials"],
    responses={**_AUTH_401, status.HTTP_404_NOT_FOUND: {"model": ErrorResponse}},
    summary="Delete testimonial",
)
def delete_admin_testimonial(
    testimonial_id: uuid.UUID, db: Session = Depends(get_db)
) -> DeleteResponse:
    delete_testimonial(db, testimonial_id)
    return DeleteResponse(message="Testimonial deleted successfully.", id=testimonial_id)


@router.post(
    "/testimonials/{testimonial_id}/publish",
    response_model=TestimonialRead,
    tags=["Admin Testimonials"],
    responses=_CRUD_RESPONSES,
    summary="Publish testimonial",
)
def publish_admin_testimonial(
    testimonial_id: uuid.UUID, db: Session = Depends(get_db)
) -> TestimonialRead:
    return TestimonialRead.model_validate(
        set_testimonial_publish_state(db, testimonial_id, publish=True)
    )


@router.post(
    "/testimonials/{testimonial_id}/unpublish",
    response_model=TestimonialRead,
    tags=["Admin Testimonials"],
    responses={**_AUTH_401, status.HTTP_404_NOT_FOUND: {"model": ErrorResponse}},
    summary="Unpublish testimonial",
)
def unpublish_admin_testimonial(
    testimonial_id: uuid.UUID, db: Session = Depends(get_db)
) -> TestimonialRead:
    return TestimonialRead.model_validate(
        set_testimonial_publish_state(db, testimonial_id, publish=False)
    )
