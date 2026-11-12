"""Domain enumerations shared across ORM models and schemas."""

from enum import StrEnum


class AdminRole(StrEnum):
    SUPER_ADMIN = "super_admin"
    ADMIN = "admin"


class PublishStatus(StrEnum):
    DRAFT = "draft"
    PUBLISHED = "published"


class ProjectType(StrEnum):
    CONCEPT_BRIEF = "Concept Brief"
    CASE_STUDY = "Case Study"


class SkillLayer(StrEnum):
    AI = "ai"
    BACKEND = "backend"
    DELIVERY = "delivery"


class ContactInquiryMode(StrEnum):
    PROJECT = "project"
    ADVISORY = "advisory"


class ContactMessageStatus(StrEnum):
    UNREAD = "unread"
    READ = "read"
    ARCHIVED = "archived"


class StorageProvider(StrEnum):
    EXTERNAL = "external"
    S3 = "s3"
    R2 = "r2"
    CLOUDINARY = "cloudinary"
    LOCAL_PUBLIC = "local_public"
