"""AUTH-02: Refresh token rotation — old token invalidated, new pair issued.
Stubs: pass until Wave 2 (Plan 02-03) ships POST /auth/refresh.
"""
import pytest


@pytest.mark.asyncio
async def test_refresh_rotates_token():
    """POST /auth/refresh issues new token pair and revokes the old refresh token."""
    pytest.skip("Stub — requires Plan 02-03 POST /auth/refresh endpoint")


@pytest.mark.asyncio
async def test_revoked_token():
    """POST /auth/refresh with an already-revoked token returns 401."""
    pytest.skip("Stub — requires Plan 02-03 POST /auth/refresh endpoint")
