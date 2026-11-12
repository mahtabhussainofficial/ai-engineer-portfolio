"""Tests for protected admin media assets and contact message triage endpoints."""

from __future__ import annotations

import uuid

from fastapi.testclient import TestClient
from sqlalchemy.orm import Session, sessionmaker

from app.models import ContactMessage
from app.models.enums import ContactInquiryMode, ContactMessageStatus
from app.schemas.contact import ContactMessagePublicResponse


def test_media_and_messages_require_authentication(
    auth_client: tuple[TestClient, sessionmaker[Session], object],
) -> None:
    client, _session_factory, _settings = auth_client
    sample_id = uuid.uuid4()

    for method, path in (
        ("GET", "/api/v1/admin/media"),
        ("POST", "/api/v1/admin/media"),
        ("GET", f"/api/v1/admin/media/{sample_id}"),
        ("PATCH", f"/api/v1/admin/media/{sample_id}"),
        ("DELETE", f"/api/v1/admin/media/{sample_id}"),
        ("GET", "/api/v1/admin/messages"),
        ("GET", f"/api/v1/admin/messages/{sample_id}"),
        ("PATCH", f"/api/v1/admin/messages/{sample_id}"),
        ("DELETE", f"/api/v1/admin/messages/{sample_id}"),
    ):
        res = client.request(method, path)
        assert res.status_code == 401


def test_media_asset_crud_and_safe_deletion_protection(
    authenticated_admin_client: tuple[TestClient, sessionmaker[Session], dict[str, str]],
) -> None:
    client, _session_factory, headers = authenticated_admin_client

    # Unsafe URL rejected
    bad = client.post(
        "/api/v1/admin/media",
        headers=headers,
        json={
            "title": "Bad Media",
            "file_name": "bad.png",
            "url": "javascript:alert(1)",
            "mime_type": "image/png",
        },
    )
    assert bad.status_code == 422

    # Create media assets
    m1 = client.post(
        "/api/v1/admin/media",
        headers=headers,
        json={
            "title": "RAG Architecture Diagram",
            "file_name": "rag-diagram.png",
            "storage_provider": "local_public",
            "url": "/images/rag-diagram.png",
            "mime_type": "image/png",
            "width": 1200,
            "height": 800,
            "alt_text": "Hybrid retrieval architecture diagram",
        },
    )
    assert m1.status_code == 201
    media_id = m1.json()["id"]

    m2 = client.post(
        "/api/v1/admin/media",
        headers=headers,
        json={
            "title": "Resume PDF",
            "file_name": "cv.pdf",
            "storage_provider": "external",
            "url": "https://cdn.example.com/cv.pdf",
            "mime_type": "application/pdf",
        },
    )
    assert m2.status_code == 201

    # Paginate & filter
    filtered = client.get(
        "/api/v1/admin/media?storage_provider=local_public&page=1&page_size=10",
        headers=headers,
    )
    assert filtered.status_code == 200
    assert filtered.json()["total"] == 1
    assert filtered.json()["items"][0]["id"] == media_id

    # Patch metadata & reject explicit null on required field
    bad_patch = client.patch(
        f"/api/v1/admin/media/{media_id}",
        headers=headers,
        json={"title": None},
    )
    assert bad_patch.status_code == 422

    patched = client.patch(
        f"/api/v1/admin/media/{media_id}",
        headers=headers,
        json={"caption": "Updated architecture diagram"},
    )
    assert patched.status_code == 200
    assert patched.json()["caption"] == "Updated architecture diagram"

    # Link to a project and verify unsafe deletion is blocked with 409 Conflict
    proj = client.post(
        "/api/v1/admin/projects",
        headers=headers,
        json={
            "slug": "media-linked-project",
            "title": "Media Linked Project",
            "category": "AI",
            "summary": "Production RAG service with diagram cover asset.",
            "problem": "Manual lookups took too long.",
            "solution": "Built vector and keyword hybrid search API.",
            "cover_media_id": media_id,
        },
    )
    assert proj.status_code == 201
    proj_id = proj.json()["id"]

    blocked_delete = client.delete(f"/api/v1/admin/media/{media_id}", headers=headers)
    assert blocked_delete.status_code == 409

    # Unlink from project and confirm delete succeeds
    unlink = client.patch(
        f"/api/v1/admin/projects/{proj_id}",
        headers=headers,
        json={"cover_media_id": None},
    )
    assert unlink.status_code == 200
    assert unlink.json()["cover_media"] is None

    deleted = client.delete(f"/api/v1/admin/media/{media_id}", headers=headers)
    assert deleted.status_code == 200
    assert deleted.json()["id"] == media_id

    assert client.get(f"/api/v1/admin/media/{media_id}", headers=headers).status_code == 404
    missing_media_id = str(uuid.uuid4())
    assert client.get(f"/api/v1/admin/media/{missing_media_id}", headers=headers).status_code == 404
    assert (
        client.patch(
            f"/api/v1/admin/media/{missing_media_id}",
            headers=headers,
            json={"caption": "Missing"},
        ).status_code
        == 404
    )
    assert client.delete(f"/api/v1/admin/media/{missing_media_id}", headers=headers).status_code == 404


def test_media_deletion_blocked_across_all_five_references(
    authenticated_admin_client: tuple[TestClient, sessionmaker[Session], dict[str, str]],
) -> None:
    client, _session_factory, headers = authenticated_admin_client

    def _make_media(name: str) -> str:
        res = client.post(
            "/api/v1/admin/media",
            headers=headers,
            json={
                "title": name,
                "file_name": f"{name}.png",
                "url": f"/images/{name}.png",
                "mime_type": "image/png",
            },
        )
        assert res.status_code == 201
        return str(res.json()["id"])

    m_project = _make_media("project-cover")
    m_cert = _make_media("cert-badge")
    m_testimonial = _make_media("testimonial-avatar")
    m_portrait = _make_media("settings-portrait")
    m_logo = _make_media("site-logo")

    # 1. Project.cover_media_id
    proj = client.post(
        "/api/v1/admin/projects",
        headers=headers,
        json={
            "slug": "ref-check-project",
            "title": "Ref Check Project",
            "category": "AI",
            "summary": "Project referencing media asset.",
            "problem": "Ensure referenced media cannot be deleted.",
            "solution": "Check all five reference locations.",
            "cover_media_id": m_project,
        },
    )
    assert proj.status_code == 201
    proj_id = proj.json()["id"]
    assert client.delete(f"/api/v1/admin/media/{m_project}", headers=headers).status_code == 409

    # 2. Certification.badge_media_id
    cert = client.post(
        "/api/v1/admin/certifications",
        headers=headers,
        json={
            "year": "2026",
            "title": "Ref Check Cert",
            "issuer": "Institute",
            "badge_media_id": m_cert,
        },
    )
    assert cert.status_code == 201
    cert_id = cert.json()["id"]
    assert client.delete(f"/api/v1/admin/media/{m_cert}", headers=headers).status_code == 409

    # 3. Testimonial.avatar_media_id
    testimonial = client.post(
        "/api/v1/admin/testimonials",
        headers=headers,
        json={
            "title": "Ref Check Testimonial",
            "author_name": "Jordan R.",
            "quote": "Reliable AI systems delivery on schedule.",
            "rating_label": "5.0",
            "stars": 5,
            "source": "Direct",
            "avatar_media_id": m_testimonial,
        },
    )
    assert testimonial.status_code == 201
    testimonial_id = testimonial.json()["id"]
    assert client.delete(f"/api/v1/admin/media/{m_testimonial}", headers=headers).status_code == 409

    # 4 & 5. SiteSetting.portrait_media_id and site_general.value.logo_media_id
    setting_value = {
        "initials": "MS",
        "owner_name": "Mahtab Hussain",
        "professional_title": "AI Systems Engineer",
        "brand_name": "Mahtab AI",
        "tagline": "Reliable production AI workflows.",
        "logo_media_id": m_logo,
        "tech_note": "FastAPI + Next.js",
        "copyright_year": 2026,
        "copyright_note": "All rights reserved.",
        "meta_title_default": "Mahtab Hussain",
        "meta_title_template": "%s | Mahtab Hussain",
        "meta_description": "Portfolio of production AI engineering.",
        "connect_channels": [],
    }
    setting = client.post(
        "/api/v1/admin/settings",
        headers=headers,
        json={
            "key": "site_general",
            "label": "Site General",
            "category": "general",
            "value": setting_value,
            "portrait_media_id": m_portrait,
            "is_public": False,
        },
    )
    assert setting.status_code == 201
    assert client.delete(f"/api/v1/admin/media/{m_portrait}", headers=headers).status_code == 409
    assert client.delete(f"/api/v1/admin/media/{m_logo}", headers=headers).status_code == 409

    # Unlink each reference and confirm deletion succeeds cleanly
    assert (
        client.patch(
            f"/api/v1/admin/projects/{proj_id}",
            headers=headers,
            json={"cover_media_id": None},
        ).status_code
        == 200
    )
    assert client.delete(f"/api/v1/admin/media/{m_project}", headers=headers).status_code == 200

    assert (
        client.patch(
            f"/api/v1/admin/certifications/{cert_id}",
            headers=headers,
            json={"badge_media_id": None},
        ).status_code
        == 200
    )
    assert client.delete(f"/api/v1/admin/media/{m_cert}", headers=headers).status_code == 200

    assert (
        client.patch(
            f"/api/v1/admin/testimonials/{testimonial_id}",
            headers=headers,
            json={"avatar_media_id": None},
        ).status_code
        == 200
    )
    assert client.delete(f"/api/v1/admin/media/{m_testimonial}", headers=headers).status_code == 200

    cleared_value = dict(setting_value)
    cleared_value["logo_media_id"] = None
    assert (
        client.patch(
            "/api/v1/admin/settings/site_general",
            headers=headers,
            json={"portrait_media_id": None, "value": cleared_value},
        ).status_code
        == 200
    )
    assert client.delete(f"/api/v1/admin/media/{m_portrait}", headers=headers).status_code == 200
    assert client.delete(f"/api/v1/admin/media/{m_logo}", headers=headers).status_code == 200


def test_contact_messages_triage_and_privacy(
    authenticated_admin_client: tuple[TestClient, sessionmaker[Session], dict[str, str]],
) -> None:
    client, session_factory, headers = authenticated_admin_client

    with session_factory() as db:
        msg1 = ContactMessage(
            inquiry_mode=ContactInquiryMode.PROJECT.value,
            sender_name="Claire Vance",
            sender_email="claire@example.com",
            subject="Agentic workflow",
            project_type="Agentic workflow",
            message="Looking to automate our internal support triage workflow.",
            status=ContactMessageStatus.UNREAD.value,
            source_ip="198.51.100.42",
            user_agent="Mozilla/5.0 SecretUA",
        )
        msg2 = ContactMessage(
            inquiry_mode=ContactInquiryMode.ADVISORY.value,
            sender_name="Devon Park",
            sender_email="devon@example.com",
            subject="Architecture review",
            project_type="Backend or API",
            message="Interested in an advisory sprint on FastAPI scaling.",
            status=ContactMessageStatus.READ.value,
        )
        db.add_all([msg1, msg2])
        db.commit()
        msg1_id = str(msg1.id)
        msg1_created_at = msg1.created_at

    # Public confirmation schema excludes admin_notes, source_ip, and user_agent
    public_preview = ContactMessagePublicResponse(
        id=uuid.UUID(msg1_id),
        status=ContactMessageStatus.UNREAD,
        created_at=msg1_created_at,
    ).model_dump()
    assert set(public_preview.keys()) == {"id", "status", "created_at"}

    # Filter & paginate
    unread_list = client.get("/api/v1/admin/messages?status=unread&page=1&page_size=10", headers=headers)
    assert unread_list.status_code == 200
    assert unread_list.json()["total"] == 1
    row = unread_list.json()["items"][0]
    assert row["id"] == msg1_id
    assert "source_ip" not in row
    assert "user_agent" not in row

    # GET detail stays read-only and never leaks source_ip / user_agent
    detail = client.get(f"/api/v1/admin/messages/{msg1_id}", headers=headers)
    assert detail.status_code == 200
    assert detail.json()["status"] == "unread"
    assert detail.json()["read_at"] is None
    assert "source_ip" not in detail.json()
    assert "user_agent" not in detail.json()

    # Unsupported status ('replied') and null status rejected
    assert (
        client.patch(
            f"/api/v1/admin/messages/{msg1_id}",
            headers=headers,
            json={"status": "replied"},
        ).status_code
        == 422
    )
    assert (
        client.patch(
            f"/api/v1/admin/messages/{msg1_id}",
            headers=headers,
            json={"status": None},
        ).status_code
        == 422
    )

    # Mark read + save admin notes -> read_at and handled_by_id populated
    read_res = client.patch(
        f"/api/v1/admin/messages/{msg1_id}",
        headers=headers,
        json={"status": "read", "admin_notes": "Follow up scheduled for Thursday."},
    )
    assert read_res.status_code == 200
    read_body = read_res.json()
    assert read_body["status"] == "read"
    assert read_body["admin_notes"] == "Follow up scheduled for Thursday."
    assert read_body["read_at"] is not None
    assert read_body["archived_at"] is None
    assert read_body["handled_by_id"] is not None

    # Archive -> archived_at populated
    arch_res = client.patch(
        f"/api/v1/admin/messages/{msg1_id}",
        headers=headers,
        json={"status": "archived"},
    )
    assert arch_res.status_code == 200
    assert arch_res.json()["status"] == "archived"
    assert arch_res.json()["archived_at"] is not None

    # Mark unread -> server timestamps cleared
    unread_res = client.patch(
        f"/api/v1/admin/messages/{msg1_id}",
        headers=headers,
        json={"status": "unread"},
    )
    assert unread_res.status_code == 200
    assert unread_res.json()["read_at"] is None
    assert unread_res.json()["archived_at"] is None

    # Delete message & 404 coverage
    del_res = client.delete(f"/api/v1/admin/messages/{msg1_id}", headers=headers)
    assert del_res.status_code == 200
    assert client.get(f"/api/v1/admin/messages/{msg1_id}", headers=headers).status_code == 404
    missing_msg = str(uuid.uuid4())
    assert (
        client.patch(
            f"/api/v1/admin/messages/{missing_msg}",
            headers=headers,
            json={"status": "read"},
        ).status_code
        == 404
    )
    assert client.delete(f"/api/v1/admin/messages/{missing_msg}", headers=headers).status_code == 404
    adv = client.get("/api/v1/admin/messages?inquiry_mode=advisory", headers=headers)
    assert adv.status_code == 200
    assert adv.json()["total"] == 1
