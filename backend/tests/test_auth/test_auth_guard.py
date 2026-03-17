"""AUTH-07: Unauthenticated requests to protected endpoints return 401.
Stubs: pass until Wave 2 (Plan 02-03) ships require_role() dependency.
"""
import pytest


@pytest.mark.asyncio
async def test_unauthenticated_returns_401():
    """GET /admin/users without Authorization header returns 401."""
    pytest.skip("Stub — requires Plan 02-03 require_role() dependency and Plan 02-04 admin router")
