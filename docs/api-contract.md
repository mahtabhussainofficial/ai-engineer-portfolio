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

## Planned Public API (Future Phases — Not Implemented Yet)

Public endpoints return only records where `publish_status = "published"` (or `is_public = true` for `site_settings`), ordered by `display_order ASC`.

| Method | Path | Purpose | Source Frontend Data Module |
| --- | --- | --- | --- |
| `GET` | `/api/v1/public/site` | Aggregated public `site_settings` (`site_profile`, `home_hero`, `home_about_preview`, `about_profile`, `connect_channels`, `profile_highlights`, `approach_principles`, `process_steps`) | `lib/site-config.ts`, `lib/about-data.ts` |
| `GET` | `/api/v1/public/projects` | List published projects (filterable by `category`, `featured`) | `lib/projects-data.ts` |
| `GET` | `/api/v1/public/projects/{slug}` | Fetch single published project detail by unique `slug` | `lib/projects-data.ts` |
| `GET` | `/api/v1/public/services` | List published services (filterable by `category`, `featured`) | `lib/services-data.ts` |
| `GET` | `/api/v1/public/skills` | List published skill groups (filterable by `layer`, `featured`) | `lib/skills-data.ts` |
| `GET` | `/api/v1/public/background` | Published `experience`, `education`, and `certifications` records | `lib/experience-data.ts` |
| `GET` | `/api/v1/public/testimonials` | List published client feedback / testimonials | `lib/site-config.ts` (`CLIENT_FEEDBACK`) |
| `POST` | `/api/v1/public/contact` | Submit a new contact inquiry (`inquiry_mode`, `sender_name`, `sender_email`, `subject`, `project_type`, `message`) | `app/(public)/contact/contact-form.tsx` |

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
- **201 Created**: Returns created message reference (`id`, `status: "unread"`, `created_at`).
- **422 Unprocessable Content**: Returns field-level validation errors matching `ContactMessageCreate`.

---

## Planned Admin Content & Inbox API (Future Phases — Not Implemented Yet)

All admin endpoints require `Authorization: Bearer <access_token>` (`get_current_admin`).
All admin list endpoints include both `draft` and `published` items and support `publish_status` filtering and display reordering.

| Resource | Endpoints |
| --- | --- |
| Site Settings | `GET /admin/settings`, `PUT /admin/settings/{key}` |
| Projects | `GET /admin/projects`, `POST /admin/projects`, `GET /admin/projects/{id}`, `PATCH /admin/projects/{id}`, `DELETE /admin/projects/{id}` |
| Services | `GET /admin/services`, `POST /admin/services`, `PATCH /admin/services/{id}`, `DELETE /admin/services/{id}` |
| Skills | `GET /admin/skills`, `POST /admin/skills`, `PATCH /admin/skills/{id}`, `DELETE /admin/skills/{id}` |
| Experience | `GET /admin/experience`, `POST /admin/experience`, `PATCH /admin/experience/{id}`, `DELETE /admin/experience/{id}` |
| Education | `GET /admin/education`, `POST /admin/education`, `PATCH /admin/education/{id}`, `DELETE /admin/education/{id}` |
| Certifications | `GET /admin/certifications`, `POST /admin/certifications`, `PATCH /admin/certifications/{id}`, `DELETE /admin/certifications/{id}` |
| Testimonials | `GET /admin/testimonials`, `POST /admin/testimonials`, `PATCH /admin/testimonials/{id}`, `DELETE /admin/testimonials/{id}` |
| Contact Messages | `GET /admin/messages` (filter by `status`), `GET /admin/messages/{id}`, `PATCH /admin/messages/{id}` (update `status` / `admin_notes`), `DELETE /admin/messages/{id}` |
| Media Assets | `GET /admin/media`, `POST /admin/media`, `PATCH /admin/media/{id}`, `DELETE /admin/media/{id}` |
