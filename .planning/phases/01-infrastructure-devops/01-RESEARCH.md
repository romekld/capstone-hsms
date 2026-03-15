# Phase 1: Infrastructure + DevOps - Research

**Researched:** 2026-03-16
**Domain:** Docker Compose, FastAPI async SQLAlchemy 2.0, GeoAlchemy2/PostGIS, Alembic async migrations
**Confidence:** HIGH (core patterns) / MEDIUM (a few pitfall edge cases)

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **BHS Point Geometry:** Developer provides real BHS coordinates as a JSON/CSV fixture file (not derived centroids). Fields: BHS name, barangay PSGC code, lat/lng, contact number, address. `health_stations` table: name, psgc_code FK (references barangay), location (PostGIS Point SRID 4326), contact_number, address.
- **Barangay Identifier:** Column name is `psgc_code` (not `barangay_code`). `psgc_code` is the primary key of the barangay table (natural key — no surrogate integer PK). Barangay table: psgc_code (PK, TEXT), name, city_name, boundary (PostGIS MultiPolygon SRID 4326), area_sqkm. `users.health_station_id` nullable (CHO/PHIS/DSO = NULL; BHS-level roles must have non-null health_station_id enforced at user creation in Phase 2).
- **GIS Data Loading:** All GIS seed data loaded via Alembic data migrations (Python). Barangay boundaries from gis-data/cho2-boundaries.geojson. BHS health station points from bhs_stations.json or bhs_stations.csv committed to repo and read by migration. All seed inserts use INSERT ... ON CONFLICT DO NOTHING.
- **Docker Dev Environment:** Single docker-compose.yml (no base + override split). FastAPI hot-reload with uvicorn --reload and ./backend volume-mounted. Test database: same postgres container, separate database (test_hsms). Backend exposed on port 8000; nginx on port 80.
- **psgc_code format:** Full ADM4_PCODE string as stored in GeoJSON (e.g., PH0402106021) — do not truncate or reformat.
- **Seed scope:** Only CHO 2 jurisdiction — 32 barangays from cho2-boundaries.geojson (not the full 75-barangay file).

### Claude's Discretion
- SQLAlchemy TimestampMixin + SoftDeleteMixin implementation pattern (separate mixins vs. combined BaseModel)
- do_orm_execute hook implementation detail for auto-injecting WHERE deleted_at IS NULL
- lazy="raise" enforcement approach on relationships
- Docker health check commands and retry intervals per service
- Port assignments for Redis (6379), PostgreSQL (5432), Celery (no external port)
- Celery worker and Celery Beat configuration (queues, beat schedule)
- nginx reverse proxy configuration (proxy_pass, headers)

### Deferred Ideas (OUT OF SCOPE)
- None — discussion stayed within phase scope
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| INFRA-01 | System runs in Docker Compose with 6 services: FastAPI backend, PostgreSQL + PostGIS, Redis, Celery worker, Celery Beat (separate container), nginx reverse proxy | Docker Compose service patterns, health check commands, depends_on chains |
| INFRA-02 | All clinical database tables use soft deletes (`deleted_at TIMESTAMPTZ`); hard DELETE never issued on patient data (RA 10173) | SoftDeleteMixin + do_orm_execute + with_loader_criteria pattern documented |
| INFRA-03 | Append-only `audit_logs` table records all create/update/soft-delete operations; no patient PII appears in server logs or error messages | PostgreSQL RULE-based append-only enforcement pattern documented |
| INFRA-04 | Barangay health station boundary and point geometry data seeded into PostGIS (SRID 4326) from Dasmariñas City GeoJSON file | GeoAlchemy2 + Shapely from_shape pattern, Alembic data migration with JSON fixture |
</phase_requirements>

---

## Summary

Phase 1 establishes a clean-slate FastAPI + PostgreSQL/PostGIS stack. All patterns chosen here become the mandatory baseline for all 9 phases. The stack is well-proven: `create_async_engine` + `asyncpg`, `async_sessionmaker`, `GeoAlchemy2` with `alembic_helpers`, and Celery Beat as a separate container sharing the same image as the worker. The primary technical risk is the GeoAlchemy2 + async Alembic env.py integration, which requires the three `alembic_helpers` functions to be registered in `context.configure()` for both offline and online modes; missing this causes silent spatial index duplication or import errors.

The soft-delete auto-filter via `do_orm_execute` + `with_loader_criteria` is the correct SQLAlchemy 2.0 approach and works with AsyncSession because the event listener fires on the underlying `Session` before async dispatch. The `lazy="raise"` strategy is mandatory on all relationships to prevent N+1 and implicit IO errors in async contexts.

GIS data seeding is done entirely within Alembic data migrations: parse `cho2-boundaries.geojson` with `json` stdlib + `shapely`, convert with `from_shape(..., srid=4326)`, and bulk insert with `ON CONFLICT DO NOTHING`. The developer-authored `bhs_stations.json` fixture follows the same pattern for point geometry.

**Primary recommendation:** Use the `alembic init -t async` template, register all three `geoalchemy2.alembic_helpers` in `env.py`, and keep the BaseModel, TimestampMixin, and SoftDeleteMixin in `backend/app/core/base.py` so every subsequent phase imports from one source of truth.

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| FastAPI | 0.115.x | ASGI web framework | Project-mandated; async-first, Pydantic v2 native |
| SQLAlchemy | 2.0.x | Async ORM | Project-mandated; Mapped type annotations, do_orm_execute, async_sessionmaker |
| asyncpg | 0.30.x | PostgreSQL async driver | Highest throughput async driver; required for `postgresql+asyncpg://` URL |
| GeoAlchemy2 | 0.18.4 | PostGIS spatial column types + query functions | Only maintained Python PostGIS ORM library; provides alembic_helpers |
| Shapely | 2.x | Geometry manipulation for seed data | GeoAlchemy2's from_shape/to_shape depend on it; needed for GeoJSON parsing |
| Alembic | 1.13.x | Database migrations | Project-mandated; has official async template (`-t async`) |
| Celery | 5.4.x | Async task queue + Beat scheduler | Project-mandated; Redis as broker |
| redis (py) | 5.x | Redis client | Required for Celery broker connection |
| pydantic-settings | 2.x | Environment variable configuration | Project-mandated Pydantic v2 stack |
| uvicorn | 0.30.x | ASGI server | Standard FastAPI runner; `--reload` for dev |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| python-dotenv | 1.x | .env loading | Dev convenience; pydantic-settings reads .env directly |
| pytest | 8.x | Test framework | All phases; backend tests |
| pytest-asyncio | 0.24.x | Async test support | Required for async SQLAlchemy fixtures |
| httpx | 0.27.x | Async HTTP client for tests | FastAPI TestClient async alternative |
| anyio | 4.x | Async test backend | FastAPI official recommendation for async tests |

### Docker Images
| Service | Image | Version Tag |
|---------|-------|-------------|
| PostgreSQL + PostGIS | postgis/postgis | 16-3.4 |
| Redis | redis | 7-alpine |
| nginx | nginx | 1.25-alpine |
| Backend / Celery | project Dockerfile (python:3.12-slim) | — |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| asyncpg | psycopg3 (async) | psycopg3 is also viable but asyncpg has higher throughput benchmarks; GeoAlchemy2 is tested against asyncpg |
| postgis/postgis | kartoza/postgis | kartoza has more extensions but less maintained; official postgis/postgis is sufficient |
| separate Celery Beat container | Beat on worker with `-B` flag | Separate container is cleaner and is the locked decision; running `-B` on worker risks task duplication |

**Installation:**
```bash
# Backend Python dependencies (requirements.txt)
fastapi==0.115.*
uvicorn[standard]==0.30.*
sqlalchemy[asyncio]==2.0.*
asyncpg==0.30.*
geoalchemy2==0.18.*
shapely==2.*
alembic==1.13.*
celery==5.4.*
redis==5.*
pydantic-settings==2.*
python-jose[cryptography]  # Phase 2 — include in initial requirements
pytest==8.*
pytest-asyncio==0.24.*
httpx==0.27.*
anyio==4.*
```

---

## Architecture Patterns

### Recommended Project Structure
```
backend/
├── app/
│   ├── core/
│   │   ├── base.py          # DeclarativeBase, TimestampMixin, SoftDeleteMixin, do_orm_execute hook
│   │   ├── config.py        # pydantic-settings Settings class
│   │   ├── database.py      # create_async_engine, async_sessionmaker, get_async_session dep
│   │   └── dependencies.py  # FastAPI Depends helpers (db session)
│   ├── models/              # SQLAlchemy ORM (one file per domain — barangay.py, etc.)
│   ├── schemas/             # Pydantic v2 schemas (Phase 2+)
│   ├── routers/             # FastAPI routers (Phase 2+)
│   ├── services/            # Business logic (Phase 2+)
│   ├── repositories/        # DB queries (Phase 2+)
│   ├── ml/                  # Phase 8
│   ├── tasks/               # Celery tasks (Phase 8)
│   └── websockets/          # Phase 6
│   main.py                  # FastAPI app factory
├── alembic/
│   ├── versions/            # Migration scripts
│   └── env.py               # Async env.py with geoalchemy2 alembic_helpers
├── alembic.ini
├── tests/
│   ├── conftest.py          # async engine/session fixtures, pytest-asyncio config
│   └── test_infra/
│       ├── test_migrations.py
│       └── test_spatial.py
├── fixtures/
│   └── bhs_stations.json    # Developer-authored BHS point geometry fixture
├── Dockerfile
└── requirements.txt
docker-compose.yml
nginx/
└── nginx.conf
gis-data/
└── cho2-boundaries.geojson  # Already present
```

### Pattern 1: Async SQLAlchemy Engine + Session Dependency

```python
# backend/app/core/database.py
# Source: https://docs.sqlalchemy.org/en/20/orm/extensions/asyncio.html
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from app.core.config import settings

engine = create_async_engine(
    settings.DATABASE_URL,  # postgresql+asyncpg://user:pass@db:5432/hsms
    echo=settings.DEBUG,
    pool_pre_ping=True,
)

AsyncSessionLocal = async_sessionmaker(
    engine,
    expire_on_commit=False,
    class_=AsyncSession,
)

async def get_async_session() -> AsyncGenerator[AsyncSession, None]:
    async with AsyncSessionLocal() as session:
        yield session
```

### Pattern 2: Base Model with Mixins

**Recommendation:** Separate mixins. `TimestampMixin` is used by all tables. `SoftDeleteMixin` is used only by clinical tables (not `audit_logs`, not `barangays`, not lookup tables). A `DeclarativeBase` class at the top registers the `do_orm_execute` hook once.

```python
# backend/app/core/base.py
# Source: https://docs.sqlalchemy.org/en/20/orm/declarative_mixins.html
#         https://docs.sqlalchemy.org/en/20/orm/session_events.html

from datetime import datetime
from typing import Optional
from sqlalchemy import DateTime, event, func
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, Session, with_loader_criteria
from sqlalchemy.ext.asyncio import AsyncAttrs

class Base(AsyncAttrs, DeclarativeBase):
    """Root base for all ORM models.
    AsyncAttrs enables awaitable_attrs access pattern for loaded relationships.
    """
    pass

class TimestampMixin:
    """Adds created_at + updated_at to any model. Used by ALL tables."""
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

class SoftDeleteMixin:
    """Adds deleted_at to clinical tables. Hard DELETE is never issued (RA 10173)."""
    deleted_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
        default=None,
    )

# Register the do_orm_execute hook ONCE on the Session class
# This auto-injects WHERE deleted_at IS NULL for all SELECT statements
# on models that carry SoftDeleteMixin.
@event.listens_for(Session, "do_orm_execute")
def _filter_soft_deleted(orm_execute_state):
    if (
        orm_execute_state.is_select
        and not orm_execute_state.is_column_load
        and not orm_execute_state.is_relationship_load
    ):
        orm_execute_state.statement = orm_execute_state.statement.options(
            with_loader_criteria(
                SoftDeleteMixin,
                lambda cls: cls.deleted_at.is_(None),
                include_aliases=True,
            )
        )
```

**lazy="raise" enforcement:** Set `lazy="raise"` as the default on every `relationship()` call across all models. Never omit it. To load related objects, always use `selectinload()` or `joinedload()` in the query explicitly.

```python
# In every model file
from sqlalchemy.orm import relationship

class Patient(SoftDeleteMixin, TimestampMixin, Base):
    __tablename__ = "patients"
    # ...
    enrollments = relationship(
        "PrenatalEnrollment",
        back_populates="patient",
        lazy="raise",   # ALWAYS set this
    )
```

### Pattern 3: Async Alembic env.py

```python
# alembic/env.py
# Source: https://geoalchemy-2.readthedocs.io/en/stable/alembic.html
#         Alembic async template (alembic init -t async)

import asyncio
from logging.config import fileConfig
from sqlalchemy import pool
from sqlalchemy.engine import Connection
from sqlalchemy.ext.asyncio import async_engine_from_config
from alembic import context
from geoalchemy2 import alembic_helpers

# Import ALL models so autogenerate can detect them
from app.core.base import Base
from app.models import barangay  # import each model module

config = context.config
target_metadata = Base.metadata

def run_migrations_offline() -> None:
    context.configure(
        url=config.get_main_option("sqlalchemy.url"),
        target_metadata=target_metadata,
        literal_binds=True,
        include_object=alembic_helpers.include_object,
        process_revision_directives=alembic_helpers.writer,
        render_item=alembic_helpers.render_item,
    )
    with context.begin_transaction():
        context.run_migrations()

def do_run_migrations(connection: Connection) -> None:
    context.configure(
        connection=connection,
        target_metadata=target_metadata,
        include_object=alembic_helpers.include_object,
        process_revision_directives=alembic_helpers.writer,
        render_item=alembic_helpers.render_item,
    )
    with context.begin_transaction():
        context.run_migrations()

async def run_async_migrations() -> None:
    connectable = async_engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )
    async with connectable.connect() as connection:
        await connection.run_sync(do_run_migrations)
    await connectable.dispose()

def run_migrations_online() -> None:
    asyncio.run(run_async_migrations())

if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
```

**Critical:** Register all three `alembic_helpers` in BOTH `run_migrations_offline()` and `do_run_migrations()`. Missing either breaks spatial column autogenerate.

### Pattern 4: GIS Seed Data Migration (Alembic data migration)

```python
# alembic/versions/0002_seed_gis_data.py
# Source: https://geoalchemy-2.readthedocs.io/en/stable/shape.html
#         https://geoalchemy-2.readthedocs.io/en/stable/alembic.html

import json
import os
from alembic import op
from shapely.geometry import shape
from geoalchemy2.shape import from_shape

def upgrade() -> None:
    conn = op.get_bind()

    # --- Seed barangays from GeoJSON ---
    geojson_path = os.path.join(
        os.path.dirname(__file__), "../../gis-data/cho2-boundaries.geojson"
    )
    with open(geojson_path) as f:
        geojson = json.load(f)

    for feature in geojson["features"]:
        props = feature["properties"]
        geom = shape(feature["geometry"])  # Shapely MultiPolygon
        wkb = from_shape(geom, srid=4326)  # GeoAlchemy2 WKBElement

        conn.execute(
            """
            INSERT INTO barangays (psgc_code, name, city_name, boundary, area_sqkm)
            VALUES (:psgc_code, :name, :city_name, ST_GeomFromEWKB(:boundary), :area_sqkm)
            ON CONFLICT (psgc_code) DO NOTHING
            """,
            {
                "psgc_code": props["ADM4_PCODE"],
                "name": props["ADM4_EN"],
                "city_name": props["ADM3_EN"],
                "boundary": wkb.desc,  # hex WKB string
                "area_sqkm": props["AREA_SQKM"],
            }
        )

    # --- Seed BHS stations from fixture ---
    fixture_path = os.path.join(
        os.path.dirname(__file__), "../../fixtures/bhs_stations.json"
    )
    with open(fixture_path) as f:
        stations = json.load(f)

    for s in stations:
        from shapely.geometry import Point
        point_geom = Point(s["lng"], s["lat"])  # (longitude, latitude) order for SRID 4326
        wkb_point = from_shape(point_geom, srid=4326)

        conn.execute(
            """
            INSERT INTO health_stations (name, psgc_code, location, contact_number, address)
            VALUES (:name, :psgc_code, ST_GeomFromEWKB(:location), :contact_number, :address)
            ON CONFLICT DO NOTHING
            """,
            {
                "name": s["name"],
                "psgc_code": s["psgc_code"],
                "location": wkb_point.desc,
                "contact_number": s.get("contact_number"),
                "address": s.get("address"),
            }
        )
```

**Note on WKB hex:** `from_shape(...).desc` returns the WKB hex string. Pass it to `ST_GeomFromEWKB()` in raw SQL. Alembic data migrations use raw SQL via `op.get_bind()` because the async session is not available in the migration context.

### Pattern 5: Docker Compose with Health Checks

```yaml
# docker-compose.yml (single file — locked decision)
services:

  db:
    image: postgis/postgis:16-3.4
    environment:
      POSTGRES_DB: hsms
      POSTGRES_USER: hsms_user
      POSTGRES_PASSWORD: hsms_pass
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD", "pg_isready", "-U", "hsms_user", "-d", "hsms"]
      interval: 5s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 5s
      timeout: 3s
      retries: 3

  backend:
    build: ./backend
    command: uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
    volumes:
      - ./backend:/app
    ports:
      - "8000:8000"
    environment:
      DATABASE_URL: postgresql+asyncpg://hsms_user:hsms_pass@db:5432/hsms
      TEST_DATABASE_URL: postgresql+asyncpg://hsms_user:hsms_pass@db:5432/test_hsms
      REDIS_URL: redis://redis:6379/0
    depends_on:
      db:
        condition: service_healthy
      redis:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
      interval: 10s
      timeout: 5s
      retries: 3
      start_period: 15s

  celery_worker:
    build: ./backend
    command: celery -A app.tasks.celery_app worker --loglevel=info
    volumes:
      - ./backend:/app
    environment:
      DATABASE_URL: postgresql+asyncpg://hsms_user:hsms_pass@db:5432/hsms
      REDIS_URL: redis://redis:6379/0
    depends_on:
      db:
        condition: service_healthy
      redis:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "celery", "-A", "app.tasks.celery_app", "inspect", "ping",
             "--destination", "celery@$$HOSTNAME"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 10s

  celery_beat:
    build: ./backend
    command: celery -A app.tasks.celery_app beat --loglevel=info
    volumes:
      - ./backend:/app
    environment:
      DATABASE_URL: postgresql+asyncpg://hsms_user:hsms_pass@db:5432/hsms
      REDIS_URL: redis://redis:6379/0
    depends_on:
      db:
        condition: service_healthy
      redis:
        condition: service_healthy

  nginx:
    image: nginx:1.25-alpine
    ports:
      - "80:80"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/conf.d/default.conf:ro
    depends_on:
      backend:
        condition: service_healthy

volumes:
  postgres_data:
```

### Pattern 6: nginx Configuration (WebSocket-aware)

```nginx
# nginx/nginx.conf
server {
    listen 80;

    location /api/ {
        proxy_pass http://backend:8000/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /ws/ {
        proxy_pass http://backend:8000/ws/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_read_timeout 86400;
    }
}
```

**Note:** WebSocket proxying requires `Upgrade` + `Connection` headers and `proxy_http_version 1.1`. Omitting these causes WebSocket connections to silently fail. Phase 6 requires this.

### Pattern 7: audit_logs Append-Only Enforcement

```sql
-- Applied in an Alembic migration (raw SQL via op.execute())
CREATE TABLE audit_logs (
    id          BIGSERIAL PRIMARY KEY,
    table_name  TEXT NOT NULL,
    record_id   UUID NOT NULL,
    operation   TEXT NOT NULL CHECK (operation IN ('CREATE', 'UPDATE', 'SOFT_DELETE')),
    performed_by UUID,              -- user_id (FK added in Phase 2)
    performed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    old_values  JSONB,
    new_values  JSONB
    -- NO deleted_at — this table is never soft-deleted
);

-- Deny UPDATE and DELETE via PostgreSQL RULE (append-only enforcement)
CREATE RULE no_update_audit_logs AS ON UPDATE TO audit_logs DO INSTEAD NOTHING;
CREATE RULE no_delete_audit_logs AS ON DELETE TO audit_logs DO INSTEAD NOTHING;

-- Optional: deny via trigger (more visible error)
CREATE OR REPLACE FUNCTION deny_audit_log_mutation()
RETURNS trigger AS $$
BEGIN
    RAISE EXCEPTION 'audit_logs is append-only; modifications are not permitted';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER audit_logs_immutable
    BEFORE UPDATE OR DELETE ON audit_logs
    FOR EACH ROW EXECUTE FUNCTION deny_audit_log_mutation();
```

**Note:** RULE-based denial silently swallows the operation. A BEFORE trigger that raises an exception is more visible during development. Use both: the RULE as primary enforcement, the trigger for developer feedback.

### Anti-Patterns to Avoid

- **Never** use `create_engine()` (sync) — use `create_async_engine()` throughout
- **Never** define a relationship without `lazy="raise"` — implicit lazy loads fail in async context with `MissingGreenlet` error
- **Never** call `session.execute()` with a GeoAlchemy2 `Geometry` column in the ORM update path without explicitly passing WKBElement — raw dict updates bypass type coercion
- **Never** run `alembic revision --autogenerate` without the three `geoalchemy2.alembic_helpers` registered — generates duplicate spatial index create/drop statements that break autogenerated migrations on replay
- **Never** store GeoJSON features directly in PostGIS text columns — always use `from_shape(..., srid=4326)` and the `Geometry` column type

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Spatial column type mapping | Custom binary serializer | GeoAlchemy2 `Geometry(geometry_type='MultiPolygon', srid=4326)` | EWKB/WKB format, SRID handling, ST_ function expressions |
| GeoJSON → PostGIS insert | Manual WKT string formatting | `shapely.geometry.shape()` + `geoalchemy2.shape.from_shape()` | Handles coordinate precision, ring ordering, SRID attachment |
| Soft-delete auto-filter | WHERE clauses on every query | `do_orm_execute` + `with_loader_criteria` | One hook covers all queries including eager loads and relationships |
| Docker service ordering | Shell sleep loops | `depends_on: condition: service_healthy` | Deterministic health-based startup ordering |
| Alembic spatial support | Custom migration ops | `geoalchemy2.alembic_helpers.writer` | Handles AddGeometryColumn / DropGeometryColumn PostGIS DDL |
| Async test event loop | Custom asyncio fixture | `pytest-asyncio` with `asyncio_mode = "auto"` | Handles event loop scoping across fixtures |

**Key insight:** Spatial data serialization is a known minefield. `from_shape()` with explicit `srid=4326` is the only reliable path to correct EWKB encoding. Passing raw GeoJSON coordinates as strings to PostGIS functions works but bypasses ORM type safety and breaks Alembic autogenerate.

---

## Common Pitfalls

### Pitfall 1: Alembic autogenerate creates duplicate spatial indexes
**What goes wrong:** `alembic revision --autogenerate` generates `op.create_index()` for geometry columns even though PostGIS creates the spatial index automatically during `AddGeometryColumn`. Running the migration twice fails with "index already exists."
**Why it happens:** GeoAlchemy2's `spatial_index=True` default causes Alembic to detect a "missing" index on re-inspection.
**How to avoid:** Register `geoalchemy2.alembic_helpers.writer` in `env.py` — it removes the duplicate index ops automatically. After each autogenerate, visually inspect the generated migration before running it.
**Warning signs:** Migration file contains `op.create_index('idx_...', 'table', ['geom'], ...)` alongside a GeoAlchemy2 column addition.

### Pitfall 2: do_orm_execute hook fires for relationship loads and breaks eager loading
**What goes wrong:** `with_loader_criteria` applied without `not orm_execute_state.is_relationship_load` causes double-filtering or errors when selectinload() tries to load relationships.
**Why it happens:** The hook fires for every SELECT, including relationship sub-selects.
**How to avoid:** Gate the filter on `is_select and not is_column_load and not is_relationship_load`. The `include_aliases=True` parameter in `with_loader_criteria` propagates the filter through aliases automatically.
**Warning signs:** `InvalidRequestError` or empty relationship results when using `selectinload()`.

### Pitfall 3: MissingGreenlet error from lazy relationship access in async context
**What goes wrong:** Accessing a relationship attribute (e.g., `patient.enrollments`) without eager loading raises `sqlalchemy.exc.MissingGreenlet: greenlet_spawn has not been called`.
**Why it happens:** SQLAlchemy's sync lazy-load path tries to emit SQL outside the asyncio event loop.
**How to avoid:** Set `lazy="raise"` on all relationships. Use `selectinload()` in every query that needs related objects. The `AsyncAttrs` mixin on `Base` allows `await obj.awaitable_attrs.enrollments` as an escape hatch when needed.
**Warning signs:** `MissingGreenlet` traceback in async test or endpoint.

### Pitfall 4: asyncpg rejects TIMESTAMPTZ onupdate without timezone info
**What goes wrong:** `onupdate=func.now()` works in tests but `onupdate=datetime.utcnow` (Python-side default) sends a naive datetime to asyncpg, which rejects it.
**Why it happens:** asyncpg enforces timezone awareness for `TIMESTAMPTZ` columns.
**How to avoid:** Use `server_default=func.now()` and `onupdate=func.now()` (both SQL-side) rather than Python callables. Never use `datetime.utcnow` — use `datetime.now(UTC)` if a Python default is unavoidable.
**Warning signs:** `asyncpg.exceptions.DataError: invalid input for query argument`.

### Pitfall 5: Alembic async env.py conflicts with existing event loop in some CI environments
**What goes wrong:** `asyncio.run(run_async_migrations())` fails with "This event loop is already running" in certain test environments that pre-create a loop.
**Why it happens:** Some tools (Jupyter, some test frameworks) create a default asyncio loop.
**How to avoid:** Use `asyncio.run()` (not `asyncio.get_event_loop().run_until_complete()`) — it creates a new loop. If CI fails, use `nest_asyncio` as a targeted workaround but do not ship it in production code.
**Warning signs:** `RuntimeError: This event loop is already running` in CI but not locally.

### Pitfall 6: PostGIS extension not created before GeoAlchemy2 table creation
**What goes wrong:** Migration fails with `type "geometry" does not exist` even though `postgis/postgis` image is used.
**Why it happens:** The PostGIS image includes the extension files but does not run `CREATE EXTENSION postgis` automatically in non-default databases (e.g., `test_hsms`).
**How to avoid:** The first migration must explicitly run `op.execute("CREATE EXTENSION IF NOT EXISTS postgis")`. Do this in migration `0001_initial_schema` before any spatial column is created.
**Warning signs:** Migration failure on `test_hsms` database even though it works on the main `hsms` database.

---

## Code Examples

### Declaring the barangay model
```python
# backend/app/models/barangay.py
from geoalchemy2 import Geometry
from sqlalchemy import Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.base import Base, TimestampMixin

class Barangay(TimestampMixin, Base):
    """No SoftDeleteMixin — barangay boundaries are reference data, not clinical records."""
    __tablename__ = "barangays"

    psgc_code: Mapped[str] = mapped_column(Text, primary_key=True)
    name: Mapped[str] = mapped_column(Text, nullable=False)
    city_name: Mapped[str] = mapped_column(Text, nullable=False)
    boundary: Mapped[object] = mapped_column(
        Geometry(geometry_type="MULTIPOLYGON", srid=4326),
        nullable=False,
    )
    area_sqkm: Mapped[float] = mapped_column(nullable=True)

    health_stations = relationship(
        "HealthStation",
        back_populates="barangay",
        lazy="raise",
    )
```

### Declaring the health_stations model
```python
# backend/app/models/health_station.py
from geoalchemy2 import Geometry
from sqlalchemy import Text, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.base import Base, TimestampMixin

class HealthStation(TimestampMixin, Base):
    """No SoftDeleteMixin — stations are reference data."""
    __tablename__ = "health_stations"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(Text, nullable=False)
    psgc_code: Mapped[str] = mapped_column(
        Text, ForeignKey("barangays.psgc_code"), nullable=False
    )
    location: Mapped[object] = mapped_column(
        Geometry(geometry_type="POINT", srid=4326),
        nullable=False,
    )
    contact_number: Mapped[str | None] = mapped_column(Text, nullable=True)
    address: Mapped[str | None] = mapped_column(Text, nullable=True)

    barangay = relationship("Barangay", back_populates="health_stations", lazy="raise")
```

### pytest conftest.py for async tests
```python
# backend/tests/conftest.py
import pytest_asyncio
import pytest
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.pool import NullPool
from app.core.base import Base
from app.core.config import settings

pytest_ini = {"asyncio_mode": "auto"}  # or set in pytest.ini

@pytest_asyncio.fixture(scope="session")
async def async_engine():
    engine = create_async_engine(
        settings.TEST_DATABASE_URL,
        poolclass=NullPool,
    )
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield engine
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
    await engine.dispose()

@pytest_asyncio.fixture
async def async_session(async_engine) -> AsyncSession:
    async with async_sessionmaker(async_engine, expire_on_commit=False)() as session:
        yield session
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `create_engine` + `psycopg2` | `create_async_engine` + `asyncpg` | SQLAlchemy 1.4 / 2.0 | All ORM calls are now non-blocking |
| Alembic sync `env.py` | Alembic async template (`-t async`) | Alembic 1.11 | `run_async_migrations()` with `connection.run_sync()` pattern |
| GeoAlchemy2 manual spatial index cleanup | `alembic_helpers.writer` | GeoAlchemy2 0.9+ | Autogenerate works without manual edit |
| `lazy="select"` default | `lazy="raise"` mandatory in async | SQLAlchemy 2.0 | Forces explicit eager loading; prevents N+1 and MissingGreenlet |
| `event_loop` fixture override | `asyncio_mode = "auto"` in pytest.ini | pytest-asyncio 0.21 | Eliminates DeprecationWarning; event loop managed by pytest-asyncio |
| python-jose (JWT) | PyJWT recommended | 2023 (CVEs in python-jose) | Note: python-jose included in initial requirements per CLAUDE.md but STATE.md flags to re-evaluate in Phase 2 |

**Deprecated/outdated:**
- `Base = declarative_base()` (legacy style): Replaced by `class Base(DeclarativeBase): pass` in SQLAlchemy 2.0
- `Column(DateTime, ...)` inside class body: Replaced by `Mapped[datetime] = mapped_column(...)` type-annotated style
- `session.execute(select(...)).fetchall()`: Replaced by `(await session.execute(select(...))).scalars().all()`

---

## Open Questions

1. **bhs_stations.json fixture file**
   - What we know: Developer will author this file before or alongside Phase 1 execution. Fields required: name, psgc_code (full ADM4_PCODE string), lat, lng, contact_number, address.
   - What's unclear: File does not yet exist. Migration will fail until it is created.
   - Recommendation: Create a stub `bhs_stations.json` with one placeholder record as part of Wave 0 setup. Mark it with a TODO. The planner should include a task to author the full 32-station fixture.

2. **test_hsms database creation**
   - What we know: Test DB is the same postgres container, different database name.
   - What's unclear: The `postgis/postgis` image only creates the POSTGRES_DB database automatically. `test_hsms` must be created manually or via an init script.
   - Recommendation: Add a `docker-entrypoint-initdb.d/` init SQL script that runs `CREATE DATABASE test_hsms;` on first container start. This is the standard postgres image pattern.

3. **GeoAlchemy2 + asyncpg in Alembic data migrations**
   - What we know: Alembic data migrations use `op.get_bind()` which returns a sync-compatible connection. GeoAlchemy2's `from_shape().desc` gives a raw hex string passable to `ST_GeomFromEWKB()`.
   - What's unclear: Whether `op.get_bind()` returns a sync connection that GeoAlchemy2 expressions can execute against in the async env.py context. This needs a quick local test in Wave 0.
   - Recommendation: Use raw SQL with `ST_GeomFromEWKB(decode(:wkb_hex, 'hex'))` as a fallback if GeoAlchemy2 ORM expressions fail in the migration context.

---

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | pytest 8.x + pytest-asyncio 0.24.x |
| Config file | `backend/pytest.ini` — Wave 0 creates this |
| Quick run command | `docker-compose exec backend pytest tests/test_infra/ -x -q` |
| Full suite command | `docker-compose exec backend pytest -x -q` |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| INFRA-01 | All 6 Docker services start and pass health checks | smoke | `docker-compose ps` + check all services `healthy` | ❌ Wave 0 |
| INFRA-01 | FastAPI `/health` endpoint returns 200 | integration | `docker-compose exec backend pytest tests/test_infra/test_health.py -x` | ❌ Wave 0 |
| INFRA-02 | SoftDeleteMixin `deleted_at` column exists on clinical tables | unit | `docker-compose exec backend pytest tests/test_infra/test_base_model.py::test_soft_delete_column -x` | ❌ Wave 0 |
| INFRA-02 | `do_orm_execute` hook filters deleted records from SELECT | unit | `docker-compose exec backend pytest tests/test_infra/test_soft_delete.py -x` | ❌ Wave 0 |
| INFRA-03 | `audit_logs` table exists with correct schema | integration | `docker-compose exec backend pytest tests/test_infra/test_migrations.py::test_audit_logs_table -x` | ❌ Wave 0 |
| INFRA-03 | UPDATE on `audit_logs` is rejected | integration | `docker-compose exec backend pytest tests/test_infra/test_audit_logs.py::test_update_denied -x` | ❌ Wave 0 |
| INFRA-04 | 32 barangay rows exist in `barangays` table after `alembic upgrade head` | integration | `docker-compose exec backend pytest tests/test_infra/test_spatial.py::test_barangay_seed_count -x` | ❌ Wave 0 |
| INFRA-04 | `ST_AsGeoJSON(boundary)` returns valid RFC 7946 GeoJSON for a seeded barangay | integration | `docker-compose exec backend pytest tests/test_infra/test_spatial.py::test_barangay_geojson -x` | ❌ Wave 0 |
| INFRA-04 | `ST_AsGeoJSON(location)` returns valid Point GeoJSON for a seeded BHS station | integration | `docker-compose exec backend pytest tests/test_infra/test_spatial.py::test_bhs_station_geojson -x` | ❌ Wave 0 |

### Sampling Rate
- **Per task commit:** `docker-compose exec backend pytest tests/test_infra/ -x -q`
- **Per wave merge:** `docker-compose exec backend pytest -x -q`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `backend/pytest.ini` — configure `asyncio_mode = auto`, `testpaths = tests`
- [ ] `backend/tests/conftest.py` — async engine/session fixtures, test_hsms database
- [ ] `backend/tests/test_infra/test_health.py` — covers INFRA-01
- [ ] `backend/tests/test_infra/test_base_model.py` — covers INFRA-02 (column presence)
- [ ] `backend/tests/test_infra/test_soft_delete.py` — covers INFRA-02 (filter behavior)
- [ ] `backend/tests/test_infra/test_migrations.py` — covers INFRA-03
- [ ] `backend/tests/test_infra/test_audit_logs.py` — covers INFRA-03 (append-only)
- [ ] `backend/tests/test_infra/test_spatial.py` — covers INFRA-04
- [ ] Framework install: included in `requirements.txt` — pytest, pytest-asyncio, httpx, anyio
- [ ] `docker-entrypoint-initdb.d/01_create_test_db.sql` — `CREATE DATABASE test_hsms;`
- [ ] `backend/fixtures/bhs_stations.json` — stub with placeholder (TODO: full 32-station data)

---

## Sources

### Primary (HIGH confidence)
- SQLAlchemy 2.0 Asyncio docs — https://docs.sqlalchemy.org/en/20/orm/extensions/asyncio.html — create_async_engine, async_sessionmaker, lazy="raise", AsyncAttrs
- SQLAlchemy 2.0 ORM Events — https://docs.sqlalchemy.org/en/20/orm/session_events.html — do_orm_execute + with_loader_criteria pattern
- SQLAlchemy 2.0 Declarative Mixins — https://docs.sqlalchemy.org/en/20/orm/declarative_mixins.html — TimestampMixin, Mapped columns in mixins
- GeoAlchemy2 Alembic docs — https://geoalchemy-2.readthedocs.io/en/stable/alembic.html — alembic_helpers (include_object, writer, render_item)
- GeoAlchemy2 Shapely integration — https://geoalchemy-2.readthedocs.io/en/stable/shape.html — from_shape, to_shape, SRID, WKBElement
- GeoAlchemy2 PyPI — https://pypi.org/project/GeoAlchemy2/ — version 0.18.4 confirmed, Python >=3.10

### Secondary (MEDIUM confidence)
- Berk Karaal (Sep 2024) — FastAPI + async SQLAlchemy 2 + Alembic + Docker setup — https://berkkaraal.com/blog/2024/09/19/setup-fastapi-project-with-async-sqlalchemy-2-alembic-postgresql-and-docker/
- Alembic async template (official repo) — https://github.com/sqlalchemy/alembic/blob/main/alembic/templates/async/env.py
- Docker Compose health check patterns — pg_isready, redis-cli ping, celery inspect ping — verified against multiple authoritative sources
- SQLAlchemy discussion #10517 (soft delete patterns) — https://github.com/sqlalchemy/sqlalchemy/discussions/10517
- OneUptime blog (Feb 2026) — FastAPI + PostgreSQL + Celery Docker Compose — https://oneuptime.com/blog/post/2026-02-08-how-to-set-up-a-fastapi-postgresql-celery-stack-with-docker-compose/view

### Tertiary (LOW confidence)
- Celery Beat health check command (`celery inspect ping`) — documented in multiple community sources but behavior may vary by Celery version; needs local validation
- asyncpg version pinning recommendation — community sources conflict slightly on 0.29.x vs 0.30.x; use latest 0.30.x and validate during Wave 0

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all versions cross-referenced with PyPI and official docs
- Architecture: HIGH — patterns drawn directly from SQLAlchemy 2.0 and GeoAlchemy2 official documentation
- Pitfalls: MEDIUM — most verified by official sources or well-documented GitHub issues; Celery Beat health check is LOW confidence
- Validation architecture: HIGH — pytest-asyncio patterns well-documented

**Research date:** 2026-03-16
**Valid until:** 2026-04-16 (stable ecosystem — 30 days)
