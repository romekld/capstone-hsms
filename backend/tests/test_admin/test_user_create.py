"""AUTH-04/06: Admin user management — create user, system_admin exclusivity, non-admin access block.
Stubs: pass until Wave 2 (Plan 02-04) ships POST /admin/users.
"""
import pytest
from httpx import ASGITransport, AsyncClient
from app.main import app


@pytest.mark.asyncio
async def test_create_user_success():
    """POST /admin/users by system_admin creates a user and returns 201 with user object."""
    pytest.skip("Stub — requires Plan 02-04 POST /admin/users endpoint")


@pytest.mark.asyncio
async def test_admin_exclusive():
    """POST /admin/users with roles=['system_admin','nurse'] returns 422 with field-level error."""
    pytest.skip("Stub — requires Plan 02-04 POST /admin/users + service validation")


@pytest.mark.asyncio
async def test_non_admin_blocked():
    """POST /admin/users by a nurse returns 403."""
    pytest.skip("Stub — requires Plan 02-04 POST /admin/users + require_role(['system_admin'])")
