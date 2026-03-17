# Project Retrospective

*A living document updated after each milestone. Lessons feed forward into future planning.*

## Milestone: v2 — Foundation

**Shipped:** 2026-03-18
**Phases:** 2 | **Plans:** 12 | **Timeline:** 3 days (2026-03-15 → 2026-03-18)

### What Was Built

- 6-service Docker Compose stack (FastAPI, PostgreSQL/PostGIS, Redis, Celery worker+beat, nginx) with health checks
- Async SQLAlchemy 2.0 base — SoftDeleteMixin, `do_orm_execute` auto-filter, append-only `audit_logs` with PostgreSQL RULE
- PostGIS seeded with Dasmariñas City barangay boundaries + 32 BHS station centroids via shapely centroid calculation
- PyJWT + pwdlib[argon2] security — access/refresh token rotation, SHA-256 hashed refresh tokens, session revocation
- 7-role RBAC — `require_role()` at router layer, `BaseRepository` barangay isolation, `CROSS_BHS_ROLES` frozenset
- React + Vite + shadcn/ui (base-nova, OKLCH tokens) frontend — login page, admin panel with UsersPage, CRUD modal, Activity Log tab

### What Worked

- **Strict layer separation** (router → service → repository) made Phase 2 RBAC enforcement clean and testable without cross-cutting logic
- **TDD stub pattern** (02-02 wave 0 stubs → 02-03 implementation) kept tests from blocking feature work while keeping them honest
- **Decimal phase splits** (02-03a / 02-03b) allowed incremental delivery and cleaner verification at phase boundaries
- **shadcn base-nova OKLCH palette** — custom CHO 2 design tokens in globals.css mapped well to the component system without drift

### What Was Inefficient

- **nginx double-prefix bug** shipped undetected through the full phase — dev proxy masked it; a docker-compose integration smoke test would have caught it at plan 02-03b
- **INFRA-04 path bug** persisted through phase completion because `docker-compose up` was not run during execution (Docker Desktop offline); runtime verification gap
- **02-05 plan split** into 05 + 05b added an extra plan boundary for what was logically one scaffold — future frontend scaffolds can stay one plan if Vite + auth infra are tightly coupled
- **`performed_by` NULL in audit_logs** — documented as intentional but discovered late; a clean design would carry a separate `actor_user_id INTEGER` column from the start

### Patterns Established

- `CROSS_BHS_ROLES` frozenset at module level — downstream Phase 3-9 repositories import this constant, never re-define access sets
- `require_role()` returns `Depends(_guard)` — passed directly to router `dependencies=[]`, not double-wrapped
- `UserSchema` carries `health_station_id` from JWT — `BaseRepository._isolation_filter()` can apply barangay scope without a DB round-trip
- SHA-256 hashed refresh tokens in `user_sessions` — DB compromise cannot yield valid sessions
- shadcn base-nova + OKLCH as the design system baseline — all future components extend from `globals.css` tokens, never hardcode colors

### Key Lessons

1. **Run docker-compose during execution, not just after** — production path bugs (nginx, volume mounts) only surface when the full stack is exercised. Start Docker Desktop before plan 01-01.
2. **Smoke test the nginx proxy path at Phase 1** — a single `curl localhost/api/health` through nginx would have caught the double-prefix bug 12 plans earlier.
3. **Audit log actor identity is a design decision, not an implementation detail** — settle `performed_by` storage strategy before writing the first audit INSERT, not after.
4. **Frontend role arrays must mirror backend validation sets exactly** — `ROLE_OPTIONS` in TypeScript and `_VALID_ROLES` in Python must be kept in sync; a shared constant or OpenAPI enum would eliminate the midwife discrepancy.

### Cost Observations

- Model mix: primarily Sonnet 4.6 (quality profile)
- Sessions: ~12 across the 3-day build
- Notable: Plan 02-05 (55 files changed) was the highest-churn plan; future frontend scaffolds should front-load dependency installation in plan research to avoid mid-plan blockers

---

## Cross-Milestone Trends

### Process Evolution

| Milestone | Days | Phases | Key Change |
|-----------|------|--------|------------|
| v2 Foundation | 3 | 2 | Initial build — established all base patterns |

### Cumulative Quality

| Milestone | Plans | LOC | Known Bugs at Ship |
|-----------|-------|-----|-------------------|
| v2 | 12 | ~11,861 | 2 (nginx prefix, GIS mount) |

### Top Lessons (Verified Across Milestones)

1. Runtime verification (docker-compose up) must be part of every infrastructure plan — not deferred to phase summary
2. Frontend and backend role/enum definitions must be kept in sync from the first plan that introduces roles
