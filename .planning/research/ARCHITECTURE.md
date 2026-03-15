# Architecture Patterns

**Domain:** Two-tier (BHS + CHO) health information system with offline-first field entry, real-time disease alerts, spatial analytics, and ML forecasting
**Researched:** 2026-03-15

## Recommended Architecture

### High-Level System Overview

```
                         +---------------------------+
                         |       nginx reverse       |
                         |         proxy (:80)       |
                         +------+----------+--------+
                                |          |
                   +------------+    +-----+--------+
                   |                 |              |
           +-------v------+  +------v------+  +----v---------+
           | React SPA    |  | FastAPI     |  | WebSocket    |
           | (Vite PWA)   |  | REST API   |  | /ws/alerts   |
           | :5173        |  | :8000      |  | :8000        |
           +--------------+  +------+------+  +----+---------+
                                    |              |
                   +----------------+--------+     |
                   |                |         |    |
           +-------v------+ +------v---+ +---v----v------+
           | Service Layer| | Celery   | | ConnectionMgr |
           | (business)   | | Worker   | | (in-memory)   |
           +--------------+ +----+-----+ +--------------+
                   |              |
           +-------v------+ +----v---------+
           | Repository   | | Redis        |
           | Layer        | | (broker +    |
           | (isolation)  | |  result +    |
           +-------+------+ |  WS pubsub) |
                   |         +--------------+
           +-------v---------------------+
           | PostgreSQL + PostGIS        |
           | (single DB, shared schema,  |
           |  row-level barangay filter) |
           +-----------------------------+
```

### Deployment Topology

Single-server Docker Compose deployment (capstone scope). Six containers:

| Container | Image | Purpose |
|-----------|-------|---------|
| `frontend` | Node/Vite (build) + nginx | Static SPA + PWA assets |
| `backend` | Python/FastAPI + Uvicorn | REST API + WebSocket endpoints |
| `celery_worker` | Same Python image | ML inference, nightly jobs, report generation |
| `celery_beat` | Same Python image | Periodic task scheduler |
| `postgres` | PostGIS-enabled PostgreSQL 16 | Primary data store with spatial extensions |
| `redis` | Redis 7 | Celery broker, result backend, WebSocket pubsub channel |

nginx sits in front, routing `/api/*` and `/ws/*` to the backend container, and everything else to the frontend static build.

---

## Component Boundaries

### Backend Layered Architecture

The system follows a strict four-layer pattern. Each layer has a single responsibility and communicates only with its adjacent layer.

```
Request
  |
  v
+--------------------------------------------------+
| ROUTER LAYER (routers/)                          |
| - Route definition and HTTP concerns             |
| - RBAC enforcement via require_role() dependency |
| - Request validation (Pydantic schemas auto)     |
| - Response serialization (Pydantic schemas)      |
| - NO business logic, NO database access          |
+--------------------------------------------------+
  |
  v
+--------------------------------------------------+
| SERVICE LAYER (services/)                        |
| - Business logic and orchestration               |
| - DOH formula calculations (FHSIS indicators)   |
| - Conflict resolution decisions                  |
| - Cross-repository coordination                  |
| - NO direct database access (uses repositories)  |
| - NO HTTP concerns (no Request/Response objects) |
+--------------------------------------------------+
  |
  v
+--------------------------------------------------+
| REPOSITORY LAYER (repositories/)                 |
| - Database queries only                          |
| - Barangay data isolation enforced HERE          |
| - Soft delete filtering (WHERE deleted_at IS     |
|   NULL) applied globally via ORM event hook      |
| - Returns ORM model instances (not dicts)        |
| - NO business logic                              |
+--------------------------------------------------+
  |
  v
+--------------------------------------------------+
| DATA LAYER (models/ + core/database.py)          |
| - SQLAlchemy ORM model definitions               |
| - AsyncSession lifecycle management              |
| - Alembic migration definitions                  |
| - TimestampMixin, SoftDeleteMixin definitions    |
+--------------------------------------------------+
```

**Why this matters:** The project has 7 clinical program modules (prenatal, EPI, nutrition, TB-DOTS, NCD, PIDSR, inventory) that each need router + service + repository files. Strict layering prevents the common capstone mistake of putting SQL queries in route handlers, which makes testing impossible and barangay isolation leaky.

### Dependency Injection Chain

FastAPI's `Depends()` system wires the layers together per-request:

```python
# core/dependencies.py
async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with async_session_factory() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise

async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db),
) -> User:
    # Decode JWT, load user from DB, return User model
    ...

def require_role(*roles: str):
    """Factory that returns a dependency checking user roles."""
    async def role_checker(
        current_user: User = Depends(get_current_user),
    ) -> User:
        if current_user.role not in roles:
            raise HTTPException(status_code=403)
        return current_user
    return role_checker

# routers/prenatal.py
@router.get("/enrollments")
async def list_enrollments(
    user: User = Depends(require_role("nurse", "midwife", "physician")),
    db: AsyncSession = Depends(get_db),
):
    repo = PrenatalRepository(db, user.health_station_id)
    service = PrenatalService(repo)
    return await service.list_enrollments()
```

**Key detail:** FastAPI caches dependency results within a single request. Both the role checker and the route handler receive the same `AsyncSession` instance and the same `User` instance. This means a single DB connection per request, which is correct.

### Barangay Data Isolation

Enforced at the repository layer only -- never at router or service layers. Every repository constructor receives `health_station_id` from the authenticated user, and every query includes this filter.

```python
# repositories/base.py
class BaseRepository:
    def __init__(self, session: AsyncSession, health_station_id: int | None):
        self.session = session
        self.health_station_id = health_station_id

    def _apply_isolation(self, stmt):
        """Add barangay filter. CHO-level roles (health_station_id=None) see all."""
        if self.health_station_id is not None:
            stmt = stmt.where(
                self.model.health_station_id == self.health_station_id
            )
        return stmt
```

**CHO-level roles** (city_health_officer, phis_coordinator, disease_surveillance_officer) have `health_station_id = NULL` and bypass the filter -- they see all 32 BHS data. BHS-level roles (nurse, midwife, bhw) are always scoped.

**Alternative considered -- PostgreSQL Row Level Security (RLS):** RLS would enforce isolation at the database level rather than application level. However, RLS requires either per-user database roles (complex for 7 app roles x 32 BHS) or session variable injection (`SET app.current_tenant`) on every connection. For a capstone with a single application database user, repository-level filtering is simpler, equally effective, and testable without database state. RLS is the correct choice at production scale; repository filtering is the correct choice here.

### Soft Delete Implementation

All clinical tables inherit `SoftDeleteMixin`. Deletion sets `deleted_at`; queries auto-filter via `do_orm_execute` event.

```python
# models/mixins.py
class SoftDeleteMixin:
    deleted_at: Mapped[datetime | None] = mapped_column(
        TIMESTAMPTZ, nullable=True, default=None, index=True
    )

    def soft_delete(self):
        self.deleted_at = func.now()

# core/database.py -- global query filter
@event.listens_for(AsyncSession, "do_orm_execute")
def _apply_soft_delete_filter(execute_state):
    if execute_state.is_select:
        execute_state.statement = execute_state.statement.options(
            with_loader_criteria(
                SoftDeleteMixin,
                lambda cls: cls.deleted_at.is_(None),
                include_aliases=True,
            )
        )
```

**Confidence:** HIGH -- this pattern is documented in SQLAlchemy 2.0 discussions and the `sqlalchemy-easy-softdelete` package uses the same `do_orm_execute` + `with_loader_criteria` approach.

---

## Data Flow: Five Major Pipelines

### Pipeline 1: Clinical Record Entry (BHS Tier)

Normal online flow for nurse/midwife at a health station.

```
Nurse browser
  |
  | POST /api/prenatal/enrollments  (Pydantic schema validates)
  v
Router (require_role("nurse","midwife"))
  |
  v
Service (calculate next_visit_date, validate business rules)
  |
  v
Repository (INSERT with health_station_id from user)
  |
  v
PostgreSQL (enrollment row created, status='ACTIVE')
  |
  v
Audit log INSERT (append-only, no PII -- table name + record ID + action + user_id + timestamp)
  |
  v
201 Created + Pydantic response schema
```

**Direction:** Unidirectional. Browser --> API --> DB. No background job needed.

**Build order dependency:** This pipeline is foundational. RBAC, session management, repository base class, and audit logging must exist before any clinical module is built.

### Pipeline 2: Offline BHW Field Entry + Sync

BHW uses phone browser in the field without connectivity.

```
BHW phone (offline)
  |
  | User creates patient visit / vaccination record
  v
React form --> Dexie.js (IndexedDB wrapper)
  |
  | Record saved locally with:
  |   - local_id: UUID (generated client-side)
  |   - status: 'PENDING'
  |   - created_at: client timestamp
  |   - synced: false
  v
IndexedDB (dexie 'sync_queue' table)
  |
  | <--- connectivity restored --->
  |
  | Service Worker 'sync' event fires (Chromium)
  | OR: app foreground online event listener (Safari/Firefox fallback)
  v
POST /api/sync/batch
  |
  | Request body: array of pending records (max batch size ~50)
  v
Router (require_role("bhw"))
  |
  v
SyncService:
  1. Dedup check: reject if (patient_id + record_type + date + bhw_id) exists
  2. For each record:
     a. If server has no matching local_id --> INSERT, status='PENDING_APPROVAL'
     b. If server has matching local_id with older updated_at --> UPDATE
     c. If server has matching local_id with newer updated_at:
        - Non-clinical fields: server wins (last-write-wins)
        - Clinical fields (vitals, diagnoses): --> nurse_review_queue
  3. Return per-record result: {local_id, server_id, status, conflict?}
  v
BHW phone marks synced records, removes from queue
  |
  v
Nurse dashboard shows "X records pending approval"
  |
  | Nurse reviews and approves/edits
  v
Record status changes from 'PENDING_APPROVAL' to 'APPROVED'
```

**Direction:** Bidirectional. Phone <--> API. Sync results flow back to phone.

**Critical fallback for Background Sync API:** As of March 2026, Background Sync is only supported in Chromium-based browsers. Safari and Firefox do not implement it. The fallback strategy:

1. **Primary (Chromium):** Register `sync` event in Service Worker. Fires automatically when connectivity returns, even if tab is closed.
2. **Fallback (Safari/Firefox):** Listen for `online` event on `window`. When app is foregrounded and online, trigger sync from the main thread. This requires the app to be open -- no background processing.
3. **Manual trigger:** Always provide a "Sync Now" button in the BHW interface as a safety net.

**Build order dependency:** Requires the clinical record pipeline (Pipeline 1) to be complete first. The offline layer is an additional transport mechanism for the same endpoints.

### Pipeline 3: Category I Disease Alert (Real-Time WebSocket)

When a notifiable disease case is entered, DSO and CHO must be alerted within 24 hours (RA 11332).

```
Nurse/DSO browser
  |
  | POST /api/disease-cases  (case_type='CATEGORY_I')
  v
Router (require_role("nurse","midwife","disease_surveillance_officer"))
  |
  v
DiseaseSurveillanceService:
  1. Validate case data
  2. Create disease_case record
  3. Create disease_alert record (unread for all DSO + CHO users)
  4. Publish to Redis channel: "disease_alerts"
  v
PostgreSQL (disease_case + disease_alert rows)
  |
  +-----> Redis PUBLISH "disease_alerts" {alert_id, disease, barangay, severity}
            |
            v
         WebSocket ConnectionManager (subscribed to Redis channel)
            |
            | For each connected DSO/CHO WebSocket:
            v
         ws.send_json({type: "CATEGORY_I_ALERT", ...})
            |
            v
         Browser shows toast notification + updates alert badge
```

**WebSocket Authentication:**

```
Browser connects: ws://host/ws/alerts?token=<JWT>

Backend WebSocket endpoint:
  1. Extract token from query param (WebSocket API does not support
     Authorization header in browser)
  2. Decode and validate JWT
  3. Reject with close(4001) if invalid
  4. Check role is DSO or CHO
  5. Add to ConnectionManager.active_connections[user_id]
```

**WebSocket ConnectionManager:**

```python
# websockets/alert_manager.py
class AlertConnectionManager:
    def __init__(self):
        # Map of user_id -> set of WebSocket connections
        # (user may have multiple tabs)
        self.connections: dict[int, set[WebSocket]] = defaultdict(set)

    async def connect(self, user_id: int, websocket: WebSocket):
        await websocket.accept()
        self.connections[user_id].add(websocket)

    async def disconnect(self, user_id: int, websocket: WebSocket):
        self.connections[user_id].discard(websocket)

    async def broadcast_to_roles(self, alert: dict, target_user_ids: list[int]):
        for user_id in target_user_ids:
            for ws in self.connections.get(user_id, set()):
                try:
                    await ws.send_json(alert)
                except WebSocketDisconnect:
                    self.connections[user_id].discard(ws)
```

**Why Redis pubsub even for single-server:** If the Celery worker needs to trigger an alert (e.g., ML model detects outbreak pattern from nightly run), it cannot access the FastAPI process's in-memory ConnectionManager. Redis pubsub bridges the process boundary. The FastAPI process subscribes to the Redis channel and relays to WebSocket connections.

**Offline DSO handling:** If DSO is not connected when alert fires, the `disease_alerts` table persists the unread alert. On next login, the frontend fetches `GET /api/disease-alerts?unread=true` and displays them. WebSocket is an optimization for real-time push, not the source of truth.

**Direction:** Unidirectional push after bidirectional REST trigger. REST write --> DB + Redis --> WebSocket push.

**Build order dependency:** Requires disease case model, basic REST endpoint, and WebSocket infrastructure. Can be built after the core clinical pipeline.

### Pipeline 4: FHSIS Auto-Report Generation

Monthly/quarterly/annual reports generated from live data using DOH DM 2024-0007 formulas.

```
PHIS Coordinator browser
  |
  | GET /api/fhsis/m1?period=2026-02&barangay=all
  v
Router (require_role("phis_coordinator"))
  |
  v
FHSISService:
  1. For each M1 indicator (e.g., "Pregnant women with 4+ prenatal visits"):
     a. Call relevant repository method (PrenatalRepository.count_completed_visits)
     b. Apply DOH formula to raw counts
     c. Return indicator value + numerator + denominator
  2. Aggregate across barangays if requested
  v
Multiple repositories (prenatal, epi, nutrition, tb, ncd, disease_surveillance)
  |
  v
PostgreSQL (read-only queries with date range + barangay filters)
  |
  v
Pydantic response: {indicators: [{code, name, numerator, denominator, value}]}
  |
  v
Frontend renders report table with per-indicator verification checkboxes
  |
  | PHIS Coordinator checks each indicator
  | POST /api/fhsis/m1/verify  (indicator_codes + period)
  v
FHSISService marks indicators as verified
  |
  v
POST /api/fhsis/m1/export?format=pdf
  |
  v
Celery task (CPU-bound PDF generation with ReportLab or WeasyPrint)
  |
  v
Return file download URL or stream
```

**Direction:** Read-heavy. Browser --> API --> multiple repositories --> aggregation --> response. Export is async via Celery.

**Build order dependency:** This pipeline is the LAST to build. It depends on every clinical module having correct data entry. It is essentially a cross-cutting read layer over all other modules.

### Pipeline 5: ML Inference + GIS Spatial Analytics

```
A. Nightly Celery Beat Job (Outbreak Forecasting)
----------------------------------------------
Celery Beat (crontab 2:00 AM)
  |
  v
tasks/ml_training.py: train_outbreak_forecast
  |
  | For each (disease, barangay) pair with sufficient history:
  v
  1. Query disease_cases grouped by week (Repository)
  2. Fit Prophet model (CPU-bound, runs in Celery worker process)
  3. Generate 4-week forecast
  4. Store in ml_disease_forecasts table:
     {disease, barangay_id, forecast_date, predicted_count,
      lower_bound, upper_bound, confidence_label}
  5. If predicted_count exceeds threshold --> create disease_alert
     --> Redis PUBLISH (triggers WebSocket Pipeline 3)

B. On-Demand Risk Classification
----------------------------------------------
POST /api/ml/patient-risk  (or triggered on clinical record save)
  |
  v
Router --> Service --> run_in_threadpool(sklearn_classifier.predict)
  |
  | (run_in_threadpool moves CPU work off the async event loop)
  v
Return risk score + contributing factors
  |
  v
Flag stored on patient record (e.g., prenatal_enrollment.risk_level)

C. GIS Choropleth + Heatmap
----------------------------------------------
GET /api/gis/disease-map?disease=dengue&period=2026-02
  |
  v
Router (require_role("disease_surveillance_officer","city_health_officer"))
  |
  v
GISService --> GISRepository:
  1. Spatial JOIN: health_stations (with PostGIS geometry) <--> disease_cases
  2. Aggregate case counts per barangay polygon
  3. Return GeoJSON FeatureCollection via ST_AsGeoJSON()
  v
PostgreSQL + PostGIS:
  SELECT json_build_object(
    'type', 'FeatureCollection',
    'features', json_agg(ST_AsGeoJSON(t.*)::json)
  )
  FROM (
    SELECT hs.name, hs.geom, COUNT(dc.id) as case_count
    FROM health_stations hs
    LEFT JOIN disease_cases dc ON dc.health_station_id = hs.id
      AND dc.reported_date BETWEEN :start AND :end
      AND dc.disease = :disease
      AND dc.deleted_at IS NULL
    GROUP BY hs.id
  ) t
  |
  v
GeoJSON response --> MapLibre GL JS renders choropleth

D. DBSCAN Spatial Clustering
----------------------------------------------
GET /api/gis/clusters?disease=dengue&period=2026-02
  |
  v
GISRepository: fetch case coordinates (ST_X, ST_Y from point geometry)
  |
  v
Service --> run_in_threadpool(dbscan_clustering):
  - scikit-learn DBSCAN(eps=0.005, min_samples=3)  # ~500m radius
  - Input: numpy array of (lat, lng) from case addresses
  - Output: cluster labels per case
  |
  v
Return GeoJSON with cluster_id as feature property
  |
  v
MapLibre renders cluster polygons (convex hull of cluster points)
```

**Direction:** ML pipeline is write-heavy (nightly batch to forecast table). GIS pipeline is read-heavy (spatial queries on demand). Both can trigger alerts (write to disease_alerts).

**Build order dependency:** GIS requires PostGIS geometry data in health_stations table (seeded from CHO 2 shapefiles). ML requires sufficient historical data or synthetic seed data. Both depend on disease surveillance module being functional.

---

## Patterns to Follow

### Pattern 1: Async Session Lifecycle with FastAPI Depends

**What:** Single async session per request, auto-commit on success, auto-rollback on failure.

**When:** Every database-touching endpoint.

```python
# core/database.py
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession

engine = create_async_engine(
    settings.DATABASE_URL,  # postgresql+asyncpg://...
    pool_size=20,
    max_overflow=10,
    pool_pre_ping=True,
)

async_session_factory = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,  # Critical: prevents lazy load after commit
)

# core/dependencies.py
async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with async_session_factory() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
```

**Why `expire_on_commit=False`:** After committing, SQLAlchemy 2.0 by default expires all loaded attributes, forcing a new DB query on next access. In async context with FastAPI, the session may be closed by the time Pydantic serializes the response. `expire_on_commit=False` keeps attributes in memory after commit, allowing Pydantic to serialize the response without triggering lazy loads (which would fail in async context).

### Pattern 2: Repository Base Class with Barangay Isolation

**What:** Every repository inherits a base that auto-applies barangay filter and soft-delete filter.

**When:** Every data access operation.

```python
# repositories/base.py
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

class BaseRepository[T]:
    model: type[T]

    def __init__(self, session: AsyncSession, health_station_id: int | None = None):
        self.session = session
        self.health_station_id = health_station_id

    def _base_query(self):
        stmt = select(self.model)
        if self.health_station_id is not None:
            stmt = stmt.where(
                self.model.health_station_id == self.health_station_id
            )
        return stmt

    async def get_by_id(self, id: int) -> T | None:
        stmt = self._base_query().where(self.model.id == id)
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def list_all(self, offset: int = 0, limit: int = 50) -> list[T]:
        stmt = self._base_query().offset(offset).limit(limit)
        result = await self.session.execute(stmt)
        return list(result.scalars().all())
```

### Pattern 3: Celery Task with Shared SQLAlchemy Models

**What:** Celery workers run in a separate process and need their own sync (not async) database sessions for CPU-bound work.

**When:** ML training, report generation, nightly batch jobs.

```python
# tasks/ml_training.py
from celery import shared_task
from sqlalchemy import create_engine
from sqlalchemy.orm import Session

sync_engine = create_engine(settings.DATABASE_URL.replace("+asyncpg", ""))

@shared_task(bind=True, max_retries=3)
def train_outbreak_forecast(self, disease: str, barangay_id: int):
    with Session(sync_engine) as session:
        # Query historical data
        cases = session.execute(
            select(DiseaseCase)
            .where(DiseaseCase.disease == disease)
            .where(DiseaseCase.health_station_id == barangay_id)
        ).scalars().all()

        # Fit Prophet model (CPU-bound)
        df = pd.DataFrame([...])
        model = Prophet()
        model.fit(df)
        forecast = model.predict(future_df)

        # Store results
        for row in forecast.itertuples():
            session.add(MLDiseaseForecast(...))
        session.commit()
```

**Why sync engine in Celery:** Celery workers use prefork (multiprocessing) by default. asyncpg and the async event loop do not work correctly inside forked worker processes. Use a standard psycopg2 sync engine for Celery tasks.

### Pattern 4: Audit Log as Append-Only Table

**What:** Every CUD (create, update, delete) operation on clinical tables logs to `audit_logs`. No PII in the log.

**When:** Every write operation on clinical data.

```python
# models/audit.py
class AuditLog(Base):
    __tablename__ = "audit_logs"
    id: Mapped[int] = mapped_column(primary_key=True)
    table_name: Mapped[str]
    record_id: Mapped[int]
    action: Mapped[str]  # CREATE, UPDATE, SOFT_DELETE
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    changed_fields: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    # changed_fields stores field NAMES only, not values (no PII)
    timestamp: Mapped[datetime] = mapped_column(TIMESTAMPTZ, server_default=func.now())
```

**Implementation via SQLAlchemy event listeners** on `after_insert`, `after_update`, and the soft-delete method. Alternatively, use a service-layer decorator that wraps repository calls.

### Pattern 5: PostGIS Geometry Column with GeoAlchemy2

**What:** Store barangay boundary polygons and health station point locations using PostGIS geometry types.

**When:** health_stations table, barangay_boundaries table.

```python
# models/health_station.py
from geoalchemy2 import Geometry

class HealthStation(Base, TimestampMixin):
    __tablename__ = "health_stations"
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str]
    barangay_code: Mapped[str] = mapped_column(String(9))  # PSGC code
    address: Mapped[str | None]
    location: Mapped[str] = mapped_column(
        Geometry(geometry_type="POINT", srid=4326)  # WGS84
    )

class BarangayBoundary(Base):
    __tablename__ = "barangay_boundaries"
    id: Mapped[int] = mapped_column(primary_key=True)
    barangay_code: Mapped[str] = mapped_column(String(9), unique=True)
    name: Mapped[str]
    geom: Mapped[str] = mapped_column(
        Geometry(geometry_type="MULTIPOLYGON", srid=4326)
    )
```

**Alembic integration:** GeoAlchemy2 provides `alembic_helpers` that must be registered in `env.py` to handle spatial column creation/deletion and to ignore PostGIS internal tables (`spatial_ref_sys`, `geometry_columns`) during autogenerate.

---

## Anti-Patterns to Avoid

### Anti-Pattern 1: Lazy Loading in Async Context

**What:** Accessing a relationship attribute on an ORM model that was not eagerly loaded, triggering an implicit SQL query.

**Why bad:** In async SQLAlchemy, lazy loading raises `MissingGreenlet` error because the implicit query cannot run outside the async context. Even if it could, it would be an N+1 query problem.

**Instead:** Always use `selectinload()`, `joinedload()`, or `subqueryload()` explicitly in repository queries. Set `lazy="raise"` on relationship definitions as a safety net:

```python
# models/patient.py
class Patient(Base):
    prenatal_enrollments: Mapped[list["PrenatalEnrollment"]] = relationship(
        back_populates="patient",
        lazy="raise",  # Explodes if accessed without eager load
    )
```

### Anti-Pattern 2: Blocking the Event Loop with ML Inference

**What:** Calling `model.predict()` or `model.fit()` directly in an async endpoint handler.

**Why bad:** Prophet and scikit-learn are CPU-bound. A 2-second Prophet forecast blocks ALL other async requests for those 2 seconds.

**Instead:**
- Quick inference (< 200ms, like a single scikit-learn `predict`): use `await run_in_threadpool(model.predict, data)`
- Long inference (> 200ms, like Prophet `fit`): use a Celery task and return a task ID for polling or WebSocket notification on completion.

### Anti-Pattern 3: Passing ORM Models Directly to HTTP Response

**What:** Returning SQLAlchemy model instances from route handlers without Pydantic schema validation.

**Why bad:** Leaks internal fields (deleted_at, internal IDs), can trigger lazy loading, and bypasses response validation.

**Instead:** Every route handler returns a Pydantic `response_model`. The service layer or router converts ORM instances to Pydantic schemas.

### Anti-Pattern 4: Scattering Barangay Isolation Checks

**What:** Adding `WHERE health_station_id = X` in service layer methods or router handlers.

**Why bad:** One missed check = data leak across barangays. Impossible to audit.

**Instead:** Isolation is enforced once in `BaseRepository._base_query()`. Service and router layers never reference `health_station_id` in query logic.

### Anti-Pattern 5: Using Service Worker Background Sync as the Only Sync Mechanism

**What:** Relying exclusively on the Background Sync API for offline data sync.

**Why bad:** Safari and Firefox do not support Background Sync as of March 2026. BHWs may use any phone browser.

**Instead:** Implement a three-tier fallback (see Pipeline 2 above): Background Sync event -> online event listener -> manual Sync Now button. Always provide the manual fallback.

### Anti-Pattern 6: WebSocket as Source of Truth for Alerts

**What:** Only sending alerts via WebSocket without persisting them.

**Why bad:** If DSO is offline when alert fires, they never see it. WebSocket is ephemeral.

**Instead:** Always persist alerts in `disease_alerts` table with `read_at` timestamp. WebSocket is a delivery optimization. On login/reconnect, frontend fetches unread alerts from REST API.

---

## Scalability Considerations

| Concern | At 32 BHS (current) | At 100 BHS | At 500+ BHS |
|---------|---------------------|------------|-------------|
| **Database connections** | Pool of 20 is sufficient | Increase pool, add PgBouncer | Connection pooler mandatory |
| **Barangay isolation** | Repository-level filter | Repository-level filter still works | Migrate to PostgreSQL RLS for defense-in-depth |
| **WebSocket connections** | In-memory ConnectionManager, ~10-20 concurrent | Still fine in-memory | Redis pubsub + multiple backend instances |
| **ML training** | Single Celery worker | 2-3 workers, prioritize queues | Dedicated ML worker pool, model versioning |
| **Offline sync batch size** | 50 records per POST | 50 records per POST | Rate limiting, queue-based ingestion |
| **PostGIS queries** | Spatial indexes sufficient | Add materialized views for common aggregations | Pre-computed choropleth cache in Redis |
| **FHSIS report generation** | On-demand per request | Cache with Redis (TTL = until new data) | Pre-compute nightly via Celery |

**For capstone scope (32 BHS):** Single-server Docker Compose, pool_size=20, in-memory WebSocket manager, single Celery worker, direct PostGIS queries. No premature optimization needed.

---

## Suggested Build Order

The build order is driven by dependency chains and risk. Foundational components must exist before any clinical module, and high-risk components should be tackled early to surface problems.

### Phase 1: Foundation (Weeks 1-3)

Build order within phase:

1. **Docker Compose environment** -- PostgreSQL + PostGIS + Redis containers
2. **SQLAlchemy async engine + session management** -- `core/database.py`, `get_db` dependency
3. **Base models** -- `TimestampMixin`, `SoftDeleteMixin`, `User` model, `AuditLog` model
4. **Alembic setup** -- with GeoAlchemy2 helpers in `env.py`
5. **Auth system** -- JWT creation/validation, `get_current_user` dependency
6. **RBAC** -- `require_role()` factory, role enum
7. **BaseRepository** -- with barangay isolation and soft-delete filtering
8. **User management** -- CRUD for system_admin to create/manage users
9. **Health station + barangay boundary seed data** -- PostGIS geometry seeded

**Risk in this phase:** Async SQLAlchemy 2.0 session lifecycle is the highest-risk technical area. Getting `expire_on_commit`, session scoping, and the `get_db` dependency wrong causes subtle bugs in every subsequent module. Invest time in integration tests for the session lifecycle.

### Phase 2: Core Clinical (Weeks 4-7)

Build order driven by data dependencies:

1. **Patient ITR** -- foundational entity; all program modules FK to `patients`
2. **Prenatal module** -- most complex visit scheduling logic; proves the service/repository pattern
3. **EPI module** -- dose sequence enforcement, FIC computation; proves the pattern with different business rules
4. **Nutrition module** -- WHO Z-score calculation; first ML integration point (severe wasting trigger)
5. **TB-DOTS module** -- daily visit recording, sputum schedule tracking
6. **NCD module** -- PhilPEN risk stratification

**Why prenatal first among clinical modules:** It has the most complex scheduling rules (auto-calculated next_visit_date, continuous overdue detection) and will stress-test the service layer pattern. If the pattern works for prenatal, it works for everything.

### Phase 3: Surveillance + Real-Time (Weeks 8-10)

1. **Disease case entry** -- Category I and II case models, basic CRUD
2. **WebSocket infrastructure** -- ConnectionManager, Redis pubsub subscriber, JWT auth on WS
3. **Category I alert pipeline** -- disease_case save triggers alert + WebSocket broadcast
4. **PIDSR validation workflow** -- validated_at tracking, compliance metrics
5. **Category II batch export** -- weekly PDF/Excel generation via Celery task

**Risk in this phase:** WebSocket + Redis pubsub integration. Test with multiple concurrent browser sessions. Handle reconnection gracefully (client-side exponential backoff + unread alert fetch on reconnect).

### Phase 4: GIS + ML (Weeks 10-13)

1. **GIS choropleth endpoint** -- spatial JOIN query, ST_AsGeoJSON response, MapLibre integration
2. **GIS heatmap endpoint** -- purok-level point density
3. **DBSCAN clustering** -- scikit-learn in `run_in_threadpool`
4. **Prophet forecasting Celery task** -- nightly training, forecast storage
5. **Patient risk classifier** -- scikit-learn model, `run_in_threadpool` for on-demand inference
6. **Barangay risk index** -- nightly composite score via Celery Beat

**Risk in this phase:** ML training data availability. Synthetic data generation must be in place (as noted in PROJECT.md constraints). Prophet can fail silently with insufficient data; add explicit validation of minimum data points before training.

### Phase 5: Reporting + Offline + Polish (Weeks 13-16)

1. **FHSIS M1/M2 report endpoints** -- read from all clinical modules, apply DOH formulas
2. **FHSIS Q1/A1 report endpoints** -- quarterly and annual aggregation
3. **PHIS Coordinator verification workflow** -- per-indicator checkbox, export unlock
4. **PDF/Excel export** -- Celery tasks for report generation
5. **Offline PWA infrastructure** -- Service Worker registration, IndexedDB schema (Dexie.js), cache strategy
6. **Sync batch endpoint** -- POST /api/sync/batch with conflict resolution
7. **BHW mobile-first UI** -- offline-capable forms, sync status indicator
8. **Nurse review queue** -- for clinical conflicts from BHW sync
9. **Inventory stub** -- item catalog, stock levels, low-stock alerts

**Why offline is late in the build:** Offline sync is a transport layer over existing endpoints. The endpoints must be stable before adding the offline transport. Changing an endpoint schema after BHWs have cached data locally causes version mismatches.

---

## Hard Technical Risks

### Risk 1: AsyncSession Lifecycle Bugs (HIGH)

**What:** Subtle bugs from incorrect async session handling: `MissingGreenlet` errors, stale data from expired attributes, or connection pool exhaustion from leaked sessions.

**Mitigation:**
- Set `expire_on_commit=False` on session factory
- Always use `async with` for session lifecycle
- Set `pool_pre_ping=True` to handle dropped connections
- Write integration tests that exercise the full router --> service --> repository --> DB chain
- Never pass `AsyncSession` across task boundaries (Celery gets its own sync session)

### Risk 2: Background Sync Browser Compatibility (HIGH)

**What:** BHWs on Safari or Firefox phones cannot use Background Sync API. Data entered offline may be stuck until they manually open the app while connected.

**Mitigation:**
- Implement the three-tier fallback strategy
- Test on actual BHW phones (likely Android + Chrome, but cannot assume)
- Clear UI indicator showing "X records waiting to sync" and "Last synced: [time]"
- Consider `navigator.connection` API for network quality detection

### Risk 3: PostGIS + Alembic Autogenerate Conflicts (MEDIUM)

**What:** Alembic autogenerate does not natively understand PostGIS spatial columns and may generate spurious migration diffs or fail to create spatial indexes.

**Mitigation:**
- Register GeoAlchemy2's `alembic_helpers` (include_object, writer, render_item) in `env.py`
- Always review autogenerated migrations before applying
- Seed barangay boundary geometry data via a separate data migration, not in the model migration

### Risk 4: Prophet Training Failures on Sparse Data (MEDIUM)

**What:** Prophet requires a minimum of ~2 observation periods to fit. With a new system, historical data may be insufficient.

**Mitigation:**
- Validate minimum data points (at least 2 full periods) before attempting to fit
- Generate synthetic historical data from CHO 2's paper records (as noted in project constraints)
- Label all synthetic-trained forecasts with `confidence_label = 'SYNTHETIC'`
- Gracefully degrade: if Prophet cannot fit, return null forecast with an explanation, not a 500 error

### Risk 5: Conflict Resolution Edge Cases in Offline Sync (MEDIUM)

**What:** Complex scenarios: BHW edits a record offline, nurse also edits it online, BHW syncs later. Or two BHWs edit the same patient record offline and sync at different times.

**Mitigation:**
- Non-clinical fields (address, contact): last-write-wins based on `updated_at` (simple, acceptable for non-clinical data)
- Clinical fields (vitals, diagnoses, visit records): route to `nurse_review_queue` table with both versions side-by-side
- Dedup rule is strict: exact match on `patient_id + record_type + date + bhw_id` is rejected as duplicate
- Include `local_id UUID` on all syncable records for idempotency
- Test with specific scenarios: same record edited by BHW offline + nurse online; two BHWs edit same patient; BHW submits, goes offline, nurse edits, BHW edits again offline then syncs

### Risk 6: WebSocket Connection Stability (LOW-MEDIUM)

**What:** WebSocket connections drop silently on mobile networks, behind proxies, or when nginx times out idle connections.

**Mitigation:**
- Client-side heartbeat ping every 30 seconds to detect dead connections
- nginx `proxy_read_timeout` set to 60 seconds minimum for WebSocket upgrade
- Client-side reconnection with exponential backoff (1s, 2s, 4s, 8s, max 30s)
- On reconnect, fetch unread alerts from REST API before subscribing to live stream
- Server-side: periodically prune dead connections from ConnectionManager

---

## Database Schema Organization

### Table Grouping

```
FOUNDATION:
  users, health_stations, barangay_boundaries, audit_logs

PATIENT CORE:
  patients (GIN index on name for city-wide search)

MATERNAL CARE:
  prenatal_enrollments, prenatal_visits,
  postpartum_enrollments, postpartum_visits

CHILD HEALTH:
  epi_enrollments, epi_vaccinations,
  nutrition_enrollments, nutrition_visits

TB:
  tb_cases, tb_dots_visits, tb_sputum_exams, tb_contacts

NCD:
  ncd_enrollments, ncd_visits

SURVEILLANCE:
  disease_cases, disease_alerts

INVENTORY:
  items, stock_levels, stock_transactions

ML:
  ml_disease_forecasts, ml_patient_risk_scores

FHSIS:
  fhsis_report_periods, fhsis_indicator_verifications

SYNC:
  sync_queue (server-side log of sync operations)
  nurse_review_queue (clinical conflicts pending review)
```

### Key Foreign Key Chains

```
users.health_station_id --> health_stations.id
patients.health_station_id --> health_stations.id
prenatal_enrollments.patient_id --> patients.id
prenatal_enrollments.health_station_id --> health_stations.id
prenatal_visits.enrollment_id --> prenatal_enrollments.id
disease_cases.health_station_id --> health_stations.id
disease_alerts.disease_case_id --> disease_cases.id
disease_alerts.user_id --> users.id  (target recipient)
```

Every clinical table carries `health_station_id` for barangay isolation. This denormalization (could be derived via patient) is intentional -- it makes repository-level filtering a simple WHERE clause without JOINs.

---

## Frontend Architecture

### State Management Strategy

No global state management library (Redux, Zustand) needed. Use:

- **React Query (TanStack Query)** for server state: API data fetching, caching, refetching, pagination. This is the primary state management tool.
- **React Context** for auth state (current user, JWT token) and WebSocket connection state.
- **Dexie.js (IndexedDB)** for offline state in BHW mobile view only.
- **URL state** for filters, pagination, and selected barangay (shareable/bookmarkable).

### Feature Module Structure

Each clinical domain is a self-contained feature folder:

```
frontend/src/features/prenatal/
  api.ts          -- TanStack Query hooks: useEnrollments(), useCreateVisit(), etc.
  types.ts        -- TypeScript types matching backend Pydantic schemas
  components/     -- PrenatalTable, VisitForm, OverdueList, etc.
  hooks/          -- usePrenatalStats(), useOverdueDetection()
```

### Offline Architecture (BHW View Only)

```
frontend/src/
  features/bhw/
    db.ts              -- Dexie.js schema definition (sync_queue table)
    hooks/
      useOfflineForm.ts  -- Saves to IndexedDB, queues for sync
      useSyncStatus.ts   -- Tracks pending count, last sync time
    components/
      SyncIndicator.tsx  -- Shows pending/synced/error state
      SyncButton.tsx     -- Manual sync trigger

  service-worker/
    sw.ts              -- Service Worker registration + sync event handler
    sync-handler.ts    -- Reads from Dexie, POSTs to /api/sync/batch
    cache-strategy.ts  -- Cache-first for static assets, network-first for API
```

**Important constraint:** The Service Worker and Dexie.js sync logic is ONLY used in BHW mobile flows. Nurses, DSOs, and CHO staff use standard online React Query flows. Do not mix offline and online patterns in the same components.

---

## Sources

### FastAPI Layered Architecture
- [Layered Architecture & Dependency Injection in FastAPI](https://dev.to/markoulis/layered-architecture-dependency-injection-a-recipe-for-clean-and-testable-fastapi-code-3ioo) -- MEDIUM confidence
- [FastAPI Best Practices (zhanymkanov)](https://github.com/zhanymkanov/fastapi-best-practices) -- HIGH confidence
- [Patterns and Practices for SQLAlchemy 2.0 with FastAPI](https://chaoticengineer.hashnode.dev/fastapi-sqlalchemy) -- MEDIUM confidence
- [FastAPI + SQLAlchemy 2.0: Modern Async Database Patterns](https://dev-faizan.medium.com/fastapi-sqlalchemy-2-0-modern-async-database-patterns-7879d39b6843) -- MEDIUM confidence
- [FastAPI Best Practices: Production-Ready Patterns for 2025](https://orchestrator.dev/blog/2025-1-30-fastapi-production-patterns/) -- MEDIUM confidence

### Offline PWA / Background Sync
- [Offline-first frontend apps in 2025 (LogRocket)](https://blog.logrocket.com/offline-first-frontend-apps-2025-indexeddb-sqlite/) -- MEDIUM confidence
- [Background Sync API (Can I Use)](https://caniuse.com/background-sync) -- HIGH confidence (browser compat data)
- [Safari PWA Limitations on iOS (2026)](https://docs.bswen.com/blog/2026-03-12-safari-pwa-limitations-ios/) -- MEDIUM confidence
- [Offline and background operation (MDN)](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Offline_and_background_operation) -- HIGH confidence
- [Build Offline-First PWA with React, Dexie.js & Workbox](https://www.wellally.tech/blog/build-offline-pwa-react-dexie-workbox) -- MEDIUM confidence
- [Dexie.js Synchronization Patterns](https://app.studyraid.com/en/read/11356/355148/synchronization-patterns) -- LOW confidence

### WebSocket Patterns
- [FastAPI WebSocket Beginner's Guide (2026)](https://blog.greeden.me/en/2026/01/13/fastapi-x-websocket-beginners-guide-implementation-patterns-for-real-time-communication-chat-and-dashboards/) -- MEDIUM confidence
- [WebSocket/SSE Notifications with FastAPI: Connection Management, Rooms, Reconnection](https://blog.greeden.me/en/2025/10/28/weaponizing-real-time-websocket-sse-notifications-with-fastapi-connection-management-rooms-reconnection-scale-out-and-observability/) -- MEDIUM confidence
- [FastAPI WebSockets (Official Docs)](https://fastapi.tiangolo.com/advanced/websockets/) -- HIGH confidence
- [Broadcasting WebSocket Messages Across Workers](https://medium.com/@philipokiokio/broadcasting-websockets-messages-across-instances-and-workers-with-fastapi-9a66d42cb30a) -- MEDIUM confidence

### Celery + ML
- [Deploying ML Models with FastAPI and Celery (TDS)](https://towardsdatascience.com/deploying-ml-models-in-production-with-fastapi-and-celery-7063e539a5db/) -- MEDIUM confidence
- [Asynchronous Tasks with FastAPI and Celery (TestDriven.io)](https://testdriven.io/blog/fastapi-and-celery/) -- HIGH confidence
- [Celery in 2025: Bullet-Proof Background Jobs](https://medium.com/@theNewGenCoder/celery-in-2025-bullet-proof-background-jobs-with-fastapi-redis-retries-scheduling-91b8bb5f7257) -- MEDIUM confidence
- [Celery + Redis + FastAPI 2025 Production Guide](https://medium.com/@dewasheesh.rana/celery-redis-fastapi-the-ultimate-2025-production-guide-broker-vs-backend-explained-5b84ef508fa7) -- MEDIUM confidence

### PostGIS / GeoAlchemy2
- [GeoAlchemy2 Documentation](https://geoalchemy-2.readthedocs.io/) -- HIGH confidence
- [Working with Spatial Data using FastAPI and GeoAlchemy](https://medium.com/@notarious2/working-with-spatial-data-using-fastapi-and-geoalchemy-797d414d2fe7) -- MEDIUM confidence
- [GeoAlchemy2 Alembic Integration](https://geoalchemy-2.readthedocs.io/en/latest/alembic.html) -- HIGH confidence
- [PostGIS ST_AsGeoJSON Documentation](https://postgis.net/docs/ST_AsGeoJSON.html) -- HIGH confidence
- [PostGIS 3: ST_AsGeoJSON(record)](https://www.crunchydata.com/blog/postgis-3-geojson-st-asgeojson) -- HIGH confidence

### Multi-Tenant Isolation
- [Tenant Isolation with Postgres Row Level Security and SQLAlchemy](https://personal-web-9c834.web.app/blog/pg-tenant-isolation/) -- MEDIUM confidence
- [Multi-tenant Data Isolation with PostgreSQL RLS (AWS)](https://aws.amazon.com/blogs/database/multi-tenant-data-isolation-with-postgresql-row-level-security/) -- HIGH confidence
- [Row Level Security for Tenants in Postgres (Crunchy Data)](https://www.crunchydata.com/blog/row-level-security-for-tenants-in-postgres) -- HIGH confidence

### Soft Delete
- [sqlalchemy-easy-softdelete (GitHub)](https://github.com/flipbit03/sqlalchemy-easy-softdelete) -- HIGH confidence
- [SQLAlchemy Discussion: Best practice for soft-delete with asyncio](https://github.com/sqlalchemy/sqlalchemy/issues/7973) -- HIGH confidence

### RBAC
- [Role-Based Access Control in FastAPI (app-generator)](https://app-generator.dev/docs/technologies/fastapi/rbac.html) -- MEDIUM confidence
- [FastAPI RBAC Full Implementation (Permit.io)](https://www.permit.io/blog/fastapi-rbac-full-implementation-tutorial) -- MEDIUM confidence
