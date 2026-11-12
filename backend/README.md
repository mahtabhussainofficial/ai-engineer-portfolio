# Portfolio Backend API (FastAPI + PostgreSQL)

Phase 1 foundation for the AI Engineer Portfolio backend built with **FastAPI**, **SQLAlchemy 2.x**, **Pydantic v2**, **Alembic**, and **PostgreSQL**.

## Architecture Overview

```text
backend/
├── app/
│   ├── api/v1/endpoints/   # Versioned API route handlers (Phase 1: health checks)
│   ├── core/               # Settings, structured logging, centralized exception handlers
│   ├── db/                 # SQLAlchemy 2.x Base, mixins, custom types, session lifecycle
│   ├── models/             # 12 PostgreSQL ORM models and domain enums
│   ├── schemas/            # Pydantic v2 validation and serialization schemas
│   ├── services/           # Business/infrastructure services (health & DB readiness)
│   └── main.py             # FastAPI application factory, CORS, request-ID middleware
├── alembic/                # Alembic migration environment and versioned migrations
├── tests/                  # Pytest suite (API, schemas, models, migrations)
├── .env.example            # Documented environment variable template
├── .gitignore
├── alembic.ini
└── requirements.txt
```

## Prerequisites

- Python 3.12+ (verified on Python 3.14)
- PostgreSQL 15+ (for live database connectivity and applying migrations)

## Local Setup

1. Navigate to the `backend/` directory:

   ```bash
   cd backend
   ```

2. Create and activate a virtual environment:

   **Windows (PowerShell):**

   ```powershell
   python -m venv .venv
   .\.venv\Scripts\Activate.ps1
   ```

   **macOS / Linux:**

   ```bash
   python -m venv .venv
   source .venv/bin/activate
   ```

3. Install dependencies:

   ```bash
   pip install -r requirements.txt
   ```

4. Configure environment variables:

   ```bash
   cp .env.example .env
   ```

   Update `.env` with your PostgreSQL connection details (`DATABASE_URL` or `POSTGRES_*` variables) and allowed `CORS_ORIGINS` (defaults to `http://localhost:3000` and `http://127.0.0.1:3000` for the local Next.js development server).

## Database Migrations (Alembic)

1. Ensure your PostgreSQL database exists (e.g., `portfolio_db`) and `.env` is configured.
2. Apply migrations:

   ```bash
   alembic upgrade head
   ```

3. Generate future schema migrations after modifying `app/models/`:

   ```bash
   alembic revision --autogenerate -m "describe_change"
   ```

4. Preview PostgreSQL DDL offline without connecting to a database:

   ```bash
   alembic upgrade head --sql
   ```

## Running the Server

Start the development server from inside `backend/`:

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Available endpoints:

- `GET /health` — Root liveness/health summary
- `GET /api/v1/health` — Versioned health check with non-fatal database status (`ok` or `degraded`)
- `GET /api/v1/health/db` — Strict database readiness check (`200` when `SELECT 1` succeeds, `503` otherwise)
- `POST /api/v1/auth/login` — Single-administrator login (JWT access token + `HttpOnly` refresh cookie + CSRF cookie)
- `POST /api/v1/auth/refresh` — CSRF-protected refresh token rotation with reuse detection
- `POST /api/v1/auth/logout` — CSRF-protected current session logout
- `POST /api/v1/auth/logout-all` — Revoke all active sessions (Bearer token required)
- `GET /api/v1/auth/me` — Current authenticated administrator profile
- `GET /api/v1/auth/sessions` — List active/recent refresh sessions
- `DELETE /api/v1/auth/sessions/{session_id}` — Revoke a specific refresh session
- `GET /docs` — Swagger UI (OpenAPI)
- `GET /redoc` — ReDoc documentation

## Creating the Initial Administrator

This CMS supports a single administrator account and has **no public registration endpoint**. Set a 32+ character `SECRET_KEY` in `backend/.env` and run the interactive CLI from inside `backend/`:

```bash
python -m app.cli.create_admin
```

The command prompts locally for email, full name, and masked password (minimum 12 characters) and refuses to create a second administrator if one already exists.

## Running Tests

From inside `backend/`:

```bash
pytest -v
```

> **Note:** Unit and migration tests use an ephemeral SQLite database when testing ORM behavior and Alembic `upgrade`/`downgrade` cycles, plus Alembic offline `--sql` generation to verify PostgreSQL DDL (`UUID`, `JSONB`, `ARRAY`, `TIMESTAMP WITH TIME ZONE`). Live PostgreSQL integration should be verified against a running PostgreSQL instance with `.env` configured.
