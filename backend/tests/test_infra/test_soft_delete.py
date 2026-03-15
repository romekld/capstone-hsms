import pytest


@pytest.mark.asyncio
async def test_soft_delete_filter(async_session):
    """INFRA-02: do_orm_execute hook excludes deleted records from SELECT."""
    pytest.importorskip("app.core.base")
    # Placeholder — full implementation requires a concrete model (Plan 02)
    pytest.skip("Requires concrete ORM model — implemented in Plan 02")
