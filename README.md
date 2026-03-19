# Project LINK — Local Information Network for Kalusugan

An integrated health station management system for **City Health Office II (CHO 2)** in Dasmariñas City, Philippines. Serves 32 Barangay Health Stations covering a population of 164,691.

## Overview

Project LINK digitizes and unifies fragmented paper-based health records across 32 Barangay Health Stations into a two-tier platform:

- **BHS tier** — Offline-capable digital records for maternal care, immunization, nutrition, family planning, TB-DOTS, NCD, and disease surveillance. Covers the full BHW → nurse approval workflow.
- **CHO tier** — City-wide consolidation dashboard for the City Health Officer, PHIS Coordinator, and Disease Surveillance Officer. Delivers live Category I disease alerts (WebSocket), GIS disease mapping, ML outbreak forecasting, and auto-generated FHSIS reports.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Backend framework | FastAPI + Python 3.12 |
| ORM | SQLAlchemy 2.0 (async) + GeoAlchemy2 |
| Schema validation | Pydantic v2 |
| Database | PostgreSQL 16 + PostGIS 3.4 |
| Auth | PyJWT (stateless JWT, refresh via `user_sessions`) |
| Task queue | Celery 5 + Redis 7 |
| Frontend | React 19 + TypeScript + Vite 6 |
| UI components | shadcn/ui + Tailwind CSS v4 |
| Data fetching | TanStack Query v5 |
| Maps | MapLibre GL JS + react-map-gl |
| Offline storage | Dexie.js (IndexedDB) + Service Worker (PWA) |
| ML | Prophet (forecasting) + scikit-learn (classification, DBSCAN) |
| Containerization | Docker + docker-compose + nginx |

## Getting Started

### Prerequisites

- Docker + Docker Compose
- Node.js 22 LTS (frontend dev only)
- Python 3.12 (backend dev only)

### Run all services

```bash
docker-compose up
```

Services started:

| Service | Port | Description |
|---------|------|-------------|
| nginx | 80 | Reverse proxy (routes `/api/*` → backend, `/` → frontend) |
| backend | 8000 | FastAPI app |
| db | 5432 | PostgreSQL + PostGIS |
| redis | 6379 | Celery broker + cache |
| celery_worker | — | ML inference + async tasks |
| celery_beat | — | Nightly scheduled jobs (ML retraining, risk index) |

### Frontend dev server

```bash
cd frontend && npm run dev
```

### Run backend tests

```bash
docker-compose exec backend pytest

# Single test
docker-compose exec backend pytest tests/path/to/test.py::test_name
```

### Lint and type-check frontend

```bash
cd frontend && npm run lint
cd frontend && npm run typecheck
```

## Architecture

### Request flow

```
Request
  → Router           (RBAC via require_role() dependency)
  → Service          (business logic — no DB access)
  → Repository       (DB queries — barangay isolation enforced here)
  → AsyncSession     (SQLAlchemy 2.0 async, never sync)
  → Pydantic schema  (model_validate() — never return raw ORM objects)
  → JSON response
```

### Backend structure

```
backend/app/
├── core/           # config, security, database, dependencies
├── models/         # SQLAlchemy ORM — one file per domain
├── schemas/        # Pydantic v2 — request + response schemas
├── routers/        # FastAPI routers — RBAC enforced here
├── services/       # Business logic — no direct DB access
├── repositories/   # DB queries — barangay isolation applied here
├── ml/             # Prophet + scikit-learn inference wrappers
├── tasks/          # Celery tasks (ML training, nightly batch jobs)
└── websockets/     # Category I disease alert ConnectionManager
```

### Frontend structure

```
frontend/src/
├── features/       # prenatal/ epi/ tb/ ncd/ gis/ ml/ — each: api.ts + types.ts
├── components/     # Shared UI (shadcn/ui wrappers)
├── pages/          # Route-level components
└── lib/            # axios instance, API client
```

## User Roles

| Role | Scope | Primary Function |
|------|-------|-----------------|
| `system_admin` | Config only | User accounts, role assignment, system config (exclusive role) |
| `city_health_officer` | All 32 BHS (read-only) | Dashboards, GIS maps, ML forecasts, Category I alerts |
| `physician` | Assigned programs | Patient records, clinical notes, diagnoses |
| `phis_coordinator` | All 32 BHS (read-only) | FHSIS indicator verification, M1/M2/Q1/A1 export |
| `disease_surveillance_officer` | All 32 BHS | PIDSR validation, Category II export, GIS/ML monitoring |
| `nurse` / `midwife` | Own BHS | Patient ITR, program records, BHW approval, inventory |
| `bhw` | Own patients | Mobile-first offline field entry (requires nurse approval) |

## Modules

### Full modules (Phase 1)
- **Patient ITR** — Unified Individual Treatment Record with city-wide patient search
- **Maternal Care** — Prenatal + postpartum enrollment, visits, auto-scheduled follow-ups, overdue detection
- **Child Care — EPI** — Vaccination records, dose sequence enforcement, FIC computation, defaulter detection
- **Child Care — Nutrition (OPT+)** — WHO Z-scores (WAZ/HAZ/WHZ), severe-wasting ML trigger
- **TB-DOTS** — Case registration, daily visit recording, sputum schedule tracking, contact tracing
- **Disease Surveillance (PIDSR)** — Category I real-time WebSocket alerts + Category II weekly batch export
- **NCD** — Hypertension + Diabetes with PhilPEN risk stratification
- **Basic Inventory** — Item catalog, per-BHS stock levels, low-stock alerts

### Cross-cutting capabilities
- **GIS Disease Mapping** — Barangay choropleth + purok heatmap + DBSCAN spatial clustering (MapLibre GL JS + PostGIS)
- **ML Predictive Analytics** — Prophet outbreak forecasting, scikit-learn at-risk patient classifier, nightly barangay risk index (Celery)
- **FHSIS Auto-Report Generation** — M1/M2/Q1/A1 per DOH DM 2024-0007, PDF + Excel export for PHO submission

## Compliance

| Standard | Requirement |
|----------|-------------|
| DOH DM 2024-0007 | FHSIS 2024 indicator formulas for auto-generated reports |
| RA 11332 / AO 2021-0057 | Category I notifiable disease alert within 24 hours (WebSocket) |
| RA 10173 (Data Privacy Act) | Soft deletes only (`deleted_at`), append-only audit logs, no PII in logs |
| PhilPEN Protocol | HTN/DM risk stratification in NCD module |
| WHO Z-score standards | WAZ/HAZ/WHZ nutrition classification |
| RFC 7946 | GeoJSON for all spatial API responses (`ST_AsGeoJSON()`) |

## Key Design Decisions

**Soft deletes only** — All clinical tables use `deleted_at TIMESTAMPTZ`. Hard DELETEs are never used (RA 10173 compliance).

**Async-first** — SQLAlchemy 2.0 async sessions throughout. All relationships use `lazy="raise"` to prevent `MissingGreenlet` crashes; queries explicitly use `selectinload()`/`joinedload()`.

**Barangay isolation at repository layer** — `BaseRepository` auto-applies `health_station_id` filters. Nurses see only their BHS; cross-BHS access is role-gated, not filtered ad-hoc.

**ML non-blocking** — CPU-bound inference runs via `run_in_threadpool()` or Celery tasks, never directly in async endpoints.

**Offline sync** — BHWs write to IndexedDB → Service Worker background sync → `POST /api/sync/batch` on reconnect. Conflict rule: newer server-side `updated_at` wins; clinical field conflicts always require nurse review.

**Persistent alerts** — Category I disease alerts are stored in `disease_alerts` and carry unread state per user. A DSO offline at alert time sees all unread alerts on next login, enabling after-the-fact RA 11332 compliance measurement.

## Project Context

This system is a capstone thesis project designed for CHO 2 Dasmariñas City. It is purpose-built for this operational context and is not a general-purpose HMIS. Phase 1 covers the core clinical programs and intelligence layer; Phase 2 will add Family Planning, Newborn Care, IMCI, full supply chain management, and SMS/push alert fallback.

For complete system context, design decisions, and known limitations, see [`project-context/PROJECT_CONTEXT.md`](project-context/PROJECT_CONTEXT.md).
