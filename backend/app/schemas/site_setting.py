"""Pydantic v2 schemas and typed setting blocks for `site_settings`."""

from __future__ import annotations

import uuid
from typing import Any, Literal

from pydantic import EmailStr, Field, model_validator

from app.models.enums import SkillLayer
from app.schemas.common import (
    AppBaseSchema,
    AppWriteSchema,
    SafeAssetUrl,
    SafeLinkHref,
    UUIDTimestampSchema,
)
from app.schemas.media import MediaAssetSummary

PUBLIC_SETTING_KEYS: frozenset[str] = frozenset(
    {
        "site_general",
        "home_page",
        "about_page",
        "contact_page",
        "skills_page",
    }
)


class CtaLinkSchema(AppWriteSchema):
    """Validated CTA button label and safe target URL/path/anchor."""

    label: str = Field(min_length=1, max_length=80)
    href: SafeLinkHref = Field(min_length=1, max_length=300)


class SectionIntroSchema(AppWriteSchema):
    """Standard section heading, description, and navigation CTA block."""

    eyebrow: str = Field(min_length=2, max_length=80)
    title: str = Field(min_length=2, max_length=200)
    description: str = Field(min_length=5, max_length=500)
    cta_label: str = Field(min_length=1, max_length=80)
    cta_href: SafeLinkHref = Field(min_length=1, max_length=300)


class ContactCtaBlockSchema(AppWriteSchema):
    """Shared bottom CTA card copy and dual button links."""

    eyebrow: str = Field(min_length=2, max_length=80)
    title: str = Field(min_length=2, max_length=200)
    description: str = Field(min_length=5, max_length=500)
    primary_cta: CtaLinkSchema
    secondary_cta: CtaLinkSchema


class ConnectChannelSchema(AppWriteSchema):
    """Social or contact channel item displayed on Footer and Contact pages."""

    id: str = Field(min_length=1, max_length=50, pattern=r"^[a-z0-9_-]+$")
    label: str = Field(min_length=1, max_length=60)
    handle_placeholder: str = Field(min_length=1, max_length=160)
    icon: Literal["mail", "linkedin", "github", "briefcase"]
    href: SafeLinkHref | None = Field(default=None, max_length=500)
    external: bool = False
    status: Literal["soon"] | None = None


class ProfileHighlightSchema(AppWriteSchema):
    """Single portfolio highlight statistic shown on the homepage."""

    id: str = Field(min_length=1, max_length=60, pattern=r"^[a-z0-9_-]+$")
    index: str = Field(min_length=2, max_length=60)
    value: str = Field(min_length=1, max_length=32)
    suffix: str | None = Field(default=None, max_length=16)
    label: str = Field(min_length=2, max_length=160)


class ProcessStepSchema(AppWriteSchema):
    """Single step in the engineering delivery process."""

    number: str = Field(min_length=1, max_length=16)
    title: str = Field(min_length=2, max_length=120)
    description: str = Field(min_length=5, max_length=400)


class ApproachPrincipleSchema(AppWriteSchema):
    """Single engineering approach principle displayed on the About page."""

    id: str = Field(min_length=1, max_length=60, pattern=r"^[a-z0-9_-]+$")
    number: str = Field(min_length=1, max_length=16)
    title: str = Field(min_length=2, max_length=120)
    description: str = Field(min_length=5, max_length=400)


class InquiryModeCopySchema(AppWriteSchema):
    """Copy configuration for one tab of the Contact page inquiry form."""

    eyebrow: str = Field(default="INQUIRY", min_length=2, max_length=60)
    tab_label: str = Field(min_length=2, max_length=60)
    heading: str = Field(min_length=2, max_length=120)
    subtitle: str = Field(min_length=5, max_length=300)
    subject_placeholder: str = Field(min_length=2, max_length=160)
    message_placeholder: str = Field(min_length=5, max_length=250)
    submit_label: str = Field(min_length=2, max_length=60)


class SkillLayerMetaSchema(AppWriteSchema):
    """Header metadata for one of the three fixed skill stack layers."""

    id: SkillLayer
    eyebrow: str = Field(min_length=2, max_length=80)
    title: str = Field(min_length=2, max_length=120)
    description: str = Field(min_length=5, max_length=300)


class SiteGeneralSettings(AppWriteSchema):
    """Typed value schema for the `site_general` public setting."""

    initials: str = Field(min_length=1, max_length=8)
    owner_name: str = Field(min_length=2, max_length=120)
    professional_title: str = Field(min_length=2, max_length=150)
    brand_name: str = Field(min_length=1, max_length=120)
    tagline: str = Field(min_length=5, max_length=300)
    logo_media_id: uuid.UUID | None = None
    logo_url: SafeAssetUrl | None = Field(default=None, max_length=1000)
    direct_email: EmailStr | None = None
    direct_contact_fallback_label: str = Field(
        default="Start an inquiry via Contact",
        min_length=2,
        max_length=120,
    )
    cv_url: SafeAssetUrl | None = Field(default=None, max_length=1000)
    tech_note: str = Field(min_length=2, max_length=120)
    copyright_year: int = Field(ge=2020, le=2100)
    copyright_note: str = Field(min_length=2, max_length=200)
    meta_title_default: str = Field(min_length=2, max_length=120)
    meta_title_template: str = Field(min_length=2, max_length=120)
    meta_description: str = Field(min_length=10, max_length=320)
    og_description: str | None = Field(default=None, max_length=320)
    connect_channels: list[ConnectChannelSchema] = Field(default_factory=list, max_length=10)


class HomePageSettings(AppWriteSchema):
    """Typed value schema for the `home_page` public setting."""

    meta_title: str | None = Field(default=None, max_length=120)
    meta_description: str | None = Field(default=None, max_length=320)
    hero_eyebrow: str = Field(min_length=2, max_length=100)
    hero_heading_primary: str = Field(min_length=2, max_length=120)
    hero_heading_secondary: str = Field(min_length=2, max_length=120)
    hero_summary: str = Field(min_length=10, max_length=600)
    hero_specializations_label: str = Field(default="SPECIALIZATIONS", min_length=2, max_length=60)
    hero_specializations: list[str] = Field(min_length=1, max_length=12)
    hero_portrait_alt: str = Field(min_length=2, max_length=300)
    hero_primary_cta: CtaLinkSchema
    hero_secondary_cta: CtaLinkSchema
    about_eyebrow: str = Field(min_length=2, max_length=80)
    about_side_note: str = Field(min_length=5, max_length=300)
    about_title: str = Field(min_length=2, max_length=200)
    about_description: str = Field(min_length=10, max_length=600)
    about_cta: CtaLinkSchema
    highlights_eyebrow: str = Field(min_length=2, max_length=80)
    highlights_title: str = Field(min_length=2, max_length=200)
    highlights_note: str = Field(min_length=2, max_length=300)
    highlights: list[ProfileHighlightSchema] = Field(default_factory=list, max_length=8)
    services_section: SectionIntroSchema
    services_card_cta_label: str = Field(default="Explore services", min_length=2, max_length=60)
    projects_section: SectionIntroSchema
    projects_card_cta_label: str = Field(default="Open project brief", min_length=2, max_length=60)
    skills_section: SectionIntroSchema
    skills_card_cta_label: str = Field(default="View full skill stack", min_length=2, max_length=60)
    process_eyebrow: str = Field(min_length=2, max_length=80)
    process_title: str = Field(min_length=2, max_length=200)
    process_note: str = Field(min_length=2, max_length=300)
    process_steps: list[ProcessStepSchema] = Field(default_factory=list, max_length=8)
    testimonials_eyebrow: str = Field(min_length=2, max_length=80)
    testimonials_title: str = Field(min_length=2, max_length=200)
    testimonials_note: str = Field(min_length=2, max_length=300)
    contact_cta: ContactCtaBlockSchema


class AboutPageSettings(AppWriteSchema):
    """Typed value schema for the `about_page` public setting."""

    meta_title: str = Field(min_length=2, max_length=120)
    meta_description: str = Field(min_length=10, max_length=320)
    eyebrow: str = Field(min_length=2, max_length=80)
    headline_primary: str = Field(min_length=2, max_length=160)
    headline_secondary: str = Field(min_length=2, max_length=160)
    portrait_caption: str = Field(min_length=2, max_length=120)
    portrait_alt: str = Field(min_length=2, max_length=300)
    bio_paragraphs: list[str] = Field(min_length=1, max_length=10)
    primary_cta: CtaLinkSchema
    secondary_cta: CtaLinkSchema
    approach_eyebrow: str = Field(min_length=2, max_length=80)
    approach_title: str = Field(min_length=2, max_length=200)
    approach_principles: list[ApproachPrincipleSchema] = Field(default_factory=list, max_length=6)
    background_eyebrow: str = Field(min_length=2, max_length=80)
    background_title: str = Field(min_length=2, max_length=200)
    education_heading: str = Field(default="EDUCATION", min_length=2, max_length=80)
    certifications_heading: str = Field(default="CERTIFICATIONS", min_length=2, max_length=80)
    contact_cta: ContactCtaBlockSchema


class ContactPageSettings(AppWriteSchema):
    """Typed value schema for the `contact_page` public setting."""

    meta_title: str = Field(min_length=2, max_length=120)
    meta_description: str = Field(min_length=10, max_length=320)
    badge: str = Field(min_length=2, max_length=80)
    headline: str = Field(min_length=2, max_length=200)
    headline_accent: str | None = Field(default=None, max_length=120)
    intro: str = Field(min_length=10, max_length=500)
    cv_heading: str = Field(min_length=2, max_length=160)
    cv_ready_badge: str = Field(min_length=2, max_length=40)
    cv_request_badge: str = Field(min_length=2, max_length=40)
    cv_ready_description: str = Field(min_length=10, max_length=400)
    cv_request_description: str = Field(min_length=10, max_length=400)
    cv_download_label: str = Field(default="Download CV (PDF)", min_length=2, max_length=60)
    cv_request_label: str = Field(default="Request CV", min_length=2, max_length=60)
    channels_heading: str = Field(min_length=2, max_length=120)
    channels_description: str = Field(min_length=5, max_length=300)
    project_types: list[str] = Field(min_length=1, max_length=12)
    project_mode_copy: InquiryModeCopySchema
    advisory_mode_copy: InquiryModeCopySchema
    form_note: str = Field(default="Free initial consultation", min_length=2, max_length=200)


class SkillsPageSettings(AppWriteSchema):
    """Typed value schema for the `skills_page` public setting."""

    meta_title: str = Field(min_length=2, max_length=120)
    meta_description: str = Field(min_length=10, max_length=320)
    badge: str = Field(min_length=2, max_length=80)
    headline: str = Field(min_length=2, max_length=160)
    headline_accent: str | None = Field(default=None, max_length=120)
    description: str = Field(min_length=10, max_length=500)
    primary_cta: CtaLinkSchema
    secondary_cta: CtaLinkSchema
    layers: list[SkillLayerMetaSchema] = Field(min_length=1, max_length=3)
    contact_cta: ContactCtaBlockSchema


SITE_SETTING_VALUE_SCHEMAS: dict[str, type[AppWriteSchema]] = {
    "site_general": SiteGeneralSettings,
    "home_page": HomePageSettings,
    "about_page": AboutPageSettings,
    "contact_page": ContactPageSettings,
    "skills_page": SkillsPageSettings,
}


def ensure_public_setting_allowed(key: str, is_public: bool) -> None:
    """Reject marking any non-whitelisted setting key as publicly readable."""
    if is_public and key not in PUBLIC_SETTING_KEYS:
        raise ValueError(
            f"Setting key '{key}' is not in PUBLIC_SETTING_KEYS and cannot be marked public."
        )


def validate_site_setting_value(key: str, value: dict[str, Any]) -> dict[str, Any]:
    """Validate structured JSONB setting payloads against typed schemas for known keys."""
    schema_cls = SITE_SETTING_VALUE_SCHEMAS.get(key)
    if schema_cls is None:
        return value
    validated = schema_cls.model_validate(value)
    return validated.model_dump(mode="json")


class SiteSettingBase(AppBaseSchema):
    """Shared schema for keyed JSONB site settings."""

    key: str = Field(min_length=2, max_length=100, pattern=r"^[a-z0-9_.-]+$")
    label: str = Field(min_length=2, max_length=150)
    category: str = Field(default="general", min_length=2, max_length=50)
    description: str | None = None
    value: dict[str, Any]
    is_public: bool = False
    portrait_media_id: uuid.UUID | None = None


class SiteSettingCreate(AppWriteSchema, SiteSettingBase):
    """Schema for creating a site setting entry with visibility and value validation."""

    @model_validator(mode="after")
    def validate_setting_policy_and_value(self) -> SiteSettingCreate:
        ensure_public_setting_allowed(self.key, self.is_public)
        self.value = validate_site_setting_value(self.key, self.value)
        return self


class SiteSettingUpdate(AppWriteSchema):
    """Partial admin update schema (excludes `is_public` visibility toggling).

    Service requirement (Sub-phase 3B): whenever `value` is not None, the handler
    must call `validate_site_setting_value(existing_setting.key, payload.value)`
    against the stored setting's `key` before persisting.
    """

    label: str | None = Field(default=None, min_length=2, max_length=150)
    category: str | None = Field(default=None, min_length=2, max_length=50)
    description: str | None = None
    value: dict[str, Any] | None = None
    portrait_media_id: uuid.UUID | None = None


class SiteSettingVisibilityUpdate(AppWriteSchema):
    """Dedicated admin payload for changing a setting's public visibility.

    Service requirement (Sub-phase 3B): protected admin endpoint must call
    `ensure_public_setting_allowed(existing_setting.key, payload.is_public)` and,
    when publishing (`is_public=True`), validate `existing_setting.value` via
    `validate_site_setting_value(existing_setting.key, existing_setting.value)`.
    """

    is_public: bool


class SiteSettingRead(UUIDTimestampSchema, SiteSettingBase):
    """Read schema for site settings."""

    updated_by_id: uuid.UUID | None = None
    portrait_media: MediaAssetSummary | None = None


class PublicSiteSettingsPayload(AppBaseSchema):
    """Aggregated public-only settings bundle returned by public site endpoints."""

    site_general: SiteGeneralSettings | None = None
    home_page: HomePageSettings | None = None
    about_page: AboutPageSettings | None = None
    contact_page: ContactPageSettings | None = None
    skills_page: SkillsPageSettings | None = None
    portrait_media: MediaAssetSummary | None = None
    logo_media: MediaAssetSummary | None = None
