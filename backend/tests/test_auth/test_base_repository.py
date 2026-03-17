"""AUTH-08/09: BaseRepository barangay isolation filter.
Stubs: pass until Wave 2 (Plan 02-03) ships BaseRepository.
"""
import pytest


def test_isolation_filter():
    """BaseRepository._isolation_filter() adds WHERE health_station_id = user.health_station_id for nurse."""
    pytest.skip("Stub — requires Plan 02-03 BaseRepository class")


def test_cross_bhs_bypass():
    """BaseRepository._isolation_filter() skips WHERE clause for city_health_officer."""
    pytest.skip("Stub — requires Plan 02-03 BaseRepository class")


def test_cho_cross_bhs():
    """CHO user (health_station_id=None) in CROSS_BHS_ROLES sees all BHS data — no isolation filter applied."""
    pytest.skip("Stub — requires Plan 02-03 BaseRepository class")
