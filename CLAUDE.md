# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Identity

**Project LINK** (Local Information Network for Kalusugan) — An integrated health station management system for City Health Office II (CHO 2) in Dasmariñas City, Philippines. Serves 32 Barangay Health Stations covering 164,691 people.

## Tech Stack

**Backend:** FastAPI + Python, SQLAlchemy 2.0 (async), Pydantic v2, PostgreSQL + PostGIS, Redis + Celery, JWT auth (python-jose)

**Frontend:** React + TypeScript, Vite, shadcn/ui, MapLibre GL JS

**ML:** Prophet (forecasting), scikit-learn (classification, DBSCAN clustering)

**Infrastructure:** Docker + docker-compose, nginx reverse proxy

**Offline:** IndexedDB + Service Worker (PWA) for BHW mobile field entry

## Development Commands

```bash
# Start all services
docker-compose up

# Backend only
docker-compose up backend

# Frontend dev server
cd frontend && npm run dev

# Run backend tests
docker-compose exec backend pytest

# Run a single test
docker-compose exec backend pytest tests/path/to/test.py::test_name

# Frontend lint
cd frontend && npm run lint

# Frontend type-check
cd frontend && npm run typecheck

# Celery worker
docker-compose up celery_worker
```

## Architecture

### Request Flow (Backend)
```
Request → Router (RBAC via require_role()) → Service (business logic, no DB) → Repository (DB queries, barangay isolation) → AsyncSession → Pydantic response schema
```

### Backend Structure
```
backend/app/
├── core/         # config, security, database setup, dependencies
├── models/       # SQLAlchemy ORM (one file per domain)
├── schemas/      # Pydantic v2 request + response schemas
├── routers/      # FastAPI routers (RBAC enforced here)
├── services/     # Business logic (no direct DB access)
├── repositories/ # DB queries only (barangay isolation enforced here)
├── ml/           # Prophet + scikit-learn inference wrappers
├── tasks/        # Celery async tasks (ML training, nightly jobs)
└── websockets/   # Category I disease alert manager
```

### Frontend Structure
```
frontend/src/
├── features/     # prenatal/, epi/, tb/, ncd/, gis/, ml/ — each has api.ts + types.ts
├── components/   # Shared UI (shadcn/ui wrappers)
├── pages/        # Route-level components
└── lib/          # axios instance, API client
```

### Key Patterns

**RBAC:** Enforced via `require_role()` FastAPI dependency at the router layer. Barangay data isolation enforced at the repository layer.

**Async-first:** SQLAlchemy 2.0 async sessions throughout. Never use sync ORM methods.

**ML non-blocking:** CPU-bound inference must use `run_in_threadpool()` or Celery tasks — never block async endpoints.

**Soft deletes only:** All clinical tables use `deleted_at TIMESTAMPTZ` — never hard DELETE (RA 10173 Data Privacy Act compliance).

**Offline sync:** BHW writes to IndexedDB → Service Worker background sync → POST /api/sync/batch on reconnect. Conflict resolution: newer server-side `updated_at` wins; clinical conflicts require nurse review. All syncable tables carry `local_id UUID` and `status record_status DEFAULT 'PENDING'`.

**Real-time alerts:** Category I disease case saved → `disease_alerts` INSERT + WebSocket broadcast to DSO/CHO simultaneously. WebSocket auth via JWT query param.

**No raw ORM returns:** Always validate through Pydantic schemas before JSON response.

## User Roles

| Role | Access |
|------|--------|
| `system_admin` | Config/user management only (exclusive role) |
| `city_health_officer` | Read-only: dashboards, GIS, ML forecasts, Category I alerts |
| `physician` | Patient records, clinical notes, diagnoses (program-scoped) |
| `phis_coordinator` | Read-only: FHSIS data verification, M1/M2/Q1/A1 export |
| `disease_surveillance_officer` | PIDSR validation, Category II export, GIS/ML |
| `nurse` / `midwife` | Patient ITR, program records, BHW approval, inventory (own BHS) |
| `bhw` | Mobile-first offline field entry; all records require nurse approval |

A nurse can also hold `disease_surveillance_officer`. `system_admin` is exclusive.

## Compliance Requirements

- **DOH DM 2024-0007:** FHSIS 2024 indicator formulas for M1/M2/Q1/A1 auto-generation
- **RA 11332 / AO 2021-0057:** Category I notifiable disease alert within 24 hours via WebSocket
- **RA 10173 (Data Privacy Act):** Soft deletes only; append-only `audit_logs` table; no PII in logs
- **PhilPEN Protocol:** HTN/DM risk stratification in NCD module
- **WHO Z-scores:** WAZ/HAZ/WHZ nutrition classification with severe wasting ML trigger
- **RFC 7946:** GeoJSON for all spatial responses via `ST_AsGeoJSON()`

## UI Development Rules

**Invoke the `frontend-design` skill before building any UI surface — pages, components, modals, forms.** This is mandatory, not optional.

### shadcn/ui is the component foundation
- Start from [shadcn/ui blocks](https://ui.shadcn.com/blocks) before writing custom layout code
- Applicable blocks: `dashboard-01` through `dashboard-07`, `sidebar-*`, `login-*`, `chart-*`
- Never write a `<div>` grid layout when a shadcn block exists for that pattern

### Theming
- All colors via CSS variables: `hsl(var(--primary))`, `hsl(var(--background))`, etc. — never hardcode hex/rgb in components
- Brand tokens defined once in `globals.css` under `:root` and `.dark` selectors
- Project-specific semantic tokens: `--status-critical`, `--status-warning`, `--status-safe`, `--bhs-tier`, `--cho-tier`

### Quality bar — every UI surface must:
- Handle interactive states (hover, focus, active, disabled), not just the default state
- Handle empty state, loading state, and error state
- Be responsive for tablets (field nurses use tablets)
- Look like it belongs to this product, not a generic admin template

### Never:
- Use `bg-gray-100 rounded-lg shadow p-4` as a default card pattern
- Lay out a dashboard as a uniform 3-column card grid
- Generate a form without considering field worker context (offline, mobile, gloves, low literacy)
- Ship a table without sorting, filtering, and pagination
- Use placeholder chart data — connect real data or add explicit `TODO:` comment
