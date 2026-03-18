---
phase: 03-patient-itr-core-data-model
plan: 04
subsystem: ui
tags: [react, typescript, shadcn-ui, patient-registration, duplicate-detection, base-ui]

requires:
  - phase: 03-patient-itr-core-data-model
    plan: 03
    provides: "checkDuplicate and registerPatient API functions in features/patients/api.ts; PatientCreateRequest and DuplicateCheckResult types"

provides:
  - "RegisterPatientPage component at /patients/new with 5-section form"
  - "Inline duplicate detection Alert with Use Existing Patient / Register Anyway actions"
  - "force_duplicate: true path with audit-log flag on override"
  - "BARANGAY_OPTIONS constant with exact PSGC codes from cho2-boundaries.geojson"
  - "Route /patients/new in App.tsx (placed before /patients/:id)"
  - "PAGE_TITLES['/patients/new'] in AppShell"

affects:
  - "Plan 05 (Patient Profile page) — shares /patients route block in App.tsx"
  - "Plan 07 onwards — any plan adding /patients/* routes must be inserted in correct order"

tech-stack:
  added: []
  patterns:
    - "Inline duplicate warning via Alert component (not modal) — triggered by 409 response + checkDuplicate call"
    - "force_duplicate: true sent in separate handler (handleRegisterAnyway) not via shared submit function"
    - "BARANGAY_OPTIONS hardcoded from fixture file — same pattern as HEALTH_STATIONS in admin module"
    - "FieldSet + FieldLegend + Field + FieldError for form sections — consistent with UI-SPEC field.tsx usage"
    - "login-page-enter CSS animation class reused for page entrance"

key-files:
  created:
    - "frontend/src/pages/patients/RegisterPatientPage.tsx"
  modified:
    - "frontend/src/App.tsx — added /patients/new route before /patients/:id placeholder"
    - "frontend/src/layouts/AppShell.tsx — added PAGE_TITLES['/patients/new']"

key-decisions:
  - "handleRegisterAnyway is a separate function with explicit force_duplicate: true — not a shared submit with parameter — makes intent clear and matches acceptance criteria literal"
  - "Duplicate detected via 409 + checkDuplicate combo: registerPatient(force_duplicate:false) fires first; on 409, checkDuplicate fetches existing patient to populate the warning card with name/BHS/date"
  - "BARANGAY_OPTIONS extracted from cho2-boundaries.geojson fixture at dev time — 32 entries with ADM4_PCODE as psgc_code, matching migration 0002 seed"
  - "Health Station select pre-filled from user.health_station_id but remains editable; backend ignores submitted value and auto-assigns from JWT — display for transparency only"

requirements-completed: [P3-05, P3-03]

duration: 10min
completed: 2026-03-18
---

# Phase 3 Plan 04: Register Patient Page Summary

**Patient registration page at /patients/new: 5-section form with inline duplicate detection Alert, force_duplicate override, and exact PSGC codes from fixture file**

## Performance

- **Duration:** 10 min
- **Started:** 2026-03-18T10:26:00Z
- **Completed:** 2026-03-18T10:36:37Z
- **Tasks:** 1
- **Files modified:** 3 (1 created, 2 modified)

## Accomplishments

- RegisterPatientPage with Identity, Demographics, Address, Contact, and Assignment sections using FieldSet/FieldLegend pattern
- Client-side validation with FieldError under each required field; aria-required and aria-invalid on all required controls
- Duplicate detection: submit fires registerPatient(force_duplicate: false), 409 response triggers checkDuplicate to get existing patient details, Alert warning shows inline above submit with exact UI-SPEC copywriting
- "Register Anyway" fires registerPatient(force_duplicate: true) and navigates to new patient on success
- BARANGAY_OPTIONS derived from cho2-boundaries.geojson — 32 exact ADM4_PCODE values, no FK violations
- Health Station pre-filled from useAuth() user.health_station_id; /patients/new route placed before /patients/:id in App.tsx

## Task Commits

1. **Task 1: RegisterPatientPage with form, duplicate detection, and routing** - `a2cda24` (feat)

**Plan metadata:** (committed with SUMMARY + state updates)

## Files Created/Modified

- `frontend/src/pages/patients/RegisterPatientPage.tsx` — Full registration page: 5-section form, client-side validation, 409 duplicate detection, inline Alert with Use Existing / Register Anyway actions
- `frontend/src/App.tsx` — Added `/patients/new` route before future `/patients/:id` route; imported RegisterPatientPage
- `frontend/src/layouts/AppShell.tsx` — Added `"/patients/new": "Register Patient"` to PAGE_TITLES

## Decisions Made

- `handleRegisterAnyway` is a separate async function with explicit `force_duplicate: true` rather than a parameterized shared submit — clearer intent, no shared-state mutation between the two submission paths
- Duplicate warning triggers only after a real 409 from the server (not on pre-submit debounce) — avoids false positives from partial name entry, consistent with the backend's canonical duplicate check logic
- BARANGAY_OPTIONS is hardcoded as a constant (same pattern as HEALTH_STATIONS in admin module) — GIS API not built yet; Phase 7 executor should replace with dynamic fetch if needed

## Deviations from Plan

None — plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None — no external service configuration required.

## Next Phase Readiness

- /patients/new is live and fully wired to the patients API (Plans 02-03 backend)
- Plan 05 can add /patients/:id route inside the same ProtectedRoute block in App.tsx
- RegisterPatientPage navigates to `/patients/${newPatient.id}` on success — Plan 05 patient profile page must exist at that route for the flow to complete end-to-end

## Self-Check: PASSED

- FOUND: frontend/src/pages/patients/RegisterPatientPage.tsx
- FOUND: .planning/phases/03-patient-itr-core-data-model/03-04-SUMMARY.md
- FOUND commit: a2cda24

---
*Phase: 03-patient-itr-core-data-model*
*Completed: 2026-03-18*
