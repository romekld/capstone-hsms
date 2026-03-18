# Phase 3: Patient ITR + Core Data Model - Context

**Gathered:** 2026-03-18
**Status:** Ready for planning

<domain>
## Phase Boundary

Unified patient registration, city-wide duplicate detection, BHS-scoped and city-wide patient search, and general consultations. Every later clinical program (Phases 4–8) links to the `patient_id` FK established here. Clinical program enrollments (prenatal, EPI, TB, NCD) are out of scope — Phase 4+.

**Who operates this phase:** Nurse and midwife register patients and record consultations. Physician can view and add consultations. CHO/DSO/coordinator have read-only city-wide access. **BHW has zero access in Phase 3.**

**BHW scope clarification (confirmed):** BHW offline field entry (mobile-first PWA, IndexedDB, background sync) is fully Phase 9. Phase 3 does not build any BHW-facing UI or grant BHW role any patient access. Phase 9 will implement the BHW interface as a new frontend surface pointing to the same `patients` and `consultations` tables via `patient_id` FK. `local_id UUID` and `status record_status` sync columns are added in Phase 9 — not Phase 3.

</domain>

<decisions>
## Implementation Decisions

### Role Access
- **Nurse / Midwife:** Full CRUD — register patients, record consultations, run duplicate check, search patients (own BHS default, city-wide toggle)
- **Physician:** Create consultations + view patient records (clinical notes, diagnoses scope per CLAUDE.md)
- **CHO / DSO / PHIS Coordinator:** Read-only, city-wide patient search (already in CROSS_BHS_ROLES)
- **BHW:** Zero access in Phase 3 — no patient lookup, no profile view, no consultation entry

### Vitals Model
- **Hybrid approach:** Core vitals as discrete typed columns; additional vitals in `vitals_extra JSONB`.
- **Discrete columns:** `bp_systolic INT`, `bp_diastolic INT`, `heart_rate INT`, `respiratory_rate INT`, `temperature NUMERIC(4,1)`, `weight NUMERIC(5,2)`, `height NUMERIC(5,2)`.
- **BMI:** Computed on read from weight/height — not stored as a column.
- **vitals_extra JSONB:** O2 saturation, blood glucose, and any future vital signs go here.
- **All vitals optional** — nurse fills what's available for the visit type; backend validates range only when a field is provided.

### Consultation Record
- Fields: `chief_complaint TEXT` (required), discrete vitals + `vitals_extra JSONB` (optional), `diagnosis TEXT` (free text, optional — ICD-10 code or plain description), `referring_to TEXT` nullable.
- No full SOAP note — chief complaint + vitals + diagnosis is sufficient for BHS general consultations.

### Patient Identity Fields
- **Required at registration:** `last_name`, `first_name`, `middle_name` (nullable), `birthdate DATE`, `sex ENUM('male', 'female')`, `barangay_psgc_code TEXT FK` (→ barangay table), `address_line TEXT` nullable (house/lot/street free text), `health_station_id INT FK` (→ health_stations), `mobile_number TEXT` nullable.
- **Extended fields deferred:** PhilHealth ID, civil status/occupation, guardian/emergency contact — not captured in Phase 3. These will be added in the phases that need them (Phase 4 for guardian, Phase 8 for FHSIS extended demographics).
- Address is barangay FK + free-text street line — gives GIS mapping capability for Phase 7 choropleth without forcing structured address entry.

### Duplicate Detection
- **Strategy:** Exact case-insensitive match on `last_name + first_name + birthdate`. Middle name is excluded (frequently missing or abbreviated). No fuzzy/trigram matching in Phase 3.
- **Scope:** City-wide — checks all 32 BHS regardless of the registering nurse's BHS. A patient transferred from another BHS must not get a second ITR.
- **UX when duplicate found:** Show a warning card before save with existing patient's name, BHS, registration date, and a link to their record. Two actions:
  - "Use existing patient" — cancels new registration, redirects to existing record.
  - "Continue anyway" — saves the new record (audit-logged; sets a `possible_duplicate BOOLEAN DEFAULT FALSE` flag on the new record).

### Patient Search
- **Default scope:** Nurse sees her own BHS patients. A "Search all BHS" toggle switches to city-wide. City-wide results are read-only for BHS-level roles — nurse can view but not edit another BHS's patient.
- **Search fields:** Full-text GIN index on `last_name + first_name` tsvector; exact match on auto-generated `patient_id`. Name search is case-insensitive, partial-match capable.
- **UI placement:** Dedicated `/patients` route with a search bar at top, sortable results table (columns: name, birthdate, sex, BHS, registration date), Register button. Clicking a row opens the patient profile page.

### Patient Profile Page
- **Layout:** Header card + Consultations tab only. No placeholder tabs for Phase 4–8 programs — clean, functional, no empty sections.
- **Header card fields:** Name, birthdate, sex, age (computed), BHS. No mobile number or address in the header — keeps it focused on identity confirmation.
- **Consultations tab:** Sortable table, default sort newest first. Columns: date, chief complaint, diagnosis, referring_to, recorded by.
- **Add Consultation:** Button on the profile page — opens a Sheet side panel with consultation form (chief complaint required; vitals and diagnosis optional).

### Claude's Discretion
- Auto-generated `patient_id` format (e.g., sequential INT PK, or a formatted code like `BHS##-YYYYNNNN`).
- GIN index definition and tsvector configuration for name search.
- Alembic migration structure for the `patients` and `consultations` tables.
- Error message wording for duplicate warning and city-wide read-only enforcement.
- Exact consultation form field layout within the Sheet panel.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Core Data Model Constraints
- `.planning/PROJECT.md` §Open Questions (Blocking) — The `consultations.vitals` decision is now resolved (hybrid). Other open questions for later phases are documented here.
- `.planning/PROJECT.md` §Compliance Requirements — RA 10173 (soft deletes), RA 11332 (alert window), DOH DM 2024-0007 (FHSIS formulas that will query this data model in Phase 8).

### Phase 1–2 Patterns (extend, don't replace)
- `.planning/phases/01-infrastructure-devops/01-CONTEXT.md` — `psgc_code` FK standard, `TimestampMixin`/`SoftDeleteMixin` usage, `lazy="raise"` rule, async Alembic migration pattern.
- `.planning/phases/02-authentication-rbac-user-management/02-CONTEXT.md` — `BaseRepository._isolation_filter()` pattern, `CROSS_BHS_ROLES` frozenset, `require_role()` usage, `CurrentUser` dependency injection pattern.

### Existing Code (read before planning)
- `backend/app/core/base.py` — `Base`, `TimestampMixin`, `SoftDeleteMixin`, `do_orm_execute` hook. All clinical models must use both mixins.
- `backend/app/repositories/base.py` — `BaseRepository`, `CROSS_BHS_ROLES`. `PatientRepository` and `ConsultationRepository` must inherit from `BaseRepository`.
- `backend/app/core/dependencies.py` — `AsyncDB`, `CurrentUser`, `require_role`. Router pattern for Phase 3+:
  ```python
  async def endpoint(db: AsyncDB, current_user: CurrentUser, _=Depends(require_role(["nurse", "midwife"]))):
  ```
- `backend/app/models/health_station.py` — FK target for `patients.health_station_id`.
- `backend/app/models/barangay.py` — FK target for `patients.barangay_psgc_code`.

### UI Foundation
- `CLAUDE.md` §UI Development Rules — mandatory `frontend-design` skill before any UI surface; shadcn/ui blocks as starting point; CSS variable theming required.
- Existing shadcn components installed: `table`, `tabs`, `sheet`, `dialog`, `badge`, `input`, `select`, `skeleton`, `pagination`.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `BaseRepository` (`backend/app/repositories/base.py`): `PatientRepository` and `ConsultationRepository` inherit from this. `_isolation_filter()` handles BHS-scoping automatically. Import `CROSS_BHS_ROLES` for city-wide search toggle logic.
- `TimestampMixin` + `SoftDeleteMixin` (`backend/app/core/base.py`): Apply both to `patients` and `consultations` models. Soft-delete filter is automatic via `do_orm_execute` hook.
- shadcn `table`, `pagination`, `skeleton` components: Already installed. Use for the patient search results table and consultations history table with loading skeleton.
- shadcn `sheet` component: Already installed. Use for patient registration form (matches Phase 2 Create User pattern) and Add Consultation form.
- shadcn `badge`: Use for patient status indicators (e.g., `possible_duplicate` flag, BHS label on city-wide search results).

### Established Patterns
- All relationships use `lazy="raise"` — explicit joins only; never rely on lazy loading.
- Async-first: all repository methods must be `async def`; never use sync SQLAlchemy.
- Router-level RBAC with `require_role()`; repo-level isolation with `_isolation_filter()`.
- City-wide search: for BHS-level roles, `_isolation_filter()` adds the WHERE clause; the city-wide toggle must bypass this by calling a separate repo method (or passing a flag) — do NOT break the isolation pattern for regular queries.
- Frontend: Axios instance + API client pattern from `frontend/src/lib/`; feature modules live under `frontend/src/features/`.

### Integration Points
- `patients.health_station_id` → `health_stations.id` (BHS of registration)
- `patients.barangay_psgc_code` → `barangay.psgc_code` (for GIS mapping in Phase 7)
- `consultations.patient_id` → `patients.id`
- All Phase 4–8 enrollment tables (`prenatal_enrollments`, `tb_cases`, `ncd_enrollments`, etc.) will FK to `patients.id`
- `audit_logs` table: registration and duplicate-override events should be logged via existing audit hook

</code_context>

<specifics>
## Specific Ideas

- "Continue anyway" on duplicate must be audit-logged so the admin can review intentional duplicate registrations and merge/deactivate later.
- City-wide search results should clearly show which BHS the patient belongs to (badge or column), so the nurse knows whose record it is before clicking through.
- The patient registration form should feel similar to the Create User sheet panel (Phase 2 deliverable) — consistent UX for admin staff learning the system.
- Patient profile header: confirmed fields are name, birthdate, sex, age (computed), BHS — keep it focused on identity confirmation at a glance.

</specifics>

<deferred>
## Deferred Ideas

- BHW patient access (read-only or entry) — zero BHW access in Phase 3; all BHW-facing UI is Phase 9 (offline PWA + background sync).
- `local_id UUID` + `status record_status` sync columns on `patients` and `consultations` — add via migration in Phase 9 when offline sync is implemented.
- PhilHealth ID + membership type — not needed for Phase 3–7 clinical logic; defer to Phase 8 (FHSIS) or a later admin phase.
- Civil status / occupation — may be needed for FHSIS M1/M2 formulas; defer to Phase 8 and add via migration.
- Guardian / emergency contact — defer to Phase 4 (child health programs where guardian info is clinically relevant).
- Global Cmd+K patient search (command palette) — defer to a polish/UX phase after clinical core is complete.
- Patient merge / deactivate duplicate workflow — defer to admin tooling after Phase 3; `possible_duplicate` flag enables this later.
- ICD-10 code picker / autocomplete for diagnosis field — defer; free text is sufficient for Phase 3.
- Program tabs on patient profile (Prenatal, EPI, TB, NCD) — added progressively in Phases 4–8 as programs are built.

</deferred>

---

*Phase: 03-patient-itr-core-data-model*
*Context gathered: 2026-03-18 (updated)*
