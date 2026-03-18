# Roadmap: Project LINK (HSMS)

## Overview

Project LINK delivers a two-tier health information system for CHO 2 Dasmarinas City in 9 phases over a 4-month capstone build.

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
- [ ] **Phase 4: Maternal + Child Health Programs** — Prenatal, postpartum, EPI vaccination, and nutrition modules with scheduling, overdue detection, WHO Z-scores
- [ ] **Phase 5: TB-DOTS + NCD Programs** — TB case management with daily DOTS and sputum tracking, NCD enrollment with PhilPEN risk stratification
- [ ] **Phase 6: Disease Surveillance + Real-Time Alerts** — Category I/II disease cases, WebSocket alerts, PIDSR validation, Category II batch export
- [ ] **Phase 7: GIS Disease Mapping** — Barangay choropleth, purok heatmap, DBSCAN outbreak clustering, disease/date/barangay filters
- [ ] **Phase 8: ML Analytics + FHSIS Reporting** — Prophet forecasting, at-risk classifier, barangay risk index, FHSIS M1/M2/Q1/A1 auto-generation and export
- [ ] **Phase 9: Offline PWA + Inventory + CHO Dashboards** — BHW offline mobile entry, background sync, nurse approval queue, inventory tracking, CHO supervisory dashboards

## Phase Details

### Phase 4: Maternal + Child Health Programs
**Goal**: Nurses manage the full lifecycle of maternal care (prenatal + postpartum) and child health (EPI + nutrition) with automated scheduling, continuous overdue detection, WHO Z-score classification, and dose sequence enforcement
**Depends on**: Phase 3
**Requirements**: PRNT-01, PRNT-02, PRNT-03, PRNT-04, PRNT-05, PRNT-06, PNPL-01, PNPL-02, PNPL-03, PNPL-04, EPI-01, EPI-02, EPI-03, EPI-04, EPI-05, EPI-06, EPI-07, NUTR-01, NUTR-02, NUTR-03, NUTR-04, NUTR-05
**Success Criteria** (what must be TRUE):
  1. Nurse can enroll a patient in prenatal care, record prenatal visits with all clinical fields, see auto-calculated next visit dates based on AOG, see overdue flags the moment a visit is missed, and see high-risk indicators flagged on the dashboard — same lifecycle for postpartum (Day 1 / Week 1 / Week 6 schedule auto-calculated from delivery date)
  2. Nurse can enroll a child in EPI, record vaccine doses with sequence enforcement (cannot give DPT-2 before DPT-1), see auto-scheduled next dose dates, and see defaulter flags the instant a scheduled date passes; FIC indicator computes correctly per BHS per month
  3. Nurse can record a nutrition assessment visit and see WHO Z-score classifications (WAZ, HAZ, WHZ) auto-computed; severe wasting (WHZ < -3) triggers an at-risk flag; Vitamin A, iron, and deworming eligibility determined by age band and OPT+ cycle
  4. High-risk prenatal flags, EPI coverage gaps, and severe wasting flags are stored in a form consumable by the downstream ML at-risk patient classifier (Phase 8)
**Plans**: TBD

Plans:
- [ ] 04-01: TBD
- [ ] 04-02: TBD
- [ ] 04-03: TBD

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
| 3. Patient ITR + Core Data Model | 5/5 | Complete   | 2026-03-18 | - |
| 4. Maternal + Child Health Programs | v3 | 0/TBD | Not started | - |
| 5. TB-DOTS + NCD Programs | v3 | 0/TBD | Not started | - |
| 6. Disease Surveillance + Real-Time Alerts | v3 | 0/TBD | Not started | - |
| 7. GIS Disease Mapping | v3 | 0/TBD | Not started | - |
| 8. ML Analytics + FHSIS Reporting | v3 | 0/TBD | Not started | - |
| 9. Offline PWA + Inventory + CHO Dashboards | v3 | 0/TBD | Not started | - |
