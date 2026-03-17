"""AUTH-01: Login flow — email/password → access+refresh token pair.
Stubs: pass until Wave 2 (Plan 02-03) ships POST /auth/login.
"""
import pytest
from httpx import ASGITransport, AsyncClient
from app.main import app


@pytest.mark.asyncio
async def test_login_success():
    """POST /auth/login with valid credentials returns 200 + access_token + refresh_token."""
    pytest.skip("Stub — requires Plan 02-03 POST /auth/login endpoint")


@pytest.mark.asyncio
async def test_wrong_password():
    """POST /auth/login with wrong password returns 401."""
    pytest.skip("Stub — requires Plan 02-03 POST /auth/login endpoint")


@pytest.mark.asyncio
async def test_inactive_user():
    """POST /auth/login with inactive user (is_active=False) returns 401."""
    pytest.skip("Stub — requires Plan 02-03 POST /auth/login endpoint")
