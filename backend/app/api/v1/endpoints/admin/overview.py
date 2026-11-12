"""Protected admin dashboard overview endpoint."""

from __future__ import annotations

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.admin import AdminOverviewResponse
from app.schemas.common import ErrorResponse
from app.services.admin_overview import get_admin_overview

router = APIRouter(tags=["Admin Overview"])


@router.get(
    "/overview",
    response_model=AdminOverviewResponse,
    status_code=status.HTTP_200_OK,
    responses={status.HTTP_401_UNAUTHORIZED: {"model": ErrorResponse}},
    summary="Get admin dashboard counts and recent inquiries",
)
def read_admin_overview(db: Session = Depends(get_db)) -> AdminOverviewResponse:
    return get_admin_overview(db)
