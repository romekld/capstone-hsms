# Project Research Summary

**Project:** Project LINK (Local Information Network for Kalusugan) -- HSMS
**Domain:** Philippine Barangay Health Station Management System (primary care HMIS with offline-first field entry, real-time disease alerts, spatial analytics, ML forecasting)
**Researched:** 2026-03-15
**Confidence:** HIGH

## Executive Summary

Project LINK is a two-tier health information system serving 32 Barangay Health Stations under City Health Office II (Dasmarinas City, 164,691 population). Experts build this class of system using a layered async backend (FastAPI + SQLAlchemy 2.0 + PostGIS) with strict repository-level data isolation per barangay, a React PWA frontend with IndexedDB for offline BHW field entry, Celery for CPU-bound ML training and report generation, and WebSockets over Redis pubsub for real-time disease alerts mandated by RA 11332. The competitive landscape (CHITS, iClinicSys, DHIS2) reveals that no existing Philippine BHS-level system combines offline-first mobile entry, real-time Category I alerts, GIS disease mapping at purok level, and ML outbreak forecasting -- this combination is Project LINK's structural moat.

The recommended approach is a 5-phase build over 16 weeks, prioritizing the foundational infrastructure (async sessions, RBAC, barangay isolation, soft deletes) before any clinical module, then building all 6 clinical programs (prenatal, EPI, nutrition, TB-DOTS, NCD, disease surveillance) against a proven service/repository pattern, followed by WebSocket alerting, then GIS/ML analytics, and finally FHSIS reporting with offline sync. This ordering is driven by hard dependency chains: FHSIS reports cannot be built until clinical modules produce data, offline sync is a transport layer over stable endpoints, and ML requires historical data accumulation. A critical stack decision is to replace python-jose (abandoned, CVEs) with PyJWT before writing any auth code.

The top risks are: (1) async SQLAlchemy MissingGreenlet errors from forgotten eager loads -- mitigated by setting `lazy="raise"` on all relationships from day one; (2) soft-delete WHERE clause omissions leaking "deleted" patient records -- mitigated by a global `do_orm_execute` hook; (3) IndexedDB data eviction on Safari after 7 days -- mitigated by mandatory PWA installation for BHWs; (4) Background Sync API being Chromium-only -- mitigated by a three-tier fallback strategy; and (5) Prophet producing nonsensical forecasts on sparse per-barangay data -- mitigated by minimum data thresholds and graceful degradation.

## Key Findings

### Recommended Stack

The stack is a modern async Python backend with a React TypeScript frontend, chosen for stability over bleeding-edge recency. All versions were verified against PyPI and npm as of the research date. Two critical deviations from the initial CLAUDE.md spec were identified: python-jose must be replaced with PyJWT (security), and Vite 8 must be avoided in favor of Vite 6 (stability).

**Core technologies:**

- **FastAPI ~0.135.1 + Pydantic ~2.11.x:** Async-first API with native Pydantic v2 validation. Pin `~0.135` because FastAPI has no semver guarantees.
- **SQLAlchemy ~2.0.48 + asyncpg ~0.31.0 + GeoAlchemy2 ~0.18.4:** Full async ORM with PostGIS spatial support. Use `expire_on_commit=False` everywhere.
- **PostgreSQL 16 + PostGIS 3.5:** Stable RDBMS with spatial extensions. Docker image `postgis/postgis:16-3.5-alpine`.
- **PyJWT ~2.12.x:** Replaces python-jose (abandoned, CVEs). API is nearly identical; migration is trivial.
- **Celery ~5.6.2 + Redis 7:** Task queue for ML training, nightly batch jobs, report generation. Celery 5.6 fixes Redis disconnection bugs.
- **React ~19.2.4 + TypeScript ~5.7.x + Vite ~6.4.x:** Stable frontend stack. Do NOT adopt Vite 8 (3 days old, Rolldown bundler swap) or TS 6.0 beta.
- **shadcn/ui (CLI v4) + Tailwind CSS ~4.2.x:** CSS-first config, no `tailwind.config.js`. Colors in OKLCH via `@theme` directives.
- **TanStack Query ~5.90.x + Zustand ~5.x:** Server state (TanStack) + client state (Zustand). Note: v5 removed `onSuccess`/`onError` callbacks.
- **MapLibre GL JS ~5.x + react-map-gl ~8.1.0:** Free Mapbox fork for GIS rendering. Use `react-map-gl/maplibre` import.
- **Dexie.js ~4.3.0 + vite-plugin-pwa ~1.1.0:** IndexedDB wrapper with React hooks + Workbox-based PWA. Use `injectManifest` strategy for custom sync logic.
- **Prophet ~1.3.0 + scikit-learn ~1.8.0:** Time-series forecasting + classification/clustering. Prophet requires CmdStanPy; use multi-stage Docker build.

**Critical version requirements:**
- Python 3.12.x (not 3.13 -- Prophet/CmdStanPy untested on free-threading)
- Node.js 22 LTS
- Pin PyJWT >=2.12.0 for CVE-2026-32597 fix
- Alembic must use `alembic init -t async` template

### Expected Features

**Must have (table stakes) -- users will reject the system without these:**
- Unified Individual Treatment Record (ITR) with city-wide patient search
- Prenatal enrollment + visits + auto-scheduled next visit + overdue detection
- EPI vaccination recording with dose sequence enforcement + defaulter detection + FIC computation
- Nutrition assessment with WHO Z-scores (WAZ, HAZ, WHZ)
- TB-DOTS case registration + daily visit recording + sputum schedule tracking
- NCD enrollment + PhilPEN risk stratification + controlled/uncontrolled classification
- Disease surveillance: Category I (24-hour alert, RA 11332) + Category II (weekly batch)
- FHSIS auto-generation: M1, M2, Q1, A1 per DOH DM 2024-0007
- RBAC with 7 roles + barangay data isolation + audit logging + soft deletes
- Basic inventory: item catalog, per-BHS stock levels, low-stock alerts

**Should have (differentiators) -- no Philippine BHS system offers all of these:**
- Offline-first BHW mobile entry (PWA) with background sync and conflict resolution
- GIS disease mapping: barangay choropleth + purok heatmap + DBSCAN spatial clustering
- ML outbreak forecasting (Prophet) per disease per barangay
- At-risk patient flagging (scikit-learn classifier)
- Barangay risk index (composite nightly Celery score)
- Real-time WebSocket Category I disease alerts
- Continuous overdue detection (not month-end tally)
- CHO city-wide supervisory dashboards across 32 BHS

**Defer to v2+:**
- Family Planning, Newborn Care, IMCI, Animal Bite/ABTC modules
- Full supply chain management (cold chain, expiry, procurement)
- SMS/push notification fallback for alerts
- PhilHealth billing / eKonsulta integration
- PHO/regional API integration (no stable DOH API exists)
- LSTM / deep learning models
- STI/HIV module (additional RA 11166 compliance burden)
- Patient portal, appointment booking, multi-language UI, custom report builder

### Architecture Approach

The system uses a strict four-layer backend architecture (Router -> Service -> Repository -> Data) with FastAPI dependency injection wiring the layers per-request. A single PostgreSQL database with row-level barangay filtering (applied at the repository layer via `BaseRepository._base_query()`) isolates data across 32 BHS. Five major data pipelines drive the system: (1) synchronous clinical record entry, (2) asynchronous offline BHW sync with conflict resolution, (3) real-time Category I disease alert via Redis pubsub to WebSocket, (4) read-heavy FHSIS report aggregation across all clinical modules, and (5) ML inference with nightly Celery Beat training and on-demand `run_in_threadpool` prediction.

**Major components:**
1. **FastAPI REST API + WebSocket** -- Handles all client communication; RBAC enforced at router layer; response validation via Pydantic schemas
2. **PostgreSQL + PostGIS** -- Single database with spatial extensions; barangay boundary polygons and health station points; GIN indexes for patient search
3. **Redis** -- Celery broker, result backend, and WebSocket pubsub bridge (enables Celery worker to trigger disease alerts across process boundaries)
4. **Celery Worker + Beat** -- ML training (Prophet, scikit-learn), nightly barangay risk index, FHSIS PDF/Excel export; Beat MUST run as separate single-instance container
5. **React PWA (Vite)** -- TanStack Query for server state, Dexie.js + Service Worker for BHW offline mode only, MapLibre GL JS for GIS rendering
6. **nginx** -- Reverse proxy routing: `/` to frontend, `/api/*` to backend, `/ws/*` to WebSocket upgrade

### Critical Pitfalls

1. **SQLAlchemy Async MissingGreenlet Crash** -- Any unloaded relationship access in async context crashes the request. Set `lazy="raise"` on ALL relationships from day one and explicitly use `selectinload()`/`joinedload()` in every repository query. Phase 1 imperative.

2. **Soft-Delete WHERE Clause Omission** -- A forgotten `WHERE deleted_at IS NULL` leaks "deleted" patient records (RA 10173 violation). Use SQLAlchemy `do_orm_execute` event hook with `with_loader_criteria()` to auto-inject the filter globally. Phase 1 imperative.

3. **Barangay Data Isolation Bypass** -- A nurse at BHS-A seeing BHS-B records is a privacy violation and clinical safety risk. Enforce via `BaseRepository` that auto-applies `health_station_id` filter. Write integration tests with two BHS users covering every endpoint. Phase 1 imperative.

4. **IndexedDB Safari Eviction + Background Sync Chromium-Only** -- Safari evicts IndexedDB after 7 days for non-installed web apps; Background Sync API only works in Chrome. Mitigate with mandatory PWA install for BHWs, three-tier sync fallback (Background Sync -> online event -> manual button), and sync-on-every-visit pattern. Phase 3 design decisions.

5. **Prophet Cold Start on Sparse Data** -- 80-90% of (barangay, disease) combinations will have insufficient data. Enforce minimum 24-observation threshold before fitting, set `floor=0` on all models, aggregate hierarchically when per-barangay data is too sparse, and label synthetic-trained forecasts clearly. Phase 4 design decision, but data pipeline must be planned from Phase 1.

## Implications for Roadmap

Based on combined research, the following 5-phase structure is recommended. This ordering is driven by hard dependency chains identified in both the ARCHITECTURE.md build order and the FEATURES.md dependency tree.

### Phase 1: Foundation + Infrastructure
**Rationale:** Every subsequent phase depends on the async session lifecycle, RBAC, barangay isolation, soft deletes, and audit logging being correct. These are also the highest-risk technical areas -- getting them wrong causes cascading bugs in all clinical modules. The 3 most critical pitfalls (MissingGreenlet, soft-delete leaks, isolation bypass) must be prevented here.
**Delivers:** Docker Compose environment (6 containers), async SQLAlchemy engine + session management, base models (TimestampMixin, SoftDeleteMixin), Alembic with GeoAlchemy2 helpers, JWT auth with PyJWT (NOT python-jose), RBAC with `require_role()`, BaseRepository with barangay isolation, user management CRUD, health station + barangay boundary seed data with PostGIS geometry, audit logging.
**Addresses features:** Auth + RBAC + barangay isolation, audit logging, soft deletes, patient ITR with city-wide search, duplicate patient prevention.
**Avoids pitfalls:** AsyncSession deadlock (async get_db), MissingGreenlet (lazy="raise" convention), soft-delete omission (do_orm_execute hook), barangay isolation bypass (BaseRepository), Celery Beat duplication (separate container), SRID mismatch (explicit srid=4326 on all geometry columns).

### Phase 2: Core Clinical Programs
**Rationale:** All 6 clinical modules share the same service/repository pattern established in Phase 1. Prenatal goes first because it has the most complex scheduling logic and stress-tests the pattern. The order (prenatal -> EPI -> nutrition -> TB -> NCD) follows increasing specialization and ensures the core patient record is solid before adding disease-specific modules.
**Delivers:** All 6 clinical program modules with full CRUD, overdue detection across all programs, WHO Z-score classification, PhilPEN risk stratification, dose sequence enforcement, DOTS daily recording.
**Addresses features:** Prenatal + postpartum, EPI + FIC + defaulter detection, nutrition + Z-scores, TB-DOTS + sputum tracking + contact tracing, NCD + PhilPEN.
**Uses:** FastAPI + Pydantic v2 schemas, SQLAlchemy async repositories, TanStack Query + React forms on frontend.
**Implements:** Clinical record entry pipeline (Pipeline 1 from architecture).

### Phase 3: Disease Surveillance + Real-Time Alerts + GIS
**Rationale:** Disease surveillance is the legal compliance centerpiece (RA 11332). WebSocket alerting must be built with the re-authentication protocol and ConnectionManager pattern from day one. GIS is grouped here because it depends on disease case data and PostGIS queries that share the same spatial infrastructure. DBSCAN clustering is a natural extension of the GIS work.
**Delivers:** Category I/II disease case entry, WebSocket real-time alert broadcast, PIDSR validation workflow, GIS choropleth + heatmap + DBSCAN clustering, Category II batch export.
**Addresses features:** PIDSR Category I + II, WebSocket alerts, barangay-level choropleth, purok-level heatmap, DBSCAN spatial clustering, disease type/barangay/date filtering.
**Avoids pitfalls:** JWT WebSocket token expiry (re-auth protocol), WebSocket connection leak (ConnectionManager with cleanup), PostGIS spatial index misuse (ST_DWithin, EXPLAIN ANALYZE), SRID mismatch in spatial queries.
**Implements:** Category I alert pipeline (Pipeline 3), GIS spatial analytics (Pipeline 5C/5D).

### Phase 4: ML Analytics + FHSIS Reporting
**Rationale:** ML requires historical data (or synthetic seed) from Phase 2-3 clinical modules. FHSIS reporting is a cross-cutting read layer that depends on ALL clinical modules having correct data entry. Both are grouped here because they are read-heavy aggregation systems over the data created in earlier phases.
**Delivers:** Prophet outbreak forecasting (nightly Celery), at-risk patient flagging (scikit-learn), barangay risk index (composite nightly score), FHSIS M1/M2/Q1/A1 auto-generation, PHIS Coordinator verification workflow, PDF/Excel export.
**Addresses features:** ML outbreak forecasting, at-risk flagging, barangay risk index, confidence labeling, FHSIS M1 + M2 + Q1 + A1, PHIS verification, export.
**Avoids pitfalls:** Prophet cold start (minimum data threshold, floor=0, hierarchical aggregation), Celery Beat duplicate execution (idempotent tasks, Redis SETNX locks), event loop blocking (run_in_threadpool for inference, Celery tasks for training).
**Implements:** ML inference pipeline (Pipeline 5A/5B), FHSIS report generation pipeline (Pipeline 4).

### Phase 5: Offline PWA + Inventory + CHO Dashboards + Polish
**Rationale:** Offline sync is a transport layer over stable endpoints -- building it before endpoints are stable causes version mismatch nightmares when IndexedDB schemas diverge from server schemas. Inventory is a lower-priority module that does not block other features. CHO supervisory dashboards depend on all program data being available.
**Delivers:** PWA infrastructure (Service Worker, IndexedDB via Dexie.js, cache strategy), BHW mobile-first offline forms, sync batch endpoint with conflict resolution, nurse review queue, sync status indicator, manual sync button, basic inventory (catalog + stock + alerts), CHO city-wide dashboards.
**Addresses features:** Offline BHW mobile entry, background sync, conflict resolution, BHW approval workflow, deduplication, inventory, CHO supervisory dashboards, cross-BHS comparison, FHSIS compliance monitoring.
**Avoids pitfalls:** Background Sync Chromium-only (three-tier fallback), IndexedDB Safari eviction (mandatory PWA install, navigator.storage.persist()), sync queue overflow (batch in chunks of 50), clinical data in SW cache (IndexedDB only, encrypt sensitive fields).
**Implements:** Offline BHW sync pipeline (Pipeline 2).

### Phase Ordering Rationale

- **Foundation before features:** The 3 highest-severity pitfalls (MissingGreenlet, soft-delete leaks, isolation bypass) are all Phase 1 infrastructure. Every clinical module inherits these patterns; fixing them retroactively requires touching every query in the codebase.
- **Clinical before surveillance/GIS/ML:** Disease surveillance entries reference patient records. GIS queries aggregate disease cases. ML models train on historical clinical data. The dependency chain is strict.
- **Surveillance + GIS together:** Both depend on PostGIS spatial infrastructure and disease case data. WebSocket + Redis pubsub skills transfer to ML alert triggers.
- **ML + FHSIS together:** Both are read-heavy aggregation systems over clinical data. Both use Celery for CPU-bound work. FHSIS indicator formulas are the ultimate integration test of data quality.
- **Offline last:** The offline layer adds transport complexity over existing endpoints. Building it early risks constant rework as endpoint schemas evolve. The ARCHITECTURE.md explicitly recommends this ordering.

### Research Flags

Phases likely needing deeper research during planning:
- **Phase 3 (Disease Surveillance + WebSocket):** WebSocket re-authentication protocol, Redis pubsub subscription lifecycle, and nginx WebSocket proxy configuration are niche integration areas with limited tutorial coverage. Research the specific message protocol before implementation.
- **Phase 4 (ML Analytics):** Prophet configuration for sparse Philippine health data, synthetic data generation strategy for model bootstrapping, and the FHSIS DM 2024-0007 indicator formulas need domain-specific research. The DOH indicator formulas are not well-documented online; may require direct reference to the Department Memorandum document.
- **Phase 5 (Offline PWA):** The three-tier sync fallback (Background Sync + online event + manual), Dexie.js schema migration strategy for IndexedDB on BHW phones, and field-specific encryption of clinical data in IndexedDB all warrant targeted research.

Phases with standard patterns (skip research-phase):
- **Phase 1 (Foundation):** Well-documented async SQLAlchemy 2.0 + FastAPI patterns. The research already provides concrete code patterns for session lifecycle, BaseRepository, soft-delete hooks, and JWT auth.
- **Phase 2 (Core Clinical):** Follows the service/repository pattern established in Phase 1. The DOH program rules (EPI schedule, WHO Z-scores, PhilPEN protocol) are well-documented in DOH manuals.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | All versions verified on PyPI and npm. Compatibility matrix cross-checked. python-jose replacement is a verified critical finding. |
| Features | HIGH | Competitor analysis (CHITS, iClinicSys, DHIS2, OpenSRP) covers the Philippine HMIS landscape. DOH regulatory requirements (RA 11332, DM 2024-0007, RA 10173) are statutory. |
| Architecture | HIGH | Layered FastAPI + async SQLAlchemy patterns are well-documented. Five data pipelines are clearly defined with dependency ordering. PostGIS + WebSocket patterns verified via official docs. |
| Pitfalls | HIGH | All 12 critical/major pitfalls are verified across official documentation, GitHub issues, and community post-mortems. Recovery strategies provided for each. |

**Overall confidence:** HIGH

### Gaps to Address

- **DOH DM 2024-0007 indicator formulas:** The exact FHSIS indicator computation formulas need to be extracted from the Department Memorandum. Online documentation is a Scribd-hosted scan. During Phase 4 planning, the team should secure a physical copy or verified digital extract of the complete indicator definitions.
- **Prophet + Python 3.12 + CmdStanPy in Docker:** Rated "LIKELY OK" not "VERIFIED." The Docker multi-stage build for Prophet with CmdStanPy compilation should be tested early (Phase 1 Docker setup) even though Prophet is not used until Phase 4.
- **BHW device landscape:** The research assumes BHWs use Android + Chrome, but the actual device/browser distribution among CHO 2's BHWs is unknown. A brief survey of BHW devices before Phase 5 would inform whether the Safari eviction mitigation is needed in practice.
- **Barangay boundary GeoJSON data:** The architecture assumes availability of Dasmarinas City barangay boundary shapefiles for PostGIS seeding. The source of this spatial data (PSA, CHO 2, OpenStreetMap) should be confirmed during Phase 1 planning.
- **Zustand vs Context:** ARCHITECTURE.md recommends React Context for auth/WebSocket state while STACK.md recommends Zustand for client state. Both are valid; the team should standardize on one approach during Phase 1 frontend setup. Recommendation: use Zustand for all client state including auth, keeping TanStack Query for server state.

## Sources

### Primary (HIGH confidence)
- FastAPI official docs -- JWT migration, WebSocket patterns, dependency injection
- SQLAlchemy 2.0 official docs -- asyncio extension, MissingGreenlet, eager loading
- PostGIS official docs -- ST_AsGeoJSON, spatial indexing, SRID requirements
- GeoAlchemy2 official docs -- types, Alembic integration
- MDN -- Background Sync API browser support, Storage API eviction criteria
- Can I Use -- Background Sync browser compatibility data
- PyPI -- version verification for all Python packages
- npm -- version verification for all Node.js packages
- DOH regulatory documents -- RA 11332, RA 10173, DM 2024-0007
- Celery official docs -- periodic tasks, Beat best practices

### Secondary (MEDIUM confidence)
- FastAPI GitHub discussions -- session deadlock (#6628, #3205), MissingGreenlet (#13125), WebSocket disconnect (#9031)
- Community blog posts -- layered FastAPI architecture patterns, Celery production guides, offline PWA with Dexie.js
- Prophet GitHub issues -- sparse data (#1432), minimum observations (#855)
- SQLAlchemy GitHub discussions -- soft delete patterns (#10517)
- Competitor analysis -- CHITS (PCHRD/UP Manila), iClinicSys (DOH RO2), OpenSRP (global)

### Tertiary (LOW confidence)
- Safari PWA storage limitations (BSWEN blog, March 2026) -- single source, needs field validation
- Dexie.js synchronization patterns (StudyRaid) -- generic patterns, not domain-specific
- Prophet 1.3 + Python 3.12 Docker compatibility -- no explicit test report found

---
*Research completed: 2026-03-15*
*Ready for roadmap: yes*
