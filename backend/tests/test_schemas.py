"""Tests for Pydantic v2 schema validation and ORM serialization."""

from __future__ import annotations

import uuid
from datetime import datetime, timezone

import pytest
from pydantic import ValidationError

from app.models import AdminUser, Certification, MediaAsset, Project, SiteSetting
from app.models.enums import ContactInquiryMode, ContactMessageStatus, SkillLayer
from app.schemas import (
    PUBLIC_SETTING_KEYS,
    AboutPageSettings,
    AdminUserCreate,
    AdminUserRead,
    CertificationRead,
    ContactMessageCreate,
    ContactMessageUpdate,
    ContactPageSettings,
    HomePageSettings,
    MediaAssetCreate,
    MediaAssetSummary,
    PaginatedResponse,
    ProjectCreate,
    ProjectRead,
    ProjectSummary,
    ProjectUpdate,
    PublicSiteSettingsPayload,
    ServiceCreate,
    SiteGeneralSettings,
    SiteSettingCreate,
    SiteSettingRead,
    SiteSettingUpdate,
    SiteSettingVisibilityUpdate,
    SkillsPageSettings,
    SkillUpdate,
    TestimonialCreate as TestimonialCreateSchema,
    validate_site_setting_value,
)


def test_admin_user_read_excludes_password_hash() -> None:
    now = datetime.now(timezone.utc)
    orm_user = AdminUser(
        id=uuid.uuid4(),
        email="owner@example.com",
        full_name="Portfolio Owner",
        password_hash="argon2id$supersecret",
        role="super_admin",
        is_active=True,
        created_at=now,
        updated_at=now,
    )
    schema = AdminUserRead.model_validate(orm_user)
    dumped = schema.model_dump()
    assert "password_hash" not in dumped
    assert dumped["email"] == "owner@example.com"


def test_contact_message_create_validation() -> None:
    valid = ContactMessageCreate(
        inquiry_mode=ContactInquiryMode.PROJECT,
        sender_name="  Alex Rivera  ",
        sender_email="alex@example.com",
        subject="RAG Pipeline",
        project_type="RAG or knowledge system",
        message="We need a production RAG pipeline over internal documentation.",
    )
    assert valid.sender_name == "Alex Rivera"

    with pytest.raises(ValidationError):
        ContactMessageCreate(
            inquiry_mode=ContactInquiryMode.PROJECT,
            sender_name="A",
            sender_email="not-an-email",
            subject="Hi",
            project_type="AI",
            message="Too short",
        )


def test_project_slug_and_media_url_validation() -> None:
    project = ProjectCreate(
        slug="knowledge-assistant",
        title="Knowledge Assistant",
        category="AI & Machine Learning",
        summary="Grounded RAG architecture over verified documents.",
        problem="Teams lose time searching scattered operational guides.",
        solution="Built a hybrid search and citation-constrained RAG API.",
        deliverables=["Ingestion pipeline"],
        tags=["Python", "FastAPI"],
    )
    assert project.slug == "knowledge-assistant"

    with pytest.raises(ValidationError):
        ProjectCreate(
            slug="Invalid Slug!",
            title="Bad Slug",
            category="AI & Machine Learning",
            summary="Grounded RAG architecture over verified documents.",
            problem="Teams lose time searching scattered operational guides.",
            solution="Built a hybrid search and citation-constrained RAG API.",
        )

    asset = MediaAssetCreate(
        title="Portrait",
        file_name="portrait.jpg",
        url="/shabnum-portrait.jpg",
        mime_type="image/jpeg",
    )
    assert asset.url == "/shabnum-portrait.jpg"

    with pytest.raises(ValidationError):
        MediaAssetCreate(
            title="Bad Asset",
            file_name="bad.jpg",
            url="ftp://invalid.example.com/bad.jpg",
            mime_type="image/jpeg",
        )


def test_testimonial_star_bounds() -> None:
    with pytest.raises(ValidationError):
        TestimonialCreateSchema(
            title="Invalid Stars",
            rating_label="6.0",
            stars=6,
            source="Test",
        )
    assert ContactMessageStatus.UNREAD.value == "unread"


def test_write_schemas_forbid_extra_fields_while_read_schemas_remain_compatible() -> None:
    with pytest.raises(ValidationError):
        ProjectCreate(
            slug="rag-service",
            title="RAG Service",
            category="AI & Machine Learning",
            summary="Grounded RAG architecture over verified documents.",
            problem="Teams lose time searching scattered operational guides.",
            solution="Built a hybrid search and citation-constrained RAG API.",
            unexpected_field="mass-assignment-attempt",
        )

    for schema_cls, payload in (
        (ProjectUpdate, {"title": "Updated", "is_admin": True}),
        (
            ServiceCreate,
            {
                "category": "Agents & Voice",
                "domain": "AUTOMATION",
                "title": "Agentic AI",
                "description": "Reliable multi-agent automation workflows.",
                "extra_key": 1,
            },
        ),
        (SkillUpdate, {"title": "Updated Skill", "extra_key": "nope"}),
        (
            ContactMessageCreate,
            {
                "sender_name": "Alex Rivera",
                "sender_email": "alex@example.com",
                "subject": "Architecture review",
                "project_type": "Backend or API",
                "message": "Looking for an API and Postgres architecture review.",
                "status": "read",
            },
        ),
        (ContactMessageUpdate, {"status": "read", "handled_by_id": str(uuid.uuid4())}),
        (
            AdminUserCreate,
            {
                "email": "admin@example.com",
                "full_name": "Admin User",
                "password": "VeryStrongPassword!123",
                "unknown": "x",
            },
        ),
    ):
        with pytest.raises(ValidationError):
            schema_cls(**payload)

    # Read schemas preserve backward compatibility with extra dict data
    now = datetime.now(timezone.utc)
    proj_read = ProjectRead.model_validate(
        {
            "id": uuid.uuid4(),
            "created_at": now,
            "updated_at": now,
            "slug": "rag-service",
            "title": "RAG Service",
            "category": "AI & Machine Learning",
            "summary": "Grounded RAG architecture over verified documents.",
            "problem": "Teams lose time searching scattered operational guides.",
            "solution": "Built a hybrid search and citation-constrained RAG API.",
            "legacy_extra_attr": "ignored-on-read",
        }
    )
    assert proj_read.slug == "rag-service"
    assert proj_read.cover_media is None


def test_pagination_response_envelope() -> None:
    empty = PaginatedResponse[str].create(items=[], total=0, page=1, page_size=20)
    assert empty.total_pages == 0
    assert empty.items == []

    paged = PaginatedResponse[str].create(items=["a", "b"], total=45, page=2, page_size=20)
    assert paged.total == 45
    assert paged.page == 2
    assert paged.total_pages == 3


def test_resolved_media_summary_serialization() -> None:
    now = datetime.now(timezone.utc)
    media = MediaAsset(
        id=uuid.uuid4(),
        title="Cover",
        file_name="cover.png",
        url="https://cdn.example.com/cover.png",
        mime_type="image/png",
        width=1200,
        height=800,
        alt_text="Architecture diagram",
        created_at=now,
        updated_at=now,
    )
    project = Project(
        id=uuid.uuid4(),
        slug="case-study",
        title="Case Study",
        category="AI & Machine Learning",
        project_type="Case Study",
        publish_status="published",
        featured=True,
        display_order=1,
        summary="Production retrieval architecture over internal manuals.",
        problem="Manuals were fragmented across PDFs and wiki pages.",
        solution="Built an indexed hybrid RAG service with FastAPI.",
        deliverables=["Ingestion"],
        tags=["Python"],
        cover_media_id=media.id,
        cover_media=media,
        created_at=now,
        updated_at=now,
    )
    proj_read = ProjectRead.model_validate(project)
    proj_summary = ProjectSummary.model_validate(project)
    assert proj_read.cover_media is not None
    assert proj_read.cover_media.url == "https://cdn.example.com/cover.png"
    assert proj_summary.cover_media is not None
    assert proj_summary.cover_media.alt_text == "Architecture diagram"

    cert = Certification(
        id=uuid.uuid4(),
        year="2024",
        title="LLM Engineering",
        issuer="Provider",
        publish_status="published",
        display_order=1,
        badge_media_id=media.id,
        badge_media=media,
        created_at=now,
        updated_at=now,
    )
    assert CertificationRead.model_validate(cert).badge_media == MediaAssetSummary.model_validate(media)

    from app.models.testimonial import Testimonial
    from app.schemas.testimonial import TestimonialRead

    testimonial = Testimonial(
        id=uuid.uuid4(),
        title="Client review",
        rating_label="5.0",
        stars=5,
        source="Upwork",
        featured=False,
        publish_status="published",
        display_order=1,
        avatar_media_id=media.id,
        avatar_media=media,
        created_at=now,
        updated_at=now,
    )
    assert TestimonialRead.model_validate(testimonial).avatar_media is not None

    setting = SiteSetting(
        id=uuid.uuid4(),
        key="home_page",
        label="Home Page",
        category="pages",
        value={"hero": "ok"},
        is_public=True,
        portrait_media_id=media.id,
        portrait_media=media,
        created_at=now,
        updated_at=now,
    )
    assert SiteSettingRead.model_validate(setting).portrait_media is not None


def _sample_cta(label: str = "View Projects", href: str = "/projects") -> dict[str, str]:
    return {"label": label, "href": href}


def test_typed_public_site_settings_and_url_validation() -> None:
    assert PUBLIC_SETTING_KEYS == frozenset(
        {"site_general", "home_page", "about_page", "contact_page", "skills_page"}
    )

    site_general_val = {
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
        "connect_channels": [
            {
                "id": "email",
                "label": "Email",
                "handle_placeholder": "Use the contact form",
                "icon": "mail",
                "href": "/contact",
                "external": False,
            },
            {
                "id": "github",
                "label": "GitHub",
                "handle_placeholder": "Profile",
                "icon": "github",
                "href": "https://github.com/example",
                "external": True,
            },
        ],
    }
    home_val = {
        "hero_eyebrow": "HELLO, I'M SHABNUM H.",
        "hero_heading_primary": "AI Engineer &",
        "hero_heading_secondary": "Backend Developer.",
        "hero_summary": "Building reliable AI systems and FastAPI backend services.",
        "hero_specializations": ["Agentic AI", "RAG Systems"],
        "hero_portrait_alt": "Portrait of Shabnum H.",
        "hero_primary_cta": _sample_cta("View Projects", "#projects"),
        "hero_secondary_cta": _sample_cta("Contact Me", "/contact"),
        "about_eyebrow": "01 / ABOUT",
        "about_side_note": "Thoughtful automation for growing businesses.",
        "about_title": "Systems that move businesses forward.",
        "about_description": "Delivering production AI applications beyond the demo.",
        "about_cta": _sample_cta("Read more about me", "/about"),
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
            "primary_cta": _sample_cta("Start a conversation", "/contact"),
            "secondary_cta": _sample_cta("View services", "/services"),
        },
    }
    about_val = {
        "meta_title": "About",
        "meta_description": "Professional biography and engineering principles.",
        "eyebrow": "ABOUT / BIO",
        "headline_primary": "Practical AI engineering,",
        "headline_secondary": "solid backend craft.",
        "portrait_caption": "SHABNUM H. · AI & BACKEND",
        "portrait_alt": "Portrait of Shabnum H.",
        "bio_paragraphs": ["Focused on reliable AI workflows and clean FastAPI services."],
        "primary_cta": _sample_cta("Get in touch", "/contact"),
        "secondary_cta": _sample_cta("View projects", "/projects"),
        "approach_eyebrow": "01 / APPROACH",
        "approach_title": "Simple architecture.",
        "approach_principles": [
            {
                "id": "p1",
                "number": "01",
                "title": "Start with the problem",
                "description": "Clarify workflows before selecting models.",
            }
        ],
        "background_eyebrow": "02 / BACKGROUND",
        "background_title": "Career journey & credentials.",
        "contact_cta": {
            "eyebrow": "03 / CONTACT",
            "title": "Have a problem worth exploring",
            "description": "Share what you are building.",
            "primary_cta": _sample_cta("Get in touch", "/contact"),
            "secondary_cta": _sample_cta("View services", "/services"),
        },
    }
    contact_val = {
        "meta_title": "Contact",
        "meta_description": "Start a conversation about AI engineering and backend systems.",
        "badge": "GET IN TOUCH",
        "headline": "Let's talk ideas & projects",
        "intro": "Open for AI engineering builds and backend collaborations.",
        "cv_heading": "Looking for Shabnum's Curriculum Vitae?",
        "cv_ready_badge": "PDF READY",
        "cv_request_badge": "ON REQUEST",
        "cv_ready_description": "Summary of AI systems engineering ready for download.",
        "cv_request_description": "A PDF copy is available upon request.",
        "channels_heading": "Contact Channels",
        "channels_description": "Reach out via form or developer platforms.",
        "project_types": ["AI application", "Backend or API"],
        "project_mode_copy": {
            "tab_label": "Start a Project",
            "heading": "Let's Build Together",
            "subtitle": "Share your project goals and backend requirements.",
            "subject_placeholder": "What would you like to build?",
            "message_placeholder": "Tell me about your project scope and timeline...",
            "submit_label": "Send Inquiry",
        },
        "advisory_mode_copy": {
            "tab_label": "Advisory & Roles",
            "heading": "Technical Advisory & Roles",
            "subtitle": "Explore architecture reviews or consulting collaborations.",
            "subject_placeholder": "Role or architecture topic",
            "message_placeholder": "Share context on the role or team questions...",
            "submit_label": "Send Message",
        },
    }
    skills_val = {
        "meta_title": "Skills",
        "meta_description": "Programming languages, AI frameworks, and backend tooling.",
        "badge": "SKILLS / CAPABILITY MAP",
        "headline": "A practical engineering toolkit.",
        "description": "Core technologies organized across capability groups.",
        "primary_cta": _sample_cta("See skills in projects", "/projects"),
        "secondary_cta": _sample_cta("View services", "/services"),
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
            "primary_cta": _sample_cta("Discuss a project", "/contact"),
            "secondary_cta": _sample_cta("View projects", "/projects"),
        },
    }

    SiteGeneralSettings.model_validate(site_general_val)
    HomePageSettings.model_validate(home_val)
    AboutPageSettings.model_validate(about_val)
    ContactPageSettings.model_validate(contact_val)
    SkillsPageSettings.model_validate(skills_val)

    bundle = PublicSiteSettingsPayload(
        site_general=SiteGeneralSettings.model_validate(
            {**site_general_val, "og_description": "Practical AI and backend engineering."}
        ),
        home_page=HomePageSettings.model_validate(home_val),
        about_page=AboutPageSettings.model_validate(about_val),
        contact_page=ContactPageSettings.model_validate(
            {**contact_val, "headline_accent": "projects"}
        ),
        skills_page=SkillsPageSettings.model_validate(
            {**skills_val, "headline_accent": "engineering toolkit."}
        ),
    )
    assert bundle.site_general is not None
    assert bundle.site_general.direct_contact_fallback_label == "Start an inquiry via Contact"
    assert bundle.home_page is not None
    assert bundle.home_page.hero_specializations_label == "SPECIALIZATIONS"
    assert bundle.about_page is not None
    assert bundle.about_page.education_heading == "EDUCATION"
    assert bundle.contact_page is not None
    assert bundle.contact_page.headline_accent == "projects"
    assert bundle.contact_page.project_mode_copy.eyebrow == "INQUIRY"
    assert bundle.skills_page is not None
    assert bundle.skills_page.headline_accent == "engineering toolkit."

    # Unsafe URL schemes / protocol-relative URLs rejected in links & media
    for unsafe_href in ("javascript:alert(1)", "data:text/html,hi", "//evil.example/x", "ftp://x.com"):
        bad_home = dict(home_val)
        bad_home["hero_primary_cta"] = {"label": "Bad", "href": unsafe_href}
        with pytest.raises(ValidationError):
            HomePageSettings.model_validate(bad_home)

        with pytest.raises(ValidationError):
            MediaAssetCreate(
                title="Unsafe",
                file_name="unsafe.png",
                url=unsafe_href,
                mime_type="image/png",
            )


def test_private_settings_cannot_be_marked_public_or_toggled() -> None:
    # Private key defaults to is_public=False and succeeds when kept private
    private_setting = SiteSettingCreate(
        key="internal_admin_prefs",
        label="Internal Preferences",
        category="admin",
        value={"items_per_page": 25},
    )
    assert private_setting.is_public is False

    # Non-whitelisted key cannot be created as public
    with pytest.raises(ValidationError):
        SiteSettingCreate(
            key="internal_admin_prefs",
            label="Internal Preferences",
            category="admin",
            value={"items_per_page": 25},
            is_public=True,
        )

    # Whitelisted key can be public and validates value via typed schema
    with pytest.raises(ValidationError):
        SiteSettingCreate(
            key="skills_page",
            label="Skills Page",
            category="pages",
            value={"incomplete": True},
            is_public=True,
        )

    # Ordinary admin update cannot toggle `is_public`
    with pytest.raises(ValidationError):
        SiteSettingUpdate(label="Updated Label", is_public=True)

    # Updating value by stored key rejects invalid public setting payload
    with pytest.raises(ValidationError):
        validate_site_setting_value("skills_page", {"incomplete": True})

    # Dedicated visibility schema only accepts `is_public` boolean
    vis_update = SiteSettingVisibilityUpdate(is_public=True)
    assert vis_update.is_public is True
    with pytest.raises(ValidationError):
        SiteSettingVisibilityUpdate(is_public=True, value={"bypass": True})
