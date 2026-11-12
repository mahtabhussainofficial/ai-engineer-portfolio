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

    # Cannot publish testimonial until author_name and quote are provided
    incomplete_pub = client.post(f"/api/v1/admin/testimonials/{t_id}/publish", headers=headers)
    assert incomplete_pub.status_code == 422

    patched_t = client.patch(
        f"/api/v1/admin/testimonials/{t_id}",
        headers=headers,
        json={
            "author_name": "Alex M.",
            "quote": "Delivered a reliable production RAG system ahead of schedule.",
        },
    )
    assert patched_t.status_code == 200
    assert patched_t.json()["author_name"] == "Alex M."

    pub = client.post(f"/api/v1/admin/testimonials/{t_id}/publish", headers=headers)
    assert pub.status_code == 200
    assert pub.json()["publish_status"] == "published"
    assert pub.json()["published_at"] is not None

    unpub = client.post(f"/api/v1/admin/testimonials/{t_id}/unpublish", headers=headers)
    assert unpub.status_code == 200
    assert unpub.json()["publish_status"] == "draft"

    assert client.delete(f"/api/v1/admin/testimonials/{t_id}", headers=headers).status_code == 200


def test_publication_validation_and_media_relationship_regression(
    authenticated_admin_client: tuple[TestClient, sessionmaker[Session], dict[str, str]],
) -> None:
    from app.models.project import Project
    from app.models.testimonial import Testimonial

    client, session_factory, headers = authenticated_admin_client
    media_a = _create_sample_media(client, headers)
    media_b_res = client.post(
        "/api/v1/admin/media",
        headers=headers,
        json={
            "title": "Second Asset",
            "file_name": "second.png",
            "url": "/images/second.png",
            "mime_type": "image/png",
        },
    )
    assert media_b_res.status_code == 201
    media_b = str(media_b_res.json()["id"])

    # Regression: create -> swap -> unlink media relationship serialization across Project/Cert/Testimonial
    proj = client.post(
        "/api/v1/admin/projects",
        headers=headers,
        json={
            "slug": "swap-media-project",
            "title": "Swap Media Project",
            "category": "AI",
            "summary": "Hybrid search pipeline with diagram preview.",
            "problem": "Manual document lookup took too long.",
            "solution": "Built vector and keyword hybrid search API.",
            "cover_media_id": media_a,
        },
    )
    assert proj.status_code == 201
    proj_id = proj.json()["id"]
    assert proj.json()["cover_media"]["id"] == media_a

    swapped_proj = client.patch(
        f"/api/v1/admin/projects/{proj_id}",
        headers=headers,
        json={"cover_media_id": media_b},
    )
    assert swapped_proj.status_code == 200
    assert swapped_proj.json()["cover_media"]["id"] == media_b

    unlinked_proj = client.patch(
        f"/api/v1/admin/projects/{proj_id}",
        headers=headers,
        json={"cover_media_id": None},
    )
    assert unlinked_proj.status_code == 200
    assert unlinked_proj.json()["cover_media"] is None

    # Certification & Testimonial media swap/unlink regression checks
    cert_swap = client.post(
        "/api/v1/admin/certifications",
        headers=headers,
        json={"year": "2026", "title": "Swap Cert", "issuer": "AI Org", "badge_media_id": media_a},
    )
    assert cert_swap.status_code == 201
    cert_swap_id = cert_swap.json()["id"]
    assert cert_swap.json()["badge_media"]["id"] == media_a
    assert (
        client.patch(
            f"/api/v1/admin/certifications/{cert_swap_id}",
            headers=headers,
            json={"badge_media_id": media_b},
        ).json()["badge_media"]["id"]
        == media_b
    )
    assert (
        client.patch(
            f"/api/v1/admin/certifications/{cert_swap_id}",
            headers=headers,
            json={"badge_media_id": None},
        ).json()["badge_media"]
        is None
    )

    t_swap = client.post(
        "/api/v1/admin/testimonials",
        headers=headers,
        json={
            "title": "Swap Avatar",
            "author_name": "Elena V.",
            "quote": "Clean API delivery.",
            "rating_label": "5.0",
            "stars": 5,
            "source": "Direct",
            "avatar_media_id": media_a,
        },
    )
    assert t_swap.status_code == 201
    t_swap_id = t_swap.json()["id"]
    assert t_swap.json()["avatar_media"]["id"] == media_a
    assert (
        client.patch(
            f"/api/v1/admin/testimonials/{t_swap_id}",
            headers=headers,
            json={"avatar_media_id": media_b},
        ).json()["avatar_media"]["id"]
        == media_b
    )
    assert (
        client.patch(
            f"/api/v1/admin/testimonials/{t_swap_id}",
            headers=headers,
            json={"avatar_media_id": None},
        ).json()["avatar_media"]
        is None
    )

    # Positive publish after valid content
    pub_ok = client.post(f"/api/v1/admin/projects/{proj_id}/publish", headers=headers)
    assert pub_ok.status_code == 200
    assert pub_ok.json()["publish_status"] == "published"

    # Negative project publish: blank deliverable entries created as draft cannot be published
    ws_proj = client.post(
        "/api/v1/admin/projects",
        headers=headers,
        json={
            "slug": "whitespace-draft",
            "title": "Whitespace Draft",
            "category": "AI",
            "summary": "Valid production summary for draft project.",
            "problem": "Valid problem statement for draft project.",
            "solution": "Valid solution explanation for draft project.",
            "deliverables": ["   "],
        },
    )
    assert ws_proj.status_code == 201
    ws_proj_id = ws_proj.json()["id"]
    assert client.post(f"/api/v1/admin/projects/{ws_proj_id}/publish", headers=headers).status_code == 422
    assert client.get(f"/api/v1/admin/projects/{ws_proj_id}", headers=headers).json()["publish_status"] == "draft"
    assert (
        client.patch(
            f"/api/v1/admin/projects/{ws_proj_id}",
            headers=headers,
            json={"deliverables": ["FastAPI API"]},
        ).status_code
        == 200
    )
    assert client.post(f"/api/v1/admin/projects/{ws_proj_id}/publish", headers=headers).status_code == 200

    # Negative project publish: simulate corrupt DB draft row (short text & invalid URL)
    with session_factory() as db:
        bad_proj = Project(
            slug="incomplete-draft",
            title="Incomplete Draft",
            category="AI",
            summary="short",
            problem="short",
            solution="short",
            live_url="javascript:alert(1)",
        )
        db.add(bad_proj)
        db.commit()
        bad_proj_id = bad_proj.id

    bad_proj_pub = client.post(f"/api/v1/admin/projects/{bad_proj_id}/publish", headers=headers)
    assert bad_proj_pub.status_code == 422
    with session_factory() as db:
        assert db.get(Project, bad_proj_id).publish_status == "draft"  # type: ignore[union-attr]

    # Fix project fields and verify publish succeeds
    fixed_proj = client.patch(
        f"/api/v1/admin/projects/{bad_proj_id}",
        headers=headers,
        json={
            "summary": "Complete production summary exceeding minimum length.",
            "problem": "Complete problem statement exceeding minimum length.",
            "solution": "Complete solution explanation exceeding minimum length.",
            "live_url": "https://demo.example.com/fixed",
        },
    )
    assert fixed_proj.status_code == 200
    assert client.post(f"/api/v1/admin/projects/{bad_proj_id}/publish", headers=headers).status_code == 200

    # Negative testimonial creation with publish_status=published lacking author_name/quote -> 422
    direct_bad_t = client.post(
        "/api/v1/admin/testimonials",
        headers=headers,
        json={
            "title": "Direct Publish Attempt",
            "rating_label": "5.0",
            "stars": 5,
            "source": "Upwork",
            "publish_status": "published",
        },
    )
    assert direct_bad_t.status_code == 422

    # Negative testimonial publish: whitespace-only author_name / missing quote in DB -> 422
    with session_factory() as db:
        ws_t = Testimonial(
            title="Whitespace Testimonial",
            author_name="   ",
            quote="Valid quote text here.",
            rating_label="5.0",
            stars=5,
            source="Direct",
        )
        db.add(ws_t)
        db.commit()
        ws_t_id = str(ws_t.id)

    assert client.post(f"/api/v1/admin/testimonials/{ws_t_id}/publish", headers=headers).status_code == 422
    assert client.patch(
        f"/api/v1/admin/testimonials/{ws_t_id}",
        headers=headers,
        json={"author_name": "Nadia K."},
    ).status_code == 200
    assert client.post(f"/api/v1/admin/testimonials/{ws_t_id}/publish", headers=headers).status_code == 200

    # Missing IDs on publish/unpublish return 404
    missing_id = str(uuid.uuid4())
    assert client.post(f"/api/v1/admin/projects/{missing_id}/publish", headers=headers).status_code == 404
    assert client.post(f"/api/v1/admin/projects/{missing_id}/unpublish", headers=headers).status_code == 404
    assert client.post(f"/api/v1/admin/testimonials/{missing_id}/publish", headers=headers).status_code == 404
    assert client.post(f"/api/v1/admin/testimonials/{missing_id}/unpublish", headers=headers).status_code == 404


def test_content_negative_validation_and_not_found_across_resources(
    authenticated_admin_client: tuple[TestClient, sessionmaker[Session], dict[str, str]],
) -> None:
    client, _session_factory, headers = authenticated_admin_client
    missing_id = str(uuid.uuid4())

    # 404 coverage on GET, PATCH, DELETE across services, skills, experience, education, certifications, testimonials
    resource_patches: list[tuple[str, dict[str, object]]] = [
        ("services", {"title": "Updated"}),
        ("skills", {"title": "Updated"}),
        ("experience", {"role": "Updated"}),
        ("education", {"degree": "Updated"}),
        ("certifications", {"title": "Updated"}),
        ("testimonials", {"title": "Updated"}),
    ]
    for resource, patch_body in resource_patches:
        assert client.get(f"/api/v1/admin/{resource}/{missing_id}", headers=headers).status_code == 404
        assert client.patch(f"/api/v1/admin/{resource}/{missing_id}", headers=headers, json=patch_body).status_code == 404
        assert client.delete(f"/api/v1/admin/{resource}/{missing_id}", headers=headers).status_code == 404

    # Unexpected extra fields rejected (422) on POST for all six resources
    extra_payloads: list[tuple[str, dict[str, object]]] = [
        (
            "services",
            {
                "category": "AI",
                "domain": "AGENTS",
                "title": "Service A",
                "description": "Production workflow automation systems.",
                "unexpected": True,
            },
        ),
        (
            "skills",
            {
                "layer": "ai",
                "domain": "LLM",
                "title": "Prompting",
                "description": "Structured evaluation and prompt orchestration.",
                "unexpected": True,
            },
        ),
        (
            "experience",
            {
                "period": "2024",
                "role": "Engineer",
                "organization": "Lab",
                "summary": "Delivered production LLM pipelines and services.",
                "unexpected": True,
            },
        ),
        (
            "education",
            {
                "period": "2020",
                "degree": "B.S.",
                "institution": "Uni",
                "unexpected": True,
            },
        ),
        (
            "certifications",
            {
                "year": "2025",
                "title": "Cert",
                "issuer": "Org",
                "unexpected": True,
            },
        ),
        (
            "testimonials",
            {
                "title": "Great Work",
                "rating_label": "5.0",
                "stars": 5,
                "source": "Upwork",
                "unexpected": True,
            },
        ),
    ]
    for resource, payload in extra_payloads:
        assert client.post(f"/api/v1/admin/{resource}", headers=headers, json=payload).status_code == 422

    # Invalid media references rejected (422) for certifications & testimonials
    assert (
        client.post(
            "/api/v1/admin/certifications",
            headers=headers,
            json={
                "year": "2025",
                "title": "Valid Cert",
                "issuer": "Institute",
                "badge_media_id": str(uuid.uuid4()),
            },
        ).status_code
        == 422
    )
    assert (
        client.post(
            "/api/v1/admin/testimonials",
            headers=headers,
            json={
                "title": "Valid Testimonial",
                "rating_label": "5.0",
                "stars": 5,
                "source": "Direct",
                "avatar_media_id": str(uuid.uuid4()),
            },
        ).status_code
        == 422
    )
    assert (
        client.post(
            "/api/v1/admin/testimonials",
            headers=headers,
            json={
                "title": "Invalid Stars",
                "rating_label": "6.0",
                "stars": 6,
                "source": "Direct",
            },
        ).status_code
        == 422
    )

    # Create valid records and test PATCH required-field null rejection + missing GET paths
    svc = client.post(
        "/api/v1/admin/services",
        headers=headers,
        json={
            "category": "AI",
            "domain": "RAG",
            "title": "RAG Pipelines",
            "description": "Hybrid retrieval systems for technical teams.",
        },
    )
    assert svc.status_code == 201
    assert client.patch(f"/api/v1/admin/services/{svc.json()['id']}", headers=headers, json={"title": None}).status_code == 422

    skill = client.post(
        "/api/v1/admin/skills",
        headers=headers,
        json={
            "layer": "ai",
            "domain": "RAG",
            "title": "Vector Search",
            "description": "pgvector and hybrid search ranking strategies.",
        },
    )
    assert skill.status_code == 201
    assert client.patch(f"/api/v1/admin/skills/{skill.json()['id']}", headers=headers, json={"items": None}).status_code == 422

    exp = client.post(
        "/api/v1/admin/experience",
        headers=headers,
        json={
            "period": "2024 - Present",
            "role": "Lead Engineer",
            "organization": "Studio",
            "summary": "Built reliable backend services and AI workflows.",
        },
    )
    assert exp.status_code == 201
    assert client.patch(f"/api/v1/admin/experience/{exp.json()['id']}", headers=headers, json={"role": None}).status_code == 422

    edu = client.post(
        "/api/v1/admin/education",
        headers=headers,
        json={"period": "2018 - 2022", "degree": "B.S. CS", "institution": "University"},
    )
    assert edu.status_code == 201
    edu_id = edu.json()["id"]
    assert client.get(f"/api/v1/admin/education/{edu_id}", headers=headers).status_code == 200
    assert client.patch(f"/api/v1/admin/education/{edu_id}", headers=headers, json={"degree": None}).status_code == 422

    cert = client.post(
        "/api/v1/admin/certifications",
        headers=headers,
        json={"year": "2025", "title": "ML Cert", "issuer": "Org"},
    )
    assert cert.status_code == 201
    cert_id = cert.json()["id"]
    assert client.get(f"/api/v1/admin/certifications/{cert_id}", headers=headers).status_code == 200
    assert client.patch(f"/api/v1/admin/certifications/{cert_id}", headers=headers, json={"issuer": None}).status_code == 422

    t_ok = client.post(
        "/api/v1/admin/testimonials",
        headers=headers,
        json={
            "title": "Client Feedback",
            "author_name": "Sam T.",
            "quote": "Strong engineering communication and delivery.",
            "rating_label": "5.0",
            "stars": 5,
            "source": "Upwork",
        },
    )
    assert t_ok.status_code == 201
    t_ok_id = t_ok.json()["id"]
    assert client.get("/api/v1/admin/testimonials", headers=headers).json()["total"] == 1
    assert client.get(f"/api/v1/admin/testimonials/{t_ok_id}", headers=headers).status_code == 200
    assert client.patch(f"/api/v1/admin/testimonials/{t_ok_id}", headers=headers, json={"source": None}).status_code == 422


def test_pagination_and_sorting_validation(
    authenticated_admin_client: tuple[TestClient, sessionmaker[Session], dict[str, str]],
) -> None:
    client, _session_factory, headers = authenticated_admin_client

    titles = ["Epsilon", "Alpha", "Delta", "Beta", "Gamma"]
    for idx, title in enumerate(titles):
        res = client.post(
            "/api/v1/admin/services",
            headers=headers,
            json={
                "category": "AI",
                "domain": "SYSTEMS",
                "title": title,
                "description": f"Production service implementation for {title}.",
                "display_order": idx,
            },
        )
        assert res.status_code == 201

    p1 = client.get(
        "/api/v1/admin/services?page=1&page_size=2&sort_by=title&sort_order=asc",
        headers=headers,
    )
    assert p1.status_code == 200
    b1 = p1.json()
    assert b1["total"] == 5
    assert b1["total_pages"] == 3
    assert b1["page"] == 1
    assert b1["page_size"] == 2
    assert [item["title"] for item in b1["items"]] == ["Alpha", "Beta"]

    p2 = client.get(
        "/api/v1/admin/services?page=2&page_size=2&sort_by=title&sort_order=asc",
        headers=headers,
    )
    assert p2.status_code == 200
    b2 = p2.json()
    assert b2["total"] == 5
    assert b2["total_pages"] == 3
    assert [item["title"] for item in b2["items"]] == ["Delta", "Epsilon"]

    desc_res = client.get(
        "/api/v1/admin/services?page=1&page_size=2&sort_by=title&sort_order=desc",
        headers=headers,
    )
    assert desc_res.status_code == 200
    assert [item["title"] for item in desc_res.json()["items"]] == ["Gamma", "Epsilon"]

    # Invalid sort_by and sort_order rejected with 422
    assert (
        client.get("/api/v1/admin/services?sort_by=nonexistent", headers=headers).status_code == 422
    )
    assert (
        client.get("/api/v1/admin/services?sort_order=random", headers=headers).status_code == 422
    )
    assert (
        client.get("/api/v1/admin/projects?sort_by=secret_col", headers=headers).status_code == 422
    )
    assert (
        client.get("/api/v1/admin/messages?sort_by=source_ip", headers=headers).status_code == 422
    )
