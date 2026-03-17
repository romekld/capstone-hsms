"""AUTH-03/05/10: RBAC role guards — require_role() enforcement.
Stubs: pass until Wave 2 (Plan 02-03) ships require_role() and CurrentUser dependencies.
"""
import pytest


@pytest.mark.asyncio
async def test_role_guard():
    """require_role(["nurse"]) blocks a BHW user with HTTP 403."""
    pytest.skip("Stub — requires Plan 02-03 require_role() dependency")


@pytest.mark.asyncio
async def test_dual_role():
    """User with roles=['nurse','disease_surveillance_officer'] passes both nurse and DSO route guards."""
    pytest.skip("Stub — requires Plan 02-03 require_role() dependency")


@pytest.mark.asyncio
async def test_dso_write_blocked():
    """DSO is NOT in allowed roles for non-PIDSR write endpoints; gets 403 on POST /patients (Phase 3)."""
    pytest.skip("Stub — requires Plan 02-03 require_role() and Plan 02-04 admin router")
