"""Tests for protected admin content CRUD endpoints across all CMS entities."""

from __future__ import annotations

import uuid

from fastapi.testclient import TestClient
from sqlalchemy.orm import Session, sessionmaker


def _create_sample_media(client: TestClient, headers: dict[str, str]) -> str:
    res = client.post(
        "/api/v1/admin/media",
        headers=headers,
        json={
            "title": "Sample Asset",
            "file_name": "sample.png",
            "url": "/images/sample.png",
            "mime_type": "image/png",
        },
    )
    assert res.status_code == 201
    return str(res.json()["id"])


def test_every_admin_route_rejects_unauthenticated_requests(
    auth_client: tuple[TestClient, sessionmaker[Session], object],
) -> None:
    client, _session_factory, _settings = auth_client
    sample_id = uuid.uuid4()
    openapi_paths = client.app.openapi()["paths"]  # type: ignore[attr-defined]
    admin_routes = [
        (method.upper(), route_path)
        for route_path, operations in openapi_paths.items()
        if route_path.startswith("/api/v1/admin")
        for method in operations
        if method.lower() in {"get", "post", "put", "patch", "delete"}
    ]
    assert len(admin_routes) >= 50

    for method, route_path in admin_routes:
        resolved = (
            route_path.replace("{key}", "site_general")
            .replace("{media_id}", str(sample_id))
            .replace("{project_id}", str(sample_id))
            .replace("{service_id}", str(sample_id))
            .replace("{skill_id}", str(sample_id))
            .replace("{experience_id}", str(sample_id))
            .replace("{education_id}", str(sample_id))
            .replace("{certification_id}", str(sample_id))
            .replace("{testimonial_id}", str(sample_id))
            .replace("{message_id}", str(sample_id))
        )
        res = client.request(method, resolved)
        assert res.status_code == 401, f"{method} {resolved} returned {res.status_code}"


def test_projects_crud_publish_and_validation(
    authenticated_admin_client: tuple[TestClient, sessionmaker[Session], dict[str, str]],
) -> None:
    client, _session_factory, headers = authenticated_admin_client
    media_id = _create_sample_media(client, headers)

    # Invalid cover_media_id rejected
    bad_ref = client.post(
        "/api/v1/admin/projects",
        headers=headers,
        json={
            "slug": "knowledge-api",
            "title": "Knowledge API",
            "category": "AI",
            "summary": "Hybrid retrieval API over internal documents.",
            "problem": "Teams wasted hours finding policy answers.",
            "solution": "Built indexed vector + BM25 search with citations.",
            "cover_media_id": str(uuid.uuid4()),
        },
    )
    assert bad_ref.status_code == 422

    created = client.post(
        "/api/v1/admin/projects",
        headers=headers,
        json={
            "slug": "knowledge-api",
            "display_number": "01",
            "title": "Knowledge API",
            "category": "AI",
            "featured": True,
            "display_order": 1,
            "summary": "Hybrid retrieval API over internal documents.",
            "problem": "Teams wasted hours finding policy answers.",
            "solution": "Built indexed vector + BM25 search with citations.",
            "deliverables": ["FastAPI service"],
            "tags": ["Python", "PostgreSQL"],
            "live_url": "https://demo.example.com",
            "repo_url": "https://github.com/example/knowledge-api",
            "cover_media_id": media_id,
        },
    )
    assert created.status_code == 201
    proj_id = created.json()["id"]
    assert created.json()["publish_status"] == "draft"
    assert created.json()["published_at"] is None
    assert created.json()["cover_media"]["id"] == media_id

    # Duplicate slug -> 409
    dup = client.post(
        "/api/v1/admin/projects",
        headers=headers,
        json={
            "slug": "knowledge-api",
            "title": "Another Project",
            "category": "AI",
            "summary": "Duplicate slug should conflict cleanly.",
            "problem": "Duplicate identifier collision check.",
            "solution": "Enforce unique slug check before saving.",
        },
    )
    assert dup.status_code == 409

    # List & get with eager-loaded media
    listed = client.get("/api/v1/admin/projects?featured=true&page=1&page_size=10", headers=headers)
    assert listed.status_code == 200
    assert listed.json()["total"] == 1
    assert listed.json()["items"][0]["cover_media"]["url"] == "/images/sample.png"

    fetched = client.get(f"/api/v1/admin/projects/{proj_id}", headers=headers)
    assert fetched.status_code == 200
    assert fetched.json()["title"] == "Knowledge API"

    # Patch + extra field rejected + null non-nullable rejected
    assert (
        client.patch(
            f"/api/v1/admin/projects/{proj_id}",
            headers=headers,
            json={"unexpected_field": "nope"},
        ).status_code
        == 422
    )
    assert (
        client.patch(
            f"/api/v1/admin/projects/{proj_id}",
            headers=headers,
            json={"title": None},
        ).status_code
        == 422
    )

    updated = client.patch(
        f"/api/v1/admin/projects/{proj_id}",
        headers=headers,
        json={"title": "Knowledge API v2"},
    )
    assert updated.status_code == 200
    assert updated.json()["title"] == "Knowledge API v2"

    # Publish & unpublish
    published = client.post(f"/api/v1/admin/projects/{proj_id}/publish", headers=headers)
    assert published.status_code == 200
    assert published.json()["publish_status"] == "published"
    assert published.json()["published_at"] is not None

    unpublished = client.post(f"/api/v1/admin/projects/{proj_id}/unpublish", headers=headers)
    assert unpublished.status_code == 200
    assert unpublished.json()["publish_status"] == "draft"

    # Delete
    deleted = client.delete(f"/api/v1/admin/projects/{proj_id}", headers=headers)
    assert deleted.status_code == 200
    assert client.get(f"/api/v1/admin/projects/{proj_id}", headers=headers).status_code == 404


def test_services_and_skills_crud(
    authenticated_admin_client: tuple[TestClient, sessionmaker[Session], dict[str, str]],
) -> None:
    client, _session_factory, headers = authenticated_admin_client

    # Services CRUD
    svc_res = client.post(
        "/api/v1/admin/services",
        headers=headers,
        json={
            "display_number": "01",
            "category": "Agents & Voice",
            "domain": "AUTOMATION",
            "title": "Agentic AI Systems",
            "description": "Multi-agent workflow orchestration with human approvals.",
            "tools": ["LangGraph", "FastAPI"],
            "featured": True,
            "publish_status": "published",
        },
    )
    assert svc_res.status_code == 201
    svc_id = svc_res.json()["id"]
    assert svc_res.json()["published_at"] is not None

    assert client.get("/api/v1/admin/services?publish_status=published", headers=headers).json()["total"] == 1
    assert client.get(f"/api/v1/admin/services/{svc_id}", headers=headers).status_code == 200
    patched_svc = client.patch(
        f"/api/v1/admin/services/{svc_id}",
        headers=headers,
        json={"title": "Agentic Workflow Systems"},
    )
    assert patched_svc.status_code == 200
    assert patched_svc.json()["title"] == "Agentic Workflow Systems"
    assert client.delete(f"/api/v1/admin/services/{svc_id}", headers=headers).status_code == 200
    assert client.get(f"/api/v1/admin/services/{svc_id}", headers=headers).status_code == 404

    # Skills CRUD
    skill_res = client.post(
        "/api/v1/admin/skills",
        headers=headers,
        json={
            "layer": "backend",
            "display_number": "03",
            "domain": "API LAYER",
            "title": "Python & FastAPI",
            "description": "Typed API services with SQLAlchemy and PostgreSQL.",
            "items": ["Python", "FastAPI", "PostgreSQL"],
            "featured": True,
        },
    )
    assert skill_res.status_code == 201
    skill_id = skill_res.json()["id"]

    assert client.get("/api/v1/admin/skills?layer=backend", headers=headers).json()["total"] == 1
    assert client.get(f"/api/v1/admin/skills/{skill_id}", headers=headers).status_code == 200
    assert (
        client.patch(
            f"/api/v1/admin/skills/{skill_id}",
            headers=headers,
            json={"items": ["Python", "FastAPI", "SQLAlchemy"]},
        ).json()["items"]
        == ["Python", "FastAPI", "SQLAlchemy"]
    )
    assert client.delete(f"/api/v1/admin/skills/{skill_id}", headers=headers).status_code == 200
    assert client.get(f"/api/v1/admin/skills/{skill_id}", headers=headers).status_code == 404


def test_career_and_testimonials_crud(
    authenticated_admin_client: tuple[TestClient, sessionmaker[Session], dict[str, str]],
) -> None:
    client, _session_factory, headers = authenticated_admin_client
    media_id = _create_sample_media(client, headers)

    # Experience CRUD
    exp = client.post(
        "/api/v1/admin/experience",
        headers=headers,
        json={
            "period": "2023 - Present",
            "role": "Senior AI Engineer",
            "organization": "Independent Consulting",
            "summary": "Designing RAG pipelines and backend automation services.",
            "is_current": True,
        },
    )
    assert exp.status_code == 201
    exp_id = exp.json()["id"]
    assert client.get("/api/v1/admin/experience?is_current=true", headers=headers).json()["total"] == 1
    assert client.get(f"/api/v1/admin/experience/{exp_id}", headers=headers).status_code == 200
    assert (
        client.patch(
            f"/api/v1/admin/experience/{exp_id}",
            headers=headers,
            json={"location": "Remote"},
        ).json()["location"]
        == "Remote"
    )
    assert client.delete(f"/api/v1/admin/experience/{exp_id}", headers=headers).status_code == 200

    # Education CRUD
    edu = client.post(
        "/api/v1/admin/education",
        headers=headers,
        json={
            "period": "2018 - 2022",
            "degree": "B.S. Computer Science",
            "institution": "Tech University",
        },
    )
    assert edu.status_code == 201
    edu_id = edu.json()["id"]
    assert client.get("/api/v1/admin/education", headers=headers).json()["total"] == 1
    assert (
        client.patch(
            f"/api/v1/admin/education/{edu_id}",
            headers=headers,
            json={"field_of_study": "Artificial Intelligence"},
        ).json()["field_of_study"]
        == "Artificial Intelligence"
    )
    assert client.delete(f"/api/v1/admin/education/{edu_id}", headers=headers).status_code == 200

    # Certifications CRUD with badge media
    cert = client.post(
        "/api/v1/admin/certifications",
        headers=headers,
        json={
            "year": "2025",
            "title": "Applied LLM Systems",
            "issuer": "AI Institute",
            "credential_url": "https://credentials.example.com/123",
            "badge_media_id": media_id,
        },
    )
    assert cert.status_code == 201
    cert_id = cert.json()["id"]
    assert cert.json()["badge_media"]["id"] == media_id
    assert client.get("/api/v1/admin/certifications", headers=headers).json()["total"] == 1
    assert (
        client.patch(
            f"/api/v1/admin/certifications/{cert_id}",
            headers=headers,
            json={"credential_id": "CERT-99"},
        ).json()["credential_id"]
        == "CERT-99"
    )
    assert client.delete(f"/api/v1/admin/certifications/{cert_id}", headers=headers).status_code == 200

    # Testimonials CRUD + publish/unpublish + avatar media
    t_res = client.post(
        "/api/v1/admin/testimonials",
        headers=headers,
        json={
            "title": "Senior AI Agent & LLM Developer",
            "rating_score": "5.0",
            "rating_label": "5.0",
            "stars": 5,
            "source": "Upwork",
            "source_url": "https://upwork.example.com/review/1",
            "avatar_media_id": media_id,
            "featured": True,
        },
    )
    assert t_res.status_code == 201
    t_id = t_res.json()["id"]
    assert t_res.json()["avatar_media"]["id"] == media_id
    assert t_res.json()["publish_status"] == "draft"

    pub = client.post(f"/api/v1/admin/testimonials/{t_id}/publish", headers=headers)
    assert pub.status_code == 200
    assert pub.json()["publish_status"] == "published"
    assert pub.json()["published_at"] is not None

    unpub = client.post(f"/api/v1/admin/testimonials/{t_id}/unpublish", headers=headers)
    assert unpub.status_code == 200
    assert unpub.json()["publish_status"] == "draft"

    assert (
        client.patch(
            f"/api/v1/admin/testimonials/{t_id}",
            headers=headers,
            json={"author_name": "Alex M."},
        ).json()["author_name"]
        == "Alex M."
    )
    assert client.delete(f"/api/v1/admin/testimonials/{t_id}", headers=headers).status_code == 200
