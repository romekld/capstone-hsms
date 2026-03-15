# Pitfalls Research

**Domain:** Philippine DOH-aligned Health Station Management System (FastAPI + SQLAlchemy 2.0 async + PostGIS + IndexedDB/PWA + Celery + Prophet + WebSocket + multi-barangay RBAC)
**Researched:** 2026-03-15
**Confidence:** HIGH (stack-specific pitfalls verified across official docs, GitHub issues, and multiple community sources)

---

## Critical Pitfalls

These cause rewrites, data breaches, or weeks of debugging if not addressed from day one.

### Pitfall 1: SQLAlchemy 2.0 Async — MissingGreenlet / Lazy Loading Crash

**What goes wrong:**
Any access to an unloaded relationship attribute in async SQLAlchemy raises `MissingGreenlet` (or `DetachedInstanceError` after session close). This is not a bug — async SQLAlchemy fundamentally cannot do implicit lazy loading because it would need to issue a synchronous SQL call inside an async context. Migrating to 100% async ORM is equivalent to annotating every relationship with `lazy="raise"`. A single `patient.enrollments` access on an eagerly-unloaded relationship crashes the request.

**Why it happens:**
Developers coming from sync SQLAlchemy expect `relationship()` attributes to "just work." In async mode, the ORM cannot transparently emit SQL when you traverse a relationship — there is no greenlet to yield from. This bites hardest when Pydantic response models try to serialize nested objects after the session is closed, or when service-layer code accesses a relationship that was not eagerly loaded in the repository query.

**How to avoid:**
1. Declare ALL relationships with `lazy="raise"` as the default. This makes forgotten eager loads fail loudly at dev time instead of silently in production.
2. In every repository query that returns data for serialization, explicitly use `selectinload()` (one-to-many) or `joinedload()` (many-to-one) for every relationship the Pydantic schema needs.
3. Create a project convention: repository methods return fully-loaded models; service layer and routers never touch the session directly.
4. Write a test helper that attempts to serialize every Pydantic response schema from a model object — catches missing eager loads in CI.

**Warning signs:**
- `MissingGreenlet` exceptions in test output
- `DetachedInstanceError` when Pydantic validates response models
- Endpoints that work with flat models but break when nested schemas are added
- Intermittent errors that appear only when response_model validation runs in a separate thread

**Phase to address:** Phase 1 (Foundation). Set `lazy="raise"` on the base model mixin before writing a single relationship. Establish the eager-loading convention in the first repository.

---

### Pitfall 2: AsyncSession Deadlock via FastAPI Dependency Injection

**What goes wrong:**
When `get_db()` is a synchronous generator (`def get_db(): yield session`) and the endpoint has a `response_model`, FastAPI runs the endpoint in a threadpool. The response model validation also runs in a threadpool worker. Under moderate concurrency, all threadpool workers block waiting for DB connections, while the `finally` block of the generator (which releases the connection) cannot run because no threadpool worker is free. The entire application deadlocks.

**Why it happens:**
FastAPI runs `def` (non-async) endpoints and dependencies in `anyio` threadpool workers (default size: 40). If the connection pool is smaller than the threadpool and response_model validation contends for workers, a circular wait emerges: workers hold connections waiting for response validation threads, while response validation threads wait for free workers to release connections.

**How to avoid:**
1. Make the session dependency `async def get_db()` (async generator), not `def get_db()`. This runs on the event loop, not in a threadpool worker.
2. Use `async_sessionmaker` with `expire_on_commit=False` so that attributes are still accessible after commit (for response serialization).
3. Set the SQLAlchemy `pool_size` to match expected concurrent requests, with `max_overflow` as headroom.
4. Never use `scoped_session` in async FastAPI — pass `AsyncSession` explicitly through the dependency chain.

**Warning signs:**
- App freezes under load testing (5+ concurrent requests) with no error logs
- Database connection pool exhaustion warnings
- Requests that hang indefinitely on endpoints with `response_model` but work fine without it

**Phase to address:** Phase 1 (Foundation). The `get_db` dependency is literally the first infrastructure code written. Get it right before any endpoint exists.

---

### Pitfall 3: Soft-Delete WHERE Clause Omission — Data Leakage of "Deleted" Patient Records

**What goes wrong:**
A developer writes a query, forgets `WHERE deleted_at IS NULL`, and the endpoint returns soft-deleted patient records. In a health information system under RA 10173, this is a data privacy violation. The danger compounds: joins between tables where only one side is filtered, aggregate counts that include deleted records, and relationship loads that traverse into deleted children.

**Why it happens:**
Soft deletes are invisible — unlike a hard-deleted row that raises a 404, a soft-deleted row is still there and "works." Manual WHERE clauses are fragile: every new query, every new join, every ORM relationship traversal is a potential omission. Without a global filter, the system has N potential leak points where N is the number of queries.

**How to avoid:**
1. Use SQLAlchemy's `do_orm_execute` event hook with `with_loader_criteria()` to inject `WHERE deleted_at IS NULL` on every SELECT automatically. This covers relationship loads and lazy loads (if any) as well.
2. Use the `sqlalchemy-easy-softdelete` library (or a similar pattern) that hooks into the ORM execution pipeline — not a manual mixin that developers must remember to call.
3. Provide an explicit opt-out: `execution_options(include_deleted=True)` for admin audit queries that need to see deleted records.
4. Override the `delete()` method on the base model to set `deleted_at = now()` instead of emitting a SQL DELETE. This prevents accidental hard deletes.
5. Write a CI check: any raw `session.execute(text(...))` call must be reviewed because raw SQL bypasses ORM hooks.

**Warning signs:**
- Record counts differ between direct SQL and ORM queries (deleted records leaking)
- "Ghost" patients appearing in search results after being "deleted"
- Aggregate reports (FHSIS M1/M2) with inflated numbers
- Any query using `select()` without going through the repository layer

**Phase to address:** Phase 1 (Foundation). The `SoftDeleteMixin` + `do_orm_execute` hook must be established before the first clinical table migration. Retroactive application is error-prone.

---

### Pitfall 4: Barangay Data Isolation Bypass — Cross-BHS Patient Record Leakage

**What goes wrong:**
A nurse at BHS-A queries patients and sees records from BHS-B because the `health_station_id` filter was not applied. In a 32-BHS system serving 164,691 people, this is both a privacy violation and a clinical safety risk (wrong patient context). The failure mode is silent — the query succeeds, just with too many results.

**Why it happens:**
Barangay isolation is enforced at the repository layer per the architecture. But every new repository method, every new join, every aggregation query is a potential omission. The filter depends on extracting the current user's `health_station_id` from the JWT — if the dependency chain is broken or the filter is applied to the wrong table in a join, isolation fails. CHO-level roles (city_health_officer, phis_coordinator, DSO) legitimately see all barangays, adding conditional logic that can mask bugs.

**How to avoid:**
1. Create a `BaseRepository` class that automatically applies `health_station_id = current_user.health_station_id` to every query unless the user has a CHO-level role. Every domain repository inherits from this.
2. Never allow endpoint code or service code to construct queries directly — all data access goes through repositories.
3. Write integration tests with two BHS users: assert that BHS-A nurse never sees BHS-B patient records across every endpoint.
4. For CHO-level roles, add explicit tests that verify cross-barangay access works — don't just skip the filter, verify the filter logic handles both cases.
5. Consider PostgreSQL Row-Level Security (RLS) as a defense-in-depth layer, though application-level filtering remains primary for the 4-month timeline.

**Warning signs:**
- A nurse sees patient counts higher than their BHS population
- Cross-barangay records appearing in BHS-level dashboards
- Any repository method that takes raw `health_station_id` parameter instead of deriving it from the authenticated user
- Test suite that only tests with a single BHS user

**Phase to address:** Phase 1 (Foundation). The `BaseRepository` pattern must exist before any clinical data repository. Phase 2 integration tests should cover cross-BHS isolation for every endpoint.

---

### Pitfall 5: IndexedDB + Background Sync — Chromium-Only API with No Safari/Firefox Support

**What goes wrong:**
The Background Sync API (`SyncManager.register()`) is only supported in Chromium-based browsers (Chrome 49+, Edge 79+). Firefox does not support it on any version. Safari does not support it on any version. If BHWs use non-Chrome mobile browsers (common in the Philippines with budget Android phones running alternative browsers, or any iPhone), offline data sits in IndexedDB with no automatic sync mechanism. Data is silently lost or stuck.

**Why it happens:**
The Background Sync spec has been in Chromium for years, giving a false sense of widespread support. Developers build the sync pipeline assuming `navigator.serviceWorker.ready.then(reg => reg.sync.register('sync-queue'))` works everywhere. It does not.

**How to avoid:**
1. Implement Background Sync as a progressive enhancement, not a hard dependency.
2. Build a fallback sync mechanism: on `visibilitychange` (tab becomes visible), `online` event, and periodic `setInterval` (every 30-60 seconds when online), attempt to flush the IndexedDB sync queue. This works in all browsers.
3. Add a visible sync status indicator in the BHW UI: "X records pending sync" with a manual "Sync Now" button.
4. On app startup (when service worker activates), always attempt a sync flush — this covers the case where background sync never fired.
5. Test the entire offline flow in Safari/Firefox, not just Chrome DevTools.

**Warning signs:**
- Sync queue grows on non-Chrome browsers but never drains
- BHW records that are "submitted" but never appear in the server database
- Test suite only runs in Chrome/Chromium
- No manual sync trigger in the UI

**Phase to address:** Phase 3 (Offline/PWA). This is the single most important decision in the offline module. The fallback must be designed before any sync code is written.

---

### Pitfall 6: IndexedDB Data Eviction on Mobile Safari

**What goes wrong:**
Safari (iOS and iPadOS 13.4+) enforces a 7-day cap on all script-writable storage including IndexedDB. If the user does not visit the site for 7 days, Safari evicts ALL IndexedDB data. For a BHW who does field visits weekly or less frequently, this means unsynced patient records are permanently destroyed. This eviction policy does NOT apply to installed PWAs added to the home screen — but only if the user actually installs it.

**Why it happens:**
Apple's Intelligent Tracking Prevention (ITP) treats non-installed web apps as potential trackers and aggressively evicts their storage. This is a deliberate design choice, not a bug. The only exception is for PWAs added to the home screen, which get promoted to "persistent" storage.

**How to avoid:**
1. Make PWA installation mandatory for BHW users — the onboarding flow must guide them through "Add to Home Screen." Not optional, not a suggestion.
2. Call `navigator.storage.persist()` at PWA startup to request persistent storage (Chrome honors this for installed PWAs; Safari behavior varies).
3. Show a prominent warning if the app detects it is running in a regular browser tab (not installed): "Install this app to prevent data loss."
4. Implement a sync-on-every-visit pattern: whenever the app opens and is online, immediately flush the sync queue. Do not rely on the user remembering to sync.
5. Set maximum offline record age: if a record has been in IndexedDB for more than 3 days without syncing, surface an urgent warning.

**Warning signs:**
- BHW reports "my records disappeared"
- IndexedDB storage is empty on return visits in Safari
- No PWA install prompt or guidance in onboarding
- App works in browser tab during development, breaks in field deployment

**Phase to address:** Phase 3 (Offline/PWA). PWA manifest and install flow must be production-quality, not an afterthought.

---

### Pitfall 7: JWT WebSocket Auth — Token Expires Mid-Connection, No Refresh Mechanism

**What goes wrong:**
A DSO or CHO officer opens the disease surveillance dashboard, establishing a WebSocket connection authenticated via JWT query parameter. The JWT expires (e.g., after 30 minutes), but the WebSocket connection remains open. The server continues sending Category I disease alerts to what is now an unauthenticated session. Alternatively, the server rejects the connection on the next message, silently disconnecting without any client-side indication — the user thinks they are receiving alerts but are not.

**Why it happens:**
WebSocket connections are long-lived but JWT tokens are short-lived. Unlike HTTP requests where every request carries a fresh token (or triggers a refresh), WebSocket connections are authenticated only at handshake time. There is no standard mechanism to "re-authenticate" a live WebSocket. The JWT in the query parameter is validated once at connection time and never again.

**How to avoid:**
1. Implement server-side periodic token validation: on a timer (e.g., every 5 minutes), the server checks the JWT expiry of each active connection. If expired, send a `{"type": "auth_required"}` message and start a grace period (30 seconds).
2. Client-side: on receiving `auth_required`, fetch a new access token via the refresh token flow, then send `{"type": "auth_refresh", "token": "new_jwt"}` over the WebSocket.
3. If the client does not re-authenticate within the grace period, close the connection with code 4001 (custom close code for auth expiry).
4. Client-side: on close code 4001, automatically re-establish the connection with a fresh token.
5. Set WebSocket JWT expiry longer than REST JWT (e.g., 2 hours vs 30 minutes) to reduce re-auth frequency, but still enforce it.

**Warning signs:**
- Disease alerts stop appearing on the DSO dashboard after a period of time
- WebSocket connections in server memory that belong to users who logged out hours ago
- No re-authentication protocol in the WebSocket message schema
- Server logs showing expired JWT errors on WebSocket handlers

**Phase to address:** Phase 2 (Disease Surveillance / WebSocket alerting). Must be designed into the WebSocket protocol from the start — retrofitting re-auth is painful.

---

### Pitfall 8: FastAPI WebSocket Connection Leak on Disconnect

**What goes wrong:**
When a client disconnects (network drop, tab close, phone sleep), the server does not always receive a clean close frame. The WebSocket handler may be blocked on `await websocket.receive_text()` or an async task, and `WebSocketDisconnect` is not raised until the next I/O operation. Meanwhile, the connection object remains in the active connections set, and any background tasks (`asyncio.create_task`) spawned for that connection continue running indefinitely. Over hours/days, this leaks memory and file descriptors.

**Why it happens:**
FastAPI/Starlette does not automatically manage WebSocket disconnections. The `websocket.client_state` may report `CONNECTED` even after the client has dropped. Disconnect detection only happens on the next read/write attempt. If the server is in a `while True` loop waiting on a database or Redis pubsub channel, it may never attempt a WebSocket read, and thus never detect the disconnect.

**How to avoid:**
1. Build a `ConnectionManager` class that tracks all active WebSocket connections in a dict keyed by `user_id`.
2. Use `asyncio.wait()` with a timeout on the receive operation — poll for disconnects every 30 seconds even if no messages are expected from the client.
3. Implement server-side WebSocket ping/pong: send a ping frame every 30 seconds. If pong is not received within 10 seconds, consider the connection dead and clean up.
4. Wrap every WebSocket handler in a `try/except WebSocketDisconnect/Exception` block with a `finally` clause that removes the connection from the manager and cancels all related tasks.
5. Cancel all `asyncio.Task` objects associated with a connection in the cleanup handler. Use `task.cancel()` and `await asyncio.gather(*tasks, return_exceptions=True)`.

**Warning signs:**
- Memory usage of the backend process grows steadily over time
- `ConnectionManager.active_connections` count only grows, never shrinks
- Background tasks for disconnected users consuming CPU/DB resources
- Open file descriptor count increasing without bound

**Phase to address:** Phase 2 (Disease Surveillance). The `ConnectionManager` pattern must be built correctly from the first WebSocket endpoint.

---

### Pitfall 9: Prophet Forecasting — Cold Start with Sparse Barangay-Level Disease Data

**What goes wrong:**
Prophet requires sufficient historical data to estimate trend and seasonality components. For per-barangay, per-disease forecasting, many combinations will have fewer than 2 data points per year (or zero). Prophet raises "Dataframe has less than 2 non-NaN rows" or produces wildly unreliable forecasts with confidence intervals wider than the prediction range. With 32 barangays and ~20 disease types, approximately 80-90% of (barangay, disease) combinations will have insufficient data for meaningful forecasts.

**Why it happens:**
The project design calls for Prophet forecasts "per Category II disease per barangay." Most barangays in a city of 164,691 people will see only a handful of cases of any specific disease per year. Prophet needs at least 1-2 full seasonal cycles (1-2 years of weekly/monthly data) to estimate seasonality, and at least a few dozen data points to estimate trend. Paper-based historical data may not even be available digitally.

**How to avoid:**
1. Implement a minimum data threshold before attempting Prophet: at minimum 24 monthly observations (2 years) or 52 weekly observations (1 year). Below this, return "insufficient data" instead of a forecast.
2. Aggregate data hierarchically: if per-barangay data is too sparse, fall back to city-wide forecasts per disease, or regional aggregates per barangay.
3. When using synthetic data to bootstrap models (as the project plans), clearly label all outputs with the `SYNTHETIC` confidence tag. Never present synthetic-trained forecasts as real predictions to clinicians.
4. Disable yearly seasonality for series shorter than 2 years (`yearly_seasonality=False`). Disable weekly seasonality for series with gaps longer than 2 weeks.
5. Build the ML pipeline to gracefully degrade: no forecast is better than a bad forecast in a clinical context.

**Warning signs:**
- Prophet fit errors in Celery task logs
- Forecasts with confidence intervals spanning 0 to infinity
- Negative case count predictions (Prophet can predict below zero unless `floor` is set)
- All 32 barangays showing identical forecast curves (sign of insufficient per-barangay variation)

**Phase to address:** Phase 4 (ML/Analytics). But the data collection pipeline and aggregation strategy must be designed in Phase 1-2 to ensure data accumulates in the right format.

---

### Pitfall 10: Celery Beat Duplicate Task Execution

**What goes wrong:**
The nightly Celery Beat job that computes barangay risk indices runs multiple times. If the Docker setup runs multiple containers each with their own Beat scheduler (e.g., scaling the worker service), each Beat instance independently triggers the same scheduled task. The barangay risk index computation runs 3x, wasting resources and potentially producing inconsistent results if the computation is not idempotent.

**Why it happens:**
Celery Beat is designed to run as a single instance. It does not coordinate with other Beat instances. In Docker Compose, if the Celery worker service is scaled (`docker-compose up --scale celery_worker=3`), and the Beat scheduler is embedded in the worker, you get 3 Beat schedulers. Celery has no built-in distributed locking for Beat.

**How to avoid:**
1. Run Celery Beat as a separate, single-instance service in docker-compose (`celery_beat` service), not embedded in the worker process.
2. Make all scheduled tasks idempotent: if the risk index computation runs twice, the result is the same. Use database upserts (`INSERT ... ON CONFLICT DO UPDATE`) not inserts.
3. Add a distributed lock (Redis SETNX with TTL) at the start of each scheduled task — if the lock exists, skip execution.
4. Monitor Beat execution: log task start/complete with timestamps. Alert if a scheduled-once-daily task appears more than once in a 24-hour window.
5. Use UTC for all scheduling. The Philippines is UTC+8; timezone mismatches between Beat, the broker, and the database can cause tasks to fire at wrong times or double-fire during DST transitions (though the Philippines does not observe DST, UTC consistency is still best practice).

**Warning signs:**
- Duplicate entries in `ml_disease_forecasts` table with same date but different computed values
- Celery logs showing the same periodic task starting multiple times within seconds
- Database CPU spikes at the scheduled time proportional to the number of worker containers
- Beat schedule file (`celerybeat-schedule`) appearing in multiple containers

**Phase to address:** Phase 1 (Infrastructure) for docker-compose service definition. Phase 4 (ML) for idempotent task design.

---

### Pitfall 11: PostGIS SRID Mismatch — Queries Return Zero Results or Wrong Distances

**What goes wrong:**
Geometry data is stored with SRID 4326 (WGS84 lat/lon) but spatial queries use a projected SRID, or vice versa. `ST_DWithin` called with a distance in meters on SRID 4326 data interprets the distance as degrees (1 degree ~ 111km), returning either nothing (too small) or everything (too large). Choropleth joins between barangay boundary polygons and disease case points silently fail if the SRIDs do not match.

**Why it happens:**
GeoAlchemy2 defaults to `srid=-1` if not explicitly set. PostGIS does not error on SRID mismatches in many operations — it silently computes wrong results. Developers may import barangay boundary shapefiles in one SRID and store case locations in another. The GeoJSON specification (RFC 7946) requires SRID 4326, but internal computations may need a projected CRS for accurate distance calculations.

**How to avoid:**
1. Standardize on SRID 4326 for ALL geometry storage. This is required for GeoJSON output (RFC 7946) and matches the project's `ST_AsGeoJSON()` convention.
2. For distance calculations (e.g., DBSCAN clustering), use `geography` type instead of `geometry` type — PostGIS geography automatically computes in meters on the WGS84 spheroid. Alternatively, use `ST_DWithin(geog, geog, distance_in_meters)`.
3. Validate SRID on all geometry inputs: any INSERT or UPDATE with spatial data must pass through `ST_SetSRID(ST_GeomFromGeoJSON(input), 4326)` or equivalent.
4. In GeoAlchemy2 column definitions, always explicitly set `srid=4326`: `Column(Geometry('POINT', srid=4326))`. Never rely on the default.
5. When importing barangay boundary shapefiles, use `ogr2ogr -t_srs EPSG:4326` to ensure all boundaries are in WGS84 before import.

**Warning signs:**
- Spatial queries returning empty results when you know matching data exists
- DBSCAN clustering producing one giant cluster or zero clusters
- Distance values that are wildly off (kilometers when expecting meters, or vice versa)
- `ST_AsGeoJSON()` output with coordinates that do not look like lat/lon (values > 180)

**Phase to address:** Phase 1 (Foundation) for column definitions. Phase 3 (GIS) for query patterns and boundary imports.

---

### Pitfall 12: PostGIS Spatial Index Not Used — Full Table Scans on Spatial Queries

**What goes wrong:**
Spatial queries take seconds instead of milliseconds because the GiST spatial index is not being used. With 164,691 patients and potentially millions of visit records with location data, this makes the GIS dashboard unusable.

**Why it happens:**
Several common causes prevent spatial index usage:
- Using `ST_Distance(a, b) < threshold` instead of `ST_DWithin(a, b, threshold)` — the former cannot use an index.
- Casting geometry types inline: `ST_Intersects(geom::geometry, ...)` forces a type cast that bypasses the index.
- SRID mismatch between the query geometry and the indexed column.
- Small tables where the query planner decides a sequential scan is faster (not a real problem, but confusing during development).
- Missing `CREATE INDEX ... USING GIST(geom)` — GeoAlchemy2 creates spatial indexes by default, but custom columns or raw SQL tables may lack them.

**How to avoid:**
1. Always use `ST_DWithin()` for proximity queries, never `ST_Distance() < N`.
2. Always use `ST_Intersects()` for containment queries — it uses the index. Verify with `EXPLAIN ANALYZE`.
3. Ensure GeoAlchemy2 `spatial_index=True` (the default) on all geometry columns.
4. Run `EXPLAIN ANALYZE` on every spatial query during development. If you see "Seq Scan" on a large table, investigate.
5. For the DBSCAN clustering pipeline, pre-filter data by bounding box before passing to scikit-learn — do not load all 164K+ patient locations into Python memory.

**Warning signs:**
- GIS dashboard loading times > 2 seconds for choropleth rendering
- `EXPLAIN ANALYZE` showing "Seq Scan" on geometry columns
- Python memory usage spiking during DBSCAN clustering
- Map tile requests timing out

**Phase to address:** Phase 3 (GIS). But spatial column definitions with proper indexes must be correct from Phase 1.

---

## Technical Debt Patterns

Shortcuts that seem reasonable but create long-term problems.

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Skip `lazy="raise"` on relationships, rely on default lazy loading behavior | Faster initial model definitions | Every new query is a potential `MissingGreenlet` crash; inconsistent eager loading patterns accumulate | Never in async SQLAlchemy |
| Store vitals as JSONB instead of discrete columns (`consultations.vitals`) | Faster migration, flexible schema | No type safety, no indexing on individual vitals, FHSIS formula computation requires JSON parsing on every row | Acceptable for Phase 1 MVP if migrated to columns before FHSIS report generation |
| Use `text()` raw SQL for complex queries instead of ORM | Faster to write complex aggregations | Bypasses soft-delete hooks, bypasses barangay isolation, no type checking | Acceptable if wrapped in a repository method that manually adds both filters, with code review |
| Embed Celery Beat in the worker container | Simpler docker-compose config | Duplicate task execution when scaling workers | Never — always run Beat as a separate service |
| Use `response_model` on WebSocket endpoints | Automatic validation | WebSocket responses are not HTTP responses; this pattern does not apply and causes confusion | Never for WebSocket endpoints |
| Test only with Chrome for offline/PWA features | Faster test cycles | Safari and Firefox failures discovered in the field by BHWs | Never — test at minimum Chrome + one non-Chromium browser |
| Use Prophet defaults without disabling unused seasonality | Quick ML pipeline setup | Spurious seasonality detected in sparse data produces misleading forecasts | Never for sparse health data — always configure seasonality explicitly |

## Integration Gotchas

Common mistakes when connecting system components.

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| FastAPI + Celery | Passing SQLAlchemy model objects to Celery tasks (not JSON-serializable) | Pass only primitive IDs; let the Celery task create its own session and query the object |
| FastAPI + Celery | Using `async def` for Celery tasks (Celery is synchronous) | Define Celery tasks as regular `def` functions. Use `asyncio.run()` inside if async DB calls are needed, but prefer sync SQLAlchemy sessions in tasks |
| Celery + Redis result backend | Storing large ML model outputs in Redis results (memory exhaustion) | Write ML results to PostgreSQL (`ml_disease_forecasts` table); store only a status/ID in the Celery result |
| Pydantic v2 + GeoJSON | Returning raw WKB/WKT from PostGIS instead of parsed GeoJSON | Apply `ST_AsGeoJSON()` in the SQL query, parse the JSON string in the repository, return a Pydantic GeoJSON model |
| IndexedDB + FastAPI sync | Sending the entire IndexedDB store on every sync | Send only records with `status = 'PENDING'`; mark as `'SYNCED'` after server confirms |
| MapLibre GL JS + PostGIS | Fetching individual features via REST instead of vector tiles or bulk GeoJSON | For choropleth: single API call returning GeoJSON FeatureCollection. For heatmap: pre-aggregated purok-level data. Avoid N+1 API calls per feature |
| Service Worker + JWT | Caching API responses that contain patient data | Never cache clinical data in the Service Worker Cache API. Only cache static assets (JS, CSS, icons). Clinical data goes in IndexedDB with encryption |

## Performance Traps

Patterns that work at small scale but fail as the system grows.

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| N+1 queries on patient list with enrollments | Patient search takes 5+ seconds | Use `selectinload` for all enrollment relationships in list queries | > 100 patients in a single query |
| Loading all barangay boundary polygons as individual REST calls | GIS map takes 10+ seconds to render | Single `/api/gis/boundaries` endpoint returning FeatureCollection, cached in Redis for 24h | > 5 barangays (always, with 32 BHS) |
| DBSCAN on all patient locations without spatial pre-filter | Celery task OOM or 10+ minute runtime | Filter to bounding box of interest + time range before passing to scikit-learn | > 10,000 patient records |
| Prophet fitting per-barangay per-disease without parallelism | Nightly job takes 4+ hours | Use Celery group() to parallelize across workers; skip combinations with insufficient data | > 50 (barangay, disease) combinations |
| Sync queue accumulating thousands of records during extended offline | Sync request payload too large, timeout on reconnect | Batch sync in chunks of 50-100 records; send multiple smaller requests | > 200 records accumulated offline |
| Unbounded `audit_logs` table growth | Query performance degrades on audit queries | Partition by month (`audit_logs_2026_03`); archive old partitions | > 1M audit log rows (reached within months at 32 BHS) |

## Security Mistakes

Domain-specific security issues beyond general web security.

| Mistake | Risk | Prevention |
|---------|------|------------|
| Barangay filter applied in service layer instead of repository layer | Developer forgets to apply filter in one service method; data leaks across BHS | Enforce in `BaseRepository`; service layer never constructs queries |
| JWT token in WebSocket URL visible in server access logs | PII-adjacent credential exposure in nginx/reverse proxy logs | Configure nginx to not log query parameters on WebSocket upgrade paths; use short-lived tokens (5-minute expiry for handshake) |
| Patient data cached in Service Worker Cache API | Anyone with device access can read clinical records from browser cache | Only cache static assets in SW cache; clinical data goes in IndexedDB (which at least requires JS execution to read) |
| PII in Celery task arguments (patient name, birthdate) | PII appears in Redis broker, Flower monitoring dashboard, Celery logs | Pass only `patient_id` to tasks; let the task look up PII from the database |
| Soft delete `do_orm_execute` hook bypassed by raw SQL `text()` queries | Deleted patient records returned by raw SQL aggregation queries | Audit all `text()` usage; prefer ORM constructs; if raw SQL is necessary, add `AND deleted_at IS NULL` explicitly |
| system_admin role accessing clinical endpoints | Violates role separation; system_admin should have zero clinical data access | `require_role()` should explicitly exclude `system_admin` from clinical endpoints, not just include allowed roles |
| BHW offline records not encrypted in IndexedDB | Physical device theft exposes patient records | Encrypt sensitive fields (name, birthdate, diagnosis) before IndexedDB storage using a key derived from user credentials |

## UX Pitfalls

Common user experience mistakes in this health information system domain.

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| No visible sync status indicator | BHW submits records offline, assumes they are synced; records never reach server | Persistent badge: "3 records pending sync" with manual sync button and last-synced timestamp |
| Overdue detection only shown in list views | Nurse misses overdue prenatal visit because she is on the dashboard, not the patient list | Dashboard cards: "12 overdue prenatal visits" with direct link to filtered list |
| Form validation on submit only | BHW fills 20 fields, hits submit, gets error on field 3; has to scroll back and re-enter | Inline validation on blur; disable submit until form is valid; highlight first error |
| Medical forms designed for desktop | BHW wearing gloves in the field cannot tap small form controls on a 5-inch phone screen | Minimum touch target 48px; large radio buttons; avoid dropdowns where toggle buttons work; single-column layout |
| Confirmation dialogs for every action | "Are you sure?" fatigue — users click through without reading | Reserve confirmation for destructive/irreversible actions only (soft delete, final report submission). Use undo patterns for reversible actions |
| Date picker requiring manual date entry | BHW enters birthdate wrong, patient age computed incorrectly, WHO Z-scores wrong | Date picker with year/month scroll, max date = today, age displayed in real-time as validation |

## "Looks Done But Isn't" Checklist

Things that appear complete but are missing critical pieces.

- [ ] **Patient search:** Often missing GIN index on `(last_name, first_name, birthdate)` — test with 10,000+ patients to verify sub-second response
- [ ] **Soft delete:** Working for single-table queries but omitted in JOIN queries or relationship traversals — test by soft-deleting a patient and verifying they vanish from ALL views (enrollments, visit lists, FHSIS counts, GIS map)
- [ ] **Barangay isolation:** Working for direct queries but forgotten in aggregate/dashboard queries — test by logging in as BHS-A nurse and verifying dashboard counts match only BHS-A data
- [ ] **RBAC:** Endpoint returns 403 for wrong role, but the underlying query still executes and logs show data was fetched — ensure `require_role()` short-circuits BEFORE any database call
- [ ] **Offline sync:** Records sync successfully but `local_id` deduplication is not enforced — test by triggering sync twice rapidly and verifying no duplicate records in the server database
- [ ] **WebSocket alerts:** Alert is sent, but only to users who connected AFTER the deployment — test by keeping a connection open across server restart and verifying it reconnects
- [ ] **FHSIS auto-report:** Counts match for the current month but are wrong for historical months because the query uses current record state (including edits) instead of point-in-time snapshots — verify against CHO 2 manual tallies
- [ ] **Prophet forecast:** Model fits without error but predictions are negative (impossible for case counts) — verify `floor=0` is set on all Prophet models
- [ ] **GIS choropleth:** Map renders but uses outdated barangay boundaries because the GeoJSON was cached and the boundary data was updated — verify cache invalidation on boundary data changes
- [ ] **Audit log:** Entries are created for INSERT/UPDATE but not for soft DELETE — verify that setting `deleted_at` triggers an audit entry

## Recovery Strategies

When pitfalls occur despite prevention, how to recover.

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| MissingGreenlet crashes in production | LOW | Add `selectinload()` to the offending query; no data loss, just add the missing eager load |
| Session deadlock under load | MEDIUM | Change `get_db` to async generator; may require touching every endpoint that uses it if originally sync |
| Soft-delete filter missing on queries | HIGH | Audit every query in the codebase; add `do_orm_execute` hook; re-verify all FHSIS counts (may have been wrong for the period the filter was missing) |
| Barangay isolation bypass discovered | HIGH | Immediate security incident; audit logs to determine exposure scope; re-verify all affected records; may need CHO notification per RA 10173 |
| Background Sync fails on non-Chrome | MEDIUM | Implement fallback sync (visibility change + online event + manual button); requires PWA code changes but no server changes |
| IndexedDB evicted on Safari | HIGH | Data is lost permanently; no recovery possible for unsynced records. Prevention is the only option. Implement mandatory PWA install flow |
| JWT WebSocket token expiry unhandled | LOW | Add re-auth protocol to WebSocket handler; existing connections will need to reconnect but no data loss |
| WebSocket connection leak | LOW | Deploy ConnectionManager with proper cleanup; existing leaked connections will be cleaned up on next server restart |
| Prophet producing nonsensical forecasts | LOW | Add minimum-data threshold and floor=0; retrain models with corrected parameters; mark old forecasts as invalidated |
| Celery Beat duplicate execution | MEDIUM | Move Beat to separate service; make tasks idempotent; deduplicate any corrupted data from the duplicate runs |
| SRID mismatch in spatial data | HIGH | Requires `ST_Transform()` migration on all existing geometry data; all queries must be re-validated; any distances computed with wrong SRID produced wrong results |
| Spatial index not used | LOW | Add index if missing; rewrite query to use index-aware function (ST_DWithin); run EXPLAIN ANALYZE to verify |

## Pitfall-to-Phase Mapping

How roadmap phases should address these pitfalls.

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| MissingGreenlet / lazy load crash | Phase 1: Foundation | All relationships have `lazy="raise"`; integration tests serialize all response schemas |
| AsyncSession deadlock | Phase 1: Foundation | `get_db` is an async generator; load test with 50 concurrent requests passes |
| Soft-delete WHERE omission | Phase 1: Foundation | `do_orm_execute` hook active; test: soft-delete a patient, verify absent from all queries |
| Barangay isolation bypass | Phase 1: Foundation | `BaseRepository` enforces filter; integration test with 2 BHS users covers all endpoints |
| Background Sync browser support | Phase 3: Offline/PWA | Offline sync tested in Chrome AND Firefox (or Safari); fallback mechanism works without Background Sync API |
| IndexedDB eviction on Safari | Phase 3: Offline/PWA | PWA install flow mandatory; `navigator.storage.persist()` called; no-install warning displayed |
| JWT WebSocket token expiry | Phase 2: Disease Surveillance | Re-auth protocol documented and tested; connection survives token expiry gracefully |
| WebSocket connection leak | Phase 2: Disease Surveillance | ConnectionManager tracks connections; memory usage stable over 24-hour test |
| Prophet cold start | Phase 4: ML/Analytics | Minimum data threshold enforced; `floor=0` set; graceful "insufficient data" response |
| Celery Beat duplicate tasks | Phase 1: Infrastructure | Beat runs as separate docker-compose service; tasks are idempotent |
| PostGIS SRID mismatch | Phase 1: Foundation (column defs), Phase 3: GIS (queries) | All geometry columns explicitly `srid=4326`; `EXPLAIN ANALYZE` on all spatial queries shows correct SRID |
| Spatial index not used | Phase 3: GIS | `EXPLAIN ANALYZE` on all spatial queries shows "Index Scan" |

## Sources

### SQLAlchemy 2.0 Async
- [SQLAlchemy 2.0 asyncio documentation](https://docs.sqlalchemy.org/en/20/orm/extensions/asyncio.html) -- official docs on MissingGreenlet, lazy="raise", eager loading in async
- [FastAPI discussion #13125: MissingGreenlet exception](https://github.com/fastapi/fastapi/discussions/13125) -- community report of async lazy load crash
- [FastAPI discussion #6628: Dependency injection deadlock](https://github.com/fastapi/fastapi/discussions/6628) -- confirmed deadlock with sync get_db + response_model
- [FastAPI issue #3205: Session dependency deadlock](https://github.com/fastapi/fastapi/issues/3205) -- detailed analysis of threadpool exhaustion

### Soft Delete
- [sqlalchemy-easy-softdelete (PyPI)](https://pypi.org/project/sqlalchemy-easy-softdelete/) -- automatic WHERE clause injection via do_orm_execute
- [SQLAlchemy discussion #10517: Soft deletable tables](https://github.com/sqlalchemy/sqlalchemy/discussions/10517) -- official patterns for soft delete with relationships
- [SQLAlchemy issue #7955: Duplicate with_loader_criteria](https://github.com/sqlalchemy/sqlalchemy/issues/7955) -- known bug with filter duplication

### PostGIS / GeoAlchemy2
- [PostGIS ST_AsGeoJSON documentation](https://postgis.net/docs/ST_AsGeoJSON.html) -- RFC 7946 compliance, SRID requirements
- [PostGIS spatial queries chapter](https://postgis.net/docs/using_postgis_query.html) -- index usage with ST_DWithin vs ST_Distance
- [Paul Ramsey: Spatial Indexes and Bad Queries](http://blog.cleverelephant.ca/2021/05/indexes-and-queries.html) -- why spatial indexes get bypassed
- [GeoAlchemy2 types documentation](https://geoalchemy-2.readthedocs.io/en/latest/types.html) -- SRID and spatial_index configuration

### IndexedDB / Service Worker / PWA
- [MDN: Background Synchronization API](https://developer.mozilla.org/en-US/docs/Web/API/Background_Synchronization_API) -- browser support status
- [Can I Use: Background Sync](https://caniuse.com/background-sync) -- Chrome-only support confirmed
- [MDN: Storage quotas and eviction criteria](https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria) -- Safari 7-day eviction policy
- [Safari PWA Limitations on iOS (BSWEN, March 2026)](https://docs.bswen.com/blog/2026-03-12-safari-pwa-limitations-ios/) -- current iOS PWA storage limitations
- [Offline sync and conflict resolution patterns (Sachith Dassanayake, Feb 2026)](https://www.sachith.co.uk/offline-sync-conflict-resolution-patterns-architecture-trade%E2%80%91offs-practical-guide-feb-19-2026/) -- practical sync architecture guidance

### Celery + Redis
- [Celery Beat duplicate task issue #4041](https://github.com/celery/celery/issues/4041) -- confirmed duplicate execution with multiple Beat instances
- [Distributed Scheduling Gone Wrong: The Celery Beat Trap](https://medium.com/@sudarshaana/distributed-scheduling-gone-wrong-the-celery-beat-trap-and-how-we-escaped-85c7e53828f6) -- production post-mortem on Beat duplication
- [Celery periodic tasks documentation](https://docs.celeryq.dev/en/latest/userguide/periodic-tasks.html) -- timezone handling, Beat best practices

### Prophet
- [Prophet GitHub issue #1432: Sparse data](https://github.com/facebook/prophet/issues/1432) -- sparse data challenges documented
- [Prophet GitHub issue #855: Minimum observations](https://github.com/facebook/prophet/issues/855) -- minimum data requirements discussion
- [Prophet diagnostics documentation](https://facebook.github.io/prophet/docs/diagnostics.html) -- minimum initial period requirements

### WebSocket Auth / Connection Management
- [VideoSDK: WebSocket Authentication 2025](https://www.videosdk.live/developer-hub/websocket/websocket-authentication) -- JWT WebSocket security patterns
- [FastAPI discussion #9031: WebSocket disconnect propagation](https://github.com/fastapi/fastapi/discussions/9031) -- disconnect detection limitations
- [FastAPI issue #3934: WebSocketDisconnect not caught](https://github.com/fastapi/fastapi/issues/3934) -- background task leak on disconnect
- [Handling WebSocket Disconnections in FastAPI (HexShift)](https://hexshift.medium.com/handling-websocket-disconnections-gracefully-in-fastapi-9f0a1de365da) -- ConnectionManager pattern

### Multi-Tenant / RBAC Data Isolation
- [Multi-Tenant Leakage: When Row-Level Security Fails (Jan 2026)](https://medium.com/@instatunnel/multi-tenant-leakage-when-row-level-security-fails-in-saas-da25f40c788c) -- WHERE clause omission as primary leakage vector
- [AWS: Multi-tenant data isolation with PostgreSQL RLS](https://aws.amazon.com/blogs/database/multi-tenant-data-isolation-with-postgresql-row-level-security/) -- defense-in-depth patterns

---
*Pitfalls research for: Project LINK (HSMS) — Philippine DOH-aligned Health Station Management System*
*Researched: 2026-03-15*
