"""Application exception types and centralized FastAPI error handlers."""

from __future__ import annotations

import logging
from typing import Any

from fastapi import FastAPI, Request, status
from fastapi.encoders import jsonable_encoder
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from sqlalchemy.exc import SQLAlchemyError
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.core.logging import request_id_ctx_var

logger = logging.getLogger(__name__)


class AppError(Exception):
    """Base application error translated into a structured API error response."""

    def __init__(
        self,
        message: str,
        *,
        code: str = "application_error",
        status_code: int = status.HTTP_400_BAD_REQUEST,
        details: Any = None,
        headers: dict[str, str] | None = None,
    ) -> None:
        super().__init__(message)
        self.message = message
        self.code = code
        self.status_code = status_code
        self.details = details
        self.headers = headers


class DatabaseUnavailableError(AppError):
    """Raised when the database is unconfigured or unreachable."""

    def __init__(self, message: str = "Database service is currently unavailable.") -> None:
        super().__init__(
            message,
            code="database_unavailable",
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
        )


class AuthenticationError(AppError):
    """Raised when authentication credentials, tokens, or sessions are invalid."""

    def __init__(
        self,
        message: str = "Invalid authentication credentials.",
        *,
        code: str = "authentication_failed",
    ) -> None:
        super().__init__(
            message,
            code=code,
            status_code=status.HTTP_401_UNAUTHORIZED,
            headers={"WWW-Authenticate": "Bearer"},
        )


class ForbiddenError(AppError):
    """Raised when a security policy check (such as CSRF validation) fails."""

    def __init__(
        self,
        message: str = "Forbidden.",
        *,
        code: str = "forbidden",
    ) -> None:
        super().__init__(
            message,
            code=code,
            status_code=status.HTTP_403_FORBIDDEN,
        )


class RateLimitExceededError(AppError):
    """Raised when too many requests occur within the configured window."""

    def __init__(self, retry_after_seconds: int) -> None:
        super().__init__(
            "Too many authentication attempts. Please try again later.",
            code="rate_limit_exceeded",
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            headers={"Retry-After": str(max(1, retry_after_seconds))},
        )


class NotFoundError(AppError):
    """Raised when a requested resource cannot be found."""

    def __init__(self, message: str = "Requested resource was not found.") -> None:
        super().__init__(
            message,
            code="not_found",
            status_code=status.HTTP_404_NOT_FOUND,
        )


class ConflictError(AppError):
    """Raised when an operation conflicts with existing resource state."""

    def __init__(self, message: str = "Resource conflict occurred.") -> None:
        super().__init__(
            message,
            code="conflict",
            status_code=status.HTTP_409_CONFLICT,
        )


def _error_response(
    *,
    status_code: int,
    code: str,
    message: str,
    details: Any = None,
    headers: dict[str, str] | None = None,
) -> JSONResponse:
    payload: dict[str, Any] = {
        "error": {
            "code": code,
            "message": message,
            "request_id": request_id_ctx_var.get(),
        }
    }
    if details is not None:
        payload["error"]["details"] = details
    return JSONResponse(status_code=status_code, content=payload, headers=headers)


def register_exception_handlers(app: FastAPI) -> None:
    """Register structured exception handlers on the FastAPI application."""

    @app.exception_handler(AppError)
    async def handle_app_error(_request: Request, exc: AppError) -> JSONResponse:
        logger.warning(
            "Application error handled",
            extra={"error_code": exc.code, "status_code": exc.status_code},
        )
        return _error_response(
            status_code=exc.status_code,
            code=exc.code,
            message=exc.message,
            details=exc.details,
            headers=exc.headers,
        )

    @app.exception_handler(RequestValidationError)
    async def handle_validation_error(
        _request: Request, exc: RequestValidationError
    ) -> JSONResponse:
        logger.warning("Request validation error")
        return _error_response(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            code="validation_error",
            message="Request validation failed.",
            details=jsonable_encoder(exc.errors()),
        )

    @app.exception_handler(StarletteHTTPException)
    async def handle_http_exception(
        _request: Request, exc: StarletteHTTPException
    ) -> JSONResponse:
        return _error_response(
            status_code=exc.status_code,
            code="http_error",
            message=str(exc.detail),
        )

    @app.exception_handler(SQLAlchemyError)
    async def handle_sqlalchemy_error(
        _request: Request, _exc: SQLAlchemyError
    ) -> JSONResponse:
        logger.exception("Database operation failed")
        return _error_response(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            code="database_error",
            message="An internal database error occurred.",
        )

    @app.exception_handler(Exception)
    async def handle_unexpected_error(
        _request: Request, _exc: Exception
    ) -> JSONResponse:
        logger.exception("Unhandled server exception")
        return _error_response(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            code="internal_server_error",
            message="An unexpected internal server error occurred.",
        )
