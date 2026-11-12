"""Initial portfolio database schema (12 core tables).

Revision ID: 0001_initial_schema
Revises:
Create Date: 2026-11-12 00:00:00.000000+00:00
"""

from __future__ import annotations

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision: str = "0001_initial_schema"
down_revision: str | Sequence[str] | None = None
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None

JSONB_TYPE = sa.JSON().with_variant(postgresql.JSONB(astext_type=sa.Text()), "postgresql")
TEXT_ARRAY_TYPE = postgresql.ARRAY(sa.Text()).with_variant(sa.JSON(), "sqlite")


def _string_array_type(length: int):
    return postgresql.ARRAY(sa.String(length)).with_variant(sa.JSON(), "sqlite")


def upgrade() -> None:
    # 1. admin_users
    op.create_table(
        "admin_users",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("email", sa.String(length=255), nullable=False),
        sa.Column("full_name", sa.String(length=120), nullable=False),
        sa.Column("password_hash", sa.String(length=255), nullable=False),
        sa.Column("role", sa.String(length=32), server_default="admin", nullable=False),
        sa.Column("is_active", sa.Boolean(), server_default=sa.text("true"), nullable=False),
        sa.Column("last_login_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
        sa.CheckConstraint("role IN ('super_admin', 'admin')", name=op.f("ck_admin_users_valid_role")),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_admin_users")),
        sa.UniqueConstraint("email", name=op.f("uq_admin_users_email")),
    )

    # 2. admin_sessions
    op.create_table(
        "admin_sessions",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("admin_user_id", sa.Uuid(), nullable=False),
        sa.Column("refresh_token_hash", sa.String(length=255), nullable=False),
        sa.Column("user_agent", sa.String(length=512), nullable=True),
        sa.Column("ip_address", sa.String(length=45), nullable=True),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("revoked_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(
            ["admin_user_id"],
            ["admin_users.id"],
            name=op.f("fk_admin_sessions_admin_user_id_admin_users"),
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_admin_sessions")),
        sa.UniqueConstraint("refresh_token_hash", name=op.f("uq_admin_sessions_refresh_token_hash")),
    )
    op.create_index(
        op.f("ix_admin_sessions_admin_user_id"),
        "admin_sessions",
        ["admin_user_id"],
        unique=False,
    )
    op.create_index(
        op.f("ix_admin_sessions_expires_at"),
        "admin_sessions",
        ["expires_at"],
        unique=False,
    )
    op.create_index(
        "ix_admin_sessions_user_expires",
        "admin_sessions",
        ["admin_user_id", "expires_at"],
        unique=False,
    )

    # 3. media_assets
    op.create_table(
        "media_assets",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("title", sa.String(length=200), nullable=False),
        sa.Column("file_name", sa.String(length=255), nullable=False),
        sa.Column(
            "storage_provider",
            sa.String(length=50),
            server_default="external",
            nullable=False,
        ),
        sa.Column("storage_key", sa.String(length=512), nullable=True),
        sa.Column("url", sa.String(length=1000), nullable=False),
        sa.Column("mime_type", sa.String(length=100), nullable=False),
        sa.Column("file_size_bytes", sa.BigInteger(), nullable=True),
        sa.Column("width", sa.Integer(), nullable=True),
        sa.Column("height", sa.Integer(), nullable=True),
        sa.Column("alt_text", sa.String(length=300), nullable=True),
        sa.Column("caption", sa.String(length=500), nullable=True),
        sa.Column("uploaded_by_id", sa.Uuid(), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
        sa.CheckConstraint(
            "storage_provider IN ('external', 's3', 'r2', 'cloudinary', 'local_public')",
            name=op.f("ck_media_assets_valid_storage_provider"),
        ),
        sa.CheckConstraint(
            "file_size_bytes IS NULL OR file_size_bytes >= 0",
            name=op.f("ck_media_assets_non_negative_file_size"),
        ),
        sa.CheckConstraint(
            "(width IS NULL OR width > 0) AND (height IS NULL OR height > 0)",
            name=op.f("ck_media_assets_positive_dimensions"),
        ),
        sa.ForeignKeyConstraint(
            ["uploaded_by_id"],
            ["admin_users.id"],
            name=op.f("fk_media_assets_uploaded_by_id_admin_users"),
            ondelete="SET NULL",
        ),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_media_assets")),
    )
    op.create_index(
        op.f("ix_media_assets_uploaded_by_id"),
        "media_assets",
        ["uploaded_by_id"],
        unique=False,
    )
    op.create_index(
        "ix_media_assets_provider_mime",
        "media_assets",
        ["storage_provider", "mime_type"],
        unique=False,
    )

    # 4. site_settings
    op.create_table(
        "site_settings",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("key", sa.String(length=100), nullable=False),
        sa.Column("label", sa.String(length=150), nullable=False),
        sa.Column("category", sa.String(length=50), server_default="general", nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("value", JSONB_TYPE, nullable=False),
        sa.Column("is_public", sa.Boolean(), server_default=sa.text("true"), nullable=False),
        sa.Column("portrait_media_id", sa.Uuid(), nullable=True),
        sa.Column("updated_by_id", sa.Uuid(), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(
            ["portrait_media_id"],
            ["media_assets.id"],
            name=op.f("fk_site_settings_portrait_media_id_media_assets"),
            ondelete="SET NULL",
        ),
        sa.ForeignKeyConstraint(
            ["updated_by_id"],
            ["admin_users.id"],
            name=op.f("fk_site_settings_updated_by_id_admin_users"),
            ondelete="SET NULL",
        ),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_site_settings")),
        sa.UniqueConstraint("key", name=op.f("uq_site_settings_key")),
    )
    op.create_index(
        op.f("ix_site_settings_portrait_media_id"),
        "site_settings",
        ["portrait_media_id"],
        unique=False,
    )
    op.create_index(
        op.f("ix_site_settings_updated_by_id"),
        "site_settings",
        ["updated_by_id"],
        unique=False,
    )
    op.create_index(
        "ix_site_settings_category_public",
        "site_settings",
        ["category", "is_public"],
        unique=False,
    )

    # 5. projects
    op.create_table(
        "projects",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("slug", sa.String(length=150), nullable=False),
        sa.Column("display_number", sa.String(length=16), nullable=True),
        sa.Column("title", sa.String(length=200), nullable=False),
        sa.Column("category", sa.String(length=100), nullable=False),
        sa.Column("home_category_label", sa.String(length=100), nullable=True),
        sa.Column("project_type", sa.String(length=50), server_default="Case Study", nullable=False),
        sa.Column("publish_status", sa.String(length=20), server_default="draft", nullable=False),
        sa.Column("published_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("featured", sa.Boolean(), server_default=sa.text("false"), nullable=False),
        sa.Column("display_order", sa.Integer(), server_default=sa.text("0"), nullable=False),
        sa.Column("summary", sa.Text(), nullable=False),
        sa.Column("problem", sa.Text(), nullable=False),
        sa.Column("solution", sa.Text(), nullable=False),
        sa.Column("deliverables", TEXT_ARRAY_TYPE, nullable=False),
        sa.Column("tags", _string_array_type(80), nullable=False),
        sa.Column("live_url", sa.String(length=500), nullable=True),
        sa.Column("repo_url", sa.String(length=500), nullable=True),
        sa.Column("cover_media_id", sa.Uuid(), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
        sa.CheckConstraint(
            "publish_status IN ('draft', 'published')",
            name=op.f("ck_projects_valid_publish_status"),
        ),
        sa.CheckConstraint(
            "project_type IN ('Concept Brief', 'Case Study')",
            name=op.f("ck_projects_valid_project_type"),
        ),
        sa.ForeignKeyConstraint(
            ["cover_media_id"],
            ["media_assets.id"],
            name=op.f("fk_projects_cover_media_id_media_assets"),
            ondelete="SET NULL",
        ),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_projects")),
        sa.UniqueConstraint("slug", name=op.f("uq_projects_slug")),
    )
    op.create_index(op.f("ix_projects_category"), "projects", ["category"], unique=False)
    op.create_index(
        op.f("ix_projects_cover_media_id"),
        "projects",
        ["cover_media_id"],
        unique=False,
    )
    op.create_index(
        "ix_projects_status_order",
        "projects",
        ["publish_status", "display_order"],
        unique=False,
    )
    op.create_index(
        "ix_projects_featured_status_order",
        "projects",
        ["featured", "publish_status", "display_order"],
        unique=False,
    )

    # 6. services
    op.create_table(
        "services",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("display_number", sa.String(length=16), nullable=True),
        sa.Column("category", sa.String(length=100), nullable=False),
        sa.Column("domain", sa.String(length=100), nullable=False),
        sa.Column("title", sa.String(length=200), nullable=False),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column("tools", _string_array_type(100), nullable=False),
        sa.Column("featured", sa.Boolean(), server_default=sa.text("false"), nullable=False),
        sa.Column("home_category_label", sa.String(length=100), nullable=True),
        sa.Column("home_title", sa.String(length=200), nullable=True),
        sa.Column("home_description", sa.Text(), nullable=True),
        sa.Column("home_tags", _string_array_type(100), nullable=True),
        sa.Column("publish_status", sa.String(length=20), server_default="draft", nullable=False),
        sa.Column("published_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("display_order", sa.Integer(), server_default=sa.text("0"), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
        sa.CheckConstraint(
            "publish_status IN ('draft', 'published')",
            name=op.f("ck_services_valid_publish_status"),
        ),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_services")),
    )
    op.create_index(op.f("ix_services_category"), "services", ["category"], unique=False)
    op.create_index(
        "ix_services_status_order",
        "services",
        ["publish_status", "display_order"],
        unique=False,
    )
    op.create_index(
        "ix_services_featured_status_order",
        "services",
        ["featured", "publish_status", "display_order"],
        unique=False,
    )

    # 7. skills
    op.create_table(
        "skills",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("layer", sa.String(length=32), nullable=False),
        sa.Column("display_number", sa.String(length=16), nullable=True),
        sa.Column("domain", sa.String(length=100), nullable=False),
        sa.Column("title", sa.String(length=200), nullable=False),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column("items", _string_array_type(120), nullable=False),
        sa.Column("featured", sa.Boolean(), server_default=sa.text("false"), nullable=False),
        sa.Column("featured_category", sa.String(length=100), nullable=True),
        sa.Column("featured_title", sa.String(length=200), nullable=True),
        sa.Column("featured_description", sa.Text(), nullable=True),
        sa.Column("featured_tags", _string_array_type(100), nullable=True),
        sa.Column("publish_status", sa.String(length=20), server_default="draft", nullable=False),
        sa.Column("published_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("display_order", sa.Integer(), server_default=sa.text("0"), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
        sa.CheckConstraint(
            "layer IN ('ai', 'backend', 'delivery')",
            name=op.f("ck_skills_valid_skill_layer"),
        ),
        sa.CheckConstraint(
            "publish_status IN ('draft', 'published')",
            name=op.f("ck_skills_valid_publish_status"),
        ),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_skills")),
    )
    op.create_index("ix_skills_layer_order", "skills", ["layer", "display_order"], unique=False)
    op.create_index(
        "ix_skills_status_order",
        "skills",
        ["publish_status", "display_order"],
        unique=False,
    )
    op.create_index(
        "ix_skills_featured_status_order",
        "skills",
        ["featured", "publish_status", "display_order"],
        unique=False,
    )

    # 8. experience
    op.create_table(
        "experience",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("period", sa.String(length=100), nullable=False),
        sa.Column("role", sa.String(length=200), nullable=False),
        sa.Column("organization", sa.String(length=200), nullable=False),
        sa.Column("location", sa.String(length=150), nullable=True),
        sa.Column("summary", sa.Text(), nullable=False),
        sa.Column("is_current", sa.Boolean(), server_default=sa.text("false"), nullable=False),
        sa.Column("publish_status", sa.String(length=20), server_default="draft", nullable=False),
        sa.Column("published_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("display_order", sa.Integer(), server_default=sa.text("0"), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
        sa.CheckConstraint(
            "publish_status IN ('draft', 'published')",
            name=op.f("ck_experience_valid_publish_status"),
        ),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_experience")),
    )
    op.create_index(
        "ix_experience_status_order",
        "experience",
        ["publish_status", "display_order"],
        unique=False,
    )

    # 9. education
    op.create_table(
        "education",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("period", sa.String(length=100), nullable=False),
        sa.Column("degree", sa.String(length=200), nullable=False),
        sa.Column("institution", sa.String(length=200), nullable=False),
        sa.Column("field_of_study", sa.String(length=200), nullable=True),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("publish_status", sa.String(length=20), server_default="draft", nullable=False),
        sa.Column("published_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("display_order", sa.Integer(), server_default=sa.text("0"), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
        sa.CheckConstraint(
            "publish_status IN ('draft', 'published')",
            name=op.f("ck_education_valid_publish_status"),
        ),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_education")),
    )
    op.create_index(
        "ix_education_status_order",
        "education",
        ["publish_status", "display_order"],
        unique=False,
    )

    # 10. certifications
    op.create_table(
        "certifications",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("year", sa.String(length=20), nullable=False),
        sa.Column("title", sa.String(length=200), nullable=False),
        sa.Column("issuer", sa.String(length=200), nullable=False),
        sa.Column("credential_id", sa.String(length=150), nullable=True),
        sa.Column("credential_url", sa.String(length=500), nullable=True),
        sa.Column("badge_media_id", sa.Uuid(), nullable=True),
        sa.Column("publish_status", sa.String(length=20), server_default="draft", nullable=False),
        sa.Column("published_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("display_order", sa.Integer(), server_default=sa.text("0"), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
        sa.CheckConstraint(
            "publish_status IN ('draft', 'published')",
            name=op.f("ck_certifications_valid_publish_status"),
        ),
        sa.ForeignKeyConstraint(
            ["badge_media_id"],
            ["media_assets.id"],
            name=op.f("fk_certifications_badge_media_id_media_assets"),
            ondelete="SET NULL",
        ),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_certifications")),
    )
    op.create_index(
        op.f("ix_certifications_badge_media_id"),
        "certifications",
        ["badge_media_id"],
        unique=False,
    )
    op.create_index(
        "ix_certifications_status_order",
        "certifications",
        ["publish_status", "display_order"],
        unique=False,
    )

    # 11. testimonials
    op.create_table(
        "testimonials",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("title", sa.String(length=200), nullable=False),
        sa.Column("author_name", sa.String(length=150), nullable=True),
        sa.Column("author_role", sa.String(length=150), nullable=True),
        sa.Column("quote", sa.Text(), nullable=True),
        sa.Column("rating_score", sa.Numeric(precision=2, scale=1), nullable=True),
        sa.Column("rating_label", sa.String(length=50), nullable=False),
        sa.Column("stars", sa.SmallInteger(), server_default=sa.text("5"), nullable=False),
        sa.Column("source", sa.String(length=150), nullable=False),
        sa.Column("source_url", sa.String(length=500), nullable=True),
        sa.Column("avatar_media_id", sa.Uuid(), nullable=True),
        sa.Column("featured", sa.Boolean(), server_default=sa.text("false"), nullable=False),
        sa.Column("publish_status", sa.String(length=20), server_default="draft", nullable=False),
        sa.Column("published_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("display_order", sa.Integer(), server_default=sa.text("0"), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
        sa.CheckConstraint("stars >= 1 AND stars <= 5", name=op.f("ck_testimonials_valid_stars_range")),
        sa.CheckConstraint(
            "rating_score IS NULL OR (rating_score >= 1.0 AND rating_score <= 5.0)",
            name=op.f("ck_testimonials_valid_rating_score"),
        ),
        sa.CheckConstraint(
            "publish_status IN ('draft', 'published')",
            name=op.f("ck_testimonials_valid_publish_status"),
        ),
        sa.ForeignKeyConstraint(
            ["avatar_media_id"],
            ["media_assets.id"],
            name=op.f("fk_testimonials_avatar_media_id_media_assets"),
            ondelete="SET NULL",
        ),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_testimonials")),
    )
    op.create_index(
        op.f("ix_testimonials_avatar_media_id"),
        "testimonials",
        ["avatar_media_id"],
        unique=False,
    )
    op.create_index(
        "ix_testimonials_status_order",
        "testimonials",
        ["publish_status", "display_order"],
        unique=False,
    )
    op.create_index(
        "ix_testimonials_featured_status_order",
        "testimonials",
        ["featured", "publish_status", "display_order"],
        unique=False,
    )

    # 12. contact_messages
    op.create_table(
        "contact_messages",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("inquiry_mode", sa.String(length=32), server_default="project", nullable=False),
        sa.Column("sender_name", sa.String(length=150), nullable=False),
        sa.Column("sender_email", sa.String(length=255), nullable=False),
        sa.Column("subject", sa.String(length=255), nullable=False),
        sa.Column("project_type", sa.String(length=100), nullable=False),
        sa.Column("message", sa.Text(), nullable=False),
        sa.Column("status", sa.String(length=20), server_default="unread", nullable=False),
        sa.Column("admin_notes", sa.Text(), nullable=True),
        sa.Column("source_ip", sa.String(length=45), nullable=True),
        sa.Column("user_agent", sa.String(length=512), nullable=True),
        sa.Column("read_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("archived_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("handled_by_id", sa.Uuid(), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
        sa.CheckConstraint(
            "inquiry_mode IN ('project', 'advisory')",
            name=op.f("ck_contact_messages_valid_inquiry_mode"),
        ),
        sa.CheckConstraint(
            "status IN ('unread', 'read', 'archived')",
            name=op.f("ck_contact_messages_valid_message_status"),
        ),
        sa.ForeignKeyConstraint(
            ["handled_by_id"],
            ["admin_users.id"],
            name=op.f("fk_contact_messages_handled_by_id_admin_users"),
            ondelete="SET NULL",
        ),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_contact_messages")),
    )
    op.create_index(
        op.f("ix_contact_messages_handled_by_id"),
        "contact_messages",
        ["handled_by_id"],
        unique=False,
    )
    op.create_index(
        op.f("ix_contact_messages_sender_email"),
        "contact_messages",
        ["sender_email"],
        unique=False,
    )
    op.create_index(
        "ix_contact_messages_status_created",
        "contact_messages",
        ["status", "created_at"],
        unique=False,
    )


def downgrade() -> None:
    op.drop_index("ix_contact_messages_status_created", table_name="contact_messages")
    op.drop_index(op.f("ix_contact_messages_sender_email"), table_name="contact_messages")
    op.drop_index(op.f("ix_contact_messages_handled_by_id"), table_name="contact_messages")
    op.drop_table("contact_messages")

    op.drop_index("ix_testimonials_featured_status_order", table_name="testimonials")
    op.drop_index("ix_testimonials_status_order", table_name="testimonials")
    op.drop_index(op.f("ix_testimonials_avatar_media_id"), table_name="testimonials")
    op.drop_table("testimonials")

    op.drop_index("ix_certifications_status_order", table_name="certifications")
    op.drop_index(op.f("ix_certifications_badge_media_id"), table_name="certifications")
    op.drop_table("certifications")

    op.drop_index("ix_education_status_order", table_name="education")
    op.drop_table("education")

    op.drop_index("ix_experience_status_order", table_name="experience")
    op.drop_table("experience")

    op.drop_index("ix_skills_featured_status_order", table_name="skills")
    op.drop_index("ix_skills_status_order", table_name="skills")
    op.drop_index("ix_skills_layer_order", table_name="skills")
    op.drop_table("skills")

    op.drop_index("ix_services_featured_status_order", table_name="services")
    op.drop_index("ix_services_status_order", table_name="services")
    op.drop_index(op.f("ix_services_category"), table_name="services")
    op.drop_table("services")

    op.drop_index("ix_projects_featured_status_order", table_name="projects")
    op.drop_index("ix_projects_status_order", table_name="projects")
    op.drop_index(op.f("ix_projects_cover_media_id"), table_name="projects")
    op.drop_index(op.f("ix_projects_category"), table_name="projects")
    op.drop_table("projects")

    op.drop_index("ix_site_settings_category_public", table_name="site_settings")
    op.drop_index(op.f("ix_site_settings_updated_by_id"), table_name="site_settings")
    op.drop_index(op.f("ix_site_settings_portrait_media_id"), table_name="site_settings")
    op.drop_table("site_settings")

    op.drop_index("ix_media_assets_provider_mime", table_name="media_assets")
    op.drop_index(op.f("ix_media_assets_uploaded_by_id"), table_name="media_assets")
    op.drop_table("media_assets")

    op.drop_index("ix_admin_sessions_user_expires", table_name="admin_sessions")
    op.drop_index(op.f("ix_admin_sessions_expires_at"), table_name="admin_sessions")
    op.drop_index(op.f("ix_admin_sessions_admin_user_id"), table_name="admin_sessions")
    op.drop_table("admin_sessions")

    op.drop_table("admin_users")
