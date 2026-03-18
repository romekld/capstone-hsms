# Roadmap: Project LINK (HSMS)

## Overview

Project LINK delivers a two-tier health information system for CHO 2 Dasmarinas City in 9 phases (with Phase 4 split into 4 vertical sub-phases) over a 4-month capstone build.

## Milestones

- ✅ **v2 Foundation** — Phases 1–2 (shipped 2026-03-18)
- 📋 **v3 Clinical Core** — Phases 3–9 (planned)

## Phases

<details>
<summary>✅ v2 Foundation (Phases 1–2) — SHIPPED 2026-03-18</summary>

- [x] Phase 1: Infrastructure + DevOps (3/3 plans) — completed 2026-03-15
- [x] Phase 2: Authentication + RBAC + User Management (9/9 plans) — completed 2026-03-17

See `.planning/milestones/v2-ROADMAP.md` for full phase details.

</details>

### 📋 v3 Clinical Core (Phases 3–9)

- [x] **Phase 3: Patient ITR + Core Data Model** — Unified patient registration, duplicate detection, BHS-scoped and city-wide search, general consultations (completed 2026-03-18)
  - **Goal:** Working patient registration and consultation recording system with city-wide duplicate detection and BHS-scoped access control
  - **Requirements:** [P3-01, P3-02, P3-03, P3-04, P3-05, P3-06, P3-07, P3-08, P3-09, P3-10]
  - **Plans:** 5 plans
    - [x] 03-01-PLAN.md — Patient + Consultation ORM models, Pydantic schemas, Alembic migration
    - [ ] 03-02-PLAN.md — Backend API layer: repositories, service, router with RBAC + audit logging
    - [ ] 03-03-PLAN.md — Frontend types, API client, Patient Search page with sidebar integration
    - [ ] 03-04-PLAN.md — Patient registration page with duplicate detection UX
    - [ ] 03-05-PLAN.md — Patient profile page + Add Consultation page
- [ ] **Phase 4: Maternal + Child Health Programs** *(head phase — delivered via sub-phases 4.1–4.4)*
  - [ ] **Phase 4.1: MCH Shared Data Model** — ORM models, Pydantic schemas, and single Alembic migration for all eight MCH tables (prenatal, postpartum, EPI, nutrition)
  - [ ] **Phase 4.2: Prenatal + Postpartum Programs** — Prenatal enrollment/visits/overdue/high-risk flags + postpartum delivery recording with Day 1/Week 1/Week 6 auto-schedule
  - [ ] **Phase 4.3: EPI Vaccination Program** — Dose sequence enforcement, vaccine grid UI, auto-scheduling, defaulter detection, FIC computation
  - [ ] **Phase 4.4: Nutrition / OPT+ Program** — WHO Z-score auto-computation, severe wasting at-risk flag, Vitamin A/iron/deworming eligibility by age band
- [ ] **Phase 5: TB-DOTS + NCD Programs** — TB case management with daily DOTS and sputum tracking, NCD enrollment with PhilPEN risk stratification
- [ ] **Phase 6: Disease Surveillance + Real-Time Alerts** — Category I/II disease cases, WebSocket alerts, PIDSR validation, Category II batch export
- [ ] **Phase 7: GIS Disease Mapping** — Barangay choropleth, purok heatmap, DBSCAN outbreak clustering, disease/date/barangay filters
- [ ] **Phase 8: ML Analytics + FHSIS Reporting** — Prophet forecasting, at-risk classifier, barangay risk index, FHSIS M1/M2/Q1/A1 auto-generation and export
- [ ] **Phase 9: Offline PWA + Inventory + CHO Dashboards** — BHW offline mobile entry, background sync, nurse approval queue, inventory tracking, CHO supervisory dashboards

## Phase Details

### Phase 4: Maternal + Child Health Programs
**Goal**: Nurses manage the full lifecycle of maternal care (prenatal + postpartum) and child health (EPI + nutrition) with automated scheduling, continuous overdue detection, WHO Z-score classification, and dose sequence enforcement. Delivered as four vertical slices (4.1–4.4), each executable independently after 4.1 (shared schema) is complete.
**Depends on**: Phase 3
**Requirements**: PRNT-01 through PRNT-06, PNPL-01 through PNPL-04, EPI-01 through EPI-07, NUTR-01 through NUTR-05
**Sub-phases**: 4.1, 4.2, 4.3, 4.4

### Phase 4.1: MCH Shared Data Model
**Goal**: Create ORM models, Pydantic schemas, and a single Alembic migration for all eight MCH tables — `prenatal_enrollments`, `prenatal_visits`, `postpartum_enrollments`, `postpartum_visits`, `epi_enrollments`, `epi_vaccinations`, `nutrition_enrollments`, `nutrition_visits` — with soft deletes, BHS isolation FKs, and ML integration fields ready for downstream consumption
**Depends on**: Phase 3
**Requirements**: Field definitions from PRNT-01, PNPL-01, EPI-01, NUTR-01
**Success Criteria** (what must be TRUE):
  1. All 8 tables exist in the database with correct FK constraints (`patients.id`, `health_stations.id`), `TimestampMixin`, and `SoftDeleteMixin`
  2. `prenatal_enrollments.is_high_risk BOOLEAN`, `epi_enrollments.fic_status BOOLEAN`, and `nutrition_visits.severe_wasting BOOLEAN` are present and ready for Phase 8 ML consumption
  3. Pydantic v2 schemas cover create/update/response for all 8 models
  4. `epi_vaccinations.vaccine` uses TEXT (not PostgreSQL ENUM); validated at Pydantic layer
**Plans**: TBD

Plans:
- [ ] 04.1-01: TBD

### Phase 4.2: Prenatal + Postpartum Programs
**Goal**: Nurses manage the full prenatal lifecycle (enrollment → AOG-based visit scheduling → overdue detection → high-risk flagging) and postpartum care (delivery recording auto-creates postpartum enrollment with Day 1 / Week 1 / Week 6 schedule), with program tabs on patient profile and dedicated overdue list pages
**Depends on**: Phase 4.1
**Requirements**: PRNT-01, PRNT-02, PRNT-03, PRNT-04, PRNT-05, PRNT-06, PNPL-01, PNPL-02, PNPL-03, PNPL-04
**Success Criteria** (what must be TRUE):
  1. Nurse can enroll a patient in prenatal care, record visits with all clinical fields (AOG, BP, weight, Hgb, GDM), see auto-calculated next visit dates, and see overdue flags the moment a visit is missed
  2. High-risk auto-flags trigger on BP ≥ 140/90, Hgb < 11 g/dL, para ≥ 5, GDM positive, or manual nurse flag; HIGH RISK badge on Prenatal tab only (not patient identity header)
  3. "Record Delivery" on the Prenatal tab closes prenatal enrollment, auto-creates postpartum enrollment with scheduled dates, and prompts "Register Newborn" for live births
  4. Prenatal and Postpartum overdue list pages show live counts; sidebar nav badges update automatically when visits are recorded
**Plans**: TBD

Plans:
- [ ] 04.2-01: TBD
- [ ] 04.2-02: TBD
- [ ] 04.2-03: TBD

### Phase 4.3: EPI Vaccination Program
**Goal**: Nurses manage EPI vaccination lifecycle with Philippine DOH dose sequence enforcement, auto-scheduled next dose dates, defaulter detection, and per-BHS per-month FIC computation
**Depends on**: Phase 4.1
**Requirements**: EPI-01, EPI-02, EPI-03, EPI-04, EPI-05, EPI-06, EPI-07
**Success Criteria** (what must be TRUE):
  1. Nurse can enroll a child in EPI and record vaccine doses; backend rejects Dose N+1 if Dose N is unrecorded (422 with clear message)
  2. EPI tab shows a vaccine grid (rows = vaccine type, columns = dose number) with color-coded cells: ✅ given / scheduled / overdue / not applicable
  3. FIC indicator computes correctly per BHS per month; EPI defaulter list page with sidebar badge works
**Plans**: TBD

Plans:
- [ ] 04.3-01: TBD
- [ ] 04.3-02: TBD

### Phase 4.4: Nutrition / OPT+ Program
**Goal**: Nurses record nutrition assessment visits and see WHO Z-score classifications (WAZ, HAZ, WHZ) auto-computed server-side; severe wasting (WHZ < −3) triggers an at-risk flag; Vitamin A, iron, and deworming eligibility determined by age band and OPT+ cycle
**Depends on**: Phase 4.1
**Requirements**: NUTR-01, NUTR-02, NUTR-03, NUTR-04, NUTR-05
**Success Criteria** (what must be TRUE):
  1. Nurse enters weight (kg), height (cm), MUAC, and birthdate; server returns WAZ/HAZ/WHZ with color-coded status labels (Normal / Underweight / Wasted / Stunted / Severe Wasting)
  2. WHZ < −3 sets `severe_wasting = TRUE` on the visit record for Phase 8 ML consumption
  3. Eligibility row on Nutrition tab shows Vitamin A / iron / deworming status computed from child's current age and OPT+ cycle (April / August)
**Plans**: TBD

Plans:
- [ ] 04.4-01: TBD
- [ ] 04.4-02: TBD

### Phase 5: TB-DOTS + NCD Programs
**Goal**: Nurses manage TB case registration with daily DOTS recording, sputum schedule tracking, and contact tracing; NCD enrollment covers HTN and DM with PhilPEN risk stratification, controlled/uncontrolled classification, and monthly scheduling
**Depends on**: Phase 3
**Requirements**: TB-01, TB-02, TB-03, TB-04, TB-05, TB-06, TB-07, NCD-01, NCD-02, NCD-03, NCD-04, NCD-05, NCD-06
**Success Criteria**: TB case management, NCD enrollment, PhilPEN risk stratification
**Plans**: TBD

Plans:
- [ ] 05-01: TBD
- [ ] 05-02: TBD
- [ ] 05-03: TBD

### Phase 6: Disease Surveillance + Real-Time Alerts
**Goal**: DSO and CHO receive real-time Category I disease alerts within the RA 11332 24-hour window via WebSocket; PIDSR validation workflow active; Category II batch export working
**Depends on**: Phase 5
**Requirements**: SURV-01, SURV-02, SURV-03, SURV-04, SURV-05, SURV-06, SURV-07, SURV-08
**Success Criteria**: WebSocket alerts, PIDSR validation, Category II export
**Plans**: TBD

Plans:
- [ ] 06-01: TBD
- [ ] 06-02: TBD

### Phase 7: GIS Disease Mapping
**Goal**: CHO and DSO can visualize disease distribution on an interactive map with barangay choropleth, purok heatmap, and DBSCAN outbreak cluster detection, filtered by disease/barangay/date
**Depends on**: Phase 6
**Requirements**: GIS-01, GIS-02, GIS-03, GIS-04, GIS-05
**Success Criteria**: Choropleth map, heatmap, DBSCAN clusters, GeoJSON API
**Plans**: TBD

Plans:
- [ ] 07-01: TBD
- [ ] 07-02: TBD

### Phase 8: ML Analytics + FHSIS Reporting
**Goal**: System produces nightly ML predictions with confidence labels; PHIS Coordinator can view auto-generated FHSIS M1/M2/Q1/A1 reports, verify per indicator, and export as PDF/Excel
**Depends on**: Phase 7
**Requirements**: ML-01, ML-02, ML-03, ML-04, ML-05, ML-06, FHSIS-01, FHSIS-02, FHSIS-03, FHSIS-04, FHSIS-05, FHSIS-06, FHSIS-07, FHSIS-08
**Success Criteria**: Prophet forecasting, at-risk classifier, FHSIS reports, PDF/Excel export
**Plans**: TBD

Plans:
- [ ] 08-01: TBD
- [ ] 08-02: TBD
- [ ] 08-03: TBD

### Phase 9: Offline PWA + Inventory + CHO Dashboards
**Goal**: BHWs perform offline clinical data entry via PWA with background sync, conflict resolution, and nurse approval workflow; inventory tracking; CHO supervisory dashboards
**Depends on**: Phase 8
**Requirements**: SYNC-01, SYNC-02, SYNC-03, SYNC-04, SYNC-05, SYNC-06, SYNC-07, SYNC-08, SYNC-09, INV-01, INV-02, INV-03, INV-04, INV-05
**Success Criteria**: Offline PWA, background sync, nurse approval queue, inventory, CHO dashboards
**Plans**: TBD

Plans:
- [ ] 09-01: TBD
- [ ] 09-02: TBD
- [ ] 09-03: TBD

## Progress

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 1. Infrastructure + DevOps | v2 | 3/3 | Complete | 2026-03-15 |
| 2. Authentication + RBAC + User Management | v2 | 9/9 | Complete | 2026-03-17 |
| 3. Patient ITR + Core Data Model | v3 | 5/5 | Complete | 2026-03-18 |
| 4. Maternal + Child Health Programs | v3 | — | Head phase (see 4.1–4.4) | — |
| 4.1. MCH Shared Data Model | v3 | 0/TBD | Not started | — |
| 4.2. Prenatal + Postpartum Programs | v3 | 0/TBD | Not started | — |
| 4.3. EPI Vaccination Program | v3 | 0/TBD | Not started | — |
| 4.4. Nutrition / OPT+ Program | v3 | 0/TBD | Not started | — |
| 5. TB-DOTS + NCD Programs | v3 | 0/TBD | Not started | — |
| 6. Disease Surveillance + Real-Time Alerts | v3 | 0/TBD | Not started | — |
| 7. GIS Disease Mapping | v3 | 0/TBD | Not started | — |
| 8. ML Analytics + FHSIS Reporting | v3 | 0/TBD | Not started | — |
| 9. Offline PWA + Inventory + CHO Dashboards | v3 | 0/TBD | Not started | — |
