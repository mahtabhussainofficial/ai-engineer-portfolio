"""Idempotent portfolio content importer with zero-write dry-run and schema validation."""

from __future__ import annotations

import uuid
from dataclasses import dataclass, field
from typing import Any, Literal

from pydantic import ValidationError
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.exceptions import AppError
from app.models.career import Certification, Education, Experience
from app.models.enums import PublishStatus
from app.models.media import MediaAsset
from app.models.project import Project
from app.models.service import Service
from app.models.site_setting import SiteSetting
from app.models.skill import Skill
from app.models.testimonial import Testimonial
from app.schemas.career import CertificationCreate, EducationCreate, ExperienceCreate
from app.schemas.media import MediaAssetCreate
from app.schemas.project import ProjectCreate
from app.schemas.service import ServiceCreate
from app.schemas.site_setting import SiteSettingCreate
from app.schemas.skill import SkillCreate
from app.schemas.testimonial import TestimonialCreate
from app.services.common import (
    sanitize_pydantic_errors,
    utc_now,
    validate_project_for_publish,
    validate_testimonial_for_publish,
)
from app.services.seeding.catalog import (
    CERTIFICATION_SEEDS,
    EDUCATION_SEEDS,
    EXPERIENCE_SEEDS,
    MEDIA_SEEDS,
    PROJECT_SEEDS,
    SERVICE_SEEDS,
    SITE_SETTING_SEEDS,
    SKILL_SEEDS,
    TESTIMONIAL_SEEDS,
    CertificationSeed,
    EducationSeed,
    ExperienceSeed,
    MediaSeed,
    ProjectSeed,
    ServiceSeed,
    SiteSettingSeed,
    SkillSeed,
    TestimonialSeed,
)

ImportAction = Literal["created", "skipped", "updated", "rejected"]


@dataclass(frozen=True)
class PortfolioSeedBundle:
    """Complete dataset passed into the portfolio importer."""

    media_assets: tuple[MediaSeed, ...] = MEDIA_SEEDS
    site_settings: tuple[SiteSettingSeed, ...] = SITE_SETTING_SEEDS
    services: tuple[ServiceSeed, ...] = SERVICE_SEEDS
    skills: tuple[SkillSeed, ...] = SKILL_SEEDS
    projects: tuple[ProjectSeed, ...] = PROJECT_SEEDS
    experience: tuple[ExperienceSeed, ...] = EXPERIENCE_SEEDS
    education: tuple[EducationSeed, ...] = EDUCATION_SEEDS
    certifications: tuple[CertificationSeed, ...] = CERTIFICATION_SEEDS
    testimonials: tuple[TestimonialSeed, ...] = TESTIMONIAL_SEEDS


@dataclass(frozen=True)
class ImportItemOutcome:
    """Outcome record for a single candidate item in an import run."""

    entity_type: str
    identifier: str
    action: ImportAction
    status_label: str | None = None
    reason: str | None = None

    def to_dict(self) -> dict[str, Any]:
        return {
            "entity_type": self.entity_type,
            "identifier": self.identifier,
            "action": self.action,
            "status_label": self.status_label,
            "reason": self.reason,
        }


@dataclass
class ImportEntityCounts:
    """Per-entity counters for created, skipped, updated, and rejected records."""

    created: int = 0
    skipped: int = 0
    updated: int = 0
    rejected: int = 0

    def increment(self, action: ImportAction) -> None:
        if action == "created":
            self.created += 1
        elif action == "skipped":
            self.skipped += 1
        elif action == "updated":
            self.updated += 1
        elif action == "rejected":
            self.rejected += 1

    def to_dict(self) -> dict[str, int]:
        return {
            "created": self.created,
            "skipped": self.skipped,
            "updated": self.updated,
            "rejected": self.rejected,
        }


@dataclass
class ImportReport:
    """Structured summary of an import or dry-run execution."""

    dry_run: bool
    items: list[ImportItemOutcome] = field(default_factory=list)
    by_entity: dict[str, ImportEntityCounts] = field(default_factory=dict)

    @property
    def created(self) -> int:
        return sum(counts.created for counts in self.by_entity.values())

    @property
    def skipped(self) -> int:
        return sum(counts.skipped for counts in self.by_entity.values())

    @property
    def updated(self) -> int:
        return sum(counts.updated for counts in self.by_entity.values())

    @property
    def rejected(self) -> int:
        return sum(counts.rejected for counts in self.by_entity.values())

    def record(self, outcome: ImportItemOutcome) -> None:
        self.items.append(outcome)
        counts = self.by_entity.setdefault(outcome.entity_type, ImportEntityCounts())
        counts.increment(outcome.action)

    def to_dict(self) -> dict[str, Any]:
        return {
            "dry_run": self.dry_run,
            "totals": {
                "created": self.created,
                "skipped": self.skipped,
                "updated": self.updated,
                "rejected": self.rejected,
            },
            "by_entity": {
                entity: counts.to_dict() for entity, counts in self.by_entity.items()
            },
            "items": [item.to_dict() for item in self.items],
        }


def _norm_key(*parts: str) -> tuple[str, ...]:
    return tuple(part.strip().lower() for part in parts)


def _format_validation_error(exc: ValidationError) -> str:
    details = sanitize_pydantic_errors(exc)
    if not details:
        return "Schema validation failed."
    first = details[0]
    loc = ".".join(str(part) for part in first.get("loc", ()))
    msg = first.get("msg", "Invalid value")
    return f"{loc}: {msg}" if loc else msg


def _resolve_media_ref(
    media_url: str | None,
    media_by_url: dict[str, uuid.UUID],
) -> tuple[uuid.UUID | None, bool]:
    if media_url is None:
        return None, True
    resolved = media_by_url.get(media_url.strip())
    return resolved, resolved is not None


def _published_at_for(status_value: PublishStatus, now: Any) -> Any:
    return now if status_value == PublishStatus.PUBLISHED else None


def import_portfolio_content(
    db: Session,
    *,
    dry_run: bool = True,
    bundle: PortfolioSeedBundle | None = None,
) -> ImportReport:
    """Validate and safely import missing portfolio records without overwriting admin edits.

    When `dry_run=True`, only read (`SELECT`) queries and in-memory schema/policy
    validations are executed; no writes or commits are issued.
    """
    active_bundle = bundle or PortfolioSeedBundle()
    report = ImportReport(dry_run=dry_run)
    now = utc_now()

    # Track existing + in-batch media URLs -> UUIDs
    existing_media_rows = db.execute(select(MediaAsset.url, MediaAsset.id)).all()
    media_by_url: dict[str, uuid.UUID] = {url.strip(): media_id for url, media_id in existing_media_rows}
    seen_media_urls = set(media_by_url.keys())
    in_memory_media_ids: set[uuid.UUID] = set()

    for seed in active_bundle.media_assets:
        url_key = seed.url.strip()
        if url_key in seen_media_urls:
            report.record(
                ImportItemOutcome(
                    entity_type="media_assets",
                    identifier=seed.url,
                    action="skipped",
                    reason="Already exists in database (preserved without overwriting).",
                )
            )
            continue

        try:
            validated = MediaAssetCreate(
                title=seed.title,
                file_name=seed.file_name,
                storage_provider=seed.storage_provider,
                storage_key=seed.storage_key,
                url=seed.url,
                mime_type=seed.mime_type,
                file_size_bytes=seed.file_size_bytes,
                width=seed.width,
                height=seed.height,
                alt_text=seed.alt_text,
                caption=seed.caption,
            )
        except ValidationError as exc:
            report.record(
                ImportItemOutcome(
                    entity_type="media_assets",
                    identifier=seed.url,
                    action="rejected",
                    reason=_format_validation_error(exc),
                )
            )
            continue

        seen_media_urls.add(url_key)
        if dry_run:
            placeholder_id = uuid.uuid4()
            media_by_url[url_key] = placeholder_id
            in_memory_media_ids.add(placeholder_id)
        else:
            record = MediaAsset(**validated.model_dump(mode="json"))
            db.add(record)
            db.flush()
            media_by_url[url_key] = record.id

        report.record(
            ImportItemOutcome(
                entity_type="media_assets",
                identifier=seed.url,
                action="created",
                status_label=seed.storage_provider.value,
            )
        )

    # Site settings (match key)
    existing_setting_keys = set(db.scalars(select(SiteSetting.key)).all())
    for seed in active_bundle.site_settings:
        if seed.key in existing_setting_keys:
            report.record(
                ImportItemOutcome(
                    entity_type="site_settings",
                    identifier=seed.key,
                    action="skipped",
                    status_label="public" if seed.is_public else "private",
                    reason="Already exists in database (preserved without overwriting).",
                )
            )
            continue

        portrait_id, found_portrait = _resolve_media_ref(seed.portrait_media_url, media_by_url)
        if not found_portrait:
            report.record(
                ImportItemOutcome(
                    entity_type="site_settings",
                    identifier=seed.key,
                    action="rejected",
                    reason=f"Referenced portrait media '{seed.portrait_media_url}' does not exist.",
                )
            )
            continue

        try:
            validated_setting = SiteSettingCreate(
                key=seed.key,
                label=seed.label,
                category=seed.category,
                description=seed.description,
                value=seed.value,
                is_public=seed.is_public,
                portrait_media_id=portrait_id,
            )
        except (ValidationError, ValueError) as exc:
            reason = _format_validation_error(exc) if isinstance(exc, ValidationError) else str(exc)
            report.record(
                ImportItemOutcome(
                    entity_type="site_settings",
                    identifier=seed.key,
                    action="rejected",
                    reason=reason,
                )
            )
            continue

        existing_setting_keys.add(seed.key)
        if not dry_run:
            db.add(
                SiteSetting(
                    key=validated_setting.key,
                    label=validated_setting.label,
                    category=validated_setting.category,
                    description=validated_setting.description,
                    value=validated_setting.value,
                    is_public=validated_setting.is_public,
                    portrait_media_id=validated_setting.portrait_media_id,
                )
            )
        report.record(
            ImportItemOutcome(
                entity_type="site_settings",
                identifier=seed.key,
                action="created",
                status_label="public" if seed.is_public else "private",
            )
        )

    # Services (match category + title)
    existing_services = {
        _norm_key(cat, title)
        for cat, title in db.execute(select(Service.category, Service.title)).all()
    }
    for seed in active_bundle.services:
        key = _norm_key(seed.category, seed.title)
        if key in existing_services:
            report.record(
                ImportItemOutcome(
                    entity_type="services",
                    identifier=seed.title,
                    action="skipped",
                    status_label=seed.publish_status.value,
                    reason="Already exists in database (preserved without overwriting).",
                )
            )
            continue

        published_at = _published_at_for(seed.publish_status, now)
        try:
            validated_srv = ServiceCreate(
                display_number=seed.display_number,
                category=seed.category,
                domain=seed.domain,
                title=seed.title,
                description=seed.description,
                tools=seed.tools,
                featured=seed.featured,
                home_category_label=seed.home_category_label,
                home_title=seed.home_title,
                home_description=seed.home_description,
                home_tags=seed.home_tags,
                publish_status=seed.publish_status,
                published_at=published_at,
                display_order=seed.display_order,
            )
        except ValidationError as exc:
            report.record(
                ImportItemOutcome(
                    entity_type="services",
                    identifier=seed.title,
                    action="rejected",
                    reason=_format_validation_error(exc),
                )
            )
            continue

        existing_services.add(key)
        if not dry_run:
            srv_data = validated_srv.model_dump()
            srv_data["publish_status"] = validated_srv.publish_status.value
            db.add(Service(**srv_data))
        report.record(
            ImportItemOutcome(
                entity_type="services",
                identifier=seed.title,
                action="created",
                status_label=seed.publish_status.value,
            )
        )

    # Skills (match layer + title)
    existing_skills = {
        _norm_key(layer, title)
        for layer, title in db.execute(select(Skill.layer, Skill.title)).all()
    }
    for seed in active_bundle.skills:
        key = _norm_key(seed.layer.value, seed.title)
        if key in existing_skills:
            report.record(
                ImportItemOutcome(
                    entity_type="skills",
                    identifier=f"{seed.layer.value}:{seed.title}",
                    action="skipped",
                    status_label=seed.publish_status.value,
                    reason="Already exists in database (preserved without overwriting).",
                )
            )
            continue

        published_at = _published_at_for(seed.publish_status, now)
        try:
            validated_skl = SkillCreate(
                layer=seed.layer,
                display_number=seed.display_number,
                domain=seed.domain,
                title=seed.title,
                description=seed.description,
                items=seed.items,
                featured=seed.featured,
                featured_category=seed.featured_category,
                featured_title=seed.featured_title,
                featured_description=seed.featured_description,
                featured_tags=seed.featured_tags,
                publish_status=seed.publish_status,
                published_at=published_at,
                display_order=seed.display_order,
            )
        except ValidationError as exc:
            report.record(
                ImportItemOutcome(
                    entity_type="skills",
                    identifier=f"{seed.layer.value}:{seed.title}",
                    action="rejected",
                    reason=_format_validation_error(exc),
                )
            )
            continue

        existing_skills.add(key)
        if not dry_run:
            skl_data = validated_skl.model_dump()
            skl_data["layer"] = validated_skl.layer.value
            skl_data["publish_status"] = validated_skl.publish_status.value
            db.add(Skill(**skl_data))
        report.record(
            ImportItemOutcome(
                entity_type="skills",
                identifier=f"{seed.layer.value}:{seed.title}",
                action="created",
                status_label=seed.publish_status.value,
            )
        )

    # Projects (match unique slug)
    existing_project_slugs = {s.strip().lower() for s in db.scalars(select(Project.slug)).all()}
    for seed in active_bundle.projects:
        slug_key = seed.slug.strip().lower()
        if slug_key in existing_project_slugs:
            report.record(
                ImportItemOutcome(
                    entity_type="projects",
                    identifier=seed.slug,
                    action="skipped",
                    status_label=seed.publish_status.value,
                    reason="Already exists in database (preserved without overwriting).",
                )
            )
            continue

        cover_id, found_cover = _resolve_media_ref(seed.cover_media_url, media_by_url)
        if not found_cover:
            report.record(
                ImportItemOutcome(
                    entity_type="projects",
                    identifier=seed.slug,
                    action="rejected",
                    reason=f"Referenced cover media '{seed.cover_media_url}' does not exist.",
                )
            )
            continue

        published_at = _published_at_for(seed.publish_status, now)
        try:
            validated_proj = ProjectCreate(
                slug=seed.slug,
                display_number=seed.display_number,
                title=seed.title,
                category=seed.category,
                home_category_label=seed.home_category_label,
                project_type=seed.project_type,
                publish_status=seed.publish_status,
                published_at=published_at,
                featured=seed.featured,
                display_order=seed.display_order,
                summary=seed.summary,
                problem=seed.problem,
                solution=seed.solution,
                deliverables=seed.deliverables,
                tags=seed.tags,
                live_url=seed.live_url,
                repo_url=seed.repo_url,
                cover_media_id=cover_id,
            )
            proj_data = validated_proj.model_dump()
            proj_data["project_type"] = validated_proj.project_type.value
            proj_data["publish_status"] = validated_proj.publish_status.value
            proj_data["live_url"] = (
                str(validated_proj.live_url) if validated_proj.live_url is not None else None
            )
            proj_data["repo_url"] = (
                str(validated_proj.repo_url) if validated_proj.repo_url is not None else None
            )
            candidate_proj = Project(**proj_data)
            if seed.publish_status == PublishStatus.PUBLISHED:
                if dry_run and cover_id in in_memory_media_ids:
                    candidate_proj.cover_media_id = None
                    validate_project_for_publish(db, candidate_proj)
                    candidate_proj.cover_media_id = cover_id
                else:
                    validate_project_for_publish(db, candidate_proj)
        except (ValidationError, AppError) as exc:
            reason = (
                _format_validation_error(exc)
                if isinstance(exc, ValidationError)
                else exc.message
            )
            report.record(
                ImportItemOutcome(
                    entity_type="projects",
                    identifier=seed.slug,
                    action="rejected",
                    reason=reason,
                )
            )
            continue

        existing_project_slugs.add(slug_key)
        if not dry_run:
            db.add(candidate_proj)
        report.record(
            ImportItemOutcome(
                entity_type="projects",
                identifier=seed.slug,
                action="created",
                status_label=seed.publish_status.value,
            )
        )

    # Experience (match period + role + organization)
    existing_exp = {
        _norm_key(p, r, o)
        for p, r, o in db.execute(
            select(Experience.period, Experience.role, Experience.organization)
        ).all()
    }
    for seed in active_bundle.experience:
        key = _norm_key(seed.period, seed.role, seed.organization)
        ident = f"{seed.period} | {seed.role} @ {seed.organization}"
        if key in existing_exp:
            report.record(
                ImportItemOutcome(
                    entity_type="experience",
                    identifier=ident,
                    action="skipped",
                    status_label=seed.publish_status.value,
                    reason="Already exists in database (preserved without overwriting).",
                )
            )
            continue

        published_at = _published_at_for(seed.publish_status, now)
        try:
            validated_exp = ExperienceCreate(
                period=seed.period,
                role=seed.role,
                organization=seed.organization,
                summary=seed.summary,
                is_current=seed.is_current,
                publish_status=seed.publish_status,
                published_at=published_at,
                display_order=seed.display_order,
            )
        except ValidationError as exc:
            report.record(
                ImportItemOutcome(
                    entity_type="experience",
                    identifier=ident,
                    action="rejected",
                    reason=_format_validation_error(exc),
                )
            )
            continue

        existing_exp.add(key)
        if not dry_run:
            exp_data = validated_exp.model_dump()
            exp_data["publish_status"] = validated_exp.publish_status.value
            db.add(Experience(**exp_data))
        report.record(
            ImportItemOutcome(
                entity_type="experience",
                identifier=ident,
                action="created",
                status_label=seed.publish_status.value,
                reason=seed.verification_note,
            )
        )

    # Education (match period + degree + institution)
    existing_edu = {
        _norm_key(p, d, i)
        for p, d, i in db.execute(
            select(Education.period, Education.degree, Education.institution)
        ).all()
    }
    for seed in active_bundle.education:
        key = _norm_key(seed.period, seed.degree, seed.institution)
        ident = f"{seed.period} | {seed.degree} @ {seed.institution}"
        if key in existing_edu:
            report.record(
                ImportItemOutcome(
                    entity_type="education",
                    identifier=ident,
                    action="skipped",
                    status_label=seed.publish_status.value,
                    reason="Already exists in database (preserved without overwriting).",
                )
            )
            continue

        published_at = _published_at_for(seed.publish_status, now)
        try:
            validated_edu = EducationCreate(
                period=seed.period,
                degree=seed.degree,
                institution=seed.institution,
                publish_status=seed.publish_status,
                published_at=published_at,
                display_order=seed.display_order,
            )
        except ValidationError as exc:
            report.record(
                ImportItemOutcome(
                    entity_type="education",
                    identifier=ident,
                    action="rejected",
                    reason=_format_validation_error(exc),
                )
            )
            continue

        existing_edu.add(key)
        if not dry_run:
            edu_data = validated_edu.model_dump()
            edu_data["publish_status"] = validated_edu.publish_status.value
            db.add(Education(**edu_data))
        report.record(
            ImportItemOutcome(
                entity_type="education",
                identifier=ident,
                action="created",
                status_label=seed.publish_status.value,
                reason=seed.verification_note,
            )
        )

    # Certifications (match year + title + issuer)
    existing_certs = {
        _norm_key(y, t, i)
        for y, t, i in db.execute(
            select(Certification.year, Certification.title, Certification.issuer)
        ).all()
    }
    for seed in active_bundle.certifications:
        key = _norm_key(seed.year, seed.title, seed.issuer)
        ident = f"{seed.year} | {seed.title} ({seed.issuer})"
        if key in existing_certs:
            report.record(
                ImportItemOutcome(
                    entity_type="certifications",
                    identifier=ident,
                    action="skipped",
                    status_label=seed.publish_status.value,
                    reason="Already exists in database (preserved without overwriting).",
                )
            )
            continue

        badge_id, found_badge = _resolve_media_ref(seed.badge_media_url, media_by_url)
        if not found_badge:
            report.record(
                ImportItemOutcome(
                    entity_type="certifications",
                    identifier=ident,
                    action="rejected",
                    reason=f"Referenced badge media '{seed.badge_media_url}' does not exist.",
                )
            )
            continue

        published_at = _published_at_for(seed.publish_status, now)
        try:
            validated_cert = CertificationCreate(
                year=seed.year,
                title=seed.title,
                issuer=seed.issuer,
                badge_media_id=badge_id,
                publish_status=seed.publish_status,
                published_at=published_at,
                display_order=seed.display_order,
            )
        except ValidationError as exc:
            report.record(
                ImportItemOutcome(
                    entity_type="certifications",
                    identifier=ident,
                    action="rejected",
                    reason=_format_validation_error(exc),
                )
            )
            continue

        existing_certs.add(key)
        if not dry_run:
            cert_data = validated_cert.model_dump()
            cert_data["publish_status"] = validated_cert.publish_status.value
            db.add(Certification(**cert_data))
        report.record(
            ImportItemOutcome(
                entity_type="certifications",
                identifier=ident,
                action="created",
                status_label=seed.publish_status.value,
                reason=seed.verification_note,
            )
        )

    # Testimonials (match title + source)
    existing_testimonials = {
        _norm_key(t, s)
        for t, s in db.execute(select(Testimonial.title, Testimonial.source)).all()
    }
    for seed in active_bundle.testimonials:
        key = _norm_key(seed.title, seed.source)
        ident = f"{seed.title} [{seed.source}]"
        if key in existing_testimonials:
            report.record(
                ImportItemOutcome(
                    entity_type="testimonials",
                    identifier=ident,
                    action="skipped",
                    status_label=seed.publish_status.value,
                    reason="Already exists in database (preserved without overwriting).",
                )
            )
            continue

        avatar_id, found_avatar = _resolve_media_ref(seed.avatar_media_url, media_by_url)
        if not found_avatar:
            report.record(
                ImportItemOutcome(
                    entity_type="testimonials",
                    identifier=ident,
                    action="rejected",
                    reason=f"Referenced avatar media '{seed.avatar_media_url}' does not exist.",
                )
            )
            continue

        published_at = _published_at_for(seed.publish_status, now)
        try:
            validated_test = TestimonialCreate(
                title=seed.title,
                author_name=seed.author_name,
                author_role=seed.author_role,
                quote=seed.quote,
                rating_score=seed.rating_score,
                rating_label=seed.rating_label,
                stars=seed.stars,
                source=seed.source,
                source_url=seed.source_url,
                avatar_media_id=avatar_id,
                featured=seed.featured,
                publish_status=seed.publish_status,
                published_at=published_at,
                display_order=seed.display_order,
            )
            test_data = validated_test.model_dump()
            test_data["publish_status"] = validated_test.publish_status.value
            test_data["source_url"] = (
                str(validated_test.source_url) if validated_test.source_url is not None else None
            )
            candidate_test = Testimonial(**test_data)
            if seed.publish_status == PublishStatus.PUBLISHED:
                if dry_run and avatar_id in in_memory_media_ids:
                    candidate_test.avatar_media_id = None
                    validate_testimonial_for_publish(db, candidate_test)
                    candidate_test.avatar_media_id = avatar_id
                else:
                    validate_testimonial_for_publish(db, candidate_test)
        except (ValidationError, AppError) as exc:
            reason = (
                _format_validation_error(exc)
                if isinstance(exc, ValidationError)
                else exc.message
            )
            report.record(
                ImportItemOutcome(
                    entity_type="testimonials",
                    identifier=ident,
                    action="rejected",
                    reason=reason,
                )
            )
            continue

        existing_testimonials.add(key)
        if not dry_run:
            db.add(candidate_test)
        report.record(
            ImportItemOutcome(
                entity_type="testimonials",
                identifier=ident,
                action="created",
                status_label=seed.publish_status.value,
                reason=seed.verification_note,
            )
        )

    if not dry_run:
        try:
            db.commit()
        except IntegrityError as exc:
            db.rollback()
            raise RuntimeError(
                "Import transaction rolled back due to a database constraint conflict."
            ) from exc

    return report
