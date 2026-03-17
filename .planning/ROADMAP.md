# Roadmap: Project LINK (HSMS)

## Overview

Project LINK delivers a two-tier health information system for CHO 2 Dasmarinas City in 9 phases over a 4-month capstone build. The build order follows strict dependency chains: infrastructure first (Docker, PostGIS, async patterns), then authentication and RBAC (everything depends on barangay isolation and role enforcement), then patient records (the unified ITR that all clinical modules reference), then two phases of clinical programs (maternal/child health, then TB/NCD) that generate the data consumed by downstream phases, then disease surveillance with real-time WebSocket alerts (the RA 11332 compliance centerpiece), then GIS visualization of that disease data, then ML analytics and FHSIS reporting as read-heavy aggregation layers, and finally offline PWA sync and inventory as a transport/utility layer over stable endpoints. The 9-phase structure separates concerns so each phase has a focused scope and can be verified independently.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: Infrastructure + DevOps** - Docker Compose environment, PostGIS seed data, async SQLAlchemy base patterns, Alembic migrations (completed 2026-03-15)
- [x] **Phase 2: Authentication + RBAC + User Management** - JWT auth (PyJWT), 7-role RBAC, barangay isolation, user management, audit logging (completed 2026-03-17)
- [ ] **Phase 3: Patient ITR + Core Data Model** - Unified patient registration, duplicate detection, BHS-scoped and city-wide search, general consultations
- [ ] **Phase 4: Maternal + Child Health Programs** - Prenatal, postpartum, EPI vaccination, and nutrition modules with scheduling, overdue detection, WHO Z-scores
- [ ] **Phase 5: TB-DOTS + NCD Programs** - TB case management with daily DOTS and sputum tracking, NCD enrollment with PhilPEN risk stratification
- [ ] **Phase 6: Disease Surveillance + Real-Time Alerts** - Category I/II disease cases, WebSocket alerts, PIDSR validation, Category II batch export
- [ ] **Phase 7: GIS Disease Mapping** - Barangay choropleth, purok heatmap, DBSCAN outbreak clustering, disease/date/barangay filters
- [ ] **Phase 8: ML Analytics + FHSIS Reporting** - Prophet forecasting, at-risk classifier, barangay risk index, FHSIS M1/M2/Q1/A1 auto-generation and export
- [ ] **Phase 9: Offline PWA + Inventory + CHO Dashboards** - BHW offline mobile entry, background sync, nurse approval queue, inventory tracking, CHO supervisory dashboards

## Phase Details

### Phase 1: Infrastructure + DevOps
**Goal**: A fully working local development environment with all 6 Docker services running, PostGIS seeded with Dasmarinas City barangay boundaries, async SQLAlchemy base patterns established, and Alembic async migrations working
**Depends on**: Nothing (first phase)
**Requirements**: INFRA-01, INFRA-02, INFRA-03, INFRA-04
**Success Criteria** (what must be TRUE):
  1. Developer can run `docker-compose up` and all 6 services (FastAPI backend, PostgreSQL/PostGIS, Redis, Celery worker, Celery Beat, nginx) start and pass health checks
  2. PostGIS contains barangay boundary polygons (SRID 4326) and health station point geometry for all 32 Dasmarinas City BHS, queryable via `ST_AsGeoJSON()`
  3. SQLAlchemy base model includes TimestampMixin, SoftDeleteMixin with `deleted_at TIMESTAMPTZ`, a global `do_orm_execute` hook that auto-injects `WHERE deleted_at IS NULL`, and `lazy="raise"` enforced on all relationships
  4. Alembic async migration can create tables with GeoAlchemy2 spatial columns and the `audit_logs` append-only table exists in the schema
**Plans**: 3 plans

Plans:
- [x] 01-01-PLAN.md — Docker Compose stack, FastAPI app factory, pytest harness and test stubs (INFRA-01)
- [x] 01-02-PLAN.md — Async SQLAlchemy base patterns, ORM models, Alembic async migrations, audit_logs (INFRA-02, INFRA-03)
- [ ] 01-03-PLAN.md — GIS seed data migration: barangay boundaries + BHS station points (INFRA-04)

### Phase 2: Authentication + RBAC + User Management
**Goal**: A real user can log in with email/password, receive JWT tokens (PyJWT), stay logged in across sessions, and log out with token revocation; system_admin can manage users and roles; all API endpoints enforce RBAC; barangay isolation enforced at repository layer; audit logging active
**Depends on**: Phase 1
**Requirements**: AUTH-01, AUTH-02, AUTH-03, AUTH-04, AUTH-05, AUTH-06, AUTH-07, AUTH-08, AUTH-09, AUTH-10
**Success Criteria** (what must be TRUE):
  1. User can log in with email/password, receive a JWT access + refresh token pair, stay logged in across browser sessions via refresh token rotation, and log out (refresh token revoked in `user_sessions` table)
  2. system_admin can create user accounts, assign any of the 7 RBAC roles, and assign users to a specific BHS; system_admin role is exclusive (cannot combine with clinical roles); nurse + DSO dual-role assignment works
  3. Every API endpoint enforces RBAC via `require_role()` — a BHW cannot access admin routes, a nurse cannot access another BHS's data, and unauthenticated requests receive 401
  4. BaseRepository auto-applies `health_station_id` filter on all clinical queries; city_health_officer and phis_coordinator bypass isolation for read-only cross-BHS access; DSO has PIDSR CRUD plus read-only cross-BHS access
  5. Every create/update/soft-delete operation writes to the append-only `audit_logs` table with no patient PII in log payloads
**Plans**: 8 plans

Plans:
- [ ] 02-01-PLAN.md — python-jose removal, PyJWT + pwdlib security.py, User + UserSession models, 0003 migration (AUTH-01, AUTH-02, AUTH-03, AUTH-05)
- [ ] 02-02-PLAN.md — Wave 0 test scaffold: test_auth/ and test_admin/ stubs for all 12 test cases (AUTH-01 through AUTH-10)
- [ ] 02-03-PLAN.md — Auth service + auth router (/auth/login, /refresh, /logout) + require_role() + CurrentUser + BaseRepository (AUTH-01, AUTH-02, AUTH-03, AUTH-05, AUTH-07, AUTH-08, AUTH-09, AUTH-10)
- [ ] 02-04-PLAN.md — AdminService + admin router (/admin/users CRUD + /admin/audit-logs) + system_admin exclusivity enforcement (AUTH-04, AUTH-06)
- [ ] 02-05-PLAN.md — Frontend scaffold: Vite+React+TS, shadcn init, design tokens in globals.css, IBM Plex fonts (AUTH-01, AUTH-07)
- [ ] 02-05b-PLAN.md — Auth infrastructure: Axios 401 interceptor, AuthContext, useAuth, ProtectedRoute, App router skeleton (AUTH-01, AUTH-02, AUTH-07)
- [ ] 02-06-PLAN.md — Login page (all UI-SPEC states) + Dashboard placeholder with logout (AUTH-01, AUTH-02, AUTH-03)
- [ ] 02-07-PLAN.md — Admin panel UI: user list table, Create/Edit modal, Deactivation AlertDialog, Activity Log tab (AUTH-04, AUTH-06)

### Phase 3: Patient ITR + Core Data Model
**Goal**: Nurse can register patients with a unified Individual Treatment Record, search within own BHS, get duplicate warnings, and record general consultation visits; CHO and PHIS Coordinator can search patients across all 32 BHS
**Depends on**: Phase 2
**Requirements**: ITR-01, ITR-02, ITR-03, ITR-04, ITR-05, ITR-06
**Success Criteria** (what must be TRUE):
  1. Nurse can register a new patient with full ITR fields (name, birthdate, sex, address with barangay/purok, contact number, PhilHealth number) and the patient is assigned to the nurse's BHS
  2. System detects potential duplicate patients (matching name + birthdate + sex) and alerts the registering user before saving; a single `patient_id` serves as foreign key across all program enrollment and visit tables
  3. Nurse can search patients within own BHS by name, birthdate, or barangay; CHO and PHIS Coordinator can search by name across all 32 BHS via GIN full-text index
  4. Nurse can record a general consultation visit against a patient (chief complaint, vitals, clinical notes, diagnosis, referral) and the visit appears in the patient's ITR timeline
**Plans**: TBD

Plans:
- [ ] 03-01: TBD
- [ ] 03-02: TBD

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
**Success Criteria** (what must be TRUE):
  1. Nurse can register a TB case (classification, treatment category, start date, assigned BHW), record daily DOTS observations with per-drug intake checkboxes (H/R/Z/E/S), track sputum exam schedule (Month 0/2/5/6) with overdue flags, and record contact tracing entries linked to the index case
  2. Confirmed TB case registration automatically creates a corresponding disease case record in the PIDSR module (available for Phase 6 surveillance); symptomatic investigation entries (presumptive TB) can be recorded; MDR-TB cases are recorded as referrals only
  3. Nurse can enroll a patient in NCD care (HTN, DM, or both with comorbidity flag), record HTN visits (BP, medication, PhilPEN risk level) and DM visits (FBS, medication, HbA1c referral flag), see controlled/uncontrolled classification per visit, and see auto-calculated monthly next visit dates
  4. Uncontrolled HTN and DM visit data is stored in a form consumable by the downstream ML at-risk patient classifier (Phase 8)
**Plans**: TBD

Plans:
- [ ] 05-01: TBD
- [ ] 05-02: TBD
- [ ] 05-03: TBD

### Phase 6: Disease Surveillance + Real-Time Alerts
**Goal**: DSO and CHO receive real-time Category I disease alerts within the RA 11332 24-hour window via WebSocket; PIDSR validation workflow active; Category II batch export working; WebSocket ConnectionManager handles JWT expiry and disconnection
**Depends on**: Phase 5
**Requirements**: SURV-01, SURV-02, SURV-03, SURV-04, SURV-05, SURV-06, SURV-07, SURV-08
**Success Criteria** (what must be TRUE):
  1. Nurse can record a Category I notifiable disease case; on save, DSO and CHO users who are online see a real-time WebSocket alert within seconds; DSO and CHO users who are offline see all unread alerts (stored in `disease_alerts` with per-user unread state) on next login
  2. DSO can validate a Category I case classification (recording `validated_at`); the system displays the time gap between `created_at` and `validated_at` as the RA 11332 compliance metric
  3. Nurse can record Category II disease cases; DSO can generate a weekly Friday batch export as PDF and Excel
  4. WebSocket connections authenticate via JWT query parameter; ConnectionManager handles token expiry mid-connection and cleans up disconnected clients without resource leaks
**Plans**: TBD

Plans:
- [ ] 06-01: TBD
- [ ] 06-02: TBD

### Phase 7: GIS Disease Mapping
**Goal**: CHO and DSO can visualize disease distribution on an interactive map with barangay choropleth, purok heatmap, and DBSCAN outbreak cluster detection, filtered by disease/barangay/date; all spatial responses return RFC 7946 GeoJSON
**Depends on**: Phase 6
**Requirements**: GIS-01, GIS-02, GIS-03, GIS-04, GIS-05
**Success Criteria** (what must be TRUE):
  1. CHO/DSO can view a barangay-level choropleth map showing disease case counts per barangay, rendered via MapLibre GL JS consuming PostGIS `ST_AsGeoJSON()` output
  2. CHO/DSO can view a purok-level heatmap for finer spatial resolution within barangays
  3. GIS map supports filtering by disease type, barangay, and date range; scope is dynamically filtered via `cho_barangay_assignments`; DBSCAN-identified outbreak clusters are highlighted as distinct map features
  4. All spatial API responses return valid RFC 7946 GeoJSON; the frontend renders without transformation or format conversion
**Plans**: TBD

Plans:
- [ ] 07-01: TBD
- [ ] 07-02: TBD

### Phase 8: ML Analytics + FHSIS Reporting
**Goal**: System produces nightly ML predictions (Prophet outbreak forecasts, at-risk patient classifier, barangay risk index) with confidence labels; PHIS Coordinator can view auto-generated FHSIS M1/M2/Q1/A1 reports, verify per indicator, and export as PDF/Excel
**Depends on**: Phase 7
**Requirements**: ML-01, ML-02, ML-03, ML-04, ML-05, ML-06, FHSIS-01, FHSIS-02, FHSIS-03, FHSIS-04, FHSIS-05, FHSIS-06, FHSIS-07, FHSIS-08
**Success Criteria** (what must be TRUE):
  1. Nightly Celery tasks train per-disease per-barangay Prophet models and compute barangay risk index; all ML inference uses `run_in_threadpool` or Celery (never blocks async endpoints); sparse data degrades gracefully (minimum data threshold, falls back to city-wide aggregation, no crashes)
  2. At-risk patient classifier consumes prenatal high-risk flags, severe wasting flags, and uncontrolled NCD data; risk scores appear on nurse dashboards; all ML outputs display confidence labels (HISTORICAL / SYNTHETIC / MIXED)
  3. PHIS Coordinator can view auto-generated M1 (monthly program), M2 (monthly morbidity), Q1 (quarterly activity), and A1 (annual summary) reports computed from live clinical data using DOH DM 2024-0007 formulas, scoped to CHO 2 assigned barangays
  4. PHIS Coordinator can verify each FHSIS indicator via per-indicator checkbox; export button is locked until all indicators are verified; verified reports export as PDF and Excel
  5. PHIS Coordinator dashboard shows data completeness status per BHS, flagging stations with zero or missing records before report deadlines
**Plans**: TBD

Plans:
- [ ] 08-01: TBD
- [ ] 08-02: TBD
- [ ] 08-03: TBD

### Phase 9: Offline PWA + Inventory + CHO Dashboards
**Goal**: BHWs perform offline clinical data entry on mobile via PWA with background sync, conflict resolution, and nurse approval workflow; nurses manage basic inventory with low-stock alerts; CHO supervisory dashboards show city-wide health status across all 32 BHS
**Depends on**: Phase 8
**Requirements**: SYNC-01, SYNC-02, SYNC-03, SYNC-04, SYNC-05, SYNC-06, SYNC-07, SYNC-08, SYNC-09, INV-01, INV-02, INV-03, INV-04, INV-05
**Success Criteria** (what must be TRUE):
  1. BHW can install the PWA on Android, fill out clinical entry forms while fully offline, and see records stored locally in IndexedDB with PENDING status; on reconnect, Service Worker triggers background sync (with fallback to online event listener and manual sync button)
  2. Synced records arrive at `POST /api/sync/batch`; server applies conflict resolution (newer server `updated_at` wins, clinical conflicts flagged for nurse review) and deduplication (same `patient_id + record_type + date + bhw_id` rejected); nurse sees pending records in an approval queue with queue age metric
  3. Approved BHW records (status APPROVED) flow into FHSIS report counts; PENDING records do not; returned records (status RETURNED) are visible to BHW for correction
  4. Nurse can view item catalog, record stock transactions (in/out/adjustment) for own BHS, and see low-stock alerts on dashboard; PHIS Coordinator can view inventory levels read-only across all 32 BHS
  5. CHO can view a supervisory dashboard showing city-wide health status aggregated across all 32 BHS — program coverage, overdue counts, alert status, and inventory levels
**Plans**: TBD

Plans:
- [ ] 09-01: TBD
- [ ] 09-02: TBD
- [ ] 09-03: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 1 -> 2 -> 3 -> 4 -> 5 -> 6 -> 7 -> 8 -> 9

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Infrastructure + DevOps | 3/3 | Complete   | 2026-03-15 |
| 2. Authentication + RBAC + User Management | 9/9 | Complete   | 2026-03-17 |
| 3. Patient ITR + Core Data Model | 0/2 | Not started | - |
| 4. Maternal + Child Health Programs | 0/3 | Not started | - |
| 5. TB-DOTS + NCD Programs | 0/3 | Not started | - |
| 6. Disease Surveillance + Real-Time Alerts | 0/2 | Not started | - |
| 7. GIS Disease Mapping | 0/2 | Not started | - |
| 8. ML Analytics + FHSIS Reporting | 0/3 | Not started | - |
| 9. Offline PWA + Inventory + CHO Dashboards | 0/3 | Not started | - |
