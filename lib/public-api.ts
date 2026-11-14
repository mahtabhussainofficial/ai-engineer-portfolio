import {
  CAREER_JOURNEY,
  EDUCATION_ENTRIES,
  CERTIFICATION_ENTRIES,
  type CertificationRecord,
  type EducationRecord,
  type ExperienceRecord,
} from "./experience-data";
import {
  PROJECTS,
  type ProjectCategory,
  type ProjectRecord,
} from "./projects-data";
import {
  SERVICES,
  PROCESS_STEPS,
  type ProcessStepRecord,
  type ServiceCategory,
  type ServiceRecord,
} from "./services-data";
import {
  CLIENT_FEEDBACK,
  HOME_HERO,
  HOME_ABOUT_PREVIEW,
  PROFILE_HIGHLIGHTS,
  type FeedbackRecord,
  type HeroContent,
  type HomeAboutPreview,
  type ProfileHighlightRecord,
} from "./site-config";
import {
  FEATURED_SKILLS,
  SKILL_GROUPS,
  SKILL_LAYERS,
  type FeaturedSkillRecord,
  type SkillGroupRecord,
  type SkillLayerId,
  type SkillLayerMeta,
} from "./skills-data";
import {
  ABOUT_PROFILE,
  APPROACH_PRINCIPLES,
  type AboutProfileRecord,
  type ApproachPrincipleRecord,
} from "./about-data";

// ---------------------------------------------------------------------------
// Base URL Resolution (aligns with lib/admin/api-client.ts)
// ---------------------------------------------------------------------------

export function getApiBaseUrl(): string {
  if (typeof process !== "undefined" && process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL.replace(/\/+$/, "");
  }
  if (typeof window !== "undefined") {
    if (window.location.hostname === "127.0.0.1") {
      return "http://127.0.0.1:8000";
    }
  }
  return "http://localhost:8000";
}

// ---------------------------------------------------------------------------
// Backend Schema Interfaces (matching FastAPI /schemas)
// ---------------------------------------------------------------------------

export interface BackendPaginated<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface BackendMediaAssetSummary {
  id: string;
  asset_type: string;
  url: string;
  alt_text: string | null;
}

export interface BackendProjectSummary {
  id: string;
  slug: string;
  display_number: string | null;
  title: string;
  category: string;
  home_category_label: string | null;
  project_type: "Concept Brief" | "Case Study";
  publish_status: "draft" | "published";
  featured: boolean;
  display_order: number;
  summary: string;
  tags: string[];
  cover_media_id: string | null;
  cover_media?: BackendMediaAssetSummary | null;
  created_at: string;
  updated_at: string;
}

export interface BackendProjectRead extends BackendProjectSummary {
  problem: string;
  solution: string;
  deliverables: string[];
  live_url: string | null;
  repo_url: string | null;
}

export interface BackendServiceRead {
  id: string;
  display_number: string | null;
  category: string;
  domain: string;
  title: string;
  description: string;
  tools: string[];
  featured: boolean;
  home_category_label: string | null;
  home_title: string | null;
  home_description: string | null;
  home_tags: string[] | null;
  publish_status: "draft" | "published";
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface BackendSkillRead {
  id: string;
  layer: "ai" | "backend" | "delivery";
  display_number: string | null;
  domain: string;
  title: string;
  description: string;
  items: string[];
  featured: boolean;
  featured_category: string | null;
  featured_title: string | null;
  featured_description: string | null;
  featured_tags: string[] | null;
  publish_status: "draft" | "published";
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface BackendExperienceRead {
  id: string;
  period: string;
  role: string;
  organization: string;
  location: string | null;
  summary: string;
  is_current: boolean;
  publish_status: "draft" | "published";
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface BackendEducationRead {
  id: string;
  period: string;
  degree: string;
  institution: string;
  field_of_study: string | null;
  description: string | null;
  publish_status: "draft" | "published";
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface BackendCertificationRead {
  id: string;
  year: string;
  title: string;
  issuer: string;
  credential_id: string | null;
  credential_url: string | null;
  badge_media_id: string | null;
  publish_status: "draft" | "published";
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface BackendPublicBackgroundResponse {
  experience: BackendExperienceRead[];
  education: BackendEducationRead[];
  certifications: BackendCertificationRead[];
}

export interface BackendTestimonialRead {
  id: string;
  title: string;
  author_name: string | null;
  author_role: string | null;
  quote: string | null;
  rating_score: string | number | null;
  rating_label: string;
  stars: number;
  source: string;
  source_url: string | null;
  avatar_media_id: string | null;
  featured: boolean;
  publish_status: "draft" | "published";
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface BackendPublicSiteSettings {
  site_general?: Record<string, unknown> | null;
  home_page?: Record<string, unknown> | null;
  about_page?: Record<string, unknown> | null;
  contact_page?: Record<string, unknown> | null;
  skills_page?: Record<string, unknown> | null;
  portrait_media?: BackendMediaAssetSummary | null;
  logo_media?: BackendMediaAssetSummary | null;
}

export interface ContactInquiryPayload {
  readonly inquiryMode: "project" | "advisory";
  readonly name: string;
  readonly email: string;
  readonly subject: string;
  readonly projectType: string;
  readonly message: string;
}

// ---------------------------------------------------------------------------
// Internal HTTP Fetch Helper with Next.js ISR support
// ---------------------------------------------------------------------------

interface FetchResult<T> {
  ok: boolean;
  status: number;
  data: T | null;
}

async function fetchPublicApi<T>(
  path: string,
  options?: RequestInit,
): Promise<FetchResult<T>> {
  const baseUrl = getApiBaseUrl();
  const url = `${baseUrl}${path.startsWith("/") ? path : `/${path}`}`;
  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        Accept: "application/json",
        ...options?.headers,
      },
      next: { revalidate: 60, ...options?.next },
    });

    if (res.status === 404) {
      return { ok: false, status: 404, data: null };
    }

    if (!res.ok) {
      return { ok: false, status: res.status, data: null };
    }

    const data = (await res.json()) as T;
    return { ok: true, status: res.status, data };
  } catch {
    // API is offline or network unreachable
    return { ok: false, status: 0, data: null };
  }
}

// ---------------------------------------------------------------------------
// Adapters / Transformers: Backend snake_case -> Frontend camelCase
// ---------------------------------------------------------------------------

function mapProjectSummaryToRecord(
  item: BackendProjectSummary,
  index: number,
): ProjectRecord {
  return {
    id: item.id,
    slug: item.slug,
    number: item.display_number || String(index + 1).padStart(2, "0"),
    title: item.title,
    category: item.category as ProjectCategory,
    homeCategoryLabel: item.home_category_label || item.category.toUpperCase(),
    status: item.project_type,
    featured: item.featured,
    summary: item.summary,
    problem: item.summary,
    solution: item.summary,
    deliverables: [],
    tags: item.tags || [],
  };
}

function mapProjectReadToRecord(
  item: BackendProjectRead,
  index: number = 0,
): ProjectRecord {
  return {
    id: item.id,
    slug: item.slug,
    number: item.display_number || String(index + 1).padStart(2, "0"),
    title: item.title,
    category: item.category as ProjectCategory,
    homeCategoryLabel: item.home_category_label || item.category.toUpperCase(),
    status: item.project_type,
    featured: item.featured,
    summary: item.summary,
    problem: item.problem || item.summary,
    solution: item.solution || item.summary,
    deliverables: item.deliverables || [],
    tags: item.tags || [],
    liveUrl: item.live_url || undefined,
    repoUrl: item.repo_url || undefined,
  };
}

function mapServiceToRecord(
  item: BackendServiceRead,
  index: number,
): ServiceRecord {
  return {
    id: item.id,
    number: item.display_number || String(index + 1).padStart(2, "0"),
    category: item.category as ServiceCategory,
    domain: item.domain,
    title: item.title,
    description: item.description,
    tools: item.tools || [],
    featured: item.featured,
    homeCategoryLabel: item.home_category_label || undefined,
    homeTitle: item.home_title || undefined,
    homeDescription: item.home_description || undefined,
    homeTags: item.home_tags || undefined,
  };
}

function mapSkillToGroupRecord(
  item: BackendSkillRead,
  index: number,
): SkillGroupRecord {
  return {
    id: item.id,
    layer: item.layer as SkillLayerId,
    number: item.display_number || String(index + 1).padStart(2, "0"),
    domain: item.domain,
    title: item.title,
    description: item.description,
    items: item.items || [],
  };
}

function mapSkillToFeaturedRecord(
  item: BackendSkillRead,
  index: number,
): FeaturedSkillRecord {
  return {
    id: `featured-${item.id}`,
    number: item.display_number || String(index + 1).padStart(2, "0"),
    category: item.featured_category || item.domain || "ENGINEERING",
    title: item.featured_title || item.title,
    description: item.featured_description || item.description,
    tags: item.featured_tags || item.items.slice(0, 3),
    href: `/skills#layer-${item.layer}`,
    linkLabel: `Explore ${item.title}`,
  };
}

function mapExperienceToRecord(
  item: BackendExperienceRead,
): ExperienceRecord {
  return {
    id: item.id,
    period: item.period,
    role: item.role,
    organization: item.organization,
    summary: item.summary,
    displayOrder: item.display_order,
  };
}

function mapEducationToRecord(
  item: BackendEducationRead,
): EducationRecord {
  return {
    id: item.id,
    period: item.period,
    degree: item.degree,
    institution: item.institution,
    displayOrder: item.display_order,
  };
}

function mapCertificationToRecord(
  item: BackendCertificationRead,
): CertificationRecord {
  return {
    id: item.id,
    year: item.year,
    title: item.title,
    issuer: item.issuer,
    displayOrder: item.display_order,
  };
}

function mapTestimonialToFeedbackRecord(
  item: BackendTestimonialRead,
): FeedbackRecord {
  const starsCount = Math.max(1, Math.min(5, item.stars || 5));
  return {
    id: item.id,
    title: item.title,
    rating:
      item.rating_label ||
      (item.rating_score ? `${item.rating_score} / 5.0` : "5.0 / 5.0"),
    source: item.source,
    stars: "★".repeat(starsCount),
  };
}

// ---------------------------------------------------------------------------
// Public API Client Functions
// ---------------------------------------------------------------------------

/**
 * Fetch all published projects.
 * Returns authoritative published database items if the API responds successfully (even if empty).
 * Falls back to static data only if the API is offline or returns a server error.
 */
export async function getPublicProjects(options?: {
  category?: string;
  featured?: boolean;
}): Promise<readonly ProjectRecord[]> {
  const searchParams = new URLSearchParams({ page_size: "100" });
  if (options?.category && options.category !== "All Projects") {
    searchParams.set("category", options.category);
  }
  if (typeof options?.featured === "boolean") {
    searchParams.set("featured", String(options.featured));
  }

  const res = await fetchPublicApi<BackendPaginated<BackendProjectSummary>>(
    `/api/v1/public/projects?${searchParams.toString()}`,
  );

  if (res.ok && res.data) {
    return res.data.items.map(mapProjectSummaryToRecord);
  }

  // Fallback to static data when API is unreachable
  let staticItems = PROJECTS;
  if (options?.category && options.category !== "All Projects") {
    staticItems = staticItems.filter((p) => p.category === options.category);
  }
  if (typeof options?.featured === "boolean") {
    staticItems = staticItems.filter((p) => p.featured === options.featured);
  }
  return staticItems;
}

/**
 * Fetch a single published project by slug.
 * Returns `null` if the project is unpublished or not found (HTTP 404 from backend).
 * Falls back to static data only if the backend is offline.
 */
export async function getPublicProjectBySlug(
  slug: string,
): Promise<ProjectRecord | null> {
  const res = await fetchPublicApi<BackendProjectRead>(
    `/api/v1/public/projects/${encodeURIComponent(slug)}`,
  );

  // Authoritative 404: project not found or not published
  if (res.status === 404) {
    return null;
  }

  if (res.ok && res.data) {
    return mapProjectReadToRecord(res.data);
  }

  // Fallback to static data when API is unreachable
  const staticFound = PROJECTS.find((p) => p.slug === slug);
  return staticFound ?? null;
}

/**
 * Fetch featured projects for homepage preview.
 */
export async function getPublicFeaturedProjects(): Promise<readonly ProjectRecord[]> {
  return getPublicProjects({ featured: true });
}

/**
 * Fetch published services.
 */
export async function getPublicServices(options?: {
  category?: string;
  featured?: boolean;
}): Promise<readonly ServiceRecord[]> {
  const searchParams = new URLSearchParams({ page_size: "100" });
  if (options?.category && options.category !== "All Services") {
    searchParams.set("category", options.category);
  }
  if (typeof options?.featured === "boolean") {
    searchParams.set("featured", String(options.featured));
  }

  const res = await fetchPublicApi<BackendPaginated<BackendServiceRead>>(
    `/api/v1/public/services?${searchParams.toString()}`,
  );

  if (res.ok && res.data) {
    return res.data.items.map(mapServiceToRecord);
  }

  let staticItems = SERVICES;
  if (options?.category && options.category !== "All Services") {
    staticItems = staticItems.filter((s) => s.category === options.category);
  }
  if (typeof options?.featured === "boolean") {
    staticItems = staticItems.filter((s) => s.featured === options.featured);
  }
  return staticItems;
}

/**
 * Fetch featured services for homepage preview.
 */
export async function getPublicFeaturedServices(): Promise<readonly ServiceRecord[]> {
  return getPublicServices({ featured: true });
}

/**
 * Fetch engineering process steps (from settings or fallback).
 */
export async function getPublicProcessSteps(): Promise<readonly ProcessStepRecord[]> {
  // Process steps are editorial, defaults to PROCESS_STEPS
  return PROCESS_STEPS;
}

/**
 * Fetch published skill groups.
 */
export async function getPublicSkillGroups(options?: {
  layer?: SkillLayerId;
  featured?: boolean;
}): Promise<readonly SkillGroupRecord[]> {
  const searchParams = new URLSearchParams({ page_size: "100" });
  if (options?.layer) {
    searchParams.set("layer", options.layer);
  }
  if (typeof options?.featured === "boolean") {
    searchParams.set("featured", String(options.featured));
  }

  const res = await fetchPublicApi<BackendPaginated<BackendSkillRead>>(
    `/api/v1/public/skills?${searchParams.toString()}`,
  );

  if (res.ok && res.data) {
    return res.data.items.map(mapSkillToGroupRecord);
  }

  let staticItems = SKILL_GROUPS;
  if (options?.layer) {
    staticItems = staticItems.filter((s) => s.layer === options.layer);
  }
  return staticItems;
}

/**
 * Fetch skill stack layers metadata.
 */
export async function getPublicSkillLayers(): Promise<readonly SkillLayerMeta[]> {
  return SKILL_LAYERS;
}

/**
 * Fetch featured skills for homepage preview.
 */
export async function getPublicFeaturedSkills(): Promise<readonly FeaturedSkillRecord[]> {
  const res = await fetchPublicApi<BackendPaginated<BackendSkillRead>>(
    "/api/v1/public/skills?page_size=100&featured=true",
  );

  if (res.ok && res.data) {
    return res.data.items.map(mapSkillToFeaturedRecord);
  }

  return FEATURED_SKILLS;
}

/**
 * Fetch published career background (experience, education, certifications).
 */
export async function getPublicBackground(): Promise<{
  readonly experience: readonly ExperienceRecord[];
  readonly education: readonly EducationRecord[];
  readonly certifications: readonly CertificationRecord[];
}> {
  const res = await fetchPublicApi<BackendPublicBackgroundResponse>(
    "/api/v1/public/background",
  );

  if (res.ok && res.data) {
    return {
      experience: res.data.experience.map(mapExperienceToRecord),
      education: res.data.education.map(mapEducationToRecord),
      certifications: res.data.certifications.map(mapCertificationToRecord),
    };
  }

  return {
    experience: CAREER_JOURNEY,
    education: EDUCATION_ENTRIES,
    certifications: CERTIFICATION_ENTRIES,
  };
}

/**
 * Fetch published client feedback / testimonials.
 */
export async function getPublicTestimonials(options?: {
  featured?: boolean;
}): Promise<readonly FeedbackRecord[]> {
  const searchParams = new URLSearchParams({ page_size: "100" });
  if (typeof options?.featured === "boolean") {
    searchParams.set("featured", String(options.featured));
  }

  const res = await fetchPublicApi<BackendPaginated<BackendTestimonialRead>>(
    `/api/v1/public/testimonials?${searchParams.toString()}`,
  );

  if (res.ok && res.data) {
    return res.data.items.map(mapTestimonialToFeedbackRecord);
  }

  return CLIENT_FEEDBACK;
}

/**
 * Fetch whitelisted public site settings.
 */
export async function getPublicSiteSettings(): Promise<BackendPublicSiteSettings | null> {
  const res = await fetchPublicApi<BackendPublicSiteSettings>(
    "/api/v1/public/site",
  );
  if (res.ok && res.data) {
    return res.data;
  }
  return null;
}

/**
 * Fetch homepage hero content with site setting overrides if published.
 */
export async function getPublicHomeHero(): Promise<HeroContent> {
  const settings = await getPublicSiteSettings();
  const homeSettings = settings?.home_page as Record<string, unknown> | undefined;

  if (homeSettings) {
    return {
      eyebrow: (homeSettings.hero_eyebrow as string) || HOME_HERO.eyebrow,
      headingPrimary:
        (homeSettings.hero_heading_primary as string) || HOME_HERO.headingPrimary,
      headingSecondary:
        (homeSettings.hero_heading_secondary as string) ||
        HOME_HERO.headingSecondary,
      summary: (homeSettings.hero_summary as string) || HOME_HERO.summary,
      specializations:
        (homeSettings.hero_specializations as string[]) ||
        HOME_HERO.specializations,
      portraitAlt:
        (homeSettings.hero_portrait_alt as string) || HOME_HERO.portraitAlt,
    };
  }
  return HOME_HERO;
}

/**
 * Fetch homepage about preview copy with site setting overrides if published.
 */
export async function getPublicHomeAboutPreview(): Promise<HomeAboutPreview> {
  const settings = await getPublicSiteSettings();
  const homeSettings = settings?.home_page as Record<string, unknown> | undefined;

  if (homeSettings) {
    const cta = homeSettings.about_cta as { label?: string; href?: string } | undefined;
    return {
      eyebrow: (homeSettings.about_eyebrow as string) || HOME_ABOUT_PREVIEW.eyebrow,
      sideNote:
        (homeSettings.about_side_note as string) ||
        HOME_ABOUT_PREVIEW.sideNote,
      title: (homeSettings.about_title as string) || HOME_ABOUT_PREVIEW.title,
      description:
        (homeSettings.about_description as string) ||
        HOME_ABOUT_PREVIEW.description,
      ctaLabel: cta?.label || HOME_ABOUT_PREVIEW.ctaLabel,
      ctaHref: cta?.href || HOME_ABOUT_PREVIEW.ctaHref,
    };
  }
  return HOME_ABOUT_PREVIEW;
}

/**
 * Fetch profile highlights for homepage.
 */
export async function getPublicProfileHighlights(): Promise<readonly ProfileHighlightRecord[]> {
  const settings = await getPublicSiteSettings();
  const homeSettings = settings?.home_page as Record<string, unknown> | undefined;
  const highlights = homeSettings?.highlights as
    | Array<{ id: string; index: string; value: string; suffix?: string; label: string }>
    | undefined;

  if (highlights && highlights.length > 0) {
    return highlights;
  }
  return PROFILE_HIGHLIGHTS;
}

/**
 * Fetch about profile with site setting overrides if published.
 */
export async function getPublicAboutProfile(): Promise<AboutProfileRecord> {
  const settings = await getPublicSiteSettings();
  const aboutSettings = settings?.about_page as Record<string, unknown> | undefined;

  if (aboutSettings) {
    return {
      eyebrow: (aboutSettings.eyebrow as string) || ABOUT_PROFILE.eyebrow,
      headlinePrimary:
        (aboutSettings.headline_primary as string) ||
        ABOUT_PROFILE.headlinePrimary,
      headlineSecondary:
        (aboutSettings.headline_secondary as string) ||
        ABOUT_PROFILE.headlineSecondary,
      portraitCaption:
        (aboutSettings.portrait_caption as string) ||
        ABOUT_PROFILE.portraitCaption,
      portraitAlt:
        (aboutSettings.portrait_alt as string) || ABOUT_PROFILE.portraitAlt,
      bioParagraphs:
        (aboutSettings.bio_paragraphs as string[]) ||
        ABOUT_PROFILE.bioParagraphs,
    };
  }
  return ABOUT_PROFILE;
}

/**
 * Fetch approach principles for about page.
 */
export async function getPublicApproachPrinciples(): Promise<readonly ApproachPrincipleRecord[]> {
  const settings = await getPublicSiteSettings();
  const aboutSettings = settings?.about_page as Record<string, unknown> | undefined;
  const principles = aboutSettings?.approach_principles as
    | Array<{ id: string; number: string; title: string; description: string }>
    | undefined;

  if (principles && principles.length > 0) {
    return principles;
  }
  return APPROACH_PRINCIPLES;
}

// ---------------------------------------------------------------------------
// Contact Form Submission (Real POST to FastAPI /api/v1/public/contact)
// ---------------------------------------------------------------------------

export interface PublicContactSubmitResponse {
  readonly id: string;
  readonly status: string;
  readonly createdAt: string;
}

export async function submitPublicContactMessage(
  payload: ContactInquiryPayload,
): Promise<PublicContactSubmitResponse> {
  const baseUrl = getApiBaseUrl();

  const body = {
    inquiry_mode: payload.inquiryMode,
    sender_name: payload.name.trim(),
    sender_email: payload.email.trim(),
    subject: payload.subject.trim(),
    project_type: payload.projectType.trim(),
    message: payload.message.trim(),
  };

  let res: Response;
  try {
    res = await fetch(`${baseUrl}/api/v1/public/contact`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(body),
    });
  } catch {
    throw new Error(
      "Unable to connect to the server. Please check your internet connection and try again.",
    );
  }

  if (res.status === 429) {
    throw new Error(
      "Too many messages sent from your location. Please wait a few moments before trying again.",
    );
  }

  if (res.status === 422) {
    throw new Error(
      "Please review the form fields and ensure all requirements are met.",
    );
  }

  if (!res.ok) {
    throw new Error(
      "An unexpected error occurred while sending your inquiry. Please try again later.",
    );
  }

  const data = (await res.json()) as {
    id: string;
    status: string;
    created_at: string;
  };

  return {
    id: data.id,
    status: data.status,
    createdAt: data.created_at,
  };
}
