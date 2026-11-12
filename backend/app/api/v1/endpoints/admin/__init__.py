"""Protected admin CMS router enforcing administrator authentication across all routes."""

from __future__ import annotations

from fastapi import APIRouter, Depends

from app.api.deps import get_current_admin
from app.api.v1.endpoints.admin.content import router as content_router
from app.api.v1.endpoints.admin.media import router as media_router
from app.api.v1.endpoints.admin.messages import router as messages_router
from app.api.v1.endpoints.admin.overview import router as overview_router
from app.api.v1.endpoints.admin.settings import router as settings_router

admin_router = APIRouter(
    prefix="/admin",
    dependencies=[Depends(get_current_admin)],
)
admin_router.include_router(overview_router)
admin_router.include_router(settings_router)
admin_router.include_router(media_router)
admin_router.include_router(content_router)
admin_router.include_router(messages_router)
