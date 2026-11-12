"""Tests for Sub-phase 3C public portfolio and contact submission endpoints."""

from __future__ import annotations

import json
import uuid
from collections.abc import Generator
from typing import Any

from fastapi.testclient import TestClient
from sqlalchemy.exc import OperationalError
from sqlalchemy.orm import Session, sessionmaker

from app.core.config import Settings
from app.db.session import get_db
from app.models import (
    Certification,
    ContactMessage,
    Education,
    Experience,
    MediaAsset,
    Project,
    Service,
    SiteSetting,
    Skill,
)
from app.models.enums import ContactMessageStatus, PublishStatus, SkillLayer


def _sample_site_general_value(logo_media_id: str | None = None) -> dict[str, Any]:
    return {
        "initials": "SH",
        "owner_name": "Shabnum H.",
        "professional_title": "AI Engineer & Backend Developer",
        "brand_name": "SHABNUM H.",
        "tagline": "Building practical AI workflows and Python backends.",
        "direct_email": "hello@example.com",
        "cv_url": "/cv.pdf",
        "tech_note": "AI / BACKEND / SYSTEMS",
        "copyright_year": 2026,
        "copyright_note": "Built with Next.js & Tailwind CSS.",
        "meta_title_default": "Shabnum H. | AI Engineer",
        "meta_title_template": "%s | Shabnum H.",
        "meta_description": "Practical AI applications, RAG systems, and FastAPI backends.",
        "logo_media_id": logo_media_id,
        "connect_channels": [
            {
                "id": "email",
                "label": "Email",
                "handle_placeholder": "Use the contact form",
                "icon": "mail",
                "href": "/contact",
                "external": False,
            }
        ],
    }


def _sample_home_page_value() -> dict[str, Any]:
    return {
        "hero_eyebrow": "HELLO, I'M SHABNUM H.",
        "hero_heading_primary": "AI Engineer &",
        "hero_heading_secondary": "Backend Developer.",
        "hero_summary": "Building reliable AI systems and FastAPI backend services.",
        "hero_specializations": ["Agentic AI", "RAG Systems"],
        "hero_portrait_alt": "Portrait of Shabnum H.",
        "hero_primary_cta": {"label": "View Projects", "href": "#projects"},
        "hero_secondary_cta": {"label": "Contact Me", "href": "/contact"},
        "about_eyebrow": "01 / ABOUT",
        "about_side_note": "Thoughtful automation for growing businesses.",
        "about_title": "Systems that move businesses forward.",
        "about_description": "Delivering production AI applications beyond the demo.",
        "about_cta": {"label": "Read more about me", "href": "/about"},
        "highlights_eyebrow": "AT A GLANCE",
        "highlights_title": "Built for practical progress.",
        "highlights_note": "Highlights from current engineering record.",
        "highlights": [{"id": "exp", "index": "01 / EXPERIENCE", "value": "5+", "label": "Years"}],
        "services_section": {
            "eyebrow": "02 / SERVICES",
            "title": "Capabilities",
            "description": "Core areas of AI engineering.",
            "cta_label": "View all services",
            "cta_href": "/services",
        },
        "projects_section": {
            "eyebrow": "03 / PROJECTS",
            "title": "Selected work",
            "description": "Representative AI and backend systems.",
            "cta_label": "View all projects",
            "cta_href": "/projects",
        },
        "skills_section": {
            "eyebrow": "04 / SKILLS",
            "title": "Tools behind the work",
            "description": "Concise preview of core technologies.",
            "cta_label": "Explore all skills",
            "cta_href": "/skills",
        },
        "process_eyebrow": "05 / PROCESS",
        "process_title": "From question to system.",
        "process_note": "Structured engineering.",
        "process_steps": [
            {"number": "01", "title": "Understand", "description": "Clarify goals and constraints."}
        ],
        "testimonials_eyebrow": "06 / CLIENT FEEDBACK",
        "testimonials_title": "Trusted delivery.",
        "testimonials_note": "Selected client feedback.",
        "contact_cta": {
            "eyebrow": "07 / CONTACT",
            "title": "Let's build something useful",
            "description": "Share your problem and technical goals.",
            "primary_cta": {"label": "Start a conversation", "href": "/contact"},
            "secondary_cta": {"label": "View services", "href": "/services"},
        },
    }


def _assert_no_private_keys(payload: Any) -> None:
    serialized = json.dumps(payload)
    for forbidden in ("admin_notes", "source_ip", "user_agent", "handled_by_id", "password_hash"):
        assert forbidden not in serialized


def test_public_endpoints_empty_state_without_authentication(
    auth_client: tuple[TestClient, sessionmaker[Session], Settings],
) -> None:
    client, _session_factory, _settings = auth_client

    site_res = client.get("/api/v1/public/site")
    assert site_res.status_code == 200
    assert site_res.json() == {
        "site_general": None,
        "home_page": None,
        "about_page": None,
        "contact_page": None,
        "skills_page": None,
        "portrait_media": None,
        "logo_media": None,
    }

    for path in (
        "/api/v1/public/services",
        "/api/v1/public/skills",
        "/api/v1/public/projects",
        "/api/v1/public/testimonials",
    ):
        res = client.get(path)
        assert res.status_code == 200, path
        assert res.json() == {
            "items": [],
            "total": 0,
            "page": 1,
            "page_size": 20,
            "total_pages": 0,
        }

    bg_res = client.get("/api/v1/public/background")
    assert bg_res.status_code == 200
    assert bg_res.json() == {"experience": [], "education": [], "certifications": []}


def test_public_site_settings_whitelisting_visibility_and_media_resolution(
    auth_client: tuple[TestClient, sessionmaker[Session], Settings],
) -> None:
    client, session_factory, _settings = auth_client

    with session_factory() as db:
        portrait = MediaAsset(
            title="Portrait",
            file_name="portrait.jpg",
            url="/shabnum-portrait.jpg",
            mime_type="image/jpeg",
            alt_text="Shabnum portrait",
        )
        logo = MediaAsset(
            title="Brand Logo",
            file_name="logo.png",
            url="https://cdn.example.com/logo.png",
            mime_type="image/png",
            alt_text="Brand mark",
        )
        db.add_all([portrait, logo])
        db.flush()

        db.add_all(
            [
                SiteSetting(
                    key="site_general",
                    label="Site General",
                    category="general",
                    value=_sample_site_general_value(str(logo.id)),
                    is_public=True,
                ),
                SiteSetting(
                    key="home_page",
                    label="Home Page",
                    category="pages",
                    value=_sample_home_page_value(),
                    is_public=True,
                    portrait_media_id=portrait.id,
                ),
                # Whitelisted key marked private -> must stay hidden
                SiteSetting(
                    key="about_page",
                    label="About Page",
                    category="pages",
                    value={"draft": True},
                    is_public=False,
                ),
                # Non-whitelisted key forced public in DB -> must stay hidden
                SiteSetting(
                    key="internal_secret",
                    label="Internal Secret",
                    category="admin",
                    value={"api_token": "super-secret-value"},
                    is_public=True,
                ),
            ]
        )
        db.commit()

    res = client.get("/api/v1/public/site")
    assert res.status_code == 200
    body = res.json()
    _assert_no_private_keys(body)
    assert "internal_secret" not in body
    assert "super-secret-value" not in json.dumps(body)
    assert body["site_general"]["owner_name"] == "Shabnum H."
    assert body["home_page"]["hero_heading_primary"] == "AI Engineer &"
    assert body["about_page"] is None
    assert body["contact_page"] is None
    assert body["skills_page"] is None
    assert body["portrait_media"]["url"] == "/shabnum-portrait.jpg"
    assert body["logo_media"]["url"] == "https://cdn.example.com/logo.png"


def test_public_content_filters_published_only_resolves_media_and_handles_unknown_slug(
    auth_client: tuple[TestClient, sessionmaker[Session], Settings],
) -> None:
    from app.models.testimonial import Testimonial

    client, session_factory, _settings = auth_client

    with session_factory() as db:
        cover_media = MediaAsset(
            title="Project Cover",
            file_name="cover.png",
            url="https://cdn.example.com/project-cover.png",
            mime_type="image/png",
        )
        badge_media = MediaAsset(
            title="Cert Badge",
            file_name="badge.png",
            url="/images/badge.png",
            mime_type="image/png",
        )
        avatar_media = MediaAsset(
            title="Client Avatar",
            file_name="avatar.png",
            url="/images/avatar.png",
            mime_type="image/png",
        )
        db.add_all([cover_media, badge_media, avatar_media])
        db.flush()

        db.add_all(
            [
                Service(
                    category="Agents",
                    domain="AUTOMATION",
                    title="Agentic Workflows",
                    description="Multi-step workflow orchestration for teams.",
                    featured=True,
                    display_order=1,
                    publish_status=PublishStatus.PUBLISHED.value,
                ),
                Service(
                    category="Backend",
                    domain="API",
                    title="FastAPI Services",
                    description="Production REST backends in Python.",
                    featured=False,
                    display_order=2,
                    publish_status=PublishStatus.PUBLISHED.value,
                ),
                Service(
                    category="Agents",
                    domain="DRAFT",
                    title="Unpublished Draft Service",
                    description="Should not appear publicly.",
                    featured=True,
                    display_order=0,
                    publish_status=PublishStatus.DRAFT.value,
                ),
                Skill(
                    layer=SkillLayer.AI.value,
                    domain="LLM SYSTEMS",
                    title="RAG & Evaluation",
                    description="Hybrid search and grounded generation.",
                    featured=True,
                    display_order=1,
                    publish_status=PublishStatus.PUBLISHED.value,
                ),
                Skill(
                    layer=SkillLayer.BACKEND.value,
                    domain="DATABASES",
                    title="PostgreSQL",
                    description="Relational modeling and migrations.",
                    featured=False,
                    display_order=2,
                    publish_status=PublishStatus.PUBLISHED.value,
                ),
                Skill(
                    layer=SkillLayer.AI.value,
                    domain="INTERNAL",
                    title="Draft Skill",
                    description="Not published yet.",
                    featured=True,
                    display_order=0,
                    publish_status=PublishStatus.DRAFT.value,
                ),
                Project(
                    slug="published-rag",
                    title="Published RAG",
                    category="AI",
                    featured=True,
                    display_order=1,
                    publish_status=PublishStatus.PUBLISHED.value,
                    summary="Hybrid retrieval platform over company manuals.",
                    problem="Teams spent too long finding policy answers.",
                    solution="Built indexed retrieval API with citations.",
                    cover_media_id=cover_media.id,
                ),
                Project(
                    slug="published-api",
                    title="Published API",
                    category="Backend",
                    featured=False,
                    display_order=2,
                    publish_status=PublishStatus.PUBLISHED.value,
                    summary="Modular FastAPI integration service.",
                    problem="Legacy webhook handler dropped retries.",
                    solution="Implemented idempotent worker queue.",
                ),
                Project(
                    slug="secret-draft-project",
                    title="Secret Draft",
                    category="AI",
                    featured=True,
                    display_order=0,
                    publish_status=PublishStatus.DRAFT.value,
                    summary="Draft project must remain private.",
                    problem="Internal draft.",
                    solution="Pending review.",
                ),
                Experience(
                    period="2023 - Present",
                    role="AI Engineer",
                    organization="Independent",
                    summary="Designing production AI systems.",
                    display_order=1,
                    publish_status=PublishStatus.PUBLISHED.value,
                ),
                Experience(
                    period="2020 - 2022",
                    role="Draft Role",
                    organization="Hidden Corp",
                    summary="Draft experience must stay hidden.",
                    display_order=0,
                    publish_status=PublishStatus.DRAFT.value,
                ),
                Education(
                    period="2018 - 2022",
                    degree="B.S. Computer Science",
                    institution="State University",
                    display_order=1,
                    publish_status=PublishStatus.PUBLISHED.value,
                ),
                Education(
                    period="2016 - 2018",
                    degree="Draft Diploma",
                    institution="Hidden School",
                    display_order=0,
                    publish_status=PublishStatus.DRAFT.value,
                ),
                Certification(
                    year="2024",
                    title="Published Cert",
                    issuer="Cloud Academy",
                    display_order=1,
                    publish_status=PublishStatus.PUBLISHED.value,
                    badge_media_id=badge_media.id,
                ),
                Certification(
                    year="2023",
                    title="Draft Cert",
                    issuer="Hidden Org",
                    display_order=0,
                    publish_status=PublishStatus.DRAFT.value,
                ),
                Testimonial(
                    title="Featured Review",
                    author_name="Alex M.",
                    quote="Delivered an accurate RAG system on schedule.",
                    rating_label="5.0",
                    stars=5,
                    source="Upwork",
                    featured=True,
                    display_order=1,
                    publish_status=PublishStatus.PUBLISHED.value,
                    avatar_media_id=avatar_media.id,
                ),
                Testimonial(
                    title="Regular Review",
                    author_name="Jordan K.",
                    quote="Clean FastAPI architecture and strong testing.",
                    rating_label="5.0",
                    stars=5,
                    source="Direct",
                    featured=False,
                    display_order=2,
                    publish_status=PublishStatus.PUBLISHED.value,
                ),
                Testimonial(
                    title="Draft Review",
                    author_name="Private Client",
                    quote="Should not appear before publishing.",
                    rating_label="5.0",
                    stars=5,
                    source="Upwork",
                    featured=True,
                    display_order=0,
                    publish_status=PublishStatus.DRAFT.value,
                ),
            ]
        )
        db.commit()

    # Services: published only + filters
    srv_all = client.get("/api/v1/public/services")
    assert srv_all.status_code == 200
    assert [item["title"] for item in srv_all.json()["items"]] == [
        "Agentic Workflows",
        "FastAPI Services",
    ]
    srv_filtered = client.get("/api/v1/public/services?category=Agents&featured=true")
    assert srv_filtered.status_code == 200
    assert srv_filtered.json()["total"] == 1
    assert srv_filtered.json()["items"][0]["title"] == "Agentic Workflows"

    # Skills: published only + layer/featured filters
    skl_all = client.get("/api/v1/public/skills")
    assert skl_all.status_code == 200
    assert skl_all.json()["total"] == 2
    skl_filtered = client.get("/api/v1/public/skills?layer=backend&featured=false")
    assert skl_filtered.status_code == 200
    assert [item["title"] for item in skl_filtered.json()["items"]] == ["PostgreSQL"]

    # Projects: published only + resolved cover_media + detail by slug + 404 on draft/archived/missing
    proj_all = client.get("/api/v1/public/projects")
    assert proj_all.status_code == 200
    assert [item["slug"] for item in proj_all.json()["items"]] == [
        "published-rag",
        "published-api",
    ]
    assert (
        proj_all.json()["items"][0]["cover_media"]["url"]
        == "https://cdn.example.com/project-cover.png"
    )
    proj_feat = client.get("/api/v1/public/projects?category=AI&featured=true")
    assert proj_feat.status_code == 200
    assert proj_feat.json()["total"] == 1

    detail_ok = client.get("/api/v1/public/projects/published-rag")
    assert detail_ok.status_code == 200
    assert detail_ok.json()["solution"] == "Built indexed retrieval API with citations."
    assert detail_ok.json()["cover_media"]["url"] == "https://cdn.example.com/project-cover.png"
    _assert_no_private_keys(detail_ok.json())

    for missing_slug in ("secret-draft-project", "nonexistent-slug"):
        res_404 = client.get(f"/api/v1/public/projects/{missing_slug}")
        assert res_404.status_code == 404
        assert res_404.json()["error"]["code"] == "not_found"

    # Background: published only + badge_media
    bg = client.get("/api/v1/public/background")
    assert bg.status_code == 200
    bg_json = bg.json()
    _assert_no_private_keys(bg_json)
    assert [x["role"] for x in bg_json["experience"]] == ["AI Engineer"]
    assert [x["degree"] for x in bg_json["education"]] == ["B.S. Computer Science"]
    assert [x["title"] for x in bg_json["certifications"]] == ["Published Cert"]
    assert bg_json["certifications"][0]["badge_media"]["url"] == "/images/badge.png"

    # Testimonials: published only + featured filter + avatar_media
    test_all = client.get("/api/v1/public/testimonials")
    assert test_all.status_code == 200
    assert [t["title"] for t in test_all.json()["items"]] == [
        "Featured Review",
        "Regular Review",
    ]
    assert test_all.json()["items"][0]["avatar_media"]["url"] == "/images/avatar.png"
    test_feat = client.get("/api/v1/public/testimonials?featured=true")
    assert test_feat.status_code == 200
    assert test_feat.json()["total"] == 1
    assert test_feat.json()["items"][0]["author_name"] == "Alex M."


def test_public_pagination_sorting_and_query_validation(
    auth_client: tuple[TestClient, sessionmaker[Session], Settings],
) -> None:
    client, session_factory, _settings = auth_client

    with session_factory() as db:
        titles = ["Epsilon", "Alpha", "Delta", "Beta", "Gamma"]
        for idx, title in enumerate(titles):
            db.add(
                Project(
                    slug=f"project-{title.lower()}",
                    title=title,
                    category="AI",
                    display_order=idx,
                    publish_status=PublishStatus.PUBLISHED.value,
                    summary=f"Summary for {title} retrieval pipeline.",
                    problem=f"Problem statement for {title}.",
                    solution=f"Solution overview for {title}.",
                )
            )
        db.commit()

    page2 = client.get(
        "/api/v1/public/projects?page=2&page_size=2&sort_by=title&sort_order=desc"
    )
    assert page2.status_code == 200
    body = page2.json()
    assert body["total"] == 5
    assert body["page"] == 2
    assert body["page_size"] == 2
    assert body["total_pages"] == 3
    assert [item["title"] for item in body["items"]] == ["Delta", "Beta"]

    assert client.get("/api/v1/public/projects?sort_by=secret_col").status_code == 422
    assert client.get("/api/v1/public/services?sort_order=random").status_code == 422
    assert client.get("/api/v1/public/skills?layer=invalid_layer").status_code == 422
    assert client.get("/api/v1/public/testimonials?sort_by=author_name").status_code == 422


def test_public_contact_submission_validation_privacy_and_rate_limit(
    auth_client: tuple[TestClient, sessionmaker[Session], Settings],
) -> None:
    client, session_factory, settings = auth_client

    valid_payload = {
        "inquiry_mode": "project",
        "sender_name": "  Alex Rivera  ",
        "sender_email": "alex@example.com",
        "subject": "Workflow Automation Architecture",
        "project_type": "Agentic workflow",
        "message": "Looking to automate document intake and approval routing.",
    }

    # Invalid payloads (short message & forbidden extra field) do not consume rate-limit quota
    bad_payload = dict(valid_payload, message="Too short")
    assert client.post("/api/v1/public/contact", json=bad_payload).status_code == 422

    extra_field_payload = dict(valid_payload, status="read", admin_notes="injected")
    assert client.post("/api/v1/public/contact", json=extra_field_payload).status_code == 422

    # First valid submission succeeds with minimal public response and truncates User-Agent
    long_ua = "Agent/" + ("x" * 700)
    first_res = client.post(
        "/api/v1/public/contact",
        json=valid_payload,
        headers={"User-Agent": long_ua},
    )
    assert first_res.status_code == 201
    first_json = first_res.json()
    assert set(first_json.keys()) == {"id", "status", "created_at"}
    assert first_json["status"] == ContactMessageStatus.UNREAD.value
    _assert_no_private_keys(first_json)

    with session_factory() as db:
        saved = db.get(ContactMessage, uuid.UUID(first_json["id"]))
        assert saved is not None
        assert saved.sender_name == "Alex Rivera"
        assert saved.status == ContactMessageStatus.UNREAD.value
        assert saved.user_agent is not None
        assert len(saved.user_agent) == 512

    # Consume remaining allowed submissions up to configured limit
    for _ in range(settings.contact_rate_limit_max_requests - 1):
        res = client.post("/api/v1/public/contact", json=valid_payload)
        assert res.status_code == 201

    # Next submission exceeds sliding window rate limit
    blocked = client.post("/api/v1/public/contact", json=valid_payload)
    assert blocked.status_code == 429
    assert blocked.json()["error"]["code"] == "rate_limit_exceeded"
    assert int(blocked.headers["Retry-After"]) >= 1


def test_public_endpoints_return_503_when_db_unconfigured(
    client_without_db: TestClient,
) -> None:
    site_503 = client_without_db.get("/api/v1/public/site")
    assert site_503.status_code == 503
    assert site_503.json()["error"]["code"] == "database_unavailable"

    contact_503 = client_without_db.post(
        "/api/v1/public/contact",
        json={
            "inquiry_mode": "project",
            "sender_name": "Alex Rivera",
            "sender_email": "alex@example.com",
            "subject": "Architecture review",
            "project_type": "Backend or API",
            "message": "Looking for a production FastAPI architecture review.",
        },
    )
    assert contact_503.status_code == 503
    assert contact_503.json()["error"]["code"] == "database_unavailable"


def test_public_endpoints_handle_sqlalchemy_errors(
    auth_client: tuple[TestClient, sessionmaker[Session], Settings],
) -> None:
    client, _session_factory, _settings = auth_client

    class _BrokenSession:
        def scalars(self, *_args: Any, **_kwargs: Any) -> Any:
            raise OperationalError("SELECT 1", {}, Exception("simulated failure"))

    def _broken_db() -> Generator[Any, None, None]:
        yield _BrokenSession()

    client.app.dependency_overrides[get_db] = _broken_db  # type: ignore[attr-defined]
    try:
        err_res = client.get("/api/v1/public/site")
        assert err_res.status_code == 500
        assert err_res.json()["error"]["code"] == "database_error"
    finally:
        client.app.dependency_overrides.pop(get_db, None)  # type: ignore[attr-defined]
