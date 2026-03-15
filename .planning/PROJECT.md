# Project LINK (HSMS)

## What This Is

Project LINK (Local Information Network for Kalusugan) is an integrated health station management system for City Health Office II (CHO 2) in Dasmariñas City, Philippines. It digitizes and unifies the paper-based clinical records of 32 Barangay Health Stations serving 164,691 people, replacing manual tally-and-report workflows with real-time dashboards, automated FHSIS reporting, GIS disease mapping, and ML-based predictive analytics. The system operates across two tiers: a BHS tier for point-of-care record entry (including offline-capable BHW mobile field entry) and a CHO tier for city-wide supervisory intelligence.

## Core Value

City Health Officer and DSO can detect a Category I disease outbreak and respond within the RA 11332 24-hour window — something structurally impossible under the current paper system.

## Requirements

### Validated

(None yet — ship to validate)

### Active

**Foundation**
- [ ] User authentication with JWT (email/password, session persistence, refresh token revocation)
- [ ] RBAC via `require_role()` FastAPI dependency — 7 roles: system_admin, city_health_officer, physician, phis_coordinator, disease_surveillance_officer, nurse/midwife, bhw
- [ ] Barangay data isolation enforced at repository layer
- [ ] Soft deletes on all clinical tables (`deleted_at TIMESTAMPTZ`) — RA 10173 compliance
- [ ] Append-only `audit_logs` table — no PII in server logs
- [ ] Docker + docker-compose dev environment (PostgreSQL, PostGIS, Redis, Celery, nginx)

**Patient Records**
- [ ] Unified patient ITR (Individual Treatment Record) with city-wide search via GIN index
- [ ] Patient identity is never duplicated per program — `patient_id` FK on all enrollment/visit tables

**Maternal Care**
- [ ] Prenatal enrollment and visit records (replaces paper TCL ledger)
- [ ] Auto-calculated `next_visit_date` based on clinic schedule; continuous overdue detection
- [ ] Postpartum enrollment and visit records (Day 1, Week 1, Week 6 schedule from manual delivery date)

**Child Health**
- [ ] EPI enrollment and vaccination records with dose sequence enforcement and FIC computation
- [ ] EPI defaulter detection at moment scheduled dose date passes (not at month-end tally)
- [ ] Nutrition (OPT+) enrollment and visit records with WHO Z-score classification (WAZ, HAZ, WHZ)
- [ ] Severe wasting → ML at-risk alert trigger

**TB-DOTS**
- [ ] TB case registration, daily DOTS visit recording (per-drug: H, R, Z, E, S)
- [ ] Sputum exam schedule tracking (Month 0/2/5/6), overdue sputum flagging
- [ ] Contact tracing records; TB case notification auto-feeds PIDSR module

**Disease Surveillance**
- [ ] Category I disease case entry → immediate WebSocket broadcast to DSO + CHO sessions
- [ ] Persistent `disease_alerts` table (unread state per user; offline DSO sees all on next login)
- [ ] Category II disease case entry → weekly Friday batch export (PDF/Excel) by DSO
- [ ] PIDSR validation workflow (`validated_at` gap = RA 11332 compliance metric)

**NCD**
- [ ] Unified HTN + DM enrollment and visit records with PhilPEN risk stratification
- [ ] Monthly `next_visit_date` auto-calculation; controlled vs. uncontrolled status per visit

**Basic Inventory (Stub)**
- [ ] Item catalog (medicines, vaccines, supplies — seeded from CHO 2 data)
- [ ] Per-BHS stock levels and stock transaction log (in/out/adjustment) with timestamp + user
- [ ] Low-stock alerts on nurse/midwife dashboard

**GIS Disease Mapping**
- [ ] Barangay-level choropleth and purok-level heatmap via MapLibre GL JS + PostGIS
- [ ] DBSCAN spatial clustering (scikit-learn) for outbreak cluster detection
- [ ] Filter by disease type, barangay, date range; all spatial responses use ST_AsGeoJSON() (RFC 7946)

**ML Predictive Analytics**
- [ ] Outbreak forecasting: Prophet per Category II disease per barangay (stored in `ml_disease_forecasts`)
- [ ] At-risk patient flagging: scikit-learn classifier (prenatal high-risk, severe wasting, uncontrolled NCD)
- [ ] Barangay risk index: nightly Celery composite score (disease counts + overdue patients + EPI gaps)
- [ ] All ML inference via `run_in_threadpool()` or Celery — never blocking async endpoints
- [ ] Confidence label on all ML outputs: HISTORICAL / SYNTHETIC / MIXED

**FHSIS Auto-Report Generation**
- [ ] M1, M2, Q1, A1 auto-generated from live program data using DOH DM 2024-0007 formulas
- [ ] PHIS Coordinator per-indicator verification checkbox before export unlock
- [ ] PDF + Excel export for PHO submission

**Offline / PWA**
- [ ] BHW mobile-first offline entry via IndexedDB + Service Worker background sync
- [ ] POST /api/sync/batch on reconnect; conflict rule: newer server `updated_at` wins; clinical conflicts → nurse review queue
- [ ] Dedup rule: reject exact duplicate on `patient_id + record_type + date + bhw_id`
- [ ] All syncable tables carry `local_id UUID` and `status record_status DEFAULT 'PENDING'`

### Out of Scope

- Family Planning — deferred to Phase 2
- Newborn Care / ENC — deferred to Phase 2
- Animal Bite / ABTC full PEP tracking — deferred; rabies death covered via PIDSR Category I "Unusual Event"
- IMCI / Sick Child — deferred to Phase 2
- Environmental Health & Sanitation — deferred
- STI / National AIDS Control Program — deferred
- Cancer screening (VIA/CBE), Senior Citizen, Mental Health, Drug/CBR, Dental full module — deferred
- Malaria, Schistosomiasis, Leprosy, Filariasis — not endemic in Dasmariñas
- PHO/regional system integration — no DOH NHDR or iHOMIS API in Phase 1
- Intrapartum/delivery records — BHS does not perform deliveries
- PhilHealth billing / eKonsulta — separate operational domain
- Hospital clinical management — out of CHO 2 scope
- Online public appointment booking — deferred
- Cross-CHO patient continuity — single-CHO deployment only
- Inventory: PAR automation, cold chain, expiry/batch, supplier tracking, procurement, AI reorder — Phase 2
- SMS/push notification fallback for Category I alerts — Phase 2
- LSTM model — optional, depends on historical data availability

## Context

CHO 2 is fully paper-based across all 32 BHS. No digital system exists at any health station. A single encoder handles 192+ program reports per month (single point of failure). BHWs use personal phone notepads in the field then manually copy to paper. Category I disease reporting within 24 hours (RA 11332) is structurally impossible under the current system.

CHO 2 is purpose-built scope — this is not portable to CHO 1/3/4/5 without full re-validation. The system is a validated prototype under a 4-month build constraint; it is not a production-hardened deployment.

Known reporting gaps accepted as Phase 1 limitations: M1 MCPR (Family Planning), M1 ENC (Newborn Care), M2 under-5 morbidity (IMCI), Animal Bite PEP missed-dose alerts.

## Constraints

- **Timeline**: 4-month build (capstone thesis deadline)
- **Tech stack**: FastAPI + SQLAlchemy 2.0 async + Pydantic v2 + PostgreSQL/PostGIS + Redis/Celery + React/TypeScript/Vite + shadcn/ui + MapLibre GL JS + Prophet + scikit-learn — locked
- **Compliance**: DOH DM 2024-0007 (FHSIS formulas), RA 11332/AO 2021-0057 (24-hr Category I), RA 10173 (soft deletes, audit logs), PhilPEN (NCD risk stratification), WHO Z-scores (nutrition), RFC 7946 (GeoJSON)
- **Data dependency (blocking)**: FHSIS formula validation against CHO 2 historical submissions required before report generation go-live; CHO 2 must provide item catalog + PAR levels before inventory seeding
- **ML training data**: Synthetic fallback confirmed if historical FHSIS records are insufficient; confidence label mandatory on all ML outputs

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Soft deletes only (no hard DELETE on clinical tables) | RA 10173 Data Privacy Act compliance; audit trail integrity | — Pending |
| RBAC at router layer via require_role() dependency | Centralized enforcement, not scattered per-endpoint | — Pending |
| Barangay isolation at repository layer only | Prevents data leakage; single enforcement point | — Pending |
| Async-first SQLAlchemy 2.0 throughout | FastAPI async; never block event loop | — Pending |
| ML inference via run_in_threadpool() or Celery | CPU-bound work must not block async endpoints | — Pending |
| WebSocket auth via JWT query param | Stateless; works with browser WebSocket API limitations | — Pending |
| IndexedDB + Service Worker for offline (not native app) | BHW uses phone browser; avoids app store distribution | — Pending |
| Conflict resolution: server wins on newer updated_at; clinical fields → nurse review | Clinical safety; no silent overwrites of patient data | — Pending |
| system_admin has zero clinical data access | Separation of system management from patient data | — Pending |
| audit_viewer role merged into system_admin (7 roles total, not 8) | INITIAL_USERFLOW.docx resolution — confirm with CHO 2 before enum definition | — Pending |

## Open Questions (Blocking)

| Question | Must Resolve Before |
|----------|---------------------|
| `consultations.vitals` — discrete columns vs. `vitals JSONB` | Month 1 migration |
| `ncd_enrollments.condition` — TEXT vs enum vs array (comorbidity) | Month 3 |
| `epi_vaccinations.vaccine` — TEXT vs enum | Month 2 |
| `disease_cases.patient_id` — nullable for aggregate Category II rows | Month 1 |
| `stock_transactions.balance_after` — denormalized vs. live SUM | Month 2 inventory stub |
| `users.health_station_id` — nullable enforcement for CHO-level roles | Before user creation flows |
| `sync_queue` retention/cleanup policy | Month 4 offline sync |
| `TimestampMixin` + `SoftDeleteMixin` pattern confirmation | First Alembic migration |
| `psgc_code` vs `barangay_code` field name consistency | First migration (FK chains depend on this) |

---
*Last updated: 2026-03-15 after initialization*
