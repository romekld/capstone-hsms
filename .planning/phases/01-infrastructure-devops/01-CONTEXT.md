# Phase 1: Infrastructure + DevOps - Context

**Gathered:** 2026-03-16
**Status:** Ready for planning

<domain>
## Phase Boundary

Establish a fully working local development environment: all 6 Docker services running and passing health checks, PostGIS seeded with CHO 2 barangay boundaries + BHS health station point geometry, async SQLAlchemy base patterns (TimestampMixin, SoftDeleteMixin, do_orm_execute hook) defined, and Alembic async migrations working with GeoAlchemy2 spatial columns and the audit_logs table. Authentication and RBAC are out of scope — Phase 2.

</domain>

<decisions>
## Implementation Decisions

### BHS Point Geometry
- Developer will provide real BHS coordinates as a JSON/CSV fixture file (not derived centroids)
- Fixture file will contain: BHS name, barangay PSGC code, lat/lng, contact number, address
- health_stations table fields: name, psgc_code FK (references barangay), location (PostGIS Point SRID 4326), contact_number, address
- Seed only CHO 2 jurisdiction — 32 barangays from cho2-boundaries.geojson (not the full 75-barangay Dasmariñas file)

### Barangay Identifier
- Column name: `psgc_code` (not `barangay_code`) — consistent with DOH/PSA standards and PIDSR exports
- `psgc_code` is the primary key of the barangay table (natural key — no surrogate integer PK)
- Barangay table fields: psgc_code (PK, TEXT), name, city_name, boundary (PostGIS MultiPolygon SRID 4326), area_sqkm
- `users.health_station_id` is nullable — CHO/PHIS Coordinator/DSO users have NULL; BHS-level roles (nurse, midwife, physician, bhw) must have a non-null health_station_id enforced at user creation

### GIS Data Loading
- All GIS seed data loaded via Alembic data migrations (Python) — single workflow, reproducible via `alembic upgrade head`
- Barangay boundaries loaded from gis-data/cho2-boundaries.geojson in the migration
- BHS health station points loaded from a fixture file (bhs_stations.json or bhs_stations.csv) committed to the repo and read by the migration
- All seed inserts use INSERT ... ON CONFLICT DO NOTHING — safe to replay on existing database

### Docker Dev Environment
- Single docker-compose.yml (no base + override split) — simpler for solo capstone dev
- FastAPI hot-reload: uvicorn --reload with ./backend volume-mounted into the container
- Test database: same postgres container, separate database name (e.g., test_hsms) — no extra container
- Backend exposed on port 8000 on the host; nginx on port 80 — both accessible for dev

### Claude's Discretion
- SQLAlchemy TimestampMixin + SoftDeleteMixin implementation pattern (separate mixins vs. combined BaseModel)
- do_orm_execute hook implementation detail for auto-injecting WHERE deleted_at IS NULL
- lazy="raise" enforcement approach on relationships
- Docker health check commands and retry intervals per service
- Port assignments for Redis (6379), PostgreSQL (5432), Celery (no external port)
- Celery worker and Celery Beat configuration (queues, beat schedule)
- nginx reverse proxy configuration (proxy_pass, headers)

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- gis-data/cho2-boundaries.geojson: 32 barangay boundary MultiPolygon features, CRS84 (SRID 4326), fields: ADM4_EN (name), ADM4_PCODE (psgc_code), ADM3_EN (city_name), Shape_Area, AREA_SQKM
- gis-data/dasmarinas_boundaries.geojson: 75-barangay full city file — reference only, not seeded

### Established Patterns
- No existing code — clean slate project. All patterns established in this phase become the foundation for Phases 2-9.

### Integration Points
- The barangay and health_stations tables created here are the FK anchors for every subsequent phase (users.health_station_id, disease_cases.barangay_psgc_code, etc.)
- The async SQLAlchemy base model and Alembic migration pattern established here must be reused consistently across all 9 phases
- The test database (test_hsms) will be used by all pytest test suites in Phases 2-9

</code_context>

<specifics>
## Specific Ideas

- No specific UI requirements — this phase is infrastructure only
- BHS fixture file to be authored by developer before or alongside Phase 1 execution; the migration will reference this file by relative path from the backend directory
- `psgc_code` format: full ADM4_PCODE string as stored in GeoJSON (e.g., PH0402106021) — do not truncate or reformat

</specifics>

<deferred>
## Deferred Ideas

- None — discussion stayed within phase scope

</deferred>

---

*Phase: 01-infrastructure-devops*
*Context gathered: 2026-03-16*
