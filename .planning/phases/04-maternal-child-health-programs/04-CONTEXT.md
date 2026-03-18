# Phase 4: Maternal + Child Health Programs - Context

**Gathered:** 2026-03-18
**Status:** Ready for planning

<domain>
## Phase Boundary

Nurses manage the full lifecycle of four programs: **Prenatal** (enrollment → visits → overdue detection → high-risk flags), **Postpartum** (Day 1 / Week 1 / Week 6 schedule auto-calculated from delivery date), **EPI** (dose sequence enforcement, auto-scheduling, defaulter detection, FIC computation), and **Nutrition/OPT+** (WHO Z-score classification, Vitamin A/iron/deworming eligibility, severe wasting at-risk trigger). All four programs link to `patients.id` from Phase 3.

**Who operates this phase:** Nurse and midwife have full CRUD. CHO/DSO/PHIS Coordinator have read-only access. BHW has zero access in Phase 4 (BHW UI is Phase 9).

**Out of scope:** Family Planning, Newborn Care/ENC, IMCI, TB-DOTS (Phase 5), NCD (Phase 5), inventory, and any cross-BHS supervisory dashboards.

</domain>

<decisions>
## Implementation Decisions

### Program tabs on patient profile
- Patient profile gains four new tabs: **[Consultations] [Prenatal] [Postpartum] [EPI] [Nutrition]**
- Each tab shows an empty state ("Not enrolled in [program]") with an **Enroll Patient** button when the patient has no enrollment
- **Prenatal tab layout:** Enrollment summary card at top (LMP, EDC, gravida/para, HIGH RISK badge if flagged) + "Add Visit" button + "Record Delivery" button. Below: sortable visit history table (columns: date, AOG, BP, weight, next visit date, overdue badge)
- **EPI tab layout:** Enrollment header (DOB, FIC status badge) + "Record Dose" button. Below: vaccine grid — rows = vaccine types (BCG, HepB, Penta, OPV, IPV, PCV, MMR), columns = dose numbers. Each cell shows: ✅ date given (green) | scheduled date (blue) | overdue (red) | — not applicable
- **Nutrition tab layout:** Latest Z-score summary card (WAZ / HAZ / WHZ with color-coded status labels: Normal / Underweight / Wasted / Stunted / Severe Wasting). Severe wasting (WHZ < −3) shows a red alert. Eligibility row: Vitamin A / iron / deworming status computed from age band and OPT+ cycle. Below: visit history table (date, weight, height, MUAC, WAZ, HAZ, WHZ, status)
- **Postpartum tab layout:** Same pattern as Prenatal — enrollment summary card + scheduled visit dates (Day 1, Week 1, Week 6) with overdue badges + visit history table

### Overdue & defaulter visibility
- **Dedicated overdue list page per program** — separate routes for prenatal overdue, postpartum overdue, EPI defaulters, and nutrition at-risk
- Sidebar nav "Maternal & Child Health" section shows live overdue count badges per program (e.g., "Prenatal (3 overdue)")
- Overdue counts are **always live** — no manual clearing. When a nurse records a visit for an overdue patient, the count drops automatically
- Overdue list pages are **view-only** — clicking a patient row navigates to their profile with the relevant program tab active. Visit entry happens on the profile page (not inline on the overdue list)
- Overdue list columns: Patient name | Expected visit date | Days overdue | (click row → profile)

### High-risk prenatal flags
- **Auto-flagged** when any of these conditions is recorded in a prenatal visit:
  - BP ≥ 140/90 (hypertension in pregnancy)
  - Hgb < 11 g/dL (severe anemia)
  - Para ≥ 5 (grand multipara — captured at enrollment)
  - GDM screening positive (checkbox on visit form)
  - Nurse manually checks "High-risk" (free-text reason field, for conditions not auto-detected)
- **Flag placement:** HIGH RISK badge on the Prenatal tab header card + badge on patient rows in the prenatal overdue/high-risk list. **Not** on the main patient identity header — high-risk is program-specific, not patient-wide
- High-risk flag is stored as a boolean on the prenatal enrollment record and updated on each visit evaluation. This flag feeds Phase 8 ML at-risk classifier

### Postpartum enrollment flow
- **Entry point:** "Record Delivery" button on the **Prenatal tab** (not a standalone postpartum enrollment flow)
- **Dialog fields:** delivery date (manual date picker — required), outcome (radio: Live birth / Stillbirth / Abortion), place of delivery (free text — optional)
- **On save:** Prenatal enrollment status → "Delivered". System auto-creates a postpartum enrollment and computes the three scheduled visit dates (Day 1, Week 1, Week 6) from the entered delivery date. Postpartum tab becomes active
- **Live birth prompt:** After saving delivery, a dialog appears: "Would you like to register the newborn for EPI?" — "Register Newborn" opens the Patient Registration form pre-filled with mother's barangay and BHS. "Skip" closes without action. The newborn is a separate patient record (correct data model — not linked under the mother's patient record)

### EPI vaccine schedule
- Hard-coded Philippine DOH EPI schedule (not configurable): BCG (×1), HepB-BD (×1), Penta/DTP-HepB-Hib (×3), OPV (×3), IPV (×1), PCV (×3), MMR (×1), Rotavirus (×2). Exact schedule from DOH immunization guidelines
- Dose sequence enforcement: backend rejects recording Dose N+1 if Dose N has no recorded date — returns a 422 with clear message
- FIC (Fully Immunized Child) computed per BHS per month: child is FIC when all required doses for their age cohort are completed. Stored on the EPI enrollment record and recomputed on each dose recording

### Nutrition / OPT+ program
- WHO Growth Standard tables for WAZ/HAZ/WHZ bundled as static lookup tables in the backend (not fetched at runtime)
- Z-scores auto-computed server-side from weight (kg), height (cm), and birthdate — returned in the visit response
- Vitamin A eligibility: 6–11 months (×1/year), 12–59 months (×2/year, April + August OPT+ cycles); determined at query time from child's age
- Deworming eligibility: ≥ 12 months, every 6 months

### Claude's Discretion
- Exact AOG-based prenatal visit schedule (frequency by trimester — standard DOH protocol)
- WHO Growth Standard lookup table format (CSV vs. Python dict vs. PostgreSQL table)
- Specific Celery task scheduling for nightly overdue detection refresh (vs. real-time computation on query)
- Whether FIC is a computed property on query or a stored field updated per dose recording
- Alembic migration structure for the new tables (4 enrollment tables + 4 visit tables)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Phase 3 patterns (extend, don't replace)
- `.planning/phases/03-patient-itr-core-data-model/03-CONTEXT.md` — `patient_id` FK standard, BaseRepository isolation pattern, Sheet panel form pattern, shadcn tab/table/sheet component usage, `CROSS_BHS_ROLES` pattern
- `.planning/phases/02-authentication-rbac-user-management/02-CONTEXT.md` — `require_role()`, `CurrentUser`, `BaseRepository._isolation_filter()`

### Core project constraints
- `.planning/PROJECT.md` §Compliance Requirements — RA 10173 (soft deletes), DOH DM 2024-0007 (FHSIS formulas that will aggregate this phase's data in Phase 8)
- `.planning/PROJECT.md` §Open Questions (Blocking) — `epi_vaccinations.vaccine` TEXT vs enum question (must resolve before Phase 4 migration)
- `.planning/milestones/v2-REQUIREMENTS.md` §Maternal Care — Prenatal (PRNT-01 to PRNT-06) — full field-level requirements for prenatal enrollment and visits
- `.planning/milestones/v2-REQUIREMENTS.md` §Maternal Care — Postpartum (PNPL-01 to PNPL-04) — postpartum schedule and visit requirements
- `.planning/milestones/v2-REQUIREMENTS.md` §Child Health — EPI (EPI-01 to EPI-07) — dose sequence, FIC, defaulter detection requirements
- `.planning/milestones/v2-REQUIREMENTS.md` §Child Health — Nutrition (NUTR-01 to NUTR-05) — Z-score, eligibility, at-risk trigger requirements

### Existing code (read before planning)
- `backend/app/core/base.py` — `TimestampMixin`, `SoftDeleteMixin`, `do_orm_execute` hook. All new enrollment and visit models must use both mixins
- `backend/app/repositories/base.py` — `BaseRepository`, `CROSS_BHS_ROLES`. All new repositories must inherit from `BaseRepository`
- `backend/app/models/patient.py` — FK target: all enrollment tables → `patients.id`
- `backend/app/models/health_station.py` — FK target: all enrollment tables → `health_stations.id`
- `frontend/src/pages/patients/PatientProfilePage.tsx` — existing tab structure (Consultations tab); Phase 4 adds 4 new tabs to this file

### No external DOH spec files exist in repo
- Philippine DOH EPI schedule and prenatal visit frequency to be sourced from DOH immunization guidelines (hardcoded in backend, not configurable)
- WHO Growth Standard tables (WHO Multicentre Growth Reference Study) — bundled as static data in backend

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `BaseRepository` (`backend/app/repositories/base.py`): All 4 new repositories (PrenatalRepository, EpiRepository, NutritionRepository, PostpartumRepository) inherit from this. BHS-scoping via `_isolation_filter()` is automatic
- `TimestampMixin` + `SoftDeleteMixin` (`backend/app/core/base.py`): Apply to all 8 new tables (4 enrollment + 4 visit)
- shadcn `tabs` component: Already installed. Phase 4 expands the existing Consultations tab set with 4 new tabs in `PatientProfilePage.tsx`
- shadcn `table`, `pagination`, `skeleton`: Already installed. Use for visit history tables in each program tab and overdue list pages
- shadcn `sheet`: Already installed. Use for "Add Visit" forms (prenatal visit, postpartum visit, EPI dose recording, nutrition assessment) — same pattern as Add Consultation Sheet in Phase 3
- shadcn `dialog`: Already installed. Use for "Record Delivery" dialog and "Register Newborn" prompt
- shadcn `badge`: Already installed. Use for HIGH RISK, FIC status, overdue count, and Z-score status badges
- Patient registration form at `frontend/src/pages/patients/RegisterPatientPage.tsx`: Reuse/link to from "Register Newborn" flow (pre-fill barangay + BHS from mother)

### Established Patterns
- All relationships: `lazy="raise"` — explicit joins only
- Async-first: all repository methods `async def`
- Router-level RBAC: `require_role(["nurse", "midwife"])` for write endpoints
- City-wide read access for `CROSS_BHS_ROLES` — CHO/DSO/coordinator can view any BHS's program records
- API feature modules: `frontend/src/features/` — create `maternal-child/` subdirectory with `api.ts` + `types.ts`
- Overdue detection: query-time computation (`WHERE next_visit_date < NOW() AND visit not recorded`) rather than a separate cron flag — avoids stale data

### Integration Points
- All new enrollment tables: `patient_id FK → patients.id`
- All new enrollment tables: `health_station_id FK → health_stations.id` (for BHS isolation)
- `prenatal_enrollments.is_high_risk BOOLEAN` → consumed by Phase 8 ML at-risk classifier
- `epi_enrollments` FIC indicator → consumed by Phase 8 barangay risk index ML
- `nutrition_visits.severe_wasting BOOLEAN` (WHZ < −3) → consumed by Phase 8 ML at-risk classifier
- Patient profile: `frontend/src/pages/patients/PatientProfilePage.tsx` extended with 4 new tabs

</code_context>

<specifics>
## Specific Ideas

- EPI tab uses a **vaccine grid** (rows = vaccine type, columns = dose number) with color-coded cells — at-a-glance schedule completeness view rather than a chronological list
- "Record Delivery" lives on the **Prenatal tab**, not the Postpartum tab — delivery is the closing event of prenatal care that opens postpartum care
- After recording a live birth delivery, prompt to "Register Newborn" pre-filled with mother's barangay/BHS — reduces data entry friction for the nurse
- Newborn is registered as a **separate patient** (not linked under the mother's record) — correct data model for EPI enrollment
- Overdue list pages are **read-only navigation hubs** — not action pages. Visit entry is always from the patient profile
- HIGH RISK badge is **program-scoped** (Prenatal tab only), not a patient-wide label on the identity header

</specifics>

<deferred>
## Deferred Ideas

- Mother–newborn linkage (explicit FK between mother's and newborn's patient records) — not needed in Phase 4; could be added in a later admin/records phase if clinically required
- Family Planning counseling recorded at postpartum visits — deferred (FP module is out of scope per PROJECT.md)
- Newborn Care / ENC (essential newborn care) — out of scope per PROJECT.md
- Growth chart visualization (weight/height trend graphs over time) — could be added as a polish feature; defer to after clinical core is complete
- MUAC-based community screening by BHW — Phase 9 offline PWA scope
- PhilHealth newborn package recording — out of operational scope for CHO 2

</deferred>

---

*Phase: 04-maternal-child-health-programs*
*Context gathered: 2026-03-18*
