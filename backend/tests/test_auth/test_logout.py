"""AUTH-02: Logout — revokes user_sessions row server-side.
Stubs: pass until Wave 2 (Plan 02-03) ships POST /auth/logout.
"""
import pytest


@pytest.mark.asyncio
async def test_logout_revokes_session():
    """POST /auth/logout sets revoked_at on the user_sessions row; subsequent refresh fails."""
    pytest.skip("Stub — requires Plan 02-03 POST /auth/logout endpoint")
