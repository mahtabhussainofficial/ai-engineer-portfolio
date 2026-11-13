"""FastAPI application entry point and middleware configuration."""

from __future__ import annotations

import logging
import re
import time
import uuid
from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from fastapi import Depends, FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.router import api_v1_router
from app.core.config import Settings, get_settings
from app.core.exceptions import register_exception_handlers
from app.core.logging import configure_logging, request_id_ctx_var
from app.db.session import close_db, init_db
from app.schemas.common import HealthCheckResponse
from app.services.health import build_health_response

logger = logging.getLogger(__name__)
_REQUEST_ID_PATTERN = re.compile(r"^[A-Za-z0-9._:-]{1,64}$")


def _build_lifespan(settings: Settings):
    """Create a FastAPI lifespan handler bound to the resolved settings instance."""

    @asynccontextmanager
    async def lifespan(_app: FastAPI) -> AsyncIterator[None]:
        """Manage application startup and shutdown lifecycle."""
        settings.validate_production_readiness()
        configure_logging(level=settings.log_level, log_format=settings.log_format)
        logger.info(
            "Starting portfolio backend API",
            extra={"environment": settings.environment, "version": settings.app_version},
        )
        init_db(settings)
        try:
            yield
        finally:
            close_db()
            logger.info("Stopped portfolio backend API")

    return lifespan


def create_application(settings: Settings | None = None) -> FastAPI:
    """Create and configure the FastAPI application instance."""
    active_settings = settings or get_settings()
    expose_docs = active_settings.environment != "production"

    application = FastAPI(
        title=active_settings.app_name,
        version=active_settings.app_version,
        debug=active_settings.debug,
        docs_url="/docs" if expose_docs else None,
        redoc_url="/redoc" if expose_docs else None,
        openapi_url=f"{active_settings.api_v1_prefix}/openapi.json" if expose_docs else None,
        lifespan=_build_lifespan(active_settings),
    )

    if active_settings.cors_origins:
        application.add_middleware(
            CORSMiddleware,
            allow_origins=active_settings.cors_origins,
            allow_credentials=active_settings.cors_allow_credentials,
            allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
            allow_headers=[
                "Authorization",
                "Content-Type",
                "X-CSRF-Token",
                "X-Request-ID",
                "Accept",
            ],
        )

    @application.middleware("http")
    async def request_context_middleware(request: Request, call_next) -> Response:
        incoming_request_id = (request.headers.get("X-Request-ID") or "").strip()
        request_id = (
            incoming_request_id
            if _REQUEST_ID_PATTERN.fullmatch(incoming_request_id)
            else str(uuid.uuid4())
        )
        token = request_id_ctx_var.set(request_id)
        started_at = time.perf_counter()
        try:
            response = await call_next(request)
        finally:
            duration_ms = round((time.perf_counter() - started_at) * 1000, 2)
            request_id_ctx_var.reset(token)

        response.headers["X-Request-ID"] = request_id
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        logger.info(
            "HTTP request completed",
            extra={
                "method": request.method,
                "path": request.url.path,
                "status_code": response.status_code,
                "duration_ms": duration_ms,
            },
        )
        return response

    register_exception_handlers(application)
    application.include_router(api_v1_router, prefix=active_settings.api_v1_prefix)

    @application.get(
        "/health",
        response_model=HealthCheckResponse,
        tags=["Health"],
        summary="Root health check",
        include_in_schema=False,
    )
    def root_health_check(
        resolved_settings: Settings = Depends(get_settings),
    ) -> HealthCheckResponse:
        return build_health_response(resolved_settings)

    return application


app = create_application()
