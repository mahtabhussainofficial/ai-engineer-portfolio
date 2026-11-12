"""Tests for protected admin overview and site settings endpoints."""

from __future__ import annotations

import uuid

from fastapi.testclient import TestClient
from sqlalchemy.orm import Session, sessionmaker

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
from app.models.enums import ContactInquiryMode, ContactMessageStatus, PublishStatus, SkillLayer


def _sample_skills_page_value() -> dict[str, object]:
    return {
        "meta_title": "Skills",
        "meta_description": "Programming languages, AI frameworks, and backend tooling.",
        "badge": "SKILLS / CAPABILITY MAP",
        "headline": "A practical engineering toolkit.",
        "headline_accent": "engineering toolkit.",
        "description": "Core technologies organized across capability groups.",
        "primary_cta": {"label": "See skills in projects", "href": "/projects"},
        "secondary_cta": {"label": "View services", "href": "/services"},
        "layers": [
            {
                "id": SkillLayer.AI.value,
                "eyebrow": "LAYER 01 / INTELLIGENCE",
                "title": "AI & LLM Engineering",
                "description": "Retrieval architectures and model interfaces.",
            }
        ],
        "contact_cta": {
            "eyebrow": "NEXT STEP",
            "title": "Need this stack on your project",
            "description": "Share the workflow requirements you want to solve.",
            "primary_cta": {"label": "Discuss a project", "href": "/contact"},
            "secondary_cta": {"label": "View projects", "href": "/projects"},
        },
    }


def test_overview_and_settings_require_authentication(
    auth_client: tuple[TestClient, sessionmaker[Session], object],
) -> None:
    client, _session_factory, _settings = auth_client

    for method, path in (
        ("GET", "/api/v1/admin/overview"),
        ("GET", "/api/v1/admin/settings"),
        ("POST", "/api/v1/admin/settings"),
        ("GET", "/api/v1/admin/settings/site_general"),
        ("PATCH", "/api/v1/admin/settings/site_general"),
        ("PATCH", "/api/v1/admin/settings/site_general/visibility"),
    ):
        res = client.request(method, path)
        assert res.status_code == 401


def test_admin_overview_aggregates_counts_and_recent_messages(
    authenticated_admin_client: tuple[TestClient, sessionmaker[Session], dict[str, str]],
) -> None:
    from app.models.testimonial import Testimonial

    client, session_factory, headers = authenticated_admin_client

    with session_factory() as db:
        media = MediaAsset(
            title="Portrait",
            file_name="portrait.jpg",
            url="/shabnum-portrait.jpg",
            mime_type="image/jpeg",
        )
        db.add(media)
        db.flush()

        db.add_all(
            [
                Project(
                    slug="rag-api",
                    title="RAG API",
                    category="AI",
                    publish_status=PublishStatus.PUBLISHED.value,
                    summary="Production retrieval architecture over manuals.",
                    problem="Scattered documentation.",
                    solution="Built indexed RAG pipeline.",
                    cover_media_id=media.id,
                ),
                Project(
                    slug="draft-agent",
                    title="Draft Agent",
                    category="AI",
                    publish_status=PublishStatus.DRAFT.value,
                    summary="Internal workflow agent prototype.",
                    problem="Manual triage bottlenecks.",
                    solution="Tool-calling workflow automation.",
                ),
                Service(
                    category="Agents",
                    domain="AUTOMATION",
                    title="Agentic Workflows",
                    description="Multi-step workflow orchestration for teams.",
                    publish_status=PublishStatus.PUBLISHED.value,
                ),
                Skill(
                    layer=SkillLayer.AI.value,
                    domain="LLM SYSTEMS",
                    title="LLMs",
                    description="Prompt and retrieval engineering stack.",
                    publish_status=PublishStatus.PUBLISHED.value,
                ),
                Experience(
                    period="2023 - Present",
                    role="AI Engineer",
                    organization="Independent",
                    summary="Designing production AI systems and APIs.",
                    publish_status=PublishStatus.PUBLISHED.value,
                ),
                Education(
                    period="2018 - 2022",
                    degree="B.S. Computer Science",
                    institution="State University",
                    publish_status=PublishStatus.PUBLISHED.value,
                ),
                Certification(
                    year="2024",
                    title="LLM Certification",
                    issuer="Academy",
                    publish_status=PublishStatus.DRAFT.value,
                ),
                Testimonial(
                    title="Client Delivery",
                    rating_label="5.0",
                    stars=5,
                    source="Upwork",
                    publish_status=PublishStatus.PUBLISHED.value,
                ),
                ContactMessage(
                    inquiry_mode=ContactInquiryMode.PROJECT.value,
                    sender_name="Alice",
                    sender_email="alice@example.com",
                    subject="RAG build",
                    project_type="RAG or knowledge system",
                    message="Need help building a retrieval backend.",
                    status=ContactMessageStatus.UNREAD.value,
                    source_ip="203.0.113.10",
                    user_agent="TestBrowser/1.0",
                    admin_notes="Private triage note",
                ),
                ContactMessage(
                    inquiry_mode=ContactInquiryMode.ADVISORY.value,
                    sender_name="Bob",
                    sender_email="bob@example.com",
                    subject="Architecture audit",
                    project_type="Backend or API",
                    message="Looking for an architecture review next month.",
                    status=ContactMessageStatus.READ.value,
                ),
            ]
        )
        db.commit()

    res = client.get("/api/v1/admin/overview", headers=headers)
    assert res.status_code == 200
    body = res.json()
    assert body["projects"] == {"total": 2, "published": 1, "draft": 1}
    assert body["services"] == {"total": 1, "published": 1, "draft": 0}
    assert body["skills"] == {"total": 1, "published": 1, "draft": 0}
    assert body["experience"] == {"total": 1, "published": 1, "draft": 0}
    assert body["education"] == {"total": 1, "published": 1, "draft": 0}
    assert body["certifications"] == {"total": 1, "published": 0, "draft": 1}
    assert body["testimonials"] == {"total": 1, "published": 1, "draft": 0}
    assert body["media_assets"] == 1
    assert body["messages"] == {"total": 2, "unread": 1, "read": 1, "archived": 0}
    assert len(body["recent_messages"]) == 2
    for item in body["recent_messages"]:
        assert "admin_notes" not in item
        assert "source_ip" not in item
        assert "user_agent" not in item


def test_site_settings_crud_validation_and_visibility_protection(
    authenticated_admin_client: tuple[TestClient, sessionmaker[Session], dict[str, str]],
) -> None:
    client, session_factory, headers = authenticated_admin_client

    with session_factory() as db:
        media = MediaAsset(
            title="Portrait",
            file_name="portrait.jpg",
            url="/shabnum-portrait.jpg",
            mime_type="image/jpeg",
        )
        db.add(media)
        db.commit()
        media_id = str(media.id)

    # 1. Create private setting (cannot mark non-whitelisted key public)
    bad_private = client.post(
        "/api/v1/admin/settings",
        headers=headers,
        json={
            "key": "internal_config",
            "label": "Internal Config",
            "category": "admin",
            "value": {"secret_flag": True},
            "is_public": True,
        },
    )
    assert bad_private.status_code == 422

    ok_private = client.post(
        "/api/v1/admin/settings",
        headers=headers,
        json={
            "key": "internal_config",
            "label": "Internal Config",
            "category": "admin",
            "value": {"items_per_page": 25},
        },
    )
    assert ok_private.status_code == 201
    assert ok_private.json()["is_public"] is False

    # 2. Private setting cannot be made public via ordinary PATCH or visibility endpoint
    patch_toggle = client.patch(
        "/api/v1/admin/settings/internal_config",
        headers=headers,
        json={"label": "Updated", "is_public": True},
    )
    assert patch_toggle.status_code == 422

    vis_forbidden = client.patch(
        "/api/v1/admin/settings/internal_config/visibility",
        headers=headers,
        json={"is_public": True},
    )
    assert vis_forbidden.status_code == 422

    # 3. Create whitelisted setting as draft (is_public=False), validate media & value
    bad_media_ref = client.post(
        "/api/v1/admin/settings",
        headers=headers,
        json={
            "key": "skills_page",
            "label": "Skills Page",
            "category": "pages",
            "value": _sample_skills_page_value(),
            "portrait_media_id": str(uuid.uuid4()),
        },
    )
    assert bad_media_ref.status_code == 422

    created = client.post(
        "/api/v1/admin/settings",
        headers=headers,
        json={
            "key": "skills_page",
            "label": "Skills Page",
            "category": "pages",
            "value": _sample_skills_page_value(),
            "is_public": False,
            "portrait_media_id": media_id,
        },
    )
    assert created.status_code == 201
    assert created.json()["portrait_media"]["url"] == "/shabnum-portrait.jpg"
    assert created.json()["is_public"] is False

    # Duplicate key rejected cleanly with 409
    dup = client.post(
        "/api/v1/admin/settings",
        headers=headers,
        json={
            "key": "skills_page",
            "label": "Duplicate",
            "category": "pages",
            "value": _sample_skills_page_value(),
        },
    )
    assert dup.status_code == 409

    # 4. PATCH validates `value` against stored key (`skills_page`)
    bad_patch_val = client.patch(
        "/api/v1/admin/settings/skills_page",
        headers=headers,
        json={"value": {"incomplete": True}},
    )
    assert bad_patch_val.status_code == 422

    updated_val = _sample_skills_page_value()
    updated_val["headline"] = "Updated practical toolkit."
    good_patch = client.patch(
        "/api/v1/admin/settings/skills_page",
        headers=headers,
        json={"value": updated_val},
    )
    assert good_patch.status_code == 200
    assert good_patch.json()["value"]["headline"] == "Updated practical toolkit."
    assert good_patch.json()["is_public"] is False

    # 5. Corrupt DB value in whitelisted setting is caught before publishing via visibility endpoint
    with session_factory() as db:
        row = db.query(SiteSetting).filter(SiteSetting.key == "skills_page").one()
        row.value = {"broken": True}
        db.commit()

    publish_broken = client.patch(
        "/api/v1/admin/settings/skills_page/visibility",
        headers=headers,
        json={"is_public": True},
    )
    assert publish_broken.status_code == 422

    # Restore valid value and publish via dedicated visibility endpoint
    repair = client.patch(
        "/api/v1/admin/settings/skills_page",
        headers=headers,
        json={"value": updated_val},
    )
    assert repair.status_code == 200

    publish_ok = client.patch(
        "/api/v1/admin/settings/skills_page/visibility",
        headers=headers,
        json={"is_public": True},
    )
    assert publish_ok.status_code == 200
    assert publish_ok.json()["is_public"] is True

    # List & Retrieve check
    list_res = client.get("/api/v1/admin/settings?is_public=true", headers=headers)
    assert list_res.status_code == 200
    assert list_res.json()["total"] == 1
    assert list_res.json()["items"][0]["key"] == "skills_page"

    get_res = client.get("/api/v1/admin/settings/skills_page", headers=headers)
    assert get_res.status_code == 200
    assert get_res.json()["portrait_media"]["id"] == media_id

    # Unpublish back to draft & missing-key 404s
    unpublish_ok = client.patch(
        "/api/v1/admin/settings/skills_page/visibility",
        headers=headers,
        json={"is_public": False},
    )
    assert unpublish_ok.status_code == 200
    assert unpublish_ok.json()["is_public"] is False

    assert client.get("/api/v1/admin/settings/does_not_exist", headers=headers).status_code == 404
    assert (
        client.patch(
            "/api/v1/admin/settings/does_not_exist",
            headers=headers,
            json={"label": "Nope"},
        ).status_code
        == 404
    )
    assert (
        client.patch(
            "/api/v1/admin/settings/does_not_exist/visibility",
            headers=headers,
            json={"is_public": False},
        ).status_code
        == 404
    )


def _sample_site_general_value(logo_media_id: str | None = None) -> dict[str, object]:
    return {
        "initials": "MS",
        "owner_name": "Mahtab Hussain",
        "professional_title": "AI Systems Engineer",
        "brand_name": "Mahtab AI",
        "tagline": "Building reliable AI and backend systems.",
        "logo_media_id": logo_media_id,
        "logo_url": None,
        "direct_email": "hello@example.com",
        "tech_note": "FastAPI + Next.js",
        "copyright_year": 2026,
        "copyright_note": "All rights reserved.",
        "meta_title_default": "Mahtab Hussain | AI Engineer",
        "meta_title_template": "%s | Mahtab Hussain",
        "meta_description": "Portfolio of production AI and backend engineering work.",
        "connect_channels": [],
    }


def test_site_general_media_validation_and_relationship_swaps(
    authenticated_admin_client: tuple[TestClient, sessionmaker[Session], dict[str, str]],
) -> None:
    client, session_factory, headers = authenticated_admin_client

    with session_factory() as db:
        logo1 = MediaAsset(
            title="Logo 1",
            file_name="logo1.png",
            url="/images/logo1.png",
            mime_type="image/png",
        )
        portrait1 = MediaAsset(
            title="Portrait 1",
            file_name="portrait1.jpg",
            url="/images/portrait1.jpg",
            mime_type="image/jpeg",
        )
        portrait2 = MediaAsset(
            title="Portrait 2",
            file_name="portrait2.jpg",
            url="/images/portrait2.jpg",
            mime_type="image/jpeg",
        )
        db.add_all([logo1, portrait1, portrait2])
        db.commit()
        logo1_id = str(logo1.id)
        portrait1_id = str(portrait1.id)
        portrait2_id = str(portrait2.id)

    # Create fails if logo_media_id does not exist
    missing_id = str(uuid.uuid4())
    bad_create = client.post(
        "/api/v1/admin/settings",
        headers=headers,
        json={
            "key": "site_general",
            "label": "General Settings",
            "category": "general",
            "value": _sample_site_general_value(logo_media_id=missing_id),
            "is_public": False,
        },
    )
    assert bad_create.status_code == 422

    # Valid create with both logo_media_id and portrait_media_id
    created = client.post(
        "/api/v1/admin/settings",
        headers=headers,
        json={
            "key": "site_general",
            "label": "General Settings",
            "category": "general",
            "value": _sample_site_general_value(logo_media_id=logo1_id),
            "portrait_media_id": portrait1_id,
            "is_public": False,
        },
    )
    assert created.status_code == 201
    assert created.json()["portrait_media"]["id"] == portrait1_id
    assert created.json()["value"]["logo_media_id"] == logo1_id

    # Update rejects nonexistent portrait_media_id or nonexistent logo_media_id
    assert (
        client.patch(
            "/api/v1/admin/settings/site_general",
            headers=headers,
            json={"portrait_media_id": str(uuid.uuid4())},
        ).status_code
        == 422
    )
    assert (
        client.patch(
            "/api/v1/admin/settings/site_general",
            headers=headers,
            json={"value": _sample_site_general_value(logo_media_id=str(uuid.uuid4()))},
        ).status_code
        == 422
    )

    # Swap portrait_media_id to portrait2 and confirm serialized media updates cleanly
    swapped = client.patch(
        "/api/v1/admin/settings/site_general",
        headers=headers,
        json={"portrait_media_id": portrait2_id},
    )
    assert swapped.status_code == 200
    assert swapped.json()["portrait_media"]["id"] == portrait2_id

    # Unlink portrait_media_id -> null portrait_media
    unlinked = client.patch(
        "/api/v1/admin/settings/site_general",
        headers=headers,
        json={"portrait_media_id": None},
    )
    assert unlinked.status_code == 200
    assert unlinked.json()["portrait_media"] is None

    # Visibility publish fails if DB value has a missing logo_media_id
    with session_factory() as db:
        row = db.query(SiteSetting).filter(SiteSetting.key == "site_general").one()
        broken = dict(row.value)
        broken["logo_media_id"] = str(uuid.uuid4())
        row.value = broken
        db.commit()

    bad_vis = client.patch(
        "/api/v1/admin/settings/site_general/visibility",
        headers=headers,
        json={"is_public": True},
    )
    assert bad_vis.status_code == 422

    # Repair logo_media_id and publish cleanly
    repaired = client.patch(
        "/api/v1/admin/settings/site_general",
        headers=headers,
        json={"value": _sample_site_general_value(logo_media_id=logo1_id)},
    )
    assert repaired.status_code == 200
    ok_vis = client.patch(
        "/api/v1/admin/settings/site_general/visibility",
        headers=headers,
        json={"is_public": True},
    )
    assert ok_vis.status_code == 200
    assert ok_vis.json()["is_public"] is True
