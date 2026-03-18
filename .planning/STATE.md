---
gsd_state_version: 1.0
milestone: v1.0
milestone_name: milestone
status: executing
stopped_at: Completed 04.1-mch-shared-data-model-01-PLAN.md
last_updated: "2026-03-18T23:26:02.016Z"
last_activity: 2026-03-18 — Phase 3 Plan 02 complete (PatientRepository, ConsultationRepository, PatientService, patient router, 6 API endpoints)
progress:
  total_phases: 10
  completed_phases: 0
  total_plans: 2
  completed_plans: 1
  percent: 82
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-03-18)

**Core value:** City Health Officer and DSO can detect a Category I disease outbreak and respond within the RA 11332 24-hour window
**Current focus:** Planning v3 Clinical Core — start with Phase 3 (Patient ITR + Core Data Model)

## Current Position

Phase: 3 of 9 (Patient ITR + Core Data Model)
Plan: 2 of 7 — complete
Status: Executing — next plan: 03-03-PLAN.md
Last activity: 2026-03-18 — Phase 3 Plan 02 complete (PatientRepository, ConsultationRepository, PatientService, patient router, 6 API endpoints)

Progress: [████████░░] 82% (Phase 3, Plan 2/7)

## Performance Metrics

**Velocity:**
- Total plans completed: 1
- Average duration: ~20 min
- Total execution time: 0.33 hours

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| Phase 02 | 3 | ~29 min | ~10 min |

**Recent Trend:**
- Last 5 plans: 02-01 (~20 min), 02-02 (~2 min), 02-03a (~7 min)
- Trend: -

*Updated after each plan completion*
| Phase 03 P01 | 5min | 3 tasks | 17 files |
| Phase 01 P01 | 3 | 3 tasks | 17 files |
| Phase 02 P01 | 20min | 3 tasks | 9 files |
| Phase 02 P02 | 2min | 3 tasks | 8 files |
| Phase 02 P03a | 7min | 2 tasks | 10 files |
| Phase 02 P03b | 3 | 2 tasks | 10 files |
| Phase 02 P04 | 25min | 2 tasks | 9 files |
| Phase 02 P05 | 13 | 2 tasks | 55 files |
| Phase 02 P05b | 7min | 3 tasks | 10 files |
| Phase 02 P06 | 3 | 2 tasks | 3 files |
| Phase 02 P06 | 3min | 2 tasks | 3 files |
| Phase 02 P07 | 45min | 3 tasks | 6 files |
| Phase 03-patient-itr-core-data-model P02 | 5min | 2 tasks | 5 files |
| Phase 03-patient-itr-core-data-model P03 | 5min | 2 tasks | 6 files |
| Phase 03-patient-itr-core-data-model P04 | 10min | 1 tasks | 3 files |
| Phase 03-patient-itr-core-data-model P05 | 5min | 1 tasks | 4 files |
| Phase 04.1-mch-shared-data-model P01 | 3min | 2 tasks | 5 files |

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- [Roadmap]: 9-phase build order — infrastructure, then auth/RBAC, then patient ITR, then clinical programs (maternal/child, TB/NCD), then surveillance, GIS, ML/FHSIS, and offline/inventory last
- [Roadmap]: Separated infrastructure (Phase 1) from auth/RBAC (Phase 2) and patient ITR (Phase 3) for focused execution — previously combined in one mega-phase
- [Roadmap]: Research recommends replacing python-jose with PyJWT (abandoned, CVEs) — resolve during Phase 2 planning
- [Roadmap]: Phase 4 and 5 can execute in parallel after Phase 3 (both depend on ITR, not on each other) — but sequential is safer for a solo build
- [Phase 01]: Single docker-compose.yml — no base+override split; simplifies solo dev workflow (locked in CONTEXT.md)
- [Phase 01]: WebSocket nginx location pre-wired in Phase 1 to avoid nginx rebuild when Phase 6 adds real-time alerts
- [Phase 01]: conftest.py HAS_BASE import guard — pytest collects cleanly before Plan 02 ships app.core.base
- [Plan 01-02]: do_orm_execute registered on Session (not AsyncSession) — async sessions wrap sync sessions, event fires correctly per SQLAlchemy 2.0 docs
- [Plan 01-02]: audit_logs table uses BIGSERIAL PK + raw op.execute() SQL — JSONB and BIGSERIAL simpler in raw DDL
- [Plan 01-02]: downgrade() does NOT drop PostGIS extension — dropping it would break other spatial tables
- [Plan 01-02]: alembic.ini has placeholder URL; runtime reads DATABASE_URL from os.environ["DATABASE_URL"] in env.py
- [Plan 01-03]: BHS station coordinates derived from barangay polygon centroids (shapely centroid) — spatially accurate, within Philippines range; real GPS can be updated by developer
- [Plan 01-03]: decode(:boundary, 'hex') required because wkb.desc returns hex string; ST_GeomFromEWKB expects binary input
- [Plan 01-03]: Point(lng, lat) axis order follows GeoJSON/WGS-84 convention (longitude first)
- [Plan 02-01]: Replaced python-jose (abandoned, CVEs) with PyJWT 2.12 + pwdlib[argon2] — active maintenance, no cryptography dependency
- [Plan 02-01]: User model uses is_active Boolean instead of SoftDeleteMixin — deactivation is not deletion; admin tools need to query inactive users
- [Plan 02-01]: Refresh tokens stored as SHA-256 hash in user_sessions — DB breach cannot yield valid tokens
- [Plan 02-01]: JWT sub field is str(user_id) — RFC 7519 requires string subject; callers cast back to int
- [Plan 02-01]: roles column is PostgreSQL ARRAY(TEXT) — avoids JOIN table for RBAC checks, supports array containment operators
- [Plan 02-02]: pytest.skip() chosen over pytest.mark.xfail for stubs — skip is explicit declared intent; xfail implies expected failure that might accidentally pass
- [Plan 02-02]: test_base_repository.py uses synchronous def (not async def) — BaseRepository unit tests exercise pure Python logic without HTTP/DB context
- [Plan 02-03a]: UserRepository does NOT inherit BaseRepository — user management is cross-BHS; admin sees all users regardless of BHS assignment
- [Plan 02-03a]: CROSS_BHS_ROLES is a named frozenset constant at module level — downstream Phase 3-9 repos import it rather than duplicate the set
- [Plan 02-03a]: get_current_user builds UserSchema from JWT payload only (sub, roles, health_station_id); email/full_name are empty strings — full DB fetch only when admin operations need them
- [Plan 02-03a]: HTTPBearer(auto_error=False) ensures missing Authorization header returns 401, not FastAPI's default 403
- [Plan 02-03a]: require_role() returns Depends(_guard) — the Depends() wrapping lets FastAPI inject CurrentUser into the guard automatically, making RBAC declarative at the router layer
- [Phase 02]: Admin router stub (GET/POST /admin/users) created in 02-03b to unblock RBAC and auth-guard tests — full implementation deferred to Plan 02-04
- [Plan 02-04]: require_role() returns Depends(_guard) — passed directly to router-level dependencies, not double-wrapped in Depends()
- [Plan 02-04]: conftest overrides get_async_session per test so ASGITransport tests use test DB — prevents main DB contamination
- [Plan 02-04]: audit_logs created in conftest with append-only RULEs — test DB has same append-only constraints as production
- [Phase 02-05]: Removed embedded .git from frontend/ — npm create vite inits a git repo; deleted before staging in parent repo
- [Phase 02-05]: .npmrc legacy-peer-deps=true committed in frontend/ — @tailwindcss/vite@4.2.1 peer requires vite^5/6/7, project uses vite@8; resolves without downgrading
- [Phase 02-05]: globals.css at src/styles/globals.css (not src/index.css) per plan spec; components.json CSS path updated accordingly
- [Phase 02-05]: shadcn base-nova style with OKLCH tokens; globals.css overwrites preset with UI-SPEC CHO 2 brand palette including --status-*, --bhs-tier, --cho-tier
- [Phase 02-05b]: SidebarMenuButton uses base-ui render prop (not asChild) — shadcn installation uses @base-ui/react, not Radix
- [Phase 02-05b]: Axios RetryableConfig extends InternalAxiosRequestConfig with _retry flag — avoids TypeScript strict mode casting errors
- [Phase 02-06]: Post-login navigation via useEffect watching user state — navigate() NOT called in handleSubmit success path to avoid stale state after setState
- [Phase 02-06]: AuthError discriminated union (wrong_credentials | inactive | server_error) enables typed error rendering
- [Phase 02]: Post-login navigation via useEffect watching user state — navigate() NOT called in handleSubmit success path to avoid reading stale state after setState
- [Phase 02]: AuthError discriminated union (wrong_credentials | inactive | server_error) enables typed error rendering without runtime string comparisons
- [Phase 02]: ROLE_LABELS map at module level (not inside component) — stable reference, no re-creation on render
- [Phase 02]: [Plan 02-07]: HEALTH_STATIONS hardcoded as local constant (32 BHS names, IDs 1-32) — GIS API not yet built; Phase 7 executor should replace with GET /api/gis/health-stations
- [Phase 02]: [Plan 02-07]: ActivityLogPage.tsx re-exports UsersPage — activity log is an embedded tab; file exists for App.tsx route completeness only
- [Plan 03-01]: Patient sex column uses TEXT + CHECK constraint (not PostgreSQL ENUM) — ENUM is immutable; TEXT + CHECK can be extended without ALTER TYPE
- [Plan 03-01]: GIN index on search_vector created via raw SQL in migration — Alembic autogenerate cannot reflect expression-based indexes (GitHub issue #1390)
- [Plan 03-01]: tsvector uses 'simple' config — Filipino names must not be stemmed ('english' config would corrupt "dela Cruz", "Santos")
- [Plan 03-01]: BMI is Pydantic computed_field on ConsultationResponse, never stored — eliminates stale data risk when vitals are updated
- [Plan 03-01]: health_station_id excluded from PatientCreate request body — auto-set from current_user.health_station_id in service layer to prevent cross-BHS registration
- [Phase 03-patient-itr-core-data-model]: require_role() already returns Depends(_guard) — pass directly to endpoint _ parameter without double-wrapping in Depends() (established in Plan 02-04, confirmed in Plan 03-02)
- [Phase 03-patient-itr-core-data-model]: PATIENT_READ_ROLES / PATIENT_WRITE_ROLES / CONSULTATION_WRITE_ROLES defined in service module and imported by router — single source of truth for RBAC role lists
- [Phase 03-patient-itr-core-data-model]: /check-duplicate route registered before /{patient_id} — FastAPI first-wins matching; literal path segment must precede integer path param
- [Phase 03-patient-itr-core-data-model]: SortIcon extracted outside PatientsPage with explicit props — avoids react-hooks/static-components lint error for components created during render
- [Phase 03-patient-itr-core-data-model]: Async useEffect uses inner async run() function — synchronous setState in effect body triggers react-hooks/set-state-in-effect lint error; page reset handled in event handlers
- [Phase 03-patient-itr-core-data-model]: handleRegisterAnyway uses explicit force_duplicate: true — not a parameterized shared submit path
- [Phase 03-patient-itr-core-data-model]: BARANGAY_OPTIONS hardcoded from cho2-boundaries.geojson fixture — same pattern as HEALTH_STATIONS in admin; Phase 7 can replace with GIS API fetch
- [Phase 03-05]: Sheet side panel used for Add Consultation per CONTEXT.md locked decision (not a dedicated page)
- [Phase 03-05]: AppShell resolvePageTitle added to handle dynamic /patients/:id pathname matching
- [Phase 04.1-mch-shared-data-model]: EpiVaccination.vaccine uses TEXT not ENUM — avoids migration churn if DOH adds vaccines; validated at Pydantic layer
- [Phase 04.1-mch-shared-data-model]: PostpartumEnrollment.prenatal_enrollment_id nullable (ON DELETE SET NULL) — external facility deliveries may have no prenatal record
- [Phase 04.1-mch-shared-data-model]: Visit tables have no health_station_id; BHS isolation via JOIN through enrollment — avoids denormalization across 4 extra tables

### Pending Todos

None yet.

### Quick Tasks Completed

| # | Description | Date | Commit | Directory |
|---|-------------|------|--------|-----------|
| 260318-ao6 | the current create user component is modal. can we redesign it into a new dedicated section and not a modal one? and redesign the form fields into more userfriendly and intuitive. use existing shadcn components or blocks for forms. | 2026-03-17 | 33dfed3 | [260318-ao6-the-current-create-user-component-is-mod](./quick/260318-ao6-the-current-create-user-component-is-mod/) |
| 260318-eh1 | Full redesign: replace Sheet create flow with dedicated /admin/users/new full-page form; modular UserFormSections (Identity, Credentials, Roles, BHS) | 2026-03-18 | 045c954 | [260318-eh1-full-redesign-admin-user-management-page](./quick/260318-eh1-full-redesign-admin-user-management-page/) |
| 260318-ew3 | Replace edit-user Sheet/drawer with dedicated /admin/users/:id/edit full-page form; adds getUser API fn, pre-populates all fields, read-only email display | 2026-03-18 | 076bee2 | [260318-ew3-replace-edit-user-sheet-with-dedicated-a](./quick/260318-ew3-replace-edit-user-sheet-with-dedicated-a/) |

### Blockers/Concerns

- [Phase 1]: Open questions in PROJECT.md (vitals column design, enum vs TEXT decisions, psgc_code naming) must be resolved during planning
- [Phase 1]: Prophet Docker build should be tested early even though Prophet is used in Phase 8 — research flags compatibility uncertainty
- [Phase 8]: DOH DM 2024-0007 FHSIS indicator formulas need physical/verified source — online docs are Scribd scans
- [Phase 9]: BHW device landscape unknown — Safari eviction mitigation may or may not be needed

## Session Continuity

Last session: 2026-03-18T23:26:02.007Z
Stopped at: Completed 04.1-mch-shared-data-model-01-PLAN.md
Resume file: None
