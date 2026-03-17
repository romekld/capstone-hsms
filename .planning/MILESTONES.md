# Milestones

## v2 Foundation (Shipped: 2026-03-17)

**Phases:** 1–2 (2 phases, 12 plans)
**Files:** 232 files changed, 21,807 insertions
**LOC:** ~11,861 (Python + TypeScript)
**Timeline:** 3 days (2026-03-15 → 2026-03-18)

**Key accomplishments:**
- 6-service Docker Compose stack (FastAPI, PostgreSQL/PostGIS, Redis, Celery worker+beat, nginx) with full health checks
- Async SQLAlchemy base patterns — SoftDeleteMixin, `do_orm_execute` auto-filter, append-only `audit_logs` table, Alembic async migrations
- PostGIS seeded with Dasmariñas City barangay boundaries + 32 BHS station centroids
- PyJWT + pwdlib security — JWT access/refresh rotation, refresh token hashed in `user_sessions`, token revocation on logout
- 7-role RBAC with `require_role()` at router layer + `BaseRepository` barangay isolation at repository layer
- Full admin panel UI — login page, UsersPage with CRUD modal, Deactivation AlertDialog, Activity Log tab backed by live audit data

### Known Gaps

- **INFRA-04** (path bug): `0002_seed_gis_data.py` reads `../../gis-data/cho2-boundaries.geojson` but `gis-data/` is not mounted into the backend Docker service — `FileNotFoundError` at `alembic upgrade head` in docker-compose runtime. Fix: add volume mount or embed fixture inside the container image.
- **nginx double-prefix** (production 404s): `proxy_pass http://backend:8000/` strips `/api` prefix; backend registers routes at `/api/*`. All API calls through nginx port 80 return 404. Fix: remove trailing slash from `proxy_pass`. Vite dev proxy is unaffected.

---

