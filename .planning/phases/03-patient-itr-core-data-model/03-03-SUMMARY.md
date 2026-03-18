---
phase: 03-patient-itr-core-data-model
plan: 03
subsystem: ui
tags: [react, typescript, shadcn, patient-search, pagination, debounce, rbac]

# Dependency graph
requires:
  - phase: 03-patient-itr-core-data-model
    plan: 01
    provides: "Backend Pydantic schemas (PatientListItem, PatientResponse, PatientSearchResponse, ConsultationResponse, DuplicateCheckResult)"
  - phase: 03-patient-itr-core-data-model
    plan: 02
    provides: "6 REST endpoints: GET/POST /patients, GET /patients/:id, GET /patients/check-duplicate, POST/GET /patients/:id/consultations"
  - phase: 02
    provides: "axios client, useAuth hook, ProtectedRoute, AppShell, app-sidebar, CROSS_BHS_ROLES pattern"
provides:
  - "TypeScript types for all patient + consultation API contracts (types.ts)"
  - "API client functions for all 6 patient endpoints (api.ts)"
  - "PatientsPage: search, debounce, city-wide toggle, sortable table, pagination, skeleton, empty states"
  - "Sidebar Patients nav item for 6 clinical roles (excludes bhw, system_admin)"
  - "Route /patients with ProtectedRoute RBAC, AppShell page title"
affects:
  - "03-04 (RegisterPatientPage uses registerPatient, checkDuplicate from api.ts)"
  - "03-05 (PatientDetailPage uses getPatient, listConsultations, createConsultation)"
  - "03-06 and beyond (all clinical program pages follow same pattern)"

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "SortIcon extracted outside page component to satisfy react-hooks/static-components lint rule"
    - "Async fetch in useEffect using inner async function + cancellation flag (not useCallback)"
    - "Page reset on query/filter change via event handler (not separate useEffect) to avoid setState-in-effect lint errors"
    - "City-wide toggle hidden for CROSS_BHS_ROLES users who always see all BHS"
    - "BHS column shown only when cityWide or isCrossBhsUser is true"

key-files:
  created:
    - frontend/src/features/patients/types.ts
    - frontend/src/features/patients/api.ts
    - frontend/src/pages/patients/PatientsPage.tsx
  modified:
    - frontend/src/components/app-sidebar.tsx
    - frontend/src/App.tsx
    - frontend/src/layouts/AppShell.tsx

key-decisions:
  - "SortIcon declared outside PatientsPage with explicit props — avoids react-hooks/static-components lint error for components created during render"
  - "setIsLoading moved inside async run() fn inside useEffect — synchronous setState in effect body triggers react-hooks/set-state-in-effect lint error"
  - "Page reset on search/filter change handled in event handler (handleQueryChange, handleCityWideChange) not a separate useEffect"
  - "CROSS_BHS_ROLES defined as const array at module level — same pattern as backend CROSS_BHS_ROLES frozenset"

patterns-established:
  - "Feature module pattern: features/{domain}/types.ts + api.ts — types first, api imports types"
  - "Async useEffect with cancellation flag: let cancelled = false; async run(); return () => { cancelled = true }"
  - "Table SortIcon: external component taking field/sortField/sortDirection props"

requirements-completed: [P3-04, P3-08]

# Metrics
duration: 5min
completed: 2026-03-18
---

# Phase 3 Plan 03: Patient Frontend — Types, API Client, and Search Page Summary

**TypeScript types matching all backend Pydantic schemas, 6-function axios API client, and a searchable/sortable/paginated PatientsPage with debounced search, city-wide toggle, loading skeleton, and empty states wired into sidebar + routing**

## Performance

- **Duration:** 5 min
- **Started:** 2026-03-18T10:21:57Z
- **Completed:** 2026-03-18T10:26:57Z
- **Tasks:** 2
- **Files modified:** 6

## Accomplishments

- Complete TypeScript type coverage for patient and consultation API contracts — all fields match Pydantic schemas with correct union types (`sex: "male" | "female"`, `bmi: number | null`)
- 6 API functions covering every patient endpoint with proper snake_case parameter mapping (`city_wide`, `page_size`)
- PatientsPage with 300ms debounced search, city-wide BHS toggle (hidden for CHO/DSO/PHIS roles), sortable 5-column table, 20-row pagination, 5-row skeleton loading state, and two empty states per UI-SPEC copywriting contract

## Task Commits

Each task was committed atomically:

1. **Task 1: Create patient TypeScript types and API client** - `df95b3a` (feat)
2. **Task 2: Create PatientsPage with search, table, pagination, and wire routing + sidebar** - `060f9b1` (feat)

## Files Created/Modified

- `frontend/src/features/patients/types.ts` — PatientListItem, PatientResponse, PatientCreateRequest, DuplicateCheckResult, ConsultationResponse, ConsultationCreateRequest, PaginatedResponse generic
- `frontend/src/features/patients/api.ts` — searchPatients, getPatient, registerPatient, checkDuplicate, createConsultation, listConsultations
- `frontend/src/pages/patients/PatientsPage.tsx` — Full patient search page with debounce, city-wide toggle, sortable table, pagination, skeleton, empty states, error toast
- `frontend/src/components/app-sidebar.tsx` — Added Patients nav item (ClipboardList icon, 6 clinical roles, no bhw/system_admin)
- `frontend/src/App.tsx` — Added /patients route under ProtectedRoute for 6 clinical roles
- `frontend/src/layouts/AppShell.tsx` — Added "/patients": "Patients" to PAGE_TITLES

## Decisions Made

- `SortIcon` component extracted to module scope outside `PatientsPage` — the `react-hooks/static-components` ESLint rule flags components defined inside render; passing `sortField`/`sortDirection` as props is the correct fix
- `setIsLoading(true)` moved inside the async `run()` function in the useEffect body — calling setState synchronously in the effect top-level triggers `react-hooks/set-state-in-effect`; the async pattern resolves this without changing behavior
- Page reset on query/filter change implemented in event handlers (`handleQueryChange`, `handleCityWideChange`) instead of a separate `useEffect(() => { setPage(1) }, [query])` — avoids cascading setState-in-effect lint errors
- `CROSS_BHS_ROLES` defined as `as const` array at module level — mirrors the backend's `CROSS_BHS_ROLES` frozenset pattern established in Plan 02-03a

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed 7 ESLint errors blocking lint pass**
- **Found during:** Task 2 (PatientsPage)
- **Issue:** Three categories of violations in initial PatientsPage implementation: (1) `SortIcon` component defined inside render body — `react-hooks/static-components` error; (2) synchronous `setPage(1)` and `setIsLoading(true)` calls in useEffect bodies — `react-hooks/set-state-in-effect` errors; original design had separate `useEffect` for cityWide page reset and async fetch with `setIsLoading(true)` at top
- **Fix:** Extracted `SortIcon` outside the component with explicit props; restructured fetch to use inner `async run()` function inside useEffect; merged page resets into event handlers
- **Files modified:** `frontend/src/pages/patients/PatientsPage.tsx`
- **Verification:** `npm run lint` exits 0 with no warnings
- **Committed in:** `060f9b1` (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (Rule 1 — bug fix, lint compliance)
**Impact on plan:** Required lint fixes to meet the acceptance criteria `npx tsc --noEmit exits 0` and implicit `npm run lint` passes requirement. No scope creep; final component behavior is identical to spec.

## Issues Encountered

None beyond the lint violations documented above.

## User Setup Required

None — no external service configuration required.

## Next Phase Readiness

- Plan 04 can now build RegisterPatientPage importing `registerPatient`, `checkDuplicate` from `api.ts` and `PatientCreateRequest`, `DuplicateCheckResult` from `types.ts`
- Plan 05 can build PatientDetailPage importing `getPatient`, `listConsultations`, `createConsultation`
- Route `/patients/new` and `/patients/:id` are left as comments in App.tsx pending Plans 04 and 05

---
*Phase: 03-patient-itr-core-data-model*
*Completed: 2026-03-18*
