# Project LINK (HSMS)

## What This Is

Project LINK (Local Information Network for Kalusugan) is an integrated health station management system for City Health Office II (CHO 2) in Dasmariñas City, Philippines. It digitizes and unifies the paper-based clinical records of 32 Barangay Health Stations serving 164,691 people, replacing manual tally-and-report workflows with real-time dashboards, automated FHSIS reporting, GIS disease mapping, and ML-based predictive analytics. The system operates across two tiers: a BHS tier for point-of-care record entry (including offline-capable BHW mobile field entry) and a CHO tier for city-wide supervisory intelligence.

## Core Value

City Health Officer and DSO can detect a Category I disease outbreak and respond within the RA 11332 24-hour window — something structurally impossible under the current paper system.

## Requirements

### Validated

- ✓ Docker + docker-compose dev environment (FastAPI, PostgreSQL/PostGIS, Redis, Celery worker+beat, nginx) — v2
- ✓ PostGIS seeded with Dasmariñas City barangay boundaries + 32 BHS station centroids (SRID 4326) — v2
- ✓ Soft deletes on all clinical tables (`deleted_at TIMESTAMPTZ`); global `do_orm_execute` auto-filter — v2 (RA 10173)
- ✓ Append-only `audit_logs` table with append-only PostgreSQL RULE — no PII in server logs — v2
- ✓ User authentication with JWT — PyJWT access/refresh rotation, hashed refresh token in `user_sessions`, revocation on logout — v2
- ✓ RBAC via `require_role()` FastAPI dependency — 7 roles enforced at router layer — v2
- ✓ Barangay data isolation at repository layer — `BaseRepository._isolation_filter()` — v2
- ✓ `city_health_officer` and `phis_coordinator` read-only cross-BHS access (`CROSS_BHS_ROLES`) — v2
- ✓ `disease_surveillance_officer` cross-BHS access + PIDSR CRUD foundation — v2 (PIDSR routes deferred to Phase 3+)
- ✓ `system_admin` exclusive role, manages users/roles/BHS assignment — v2
- ✓ Admin panel UI — login page, UsersPage, Create/Edit modal, Deactivation AlertDialog, Activity Log tab — v2

### Active

**Known gaps from v2 (tech debt):**
- INFRA-04 path bug: `gis-data/` not mounted in Docker container — `alembic upgrade head` will `FileNotFoundError` in docker-compose runtime. Fix before Phase 3 startup.
- nginx double-prefix: `proxy_pass http://backend:8000/` strips `/api`; all routes 404 through port 80. Fix before demo or integration testing.
- `midwife` role: backend validates it; frontend has no `ROLE_OPTIONS` entry for it.
- `audit_logs.performed_by` always NULL — actor identity requires JSONB parsing of `new_values`.

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

**Shipped v2 (2026-03-18):** ~11,861 LOC (Python + TypeScript). Stack confirmed: FastAPI + SQLAlchemy 2.0 async + PyJWT + pwdlib + Alembic + PostGIS/GeoAlchemy2 + Redis/Celery + React + Vite + shadcn/ui (base-nova, OKLCH tokens). Two known bugs carried as tech debt (GIS mount path, nginx double-prefix). Next: Phase 3 — Patient ITR + Core Data Model.

## Constraints

- **Timeline**: 4-month build (capstone thesis deadline)
- **Tech stack**: FastAPI + SQLAlchemy 2.0 async + Pydantic v2 + PostgreSQL/PostGIS + Redis/Celery + React/TypeScript/Vite + shadcn/ui + MapLibre GL JS + Prophet + scikit-learn — locked
- **Compliance**: DOH DM 2024-0007 (FHSIS formulas), RA 11332/AO 2021-0057 (24-hr Category I), RA 10173 (soft deletes, audit logs), PhilPEN (NCD risk stratification), WHO Z-scores (nutrition), RFC 7946 (GeoJSON)
- **Data dependency (blocking)**: FHSIS formula validation against CHO 2 historical submissions required before report generation go-live; CHO 2 must provide item catalog + PAR levels before inventory seeding
- **ML training data**: Synthetic fallback confirmed if historical FHSIS records are insufficient; confidence label mandatory on all ML outputs

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Soft deletes only (no hard DELETE on clinical tables) | RA 10173 Data Privacy Act compliance; audit trail integrity | ✓ Good — `SoftDeleteMixin` + `do_orm_execute` hook shipped v2 |
| RBAC at router layer via require_role() dependency | Centralized enforcement, not scattered per-endpoint | ✓ Good — `require_role()` returns `Depends(_guard)`; declarative at router level |
| Barangay isolation at repository layer only | Prevents data leakage; single enforcement point | ✓ Good — `BaseRepository._isolation_filter()`; `CROSS_BHS_ROLES` frozenset exported for Phase 3+ |
| Async-first SQLAlchemy 2.0 throughout | FastAPI async; never block event loop | ✓ Good — confirmed `do_orm_execute` on Session (not AsyncSession) works correctly per SQLAlchemy 2.0 docs |
| ML inference via run_in_threadpool() or Celery | CPU-bound work must not block async endpoints | — Pending (Phase 8) |
| WebSocket auth via JWT query param | Stateless; works with browser WebSocket API limitations | — Pending (Phase 6) |
| IndexedDB + Service Worker for offline (not native app) | BHW uses phone browser; avoids app store distribution | — Pending (Phase 9) |
| Conflict resolution: server wins on newer updated_at; clinical fields → nurse review | Clinical safety; no silent overwrites of patient data | — Pending (Phase 9) |
| system_admin has zero clinical data access | Separation of system management from patient data | ✓ Good — `system_admin` excluded from `CROSS_BHS_ROLES`; enforced at router layer |
| audit_viewer role merged into system_admin (7 roles total, not 8) | INITIAL_USERFLOW.docx resolution | ✓ Good — 7-role system shipped and verified |
| Replace python-jose with PyJWT + pwdlib[argon2] | python-jose abandoned, CVEs; PyJWT 2.12 active, no cryptography dep | ✓ Good — shipped v2; argon2 hashing confirmed |
| Single docker-compose.yml (no base+override split) | Simplifies solo dev workflow | ✓ Good — shipped v2 |
| Refresh tokens stored as SHA-256 hash in user_sessions | DB breach cannot yield valid tokens | ✓ Good — shipped v2 |
| User model uses is_active Boolean (not SoftDeleteMixin) | Deactivation is not deletion; admin tools need to query inactive users | ✓ Good — shipped v2 |
| roles column is PostgreSQL ARRAY(TEXT) | Avoids JOIN table for RBAC; supports array containment operators | ✓ Good — shipped v2; multi-role (nurse+DSO) confirmed working |
| BHS station coordinates from barangay polygon centroids | Spatially accurate within Philippines range; real GPS updatable by developer | ✓ Good — shipped v2 via shapely centroid calculation |

## Open Questions (Blocking)

| Question | Must Resolve Before |
|----------|---------------------|
| `consultations.vitals` — discrete columns vs. `vitals JSONB` | Phase 3 migration |
| `ncd_enrollments.condition` — TEXT vs enum vs array (comorbidity) | Phase 5 |
| `epi_vaccinations.vaccine` — TEXT vs enum | Phase 4 |
| `disease_cases.patient_id` — nullable for aggregate Category II rows | Phase 6 |
| `stock_transactions.balance_after` — denormalized vs. live SUM | Phase 9 inventory |
| `sync_queue` retention/cleanup policy | Phase 9 offline sync |
| ~~`users.health_station_id` — nullable enforcement for CHO-level roles~~ | ✓ Resolved v2 — `nullable=True` in ORM; JWT payload carries `health_station_id`; isolation layer checks for None |
| ~~`TimestampMixin` + `SoftDeleteMixin` pattern confirmation~~ | ✓ Resolved v2 — both implemented, `do_orm_execute` tested |
| ~~`psgc_code` vs `barangay_code` field name consistency~~ | ✓ Resolved v2 — `psgc_code` used consistently in barangay model and FK chains |

---
*Last updated: 2026-03-18 after v2 Foundation milestone*
