"""Admin router — user management endpoints (Plan 02-04 full implementation).

This stub registers GET /admin/users and POST /admin/users protected by
require_role(['system_admin']) so that RBAC and auth-guard tests (02-03b)
can verify 403/401 behavior before Plan 02-04 ships the full implementation.
"""
from fastapi import APIRouter, Depends

from app.core.dependencies import require_role

router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/users")
async def list_users(_=require_role(["system_admin"])):
    # TODO(Plan 02-04): Implement full list with AdminService
    return []


@router.post("/users", status_code=201)
async def create_user(_=require_role(["system_admin"])):
    # TODO(Plan 02-04): Implement full create with AdminService
    return {}
