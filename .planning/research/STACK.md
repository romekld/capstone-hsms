# Technology Stack

**Project:** Project LINK (Local Information Network for Kalusugan) -- HSMS
**Researched:** 2026-03-15
**Overall Confidence:** HIGH (most recommendations verified via official sources)

---

## Runtime Versions

| Runtime | Version | Why This Version |
|---------|---------|-----------------|
| Python | 3.12.x | Stable, battle-tested, full library ecosystem support. 3.13 has free-threading experiments but Prophet/scikit-learn ecosystem is safer on 3.12. FastAPI 0.135.x requires >=3.10. |
| Node.js | 22 LTS | Required by Vite 6 (>=18). LTS means security patches through 2027. Vite 8 requires >=20.19 but is 3 days old -- too risky for a capstone. |
| TypeScript | 5.7.x | Stable, well-supported. TS 6.0 is in beta (Feb 2026) -- do NOT adopt beta for a capstone. Pin ~5.7. |

**Confidence:** HIGH -- all version requirements cross-verified with PyPI and npm.

---

## Recommended Stack

### Backend Core

| Technology | Version | Purpose | Why This, Why This Version |
|------------|---------|---------|---------------------------|
| FastAPI | ~0.135.1 | Async web framework | Latest stable (Mar 2026). Async-first, automatic OpenAPI docs, Pydantic v2 native. Requires Python >=3.10. Pin ~0.135 to avoid surprise breaking changes (FastAPI has no semver guarantees). |
| Uvicorn | ~0.34.x | ASGI server | Standard FastAPI production server. Use `uvicorn[standard]` for uvloop + httptools performance. |
| Pydantic | ~2.11.x | Validation + serialization | Use 2.11.x stable, NOT 2.12 beta. Ground-up Rust core rewrite gives 5-50x validation speed vs v1. `model_validate` replaces `from_orm`, `model_dump` replaces `.dict()`. |
| Starlette | (pinned by FastAPI) | ASGI toolkit | Do NOT pin independently; FastAPI pins its own Starlette version. |

**CRITICAL: Pydantic v2 patterns for this project:**
- Use `model_config = ConfigDict(from_attributes=True)` on all response schemas (replaces `orm_mode = True`)
- `Optional[T]` now means "required but nullable" -- use `T | None = None` for truly optional fields
- Use `model_validate()` not deprecated `from_orm()` or `parse_obj()`

**Confidence:** HIGH -- versions verified on PyPI as of research date.

### Database

| Technology | Version | Purpose | Why This, Why This Version |
|------------|---------|---------|---------------------------|
| PostgreSQL | 16.x | Primary RDBMS | Stable, proven. PG 17 is available but 16 has wider Docker image testing. PostGIS 3.5/3.6 supports PG 13-18. |
| PostGIS | 3.5.x | Spatial extension | Stable release line. Docker image: `postgis/postgis:16-3.5`. Required for ST_AsGeoJSON, spatial indexing, choropleth queries. |
| SQLAlchemy | ~2.0.48 | Async ORM | Latest 2.0.x stable (Mar 2026). Do NOT use 2.1 beta. Full async session support with `create_async_engine`. |
| asyncpg | ~0.31.0 | Async PG driver | Latest stable (Nov 2025). Supports PG 9.5-18. Required as SQLAlchemy async PG backend: `postgresql+asyncpg://`. |
| GeoAlchemy2 | ~0.18.4 | PostGIS ORM bindings | Latest stable (Feb 2025). Supports SQLAlchemy >=1.4 (so 2.0.x works). Provides `Geometry`, `Geography` column types and `ST_AsGeoJSON` function wrappers. |
| Alembic | ~1.18.4 | DB migrations | Latest stable (Feb 2026). Use `alembic init -t async` for async engine template. Set naming conventions on Base metadata for reliable autogenerate. |

**CRITICAL asyncpg note:** Earlier search results mentioned pinning asyncpg <0.29.0 for SQLAlchemy compatibility. This appears to be outdated -- asyncpg 0.31.0 with SQLAlchemy 2.0.48 is the tested combination. However, if you encounter `create_async_engine` issues, this is the first thing to investigate.

**CRITICAL Alembic note:** Always use `alembic init -t async` and configure `run_async_migrations()` in `env.py`. Alembic migrations themselves run synchronously inside `connection.run_sync()` -- this is correct and expected.

**Confidence:** HIGH -- versions verified on PyPI, Docker Hub, PostGIS official docs.

### Task Queue + Cache

| Technology | Version | Purpose | Why This, Why This Version |
|------------|---------|---------|---------------------------|
| Redis | 7.x (server) | Broker + cache + session | Use official `redis:7-alpine` Docker image. |
| redis-py | ~7.1.1 | Python Redis client | Latest stable (Feb 2026). Requires Python >=3.10. Celery 5.6 requires redis-py >=4.5.2 (satisfied). |
| Celery | ~5.6.2 | Distributed task queue | Latest stable (Jan 2026). Python 3.9-3.13 support. ML training, nightly Celery batch jobs, FHSIS report generation. |
| Kombu | ~5.6.x | (Celery dependency) | Pinned by Celery. Do NOT pin independently. Celery 5.6 requires Kombu >=5.6. |

**CRITICAL Celery note:** Celery 5.6 fixed long-standing Redis broker disconnection issues (via Kombu 5.5.0+). This is important for reliability of ML training tasks and nightly barangay risk index computation.

**Confidence:** HIGH -- versions verified on PyPI.

### Authentication

| Technology | Version | Purpose | Why This, Why This Version |
|------------|---------|---------|---------------------------|
| PyJWT | ~2.12.x | JWT encode/decode | **USE PyJWT, NOT python-jose.** python-jose is abandoned (last release ~3 years ago), has known security vulnerabilities, and depends on unmaintained packages. FastAPI official docs now recommend PyJWT. Pin >=2.12.0 to get CVE-2026-32597 fix (crit header validation). |
| passlib[bcrypt] | ~1.7.4 | Password hashing | Stable, industry-standard bcrypt hashing. Used with FastAPI's security utilities. |
| python-multipart | ~0.0.20 | Form data parsing | Required by FastAPI for OAuth2 password flow form parsing. |

**WARNING -- python-jose:** The CLAUDE.md references `python-jose`. This is a blocking issue to resolve in Phase 1. python-jose is unmaintained and has known CVEs. The migration to PyJWT is straightforward:
```python
# python-jose (OLD -- do not use)
from jose import jwt
token = jwt.encode(payload, secret, algorithm="HS256")
decoded = jwt.decode(token, secret, algorithms=["HS256"])

# PyJWT (NEW -- use this)
import jwt
token = jwt.encode(payload, secret, algorithm="HS256")
decoded = jwt.decode(token, secret, algorithms=["HS256"])
```
The API is nearly identical. Always pin the `algorithms` parameter to prevent algorithm confusion attacks.

**Confidence:** HIGH -- verified via FastAPI official docs, PyJWT CVE advisories, PyPI.

### Frontend Core

| Technology | Version | Purpose | Why This, Why This Version |
|------------|---------|---------|---------------------------|
| React | ~19.2.4 | UI framework | Stable (Jan 2026). React 19 removes forwardRef requirement, adds `use()` hook, Server Components (not needed here but no harm). shadcn/ui fully supports React 19. |
| TypeScript | ~5.7.x | Type safety | Stable. Do NOT use TS 6.0 beta or TS 7.0 preview (Go rewrite) -- too experimental for a capstone deadline. |
| Vite | ~6.4.x | Build tool + dev server | **Use Vite 6, NOT Vite 8.** Vite 8.0.0 was released March 12 (3 days ago) with a complete bundler swap to Rolldown. This is a massive architectural change. For a 4-month capstone with a deadline, Vite 6 is the safe choice -- it still receives security patches and is battle-tested. Upgrade to 8 only after the capstone if desired. |
| @vitejs/plugin-react | ~4.x | React + Vite integration | Compatible with Vite 6. v6 of this plugin is for Vite 8 -- do not use it with Vite 6. |

**Why NOT Vite 8:** Vite 8 replaces Rollup + esbuild with Rolldown (Rust). Performance is better (10-30x builds), but: (1) released 3 days ago, (2) plugin ecosystem is still catching up, (3) capstone needs stability over speed. Vite 6 builds are already fast enough for this project size.

**Confidence:** HIGH for React/TS versions (npm verified). MEDIUM for Vite 6 recommendation (judgment call on stability vs recency).

### Frontend UI + Styling

| Technology | Version | Purpose | Why This, Why This Version |
|------------|---------|---------|---------------------------|
| shadcn/ui | latest (CLI v4) | Component library | Not a package -- CLI generates components into your codebase. Use `npx shadcn@latest init`. Fully supports React 19 + Tailwind v4. Use the `new-york` style with unified `radix-ui` package. |
| Tailwind CSS | ~4.2.x | Utility CSS | Latest stable (Feb 2026). CSS-first config (no more `tailwind.config.js`). Use `@import "tailwindcss"` in your main CSS. shadcn/ui fully supports v4. |
| tw-animate-css | latest | Animation utilities | Replaces `tailwindcss-animate` for Tailwind v4. Use `@import "tw-animate-css"` instead of the old `@plugin` directive. |
| Radix UI | `radix-ui` (unified) | Headless primitives | shadcn/ui's foundation. The new-york style uses a single `radix-ui` package instead of dozens of `@radix-ui/react-*` packages. Cleaner dependency tree. |
| Sonner | latest | Toast notifications | shadcn/ui is deprecating its own toast component in favor of Sonner. Use Sonner from the start. |
| Recharts | ~2.x | Charts + dashboards | Standard React charting. shadcn/ui chart blocks use Recharts. Preferable to Chart.js for React integration. |

**CRITICAL Tailwind v4 migration note:** If following any tutorial written before Jan 2025, it will reference `tailwind.config.js` which no longer exists in v4. All config is CSS-first via `@theme` directives. HSL colors are now converted to OKLCH. The semantic tokens (`--status-critical`, `--bhs-tier`, etc.) defined in CLAUDE.md should be declared in the CSS file under `:root` and `.dark` using Tailwind v4 syntax.

**Confidence:** HIGH -- verified via shadcn/ui changelog, npm, Tailwind CSS official blog.

### Frontend Data Layer

| Technology | Version | Purpose | Why This, Why This Version |
|------------|---------|---------|---------------------------|
| TanStack Query | ~5.90.x | Server state management | Latest v5 stable. Handles caching, refetching, optimistic updates, background sync indicators. v5 removed `onSuccess`/`onError` callbacks from `useQuery` -- use `useEffect` instead. |
| Axios | ~1.7.x | HTTP client | Mature, interceptors for JWT refresh, request/response transformation. Lighter alternatives (ky, ofetch) exist but Axios has widest community knowledge for a capstone team. |
| Zustand | ~5.x | Client state management | Lightweight, no boilerplate, no providers needed. Use for UI state (sidebar open, selected barangay, filter state). TanStack Query handles server state -- Zustand handles only client-local state. |

**Why Zustand over Redux/Jotai:** Zustand has the simplest API for a team that needs to move fast. Single store, hook-based, no Provider wrapper. Redux is overkill for client-only state when TanStack Query owns server state. Jotai's atomic model is more complex to reason about for a team.

**CRITICAL TanStack Query v5 note:** The `onSuccess`/`onError` removal is the biggest breaking change from v4 tutorials. All side effects must use `useEffect` watching the query's `data`/`error` states. This affects every data-fetching component.

**Confidence:** HIGH -- versions verified on npm, TanStack official docs.

### GIS / Mapping

| Technology | Version | Purpose | Why This, Why This Version |
|------------|---------|---------|---------------------------|
| MapLibre GL JS | ~5.x | Map rendering | Latest v5 stable. Free, open-source Mapbox GL fork. Supports GeoJSON sources, choropleth via `fill-extrusion`, heatmap layers, cluster sources. |
| react-map-gl | ~8.1.0 | React wrapper for MapLibre | Use `react-map-gl/maplibre` import (not the default Mapbox import). v8 has dedicated MapLibre endpoint with proper types. No need to set `mapLib` prop. |

**Tile source for Philippines:** Use OpenStreetMap tiles via a free tile server (e.g., `https://tile.openstreetmap.org/{z}/{x}/{y}.png`) or MapTiler free tier. Do NOT use Mapbox (requires API key with usage limits). For barangay boundaries, serve GeoJSON from PostGIS via the API.

**Confidence:** HIGH -- verified via npm, react-map-gl docs, MapLibre releases.

### Offline / PWA

| Technology | Version | Purpose | Why This, Why This Version |
|------------|---------|---------|---------------------------|
| vite-plugin-pwa | ~1.1.0 | PWA + Service Worker generation | Zero-config Workbox integration for Vite. Generates service worker, manifest, handles precaching. Use `injectManifest` strategy for custom sync logic (not `generateSW`). |
| Workbox | 7.x | (via vite-plugin-pwa) | Industry-standard service worker toolkit from Google. Handles cache strategies, background sync API. Bundled by vite-plugin-pwa. |
| Dexie.js | ~4.3.0 | IndexedDB wrapper | Best-in-class IndexedDB abstraction. TypeScript-first, React hooks via `dexie-react-hooks` (`useLiveQuery`). Much better DX than raw IndexedDB API. Supports versioned schema migrations. |

**Why `injectManifest` over `generateSW`:** The BHW offline sync logic (queue writes, dedup on `patient_id + record_type + date + bhw_id`, POST `/api/sync/batch` on reconnect) is custom business logic that cannot be expressed with `generateSW`'s declarative config. `injectManifest` lets you write a custom service worker that uses Workbox's `BackgroundSyncPlugin` for request queuing while implementing the project's specific conflict resolution rules.

**Why Dexie over raw IndexedDB:** Raw IndexedDB is callback-based, verbose, and error-prone. Dexie provides Promise-based API, schema versioning (critical for offline DB migrations on BHW phones), and React hooks for reactive queries. The `useLiveQuery` hook auto-updates components when IndexedDB data changes -- essential for showing sync status.

**Confidence:** HIGH -- verified via npm, vite-plugin-pwa docs, Dexie.js docs.

### ML / Analytics

| Technology | Version | Purpose | Why This, Why This Version |
|------------|---------|---------|---------------------------|
| Prophet | ~1.3.0 | Time series forecasting | Facebook's forecasting library. Used for outbreak prediction per Category II disease per barangay. Uses CmdStanPy backend (PyStan2 removed). Works with Python 3.12. |
| scikit-learn | ~1.8.0 | Classification + clustering | Latest stable (Dec 2025). DBSCAN for spatial clustering, classifiers for at-risk patient flagging. Python 3.9-3.13 support. |
| pandas | ~2.2.x | Data manipulation | Required by both Prophet and scikit-learn. Standard data wrangling. |
| numpy | ~2.x | Numerical computing | Required dependency. Pin compatible with scikit-learn 1.8. |

**Prophet installation note:** Prophet 1.3 requires CmdStanPy which compiles Stan models. In Docker, this means the image build will take longer (installs C++ toolchain). Use a multi-stage Docker build: compile in a builder stage, copy binaries to a slim runtime stage. Pre-compiled wheels are available on PyPI for common platforms.

**ML architecture note:** All ML inference MUST use `run_in_threadpool()` for quick predictions or Celery tasks for training/batch jobs. Prophet `.fit()` and `.predict()` are CPU-bound and will block the async event loop if called directly in a FastAPI endpoint.

**Confidence:** HIGH for scikit-learn (PyPI verified). MEDIUM for Prophet 1.3 + Python 3.12 (no explicit incompatibility found, but CmdStanPy compilation can be fragile in Docker).

### Infrastructure

| Technology | Version | Purpose | Why This, Why This Version |
|------------|---------|---------|---------------------------|
| Docker Engine | 27.x+ | Containerization | Current stable. Use Docker Desktop on dev machines. |
| Docker Compose | v2 (integrated) | Multi-service orchestration | Modern `docker compose` (no hyphen) is the standard. Remove `version:` field from compose file (ignored since Compose v2, generates warnings). |
| nginx | 1.27.x (alpine) | Reverse proxy | Serves frontend static build, proxies `/api/*` to FastAPI, handles WebSocket upgrade for disease alerts. Use `nginx:1.27-alpine` image. |
| pytest | ~8.x | Backend testing | Standard Python test framework. Use `pytest-asyncio` for async test functions. |
| pytest-asyncio | ~0.24.x | Async test support | Required for testing async FastAPI endpoints and repository functions. |
| httpx | ~0.28.x | Async test client | Use `httpx.AsyncClient` with FastAPI's `ASGITransport` for integration tests. Replaces the deprecated `TestClient` for async tests. |

**Docker Compose file format:** Start directly with `services:` block. No `version: "3.8"` header. Use `depends_on` with `condition: service_healthy` and define `healthcheck` on database and Redis services. Set `mem_limit` and `cpus` on Celery workers to prevent ML training from consuming all resources.

**Confidence:** HIGH -- standard infrastructure, well-documented.

---

## Alternatives Considered

| Category | Recommended | Alternative | Why Not |
|----------|-------------|-------------|---------|
| JWT library | PyJWT | python-jose | Abandoned, known CVEs, unmaintained dependencies |
| JWT library | PyJWT | joserfc | More comprehensive JOSE support, but overkill -- project only needs JWT signing/verification, not JWE/JWK. PyJWT is simpler and FastAPI-official. |
| Build tool | Vite 6.4 | Vite 8.0 | Released 3 days ago, massive bundler swap to Rolldown. Too risky for 4-month capstone deadline. |
| State mgmt | Zustand | Redux Toolkit | Overkill when TanStack Query owns server state. Redux's boilerplate slows down a fast-moving capstone team. |
| State mgmt | Zustand | Jotai | Atomic model is harder to reason about for a team. Zustand's single-store is simpler. |
| IndexedDB | Dexie.js | idb (by Jake Archibald) | idb is lower-level. Dexie provides schema versioning, React hooks, and richer query API -- all needed for BHW offline. |
| IndexedDB | Dexie.js | RxDB | RxDB adds replication protocol but is much heavier. The sync logic is custom (POST /api/sync/batch) so RxDB's built-in replication doesn't help. |
| ORM | SQLAlchemy 2.0 | SQLModel | SQLModel wraps SQLAlchemy but lags behind on features and has fewer async examples. For PostGIS + GeoAlchemy2, direct SQLAlchemy is better supported. |
| Maps | MapLibre GL JS | Leaflet | Leaflet lacks WebGL rendering, vector tiles, and smooth 60fps interactions. MapLibre is the modern standard for GIS web apps. |
| Charts | Recharts | Chart.js | Chart.js requires canvas refs and doesn't compose well with React. Recharts is React-native with JSX API. shadcn/ui chart blocks use Recharts. |
| Task queue | Celery | Dramatiq | Celery has vastly larger community, better Redis integration, more tutorials. Dramatiq is cleaner but less documented for this stack. |
| Forecasting | Prophet | statsmodels | Prophet handles seasonality, holidays, missing data out of the box. statsmodels requires manual seasonal decomposition. For a capstone team, Prophet's API is dramatically simpler. |
| Python version | 3.12 | 3.13 | 3.13 free-threading is experimental. Prophet + CmdStanPy have not been extensively tested on 3.13. 3.12 is the safe choice. |
| Tailwind | v4 | v3 | shadcn/ui CLI scaffolds v4 by default for new projects. Going v3 means fighting the tooling. v4 is stable (released Jan 2025, now at 4.2.x). |

---

## Full Dependency List

### Backend (Python -- `requirements.txt` or `pyproject.toml`)

```txt
# Core
fastapi[standard]~=0.135.1
uvicorn[standard]~=0.34.0
pydantic~=2.11.0
pydantic-settings~=2.8.0

# Database
sqlalchemy~=2.0.48
asyncpg~=0.31.0
alembic~=1.18.4
geoalchemy2~=0.18.4

# Auth
pyjwt[crypto]~=2.12.0
passlib[bcrypt]~=1.7.4
python-multipart~=0.0.20

# Task Queue
celery[redis]~=5.6.2
redis~=7.1.1

# ML
prophet~=1.3.0
scikit-learn~=1.8.0
pandas~=2.2.0
numpy~=2.0.0

# Testing
pytest~=8.3.0
pytest-asyncio~=0.24.0
httpx~=0.28.0
factory-boy~=3.3.0

# Utilities
python-dateutil~=2.9.0
openpyxl~=3.1.0       # Excel export for FHSIS
reportlab~=4.2.0      # PDF generation for FHSIS
shapely~=2.0.0        # Geometry operations (PostGIS companion)
```

### Frontend (Node.js -- `package.json`)

```json
{
  "dependencies": {
    "react": "^19.2.4",
    "react-dom": "^19.2.4",
    "react-router-dom": "^7.x",
    "@tanstack/react-query": "^5.90.0",
    "axios": "^1.7.0",
    "zustand": "^5.0.0",
    "maplibre-gl": "^5.0.0",
    "react-map-gl": "^8.1.0",
    "dexie": "^4.3.0",
    "dexie-react-hooks": "^1.1.0",
    "sonner": "^2.0.0",
    "recharts": "^2.15.0",
    "date-fns": "^4.0.0",
    "zod": "^3.24.0",
    "clsx": "^2.1.0",
    "tailwind-merge": "^3.0.0",
    "class-variance-authority": "^0.7.0",
    "lucide-react": "^0.400.0",
    "radix-ui": "^1.0.0"
  },
  "devDependencies": {
    "typescript": "~5.7.0",
    "vite": "^6.4.0",
    "@vitejs/plugin-react": "^4.0.0",
    "vite-plugin-pwa": "^1.1.0",
    "tailwindcss": "^4.2.0",
    "@tailwindcss/vite": "^4.2.0",
    "tw-animate-css": "^1.0.0",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "eslint": "^9.0.0",
    "prettier": "^3.4.0"
  }
}
```

**Note on Zod:** Used for client-side form validation that mirrors Pydantic schemas. Keeps validation logic consistent between frontend forms and backend API contracts.

---

## Version Compatibility Matrix

This matrix documents verified compatibility between key components:

| Component A | Component B | Status | Notes |
|-------------|-------------|--------|-------|
| FastAPI 0.135 | Pydantic 2.11 | VERIFIED | Native v2 support, v1 deprecated |
| FastAPI 0.135 | Python 3.12 | VERIFIED | Requires >=3.10 |
| SQLAlchemy 2.0.48 | asyncpg 0.31.0 | VERIFIED | `postgresql+asyncpg://` dialect |
| SQLAlchemy 2.0.48 | GeoAlchemy2 0.18.4 | VERIFIED | GeoAlchemy2 requires SA >=1.4 |
| SQLAlchemy 2.0.48 | Alembic 1.18.4 | VERIFIED | Same author, always compatible |
| Celery 5.6.2 | redis-py 7.1.1 | VERIFIED | Celery requires redis >=4.5.2 |
| Celery 5.6.2 | Python 3.12 | VERIFIED | Supports 3.9-3.13 |
| Prophet 1.3 | Python 3.12 | LIKELY OK | No reported issues, CmdStanPy 1.3 tested on 3.13 |
| scikit-learn 1.8 | Python 3.12 | VERIFIED | Supports 3.9-3.13 |
| React 19.2 | shadcn/ui (2026) | VERIFIED | Full support, forwardRef removed |
| React 19.2 | TanStack Query 5.90 | VERIFIED | React 19 compatible |
| Vite 6.4 | @vitejs/plugin-react 4.x | VERIFIED | v4 targets Vite 5-6 |
| Vite 6.4 | vite-plugin-pwa 1.1 | LIKELY OK | vite-plugin-pwa requires Vite >=5 |
| Tailwind CSS 4.2 | shadcn/ui CLI v4 | VERIFIED | Native v4 support |
| MapLibre GL JS 5.x | react-map-gl 8.1 | VERIFIED | v8 explicitly supports maplibre-gl >=4 |

---

## Known Breaking Changes and Migration Pitfalls

### 1. Pydantic v2 -- `Optional[T]` Semantics (CRITICAL)

In Pydantic v1, `Optional[str]` meant "field is optional, defaults to None."
In Pydantic v2, `Optional[str]` means "field is REQUIRED but can be None."

**Fix:** Use `field: str | None = None` for truly optional fields.

This affects EVERY schema in the project. Get this right from day one.

### 2. python-jose to PyJWT (CRITICAL)

CLAUDE.md specifies python-jose. This must be changed before writing any auth code. python-jose is abandoned with known CVEs. The API migration is trivial (nearly identical function signatures). See migration example in Authentication section above.

### 3. TanStack Query v5 -- No More `onSuccess`/`onError` on useQuery

```typescript
// v4 (OLD -- will NOT work in v5)
useQuery({ queryKey: ['patients'], queryFn: fetchPatients, onSuccess: (data) => { ... } })

// v5 (CORRECT)
const { data, error } = useQuery({ queryKey: ['patients'], queryFn: fetchPatients })
useEffect(() => { if (data) { ... } }, [data])
```

### 4. Tailwind v4 -- No `tailwind.config.js`

All configuration is CSS-first. Theme tokens, custom colors, and plugin imports happen in the CSS file:

```css
@import "tailwindcss";
@import "tw-animate-css";

@theme {
  --color-primary: oklch(0.65 0.15 250);
  --color-status-critical: oklch(0.55 0.2 25);
  --color-status-warning: oklch(0.75 0.15 85);
  --color-status-safe: oklch(0.65 0.15 145);
}
```

### 5. React 19 -- `useRef()` Requires an Argument

```typescript
// React 18 (OLD)
const ref = useRef()  // OK, implicitly undefined

// React 19 (NEW)
const ref = useRef(null)  // Must pass initial value
```

### 6. shadcn/ui -- Sonner Replaces Toast

The old `useToast()` hook and `<Toaster />` component from shadcn are being deprecated. Use `<Sonner />` and `toast()` from the sonner package instead.

### 7. Docker Compose -- No `version:` Field

```yaml
# OLD (generates warning)
version: "3.8"
services:
  ...

# NEW (correct)
services:
  ...
```

### 8. FastAPI -- Strict Content-Type Checking

FastAPI now rejects JSON requests without a proper `Content-Type: application/json` header by default. This can break clients that don't set headers. If the BHW offline sync POST doesn't set Content-Type, requests will be rejected. Ensure Axios default headers include `Content-Type: application/json`.

---

## Docker Service Architecture

```yaml
services:
  db:
    image: postgis/postgis:16-3.5-alpine
    # PostGIS pre-installed, no manual extension creation needed

  redis:
    image: redis:7-alpine

  backend:
    build: ./backend
    # Python 3.12-slim base, multi-stage for Prophet compilation
    depends_on:
      db: { condition: service_healthy }
      redis: { condition: service_healthy }

  celery_worker:
    build: ./backend
    command: celery -A app.tasks worker --loglevel=info
    # Same image as backend, different entrypoint
    mem_limit: 2g  # Prevent ML training from consuming all RAM

  celery_beat:
    build: ./backend
    command: celery -A app.tasks beat --loglevel=info
    # Scheduler for nightly barangay risk index, ML retraining

  frontend:
    build: ./frontend
    # Node 22 for build, nginx:1.27-alpine for serving

  nginx:
    image: nginx:1.27-alpine
    # Reverse proxy: / -> frontend, /api -> backend, /ws -> WebSocket
```

---

## What NOT to Use

| Technology | Why Not |
|------------|---------|
| python-jose | Abandoned, CVEs, unmaintained. Use PyJWT. |
| Pydantic v1 | Deprecated in FastAPI, 5-50x slower validation. |
| SQLAlchemy sync sessions | Blocks the async event loop. Always use AsyncSession. |
| Vite 8 | 3 days old, massive bundler change. Too risky for capstone. |
| TypeScript 6.0 beta | Beta software with a 4-month deadline. No. |
| Redux Toolkit | Overkill when TanStack Query handles server state. |
| Leaflet | No WebGL, no vector tiles, poor performance for GIS-heavy app. |
| tailwindcss-animate | Replaced by tw-animate-css for Tailwind v4. |
| create-react-app | Dead project, not maintained. Vite is the standard. |
| SQLModel | Lags behind SQLAlchemy features, poor GeoAlchemy2 integration. |
| Flask | No async support, no auto OpenAPI docs. FastAPI is superior for this use case. |
| Mapbox GL JS | Requires API key, usage-based pricing. MapLibre is the free fork. |

---

## Sources

### Backend
- [FastAPI PyPI](https://pypi.org/project/fastapi/) -- v0.135.1, Mar 2026
- [FastAPI Release Notes](https://fastapi.tiangolo.com/release-notes/) -- breaking changes
- [FastAPI JWT Documentation](https://fastapi.tiangolo.com/tutorial/security/oauth2-jwt/) -- PyJWT migration
- [SQLAlchemy PyPI](https://pypi.org/project/SQLAlchemy/) -- v2.0.48
- [asyncpg PyPI](https://pypi.org/project/asyncpg/) -- v0.31.0
- [GeoAlchemy2 Docs](https://geoalchemy-2.readthedocs.io/) -- v0.18.4
- [Alembic PyPI](https://pypi.org/project/alembic/) -- v1.18.4
- [Pydantic Migration Guide](https://docs.pydantic.dev/latest/migration/) -- v1 to v2
- [Celery 5.6 Changelog](https://docs.celeryq.dev/en/stable/changelog.html)
- [redis-py PyPI](https://pypi.org/project/redis/) -- v7.1.1
- [python-jose Abandonment Discussion](https://github.com/fastapi/fastapi/discussions/11345)
- [PyJWT CVE-2026-32597](https://advisories.gitlab.com/pkg/pypi/pyjwt/CVE-2026-32597/)

### Frontend
- [React Versions](https://react.dev/versions) -- v19.2.4
- [Vite Releases](https://vite.dev/releases) -- v6.4 LTS, v8.0
- [shadcn/ui Changelog](https://ui.shadcn.com/docs/changelog) -- React 19 + Tailwind v4
- [shadcn/ui Tailwind v4 Guide](https://ui.shadcn.com/docs/tailwind-v4)
- [TanStack Query Migration to v5](https://tanstack.com/query/latest/docs/framework/react/guides/migrating-to-v5)
- [Tailwind CSS v4 Blog](https://tailwindcss.com/blog/tailwindcss-v4)
- [react-map-gl What's New](https://visgl.github.io/react-map-gl/docs/whats-new) -- v8.1 MapLibre
- [MapLibre GL JS Releases](https://github.com/maplibre/maplibre-gl-js/releases) -- v5.x

### Offline/PWA
- [vite-plugin-pwa Docs](https://vite-pwa-org.netlify.app/) -- v1.1
- [Dexie.js Docs](https://dexie.org) -- v4.3
- [Offline-first Frontend Apps 2025](https://blog.logrocket.com/offline-first-frontend-apps-2025-indexeddb-sqlite/)

### ML
- [Prophet PyPI](https://pypi.org/project/prophet/) -- v1.3
- [scikit-learn 1.8 Release Highlights](https://scikit-learn.org/stable/auto_examples/release_highlights/plot_release_highlights_1_8_0.html)

### Infrastructure
- [PostGIS Released Versions](https://postgis.net/documentation/getting_started/install_windows/released_versions/) -- PG 16 + PostGIS 3.5
- [Docker Compose Docs](https://docs.docker.com/compose/)
- [postgis/postgis Docker Hub](https://hub.docker.com/r/postgis/postgis)
