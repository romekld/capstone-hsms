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

- [ ] **Phase 3: Patient ITR + Core Data Model** — Unified patient registration, duplicate detection, BHS-scoped and city-wide search, general consultations
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

## Progress

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 1. Infrastructure + DevOps | v2 | 3/3 | Complete | 2026-03-15 |
| 2. Authentication + RBAC + User Management | v2 | 9/9 | Complete | 2026-03-17 |
| 3. Patient ITR + Core Data Model | 3/5 | In Progress|  | - |
| 4. Maternal + Child Health Programs | v3 | 0/TBD | Not started | - |
| 5. TB-DOTS + NCD Programs | v3 | 0/TBD | Not started | - |
| 6. Disease Surveillance + Real-Time Alerts | v3 | 0/TBD | Not started | - |
| 7. GIS Disease Mapping | v3 | 0/TBD | Not started | - |
| 8. ML Analytics + FHSIS Reporting | v3 | 0/TBD | Not started | - |
| 9. Offline PWA + Inventory + CHO Dashboards | v3 | 0/TBD | Not started | - |
