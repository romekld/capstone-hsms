---
phase: 1
slug: infrastructure-devops
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-16
---

# Phase 1 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | pytest 8.x + pytest-asyncio 0.24.x |
| **Config file** | `backend/pytest.ini` — Wave 0 creates this |
| **Quick run command** | `docker-compose exec backend pytest tests/test_infra/ -x -q` |
| **Full suite command** | `docker-compose exec backend pytest -x -q` |
| **Estimated runtime** | ~30 seconds |

---

## Sampling Rate

- **After every task commit:** Run `docker-compose exec backend pytest tests/test_infra/ -x -q`
- **After every plan wave:** Run `docker-compose exec backend pytest -x -q`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 1-01-01 | 01 | 0 | INFRA-01 | smoke | `docker-compose ps` | ❌ Wave 0 | ⬜ pending |
| 1-01-02 | 01 | 0 | INFRA-01 | integration | `docker-compose exec backend pytest tests/test_infra/test_health.py -x` | ❌ Wave 0 | ⬜ pending |
| 1-02-01 | 02 | 0 | INFRA-02 | unit | `docker-compose exec backend pytest tests/test_infra/test_base_model.py::test_soft_delete_column -x` | ❌ Wave 0 | ⬜ pending |
| 1-02-02 | 02 | 0 | INFRA-02 | unit | `docker-compose exec backend pytest tests/test_infra/test_soft_delete.py -x` | ❌ Wave 0 | ⬜ pending |
| 1-03-01 | 03 | 1 | INFRA-03 | integration | `docker-compose exec backend pytest tests/test_infra/test_migrations.py::test_audit_logs_table -x` | ❌ Wave 0 | ⬜ pending |
| 1-03-02 | 03 | 1 | INFRA-03 | integration | `docker-compose exec backend pytest tests/test_infra/test_audit_logs.py::test_update_denied -x` | ❌ Wave 0 | ⬜ pending |
| 1-04-01 | 04 | 1 | INFRA-04 | integration | `docker-compose exec backend pytest tests/test_infra/test_spatial.py::test_barangay_seed_count -x` | ❌ Wave 0 | ⬜ pending |
| 1-04-02 | 04 | 1 | INFRA-04 | integration | `docker-compose exec backend pytest tests/test_infra/test_spatial.py::test_barangay_geojson -x` | ❌ Wave 0 | ⬜ pending |
| 1-04-03 | 04 | 1 | INFRA-04 | integration | `docker-compose exec backend pytest tests/test_infra/test_spatial.py::test_bhs_station_geojson -x` | ❌ Wave 0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `backend/pytest.ini` — configure `asyncio_mode = auto`, `testpaths = tests`
- [ ] `backend/tests/conftest.py` — async engine/session fixtures, test_hsms database
- [ ] `backend/tests/test_infra/__init__.py` — empty, makes it a package
- [ ] `backend/tests/test_infra/test_health.py` — stubs for INFRA-01 (health endpoint)
- [ ] `backend/tests/test_infra/test_base_model.py` — stubs for INFRA-02 (column presence)
- [ ] `backend/tests/test_infra/test_soft_delete.py` — stubs for INFRA-02 (filter behavior)
- [ ] `backend/tests/test_infra/test_migrations.py` — stubs for INFRA-03 (audit_logs table)
- [ ] `backend/tests/test_infra/test_audit_logs.py` — stubs for INFRA-03 (append-only)
- [ ] `backend/tests/test_infra/test_spatial.py` — stubs for INFRA-04 (barangay/BHS seed)
- [ ] pytest, pytest-asyncio, httpx, anyio in `backend/requirements.txt`
- [ ] `docker-entrypoint-initdb.d/01_create_test_db.sql` — `CREATE DATABASE test_hsms;`
- [ ] `backend/fixtures/bhs_stations.json` — stub with placeholder (TODO: full 32-station data)

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| All 6 Docker services show `healthy` status | INFRA-01 | Docker Compose health checks are process-external | Run `docker-compose up -d`, wait 30s, run `docker-compose ps` — verify all services show `(healthy)` |
| PostGIS extension exists in `test_hsms` database | INFRA-03 | Requires checking second database | `docker-compose exec db psql -U postgres -d test_hsms -c "SELECT extname FROM pg_extension WHERE extname = 'postgis';"` |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
