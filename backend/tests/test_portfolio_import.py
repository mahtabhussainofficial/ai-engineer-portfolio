"""Tests for Sub-phase 3D idempotent portfolio content importer and CLI."""

from __future__ import annotations

from decimal import Decimal

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import func, select
from sqlalchemy.orm import Session, sessionmaker

from app.cli import import_content as import_cli
from app.core.config import Settings
from app.models import (
    Certification,
    Education,
    Experience,
    MediaAsset,
    Project,
    Service,
    SiteSetting,
    Skill,
)
from app.models.enums import ProjectType, PublishStatus, StorageProvider
from app.services.seeding.catalog import (
    MediaSeed,
    ProjectSeed,
    ServiceSeed,
    SiteSettingSeed,
)
from app.services.seeding.catalog import (
    TestimonialSeed as ReviewSeed,
)
from app.services.seeding.importer import PortfolioSeedBundle, import_portfolio_content


def test_dry_run_validates_all_frontend_content_with_zero_writes(
    db_session: Session,
) -> None:
    from app.models.testimonial import Testimonial

    report = import_portfolio_content(db_session, dry_run=True)

    assert report.dry_run is True
    assert report.created == 34
    assert report.skipped == 0
    assert report.updated == 0
    assert report.rejected == 0

    assert report.by_entity["media_assets"].created == 1
    assert report.by_entity["site_settings"].created == 5
    assert report.by_entity["services"].created == 8
    assert report.by_entity["skills"].created == 7
    assert report.by_entity["projects"].created == 4
    assert report.by_entity["experience"].created == 3
    assert report.by_entity["education"].created == 1
    assert report.by_entity["certifications"].created == 2
    assert report.by_entity["testimonials"].created == 3

    # Verify placeholder and unverified entries remain draft in plan
    draft_items = [item for item in report.items if item.status_label == "draft"]
    assert len(draft_items) == 9  # 3 exp + 1 edu + 2 certs + 3 testimonials

    # Confirm zero database writes occurred
    for model_cls in (
        MediaAsset,
        SiteSetting,
        Service,
        Skill,
        Project,
        Experience,
        Education,
        Certification,
        Testimonial,
    ):
        assert db_session.scalar(select(func.count()).select_from(model_cls)) == 0


def test_apply_import_is_idempotent_preserves_admin_edits_and_respects_public_visibility(
    auth_client: tuple[TestClient, sessionmaker[Session], Settings],
) -> None:
    client, session_factory, _settings = auth_client

    with session_factory() as db:
        first_report = import_portfolio_content(db, dry_run=False)
        assert first_report.dry_run is False
        assert first_report.created == 34
        assert first_report.rejected == 0

        portrait = db.scalar(select(MediaAsset).where(MediaAsset.url == "/shabnum-portrait.jpg"))
        assert portrait is not None
        home_row = db.scalar(select(SiteSetting).where(SiteSetting.key == "home_page"))
        about_row = db.scalar(select(SiteSetting).where(SiteSetting.key == "about_page"))
        assert home_row is not None and home_row.portrait_media_id == portrait.id
        assert about_row is not None and about_row.portrait_media_id == portrait.id

    # Verify Sub-phase 3C public endpoints expose only verified published content
    site_res = client.get("/api/v1/public/site")
    assert site_res.status_code == 200
    site_json = site_res.json()
    assert site_json["site_general"]["owner_name"] == "Shabnum H."
    assert site_json["portrait_media"]["url"] == "/shabnum-portrait.jpg"
    assert site_json["about_page"]["bio_paragraphs"]
    assert site_json["contact_page"]["project_types"]
    assert site_json["skills_page"]["layers"]

    assert client.get("/api/v1/public/services").json()["total"] == 8
    assert client.get("/api/v1/public/skills").json()["total"] == 7
    assert client.get("/api/v1/public/projects").json()["total"] == 4

    bg_json = client.get("/api/v1/public/background").json()
    assert bg_json["experience"] == []
    assert bg_json["education"] == []
    assert bg_json["certifications"] == []
    assert client.get("/api/v1/public/testimonials").json()["total"] == 0

    # Simulate admin edits to existing records, then re-run importer
    with session_factory() as db:
        edited_project = db.scalar(select(Project).where(Project.slug == "knowledge-assistant"))
        assert edited_project is not None
        edited_project.title = "Admin Customized Knowledge Assistant"

        edited_setting = db.scalar(select(SiteSetting).where(SiteSetting.key == "site_general"))
        assert edited_setting is not None
        edited_setting.label = "Admin Customized Label"
        db.commit()

    with session_factory() as db:
        second_report = import_portfolio_content(db, dry_run=False)
        assert second_report.created == 0
        assert second_report.skipped == 34
        assert second_report.updated == 0
        assert second_report.rejected == 0

        preserved_project = db.scalar(select(Project).where(Project.slug == "knowledge-assistant"))
        preserved_setting = db.scalar(select(SiteSetting).where(SiteSetting.key == "site_general"))
        assert preserved_project is not None
        assert preserved_setting is not None
        assert preserved_project.title == "Admin Customized Knowledge Assistant"
        assert preserved_setting.label == "Admin Customized Label"


def test_import_rejects_invalid_and_unpublishable_records_safely(db_session: Session) -> None:
    bundle = PortfolioSeedBundle(
        media_assets=(
            MediaSeed(
                title="Bad Media",
                file_name="bad.png",
                storage_provider=StorageProvider.EXTERNAL,
                storage_key=None,
                url="javascript:alert(1)",
                mime_type="image/png",
                file_size_bytes=None,
                width=None,
                height=None,
                alt_text=None,
                caption=None,
            ),
        ),
        site_settings=(
            SiteSettingSeed(
                key="internal_secret",
                label="Disallowed Public",
                category="admin",
                description=None,
                is_public=True,
                value={"secret": "value"},
            ),
            SiteSettingSeed(
                key="home_page",
                label="Missing Portrait",
                category="pages",
                description=None,
                is_public=True,
                value={},
                portrait_media_url="/missing.jpg",
            ),
        ),
        services=(
            ServiceSeed(
                display_number="01",
                category="Agents & Voice",
                domain="AUTOMATION",
                title="Valid Service",
                description="Reliable agentic workflow orchestration for business teams.",
                tools=["Python"],
                featured=True,
                home_category_label=None,
                home_title=None,
                home_description=None,
                home_tags=None,
                publish_status=PublishStatus.PUBLISHED,
                display_order=1,
            ),
        ),
        skills=(),
        projects=(
            ProjectSeed(
                slug="bad_slug_format",
                display_number="01",
                title="Bad Slug Project",
                category="AI",
                home_category_label=None,
                project_type=ProjectType.CONCEPT_BRIEF,
                publish_status=PublishStatus.PUBLISHED,
                featured=False,
                display_order=1,
                summary="Valid summary text long enough.",
                problem="Valid problem text long enough.",
                solution="Valid solution text long enough.",
                deliverables=[],
                tags=[],
            ),
        ),
        experience=(),
        education=(),
        certifications=(),
        testimonials=(
            ReviewSeed(
                title="Missing Author Review",
                rating_score=Decimal("5.0"),
                rating_label="5.0",
                stars=5,
                source="Upwork",
                featured=True,
                publish_status=PublishStatus.PUBLISHED,
                display_order=1,
                author_name=None,
                quote=None,
            ),
        ),
    )

    report = import_portfolio_content(db_session, dry_run=False, bundle=bundle)
    assert report.created == 1  # Valid Service
    assert report.rejected == 5  # Bad Media, 2 SiteSettings, Bad Project, Unpublishable Testimonial
    assert db_session.scalar(select(func.count()).select_from(Service)) == 1


def test_cli_import_content_dry_run_and_apply(
    auth_client: tuple[TestClient, sessionmaker[Session], Settings],
    monkeypatch: pytest.MonkeyPatch,
    capsys: pytest.CaptureFixture[str],
) -> None:
    _client, session_factory, settings = auth_client
    monkeypatch.setattr(import_cli, "get_settings", lambda: settings)

    # Default / explicit --dry-run exits 0 with zero DB writes
    assert import_cli.main(["--dry-run"]) == 0
    dry_out = capsys.readouterr().out
    assert "DRY-RUN (zero DB writes)" in dry_out
    assert "created=34, skipped=0, updated=0, rejected=0" in dry_out

    with session_factory() as db:
        assert db.scalar(select(func.count()).select_from(Project)) == 0

    # --apply persists records cleanly
    assert import_cli.main(["--apply"]) == 0
    apply_out = capsys.readouterr().out
    assert "APPLIED" in apply_out
    assert "created=34, skipped=0, updated=0, rejected=0" in apply_out

    # Second --apply skips all existing records
    assert import_cli.main(["--apply", "--json"]) == 0
    json_out = capsys.readouterr().out
    assert '"skipped": 34' in json_out
