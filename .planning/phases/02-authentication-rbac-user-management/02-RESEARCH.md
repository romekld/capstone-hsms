# Phase 2: Authentication + RBAC + User Management — Research

**Researched:** 2026-03-16
**Domain:** FastAPI JWT auth, SQLAlchemy 2.0 async repository pattern, React/Vite RBAC frontend
**Confidence:** HIGH — core stack verified against official docs and PyPI; UI verified against shadcn official blocks page

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**JWT Library & Token Strategy**
- Library: PyJWT (confirmed — python-jose is abandoned and has active CVEs)
- Access token lifetime: 1 hour
- Refresh token lifetime: 7 days, with silent rotation — token regenerated on every use; previous token immediately invalidated
- JWT payload fields: `user_id`, `roles` (list), `health_station_id` (nullable) — all three embedded so require_role() and the repository isolation layer avoid a DB round-trip on every request
- Refresh tokens are stored in `user_sessions` table; logout = server-side revocation of the session row

**require_role() Signature**
- `require_role(["nurse", "physician"])` — accepts a list of allowed role strings; any user whose roles array intersects the allowed list passes
- Dual-role users (nurse + DSO) are automatically handled
- `require_role()` is a FastAPI dependency used as a guard only (`_ = Depends(require_role([...]))`) — it does NOT return the user object
- Separate `CurrentUser = Annotated[UserSchema, Depends(get_current_user)]` dependency is used when the route handler needs the user object
- Pattern for future phases:
  ```python
  async def endpoint(db: AsyncDB, current_user: CurrentUser, _=Depends(require_role(["nurse", "midwife"]))):
  ```

**Role Storage**
- `users.roles TEXT[]` — PostgreSQL array column; checked with `ANY()` in SQL or set intersection in Python
- Dual-role example: `roles = ['nurse', 'disease_surveillance_officer']`
- `system_admin` exclusivity enforced at user creation/edit: if `system_admin` is in roles, no other role may be present — validated at the service layer before INSERT/UPDATE
- Nurse + DSO dual-role is explicitly permitted

**User Model Additional Fields**
- `users.is_active BOOLEAN NOT NULL DEFAULT TRUE` — deactivation sets to False; login attempt by inactive user returns 401
- Deactivation also invalidates all active `user_sessions` rows for that user (set `revoked_at = now()`)

**Barangay Isolation — BaseRepository Pattern**
- `BaseRepository.__init__(self, session: AsyncSession, user: UserSchema)` — repository instantiated per-request with both the DB session and current user
- `_isolation_filter(query, model)` method checks if user has any CROSS_BHS_ROLES; if not, applies `WHERE health_station_id = user.health_station_id`
- CROSS_BHS_ROLES = `{'city_health_officer', 'phis_coordinator', 'disease_surveillance_officer'}`
- All clinical repositories in Phases 3–9 inherit from BaseRepository and call `_isolation_filter()` in list/search methods
- Pattern for router instantiation:
  ```python
  repo = PatientRepository(session=db, user=current_user)
  ```

**DSO Read-Only Enforcement**
- Enforced via `require_role()` at write endpoints — DSO is simply not included in the allowed roles list for non-PIDSR POST/PUT/DELETE endpoints

**Admin Panel — Frontend Scope**
- Login page: shadcn `login-01` or `login-02` block (centered/single-column; no two-column marketing layout)
- Post-login routing: system_admin → `/admin/users`; all other roles → `/dashboard`
- Sidebar: shadcn `sidebar-07` block (collapsible to icons), role-filtered nav links
- User list columns: Full Name | Email | Role(s) | BHS Assignment | Status | Created | Actions
- Create/Edit user modal: full name, email, password, role multi-select (7 checkboxes with system_admin exclusivity), BHS combobox (hidden for system_admin)
- Deactivation flow: confirmation AlertDialog showing user name and current role
- Activity log tab: shows recent user management actions from `audit_logs`

### Claude's Discretion
- Password hashing algorithm (bcrypt via passlib is standard)
- Exact audit_log payload structure for user management events
- CORS configuration
- Token blacklist vs. user_sessions table implementation detail for revocation
- Exact Alembic migration for users + user_sessions tables
- Error message wording for 401 vs 403 responses

### Deferred Ideas (OUT OF SCOPE)
- None — discussion stayed within phase scope
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| AUTH-01 | User can log in with email and password; session persists via JWT access + refresh token pair | PyJWT 2.12.1 encode/decode API; `user_sessions` table design; `POST /auth/login` endpoint pattern |
| AUTH-02 | User can log out; refresh token is revoked server-side via `user_sessions` table | `user_sessions.revoked_at` column; `DELETE /auth/logout` endpoint; deactivation invalidation cascade |
| AUTH-03 | System enforces 7 RBAC roles | `users.roles TEXT[]` PostgreSQL array; `require_role()` dependency; `CROSS_BHS_ROLES` constant |
| AUTH-04 | `system_admin` role is exclusive | Service-layer validation; HTTP 422 with field-level error; frontend checkbox exclusivity logic |
| AUTH-05 | Nurse + DSO dual-role permitted | Set intersection check in `require_role()`; no special handling needed |
| AUTH-06 | `system_admin` can create user accounts, assign roles, assign to BHS | `POST /admin/users`; `PUT /admin/users/{id}`; `PATCH /admin/users/{id}/deactivate` endpoints |
| AUTH-07 | All API endpoints enforce RBAC via `require_role()` | FastAPI dependency injection at router layer; `CurrentUser` typed annotation |
| AUTH-08 | All clinical data queries filtered by `health_station_id` at repository layer | `BaseRepository._isolation_filter()`; `CROSS_BHS_ROLES` set; inherited by all Phase 3–9 repos |
| AUTH-09 | `city_health_officer` and `phis_coordinator` have read-only cross-BHS access | Membership in `CROSS_BHS_ROLES`; no isolation filter applied |
| AUTH-10 | DSO has PIDSR CRUD plus read-only cross-BHS access | Membership in `CROSS_BHS_ROLES`; write endpoints gate DSO out via `require_role()` |
</phase_requirements>

---

## Summary

Phase 2 implements JWT-based authentication, a 7-role RBAC system, and a system_admin user management panel. The backend is built on PyJWT 2.12.1 (replacing the abandoned python-jose which has two active 2024 CVEs), pwdlib 0.3.0 with Argon2 for password hashing, and SQLAlchemy 2.0 async sessions throughout. The critical architectural output of this phase is the `BaseRepository` class — every clinical repository in Phases 3–9 inherits from it, making the barangay isolation filter (auth enforcement at the data layer) a universal contract.

The frontend starts from zero: the React+Vite+TypeScript application is scaffolded in this phase. shadcn/ui provides the login and sidebar blocks. Auth state is managed with React Context + axios interceptors for token refresh. Protected routes use React Router v6's `<Navigate>` redirect pattern. The admin panel (user list, create/edit modal, activity log) is built with shadcn Table, Dialog, AlertDialog, and Combobox components.

The `user_sessions` table design is the mechanism for stateful logout and refresh token rotation in an otherwise stateless JWT system. Every refresh request checks that the incoming token has a valid, non-revoked session row before issuing a new pair and revoking the old one.

**Primary recommendation:** Implement in this order: DB migration (users + user_sessions tables) → auth service (hash, token issue, token verify) → require_role dependency + CurrentUser dependency → BaseRepository → admin API endpoints → frontend scaffold → auth pages → admin UI.

---

## Standard Stack

### Core — Backend

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| PyJWT | 2.12.1 | JWT encode/decode | Official FastAPI recommendation (replacing python-jose); actively maintained; no CVEs |
| pwdlib[argon2] | 0.3.0 | Password hashing | Official FastAPI docs recommendation since 2024; Argon2 is memory-hard (better than bcrypt) |
| FastAPI | 0.115.x | Web framework | Already in requirements.txt |
| SQLAlchemy 2.0 async | 2.0.x | ORM + async sessions | Already in requirements.txt; `AsyncSession` throughout |
| asyncpg | 0.30.x | PostgreSQL async driver | Already in requirements.txt |
| python-multipart | latest | OAuth2 form data parsing | Required by FastAPI's `OAuth2PasswordBearer` when using form-based login |

### Core — Frontend

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| React | 18.x | UI framework | Established in CLAUDE.md |
| TypeScript | 5.x | Type safety | Established in CLAUDE.md |
| Vite | 5.x | Build tool | Established in CLAUDE.md |
| shadcn/ui | latest | Component library | Mandatory per CLAUDE.md |
| React Router v6 | 6.x | Client-side routing + protected routes | Standard for React SPAs |
| axios | 1.x | HTTP client + interceptors for token refresh | Standard for React+JWT; interceptor pattern handles 401 retry |
| Tailwind v4 | 4.x | CSS utility | Already specified in UI-SPEC (CSS-first @theme, no tailwind.config.ts) |

### Supporting — Backend

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| python-multipart | latest | Form data parsing | Required if any endpoint uses `OAuth2PasswordRequestForm` |
| httpx | 0.27.x | Async HTTP client for tests | Already in requirements.txt; used with AsyncClient in auth tests |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| PyJWT | python-jose | python-jose has CVE-2024-33663 (algorithm confusion) and CVE-2024-33664 (JWT bomb DoS); abandoned since 2023. Do not use. |
| pwdlib[argon2] | bcrypt directly | bcrypt is fine; pwdlib is cleaner API and matches updated FastAPI docs. Either works. |
| pwdlib[argon2] | passlib | passlib is unmaintained; throws deprecation errors on Python 3.11+; removed from crypt module in Python 3.13. Do not use. |
| React Context | Zustand | Both valid; Context is sufficient for auth state (simple, low-frequency updates). Zustand adds unnecessary dependency for this scope. |

**Installation — Backend additions:**
```bash
pip install pyjwt "pwdlib[argon2]" python-multipart
```

**Installation — Frontend scaffold:**
```bash
npm create vite@latest frontend -- --template react-ts
cd frontend && npm install axios react-router-dom
npx shadcn@latest init
npx shadcn@latest add button input label dialog alert-dialog table badge skeleton tabs \
  dropdown-menu separator avatar pagination checkbox select combobox sonner
```

Note: `login-01`/`login-02` and `sidebar-07` are blocks, not components:
```bash
npx shadcn@latest add login-01   # or login-02 — executor chooses single-column variant
npx shadcn@latest add sidebar-07
```

---

## Architecture Patterns

### Recommended Project Structure — Backend (new files this phase)

```
backend/app/
├── core/
│   ├── security.py          # create_access_token, create_refresh_token, verify_token, hash_password, verify_password
│   ├── dependencies.py      # AsyncDB (existing) + CurrentUser + require_role()
│   └── config.py            # Add JWT_SECRET_KEY, JWT_ALGORITHM, ACCESS_TOKEN_EXPIRE_MINUTES, REFRESH_TOKEN_EXPIRE_DAYS
├── models/
│   ├── user.py              # User model (TimestampMixin, NOT SoftDeleteMixin — uses is_active flag)
│   └── user_session.py      # UserSession model (refresh token store)
├── schemas/
│   ├── auth.py              # LoginRequest, TokenResponse, RefreshRequest
│   └── user.py              # UserSchema, UserCreateRequest, UserUpdateRequest, UserListResponse
├── repositories/
│   ├── base.py              # BaseRepository with _isolation_filter(); CROSS_BHS_ROLES constant
│   └── user.py              # UserRepository (does NOT inherit BaseRepository — user table not BHS-scoped)
├── services/
│   └── auth.py              # AuthService: login logic, token rotation, deactivation cascade
├── routers/
│   ├── auth.py              # POST /auth/login, POST /auth/refresh, POST /auth/logout
│   └── admin.py             # GET/POST/PUT/PATCH /admin/users (system_admin only)
└── alembic/versions/
    └── 0003_users_and_sessions.py   # users + user_sessions tables
```

### Recommended Project Structure — Frontend (new this phase)

```
frontend/src/
├── lib/
│   ├── axios.ts             # Axios instance with base URL + interceptors (401 → refresh → retry)
│   └── auth.ts              # Token storage helpers (access token in memory; refresh token in httpOnly cookie OR localStorage)
├── contexts/
│   └── AuthContext.tsx      # AuthProvider: user state, login(), logout(), roles check helpers
├── hooks/
│   └── useAuth.ts           # useContext(AuthContext) shortcut + isAuthorized(roles) helper
├── components/
│   └── ProtectedRoute.tsx   # <ProtectedRoute roles={[...]}>: wraps React Router routes
├── pages/
│   ├── LoginPage.tsx        # shadcn login-01/login-02 block, form logic
│   ├── DashboardPage.tsx    # Placeholder — role label confirming identity
│   └── admin/
│       ├── UsersPage.tsx    # User list table + Create/Edit modal + Deactivate dialog
│       └── ActivityLogPage.tsx  # audit_logs table
├── features/
│   └── auth/
│       ├── api.ts           # login(), logout(), refreshToken() API calls
│       └── types.ts         # LoginRequest, TokenResponse, UserSchema types
└── styles/
    └── globals.css          # Design tokens — exact content defined in 02-UI-SPEC.md
```

### Pattern 1: PyJWT Token Creation and Verification

**What:** Encode JWT with user_id, roles, health_station_id, exp; decode and verify on every authenticated request.
**When to use:** All authenticated endpoints.

```python
# Source: https://pyjwt.readthedocs.io/en/latest/usage.html + FastAPI official docs
import jwt
from jwt.exceptions import InvalidTokenError, ExpiredSignatureError
from datetime import datetime, timedelta, timezone

def create_access_token(user_id: str, roles: list[str], health_station_id: int | None) -> str:
    payload = {
        "sub": user_id,
        "roles": roles,
        "health_station_id": health_station_id,
        "exp": datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES),
        "iat": datetime.now(timezone.utc),
        "type": "access",
    }
    return jwt.encode(payload, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)

def verify_token(token: str) -> dict:
    try:
        payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
        return payload
    except ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except InvalidTokenError:
        raise HTTPException(status_code=401, detail="Could not validate credentials")
```

### Pattern 2: require_role() Dependency

**What:** FastAPI Depends() guard — raises 403 if current user's roles do not intersect allowed list.
**When to use:** Every route that should be role-restricted.

```python
# Source: FastAPI dependency injection docs + CONTEXT.md locked decision
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

async def get_current_user(token: str = Depends(oauth2_scheme), db: AsyncDB = None) -> UserSchema:
    payload = verify_token(token)
    # No DB hit — payload already contains roles and health_station_id
    return UserSchema(
        id=payload["sub"],
        roles=payload["roles"],
        health_station_id=payload.get("health_station_id"),
    )

CurrentUser = Annotated[UserSchema, Depends(get_current_user)]

def require_role(allowed_roles: list[str]):
    def guard(current_user: CurrentUser):
        if not set(current_user.roles) & set(allowed_roles):
            raise HTTPException(status_code=403, detail="Insufficient permissions")
    return Depends(guard)

# Usage in router:
# async def endpoint(db: AsyncDB, current_user: CurrentUser, _=Depends(require_role(["nurse", "midwife"]))):
```

### Pattern 3: BaseRepository with Barangay Isolation

**What:** Abstract base class that auto-applies `health_station_id` filter on queries for non-cross-BHS roles.
**When to use:** All clinical repositories in Phases 3–9 inherit this.

```python
# Source: CONTEXT.md locked decision
from sqlalchemy.ext.asyncio import AsyncSession
from app.schemas.user import UserSchema

CROSS_BHS_ROLES = frozenset({"city_health_officer", "phis_coordinator", "disease_surveillance_officer"})

class BaseRepository:
    def __init__(self, session: AsyncSession, user: UserSchema):
        self.session = session
        self.user = user

    def _isolation_filter(self, stmt, model):
        """Apply health_station_id filter unless user has cross-BHS role."""
        if not set(self.user.roles) & CROSS_BHS_ROLES:
            stmt = stmt.where(model.health_station_id == self.user.health_station_id)
        return stmt
```

### Pattern 4: Refresh Token Rotation

**What:** On `POST /auth/refresh`, verify the incoming refresh token against `user_sessions`, issue a new token pair, revoke the old session row.
**When to use:** Client calls this before every expiry (token has `exp`; client uses iat + 55min timer or axios 401 interceptor).

```python
async def rotate_refresh_token(refresh_token: str, db: AsyncSession) -> tuple[str, str]:
    # 1. Verify token signature and type
    payload = verify_token(refresh_token)  # raises 401 if invalid
    if payload.get("type") != "refresh":
        raise HTTPException(status_code=401, detail="Not a refresh token")

    # 2. Look up active session — must not be revoked
    session_row = await db.scalar(
        select(UserSession).where(
            UserSession.token_hash == hash_token(refresh_token),
            UserSession.revoked_at.is_(None),
        )
    )
    if not session_row:
        raise HTTPException(status_code=401, detail="Session revoked or not found")

    # 3. Revoke old session immediately (rotation)
    session_row.revoked_at = datetime.now(timezone.utc)
    await db.commit()

    # 4. Issue new token pair and create new session row
    new_access = create_access_token(...)
    new_refresh = create_refresh_token(...)
    db.add(UserSession(user_id=session_row.user_id, token_hash=hash_token(new_refresh)))
    await db.commit()
    return new_access, new_refresh
```

### Pattern 5: Axios Token Refresh Interceptor (Frontend)

**What:** Response interceptor catches 401, calls `/auth/refresh`, retries the original request.
**When to use:** Applied once in `lib/axios.ts`; transparent to all feature API modules.

```typescript
// Source: React+Axios JWT refresh interceptor pattern (community standard)
import axios from "axios";

const api = axios.create({ baseURL: "/api" });

let isRefreshing = false;
let failedQueue: Array<{ resolve: (token: string) => void; reject: (err: unknown) => void }> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => (error ? prom.reject(error) : prom.resolve(token!)));
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers["Authorization"] = `Bearer ${token}`;
          return api(originalRequest);
        });
      }
      originalRequest._retry = true;
      isRefreshing = true;
      try {
        const { data } = await api.post("/auth/refresh", { refresh_token: getRefreshToken() });
        setAccessToken(data.access_token);
        setRefreshToken(data.refresh_token);
        processQueue(null, data.access_token);
        originalRequest.headers["Authorization"] = `Bearer ${data.access_token}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        clearTokens();
        window.location.href = "/login";
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);
```

### Pattern 6: React Protected Route

**What:** Wrapper component that checks auth and role before rendering route content.
**When to use:** All routes except `/login`.

```typescript
// Source: React Router v6 docs + role-based access pattern
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

interface ProtectedRouteProps {
  allowedRoles?: string[];
}

export function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();
  if (isLoading) return <LoadingSpinner />;
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.some((r) => user.roles.includes(r))) {
    return <Navigate to="/unauthorized" replace />;
  }
  return <Outlet />;
}
```

### Pattern 7: Audit Log Write

**What:** Insert a row into `audit_logs` after every user management create/update/deactivate operation. No PII in payload.
**When to use:** AuthService and AdminService methods that mutate users.

```python
# Source: existing audit_logs table schema in 0001_initial_schema.py
await db.execute(
    text(
        "INSERT INTO audit_logs (table_name, record_id, operation, performed_by, new_values) "
        "VALUES (:table, :record_id, :op, :by, :new)"
    ),
    {
        "table": "users",
        "record_id": str(target_user.id),
        "op": "UPDATE",
        "by": str(current_user.id),
        "new": json.dumps({"is_active": False}),  # No PII — field name + value only
    }
)
```

### Anti-Patterns to Avoid

- **Returning user object from require_role():** The guard only raises or passes. Use `CurrentUser` dependency separately when you need the user object.
- **DB lookup in get_current_user:** JWT payload already carries roles + health_station_id. A DB round-trip on every request defeats the purpose. Only hit the DB for operations that require fresh user state (e.g., checking is_active on every request — but CONTEXT.md has NOT required this; active status is checked only at login).
- **Storing access token in localStorage:** Access tokens should be in-memory only (JS variable or React state). Refresh token in httpOnly cookie is ideal; localStorage is acceptable for this project's threat model but in-memory is safer.
- **python-jose anywhere:** The package is in requirements.txt currently. It must be removed and replaced with PyJWT before Phase 2 implementation starts.
- **SoftDeleteMixin on User model:** User uses `is_active` flag, not `deleted_at`. Do NOT apply SoftDeleteMixin — the `do_orm_execute` hook would auto-filter "deleted" users from all queries, which is not the intended behavior.
- **BaseRepository in UserRepository:** The `users` table is not BHS-scoped. `UserRepository` should NOT inherit `BaseRepository` — it is a direct `AsyncSession` user.
- **Inline CROSS_BHS_ROLES:** This set must be a named constant at module level in `repositories/base.py` so Phases 3–9 can `from app.repositories.base import CROSS_BHS_ROLES`.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| JWT encode/decode | Custom base64 signing | `PyJWT` `jwt.encode()` / `jwt.decode()` | RFC 7519 compliance, exp claim handling, algorithm safety, exception types |
| Password hashing | Custom hash function | `pwdlib[argon2]` `PasswordHash.recommended()` | Argon2 is memory-hard; salt management; timing-attack safe comparison |
| OAuth2 Bearer extraction | Manual `Authorization` header parsing | `OAuth2PasswordBearer` from FastAPI | Handles edge cases; integrates with OpenAPI docs |
| Refresh token entropy | `uuid.uuid4()` | `secrets.token_urlsafe(32)` | `secrets` module uses OS CSPRNG; UUID4 is not a security primitive |
| Token hash storage | Store raw refresh token | Store `hashlib.sha256(token).hexdigest()` | Defense in depth — DB breach doesn't expose valid tokens |
| Concurrent 401 refresh | Per-request refresh calls | Shared promise queue (Pattern 5 above) | Without queue, N simultaneous 401s trigger N refresh calls, causing race conditions |

**Key insight:** The `user_sessions` table stores a SHA-256 hash of the refresh token, not the raw token. If the DB is compromised, hashed tokens cannot be replayed. The raw token is only ever in transit (HTTPS) and in client memory.

---

## Common Pitfalls

### Pitfall 1: python-jose Still in requirements.txt

**What goes wrong:** Two active 2024 CVEs (algorithm confusion and JWT bomb DoS). Code continues to work but is vulnerable.
**Why it happens:** requirements.txt currently has `python-jose[cryptography]`. Must be removed before Phase 2 starts.
**How to avoid:** Replace in requirements.txt with `pyjwt` before writing any auth code. The PyJWT API differs: `jose.jwt.decode(token, key, algorithms=[...])` becomes `jwt.decode(token, key, algorithms=[...])` — similar but not identical import path.
**Warning signs:** `from jose import jwt` anywhere in the codebase.

### Pitfall 2: TEXT[] Array in SQLAlchemy 2.0 Requires Explicit ARRAY Type

**What goes wrong:** `roles: Mapped[list[str]] = mapped_column()` raises a SQLAlchemy error — it cannot infer the DB type for `list[str]`.
**Why it happens:** PostgreSQL ARRAY is dialect-specific. SQLAlchemy 2.0 requires explicit type declaration.
**How to avoid:**
```python
from sqlalchemy.dialects.postgresql import ARRAY
from sqlalchemy import String
roles: Mapped[list[str]] = mapped_column(ARRAY(String), nullable=False, default=list)
```
**Warning signs:** `sqlalchemy.exc.CompileError` about "Could not locate a corresponding type for Python type 'list'".

### Pitfall 3: Refresh Token Rotation Race Condition

**What goes wrong:** Two requests fire simultaneously while the access token is expired. Both receive 401. Both try to refresh. The first succeeds; the second fails with "session revoked" because the first rotation already invalidated the old refresh token. The second request then sends the user to the login page unexpectedly.
**Why it happens:** No coordination between concurrent 401 handlers.
**How to avoid:** Use the shared promise queue pattern (Pattern 5). The `isRefreshing` flag and `failedQueue` array serialize refresh calls so only one goes through; all pending requests get the new token.
**Warning signs:** Intermittent logouts under normal usage when multiple API calls fire on page load.

### Pitfall 4: Forgetting to Revoke All Sessions on Deactivation

**What goes wrong:** Admin deactivates a user, but that user's existing refresh token still works because the `user_sessions` row is not invalidated. The deactivated user can continue using the system until their refresh token expires (up to 7 days).
**Why it happens:** Deactivation only sets `users.is_active = False` but forgets to cascade to `user_sessions`.
**How to avoid:** In the deactivation service method, execute both:
  1. `UPDATE users SET is_active = FALSE WHERE id = :user_id`
  2. `UPDATE user_sessions SET revoked_at = NOW() WHERE user_id = :user_id AND revoked_at IS NULL`
**Warning signs:** A deactivated user's session remains valid after the deactivation action.

### Pitfall 5: Health Station ID NULL for Cross-BHS Roles

**What goes wrong:** `require_role()` passes for a CHO user, but then `BaseRepository._isolation_filter()` tries to apply `WHERE health_station_id = NULL` — which returns no rows (SQL NULL != NULL).
**Why it happens:** `user.health_station_id IS NULL` for CHO/PHIS/DSO users, and `model.health_station_id = NULL` uses `=` not `IS NULL`.
**How to avoid:** The isolation filter already handles this by checking role membership in `CROSS_BHS_ROLES` first. If the user has a cross-BHS role, the filter is NOT applied — the query runs without the WHERE clause. The NULL health_station_id never reaches the WHERE clause for these roles. This is the entire point of the `CROSS_BHS_ROLES` check.
**Warning signs:** CHO/DSO/PHIS users see no data despite having cross-BHS access.

### Pitfall 6: Frontend Token Storage Strategy

**What goes wrong:** Access token stored in localStorage is vulnerable to XSS. If any third-party script (analytics, ad tag) is injected, tokens are stolen.
**Why it happens:** localStorage is the simplest API.
**How to avoid:** Store the access token in memory only (React Context state / module-level variable). Store the refresh token in an httpOnly cookie if the deployment allows it (nginx sets `Set-Cookie: HttpOnly; Secure; SameSite=Strict`). For this project, localhost development + internal network deployment: memory for access token, localStorage for refresh token is an acceptable tradeoff given the threat model.
**Warning signs:** Access token appears in `localStorage.getItem('access_token')` from browser console.

### Pitfall 7: passlib Import Warnings / Python 3.13 Crash

**What goes wrong:** passlib imports trigger `DeprecationWarning` on Python 3.11 and a hard crash on Python 3.13 because the `crypt` module was removed.
**Why it happens:** Current requirements.txt has no passlib, but if any developer adds it (copying old examples), it breaks.
**How to avoid:** Use pwdlib exclusively. Document in PR review checklist.

### Pitfall 8: audit_logs record_id Type Mismatch

**What goes wrong:** `audit_logs.record_id` is `UUID`. User model PKs are integers (SERIAL). Attempting `INSERT INTO audit_logs ... record_id = 42` fails type check.
**Why it happens:** The audit_logs table was designed with UUID record IDs, but user PKs are integers.
**How to avoid:** Two options: (a) change `users.id` to UUID (breaking change to migration chain) — not recommended at this stage; (b) cast the integer PK to a string, then generate a deterministic UUID using `uuid5(namespace, str(user_id))` or simply store `gen_random_uuid()` and log the `user_id` in `new_values` JSONB instead. Recommended: store user PK in `new_values->>'user_id'` and use `gen_random_uuid()` for `record_id` in audit_logs for user management events.

---

## Code Examples

Verified patterns from official sources:

### User Model (SQLAlchemy 2.0)
```python
# Source: CONTEXT.md + SQLAlchemy 2.0 docs for ARRAY type
from sqlalchemy import Text, Boolean, Integer, ForeignKey
from sqlalchemy.dialects.postgresql import ARRAY
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.base import Base, TimestampMixin

class User(TimestampMixin, Base):
    """NO SoftDeleteMixin — uses is_active flag per CONTEXT.md."""
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    email: Mapped[str] = mapped_column(Text, nullable=False, unique=True, index=True)
    full_name: Mapped[str] = mapped_column(Text, nullable=False)
    hashed_password: Mapped[str] = mapped_column(Text, nullable=False)
    roles: Mapped[list[str]] = mapped_column(ARRAY(String), nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    health_station_id: Mapped[int | None] = mapped_column(
        Integer, ForeignKey("health_stations.id"), nullable=True
    )

    health_station = relationship("HealthStation", lazy="raise")
    sessions = relationship("UserSession", back_populates="user", lazy="raise")
```

### UserSession Model
```python
from datetime import datetime
from sqlalchemy import Text, Integer, ForeignKey, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.base import Base

class UserSession(Base):
    """Refresh token store — no TimestampMixin (created_at handled explicitly)."""
    __tablename__ = "user_sessions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    token_hash: Mapped[str] = mapped_column(Text, nullable=False, unique=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    revoked_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)

    user = relationship("User", back_populates="sessions", lazy="raise")
```

### Password Hash and Verify
```python
# Source: https://fastapi.tiangolo.com/tutorial/security/oauth2-jwt/ (updated 2024 docs)
from pwdlib import PasswordHash

_pwd = PasswordHash.recommended()

def hash_password(plain: str) -> str:
    return _pwd.hash(plain)

def verify_password(plain: str, hashed: str) -> bool:
    return _pwd.verify(plain, hashed)
```

### CORS Configuration
```python
# Source: FastAPI CORS docs + React SPA best practices
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,  # ["http://localhost:5173"] in dev
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```
Settings addition:
```python
ALLOWED_ORIGINS: list[str] = ["http://localhost:5173"]  # Vite dev server
JWT_SECRET_KEY: str  # load from environment
JWT_ALGORITHM: str = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
REFRESH_TOKEN_EXPIRE_DAYS: int = 7
```

### Async Auth Test Pattern
```python
# Source: FastAPI async testing docs + dependency_overrides pattern
import pytest
from httpx import ASGITransport, AsyncClient
from app.main import app
from app.core.dependencies import get_current_user
from app.schemas.user import UserSchema

@pytest.fixture
def mock_nurse_user():
    return UserSchema(id=1, email="nurse@test.com", roles=["nurse"], health_station_id=1, is_active=True)

@pytest.mark.asyncio
async def test_protected_route_requires_role(mock_nurse_user):
    async def override_get_current_user():
        return mock_nurse_user
    app.dependency_overrides[get_current_user] = override_get_current_user
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.get("/admin/users")  # nurse should get 403
    assert response.status_code == 403
    app.dependency_overrides.clear()
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| python-jose for JWT | PyJWT | 2024 (CVEs published) | Drop-in replacement; similar API but different import path |
| passlib + bcrypt | pwdlib[argon2] | 2024 (FastAPI docs updated) | Argon2 is stronger; passlib removed from Python 3.13 |
| Storing raw refresh tokens | Storing SHA-256 hash of refresh tokens | Best practice always; more visible since 2023 | DB breach doesn't leak valid tokens |
| sync SQLAlchemy session | `AsyncSession` throughout | SQLAlchemy 2.0 | Never use `session.execute()` sync methods; always `await session.execute()` |
| Tailwind v3 tailwind.config.ts | Tailwind v4 CSS-first `@theme` | 2024 (Tailwind v4 release) | No `tailwind.config.ts` — all config in `globals.css` under `@theme {}` |

**Deprecated/outdated:**
- `python-jose`: CVE-2024-33663 (algorithm confusion) + CVE-2024-33664 (JWT bomb). Remove from requirements.txt in Wave 0.
- `passlib`: Unmaintained; `crypt` module removed from Python stdlib in Python 3.13. Do not add.
- `ReactDOM.render()`: Replaced by `createRoot()` in React 18. Use `createRoot` in `main.tsx`.

---

## Open Questions

1. **Token storage in production (httpOnly cookie vs localStorage for refresh token)**
   - What we know: httpOnly cookie prevents XSS token theft; requires nginx to set `Set-Cookie` header; more complex for localhost development.
   - What's unclear: Whether the Docker nginx config in Phase 1 supports cookie passthrough to React. The Phase 1 nginx config is a reverse proxy to FastAPI.
   - Recommendation: Use localStorage for refresh token in Phase 2 (acceptable for CHO 2 internal deployment threat model). Document as a known limitation. Phase 2 plan should not block on this.

2. **audit_logs.record_id UUID vs User PK integer type mismatch**
   - What we know: `audit_logs.record_id` is `UUID NOT NULL`; `users.id` is `INTEGER SERIAL`. These types conflict.
   - What's unclear: Whether to cast or change the users PK design.
   - Recommendation: Use `gen_random_uuid()` for `audit_logs.record_id` when logging user management events, and record the actual `users.id` integer inside `new_values JSONB` as `{"user_id": 42, "changed_fields": [...]}`. This avoids a migration chain conflict. The planner must define this in the audit log write pattern.

3. **shadcn init preset selection**
   - What we know: `shadcn_initialized: false` per UI-SPEC. The executor must run `npx shadcn@latest init`. UI-SPEC notes the preset code is "to be initialized at project scaffold time."
   - What's unclear: Which preset code to use. The Tailwind v4 CSS-first pattern in the UI-SPEC uses OKLCH colors, which may conflict with a shadcn preset that generates HSL variables.
   - Recommendation: Run `npx shadcn@latest init` with no preset (default); the UI-SPEC provides the complete `globals.css` content which overrides whatever the preset generates. The executor should use the UI-SPEC `globals.css` as the authoritative token source.

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | pytest 8.x + pytest-asyncio 0.24.x |
| Config file | `backend/pytest.ini` or `pyproject.toml [tool.pytest]` — check if exists; if not, Wave 0 creates it |
| Quick run command | `docker-compose exec backend pytest tests/test_auth/ -x -q` |
| Full suite command | `docker-compose exec backend pytest -x -q` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| AUTH-01 | POST /auth/login returns 200 + access + refresh tokens | integration | `pytest tests/test_auth/test_login.py -x` | Wave 0 |
| AUTH-01 | Login with wrong password returns 401 | integration | `pytest tests/test_auth/test_login.py::test_wrong_password -x` | Wave 0 |
| AUTH-01 | Login with inactive user returns 401 | integration | `pytest tests/test_auth/test_login.py::test_inactive_user -x` | Wave 0 |
| AUTH-02 | POST /auth/logout revokes session row | integration | `pytest tests/test_auth/test_logout.py -x` | Wave 0 |
| AUTH-02 | Revoked refresh token rejected on next refresh | integration | `pytest tests/test_auth/test_refresh.py::test_revoked_token -x` | Wave 0 |
| AUTH-03 | require_role(["nurse"]) returns 403 for BHW | unit | `pytest tests/test_auth/test_rbac.py::test_role_guard -x` | Wave 0 |
| AUTH-04 | system_admin + nurse combination raises HTTP 422 | integration | `pytest tests/test_admin/test_user_create.py::test_admin_exclusive -x` | Wave 0 |
| AUTH-05 | nurse + DSO dual role passes nurse and DSO route guards | unit | `pytest tests/test_auth/test_rbac.py::test_dual_role -x` | Wave 0 |
| AUTH-06 | POST /admin/users creates user (system_admin only) | integration | `pytest tests/test_admin/test_user_create.py -x` | Wave 0 |
| AUTH-06 | Non-admin calling POST /admin/users gets 403 | integration | `pytest tests/test_admin/test_user_create.py::test_non_admin_blocked -x` | Wave 0 |
| AUTH-07 | Unauthenticated request to any protected endpoint returns 401 | integration | `pytest tests/test_auth/test_auth_guard.py -x` | Wave 0 |
| AUTH-08 | BaseRepository._isolation_filter adds health_station_id WHERE clause for nurse | unit | `pytest tests/test_auth/test_base_repository.py::test_isolation_filter -x` | Wave 0 |
| AUTH-08 | BaseRepository._isolation_filter skips WHERE clause for CHO | unit | `pytest tests/test_auth/test_base_repository.py::test_cross_bhs_bypass -x` | Wave 0 |
| AUTH-09 | CHO user can query across all BHS (no filter applied) | unit | `pytest tests/test_auth/test_base_repository.py::test_cho_cross_bhs -x` | Wave 0 |
| AUTH-10 | DSO is in CROSS_BHS_ROLES; DSO blocked from non-PIDSR write endpoints | unit | `pytest tests/test_auth/test_rbac.py::test_dso_write_blocked -x` | Wave 0 |

Frontend auth tests are handled at the manual verification level (Playwright e2e is out of scope for Phase 2 — no e2e framework has been set up).

### Sampling Rate

- **Per task commit:** `docker-compose exec backend pytest tests/test_auth/ -x -q`
- **Per wave merge:** `docker-compose exec backend pytest -x -q`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps

- [ ] `backend/tests/test_auth/__init__.py` — test package init
- [ ] `backend/tests/test_auth/test_login.py` — covers AUTH-01 login flow
- [ ] `backend/tests/test_auth/test_logout.py` — covers AUTH-02 logout/revocation
- [ ] `backend/tests/test_auth/test_refresh.py` — covers AUTH-02 refresh rotation
- [ ] `backend/tests/test_auth/test_rbac.py` — covers AUTH-03, AUTH-05, AUTH-10 role guards
- [ ] `backend/tests/test_auth/test_auth_guard.py` — covers AUTH-07 unauthenticated → 401
- [ ] `backend/tests/test_auth/test_base_repository.py` — covers AUTH-08, AUTH-09 isolation filter
- [ ] `backend/tests/test_admin/__init__.py` — test package init
- [ ] `backend/tests/test_admin/test_user_create.py` — covers AUTH-04, AUTH-06
- [ ] Verify `backend/pytest.ini` exists with `asyncio_mode = auto`; create if absent

---

## Sources

### Primary (HIGH confidence)
- PyJWT 2.12.1 official docs — https://pyjwt.readthedocs.io/en/latest/usage.html — encode/decode API, exception types, algorithm specification
- FastAPI official security tutorial — https://fastapi.tiangolo.com/tutorial/security/oauth2-jwt/ — PyJWT integration, get_current_user pattern, pwdlib recommendation
- FastAPI async tests docs — https://fastapi.tiangolo.com/advanced/async-tests/ — AsyncClient + ASGITransport test pattern
- FastAPI dependency overrides docs — https://fastapi.tiangolo.com/advanced/testing-dependencies/ — `app.dependency_overrides` pattern
- FastAPI CORS docs — https://fastapi.tiangolo.com/tutorial/cors/ — CORSMiddleware configuration
- SQLAlchemy 2.0 PostgreSQL docs — https://docs.sqlalchemy.org/en/20/dialects/postgresql.html — ARRAY(String) mapped_column pattern
- pwdlib 0.3.0 PyPI — https://pypi.org/project/pwdlib/ — version, install command, API
- shadcn/ui blocks page — https://ui.shadcn.com/blocks/sidebar — sidebar variant inventory (sidebar-07 confirmed)

### Secondary (MEDIUM confidence)
- FastAPI discussion on python-jose deprecation — https://github.com/fastapi/fastapi/discussions/9587 — community consensus + maintainer response
- FastAPI discussion on passlib deprecation — https://github.com/fastapi/fastapi/discussions/11773 — maintainer confirms move to pwdlib
- CVE-2024-33663 (python-jose algorithm confusion) — https://www.sentinelone.com/vulnerability-database/cve-2024-33663/ — CVE detail
- CVE-2024-33664 (python-jose JWT bomb) — https://github.com/advisories/GHSA-cjwg-qfpm-7377 — GitHub advisory
- React Router v6 protected routes TypeScript — https://www.adarsha.dev/blog/role-based-auth-with-react-router-v6 — ProtectedRoute component pattern

### Tertiary (LOW confidence — flag for validation)
- Axios interceptor refresh token queue pattern — https://blog.theashishmaurya.me/handling-jwt-access-and-refresh-token-using-axios-in-react-app — concurrent 401 handling; cross-verified against multiple sources

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — PyJWT, pwdlib, SQLAlchemy ARRAY all verified against official docs/PyPI
- Architecture: HIGH — patterns derived from official FastAPI docs + locked CONTEXT.md decisions
- Pitfalls: HIGH (python-jose CVEs), HIGH (TEXT[] ARRAY type), MEDIUM (token storage), HIGH (deactivation cascade)
- Test map: HIGH — test structure follows existing project conventions in `tests/test_infra/`

**Research date:** 2026-03-16
**Valid until:** 2026-04-16 (30 days; stable libraries)
