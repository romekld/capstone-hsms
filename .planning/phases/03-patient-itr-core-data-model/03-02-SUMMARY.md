---
phase: 03-patient-itr-core-data-model
plan: 02
subsystem: api
tags: [fastapi, sqlalchemy, pydantic, tsvector, gin, rbac, bhs-isolation, audit-logs]

# Dependency graph
requires:
  - phase: 03-01
    provides: Patient + Consultation ORM models, Alembic migration 0004, Pydantic schemas (PatientCreate, PatientResponse, PatientListItem, DuplicateCheckResult, PatientSearchResponse, ConsultationCreate, ConsultationResponse)
  - phase: 02-01
    provides: BaseRepository with _isolation_filter, CROSS_BHS_ROLES, require_role() dependency factory, AsyncDB + CurrentUser type aliases
provides:
  - PatientRepository with tsvector GIN search (simple config, prefix tokens), city-wide check_duplicate, BHS isolation toggle
  - ConsultationRepository with paginated list_for_patient (selectinload for recorded_by_user), create
  - PatientService orchestrating registration, duplicate detection (409), audit logging, BHS-level write protection
  - 6 FastAPI endpoints: GET+POST /api/patients, GET /api/patients/check-duplicate, GET /api/patients/:id, POST+GET /api/patients/:id/consultations
  - RBAC enforced per-endpoint: nurse/midwife write, all clinical roles read, nurse/midwife/physician consult write, BHW blocked
affects: [03-03-patient-itr-frontend, 03-04-search-ui, 03-05-consultation-ui, all clinical program phases 04-09]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Service instantiation per-request: PatientService(db, current_user) in each endpoint handler"
    - "require_role() passed directly to endpoint parameter (already returns Depends) — no double-wrapping"
    - "health_station_id auto-set from current_user in service layer, never accepted from request body"
    - "City-wide duplicate check always bypasses _isolation_filter; BHS-level write enforced in service, not repo"
    - "selectinload for user join in ConsultationRepository.list_for_patient — avoids N+1 for recorded_by_name"
    - "/check-duplicate route registered before /{patient_id} — FastAPI matches first"

key-files:
  created:
    - backend/app/repositories/patient.py
    - backend/app/repositories/consultation.py
    - backend/app/services/patient.py
    - backend/app/routers/patient.py
  modified:
    - backend/app/main.py

key-decisions:
  - "require_role() already returns Depends(_guard) — pass directly to endpoint _ parameter, not wrapped in Depends() again (existing project pattern per admin router)"
  - "search() joins Patient.health_station in the base query so health_station.name is available on result rows without a second query"
  - "check_duplicate() always city-wide (no isolation filter) — prevents duplicate patients across BHS boundaries"
  - "force_duplicate=True sets possible_duplicate=True on new patient and adds duplicate_override flag to audit log"
  - "Cross-BHS consultation creation blocked at service layer (403) — city-wide search is read-only per design spec"

patterns-established:
  - "PATIENT_READ_ROLES / PATIENT_WRITE_ROLES / CONSULTATION_WRITE_ROLES defined in service module, imported by router — single source of truth for RBAC lists"
  - "PatientService._write_audit uses gen_random_uuid() for record_id — audit_logs.record_id is UUID, patient.id is INTEGER; store patient PK in new_values JSONB"

requirements-completed: [P3-03, P3-04, P3-08, P3-09, P3-10]

# Metrics
duration: 5min
completed: 2026-03-18
---

# Phase 3 Plan 02: Patient API Layer Summary

**FastAPI patient management API with tsvector search, city-wide duplicate detection, BHS-isolation, and RBAC-gated endpoints for registration and consultations**

## Performance

- **Duration:** ~5 min
- **Started:** 2026-03-18T10:13:00Z
- **Completed:** 2026-03-18T10:18:00Z
- **Tasks:** 2
- **Files modified:** 5

## Accomplishments

- PatientRepository with GIN tsvector search using 'simple' config + :* prefix tokens, city-wide duplicate check, BHS isolation toggle, and select-with-relations for eager loading
- ConsultationRepository with paginated list_for_patient (selectinload on recorded_by_user eliminates N+1 for recorded_by_name) and create
- PatientService orchestrating registration with 409 duplicate detection, force_duplicate override with audit log, BHS-level write protection on consultations (403 cross-BHS)
- 6 RBAC-gated FastAPI endpoints registered under /api/patients with correct route ordering (/check-duplicate before /{patient_id})

## Task Commits

Each task was committed atomically:

1. **Task 1: PatientRepository, ConsultationRepository, PatientService** - `1cc88b5` (feat)
2. **Task 2: Patient router + main.py wiring** - `7af1372` (feat)

**Plan metadata:** (to follow)

## Files Created/Modified

- `backend/app/repositories/patient.py` — PatientRepository: tsvector GIN search with sanitization, check_duplicate (city-wide), get_by_id/get_by_id_with_relations, create
- `backend/app/repositories/consultation.py` — ConsultationRepository: list_for_patient with selectinload(recorded_by_user), create
- `backend/app/services/patient.py` — PatientService: search, check_duplicate, register_patient (409 + audit), get_patient, create_consultation (403 cross-BHS), list_consultations, _write_audit
- `backend/app/routers/patient.py` — 6 FastAPI endpoints with RBAC enforced per-endpoint
- `backend/app/main.py` — Added patient_router include

## Decisions Made

- `require_role()` already returns `Depends(_guard)` — pass directly to `_=require_role(...)` without double-wrapping in `Depends()`. This matches the existing admin router pattern and the STATE.md decision [Plan 02-04].
- `search()` joins `Patient.health_station` in the base query so `health_station.name` is available on result rows without a secondary N+1 query.
- `check_duplicate()` always bypasses `_isolation_filter` (city-wide) — duplicate detection must cross BHS boundaries.
- Route ordering: `/check-duplicate` registered before `/{patient_id}` — FastAPI routes match first-wins; integer path param would swallow the literal path segment.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Removed double-wrapping of require_role() in Depends()**
- **Found during:** Task 2 verification (docker-compose exec backend python import test)
- **Issue:** Plan spec showed `_=Depends(require_role(...))` but `require_role()` already returns `Depends(_guard)`. FastAPI raised `TypeError: Depends(_guard) is not a callable object` because `Depends(Depends(...))` is invalid.
- **Fix:** Changed all 6 endpoint RBAC guards to `_=require_role(...)` (no outer `Depends()`). Also removed now-unused `Depends` from the import line.
- **Files modified:** `backend/app/routers/patient.py`
- **Verification:** `docker-compose exec backend python -c "from app.main import app; ..."` imports cleanly; all 6 routes verified present.
- **Committed in:** `7af1372` (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (Rule 1 - Bug)
**Impact on plan:** The fix was necessary for correctness; the `require_role()` pattern was already established in STATE.md [Plan 02-04]. No scope creep.

## Issues Encountered

None beyond the auto-fixed deviation above.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- All 6 patient management endpoints available for frontend consumption (Plans 03-03 through 03-05)
- RBAC and BHS isolation enforced — safe for city-wide deployment
- Wave 0 test stubs in tests/test_patients/ are ready to be filled in with real tests (Plans 03-03+)
- Plans 04 (maternal/child) and 05 (TB/NCD) can reference PatientRepository pattern for their own clinical repositories

---
*Phase: 03-patient-itr-core-data-model*
*Completed: 2026-03-18*

## Self-Check: PASSED

- FOUND: backend/app/repositories/patient.py
- FOUND: backend/app/repositories/consultation.py
- FOUND: backend/app/services/patient.py
- FOUND: backend/app/routers/patient.py
- FOUND: backend/app/main.py (modified)
- FOUND: .planning/phases/03-patient-itr-core-data-model/03-02-SUMMARY.md
- FOUND commit: 1cc88b5 (Task 1)
- FOUND commit: 7af1372 (Task 2)
