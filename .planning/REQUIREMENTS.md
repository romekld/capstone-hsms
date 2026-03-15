# Requirements: Project LINK (HSMS)

**Defined:** 2026-03-15
**Core Value:** City Health Officer and DSO can detect a Category I disease outbreak and respond within the RA 11332 24-hour window — something structurally impossible under the current paper system.

---

## v1 Requirements

Requirements for the 4-month capstone build. Each maps to a roadmap phase.

### Infrastructure (INFRA)

- [x] **INFRA-01**: System runs in Docker Compose with 6 services: FastAPI backend, PostgreSQL + PostGIS, Redis, Celery worker, Celery Beat (separate container), nginx reverse proxy
- [x] **INFRA-02**: All clinical database tables use soft deletes (`deleted_at TIMESTAMPTZ`); hard DELETE is never issued on patient data (RA 10173)
- [x] **INFRA-03**: Append-only `audit_logs` table records all create/update/soft-delete operations; no patient PII appears in server logs or error messages
- [ ] **INFRA-04**: Barangay health station boundary and point geometry data is seeded into PostGIS (SRID 4326) from Dasmariñas City shapefile (HDX source)

### Authentication & Authorization (AUTH)

- [ ] **AUTH-01**: User can log in with email and password; session persists via JWT access + refresh token pair
- [ ] **AUTH-02**: User can log out; refresh token is revoked server-side via `user_sessions` table
- [ ] **AUTH-03**: System enforces 7 RBAC roles: `system_admin`, `city_health_officer`, `physician`, `phis_coordinator`, `disease_surveillance_officer`, `nurse`/`midwife`, `bhw`
- [ ] **AUTH-04**: `system_admin` role is exclusive — no combination with any clinical role is permitted
- [ ] **AUTH-05**: A user may hold `nurse` + `disease_surveillance_officer` simultaneously (BHS Surveillance Focal Person)
- [ ] **AUTH-06**: `system_admin` can create user accounts, assign roles, and assign users to a barangay health station
- [ ] **AUTH-07**: All API endpoints enforce RBAC via `require_role()` FastAPI dependency at the router layer
- [ ] **AUTH-08**: All clinical data queries are filtered by the requesting user's `health_station_id` at the repository layer (barangay isolation)
- [ ] **AUTH-09**: `city_health_officer` and `phis_coordinator` have read-only access to data from all 32 BHS
- [ ] **AUTH-10**: `disease_surveillance_officer` has PIDSR CRUD access plus read-only on all other clinical data across all 32 BHS

### Patient ITR (ITR)

- [ ] **ITR-01**: Nurse/midwife can register a new patient with a unified Individual Treatment Record (ITR) — name, birthdate, sex, address (barangay/purok), contact number, PhilHealth number
- [ ] **ITR-02**: City Health Officer and PHIS Coordinator can search patients by name across all 32 BHS via GIN full-text index
- [ ] **ITR-03**: Nurse/midwife can search patients within their own BHS by name, birthdate, or barangay
- [ ] **ITR-04**: System detects potential duplicate patients (same name + birthdate + sex) and alerts the registering user before saving
- [ ] **ITR-05**: A single `patient_id` is the foreign key on all program enrollment and visit tables — patient identity is never duplicated per program
- [ ] **ITR-06**: Nurse/midwife can record a general consultation visit against a patient (chief complaint, vitals, clinical notes, diagnosis, referral)

### Maternal Care — Prenatal (PRNT)

- [ ] **PRNT-01**: Nurse/midwife can enroll a patient in prenatal care (gravida, para, LMP, EDC, risk factors)
- [ ] **PRNT-02**: Nurse/midwife can record a prenatal visit (AOG, weight, BP, fundic height, FHT, presentation, edema, laboratory results, TT dose, iron supplementation, counseling)
- [ ] **PRNT-03**: System auto-calculates `next_visit_date` based on AOG and clinic schedule after each prenatal visit
- [ ] **PRNT-04**: System continuously flags overdue prenatal visits (missed `next_visit_date` without recorded visit) — not relying on monthly tally
- [ ] **PRNT-05**: System flags patients with high-risk indicators (e.g., high BP, abnormal labs) for elevated priority on nurse dashboard
- [ ] **PRNT-06**: High-risk prenatal flag propagates as input to the ML at-risk patient classifier

### Maternal Care — Postpartum (PNPL)

- [ ] **PNPL-01**: Nurse/midwife can create a postpartum enrollment linked to a patient's prenatal record via `patient_id`, with manually entered delivery date (originating from birthing facility)
- [ ] **PNPL-02**: System auto-calculates the three postpartum visit schedule dates (Day 1, Week 1, Week 6) from the entered delivery date
- [ ] **PNPL-03**: Nurse/midwife can record postpartum visits (BP, wound/uterine involution status, breastfeeding, family planning counseling, newborn status)
- [ ] **PNPL-04**: System flags overdue postpartum visits continuously

### Child Health — EPI (EPI)

- [ ] **EPI-01**: Nurse/midwife can enroll a child in the EPI program
- [ ] **EPI-02**: Nurse/midwife can record vaccine dose administration (vaccine type, dose number, date, lot number, site, administered by)
- [ ] **EPI-03**: System enforces dose sequence — prevents recording a dose out of order (e.g., DPT-2 before DPT-1)
- [ ] **EPI-04**: System auto-schedules next dose date based on EPI schedule and child's age
- [ ] **EPI-05**: System detects EPI defaulters at the moment a scheduled dose date passes without a recorded administration — not at month-end tally
- [ ] **EPI-06**: System computes Fully Immunized Child (FIC) indicator per BHS per month from recorded vaccination data
- [ ] **EPI-07**: EPI coverage gaps (low FIC rate) feed into the barangay risk index ML computation

### Child Health — Nutrition (NUTR)

- [ ] **NUTR-01**: Nurse/midwife can enroll a child in the OPT+ nutrition program
- [ ] **NUTR-02**: Nurse/midwife can record a nutrition assessment visit (weight, height, MUAC, date of assessment)
- [ ] **NUTR-03**: System auto-computes WHO Z-scores (WAZ — weight-for-age, HAZ — height-for-age, WHZ — weight-for-height) from recorded measurements and classifies nutritional status
- [ ] **NUTR-04**: System determines Vitamin A, iron supplementation, and deworming eligibility at query time based on age bands and OPT+ cycle timing (April and August cycles)
- [ ] **NUTR-05**: Severe wasting classification (WHZ < −3) automatically triggers an at-risk flag to the ML patient risk classifier

### TB-DOTS (TB)

- [ ] **TB-01**: Nurse/midwife can register a TB case (patient link, case classification — new/relapse/treatment failure, treatment category, treatment start date, assigned BHW)
- [ ] **TB-02**: BHW or nurse can record a daily DOTS observation visit with per-drug intake checkbox (H — Isoniazid, R — Rifampicin, Z — Pyrazinamide, E — Ethambutol, S — Streptomycin)
- [ ] **TB-03**: System tracks the sputum examination schedule (Month 0, Month 2, Month 5, Month 6) and flags overdue sputum exams
- [ ] **TB-04**: Nurse/midwife can record TB contact tracing entries linked to the index case
- [ ] **TB-05**: A confirmed TB case registration automatically creates a corresponding disease case record in the PIDSR module
- [ ] **TB-06**: System records TB symptomatic investigation entries (presumptive TB tracking)
- [ ] **TB-07**: MDR-TB cases are recorded as referrals only — treatment tracking for MDR is out of scope

### NCD — Hypertension & Diabetes (NCD)

- [ ] **NCD-01**: Nurse/midwife can enroll a patient in NCD care, specifying HTN, DM, or both (comorbidity flag)
- [ ] **NCD-02**: Nurse/midwife can record an HTN visit (BP reading, antihypertensive medication, compliance, PhilPEN risk level: low/medium/high, dietary counseling, RHU physician referral)
- [ ] **NCD-03**: Nurse/midwife can record a DM visit (FBS result, oral hypoglycemic/insulin medication, compliance, HbA1c referral flag, dietary counseling, RHU physician referral)
- [ ] **NCD-04**: System classifies each NCD visit as controlled or uncontrolled based on recorded BP and FBS values
- [ ] **NCD-05**: System auto-calculates `next_visit_date` on a monthly cycle after each visit
- [ ] **NCD-06**: Uncontrolled HTN and DM visit data feeds into the ML at-risk patient classifier

### Disease Surveillance (SURV)

- [ ] **SURV-01**: Nurse/midwife can record a Category I notifiable disease case (AFP, Cholera, Meningococcemia, Neonatal Tetanus, SARS, Unusual Events including rabies death)
- [ ] **SURV-02**: On save of a Category I case, system immediately inserts a row in `disease_alerts` AND broadcasts a WebSocket payload to all connected `city_health_officer` and `disease_surveillance_officer` sessions
- [ ] **SURV-03**: `disease_alerts` table stores unread state per user — DSO and CHO who are offline when an alert fire see all unread alerts on next login
- [ ] **SURV-04**: DSO can validate a Category I case classification (records `validated_at`); the gap between `created_at` and `validated_at` is the RA 11332 compliance metric
- [ ] **SURV-05**: Nurse/midwife can record a Category II notifiable disease case (Dengue/DHF, ARI, Diarrhea/AGE, ILI, Chickenpox, Measles, Hepatitis A, Leptospirosis, HFMD, Typhoid, Pneumonia)
- [ ] **SURV-06**: DSO can export Category II disease cases as a weekly batch report (PDF and Excel) every Friday
- [ ] **SURV-07**: WebSocket connections are authenticated via JWT query parameter (`ws://host/ws/alerts?token=...`)
- [ ] **SURV-08**: WebSocket `ConnectionManager` handles token expiry mid-connection and cleans up disconnected clients

### Basic Inventory (INV)

- [ ] **INV-01**: System maintains an item catalog of medicines, vaccines, and supplies (seeded from CHO 2 data provided by supply staff)
- [ ] **INV-02**: System tracks current stock quantity on hand per item per BHS (`inventory_stock` table)
- [ ] **INV-03**: Nurse/midwife can record stock transactions (stock-in, stock-out, manual adjustment) with timestamp, quantity, and performing user for own BHS only
- [ ] **INV-04**: System generates low-stock alerts when item quantity falls below configurable threshold; alerts appear on nurse/midwife dashboard
- [ ] **INV-05**: PHIS Coordinator can view inventory levels read-only across all 32 BHS

### GIS Disease Mapping (GIS)

- [ ] **GIS-01**: System renders a barangay-level choropleth map showing disease case counts per barangay using MapLibre GL JS and PostGIS `ST_AsGeoJSON()` (RFC 7946)
- [ ] **GIS-02**: System renders a purok-level heatmap for finer spatial resolution within barangays
- [ ] **GIS-03**: GIS map can be filtered by disease type, barangay, and date range; scope is dynamically filtered via `cho_barangay_assignments`
- [ ] **GIS-04**: System applies DBSCAN spatial clustering (scikit-learn) to detected disease cases to identify and highlight geographic outbreak clusters on the map
- [ ] **GIS-05**: All spatial API responses use `ST_AsGeoJSON()` (RFC 7946 GeoJSON format); MapLibre GL JS consumes GeoJSON natively

### ML Predictive Analytics (ML)

- [ ] **ML-01**: System runs a nightly Celery task to train/update per-disease per-barangay Prophet time-series models using `disease_cases` historical records; predictions and confidence bounds stored in `ml_disease_forecasts`
- [ ] **ML-02**: System runs a scikit-learn at-risk patient classifier consuming prenatal high-risk flags, nutrition severe wasting flags, and uncontrolled NCD visit data; risk scores written to `ml_patient_risk_scores`
- [ ] **ML-03**: System runs a nightly Celery task to compute a composite barangay risk index (disease case counts 30-day window + overdue patient counts + EPI coverage gaps) written to `barangay_risk_index`
- [ ] **ML-04**: All ML inference is executed via `run_in_threadpool()` or Celery tasks — never blocking async FastAPI endpoints
- [ ] **ML-05**: All ML outputs display a confidence label indicating training data source: HISTORICAL, SYNTHETIC, or MIXED
- [ ] **ML-06**: System implements minimum data thresholds before fitting Prophet models; falls back to city-wide aggregation when per-barangay data is insufficient; graceful degradation (no crash) on sparse data

### FHSIS Auto-Report Generation (FHSIS)

- [ ] **FHSIS-01**: System auto-generates M1 (Monthly Program Report) from live maternal, child, TB, NCD, and disease program data using DOH DM 2024-0007 indicator formulas
- [ ] **FHSIS-02**: System auto-generates M2 (Monthly Morbidity Report — top-10 causes by age/sex per barangay/month) from disease case and morbidity data
- [ ] **FHSIS-03**: System auto-generates Q1 (Quarterly Field Health Service Activity Report) from program data
- [ ] **FHSIS-04**: System auto-generates A1 (Annual Catchment Area Summary) from full-year program data
- [ ] **FHSIS-05**: All FHSIS reports are scoped dynamically to CHO 2's currently assigned barangays via `cho_barangay_assignments`
- [ ] **FHSIS-06**: PHIS Coordinator reviews each FHSIS indicator with a per-indicator verification checkbox; export button is locked until all indicators are verified
- [ ] **FHSIS-07**: System exports verified FHSIS reports as PDF and Excel files for manual PHO submission
- [ ] **FHSIS-08**: PHIS Coordinator dashboard shows data completeness status per BHS (flags stations with zero or missing records before report period deadline)

### Offline PWA / BHW Mobile Sync (SYNC)

- [ ] **SYNC-01**: BHW mobile interface is a Progressive Web App (PWA) installable on Android; all clinical entry forms are functional offline
- [ ] **SYNC-02**: Records created offline are stored in IndexedDB (via Dexie.js) with `local_id UUID` and `status = PENDING`
- [ ] **SYNC-03**: Service Worker triggers background sync on reconnect; falls back to `online` event listener and manual sync button if Background Sync API is unavailable (Safari / Firefox)
- [ ] **SYNC-04**: On reconnect, client posts all pending IndexedDB records to `POST /api/sync/batch`; server processes via Celery task
- [ ] **SYNC-05**: Conflict rule: if server already has a record with newer `updated_at`, the record is flagged for nurse review — never silently overwritten; clinical fields (BP, diagnosis, medications) always require human resolution
- [ ] **SYNC-06**: Deduplication rule: exact duplicate records (same `patient_id + record_type + date + bhw_id`) are rejected on receipt
- [ ] **SYNC-07**: Nurse/midwife reviews BHW-submitted records in an approval queue; can approve (status → APPROVED) or return (status → RETURNED) each record
- [ ] **SYNC-08**: Approved records flow into FHSIS report counts; PENDING records do not
- [ ] **SYNC-09**: Nurse dashboard shows approval queue age metric to surface accumulating backlog before FHSIS deadlines

---

## v2 Requirements

Deferred to post-capstone. Tracked but not in current roadmap.

### Deferred Clinical Modules

- **FAM-01**: Family Planning enrollment and visit records (M1 MCPR indicators)
- **FAM-02**: Newborn Care / ENC records (M1 ENC indicators)
- **FAM-03**: IMCI / Sick Child illness classification and care plan
- **FAM-04**: Animal Bite / ABTC full PEP tracking and missed-dose alerts (rabies death covered in v1 via PIDSR Category I)

### Deferred Infrastructure

- **V2-01**: SMS and push notification fallback for Category I disease alerts (no mobile network dependency in v1)
- **V2-02**: PHO / regional system API integration (DOH NHDR / iHOMIS) — no stable public API exists
- **V2-03**: Cross-CHO patient continuity
- **V2-04**: IndexedDB field-level encryption for RA 10173 device-theft protection

### Deferred Inventory

- **V2-INV-01**: PAR level automation and prescriptive reorder recommendations
- **V2-INV-02**: Cold chain / temperature tracking
- **V2-INV-03**: Expiry date and batch number management
- **V2-INV-04**: Supplier tracking and procurement workflows
- **V2-INV-05**: AI-driven proactive allocation (LLM + Prophet)

### Deferred ML

- **V2-ML-01**: LSTM / deep learning models (dependent on historical data volume)
- **V2-ML-02**: PostgreSQL Row-Level Security as defense-in-depth alongside application-level isolation

---

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| Cancer screening (VIA/CBE) | Not a BHS primary care program at CHO 2 scope |
| Senior Citizen health module | Deferred; separate program with different indicators |
| Mental Health module | Deferred; specialist referral scope, not BHS-level |
| Drug dependency / CBR | Deferred; separate program |
| Dental full module | Deferred; requires separate clinical data model |
| Environmental Health & Sanitation | Out of CHO 2 BHS scope |
| STI / National AIDS Control Program | Deferred; additional RA 11166 compliance burden |
| PhilHealth billing / eKonsulta | Separate operational domain; billing out of scope |
| Hospital clinical management | CHO 2 does not operate hospitals |
| Online public appointment booking | No patient-facing portal in Phase 1 |
| Intrapartum / delivery records | BHS does not perform deliveries; delivery date entered manually from birthing facility |
| Malaria, Schistosomiasis, Leprosy, Filariasis | Not endemic in Dasmariñas City |
| Private health facility records | HSMS covers public BHS only |
| Cross-CHO patient continuity | Single-CHO deployment; CHO 2 scope only |
| MDR-TB treatment tracking | MDR cases referred to hospital; HSMS records referral only |
| PHO / DOH regional system API | No stable API exists in Phase 1 |

---

## Traceability

Which phases cover which requirements. Updated during roadmap revision.

| Requirement | Phase | Phase Name | Status |
|-------------|-------|------------|--------|
| INFRA-01 to INFRA-04 (4) | Phase 1 | Infrastructure + DevOps | Pending |
| AUTH-01 to AUTH-10 (10) | Phase 2 | Authentication + RBAC + User Management | Pending |
| ITR-01 to ITR-06 (6) | Phase 3 | Patient ITR + Core Data Model | Pending |
| PRNT-01 to PRNT-06 (6) | Phase 4 | Maternal + Child Health Programs | Pending |
| PNPL-01 to PNPL-04 (4) | Phase 4 | Maternal + Child Health Programs | Pending |
| EPI-01 to EPI-07 (7) | Phase 4 | Maternal + Child Health Programs | Pending |
| NUTR-01 to NUTR-05 (5) | Phase 4 | Maternal + Child Health Programs | Pending |
| TB-01 to TB-07 (7) | Phase 5 | TB-DOTS + NCD Programs | Pending |
| NCD-01 to NCD-06 (6) | Phase 5 | TB-DOTS + NCD Programs | Pending |
| SURV-01 to SURV-08 (8) | Phase 6 | Disease Surveillance + Real-Time Alerts | Pending |
| GIS-01 to GIS-05 (5) | Phase 7 | GIS Disease Mapping | Pending |
| ML-01 to ML-06 (6) | Phase 8 | ML Analytics + FHSIS Reporting | Pending |
| FHSIS-01 to FHSIS-08 (8) | Phase 8 | ML Analytics + FHSIS Reporting | Pending |
| SYNC-01 to SYNC-09 (9) | Phase 9 | Offline PWA + Inventory + CHO Dashboards | Pending |
| INV-01 to INV-05 (5) | Phase 9 | Offline PWA + Inventory + CHO Dashboards | Pending |

**Coverage:**
- v1 requirements: 96 total (4+10+6+22+13+8+5+14+14)
- Mapped to phases: 96
- Unmapped: 0

---
*Requirements defined: 2026-03-15*
*Last updated: 2026-03-15 after roadmap revision (5 phases -> 9 phases)*
