"""Verified initial portfolio seed catalog mapped from the Next.js static data modules.

All placeholder or incomplete records (placeholder organizations/institutions/issuers and
testimonials lacking author_name/quote) are explicitly kept in `draft` status so they are
never exposed on public endpoints before admin review.
"""

from __future__ import annotations

from dataclasses import dataclass
from decimal import Decimal
from typing import Any

from app.models.enums import ProjectType, PublishStatus, SkillLayer, StorageProvider


@dataclass(frozen=True)
class MediaSeed:
    title: str
    file_name: str
    storage_provider: StorageProvider
    storage_key: str | None
    url: str
    mime_type: str
    file_size_bytes: int | None
    width: int | None
    height: int | None
    alt_text: str | None
    caption: str | None


@dataclass(frozen=True)
class SiteSettingSeed:
    key: str
    label: str
    category: str
    description: str
    is_public: bool
    value: dict[str, Any]
    portrait_media_url: str | None = None


@dataclass(frozen=True)
class ServiceSeed:
    display_number: str
    category: str
    domain: str
    title: str
    description: str
    tools: list[str]
    featured: bool
    home_category_label: str | None
    home_title: str | None
    home_description: str | None
    home_tags: list[str] | None
    publish_status: PublishStatus
    display_order: int


@dataclass(frozen=True)
class SkillSeed:
    layer: SkillLayer
    display_number: str
    domain: str
    title: str
    description: str
    items: list[str]
    featured: bool
    featured_category: str | None
    featured_title: str | None
    featured_description: str | None
    featured_tags: list[str] | None
    publish_status: PublishStatus
    display_order: int


@dataclass(frozen=True)
class ProjectSeed:
    slug: str
    display_number: str
    title: str
    category: str
    home_category_label: str | None
    project_type: ProjectType
    publish_status: PublishStatus
    featured: bool
    display_order: int
    summary: str
    problem: str
    solution: str
    deliverables: list[str]
    tags: list[str]
    live_url: str | None = None
    repo_url: str | None = None
    cover_media_url: str | None = None


@dataclass(frozen=True)
class ExperienceSeed:
    period: str
    role: str
    organization: str
    summary: str
    is_current: bool
    publish_status: PublishStatus
    display_order: int
    verification_note: str | None = None


@dataclass(frozen=True)
class EducationSeed:
    period: str
    degree: str
    institution: str
    publish_status: PublishStatus
    display_order: int
    verification_note: str | None = None


@dataclass(frozen=True)
class CertificationSeed:
    year: str
    title: str
    issuer: str
    publish_status: PublishStatus
    display_order: int
    badge_media_url: str | None = None
    verification_note: str | None = None


@dataclass(frozen=True)
class TestimonialSeed:
    title: str
    rating_score: Decimal | None
    rating_label: str
    stars: int
    source: str
    featured: bool
    publish_status: PublishStatus
    display_order: int
    author_name: str | None = None
    author_role: str | None = None
    quote: str | None = None
    source_url: str | None = None
    avatar_media_url: str | None = None
    verification_note: str | None = None


MEDIA_SEEDS: tuple[MediaSeed, ...] = (
    MediaSeed(
        title="Shabnum H. Portrait",
        file_name="shabnum-portrait.jpg",
        storage_provider=StorageProvider.LOCAL_PUBLIC,
        storage_key="shabnum-portrait.jpg",
        url="/shabnum-portrait.jpg",
        mime_type="image/jpeg",
        file_size_bytes=626260,
        width=1024,
        height=1024,
        alt_text="Portrait of Shabnum H., AI Engineer and Backend Developer",
        caption="SHABNUM H. · AI & BACKEND",
    ),
)

SITE_SETTING_SEEDS: tuple[SiteSettingSeed, ...] = (
    SiteSettingSeed(
        key="site_general",
        label="General Site Profile & Identity",
        category="general",
        description="Global site identity, SEO defaults, copyright footer, and social/contact channels.",
        is_public=True,
        value={
            "initials": "SH",
            "owner_name": "Shabnum H.",
            "professional_title": "AI Engineer & Backend Developer",
            "brand_name": "SHABNUM H.",
            "tagline": (
                "AI Engineer & Backend Developer — building practical AI workflows, "
                "RAG systems, and dependable Python backends."
            ),
            "logo_media_id": None,
            "logo_url": None,
            "direct_email": None,
            "direct_contact_fallback_label": "Start an inquiry via Contact",
            "cv_url": None,
            "tech_note": "AI / BACKEND / SYSTEMS",
            "copyright_year": 2026,
            "copyright_note": "Built with Next.js & Tailwind CSS.",
            "meta_title_default": "Shabnum H. | AI Engineer & Backend Developer",
            "meta_title_template": "%s | Shabnum H.",
            "meta_description": (
                "Shabnum H. builds practical AI applications, workflow automation, "
                "and reliable backend systems for growing businesses."
            ),
            "og_description": (
                "Practical AI engineering, RAG systems, workflow automation, "
                "and dependable Python backend architectures."
            ),
            "connect_channels": [
                {
                    "id": "email",
                    "label": "Email",
                    "handle_placeholder": "Use the contact form to inquire",
                    "icon": "mail",
                    "href": "/contact",
                    "external": False,
                    "status": None,
                },
                {
                    "id": "linkedin",
                    "label": "LinkedIn",
                    "handle_placeholder": "Profile link coming soon",
                    "icon": "linkedin",
                    "href": None,
                    "external": False,
                    "status": "soon",
                },
                {
                    "id": "github",
                    "label": "GitHub",
                    "handle_placeholder": "Profile link coming soon",
                    "icon": "github",
                    "href": None,
                    "external": False,
                    "status": "soon",
                },
                {
                    "id": "upwork",
                    "label": "Upwork",
                    "handle_placeholder": "Freelance profile link coming soon",
                    "icon": "briefcase",
                    "href": None,
                    "external": False,
                    "status": "soon",
                },
            ],
        },
    ),
    SiteSettingSeed(
        key="home_page",
        label="Home Page Content",
        category="pages",
        description="Hero copy, highlights, section headings, process steps, and home CTA blocks.",
        is_public=True,
        portrait_media_url="/shabnum-portrait.jpg",
        value={
            "meta_title": None,
            "meta_description": None,
            "hero_eyebrow": "HELLO, I'M SHABNUM H.",
            "hero_heading_primary": "AI Engineer &",
            "hero_heading_secondary": "Backend Developer.",
            "hero_summary": (
                "I build AI systems that automate workflows, analyze business data, "
                "and turn complex ideas into reliable products that create measurable value."
            ),
            "hero_specializations_label": "SPECIALIZATIONS",
            "hero_specializations": [
                "Agentic AI",
                "RAG Systems",
                "Python & FastAPI",
                "Workflow Automation",
            ],
            "hero_portrait_alt": "Portrait of Shabnum H., AI Engineer and Backend Developer",
            "hero_primary_cta": {"label": "View Projects", "href": "#projects"},
            "hero_secondary_cta": {"label": "Contact Me", "href": "/contact"},
            "about_eyebrow": "01 / ABOUT SHABNUM",
            "about_side_note": (
                "AI Engineer ready to transform business operations through thoughtful automation."
            ),
            "about_title": "I build systems that move businesses forward.",
            "about_description": (
                "With 5+ years of experience in production AI systems, I help teams automate "
                "workflows, unlock insights, and deliver AI applications that are useful beyond the demo."
            ),
            "about_cta": {"label": "Read more about me", "href": "/about"},
            "highlights_eyebrow": "AT A GLANCE",
            "highlights_title": "Built for practical progress.",
            "highlights_note": (
                "A few profile highlights from Shabnum's current professional record."
            ),
            "highlights": [
                {
                    "id": "highlight-experience",
                    "index": "01 / EXPERIENCE",
                    "value": "5+",
                    "suffix": None,
                    "label": "Years building production AI systems",
                },
                {
                    "id": "highlight-projects",
                    "index": "02 / PROJECTS",
                    "value": "7",
                    "suffix": None,
                    "label": "Completed freelance jobs",
                },
                {
                    "id": "highlight-delivery",
                    "index": "03 / DELIVERY",
                    "value": "63",
                    "suffix": None,
                    "label": "Tracked hours of client work",
                },
                {
                    "id": "highlight-rating",
                    "index": "04 / RATING",
                    "value": "5.0",
                    "suffix": "★",
                    "label": "Client rating shown on profile",
                },
            ],
            "services_section": {
                "eyebrow": "02 / SERVICES",
                "title": "Capabilities for useful products.",
                "description": (
                    "Core areas of AI engineering and backend architecture. "
                    "Explore all eight capabilities on the Services page."
                ),
                "cta_label": "View all services",
                "cta_href": "/services",
            },
            "services_card_cta_label": "Explore services",
            "projects_section": {
                "eyebrow": "03 / PROJECTS",
                "title": "Selected work directions.",
                "description": (
                    "Representative AI and backend architectures showing the types of "
                    "systems this portfolio presents."
                ),
                "cta_label": "View all projects",
                "cta_href": "/projects",
            },
            "projects_card_cta_label": "Open project brief",
            "skills_section": {
                "eyebrow": "04 / SKILLS",
                "title": "The tools behind the work.",
                "description": (
                    "A concise preview of core technologies. Visit the Skills page for "
                    "the complete seven-group capability map."
                ),
                "cta_label": "Explore all skills",
                "cta_href": "/skills",
            },
            "skills_card_cta_label": "View full skill stack",
            "process_eyebrow": "05 / PROCESS",
            "process_title": "A clear path from question to system.",
            "process_note": "Structured engineering from discovery to iteration.",
            "process_steps": [
                {
                    "number": "01",
                    "title": "Understand the problem",
                    "description": (
                        "Clarify goals, users, constraints, and data before choosing a direction."
                    ),
                },
                {
                    "number": "02",
                    "title": "Plan the solution",
                    "description": "Shape system boundaries and delivery around the actual problem.",
                },
                {
                    "number": "03",
                    "title": "Build and integrate",
                    "description": (
                        "Implement the experience and connect the APIs, data, and systems it needs."
                    ),
                },
                {
                    "number": "04",
                    "title": "Test and improve",
                    "description": (
                        "Evaluate behavior, strengthen reliability, and use feedback to guide iteration."
                    ),
                },
            ],
            "testimonials_eyebrow": "06 / CLIENT FEEDBACK",
            "testimonials_title": "Trusted for thoughtful delivery.",
            "testimonials_note": "Selected feedback from completed client engagements.",
            "contact_cta": {
                "eyebrow": "07 / CONTACT",
                "title": "Let's build something useful",
                "description": (
                    "Free consultation before starting. Share the problem, and let's find "
                    "a practical path forward."
                ),
                "primary_cta": {"label": "Start a conversation", "href": "/contact"},
                "secondary_cta": {"label": "View services", "href": "/services"},
            },
        },
    ),
    SiteSettingSeed(
        key="about_page",
        label="About Page Content",
        category="pages",
        description="Biography copy, approach principles, background section headings, and CTA.",
        is_public=True,
        portrait_media_url="/shabnum-portrait.jpg",
        value={
            "meta_title": "About",
            "meta_description": (
                "Professional biography, engineering approach, career journey, and academic "
                "foundations of Shabnum H., AI Engineer & Backend Developer."
            ),
            "eyebrow": "ABOUT / PROFESSIONAL BIO",
            "headline_primary": "Practical AI engineering,",
            "headline_secondary": "built on solid backend craft.",
            "portrait_caption": "SHABNUM H. · AI & BACKEND",
            "portrait_alt": "Portrait of Shabnum H., AI Engineer and Backend Developer",
            "bio_paragraphs": [
                (
                    "I'm Shabnum H., an AI Engineer and Backend Developer focused on turning "
                    "everyday operational bottlenecks into reliable software. My work connects "
                    "applied AI—RAG pipelines, tool-using agents, and workflow automation—with "
                    "clean Python services and dependable APIs."
                ),
                (
                    "I care far more about production reliability than flashy demos: grounding "
                    "answers in trusted business data, enforcing structured outputs, keeping "
                    "humans in the loop for sensitive actions, and leaving codebases clear enough "
                    "for teams to build on."
                ),
            ],
            "primary_cta": {"label": "Get in touch", "href": "/contact"},
            "secondary_cta": {"label": "View projects", "href": "/projects"},
            "approach_eyebrow": "01 / ENGINEERING APPROACH",
            "approach_title": "Simple architecture, reliable outcomes.",
            "approach_principles": [
                {
                    "id": "principle-problem",
                    "number": "01",
                    "title": "Start with the problem",
                    "description": (
                        "Clarify workflows, edge cases, and data quality before choosing a "
                        "model or framework."
                    ),
                },
                {
                    "id": "principle-predictable",
                    "number": "02",
                    "title": "Make AI predictable",
                    "description": (
                        "Rely on retrieval grounding, strict schemas, and testing loops rather "
                        "than prompt guesswork."
                    ),
                },
                {
                    "id": "principle-foundations",
                    "number": "03",
                    "title": "Build clean foundations",
                    "description": (
                        "Pair AI logic with modular FastAPI services, clear database models, "
                        "and observable behavior."
                    ),
                },
            ],
            "background_eyebrow": "02 / BACKGROUND",
            "background_title": "Career journey & credentials.",
            "education_heading": "EDUCATION",
            "certifications_heading": "CERTIFICATIONS",
            "contact_cta": {
                "eyebrow": "03 / CONTACT",
                "title": "Have a problem worth exploring",
                "description": (
                    "Free consultation before starting. Share what you're working on, and "
                    "let's find a practical path forward."
                ),
                "primary_cta": {"label": "Get in touch", "href": "/contact"},
                "secondary_cta": {"label": "View services", "href": "/services"},
            },
        },
    ),
    SiteSettingSeed(
        key="contact_page",
        label="Contact Page Content",
        category="pages",
        description="Contact page headings, CV banner copy, inquiry form modes, and project types.",
        is_public=True,
        value={
            "meta_title": "Contact",
            "meta_description": (
                "Start a conversation with Shabnum H. about AI applications, "
                "workflow automation, or backend systems."
            ),
            "badge": "GET IN TOUCH",
            "headline": "Let's talk ideas & projects",
            "headline_accent": "projects",
            "intro": (
                "Open for AI engineering builds, intelligent workflow automation, and "
                "dependable backend architecture collaborations."
            ),
            "cv_heading": "Looking for Shabnum's Curriculum Vitae?",
            "cv_ready_badge": "PDF READY",
            "cv_request_badge": "ON REQUEST",
            "cv_ready_description": (
                "Summary of AI systems engineering, backend experience, and academic "
                "foundations ready for direct download."
            ),
            "cv_request_description": (
                "Summary of AI systems engineering, backend experience, and academic "
                "foundations. A PDF copy is available upon request."
            ),
            "cv_download_label": "Download CV (PDF)",
            "cv_request_label": "Request CV",
            "channels_heading": "Contact Channels",
            "channels_description": (
                "Reach out through the inquiry form or connect on the developer platforms below."
            ),
            "project_types": [
                "AI application",
                "Agentic workflow",
                "RAG or knowledge system",
                "Backend or API",
                "Something else",
            ],
            "project_mode_copy": {
                "eyebrow": "PROJECT BRIEF",
                "tab_label": "Start a Project",
                "heading": "Let's Build Together",
                "subtitle": (
                    "Share your project goals, workflow bottleneck, or backend system requirements."
                ),
                "subject_placeholder": "What would you like to build?",
                "message_placeholder": "Tell me about your project scope, data, or timeline...",
                "submit_label": "Send Inquiry",
            },
            "advisory_mode_copy": {
                "eyebrow": "CONSULTATION",
                "tab_label": "Advisory & Roles",
                "heading": "Technical Advisory & Roles",
                "subtitle": (
                    "Explore AI architecture reviews, automation consulting, or "
                    "engineering collaborations."
                ),
                "subject_placeholder": "Role, audit, or collaboration topic",
                "message_placeholder": (
                    "Share context on the role, team, or architecture questions you are exploring..."
                ),
                "submit_label": "Send Message",
            },
            "form_note": "Free initial consultation · Online delivery coming soon",
        },
    ),
    SiteSettingSeed(
        key="skills_page",
        label="Skills Page Content",
        category="pages",
        description="Skills page editorial header, three stack layer headers, and bottom CTA.",
        is_public=True,
        value={
            "meta_title": "Skills",
            "meta_description": (
                "Programming languages, AI & LLM frameworks, backend APIs, databases, "
                "and cloud delivery tooling used by Shabnum H."
            ),
            "badge": "SKILLS / CAPABILITY MAP",
            "headline": "A practical engineering toolkit.",
            "headline_accent": "engineering toolkit.",
            "description": (
                "36 core technologies organized across 7 role-based capability groups—"
                "from LLM orchestration to Python APIs and infrastructure."
            ),
            "primary_cta": {"label": "See skills in projects", "href": "/projects"},
            "secondary_cta": {"label": "View services", "href": "/services"},
            "layers": [
                {
                    "id": SkillLayer.AI,
                    "eyebrow": "LAYER 01 / INTELLIGENCE",
                    "title": "AI & LLM Engineering",
                    "description": (
                        "Core AI paradigms, retrieval architectures, and model interfaces."
                    ),
                },
                {
                    "id": SkillLayer.BACKEND,
                    "eyebrow": "LAYER 02 / APPLICATION & DATA",
                    "title": "Backend & Persistence",
                    "description": (
                        "Languages, typed API services, and structured database systems."
                    ),
                },
                {
                    "id": SkillLayer.DELIVERY,
                    "eyebrow": "LAYER 03 / RUNTIME & TOOLING",
                    "title": "Infrastructure & Workflow",
                    "description": (
                        "Multi-agent tooling, containerization, and day-to-day delivery."
                    ),
                },
            ],
            "contact_cta": {
                "eyebrow": "NEXT STEP",
                "title": "Need this stack on your project",
                "description": (
                    "Free consultation before starting. Share the workflow or technical "
                    "requirements you want to solve."
                ),
                "primary_cta": {"label": "Discuss a project", "href": "/contact"},
                "secondary_cta": {"label": "View projects", "href": "/projects"},
            },
        },
    ),
)

SERVICE_SEEDS: tuple[ServiceSeed, ...] = (
    ServiceSeed(
        display_number="01",
        category="Agents & Voice",
        domain="AUTOMATION",
        title="Agentic AI & Workflow Automation",
        description=(
            "Multi-agent systems and business workflows that connect tools, APIs, "
            "databases, and human approvals."
        ),
        tools=["LangChain", "LangGraph", "CrewAI", "n8n"],
        featured=True,
        home_category_label="AUTOMATION",
        home_title=None,
        home_description=(
            "Multi-agent systems, tool calling, and approval flows that reduce repetitive business work."
        ),
        home_tags=["LangChain", "LangGraph", "CrewAI"],
        publish_status=PublishStatus.PUBLISHED,
        display_order=1,
    ),
    ServiceSeed(
        display_number="02",
        category="Agents & Voice",
        domain="VOICE & CHAT",
        title="Voice AI & Conversational Agents",
        description=(
            "Real-time voice and chat experiences for support, sales, and natural "
            "customer conversations."
        ),
        tools=["Retell AI", "OpenAI Realtime", "ElevenLabs", "Whisper"],
        featured=False,
        home_category_label=None,
        home_title=None,
        home_description=None,
        home_tags=None,
        publish_status=PublishStatus.PUBLISHED,
        display_order=2,
    ),
    ServiceSeed(
        display_number="03",
        category="Knowledge & Documents",
        domain="KNOWLEDGE AI",
        title="RAG Systems & Knowledge AI",
        description=(
            "Accurate assistants grounded in documents, databases, and business knowledge."
        ),
        tools=["Pinecone", "Weaviate", "ChromaDB", "Hybrid Search"],
        featured=True,
        home_category_label="KNOWLEDGE AI",
        home_title=None,
        home_description=(
            "Grounded AI assistants that turn business documents and databases into useful answers."
        ),
        home_tags=["Pinecone", "Weaviate", "Hybrid Search"],
        publish_status=PublishStatus.PUBLISHED,
        display_order=3,
    ),
    ServiceSeed(
        display_number="04",
        category="Knowledge & Documents",
        domain="DOCUMENTS & ERP",
        title="Document Intelligence & ERP Integration",
        description=(
            "OCR, PDF extraction, and document workflows connected to ERP and business systems."
        ),
        tools=["OCR", "PDF Parsing", "NetSuite", "Oracle"],
        featured=False,
        home_category_label=None,
        home_title=None,
        home_description=None,
        home_tags=None,
        publish_status=PublishStatus.PUBLISHED,
        display_order=4,
    ),
    ServiceSeed(
        display_number="05",
        category="LLMs & Evaluation",
        domain="LLM ENGINEERING",
        title="LLM Integration, Fine-Tuning & Prompt Engineering",
        description=(
            "Model selection, structured outputs, function calling, and prompt architecture "
            "for focused use cases."
        ),
        tools=["OpenAI", "Claude", "Gemini", "LoRA / QLoRA"],
        featured=False,
        home_category_label=None,
        home_title=None,
        home_description=None,
        home_tags=None,
        publish_status=PublishStatus.PUBLISHED,
        display_order=5,
    ),
    ServiceSeed(
        display_number="06",
        category="LLMs & Evaluation",
        domain="EVALUATION",
        title="Observability & LLM Evaluation",
        description=(
            "Tracing, prompt testing, evaluation, and monitoring that make AI behavior "
            "easier to improve."
        ),
        tools=["LangSmith", "Logfire", "Arize Phoenix", "DeepEval"],
        featured=False,
        home_category_label=None,
        home_title=None,
        home_description=None,
        home_tags=None,
        publish_status=PublishStatus.PUBLISHED,
        display_order=6,
    ),
    ServiceSeed(
        display_number="07",
        category="Backend & Data",
        domain="FULL-STACK & APIS",
        title="Full-Stack AI Applications & Backend",
        description=(
            "Production-minded AI applications and APIs built with Python, FastAPI, "
            "and modern web tooling."
        ),
        tools=["Python", "FastAPI", "Django", "Docker"],
        featured=True,
        home_category_label="BACKEND",
        home_title="Full-Stack AI & Backend Systems",
        home_description=(
            "Production-minded AI web apps and APIs built with Python, FastAPI, and modern tooling."
        ),
        home_tags=["Python", "FastAPI", "Docker"],
        publish_status=PublishStatus.PUBLISHED,
        display_order=7,
    ),
    ServiceSeed(
        display_number="08",
        category="Backend & Data",
        domain="DATA & INTEGRATIONS",
        title="Data, Databases & Integrations",
        description=(
            "Data pipelines, persistence, and integrations that keep products connected "
            "to the systems they depend on."
        ),
        tools=["PostgreSQL", "MongoDB", "Redis", "REST / GraphQL"],
        featured=False,
        home_category_label=None,
        home_title=None,
        home_description=None,
        home_tags=None,
        publish_status=PublishStatus.PUBLISHED,
        display_order=8,
    ),
)

SKILL_SEEDS: tuple[SkillSeed, ...] = (
    SkillSeed(
        layer=SkillLayer.AI,
        display_number="01",
        domain="INTELLIGENCE",
        title="AI & Machine Learning",
        description=(
            "Core concepts and application patterns for turning models into useful "
            "product capabilities."
        ),
        items=[
            "Artificial Intelligence",
            "Machine Learning",
            "Generative AI",
            "Automation",
        ],
        featured=False,
        featured_category=None,
        featured_title=None,
        featured_description=None,
        featured_tags=None,
        publish_status=PublishStatus.PUBLISHED,
        display_order=1,
    ),
    SkillSeed(
        layer=SkillLayer.AI,
        display_number="02",
        domain="LLM SYSTEMS",
        title="LLMs & AI Engineering",
        description=(
            "Practical building blocks for grounded, tool-using, and context-aware "
            "intelligent systems."
        ),
        items=[
            "Prompt Engineering",
            "Retrieval Augmented Generation",
            "AI Chatbot",
            "Large Language Model",
            "LangChain",
            "AI Agent Development",
            "OpenAI API",
            "Claude API",
        ],
        featured=True,
        featured_category="AI & LLMS",
        featured_title="AI & LLM Engineering",
        featured_description=(
            "Prompt architecture, retrieval-augmented generation, and model integration "
            "for grounded AI features."
        ),
        featured_tags=["RAG", "LangChain", "OpenAI / Claude"],
        publish_status=PublishStatus.PUBLISHED,
        display_order=2,
    ),
    SkillSeed(
        layer=SkillLayer.BACKEND,
        display_number="03",
        domain="CORE LANGUAGES",
        title="Programming Languages",
        description=(
            "Languages used to shape AI products, application logic, and maintainable foundations."
        ),
        items=["Python", "JavaScript", "TypeScript"],
        featured=False,
        featured_category=None,
        featured_title=None,
        featured_description=None,
        featured_tags=None,
        publish_status=PublishStatus.PUBLISHED,
        display_order=3,
    ),
    SkillSeed(
        layer=SkillLayer.BACKEND,
        display_number="04",
        domain="API LAYER",
        title="Backend Development",
        description=(
            "Tools for building clear service boundaries, APIs, validation, and reliable behavior."
        ),
        items=[
            "FastAPI",
            "Django",
            "REST APIs",
            "Pydantic",
            "Full-Stack Development",
        ],
        featured=True,
        featured_category="SYSTEMS",
        featured_title="Backend & Cloud Delivery",
        featured_description=(
            "Dependable Python services, structured persistence, and containerized "
            "environments ready for production."
        ),
        featured_tags=["Python", "FastAPI", "Docker"],
        publish_status=PublishStatus.PUBLISHED,
        display_order=4,
    ),
    SkillSeed(
        layer=SkillLayer.BACKEND,
        display_number="05",
        domain="PERSISTENCE",
        title="Databases",
        description=(
            "Persistence and data foundations for structured, reliable application storage."
        ),
        items=["PostgreSQL", "MongoDB", "Redis"],
        featured=False,
        featured_category=None,
        featured_title=None,
        featured_description=None,
        featured_tags=None,
        publish_status=PublishStatus.PUBLISHED,
        display_order=5,
    ),
    SkillSeed(
        layer=SkillLayer.DELIVERY,
        display_number="06",
        domain="INFRASTRUCTURE",
        title="DevOps & Cloud",
        description=(
            "Delivery and runtime tools that support repeatable builds and dependable deployments."
        ),
        items=[
            "DevOps Engineering",
            "Docker",
            "Linux",
            "Cloud Platforms",
            "Environment Configuration",
        ],
        featured=False,
        featured_category=None,
        featured_title=None,
        featured_description=None,
        featured_tags=None,
        publish_status=PublishStatus.PUBLISHED,
        display_order=6,
    ),
    SkillSeed(
        layer=SkillLayer.DELIVERY,
        display_number="07",
        domain="ORCHESTRATION & WORKFLOW",
        title="Tools & Development Workflow",
        description=(
            "Frameworks and engineering practices for multi-agent orchestration, "
            "documentation, and testing."
        ),
        items=[
            "CrewAI",
            "OpenClaw",
            "Git",
            "GitHub",
            "API Documentation",
            "Testing Workflows",
            "Chatbot Development",
            "Business Process Automation",
        ],
        featured=True,
        featured_category="AUTOMATION",
        featured_title="Automation & AI Agents",
        featured_description=(
            "Tool-using agents, workflow orchestration, and conversational automation "
            "tailored to operations."
        ),
        featured_tags=["CrewAI", "OpenClaw", "Workflows"],
        publish_status=PublishStatus.PUBLISHED,
        display_order=7,
    ),
)

PROJECT_SEEDS: tuple[ProjectSeed, ...] = (
    ProjectSeed(
        slug="knowledge-assistant",
        display_number="01",
        title="Knowledge Assistant",
        category="AI & Machine Learning",
        home_category_label="RAG / KNOWLEDGE AI",
        project_type=ProjectType.CONCEPT_BRIEF,
        publish_status=PublishStatus.PUBLISHED,
        featured=True,
        display_order=1,
        summary=(
            "A RAG-based assistant architecture for answering questions from trusted "
            "business documents."
        ),
        problem=(
            "Teams often struggle to find reliable answers across scattered PDFs, internal "
            "guides, and operational documents without risking generic or hallucinated AI responses."
        ),
        solution=(
            "Designed a retrieval-augmented generation pipeline that chunks, indexes, and "
            "retrieves relevant source passages first, constraining model answers strictly "
            "to verified context with source references."
        ),
        deliverables=[
            "Document ingestion and chunking pipeline with metadata filtering",
            "FastAPI query service enforcing grounded, structured responses",
            "Vector retrieval layer built for accurate semantic + keyword lookup",
        ],
        tags=["Python", "FastAPI", "RAG"],
    ),
    ProjectSeed(
        slug="workflow-automation",
        display_number="02",
        title="Workflow Automation",
        category="Agentic AI & Automation",
        home_category_label="AGENTIC AI",
        project_type=ProjectType.CONCEPT_BRIEF,
        publish_status=PublishStatus.PUBLISHED,
        featured=True,
        display_order=2,
        summary=(
            "Agentic workflow architecture connected to business tools, APIs, and human "
            "approval steps."
        ),
        problem=(
            "Repetitive multi-step operational tasks across email, ticketing, and internal "
            "databases create bottlenecks, while fully autonomous actions introduce unacceptable "
            "business risk."
        ),
        solution=(
            "Structured an agentic workflow with deterministic tool calling, schema-validated "
            "step outputs, and explicit human-in-the-loop approval checkpoints before committing "
            "sensitive updates."
        ),
        deliverables=[
            "Tool-calling orchestration connecting external REST APIs and webhooks",
            "Validation schemas and retry handling for reliable multi-step execution",
            "Approval pause/resume flow for sensitive operational actions",
        ],
        tags=["AI Agents", "APIs", "Human Review"],
    ),
    ProjectSeed(
        slug="ai-backend-platform",
        display_number="03",
        title="AI Backend Platform",
        category="Backend & API Development",
        home_category_label="FULL-STACK AI",
        project_type=ProjectType.CONCEPT_BRIEF,
        publish_status=PublishStatus.PUBLISHED,
        featured=True,
        display_order=3,
        summary=(
            "A practical application combining AI capabilities, structured data, and a "
            "dependable backend foundation."
        ),
        problem=(
            "AI prototypes frequently fail in production because they lack persistent state, "
            "clean API boundaries, request validation, and reproducible deployment environments."
        ),
        solution=(
            "Architected a modular Python backend separating LLM inference services from "
            "transactional persistence, background jobs, and containerized runtime configuration."
        ),
        deliverables=[
            "Typed REST API layer with Pydantic validation and clear error contracts",
            "PostgreSQL persistence schema for users, jobs, and audit trails",
            "Containerized Docker setup for consistent local and cloud deployment",
        ],
        tags=["Python", "PostgreSQL", "Docker"],
    ),
    ProjectSeed(
        slug="document-intake-portal",
        display_number="04",
        title="Document Intake & Review Portal",
        category="Full-Stack Applications",
        home_category_label="FULL-STACK",
        project_type=ProjectType.CONCEPT_BRIEF,
        publish_status=PublishStatus.PUBLISHED,
        featured=False,
        display_order=4,
        summary=(
            "An end-to-end web workspace combining automated PDF extraction, validation "
            "queues, and ERP-ready export."
        ),
        problem=(
            "Operations teams reviewing incoming invoices and forms manually spend hours "
            "copying structured fields into downstream tracking systems."
        ),
        solution=(
            "Combined an OCR and LLM extraction backend with a clean review interface where "
            "operators inspect extracted fields, resolve low-confidence values, and approve "
            "clean records."
        ),
        deliverables=[
            "Automated PDF parsing and structured JSON extraction pipeline",
            "Operator review dashboard with confidence highlights and edit controls",
            "Webhook and CSV/API export connectors for ERP synchronization",
        ],
        tags=["Next.js", "Python", "OCR"],
    ),
)

EXPERIENCE_SEEDS: tuple[ExperienceSeed, ...] = (
    ExperienceSeed(
        period="2023 — Present",
        role="AI Engineer & Backend Consultant",
        organization="Independent Practice",
        summary=(
            "Delivering custom LLM applications, RAG knowledge assistants, and automated "
            "business workflows integrated with client APIs."
        ),
        is_current=True,
        publish_status=PublishStatus.DRAFT,
        display_order=1,
        verification_note="Client has not yet explicitly verified career entry; kept in draft.",
    ),
    ExperienceSeed(
        period="2021 — 2023",
        role="Backend & AI Integration Developer",
        organization="Product Studio (Placeholder)",
        summary=(
            "Built Python REST services, document extraction pipelines, and "
            "PostgreSQL-backed platforms for internal operations."
        ),
        is_current=False,
        publish_status=PublishStatus.DRAFT,
        display_order=2,
        verification_note="Placeholder organization name; kept in draft for admin verification.",
    ),
    ExperienceSeed(
        period="2019 — 2021",
        role="Software & Automation Engineer",
        organization="Engineering Team (Placeholder)",
        summary=(
            "Developed automation scripts, data workflows, and reliable backend integrations "
            "across business tools."
        ),
        is_current=False,
        publish_status=PublishStatus.DRAFT,
        display_order=3,
        verification_note="Placeholder organization name; kept in draft for admin verification.",
    ),
)

EDUCATION_SEEDS: tuple[EducationSeed, ...] = (
    EducationSeed(
        period="2015 — 2019",
        degree="B.S. in Computer Science",
        institution="University Name (Placeholder)",
        publish_status=PublishStatus.DRAFT,
        display_order=1,
        verification_note="Placeholder institution name; kept in draft for admin verification.",
    ),
)

CERTIFICATION_SEEDS: tuple[CertificationSeed, ...] = (
    CertificationSeed(
        year="2024",
        title="LLM Engineering & Agentic Workflows",
        issuer="Certification Provider (Placeholder)",
        publish_status=PublishStatus.DRAFT,
        display_order=1,
        verification_note="Placeholder certification issuer; kept in draft for admin verification.",
    ),
    CertificationSeed(
        year="2023",
        title="Backend Architecture with Python & FastAPI",
        issuer="Certification Provider (Placeholder)",
        publish_status=PublishStatus.DRAFT,
        display_order=2,
        verification_note="Placeholder certification issuer; kept in draft for admin verification.",
    ),
)

TESTIMONIAL_SEEDS: tuple[TestimonialSeed, ...] = (
    TestimonialSeed(
        title="Senior AI Agent & LLM Developer",
        rating_score=Decimal("5.0"),
        rating_label="5.0",
        stars=5,
        source="Upwork profile feedback",
        featured=True,
        publish_status=PublishStatus.DRAFT,
        display_order=1,
        verification_note=(
            "Missing verified author_name and quote; cannot be published under 3B rules."
        ),
    ),
    TestimonialSeed(
        title="AI Consultant Needed to Build a Simple AI Agent",
        rating_score=Decimal("5.0"),
        rating_label="5.0",
        stars=5,
        source="Upwork profile feedback",
        featured=True,
        publish_status=PublishStatus.DRAFT,
        display_order=2,
        verification_note=(
            "Missing verified author_name and quote; cannot be published under 3B rules."
        ),
    ),
    TestimonialSeed(
        title="Client feedback",
        rating_score=None,
        rating_label="5 reviews",
        stars=5,
        source="Verified profile feedback",
        featured=True,
        publish_status=PublishStatus.DRAFT,
        display_order=3,
        verification_note=(
            "Aggregate profile summary placeholder without author_name/quote; kept in draft."
        ),
    ),
)
