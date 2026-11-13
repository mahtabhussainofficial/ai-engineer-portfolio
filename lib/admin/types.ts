/**
 * TypeScript type definitions mirroring backend Pydantic v2 schemas and models.
 * Generated from FastAPI backend app/schemas/* and app/models/enums.py.
 */

// ---------------------------------------------------------------------------
// Enums
// ---------------------------------------------------------------------------

export type AdminRole = "super_admin" | "admin";

export type PublishStatus = "draft" | "published";

export type ProjectType = "Concept Brief" | "Case Study";

export type SkillLayer = "ai" | "backend" | "delivery";

export type ContactInquiryMode = "project" | "advisory";

export type ContactMessageStatus = "unread" | "read" | "archived";

export type StorageProvider =
  | "external"
  | "s3"
  | "r2"
  | "cloudinary"
  | "local_public";

// ---------------------------------------------------------------------------
// Common / Error Responses
// ---------------------------------------------------------------------------

export interface ApiErrorDetail {
  code: string;
  message: string;
  request_id?: string | null;
  details?: unknown;
}

export interface ApiErrorResponse {
  error: ApiErrorDetail;
}

export interface DeleteResponse {
  message: string;
  id: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface DatabaseHealth {
  configured: boolean;
  connected: boolean;
  status: "connected" | "disconnected" | "not_configured";
  latency_ms?: number | null;
  detail?: string | null;
}

export interface HealthCheckResponse {
  status: "ok" | "degraded";
  service: string;
  version: string;
  environment: string;
  timestamp: string;
  database: DatabaseHealth;
}

// ---------------------------------------------------------------------------
// Auth & Admin User
// ---------------------------------------------------------------------------

export interface AdminUserRead {
  id: string;
  email: string;
  full_name: string;
  role: AdminRole;
  is_active: boolean;
  last_login_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface AdminSessionRead {
  id: string;
  admin_user_id: string;
  user_agent?: string | null;
  ip_address?: string | null;
  expires_at: string;
  revoked_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: "bearer";
  expires_in: number;
  csrf_token: string;
  admin: AdminUserRead;
}

export interface LogoutResponse {
  message: string;
  revoked_sessions: number;
}

export interface SessionListResponse {
  sessions: AdminSessionRead[];
}

// ---------------------------------------------------------------------------
// Dashboard Overview
// ---------------------------------------------------------------------------

export interface ContentCountSummary {
  total: number;
  published: number;
  draft: number;
}

export interface ContactOverviewCounts {
  total: number;
  unread: number;
  read: number;
  archived: number;
}

export interface ContactMessageOverviewItem {
  id: string;
  inquiry_mode: ContactInquiryMode;
  sender_name: string;
  sender_email: string;
  subject: string;
  project_type: string;
  status: ContactMessageStatus;
  created_at: string;
}

export interface AdminOverviewResponse {
  projects: ContentCountSummary;
  services: ContentCountSummary;
  skills: ContentCountSummary;
  experience: ContentCountSummary;
  education: ContentCountSummary;
  certifications: ContentCountSummary;
  testimonials: ContentCountSummary;
  media_assets: number;
  site_settings: number;
  public_site_settings: number;
  messages: ContactOverviewCounts;
  recent_messages: ContactMessageOverviewItem[];
}

// ---------------------------------------------------------------------------
// Media Assets
// ---------------------------------------------------------------------------

export interface MediaAssetSummary {
  id: string;
  title: string;
  url: string;
  mime_type: string;
  width?: number | null;
  height?: number | null;
  alt_text?: string | null;
  caption?: string | null;
}

export interface MediaAssetRead extends MediaAssetSummary {
  file_name: string;
  storage_provider: StorageProvider;
  storage_key?: string | null;
  file_size_bytes?: number | null;
  uploaded_by_id?: string | null;
  created_at: string;
  updated_at: string;
}

export interface MediaAssetCreate {
  title: string;
  file_name: string;
  storage_provider?: StorageProvider;
  storage_key?: string | null;
  url: string;
  mime_type: string;
  file_size_bytes?: number | null;
  width?: number | null;
  height?: number | null;
  alt_text?: string | null;
  caption?: string | null;
}

export interface MediaAssetUpdate {
  title?: string | null;
  file_name?: string | null;
  storage_provider?: StorageProvider | null;
  storage_key?: string | null;
  url?: string | null;
  mime_type?: string | null;
  file_size_bytes?: number | null;
  width?: number | null;
  height?: number | null;
  alt_text?: string | null;
  caption?: string | null;
}

// ---------------------------------------------------------------------------
// Projects
// ---------------------------------------------------------------------------

export interface ProjectSummary {
  id: string;
  slug: string;
  display_number?: string | null;
  title: string;
  category: string;
  home_category_label?: string | null;
  project_type: ProjectType;
  publish_status: PublishStatus;
  featured: boolean;
  display_order: number;
  summary: string;
  tags: string[];
  cover_media_id?: string | null;
  cover_media?: MediaAssetSummary | null;
  created_at: string;
  updated_at: string;
}

export interface ProjectRead extends ProjectSummary {
  problem: string;
  solution: string;
  deliverables: string[];
  published_at?: string | null;
  live_url?: string | null;
  repo_url?: string | null;
}

export interface ProjectCreate {
  slug: string;
  display_number?: string | null;
  title: string;
  category: string;
  home_category_label?: string | null;
  project_type?: ProjectType;
  publish_status?: PublishStatus;
  published_at?: string | null;
  featured?: boolean;
  display_order?: number;
  summary: string;
  problem: string;
  solution: string;
  deliverables?: string[];
  tags?: string[];
  live_url?: string | null;
  repo_url?: string | null;
  cover_media_id?: string | null;
}

export interface ProjectUpdate {
  slug?: string | null;
  display_number?: string | null;
  title?: string | null;
  category?: string | null;
  home_category_label?: string | null;
  project_type?: ProjectType | null;
  publish_status?: PublishStatus | null;
  published_at?: string | null;
  featured?: boolean | null;
  display_order?: number | null;
  summary?: string | null;
  problem?: string | null;
  solution?: string | null;
  deliverables?: string[] | null;
  tags?: string[] | null;
  live_url?: string | null;
  repo_url?: string | null;
  cover_media_id?: string | null;
}

// ---------------------------------------------------------------------------
// Services
// ---------------------------------------------------------------------------

export interface ServiceRead {
  id: string;
  display_number?: string | null;
  category: string;
  domain: string;
  title: string;
  description: string;
  tools: string[];
  featured: boolean;
  home_category_label?: string | null;
  home_title?: string | null;
  home_description?: string | null;
  home_tags?: string[] | null;
  publish_status: PublishStatus;
  published_at?: string | null;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface ServiceCreate {
  display_number?: string | null;
  category: string;
  domain: string;
  title: string;
  description: string;
  tools?: string[];
  featured?: boolean;
  home_category_label?: string | null;
  home_title?: string | null;
  home_description?: string | null;
  home_tags?: string[] | null;
  publish_status?: PublishStatus;
  published_at?: string | null;
  display_order?: number;
}

export interface ServiceUpdate {
  display_number?: string | null;
  category?: string | null;
  domain?: string | null;
  title?: string | null;
  description?: string | null;
  tools?: string[] | null;
  featured?: boolean | null;
  home_category_label?: string | null;
  home_title?: string | null;
  home_description?: string | null;
  home_tags?: string[] | null;
  publish_status?: PublishStatus | null;
  published_at?: string | null;
  display_order?: number | null;
}

// ---------------------------------------------------------------------------
// Skills
// ---------------------------------------------------------------------------

export interface SkillRead {
  id: string;
  layer: SkillLayer;
  display_number?: string | null;
  domain: string;
  title: string;
  description: string;
  items: string[];
  featured: boolean;
  featured_category?: string | null;
  featured_title?: string | null;
  featured_description?: string | null;
  featured_tags?: string[] | null;
  publish_status: PublishStatus;
  published_at?: string | null;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface SkillCreate {
  layer?: SkillLayer;
  display_number?: string | null;
  domain: string;
  title: string;
  description: string;
  items?: string[];
  featured?: boolean;
  featured_category?: string | null;
  featured_title?: string | null;
  featured_description?: string | null;
  featured_tags?: string[] | null;
  publish_status?: PublishStatus;
  published_at?: string | null;
  display_order?: number;
}

export interface SkillUpdate {
  layer?: SkillLayer | null;
  display_number?: string | null;
  domain?: string | null;
  title?: string | null;
  description?: string | null;
  items?: string[] | null;
  featured?: boolean | null;
  featured_category?: string | null;
  featured_title?: string | null;
  featured_description?: string | null;
  featured_tags?: string[] | null;
  publish_status?: PublishStatus | null;
  published_at?: string | null;
  display_order?: number | null;
}

// ---------------------------------------------------------------------------
// Career: Experience, Education, Certifications
// ---------------------------------------------------------------------------

export interface ExperienceRead {
  id: string;
  period: string;
  role: string;
  organization: string;
  location?: string | null;
  summary: string;
  is_current: boolean;
  publish_status: PublishStatus;
  published_at?: string | null;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface ExperienceCreate {
  period: string;
  role: string;
  organization: string;
  location?: string | null;
  summary: string;
  is_current?: boolean;
  publish_status?: PublishStatus;
  published_at?: string | null;
  display_order?: number;
}

export interface ExperienceUpdate {
  period?: string | null;
  role?: string | null;
  organization?: string | null;
  location?: string | null;
  summary?: string | null;
  is_current?: boolean | null;
  publish_status?: PublishStatus | null;
  published_at?: string | null;
  display_order?: number | null;
}

export interface EducationRead {
  id: string;
  period: string;
  degree: string;
  institution: string;
  field_of_study?: string | null;
  description?: string | null;
  publish_status: PublishStatus;
  published_at?: string | null;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface EducationCreate {
  period: string;
  degree: string;
  institution: string;
  field_of_study?: string | null;
  description?: string | null;
  publish_status?: PublishStatus;
  published_at?: string | null;
  display_order?: number;
}

export interface EducationUpdate {
  period?: string | null;
  degree?: string | null;
  institution?: string | null;
  field_of_study?: string | null;
  description?: string | null;
  publish_status?: PublishStatus | null;
  published_at?: string | null;
  display_order?: number | null;
}

export interface CertificationRead {
  id: string;
  year: string;
  title: string;
  issuer: string;
  credential_id?: string | null;
  credential_url?: string | null;
  badge_media_id?: string | null;
  badge_media?: MediaAssetSummary | null;
  publish_status: PublishStatus;
  published_at?: string | null;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface CertificationCreate {
  year: string;
  title: string;
  issuer: string;
  credential_id?: string | null;
  credential_url?: string | null;
  badge_media_id?: string | null;
  publish_status?: PublishStatus;
  published_at?: string | null;
  display_order?: number;
}

export interface CertificationUpdate {
  year?: string | null;
  title?: string | null;
  issuer?: string | null;
  credential_id?: string | null;
  credential_url?: string | null;
  badge_media_id?: string | null;
  publish_status?: PublishStatus | null;
  published_at?: string | null;
  display_order?: number | null;
}

// ---------------------------------------------------------------------------
// Testimonials
// ---------------------------------------------------------------------------

export interface TestimonialRead {
  id: string;
  title: string;
  author_name?: string | null;
  author_role?: string | null;
  quote?: string | null;
  rating_score?: string | number | null;
  rating_label: string;
  stars: number;
  source: string;
  source_url?: string | null;
  avatar_media_id?: string | null;
  avatar_media?: MediaAssetSummary | null;
  featured: boolean;
  publish_status: PublishStatus;
  published_at?: string | null;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface TestimonialCreate {
  title: string;
  author_name?: string | null;
  author_role?: string | null;
  quote?: string | null;
  rating_score?: number | null;
  rating_label: string;
  stars?: number;
  source: string;
  source_url?: string | null;
  avatar_media_id?: string | null;
  featured?: boolean;
  publish_status?: PublishStatus;
  published_at?: string | null;
  display_order?: number;
}

export interface TestimonialUpdate {
  title?: string | null;
  author_name?: string | null;
  author_role?: string | null;
  quote?: string | null;
  rating_score?: number | null;
  rating_label?: string | null;
  stars?: number | null;
  source?: string | null;
  source_url?: string | null;
  avatar_media_id?: string | null;
  featured?: boolean | null;
  publish_status?: PublishStatus | null;
  published_at?: string | null;
  display_order?: number | null;
}

// ---------------------------------------------------------------------------
// Contact Inquiries
// ---------------------------------------------------------------------------

export interface ContactMessageRead {
  id: string;
  inquiry_mode: ContactInquiryMode;
  sender_name: string;
  sender_email: string;
  subject: string;
  project_type: string;
  message: string;
  status: ContactMessageStatus;
  admin_notes?: string | null;
  read_at?: string | null;
  archived_at?: string | null;
  handled_by_id?: string | null;
  created_at: string;
  updated_at: string;
}

export interface ContactMessageUpdate {
  status?: ContactMessageStatus | null;
  admin_notes?: string | null;
}

// ---------------------------------------------------------------------------
// Site Settings
// ---------------------------------------------------------------------------

export interface SiteSettingRead {
  id: string;
  key: string;
  label: string;
  category: string;
  description?: string | null;
  value: Record<string, unknown>;
  is_public: boolean;
  portrait_media_id?: string | null;
  portrait_media?: MediaAssetSummary | null;
  updated_by_id?: string | null;
  created_at: string;
  updated_at: string;
}

export interface SiteSettingCreate {
  key: string;
  label: string;
  category?: string;
  description?: string | null;
  value: Record<string, unknown>;
  is_public?: boolean;
  portrait_media_id?: string | null;
}

export interface SiteSettingUpdate {
  label?: string | null;
  category?: string | null;
  description?: string | null;
  value?: Record<string, unknown> | null;
  portrait_media_id?: string | null;
}

export interface SiteSettingVisibilityUpdate {
  is_public: boolean;
}
