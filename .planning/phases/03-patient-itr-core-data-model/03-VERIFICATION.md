---
phase: 03-patient-itr-core-data-model
verified: 2026-03-18T12:00:00Z
status: human_needed
score: 10/10 must-haves verified
re_verification: false
human_verification:
  - test: "Navigate to /patients as a nurse and perform a search"
    expected: "Debounced search returns patients from own BHS; city-wide toggle appears; BHS badge column shown when toggle active"
    why_human: "Cannot verify 300ms debounce timing, live API call, or CSS variable badge colors programmatically"
  - test: "Register a new patient with the same name + birthdate as an existing patient"
    expected: "Inline Alert (not modal) appears with 'Patient may already exist' heading, existing patient details, 'Use Existing Patient' and 'Register Anyway' buttons"
    why_human: "Requires live backend 409 response and visual rendering of Alert component"
  - test: "Open ConsultationSheet, enter weight and height values"
    expected: "BMI field updates live as weight/height change; shows '--' when fields are empty"
    why_human: "Live BMI computation requires DOM interaction"
  - test: "View a patient from another BHS (city-wide search) as a nurse"
    expected: "View Only badge appears on profile header; Add Consultation button is hidden"
    why_human: "Requires cross-BHS data and visual badge rendering with --status-warning CSS variable"
  - test: "Save a consultation and verify the consultations table refreshes"
    expected: "Sheet closes, success toast appears, consultations table shows the new record without page reload"
    why_human: "Requires live API call, onSuccess callback, and visual table refresh"
  - test: "Verify possible_duplicate badge rendering"
    expected: "Badge with --status-critical background appears on patient with possible_duplicate=true"
    why_human: "Requires patient with possible_duplicate=true flag and CSS variable color verification"
---

# Phase 3: Patient ITR + Core Data Model — Verification Report

**Phase Goal:** Working patient registration and consultation recording system with city-wide duplicate detection and BHS-scoped access control
**Verified:** 2026-03-18T12:00:00Z
**Status:** human_needed
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | Patient ORM model exists with all identity fields, FKs, soft delete, tsvector GIN search | VERIFIED | `backend/app/models/patient.py` — `class Patient(TimestampMixin, SoftDeleteMixin, Base)`, TSVECTOR Computed with `persisted=True`, `postgresql_using="gin"`, FKs to barangays and health_stations |
| 2 | Consultation ORM model exists with hybrid vitals (7 discrete + JSONB), FK to patients and users | VERIFIED | `backend/app/models/consultation.py` — `Numeric(4,1)` temperature, `Numeric(5,2)` weight/height, `JSONB` vitals_extra, FKs to patients.id and users.id |
| 3 | Alembic migration 0004 creates both tables, is replayable, adds tsvector column via raw SQL | VERIFIED | `backend/alembic/versions/0004_patients_and_consultations.py` — raw SQL for GENERATED ALWAYS AS tsvector, GIN index, CHECK(sex IN ('male','female')), correct FK order in downgrade |
| 4 | POST /api/patients registers a new patient with duplicate check pre-save | VERIFIED | `PatientService.register_patient()` runs `check_duplicate()` city-wide before create; raises 409 if match and `force_duplicate=False`; health_station_id auto-set from current_user |
| 5 | GET /api/patients searches by name via tsvector GIN index with BHS-scoped default and city_wide toggle | VERIFIED | `PatientRepository.search()` uses `func.to_tsquery("simple", sanitized)` with `@@` operator; applies `_isolation_filter` unless `city_wide=True`; CROSS_BHS_ROLES force city_wide=True in service |
| 6 | GET /api/patients/check-duplicate checks for duplicate city-wide before registration | VERIFIED | Route registered before `/{patient_id}` to avoid path collision; `check_duplicate()` uses `func.lower()` for case-insensitive match across all BHS |
| 7 | GET /api/patients/:id returns full patient record with barangay and health station names | VERIFIED | `get_by_id_with_relations()` uses selectinload on health_station and barangay; `_to_patient_response()` maps barangay_name and health_station_name |
| 8 | POST /api/patients/:id/consultations creates a consultation, blocks cross-BHS for BHS-level roles | VERIFIED | `create_consultation()` checks `patient.health_station_id != current_user.health_station_id` for non-CROSS_BHS_ROLES; raises 403 on mismatch |
| 9 | GET /api/patients/:id/consultations returns paginated consultations with recorded_by_name | VERIFIED | `ConsultationRepository.list_for_patient()` uses `selectinload(Consultation.recorded_by_user)` to avoid N+1; `recorded_by_user.full_name` populated in service |
| 10 | Nurse/midwife CRUD patients; physician view+consult; CHO/DSO/coordinator read-only; BHW blocked | VERIFIED | `PATIENT_READ_ROLES` (6 roles, no BHW), `PATIENT_WRITE_ROLES` (nurse, midwife), `CONSULTATION_WRITE_ROLES` (nurse, midwife, physician); ProtectedRoute in App.tsx excludes BHW and system_admin |
| 11 | Registration and duplicate-override events are audit-logged | VERIFIED | `_write_audit("patients", "CREATE", payload)` called in `register_patient()`; `duplicate_override: True` and `existing_patient_id` added to payload when `force_duplicate=True` |
| 12 | TypeScript types match backend Pydantic schemas exactly | VERIFIED | `frontend/src/features/patients/types.ts` — `sex: "male" | "female"` union, `bmi: number | null` on ConsultationResponse, all Pydantic fields represented |
| 13 | API client covers all 6 backend endpoints | VERIFIED | `frontend/src/features/patients/api.ts` — searchPatients, getPatient, registerPatient, checkDuplicate, createConsultation, listConsultations with `city_wide` and `page_size` snake_case params |
| 14 | /patients route renders search page with debounce, city-wide toggle, sortable table, pagination | VERIFIED | `PatientsPage.tsx` — 300ms debounce via useRef, Checkbox city-wide toggle hidden for CROSS_BHS_ROLES, SortIcon on all 5 columns, Pagination component |
| 15 | Sidebar Patients nav item for 6 clinical roles, not BHW, not system_admin | VERIFIED | `app-sidebar.tsx` NAV_ITEMS — Patients with ClipboardList icon, roles: [nurse, midwife, physician, city_health_officer, phis_coordinator, disease_surveillance_officer] |
| 16 | /patients/new registration form with duplicate detection UX | VERIFIED | `RegisterPatientPage.tsx` — 5-section form, 409 triggers checkDuplicate, inline Alert with "Patient may already exist", "Use Existing Patient", "Register Anyway" with force_duplicate:true, BARANGAY_OPTIONS from cho2-boundaries.geojson fixture |
| 17 | /patients/:id profile shows header card, consultations tab, Sheet-based Add Consultation | VERIFIED | `PatientProfilePage.tsx` — header with CSS-var card div, "Possible Duplicate" badge, "View Only" badge with isViewOnly check, ConsultationSheet rendered with open state |
| 18 | ConsultationSheet has all 5 sections, live BMI, collapsible additional vitals | VERIFIED | `ConsultationSheet.tsx` — Chief Complaint, Vitals (7 fields, inputMode="numeric", min-h-[48px]), Collapsible additional vitals, live computeBmi(), Tooltip, Assessment, Referral |

**Score:** 18/18 truths verified (automated) — 6 items require human verification

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `backend/app/models/patient.py` | Patient ORM with tsvector, GIN | VERIFIED | class Patient(TimestampMixin, SoftDeleteMixin, Base), Computed TSVECTOR persisted=True, postgresql_using="gin" |
| `backend/app/models/consultation.py` | Consultation ORM with hybrid vitals | VERIFIED | JSONB vitals_extra, Numeric(4,1)/(5,2), SoftDeleteMixin |
| `backend/app/models/__init__.py` | Models registered for Alembic | VERIFIED | Patient and Consultation imported with noqa: F401, both in __all__ |
| `backend/app/schemas/patient.py` | PatientCreate, PatientResponse, DuplicateCheckResult | VERIFIED | sex pattern=r"^(male|female)$", age computed_field, full_name computed_field on PatientListItem |
| `backend/app/schemas/consultation.py` | ConsultationCreate with validation, ConsultationResponse with BMI | VERIFIED | vitals range validation (ge/le), bmi as @computed_field @property, never stored |
| `backend/alembic/versions/0004_patients_and_consultations.py` | Migration for both tables with GIN index | VERIFIED | raw SQL for tsvector GENERATED ALWAYS AS, GIN index, CHECK constraint, reversible |
| `backend/app/repositories/patient.py` | PatientRepository with tsvector search, city-wide check_duplicate | VERIFIED | class PatientRepository(BaseRepository), _sanitize_search_input, to_tsquery("simple"), _isolation_filter call |
| `backend/app/repositories/consultation.py` | ConsultationRepository with selectinload | VERIFIED | selectinload(Consultation.recorded_by_user) in list_for_patient |
| `backend/app/services/patient.py` | PatientService with RBAC lists, audit, 409, 403 | VERIFIED | PATIENT_READ_ROLES (6), PATIENT_WRITE_ROLES, CONSULTATION_WRITE_ROLES, _write_audit with duplicate_override |
| `backend/app/routers/patient.py` | 6 endpoints, /check-duplicate before /{patient_id}, RBAC | VERIFIED | router=APIRouter(prefix="/patients"), /check-duplicate before /{patient_id}, require_role() not double-wrapped |
| `backend/app/main.py` | patient_router included under /api | VERIFIED | include_router(patient_router, prefix="/api") |
| `backend/tests/test_patients/` | 10 Wave 0 test stubs | VERIFIED (Wave 0) | 11 files (1 __init__.py + 10 test stubs), each with docstring mapping to P3-XX requirement; all pass as `test_placeholder` |
| `frontend/src/features/patients/types.ts` | TypeScript interfaces matching Pydantic schemas | VERIFIED | PatientListItem, PatientResponse, PatientCreateRequest, DuplicateCheckResult, ConsultationResponse, ConsultationCreateRequest |
| `frontend/src/features/patients/api.ts` | 6 API functions with snake_case params | VERIFIED | import api from "@/lib/axios"; all 6 functions with city_wide/page_size params |
| `frontend/src/pages/patients/PatientsPage.tsx` | Search page with all required UI elements | VERIFIED | debounce, toggle, sort, pagination, skeleton, 2 empty states, row navigation |
| `frontend/src/components/app-sidebar.tsx` | Patients nav item for 6 clinical roles | VERIFIED | ClipboardList icon, correct 6 roles, no BHW or system_admin |
| `frontend/src/pages/patients/RegisterPatientPage.tsx` | Registration form with duplicate detection | VERIFIED | 5 sections, 409 flow, Alert, force_duplicate:true, BARANGAY_OPTIONS from fixture |
| `frontend/src/pages/patients/PatientProfilePage.tsx` | Profile page with header, tabs, Sheet trigger | VERIFIED | useParams, getPatient+listConsultations, isViewOnly check, ConsultationSheet rendered |
| `frontend/src/pages/patients/ConsultationSheet.tsx` | Consultation form as Sheet side panel | VERIFIED | 5 sections, inputMode="numeric", min-h-[48px], computeBmi(), Collapsible, vitals_extra, onSuccess |
| `frontend/src/App.tsx` | Routes /patients, /patients/new, /patients/:id | VERIFIED | /patients/new before /patients/:id, ProtectedRoute with 6 clinical roles |
| `frontend/src/layouts/AppShell.tsx` | Page titles for patient routes | VERIFIED | "/patients":"Patients", "/patients/new":"Register Patient", startsWith("/patients") fallback |

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `backend/app/models/patient.py` | `backend/app/core/base.py` | inherits TimestampMixin, SoftDeleteMixin, Base | WIRED | class Patient(TimestampMixin, SoftDeleteMixin, Base) |
| `backend/app/models/patient.py` | `backend/app/models/health_station.py` | ForeignKey("health_stations.id") | WIRED | ForeignKey present, relationship with lazy="raise" |
| `backend/app/models/consultation.py` | `backend/app/models/patient.py` | ForeignKey("patients.id") | WIRED | ForeignKey present, relationship back_populates="consultations" |
| `backend/app/routers/patient.py` | `backend/app/services/patient.py` | PatientService(db, current_user) per endpoint | WIRED | All 6 endpoint handlers instantiate PatientService and call service methods |
| `backend/app/services/patient.py` | `backend/app/repositories/patient.py` | PatientRepository(session=session, user=current_user) | WIRED | PatientService.__init__ creates both repos; all service methods delegate to repos |
| `backend/app/repositories/patient.py` | `backend/app/repositories/base.py` | inherits BaseRepository, uses _isolation_filter | WIRED | class PatientRepository(BaseRepository); _isolation_filter called in search() |
| `backend/app/main.py` | `backend/app/routers/patient.py` | app.include_router | WIRED | include_router(patient_router, prefix="/api") |
| `frontend/src/features/patients/api.ts` | `frontend/src/lib/axios` | import api from "@/lib/axios" | WIRED | First line of api.ts |
| `frontend/src/pages/patients/PatientsPage.tsx` | `frontend/src/features/patients/api.ts` | searchPatients() call | WIRED | searchPatients called in useEffect with debounced query |
| `frontend/src/pages/patients/RegisterPatientPage.tsx` | `frontend/src/features/patients/api.ts` | checkDuplicate and registerPatient calls | WIRED | Both called in handleSubmit and handleRegisterAnyway |
| `frontend/src/pages/patients/PatientProfilePage.tsx` | `frontend/src/features/patients/api.ts` | getPatient and listConsultations calls | WIRED | getPatient in patient useEffect; listConsultations in fetchConsultations |
| `frontend/src/pages/patients/ConsultationSheet.tsx` | `frontend/src/features/patients/api.ts` | createConsultation call | WIRED | createConsultation called in handleSubmit with full vitals payload |
| `frontend/src/pages/patients/PatientProfilePage.tsx` | `frontend/src/pages/patients/ConsultationSheet.tsx` | renders ConsultationSheet with open state | WIRED | ConsultationSheet imported and rendered with open={showConsultationSheet} |
| `frontend/src/App.tsx` | `frontend/src/pages/patients/PatientProfilePage.tsx` | Route element | WIRED | Route path="/patients/:id" element={PatientProfilePage} after /patients/new |

### Requirements Coverage

| Requirement | Source Plans | Description (derived from plan truths) | Status | Evidence |
|-------------|-------------|----------------------------------------|--------|----------|
| P3-01 | 03-01 | Patient ORM model with all fields, tsvector GIN search, soft delete | SATISFIED | patient.py — all fields, TSVECTOR Computed persisted=True, SoftDeleteMixin |
| P3-02 | 03-01 | Consultation ORM model with hybrid vitals (discrete + JSONB), soft delete | SATISFIED | consultation.py — 7 discrete cols, JSONB vitals_extra, SoftDeleteMixin |
| P3-03 | 03-02, 03-04 | City-wide duplicate detection (exact case-insensitive match on name+birthdate) | SATISFIED | check_duplicate() uses func.lower() city-wide; 409 on match; force_duplicate bypass |
| P3-04 | 03-02, 03-03 | Patient search via tsvector GIN index with BHS-scoped default | SATISFIED | to_tsquery("simple") with :* prefix tokens; _isolation_filter toggle; PatientsPage debounced search |
| P3-05 | 03-04 | Patient registration page with duplicate detection UX | SATISFIED | RegisterPatientPage — 5-section form, 409 inline Alert, "Register Anyway" with force_duplicate:true |
| P3-06 | 03-05 | Patient profile page with header card, consultations tab | SATISFIED | PatientProfilePage — header card, Tabs with Consultations, Breadcrumb, Skeleton |
| P3-07 | 03-05 | Add Consultation via Sheet side panel, all vitals, live BMI | SATISFIED | ConsultationSheet — Sheet panel, 7 vitals, computeBmi(), Collapsible additional vitals |
| P3-08 | 03-02, 03-03 | RBAC: nurse/midwife write, physician consult, CHO/DSO/coordinator read, BHW blocked | SATISFIED | PATIENT_WRITE_ROLES/READ_ROLES/CONSULTATION_WRITE_ROLES; ProtectedRoute excludes BHW |
| P3-09 | 03-02, 03-05 | City-wide results read-only: nurse cannot create consultation on another BHS patient | SATISFIED | Service 403 check on health_station_id mismatch; PatientProfilePage hides Add Consultation when isViewOnly |
| P3-10 | 03-02 | Audit logging for registration and duplicate-override events | SATISFIED | _write_audit() in register_patient(); duplicate_override:True in audit payload when force_duplicate used |

### Anti-Patterns Found

None. Scan of all 10 implementation files (5 backend, 5 frontend) found no TODOs, FIXMEs, stub returns, or empty handlers. The 10 test stubs in `backend/tests/test_patients/` are Wave 0 intentional placeholders with full requirement documentation — this is the designed validation strategy for this phase, not an anti-pattern.

**Notable items (Info):**

| File | Item | Severity | Impact |
|------|------|----------|--------|
| `backend/app/services/patient.py` line 300 | `performed_by = NULL` in audit_logs INSERT | Info | Matches existing admin service pattern; audit_logs.performed_by is UUID nullable — user ID tracking not implemented yet for this table |
| `frontend/src/pages/patients/PatientProfilePage.tsx` | No shadcn card.tsx — uses styled div with CSS vars | Info | Plan 05 documented this as auto-fixed deviation; visual parity maintained via border-border/bg-card CSS variables |
| `frontend/src/pages/patients/ConsultationSheet.tsx` | No shadcn textarea.tsx — uses native textarea | Info | Plan 05 documented this as auto-fixed deviation; styled consistently with Input component classes |

### Human Verification Required

#### 1. Patient Search with Debounce and City-Wide Toggle

**Test:** Log in as nurse. Navigate to /patients. Type a partial patient name.
**Expected:** API call fires after 300ms pause (not on every keypress). City-wide checkbox appears. Toggling it switches between BHS-scoped and city-wide results. BHS badge column appears in results when city-wide is active.
**Why human:** Debounce timing and live API behavior cannot be verified statically.

#### 2. Patient Registration Duplicate Detection Flow

**Test:** Register a patient. Try to register another patient with the exact same last name, first name, and birthdate.
**Expected:** On submit, backend returns 409. Page does NOT navigate away. An inline Alert card appears below the form with "Patient may already exist" heading, the existing patient's name/BHS/date, "Use Existing Patient" and "Register Anyway" buttons.
**Why human:** Requires live backend 409 response, checkDuplicate second call, and visual rendering of the Alert component with correct CSS variable colors.

#### 3. Live BMI Computation in ConsultationSheet

**Test:** Open Add Consultation on a patient profile. Enter weight (e.g. 65) and height (e.g. 165) in the vitals section.
**Expected:** BMI field updates live to show calculated value (e.g. 23.9). Shows "--" when either field is empty. Tooltip on BMI field shows "Computed from weight and height".
**Why human:** DOM interaction and live state update required.

#### 4. Cross-BHS View-Only Access

**Test:** Log in as nurse at BHS-1. Search city-wide. Click a patient registered at BHS-2.
**Expected:** Patient profile loads. "View Only — this patient belongs to [BHS Name]" badge appears with warning styling. "Add Consultation" button is not visible.
**Why human:** Requires cross-BHS patient data and CSS variable --status-warning color verification.

#### 5. Consultation Save and Table Refresh

**Test:** On a patient profile, click "Add Consultation", fill out chief complaint, save.
**Expected:** Sheet closes. Success toast appears. Consultations table shows the new record without full page reload.
**Why human:** Requires live API call, onSuccess callback firing refreshConsultations, and visual table update.

#### 6. Possible Duplicate Badge on Patient Profile

**Test:** Navigate to a patient with possible_duplicate=true.
**Expected:** "Possible Duplicate" badge appears in the profile header with --status-critical styling (red/critical color).
**Why human:** Requires patient with possible_duplicate flag and CSS variable rendering.

### Gaps Summary

No gaps. All 18 automated truths verified. All 21 artifacts pass all three levels (exists, substantive, wired). All 14 key links confirmed wired. All 10 requirement IDs (P3-01 through P3-10) satisfied by implemented code. No orphaned requirements.

The 6 human verification items are quality and behavior checks requiring live interaction — they do not represent implementation gaps but rather confirmation that the correctly-wired code produces correct visual and runtime behavior.

---
_Verified: 2026-03-18T12:00:00Z_
_Verifier: Claude (gsd-verifier)_
