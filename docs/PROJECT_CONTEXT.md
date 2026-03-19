# PROJECT_CONTEXT.md
## HSMS / Project LINK — Complete Working Context

> Single-read reference for any reader (human or AI). Not a task list.
---

## 1. Project Identity

Project LINK (Local Information Network for Kalusugan) is an integrated health station management system and a digital health information platform designed to transform how barangay health stations under City Health Office II in Dasmariñas City manage, analyze, and utilize community health data. The system unifies fragmented patient records and public health program data into a centralized platform that streamlines documentation, automates reporting, and enhances decision-making through real-time dashboards, geographic disease mapping, and machine learning–based predictive analytics. By combining health information management, spatial intelligence, and proactive health forecasting, LINK empowers health workers and local health administrators to shift from reactive record-keeping to data-driven public health management, enabling faster responses to community health needs and more efficient delivery of primary healthcare services.


Project LINK operates across two tiers to address the fragmented information flow between CHO 2 and its 32 Barangay Health Stations:

**BHS tier** — Digitizes paper-based clinical records across 32 Barangay Health Stations with offline-capable field entry (BHW → nurse approval workflow). Covers maternal care, immunization, nutrition, family planning, TB-DOTS, NCD, and disease surveillance.

**CHO tier** — Consolidates real-time data from all 32 BHS into a unified city-wide view for the City Health Officer, PHIS Coordinator, and Disease Surveillance Officer. Addresses the current gap where CHO leadership has no cross-BHS visibility until monthly paper reports arrive. Delivers: live Category I disease alerts (WebSocket), GIS disease mapping, ML outbreak forecasting, and auto-generated FHSIS reports — replacing the manual monthly tally process entirely.

---

## 2.1 Current State (Before HSMS)

- **No digital system at any health station.** All 32 health stations operate on paper.
  Desktop units present at some stations serve only as printers for generating physical
  report forms — no software, no database, no patient records system of any kind. Patient
  ITRs, TCL ledgers, program reports, and TB registers are handwritten and stored in filing
  cabinets with a 5–10 year physical retention period.
- **No centralized health records system.** There is no shared system — at any level —
  that consolidates patient records across health stations. CHO 2 has no way to search,
  query, or analyze patient data across its 32 stations. CHO 2 is also the only one of five
  CHOs in Dasmariñas City with no online presence.
- **CHO-level digitization is summary-only.** The only digital tool CHO 2 operates is a
  reporting system at the CHO level. It receives manually encoded aggregate counts — not
  patient records — once per month. No raw patient data ever enters a digital system.
- **Encoder bottleneck.** A single person encodes all reports from all 32 health stations
  monthly. Across six programs per station, this is 192+ program reports per month minimum.
  There is no backup. If the encoder is unavailable during the submission window, the entire
  city's health report is delayed or missing.
- **BHW phone-to-paper workaround.** BHWs use personal phone notepads during household
  visits (official forms are disruptive in the field), then manually copy observations to paper
  forms afterward. This practice is undocumented and unauditable. Data loss and omissions
  during transfer are undetectable.
- **Data compressed at every handoff.** Patient-level detail is lost as records move upward.
  By the time data reaches the DOH system, it is an aggregate count. The individual records
  supporting that count exist only in paper files at the originating health station.
- **No real-time defaulter or overdue detection.** Gaps in TB treatment, missed prenatal
  visits, overdue immunizations, and defaulters cannot be detected until the next monthly
  report is compiled — at best, a 30-day lag. No system flags patients between reports.
- **No shared patient identity.** Each health station is a data island. A patient visiting a
  different station generates a duplicate record from scratch. Their full history is invisible
  to any station other than the one that created it.

### 2.2 Core Problem Statement

CHO 2 serves 164,691 people but has no means to manage their health information as a
connected, searchable, or analyzable body of data. Health data produced at the BHS level is
compressed, tallied by hand, and re-transcribed multiple times before becoming a government
statistic — introducing error at every step and destroying the detail needed to act on individual
patient needs in any timely way. The consequence: CHO 2 cannot know, in real time or
sometimes at all, which people are at risk, which patients have fallen off a treatment program,
or where a disease is beginning to spread.

### 2.3 Consequential Operational Failures

- **No real-time disease signal.** Outbreak detection depends on monthly tallies. A
  Category I notifiable disease (e.g., cholera, meningococcemia) can circulate for weeks before
  CHO 2 has any aggregate data indicating a problem. The 24-hour RA 11332 reporting
  requirement is structurally impossible to fulfill under the paper system.
- **Single-point encoder failure risk.** The entire city's FHSIS compliance rests on one
  person's availability during one fixed window per month. There is no failsafe.
- **Treatment continuity is BHW-memory dependent.** TB-DOTS adherence monitoring,
  prenatal follow-up scheduling, and immunization defaulter detection all depend on BHWs
  remembering who to visit next. There is no system-level safety net between monthly counts.

---

## 3. What Project LINK/HSMS Solves

| Operational Domain | Current State (Fragmented & Reactive) | Future State with Project LINK (Integrated & Proactive) |
|---|---|---|
| **Health Data Governance** | Barangay health records are kept in separate paper logbooks and program-specific documents. This leads to duplicate patient identities, inconsistent records, and limited traceability across facilities. | A **centralized digital patient record system** establishes a unified Individual Treatment Record (ITR), creating a single source of truth with standardized records, consistent patient identities, and auditable data governance. |
| **Field Health Operations** | Health workers document services manually during community visits and later encode the data into reports, resulting in delays, transcription errors, and limited supervisory visibility. | **Offline-capable mobile data capture tools** allow health workers to record patient information directly at the point of care. Data synchronizes automatically when connectivity is available while maintaining validation and approval workflows. |
| **Public Health Reporting** | Health program reports must be manually tallied and consolidated from multiple barangay health centers, creating reporting bottlenecks and delays in decision-making. | **Automated aggregation and reporting** generate standardized government reports and dashboards instantly, eliminating manual consolidation and providing real-time health metrics across the city. |
| **Disease Monitoring & Surveillance** | Disease trends are often identified only after cases have already increased because monitoring relies on delayed reports and manual analysis. | **GIS-based disease mapping and machine learning analytics** provide spatial visualization of cases, identification of disease hotspots, and predictive insights for early outbreak detection. |
| **Patient Care Continuity** | Patients who transfer between barangays or miss follow-ups become difficult to track, resulting in treatment interruptions and incomplete care histories. | **City-wide patient search and automated follow-up tracking** enable health workers to monitor overdue cases, track treatment adherence, and maintain continuity of care across all barangay health centers. |
---

## 4. Users

| Role Code                      | Access Mode  | Clinical Scope                       | Data Scope                      | Primary Function                                                                            |
| ------------------------------ | ------------ | ------------------------------------ | ------------------------------- | ------------------------------------------------------------------------------------------- |
| `system_admin`                 | Web only     | None                                 | Config and user management only | User accounts, role assignment, barangay-to-CHO assignment, system configuration            |
| `city_health_officer`          | Web + mobile | Read-only                            | All 32 BHS                      | Reviews real-time analytics dashboards, GIS maps, ML forecasts, Category I alerts           |
| `physician`                    | Web + mobile | Full CRUD                            | Assigned programs only          | Patient records, clinical notes, diagnoses within scoped programs                           |
| `phis_coordinator`             | Web only     | Read-only                            | All 32 BHS                      | FHSIS data completeness monitoring; M1/M2/Q1/A1 verification and PHO export                 |
| `disease_surveillance_officer` | Web only     | PIDSR CRUD + read-only all others    | All 32 BHS                      | Category I/II case validation; weekly PIDSR tally export (PDF/Excel); GIS and ML monitoring |
| `nurse` / `midwife`            | Web + mobile | Full CRUD + inventory CRUD (own BHS) | Own BHS only                    | Patient ITR, all program records, BHW approval, stock transactions                          |
| `bhw`                          | Mobile-first | Create (pending approval)            | Own assigned patients only      | Field data entry; offline-capable; all records require nurse/midwife approval               |

**Multi-role:** A user may hold multiple roles simultaneously. The only documented combination
is `nurse` + `disease_surveillance_officer` (nurse designated as BHS Surveillance Focal Person).

**system_admin exclusivity:** `system_admin` is always exclusive — the backend rejects
any combination with another role.

**PHO:** Report recipient only. No system login. No user row in the `users` table.

---

## 5. What the System Does (Modules)

### Tier 1 — Full Modules

**Patient ITR**
Key tables: `patients`, `consultations`. Replaces the paper Individual Treatment Record and the
physical filing cabinet. Enables a unified patient identity across all programs at a BHS, and
(for `city_health_officer` and `phis_coordinator`) across all 32 BHS. Non-obvious rule: `patient_id`
is the foreign key on every enrollment, visit, and registry table — patient identity is never
duplicated per program. GIN index on name fields enables fast city-wide patient search.

**Maternal Care — Prenatal**
Key tables: `prenatal_enrollments`, `prenatal_visits`. Replaces the paper Prenatal TCL ledger
and the nurse's end-of-month manual tally. Enables auto-calculated `next_visit_date` based
on clinic schedule, continuous overdue detection (never waiting for monthly report), and
real-time high-risk flag propagation to the ML risk-scoring model. Non-obvious rule: the DOH
minimum of 4 visits is enforced at the reporting layer (M1 indicators), not as a database
constraint — the system records all visits regardless of count.

**Maternal Care — Postpartum / Postnatal**
Key tables: `postpartum_enrollments`, `postpartum_visits`. Linked to prenatal via `patient_id`.
Replaces paper postpartum TCL. Enables automated visit schedule (Day 1, Week 1, Week 6)
computed from manually entered delivery date. Non-obvious rule: delivery date is entered
manually by the nurse — it originates at the birthing facility, not at the BHS, and no linked
system provides it. Intrapartum and delivery records are out of scope (BHS does not
perform deliveries).

**Child Care — EPI**
Key tables: `epi_enrollments`, `epi_vaccinations`. Replaces the paper EPI TCL. Enables
automated dose sequence enforcement (dose number per vaccine), automated FIC (Fully
Immunized Child) indicator computation per BHS per month, and defaulter detection the
moment a scheduled dose date passes — not at next month's tally. Non-obvious rule: the EPI
module carries a complexity multiplier of 2–3× estimated effort due to age-based eligibility
windows and catch-up scheduling logic.

**Child Care — Nutrition (OPT+)**
Key tables: `nutrition_enrollments`, `nutrition_visits`. Replaces paper OPT+ cycle records.
Enables WHO Z-score classification (WAZ, HAZ, WHZ) at point of entry and automated
severe-wasting → ML at-risk alert. Non-obvious rule: Vitamin A, iron, and deworming
supplementation schedules are tied to age bands (6–59 months, 12–59 months, etc.) and
OPT+ cycle timing (April and August for weight/height) — eligibility is computed at query
time, not hardcoded per patient.

**TB-DOTS**
Key tables: `tb_cases`, `tb_dots_visits`, and supporting `tb_symptomatics`, `tb_contacts`.
Replaces the paper TB Register and the BHW's reliance on memory for daily treatment
observation. Enables per-drug daily intake recording (H, R, Z, E, S each individually checked),
sputum exam schedule tracking (Month 0/2/5/6), overdue sputum flagging, and contact tracing
records. Non-obvious rule: MDR-TB cases are referred to hospital — HSMS records the
referral only; treatment tracking for MDR is out of scope. TB case notification feeds the PIDSR
module automatically.

**Disease Surveillance — PIDSR + Morbidity**
Key tables: `disease_cases`, `disease_alerts`. Replaces manual PIDSR tally sheets and the
DSO's hand-compilation process. Two distinct data models: Category I (AFP, Cholera,
Meningococcemia, Neonatal Tetanus, SARS, Unusual Events) triggers an immediate WebSocket
broadcast to all connected `city_health_officer` and `disease_surveillance_officer` sessions on
case save; Category II (Dengue/DHF, ARI, Diarrhea/AGE, ILI, Chickenpox, Measles,
Hepatitis A, Leptospirosis, HFMD, Typhoid, Pneumonia) is batch-exported weekly on Friday by
the DSO as PDF/Excel. Non-obvious rule: alerts are persisted in `disease_alerts` (not
ephemeral WebSocket messages) — an offline DSO sees all unread Category I alerts on next
login, enabling after-the-fact compliance measurement against RA 11332's 24-hour window.
Rabies death (formerly in Animal Bite stub) is entered here as a Category I "Unusual Event"
case — no separate ABTC module required to satisfy the RA 11332 24-hour reporting
obligation.

**NCD — Hypertension + Diabetes (Unified)**
Key tables: `ncd_enrollments`, `ncd_visits`. Single module covering both conditions; a
comorbidity flag is set when a patient has both. HTN visits record BP, antihypertensive drug,
compliance, and PhilPEN risk level (low/medium/high). DM visits record FBS, oral
hypoglycemic/insulin, compliance, and HbA1c referral flag. Both condition types record dietary
counseling and RHU physician referral. Non-obvious rule: `next_visit_date` is auto-calculated
on a monthly cycle; patients controlled on medication have the same visit cadence as
uncontrolled — the system flags controlled vs. uncontrolled status per visit but does not alter
visit frequency automatically.

---

### Stub Modules (Phase 1 Registry Only)

| Stub | Phase 1 Delivers | Deferred to Phase 2 |
| --- | --- | --- |
| **Basic Inventory** | Item catalog (medicines, vaccines, supplies — seeded from CHO 2 data); per-BHS stock levels; stock transactions (in/out/adjustment) logged with timestamp and user; low-stock alerts on nurse/midwife dashboard | PAR level automation; cold chain/temperature tracking; expiry date/batch number management; supplier tracking; procurement workflows; prescriptive reorder recommendations |

---

### Out of Scope — Phase 1 (Deferred to Phase 2)

Family Planning | Newborn Care / ENC | Animal Bite / ABTC (PEP tracking, missed-dose
alerts — rabies death covered via PIDSR Category I "Unusual Event") | IMCI / Sick Child |
Environmental Health & Sanitation | STI / National AIDS Control Program | Cancer screening
(VIA/CBE) | Senior Citizen health module | Mental Health module | Drug dependency/CBR |
Dental (full module) | Malaria, Schistosomiasis, Leprosy, Filariasis (non-endemic in
Dasmariñas) | PHO/regional system integration | Intrapartum/delivery records | PhilHealth
billing / eKonsulta | Private health facility records | Hospital clinical management | Online
appointment booking | Cross-CHO patient continuity

---

### Known Reporting Gaps (Accepted Limitations)

- **M1 MCPR indicators** (Family Planning) — not generated by HSMS Phase 1. Manual
  entry required for PHO submission.
- **M1 ENC indicators** (Newborn Care) — not generated by HSMS Phase 1. Manual
  entry required for PHO submission.
- **M2 under-5 morbidity** (IMCI/Sick Child) — sick-child illness classifications absent;
  top-10 causes list will undercount under-5 disease burden.
- **Animal bite PEP tracking** — bite case records and missed-dose alerts deferred.
  Rabies deaths reportable via PIDSR Category I "Unusual Event" only.

### Cross-Cutting Capabilities

**GIS Disease Mapping**
Renders a barangay-level choropleth (disease case counts per barangay) and a purok-level
heatmap for CHO 2's currently assigned barangays, scoped dynamically via
`cho_barangay_assignments`. DBSCAN spatial clustering (scikit-learn) detects geographic
outbreak clusters. Filters by disease type, barangay, and date range. All spatial API responses
use ST_AsGeoJSON() (RFC 7946). Stack: MapLibre GL JS (frontend rendering) + PostGIS
(ST_Within, ST_Distance, ST_AsGeoJSON) + Turf.js (client-side geometry operations).
Geodata source: HDX Dasmariñas City barangay boundaries (already acquired). CHO 2's
32-barangay scope is not hardcoded — it is filtered at query time via `cho_barangay_assignments`.

**ML Predictive Analytics**
Three models, all CPU-bound inference executed via `run_in_threadpool()` or Celery tasks —
never directly in an async endpoint. (1) **Outbreak forecasting:** Prophet time-series model
per Category II disease per barangay, consuming `disease_cases` historical records, producing
predicted case counts with confidence bounds stored in `ml_disease_forecasts`. (2) **At-risk
patient flagging:** scikit-learn classifier consuming prenatal vitals (high-risk flag), nutrition
Z-scores (severe wasting), and NCD visit data (uncontrolled HTN/DM), writing risk scores to
`ml_patient_risk_scores`. (3) **Barangay risk index:** composite nightly Celery task consuming
disease case counts (30-day window), overdue patient counts, and EPI coverage gaps, writing a
normalized risk score per barangay to `barangay_risk_index`. LSTM is optional and depends on
CHO 2 historical data availability. Synthetic data is used for demonstration if historical FHSIS
records are insufficient; each ML output displays a confidence label indicating training data
source (HISTORICAL / SYNTHETIC / MIXED).

**FHSIS Auto-Report Generation**
Replaces the nurse's manual end-of-month tally and the single encoder's data entry process.
M1 (Monthly Program Report: maternal, child, FP, disease), M2 (Monthly Morbidity: top-10
causes by age/sex per barangay/month), Q1 (Quarterly Field Health Service Activity Report),
A1 (Annual Catchment Area Summary) are auto-generated from live program enrollment and
visit data using indicator formulas from DOH DM 2024-0007. Scope is dynamically filtered to
CHO 2's currently assigned barangays. Export format: PDF + Excel for PHO submission.
PHIS Coordinator verifies each indicator with a per-indicator checkbox before export is
enabled. Compliance basis: DOH DM 2024-0007. ■■ Indicator formulas must be validated
against CHO 2 actual historical submissions before go-live (blocking).

---

## 6. How Data Moves (Critical Workflows)

**Chain 1 — BHW → Midwife/Nurse → PHIS Coordinator (FHSIS Data Pipeline)**
Roles: BHW → Midwife/Nurse → PHIS Coordinator → (PHO, no login)
What passes: BHW creates patient/visit records in the field (status: PENDING, stored in
IndexedDB if offline) → sync event triggers nurse approval queue notification → Nurse reviews,
approves or returns each record (status: APPROVED or RETURNED) → PHIS Coordinator
pulls finalized data into auto-generated M1/M2/Q1/A1 for PHO export.
Trigger: BHW sync event triggers nurse notification. FHSIS monthly cutoff triggers PHIS
Coordinator verification cycle.
**Bottleneck risk: HIGH.** If BHWs in low-connectivity barangays accumulate offline records
and sync near the FHSIS cutoff, nurses face a mass approval backlog. No automated fallback.
SCOPE explicitly flags this as a project limitation. Mitigation in design: approval queue
age metric surfaced on nurse dashboard; weekly sync discipline recommended.
If chain breaks: BHW records in PENDING status do not flow into FHSIS report counts.
Incomplete M1/M2 submitted to PHO. Nurse must manually expedite or PHIS Coordinator
reports incomplete data.

**Chain 2 — Nurse → DSO → City Health Officer (PIDSR Alert Pipeline)**
Roles: Nurse → Disease Surveillance Officer → City Health Officer
What passes: Nurse enters a disease case at BHS level → Category I: WebSocket broadcast
fires immediately to all connected DSO and city_health_officer sessions AND a persistent
`disease_alerts` row is inserted → DSO validates classification (records `validated_at`) →
City Health Officer sees validated alert on CHO Dashboard and GIS map. Category II: weekly
Friday batch export by DSO.
Trigger: Category I case save (WebSocket + DB insert). Category II: weekly Friday DSO
export action.
**Bottleneck risk: MEDIUM.** Category I pipeline is real-time and automated; latency is low.
Risk: no SMS/push fallback in Phase 1 (SCOPE.docx limitation). DSO offline at alert time →
alert held in unread queue until next login; validated_at gap is the RA 11332 compliance
metric.
If chain breaks (Category I): alert persists in `disease_alerts` unread state. DSO and CHO
see it on next login. 24-hour RA 11332 window may still be breached if DSO is offline
for extended period.

**Chain 3 — Nurse → ML Module → City Health Officer (Risk Intelligence Pipeline)**
Roles: Nurse → Celery ML task → City Health Officer
What passes: Nurse saves clinical visit data (prenatal vitals, NCD measurements, nutrition
Z-scores) → Celery task or run_in_threadpool triggers scikit-learn risk classifier and
Prophet time-series re-scoring → City Health Officer sees updated at-risk flags and forecast
trends on CHO Dashboard.
Trigger: Clinical data save event → async ML re-scoring (Celery). Prophet retraining is
periodic, not per-record.
**Bottleneck risk: LOW-MEDIUM.** ML inference is async and non-blocking. Primary risk is
data quality (synthetic training data reduces predictive validity), not workflow latency. Confidence
badge on all ML outputs makes data quality limitation visible to City Health Officer.
If chain breaks: stale ML outputs remain displayed. No direct patient care impact; intelligence
quality degrades silently without confidence badge.

**Chain 4 — BHW → Nurse → DSO (Disease Case Origination — Category I Urgency)**
Roles: BHW → Nurse/Midwife → Disease Surveillance Officer
What passes: BHW observes or is notified of a potential Category I case in field → creates
a record (PENDING) → syncs to server → Nurse reviews and approves (upgrades to finalized
case record) → if pidsr_category = I, WebSocket alert fires to DSO and CHO simultaneously.
Trigger: BHW sync + Nurse approval of a Category I disease case record.
**Bottleneck risk: HIGH** for Category I. The BHW offline-to-sync delay plus nurse approval
latency together can absorb hours of the 24-hour RA 11332 window before the alert fires. If
BHW is offline at time of observation, the entire pipeline is gated on reconnection.
If chain breaks: Category I case enters the system late. DSO and CHO are notified after
delay. RA 11332 compliance window may be breached. No manual fallback is specified in
Phase 1.

**Chain 5 — Nurse → PHIS Coordinator → PHO (Report Submission)**
Roles: Nurse → PHIS Coordinator → PHO (external, no login)
What passes: Nurse completes and approves all BHS records for the reporting period →
PHIS Coordinator reviews auto-generated M1/M2/Q1/A1, verifies each indicator against
DOH DM 2024-0007, checks per-indicator checkboxes → export button unlocks → PHIS
Coordinator exports PDF/Excel → manually submits to PHO.
Trigger: FHSIS monthly deadline (5th of following month for M1/M2). PHIS Coordinator
verification is the gate before export.
**Bottleneck risk: MEDIUM.** If any BHS has zero records submitted, the PHIS Coordinator
completeness dashboard flags it. Export is blocked until all indicators are verified. PHO
submission is manual (no API integration with DOH NHDR or iHOMIS in Phase 1).
If chain breaks: PHIS Coordinator cannot export until completeness is sufficient. Report
submitted late or incomplete to PHO. No automated escalation mechanism; PHIS Coordinator
must contact lagging BHS nurses directly.

---

## 7. Architecture (High Level)

### 7.1 The Call Chain

```
Request
  → Router           (RBAC check via require_role() dependency)
  → Service          (business logic — no DB access)
  → Repository       (DB query via AsyncSession — barangay filter applied HERE)
  → AsyncSession     (SQLAlchemy 2.0 async, never sync)
  → Pydantic schema  (model_validate() — never return raw ORM object)
  → JSON response
```

RBAC is enforced at the router level via FastAPI dependency injection (`require_role()`).
Barangay isolation is enforced at the repository level — not the service or router layer.
`system_admin` has zero clinical data access; enforcement is at the service layer.

### 7.2 Stack Summary

| Layer              | Technology              | Why It Matters for This Project                                                       |
| ------------------ | ----------------------- | ------------------------------------------------------------------------------------- |
| Backend framework  | FastAPI                 | Async-native; OpenAPI auto-gen consumed by React TypeScript frontend                  |
| ORM                | SQLAlchemy 2.0 (async)  | AsyncSession required throughout; GeoAlchemy2 for PostGIS column types                |
| Schema validation  | Pydantic v2             | Enforces no-raw-ORM rule; single type system readable by Claude Code                  |
| Task queue         | Celery                  | CPU-bound ML training and batch report generation off the async event loop            |
| Cache / broker     | Redis                   | Dual-purpose: Celery broker + API response cache; no additional service boundary      |
| Auth               | JWT (python-jose)       | Stateless auth; refresh token revocation via `user_sessions`; WS auth via query param |
| Frontend framework | React + TypeScript      | OpenAPI-generated types; end-to-end type safety from Pydantic → TS                    |
| Build tool         | Vite                    |                                                                                       |
| UI components      | shadcn/ui               |                                                                                       |
| Data fetching      | TanStack Query          | Polling for CHO Dashboard real-time updates; cache invalidation on mutation           |
| Map rendering      | MapLibre GL JS          | GeoJSON RFC 7946 native; choropleth + heatmap rendering of PostGIS output             |
| Offline storage    | IndexedDB               | BHW and nurse mobile records stored locally during disconnection                      |
| PWA / sync         | Service Worker          | Background sync trigger on reconnect → POST /api/sync/batch                           |
| Time-series ML     | Prophet                 | Per-disease per-barangay outbreak forecasting; run_in_threadpool or Celery            |
| Clustering ML      | scikit-learn            | At-risk patient classifier + DBSCAN spatial clustering for GIS outbreak detection     |
| Database           | PostgreSQL              |                                                                                       |
| Spatial extension  | PostGIS                 | ST_AsGeoJSON, ST_Within, ST_Distance — all spatial queries; SRID 4326 enforced        |
| Async DB driver    | asyncpg                 | Required for SQLAlchemy async engine                                                  |
| Containerization   | Docker + docker-compose | Dev and prod compose files; nginx reverse proxy                                       |
| Reverse proxy      | nginx                   |                                                                                       |

### Folder Structure
```
backend/app/ (FastAPI structure)
├── core/           # config, security, database, dependencies.py
├── models/         # SQLAlchemy ORM — one file per domain, inherit ClinicalBase
├── schemas/        # Pydantic v2 — one file per domain, request + response
├── routers/        # FastAPI routers — one file per domain, require_role() here
├── services/       # Business logic — no direct DB, calls repositories only
├── repositories/   # DB queries only — no business logic
├── ml/             # Prophet, scikit-learn inference wrappers
├── tasks/          # Celery tasks (ML training, nightly jobs)
└── websockets/     # Category I alert manager

frontend/src/ (React TS structure)
├── features/       # prenatal/ epi/ tb/ ncd/ gis/ ml/ — each: api.ts + types.ts
├── components/     # Shared UI (shadcn/ui wrappers)
├── pages/          # Route-level components
└── lib/            # axios instance, API client
```

### 7.3 Offline Architecture

BHW and nurse mobile clients write records to IndexedDB while offline. On reconnect, the
Service Worker triggers a background sync event → POST /api/sync/batch with all pending
records. The server runs a Celery task to process the sync queue. **Conflict rule:** if a record
already exists server-side with a newer `updated_at` timestamp, the record is flagged for nurse
review — never silently overwritten. Clinical fields (BP, diagnosis, medications) are never
auto-resolved; they always require human review. The nurse receives a WebSocket notification
on conflict detection. **Dedup rule:** exact duplicates are rejected on `patient_id + record_type
+ date + bhw_id`. BHW-syncable tables carry `local_id UUID` and `status record_status
DEFAULT 'PENDING'` columns to track sync state.

### 7.4 Realtime Architecture

Category I disease alert flow: nurse saves a Category I case record → service layer inserts a
row into `disease_alerts` AND broadcasts a WebSocket payload to all connected
`city_health_officer` and `disease_surveillance_officer` sessions. Payload:
`{ disease_code, barangay_id, barangay_name, case_id, reported_at }`. WebSocket
connections are authenticated via JWT query parameter (`ws://host/ws/alerts?token=...`).
Alerts are **persistent** — `disease_alerts` table stores unread state per user. On next login,
DSO and CHO see all unread alerts regardless of whether they were online when the alert fired.
Limitation: no SMS or push notification fallback in Phase 1. If DSO and CHO are both offline
when a Category I alert fires, the 24-hour RA 11332 window can be breached before the
alert is seen.

---

## 8. What Is Explicitly Out of Scope (Phase 1)

- PHO/regional system integration
- Intrapartum/delivery records (BHS does not perform deliveries)
- Cancer screening (VIA/CBE)
- Senior Citizen health module
- Mental Health module
- Drug dependency/CBR
- Dental (full module)
- PhilHealth billing / eKonsulta
- Malaria, Schistosomiasis, Leprosy, Filariasis (not endemic in Dasmariñas)
- Private health facility records
- Hospital clinical management
- Online public appointment booking
- Cross-CHO patient continuity

### Inventory Phase 1 Scope Boundary

**IN scope (Phase 1):**
- Item catalog: medicines, vaccines, supplies (seeded from CHO 2 data)
- Per-BHS stock levels: current quantity on hand per item per BHS (`inventory_stock`)
- Stock transactions: every stock-in, stock-out, and manual adjustment logged with timestamp and user (`stock_transactions`)
- Low-stock alerts: configurable threshold per item; breach triggers alert on nurse/midwife dashboard (`stock_alerts`)
- RBAC: nurse/midwife — stock CRUD for own BHS only; phis_coordinator — read-only city-wide view

**Deferred to Phase 2 (DO NOT implement in Phase 1):**
- PAR level automation
- Cold chain / temperature tracking
- Expiry date / batch number management
- Supplier tracking
- Procurement workflows
- Prescriptive reorder recommendations

> Note:Architectural Readiness: While Phase 1 focuses on real-time visibility and stock-level transparency, the inventory schema is deliberately engineered to serve as the data foundation for AI-driven proactive allocation. By capturing structured transaction logs and per-barangay stock levels, the system creates the necessary historical dataset to eventually integrate LLM-based (Gemini or other recommended) reasoning and predictive analytics (Prophet). This design choice ensures that the transition from passive monitoring to automated resource redistribution can be achieved in Phase 2 without requiring a fundamental database restructure.

---

## 9. Compliance and Standards

| Standard                    | What It Requires                                                                                                  | Where It Appears in the Codebase                                                                                                                                          |
| --------------------------- | ----------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| DOH DM 2024-0007            | FHSIS 2024 indicator names, field names, and report formulas — all must match exactly                             | `tasks/report_generation.py`; FHSIS auto-report service; all M1/M2/Q1/A1 computed fields                                                                                  |
| RA 11332 / AO 2021-0057     | Category I notifiable disease reporting within 24 hours                                                           | `disease_cases` → `disease_alerts` insert + WebSocket broadcast on case save; `validated_at` gap metric                                                                   |
| RA 10173 (Data Privacy Act) | No DELETE on clinical tables; no patient PII in logs; audit log retention                                         | `deleted_at TIMESTAMPTZ` on all clinical tables; `WHERE deleted_at IS NULL` on all reads; `audit_logs` append-only; no patient names/IDs in server logs or error messages |
| RA 7883 (BHW Benefits)      | Informs BHW role design — BHW is a supervised field contributor, not a formal FHSIS reporting entity              | `bhw` role: CRUD with PENDING status; nurse approval gate before finalization                                                                                             |
| ISO/IEC 25010               | Software quality evaluation framework (functional suitability, reliability, security, usability, maintainability) | Thesis evaluation methodology; not a code-level constraint                                                                                                                |
| PhilPEN Protocol            | NCD management at primary care level — HTN/DM risk stratification                                                 | `ncd_visits.risk_level` (PhilPEN low/medium/high); physician referral logic in NCD module                                                                                 |
| WHO Z-score standards       | Weight-for-age (WAZ), height-for-age (HAZ), weight-for-height (WHZ) classification                                | `nutrition_visits.waz_score`, `haz_score`, `whz_score`; nutritional status enum; ML at-risk trigger on severe wasting                                                     |
| RFC 7946                    | GeoJSON format for all spatial API responses                                                                      | `func.ST_AsGeoJSON()` wrapping all geometry returns; MapLibre GL JS consumes GeoJSON natively                                                                             |

---

## 10. Known Limitations (Phase 1)

| Limitation                             | Root Cause                                                                                                                                     | Impact                                                                                                  |
| -------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| Offline sync conflict backlog          | Conflict resolution requires nurse review; prolonged disconnection in remote BHS                                                               | Approval backlogs before FHSIS deadlines if BHWs sync late                                              |
| ML accuracy depends on historical data | Insufficient CHO 2 historical FHSIS records force synthetic training data                                                                      | Reduced real-world predictive validity; ML outputs may not reflect actual CHO 2 health patterns         |
| GIS resolution ceiling                 | Disease mapping is barangay/purok level only; household-level mapping requires GPS at BHW entry (not in scope)                                 | Cannot pinpoint outbreak source below purok level                                                       |
| No WebSocket fallback                  | Category I alerts depend on stable WebSocket connection; no SMS or push notification in Phase 1                                                | 24-hour RA 11332 window can be breached if DSO/CHO are offline                                          |
| Incomplete maternal timeline           | Delivery record gap: postpartum scheduling requires manual delivery date entry (delivery originates at birthing facility)                      | Postpartum visit schedule depends on a manually entered date; no linked system provides it              |
| Stub module clinical gaps              | IMCI danger signs algorithm and Animal Bite PEP missed-dose alerts deferred                                                                    | Both have patient safety implications that are unmitigated in Phase 1                                   |
| No PHO system integration              | FHSIS report submission to PHO is manual PDF/Excel export; no direct data exchange with DOH NHDR or iHOMIS                                     | Manual submission step retained; no elimination of final human handoff                                  |
| CHO 2 jurisdiction only                | Cross-CHO patient continuity not addressed                                                                                                     | TB-DOTS and prenatal patients who transfer to another CHO coverage area are invisible to HSMS           |
| Private facility blind spot            | HSMS captures public BHS data only                                                                                                             | City-wide disease burden is underrepresented in ML models                                               |
| BHW digital literacy variance          | Adoption gaps at BHW level                                                                                                                     | Directly affects data completeness and downstream FHSIS report quality                                  |
| FHSIS formula validation dependency    | Auto-generated reports must be validated against CHO 2 actual historical submissions before go-live                                            | Risk of incorrect M1/M2 indicators if formulas are not validated with PHIS Coordinator                  |
| Single-CHO deployment                  | Not portable to CHO 1/3/4/5 without full requirements re-validation                                                                            | HSMS is purpose-built for CHO 2; reuse requires re-scoping                                              |
| Inventory data dependency              | CHO 2 must provide item catalog and par levels per BHS before inventory module can be seeded; stock accuracy depends on consistent nurse entry | Inventory module is non-functional until seeded; inconsistent recording renders stock levels unreliable |
| 4-month build constraint               | EPI scheduling logic, FHSIS formula accuracy, and ML model training are constrained by timeline                                                | System is a validated prototype, not a production-hardened deployment                                   |

---

## 11. How HSMS Fits in the Existing Landscape

*(Source: EXISTING_SYSTEMS.pdf)*

**FHSIS (DOH)** is the Department of Health's official recording and reporting framework at BHS and RHU level. It is paper-based, periodic (M1/M2/Q1/A1), and has no real-time component. There is no unified patient identity across programs, no CHO-level dashboard, and no analytical capability. HSMS operationalizes FHSIS digitally — every FHSIS instrument (ITR, TCL, tally forms) becomes a database table or computed report, eliminating the manual tally step entirely.

**CHITS (UP Manila National Telehealth Center)** is the closest existing system to HSMS in operational scope. It enables electronic ITR encoding and FHSIS-aligned report generation at a single BHS. Its primary gap: each BHS is a standalone data island with no multi-facility consolidation, no CHO supervisory layer, no GIS, and no ML. HSMS adds the entire CHO-level consolidation and intelligence layer above where CHITS stops.

**iClinicSys (DOH)** is a facility-level OPD workflow system designed for a single RHU — patient registration, consultation charting, prescription, lab results. It has no CHO-level supervisory view, no multi-facility management, and no PIDSR pipeline. HSMS operates above iClinicSys's encounter layer, adding the consolidation and population health intelligence that iClinicSys does not provide.

**eKonsulta (PhilHealth)** is a billing transaction system — encounter-to-PhilHealth-claim workflow. It has no TCL tracking, no immunization scheduling, no disease surveillance, no population health view. PhilHealth billing is explicitly out of scope for HSMS Phase 1; the two systems serve entirely separate operational domains.

**BHCMS (Academic Prototype)** is a basic BHS digitization prototype — patient records in, reports out. No multi-facility layer, no real-time access, no GIS, no ML. BHCMS established the academic precedent for BHS digitization; HSMS is the next-generation implementation adding every capability BHCMS lacks.

**SegRHIS (Segworks Technologies)** is a facility EMR similar to iClinicSys — patient registration, consultation, prescription, eClaims export. It is designed for facility-based clinical staff, not BHWs in the field. No CHO supervisory layer, no BHW mobile entry, no PIDSR pipeline, no GIS or ML. SegRHIS confirms that facility-level EMR is a solved problem in Philippine health IT; HSMS addresses the CHO-level intelligence gap above the EMR layer.

**DHIS2 (WHO / University of Oslo)** is the closest international equivalent in terms of multi-facility consolidation and dashboards. Its Tracker module supports longitudinal individual data and it includes GIS mapping of program indicators. However, DHIS2 is not designed for BHS-level operations: it lacks the offline BHW mobile use case, is not pre-configured for DOH FHSIS 2024 indicators, and does not embed ML-based outbreak forecasting. Its configuration overhead exceeds CHO-level capacity. HSMS is purpose-built for CHO 2's specific operational context.

**OpenMRS (Global Community)** is a facility-level clinical record system with a configurable concept dictionary. It supports multi-facility through configuration and has clinical decision support alerts. Its primary gap for this context: significant technical expertise is required to configure it for Philippine DOH context, it has no native GIS disease mapping, no ML forecasting, and requires customization for PIDSR reporting. HSMS eliminates all configuration overhead by being purpose-built for FHSIS 2024.

**HealthMap (Harvard Medical School / Boston Children's Hospital)** is a real-time disease surveillance and geographic mapping platform that aggregates outbreak signals from news, health alerts, and social media globally. It does not handle patient records, FHSIS program tracking, or BHW field entry. It validates the public health value of geographic disease intelligence. HSMS generates the same spatial outbreak intelligence from structured first-party PIDSR case records entered by BHS nurses — more reliable and locally actionable than HealthMap's passive aggregation.

**OpenSRP (PATH)** is a CHW mobile-first workflow platform deployed in 14 countries with over 150 million patients. It uses FHIR-native standards; health workers register patients offline and care plans auto-generate; data syncs upstream to DHIS2/OpenMRS. It is the strongest validation of HSMS's BHW offline mobile architecture. Its gaps: no CHO-level supervisory dashboard, no GIS disease mapping, no ML forecasting, and built on WHO Smart Guidelines rather than DOH DM 2024-0007. HSMS adopts the same offline mobile principle while adding the entire supervisory and intelligence layer above the CHW tier.

**CommCare (Dimagi)** is a generic CHW case management platform with conditional-logic health assessments, longitudinal case tracking, and a supervisor dashboard for CHW performance monitoring. It has been deployed for Philippine BHWs in Quezon Province (HEAL Hub project), directly validating the BHW mobile-first design decision in HSMS. Its gaps: requires significant configuration per deployment and ongoing vendor partnership; no integrated GIS disease mapping, no ML outbreak forecasting, no PIDSR pipeline, and no FHSIS-aligned indicator structure. HSMS is a standalone, self-contained system that CHO 2 can operate without external technical partnership.

### Comparative Feature Matrix

*(Source: EXISTING_SYSTEMS.pdf Table 1)*

| System          | Scope         | Real-Time | Multi-Facility | GIS Mapping | ML / Predictive | DOH-Aligned | Offline / Mobile | ISO 25010 Fit |
| --------------- | ------------- | --------- | -------------- | ----------- | --------------- | ----------- | ---------------- | ------------- |
| FHSIS           | BHS/RHU       | No        | No             | No          | No              | Yes         | No               | Partial       |
| CHITS           | BHS           | Partial   | No             | No          | No              | Yes         | No               | Partial       |
| iClinicSys      | RHU/OPD       | Partial   | No             | No          | No              | Yes         | No               | Partial       |
| eKonsulta       | Facility      | No        | No             | No          | No              | Yes         | No               | No            |
| BHCMS           | BHS           | No        | No             | No          | No              | Partial     | No               | No            |
| SegRHIS         | RHU/BHS       | Partial   | No             | No          | No              | Partial     | No               | Partial       |
| DHIS2           | District+     | Yes       | Yes            | Partial     | No              | Partial     | Partial          | Partial       |
| OpenMRS         | Facility      | Yes       | Partial        | No          | No              | No          | Partial          | Partial       |
| HealthMap       | Population    | Yes       | Yes            | Yes         | Partial         | No          | No               | No            |
| OpenSRP         | CHW/Community | Yes       | Partial        | No          | No              | No          | Yes              | Partial       |
| CommCare        | CHW/Frontline | No        | No             | No          | No              | No          | Yes              | Partial       |
| **HSMS / LINK** | **CHO + BHS** | **Yes**   | **Yes**        | **Yes**     | **Yes**         | **Yes**     | **Yes**          | **Yes**       |

---

## ⚠️ Open Questions and Gaps

| Gap                                                                                                                                                                                                              | Source Document                                        | Blocking?                                                         | Who Must Resolve                                                                 |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------ | ----------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| `audit_viewer` role count conflict: CLAUDE.docx lists 8 roles including `audit_viewer`; INITIAL_USERFLOW.docx records it merged into `system_admin` (7 roles); schema-plan.md enum still includes `audit_viewer` | CLAUDE.docx vs INITIAL_USERFLOW.docx vs schema-plan.md | **Yes** — affects RBAC implementation and enum definition         | Development team confirms with CHO 2; update enum and CLAUDE.docx to final count |
| `consultations.vitals` — discrete columns vs. `vitals JSONB`; JSONB simpler but harder to index/query for FHSIS indicator formulas                                                                               | schema-plan.md ⚠️ item 1                                | **Yes** — decide before Month 1 migration                         | Development team; recommend discrete columns for FHSIS queryability              |
| `ncd_enrollments.condition` — TEXT vs. enum; multi-condition patients may need junction table or `condition[]` array                                                                                             | schema-plan.md ⚠️ item 2                                | **Yes** — decide before Month 3                                   | Development team; PhilPEN comorbidity model should inform decision               |
| `epi_vaccinations.vaccine` — TEXT vs. enum; enum is safer but requires migration per new vaccine added to national schedule                                                                                      | schema-plan.md ⚠️ item 3                                | Yes — decide before Month 2                                       | Development team                                                                 |
| `disease_cases.patient_id` — nullable for aggregate Category II tally rows; must confirm NOT NULL enforcement for individual cases                                                                               | schema-plan.md ⚠️ item 4                                | **Yes** — data integrity constraint                               | Development team                                                                 |
| `stock_transactions.balance_after` — denormalized running balance vs. `SUM(qty)` live aggregation; must decide before inventory module                                                                           | schema-plan.md ⚠️ item 5                                | Yes — decide before Month 2 inventory stub                        | Development team                                                                 |
| `users.health_station_id` — nullable for CHO-level roles; NOT NULL enforcement for nurse/BHW at app layer only                                                                                                   | schema-plan.md ⚠️ item 6                                | Yes — enforce before user creation flows                          | Development team                                                                 |
| `sync_queue` retention/cleanup policy — archive after 30 days? delete processed rows?                                                                                                                            | schema-plan.md ⚠️ item 7                                | Yes — define before offline sync implementation (Month 4)         | Development team                                                                 |
| `TimestampMixin` + `SoftDeleteMixin` pattern — confirm before first Alembic migration                                                                                                                            | schema-plan.md ⚠️ item 8                                | **Yes** — blocking for all subsequent migrations                  | Development team; DEVELOPMENT.docx provides the pattern; confirm it is final     |
| FHSIS indicator formula validation — auto-generated M1/M2/Q1/A1 must be validated against CHO 2 actual historical submissions before go-live                                                                     | SCOPE.docx ■■, INITIAL_USERFLOW.docx                   | **Yes** — blocking for FHSIS report generation module acceptance  | PHIS Coordinator (CHO 2)                                                         |
| Item catalog and PAR levels per BHS — Basic Inventory module cannot be seeded without CHO 2 providing this data                                                                                                  | SCOPE.docx ■■                                          | Yes — blocking for inventory stub seeding                         | CHO 2 supply/logistics staff                                                     |
| CHO 2 historical FHSIS records availability — ML model training validity depends on volume of historical data; synthetic fallback is confirmed but reduces predictive validity                                   | SCOPE.docx, WORKFLOW_ANALYSIS.pdf                      | No (synthetic fallback exists) — but affects ML output quality    | CHO 2 to provide historical records before Month 4 ML training                   |
| LSTM model — listed as optional in SCOPE.docx, dependent on historical data availability; no implementation decision made                                                                                        | SCOPE.docx                                             | No — Prophet is confirmed minimum                                 | Development team after Month 3 data assessment                                   |
| psgc_code as barangay PK — SCOPE.docx uses `psgc_code`; schema-plan.md uses `barangay_code`; confirm these are the same field across all documents                                                               | SCOPE.docx vs schema-plan.md                           | **Yes** — FK references across all clinical tables depend on this | Development team; confirm field name before first migration                      |
| Physician role — "program-scoped" access is defined but specific program assignment mechanism (which programs a physician is assigned to, and how) is not fully specified                                        | CLAUDE.docx, SCOPE.docx                                | Yes — blocks physician RBAC implementation                        | Development team confirms with CHO 2                                             |
