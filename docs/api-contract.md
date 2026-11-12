# Portfolio API Contract (Phase 1 & Planned Phase 2+)

Base URL (local development): `http://localhost:8000`
API Prefix: `/api/v1`

## Common Conventions

### Request Tracing
Every response includes an `X-Request-ID` header (echoing the caller's `X-Request-ID` if provided, or generating a UUIDv4).

### Error Envelope
All 4xx/5xx error responses return a uniform JSON envelope:

```json
{
  "error": {
    "code": "validation_error",
    "message": "Request validation failed.",
    "request_id": "550e8400-e29b-41d4-a716-446655440000",
    "details": []
  }
}
```

---

## Implemented in Phase 1

### `GET /health`
Root liveness endpoint (excluded from OpenAPI schema) returning the same payload as `GET /api/v1/health`.

### `GET /api/v1/health`
Returns service metadata and non-fatal PostgreSQL connectivity status.
- **200 OK** (`status: "ok"` when connected, `status: "degraded"` when unconfigured or disconnected):

```json
{
  "status": "ok",
  "service": "Shabnum H. Portfolio API",
  "version": "0.1.0",
  "environment": "development",
  "timestamp": "2026-11-12T09:45:00Z",
  "database": {
    "configured": true,
    "connected": true,
    "status": "connected",
    "latency_ms": 2.41,
    "detail": null
  }
}
```

### `GET /api/v1/health/db`
Strict database readiness check executing `SELECT 1`.
- **200 OK**: Returns `DatabaseHealth` object when connected.
- **503 Service Unavailable**: Returns `ErrorResponse` with `code: "database_unavailable"` when unconfigured or unreachable.

---

## Implemented in Phase 2 (Single-Administrator Authentication)

Protected via short-lived Bearer JWT access tokens (15 min default) + `HttpOnly` refresh token cookie (`portfolio_refresh_token`, scoped to `/api/v1/auth`) + double-submit CSRF protection (`portfolio_csrf_token` cookie + `X-CSRF-Token` header). There is **no public registration endpoint**; the sole administrator account is provisioned via `python -m app.cli.create_admin`.

### `POST /api/v1/auth/login`
Rate-limited administrator login (`email`, `password`).
- **200 OK**: Returns `TokenResponse` (`access_token`, `token_type: "bearer"`, `expires_in`, `csrf_token`, `admin`) and sets `HttpOnly` refresh cookie + CSRF cookie.
- **401 Unauthorized**: Generic `"Invalid authentication credentials."` on wrong password, unknown email, or inactive account.
- **429 Too Many Requests**: Returns `Retry-After` header when login attempts exceed configured limit.

### `POST /api/v1/auth/refresh`
Requires CSRF validation (`X-CSRF-Token` matching `portfolio_csrf_token` cookie + allowed `Origin`/`Referer` when present) and `portfolio_refresh_token` cookie.
- **200 OK**: Atomically revokes the consumed `admin_sessions` row, issues a new rotated `admin_sessions` row, and returns fresh `TokenResponse` + rotated cookies.
- **401 Unauthorized**: Clears auth cookies; if an already-revoked refresh token is replayed (`refresh_token_reuse`), revokes **all** active sessions for that administrator.
- **403 Forbidden**: CSRF validation failure.

### `POST /api/v1/auth/logout`
Requires CSRF validation and clears auth cookies.
- **200 OK**: Revokes the current `admin_sessions` record (if active) and returns `{"message": "Logged out successfully.", "revoked_sessions": <int>}`.
- **403 Forbidden**: CSRF validation failure.

### `POST /api/v1/auth/logout-all`
Requires `Authorization: Bearer <access_token>`.
- **200 OK**: Revokes all active `admin_sessions` records for the administrator and clears auth cookies.

### `GET /api/v1/auth/me`
Requires `Authorization: Bearer <access_token>`.
- **200 OK**: Returns `AdminUserRead` (`id`, `email`, `full_name`, `role`, `is_active`, `last_login_at`, `created_at`, `updated_at`).

### `GET /api/v1/auth/sessions`
Requires `Authorization: Bearer <access_token>`.
- **200 OK**: Lists `AdminSessionRead` records (never exposes `refresh_token_hash`). Optional query `?include_revoked=true`.

### `DELETE /api/v1/auth/sessions/{session_id}`
Requires `Authorization: Bearer <access_token>`.
- **200 OK**: Revokes the specified session ID.
- **404 Not Found**: Session not found.

---

## Schema & Validation Conventions (Implemented in Phase 3A)

- **Canonical `snake_case` wire contract:** All FastAPI request/response JSON payloads and `site_settings.value` JSONB objects use canonical `snake_case` naming (matching existing Phase 2 auth schemas and `ContactMessageCreate`) without implicit camelCase aliasing. Frontend TypeScript data/UI boundaries adapt `snake_case` payloads <-> `camelCase` props in Sub-phase 3C so compatibility is preserved without silent field renames.
- **Strict write validation:** Incoming request/write schemas inherit `AppWriteSchema` (`extra="forbid"`) to reject unexpected fields and prevent mass assignment; read/response schemas remain permissive on `AppBaseSchema`.
- **Safe URLs & links:** Asset URLs (`SafeAssetUrl`) allow only `http://`, `https://`, or single-slash root-relative `/...` paths (rejecting `//...`, `javascript:`, `data:`, and `ftp:`). CTA/social links (`SafeLinkHref`) allow `http(s)://`, `/...`, `#anchor`, and `mailto:`.
- **Pagination envelope:** Collection responses use `PaginatedResponse[T]` (`items`, `total`, `page`, `page_size`, `total_pages`) paired with `PaginationParams` (`page >= 1`, `1 <= page_size <= 100`).
- **Resolved media summaries:** Content read schemas (`ProjectSummary`, `ProjectRead`, `CertificationRead`, `TestimonialRead`, `SiteSettingRead`, `PublicSiteSettingsPayload`) embed `MediaAssetSummary` (`id`, `title`, `url`, `mime_type`, `width`, `height`, `alt_text`, `caption`). Sub-phase 3B/3C ORM queries must eager-load media relationships (`selectinload` / `joinedload`) before closing the session.
- **Typed public `site_settings` & visibility guard:** `PUBLIC_SETTING_KEYS` explicitly whitelists only five public keys (`site_general`, `home_page`, `about_page`, `contact_page`, `skills_page`), each validated by a typed Pydantic v2 schema (`SiteGeneralSettings`, `HomePageSettings`, `AboutPageSettings`, `ContactPageSettings`, `SkillsPageSettings`). Non-whitelisted keys default to `is_public=false` and cannot be created with `is_public=true`.
- **`SiteSettingUpdate` service validation requirement (Sub-phase 3B):** Because `SiteSettingUpdate` intentionally omits both `key` and `is_public`, whenever an admin update supplies a non-null `value`, the Sub-phase 3B service/endpoint must validate `payload.value` against the persisted row's `key` via `validate_site_setting_value(existing_setting.key, payload.value)` before saving (returning HTTP `422` on invalid structure).
- **Dedicated protected visibility operation (Sub-phase 3B):** Intentional visibility transitions remain separate from ordinary `SiteSettingUpdate` edits. The planned protected admin endpoint `PATCH /api/v1/admin/settings/{key}/visibility` (requiring `get_current_admin` and `SiteSettingVisibilityUpdate`) must invoke `ensure_public_setting_allowed(existing_setting.key, payload.is_public)` and, before setting `is_public=true`, validate the stored value via `validate_site_setting_value(existing_setting.key, existing_setting.value)`. Public read endpoints independently filter by `is_public = true` **and** `key IN PUBLIC_SETTING_KEYS`.

---

## Planned Public API (Sub-phase 3C — Not Implemented Yet)

Public endpoints return only records where `publish_status = "published"` (or whitelisted keys where `is_public = true` for `site_settings`), ordered by `display_order ASC`.

| Method | Path | Purpose | Source Frontend Data Module |
| --- | --- | --- | --- |
| `GET` | `/api/v1/public/site` | Aggregated whitelisted public `site_settings` (`site_general`, `home_page`, `about_page`, `contact_page`, `skills_page`) with resolved media | `lib/site-config.ts`, `lib/about-data.ts`, `lib/skills-data.ts`, `app/(public)/*.tsx` |
| `GET` | `/api/v1/public/projects` | Paginated published projects (filterable by `category`, `featured`) | `lib/projects-data.ts` |
| `GET` | `/api/v1/public/projects/{slug}` | Fetch single published project detail by unique `slug` | `lib/projects-data.ts` |
| `GET` | `/api/v1/public/services` | List published services (filterable by `category`, `featured`) | `lib/services-data.ts` |
| `GET` | `/api/v1/public/skills` | List published skill groups (filterable by `layer`, `featured`) | `lib/skills-data.ts` |
| `GET` | `/api/v1/public/background` | Published `experience`, `education`, and `certifications` records | `lib/experience-data.ts` |
| `GET` | `/api/v1/public/testimonials` | Paginated published client feedback / testimonials | `lib/site-config.ts` (`CLIENT_FEEDBACK`) |
| `POST` | `/api/v1/public/contact` | Rate-limited contact inquiry submission (`ContactMessageCreate` -> `ContactMessagePublicResponse`) | `app/(public)/contact/contact-form.tsx` |

### Planned `POST /api/v1/public/contact` Request Payload
```json
{
  "inquiry_mode": "project",
  "sender_name": "Alex Rivera",
  "sender_email": "alex@example.com",
  "subject": "Workflow Automation Architecture",
  "project_type": "Agentic workflow",
  "message": "Looking to automate document intake and approval routing."
}
```
- **201 Created**: Returns minimal `ContactMessagePublicResponse` (`id`, `status: "unread"`, `created_at`).
- **422 Unprocessable Content**: Returns field-level validation errors matching `ContactMessageCreate`.

---

## Admin Content & Inbox API (Implemented in Sub-phase 3B)

All admin endpoints require `Authorization: Bearer <access_token>` (`get_current_admin`), return structured `ErrorResponse` payloads (`401`/`404`/`409`/`422`), eager-load resolved `MediaAssetSummary` relations, and return `PaginatedResponse[T]` envelopes on collection listings.

| Resource | Implemented Endpoints |
| --- | --- |
| Dashboard | `GET /api/v1/admin/overview` |
| Site Settings | `GET /api/v1/admin/settings`, `POST /api/v1/admin/settings`, `GET /api/v1/admin/settings/{key}`, `PATCH /api/v1/admin/settings/{key}` (`SiteSettingUpdate` + `validate_site_setting_value`), `PATCH /api/v1/admin/settings/{key}/visibility` (`SiteSettingVisibilityUpdate` + `ensure_public_setting_allowed`) |
| Media Assets | `GET /api/v1/admin/media`, `POST /api/v1/admin/media`, `GET /api/v1/admin/media/{media_id}`, `PATCH /api/v1/admin/media/{media_id}`, `DELETE /api/v1/admin/media/{media_id}` (conflict-protected if referenced) |
| Projects | `GET /api/v1/admin/projects`, `POST /api/v1/admin/projects`, `GET /api/v1/admin/projects/{project_id}`, `PATCH /api/v1/admin/projects/{project_id}`, `DELETE /api/v1/admin/projects/{project_id}`, `POST /api/v1/admin/projects/{project_id}/publish`, `POST /api/v1/admin/projects/{project_id}/unpublish` |
| Services | `GET /api/v1/admin/services`, `POST /api/v1/admin/services`, `GET /api/v1/admin/services/{service_id}`, `PATCH /api/v1/admin/services/{service_id}`, `DELETE /api/v1/admin/services/{service_id}` |
| Skills | `GET /api/v1/admin/skills`, `POST /api/v1/admin/skills`, `GET /api/v1/admin/skills/{skill_id}`, `PATCH /api/v1/admin/skills/{skill_id}`, `DELETE /api/v1/admin/skills/{skill_id}` |
| Experience | `GET /api/v1/admin/experience`, `POST /api/v1/admin/experience`, `GET /api/v1/admin/experience/{experience_id}`, `PATCH /api/v1/admin/experience/{experience_id}`, `DELETE /api/v1/admin/experience/{experience_id}` |
| Education | `GET /api/v1/admin/education`, `POST /api/v1/admin/education`, `GET /api/v1/admin/education/{education_id}`, `PATCH /api/v1/admin/education/{education_id}`, `DELETE /api/v1/admin/education/{education_id}` |
| Certifications | `GET /api/v1/admin/certifications`, `POST /api/v1/admin/certifications`, `GET /api/v1/admin/certifications/{certification_id}`, `PATCH /api/v1/admin/certifications/{certification_id}`, `DELETE /api/v1/admin/certifications/{certification_id}` |
| Testimonials | `GET /api/v1/admin/testimonials`, `POST /api/v1/admin/testimonials`, `GET /api/v1/admin/testimonials/{testimonial_id}`, `PATCH /api/v1/admin/testimonials/{testimonial_id}`, `DELETE /api/v1/admin/testimonials/{testimonial_id}`, `POST /api/v1/admin/testimonials/{testimonial_id}/publish`, `POST /api/v1/admin/testimonials/{testimonial_id}/unpublish` |
| Contact Messages | `GET /api/v1/admin/messages` (filter by `status`, `inquiry_mode`), `GET /api/v1/admin/messages/{message_id}`, `PATCH /api/v1/admin/messages/{message_id}` (update `status` / `admin_notes`), `DELETE /api/v1/admin/messages/{message_id}` |
