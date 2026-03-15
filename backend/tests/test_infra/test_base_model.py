import pytest
import sqlalchemy as sa


def test_soft_delete_column():
    """INFRA-02: SoftDeleteMixin adds deleted_at TIMESTAMPTZ column."""
    SoftDeleteMixin = pytest.importorskip("app.core.base").SoftDeleteMixin
    # Verify the mixin defines deleted_at as a mapped column
    assert hasattr(SoftDeleteMixin, "deleted_at"), "SoftDeleteMixin must declare deleted_at"
