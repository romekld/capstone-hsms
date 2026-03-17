---
milestone: v2
audited: 2026-03-18T00:00:00Z
status: gaps_found
scores:
  requirements: 13/14
  phases: 1/2
  integration: pending
  flows: pending
gaps:
  requirements:
    - id: "INFRA-04"
      status: "unsatisfied"
      phase: "01-infrastructure-devops"
      claimed_by_plans: ["01-03-PLAN.md"]
      completed_by_plans: ["01-03-SUMMARY.md"]
      verification_status: "gaps_found"
      evidence: "0002_seed_gis_data.py uses path '../../gis-data/cho2-boundaries.geojson' which resolves to /app/gis-data/ inside the Docker container. gis-data/ is at the repo root and not mounted into the backend service. FileNotFoundError will occur at 'alembic upgrade head'. The SUMMARY claims INFRA-04 complete but the VERIFICATION blocks it as a path bug that prevents seeding at runtime."
  integration: []
  flows: []
tech_debt:
  - phase: 02-authentication-rbac-user-management
    items:
      - "Inconsistency: AdminService._VALID_ROLES includes 'midwife' as a standalone role (8 entries) while REQUIREMENTS.md AUTH-03 and frontend ROLE_OPTIONS treat nurse/midwife as a single combined role slot (7 roles). Frontend cannot create a user with midwife role only."
      - "AUTH-10 partial at phase boundary: DSO cross-BHS read access established via CROSS_BHS_ROLES, but PIDSR CRUD route gating deferred to Phase 3+ (PIDSR router not yet built). Infrastructure foundation is correct."
  - phase: 01-infrastructure-devops
    items:
      - "Truth 1 (docker-compose up) and Truth 3 (audit_logs runtime) require human Docker runtime verification — Docker Desktop was not running during execution."
nyquist:
  compliant_phases: []
  partial_phases: ["01-infrastructure-devops", "02-authentication-rbac-user-management"]
  missing_phases: []
  overall: partial
---

# Milestone v2 — Audit Report

**Milestone:** v2 (Phases 1–2)
**Audited:** 2026-03-18
**Status:** gaps_found
**Score:** 13/14 requirements satisfied

---

## Milestone Scope

| Phase | Name | Goal | Status |
|-------|------|------|--------|
| Phase 1 | Infrastructure + DevOps | Docker stack, PostGIS, SQLAlchemy base, Alembic | gaps_found |
| Phase 2 | Authentication + RBAC + User Management | JWT auth, 7-role RBAC, user management, audit logging | passed |

**Milestone Definition of Done (from ROADMAP.md):**
- Phase 1: Developer can run docker-compose up, all 6 services pass health checks, PostGIS seeded with 32 BHS boundaries, SQLAlchemy base patterns established, Alembic async migrations working
- Phase 2: User can log in/log out with JWT lifecycle, system_admin manages users, RBAC enforced at router layer, barangay isolation at repository layer, audit logging active

---

## Requirements Coverage (3-Source Cross-Reference)

### Phase 1 — Infrastructure + DevOps

| REQ-ID | VERIFICATION.md | SUMMARY Frontmatter | REQUIREMENTS.md | Final Status |
|--------|----------------|---------------------|-----------------|--------------|
| INFRA-01 | SATISFIED (runtime pending) | listed in 01-01-SUMMARY | `[x]` | **satisfied** (human runtime needed) |
| INFRA-02 | SATISFIED | listed in 01-02-SUMMARY | `[x]` | **satisfied** |
| INFRA-03 | SATISFIED (runtime pending) | listed in 01-02-SUMMARY | `[x]` | **satisfied** (human runtime needed) |
| INFRA-04 | BLOCKED (path bug) | listed in 01-03-SUMMARY | `[x]` | **unsatisfied** ← BLOCKER |

**Orphaned Requirements:** None.

**Notes:**
- INFRA-01 and INFRA-03 have `[x]` in REQUIREMENTS.md and appear in SUMMARY frontmatter, but the verifier flagged they need human Docker runtime confirmation. Not blockers — artifacts are correct; runtime is unconfirmed.
- INFRA-04: SUMMARY claims completion, REQUIREMENTS.md shows `[x]`, but VERIFICATION.md flags it BLOCKED. The 3-source matrix reveals a discrepancy: plan execution wrote the file but it contains a critical runtime path bug. **VERIFICATION.md is authoritative — status is unsatisfied.**

### Phase 2 — Authentication + RBAC + User Management

| REQ-ID | VERIFICATION.md | SUMMARY Frontmatter | REQUIREMENTS.md | Final Status |
|--------|----------------|---------------------|-----------------|--------------|
| AUTH-01 | SATISFIED | listed (multiple plans) | `[x]` | **satisfied** |
| AUTH-02 | SATISFIED | listed (multiple plans) | `[x]` | **satisfied** |
| AUTH-03 | SATISFIED | listed (multiple plans) | `[x]` | **satisfied** |
| AUTH-04 | SATISFIED | listed (02-02, 02-07) | `[x]` | **satisfied** |
| AUTH-05 | SATISFIED | listed (02-01, 02-02, 02-03a) | `[x]` | **satisfied** |
| AUTH-06 | SATISFIED | listed (02-02, 02-07) | `[x]` | **satisfied** |
| AUTH-07 | SATISFIED | listed (multiple plans) | `[x]` | **satisfied** |
| AUTH-08 | SATISFIED | listed (02-02, 02-03a) | `[x]` | **satisfied** |
| AUTH-09 | SATISFIED | listed (02-02, 02-03a) | `[x]` | **satisfied** |
| AUTH-10 | PARTIAL (phase boundary) | listed (02-02, 02-03a) | `[x]` | **partial** (tech debt — not a blocker) |

**Orphaned Requirements:** None.

**Notes:**
- AUTH-10 is flagged PARTIAL in VERIFICATION.md with explicit phase-boundary justification: DSO cross-BHS read access is established, PIDSR CRUD gating deferred to Phase 3+ when that router is built. This is not a blocker for milestone v2 — the foundation is correct and the deferral is intentional.

---

## Phase Verification Summary

| Phase | Status | Score | Critical Gaps | Tech Debt |
|-------|--------|-------|---------------|-----------|
| 01-infrastructure-devops | gaps_found | 3/4 truths | INFRA-04 path bug | Runtime human verification pending |
| 02-authentication-rbac-user-management | passed | 18/18 truths | None | midwife inconsistency, AUTH-10 deferral |

---

## Critical Gap Detail

### INFRA-04: GeoJSON Path Bug in Alembic Seed Migration

**File:** `backend/alembic/versions/0002_seed_gis_data.py`, line 35

**Symptom:** `alembic upgrade head` will raise `FileNotFoundError` at runtime.

**Root cause:** The path `../../gis-data/cho2-boundaries.geojson` resolves to `/app/gis-data/` inside the Docker container (backend volume mounts `./backend:/app`). The actual `gis-data/` directory is at the repo root and is not mounted into the container.

**Impact:** All 32 Dasmarinas City barangay boundary polygons will not be seeded. PostGIS will contain no spatial data. GIS-dependent phases (Phase 7: Disease Mapping) will have no base layer.

**Two valid fixes:**

**Option A — Volume mount (preferred for clean separation):**
1. Add `- ./gis-data:/gis-data:ro` to `backend` service volumes in `docker-compose.yml`
2. Change path to: `geojson_path = "/gis-data/cho2-boundaries.geojson"`

**Option B — Copy into fixtures (self-contained):**
1. Copy `gis-data/cho2-boundaries.geojson` → `backend/fixtures/cho2-boundaries.geojson`
2. Change path to: `os.path.join(os.path.dirname(__file__), "../../fixtures/cho2-boundaries.geojson")`

---

## Tech Debt

### Phase 2 — Authentication + RBAC

**1. midwife role inconsistency (minor)**
- `AdminService._VALID_ROLES` includes `"midwife"` as a standalone role (8 roles total)
- `REQUIREMENTS.md` AUTH-03 and frontend `ROLE_OPTIONS` treat `nurse`/`midwife` as one combined slot (7 roles)
- Impact: Admin API accepts `midwife`-only role assignments; frontend UI cannot create such users
- Fix: Either add `midwife` to `ROLE_OPTIONS` in `frontend/src/features/admin/types.ts` or remove it from `_VALID_ROLES` and accept `nurse` as the combined label

**2. AUTH-10 PIDSR CRUD deferral (expected)**
- DSO cross-BHS read access is in place via `CROSS_BHS_ROLES`
- PIDSR CRUD write endpoints will be gated in Phase 6 (Disease Surveillance) when the PIDSR router is built
- No action needed now — properly tracked at phase boundary

---

## Nyquist Compliance

| Phase | VALIDATION.md | nyquist_compliant | wave_0_complete | Action |
|-------|---------------|-------------------|-----------------|--------|
| 01-infrastructure-devops | exists | false | false | `/gsd:validate-phase 1` |
| 02-authentication-rbac-user-management | exists | false | false | `/gsd:validate-phase 2` |

Both VALIDATION.md files exist (created during planning) but remain in `draft` state with `nyquist_compliant: false`. Neither phase completed formal Nyquist wave validation. This means test coverage gaps may exist.

---

## Integration Check

*Integration checker running — results to be incorporated.*

**Pre-integration known wiring checks (from VERIFICATION.md artifacts):**

| Integration Point | Status | Details |
|------------------|--------|---------|
| Migration chain: 0002 → 0003 down_revision | VERIFIED | Phase 2 VERIFICATION.md confirms `down_revision="0002"` in 0003 migration |
| User.health_station_id FK → health_stations.id | VERIFIED | Phase 2 VERIFICATION confirms `ForeignKey("health_stations.id")` |
| AdminService._write_audit() → audit_logs | VERIFIED | Calls INSERT into audit_logs; table created in Phase 1 migration 0001 |
| BaseRepository._isolation_filter() → User.health_station_id | VERIFIED | Column exists in User model; _isolation_filter() correct |
| Frontend 401 interceptor → /auth/refresh (not /auth/login) | VERIFIED | Phase 2 VERIFICATION confirms login endpoint excluded from retry |
| nginx /api/ proxy → backend:8000 | VERIFIED | Phase 1 VERIFICATION confirms nginx.conf lines 5 and 13 |

---

## Human Verification Still Required

From Phase 1:
1. `docker-compose up -d --build` → all 6 services pass health checks
2. After INFRA-04 fix: `alembic upgrade head` completes without errors
3. `SELECT count(*) FROM barangays` returns 32
4. `pytest tests/test_infra/ -x -q` all pass (no spatial test skips)

From Phase 2:
1. Login flow end-to-end (browser: /login → /dashboard → sidebar visible)
2. Wrong credentials show inline error alert
3. system_admin checkbox disables other role checkboxes
4. Deactivation AlertDialog renders correctly
5. Activity Log tab shows real data with Asia/Manila timestamps
6. Sidebar logout clears tokens and redirects to /login

---

*Audit: 2026-03-18 — gsd-audit-milestone*
