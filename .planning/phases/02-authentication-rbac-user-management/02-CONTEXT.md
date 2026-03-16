# Phase 2: Authentication + RBAC + User Management - Context

**Gathered:** 2026-03-16
**Status:** Ready for planning

<domain>
## Phase Boundary

A real user can log in with email/password, receive JWT tokens (PyJWT), stay logged in across sessions via refresh token rotation, and log out with token revocation. system_admin can manage users and roles. All API endpoints enforce RBAC via `require_role()`. Barangay data isolation is enforced at the repository layer. audit_logs captures all user management operations. Includes a full admin panel UI and the login page. Clinical data modules (patient records, programs) are out of scope — Phase 3+.

</domain>

<decisions>
## Implementation Decisions

### JWT Library & Token Strategy
- **Library:** PyJWT (confirmed — python-jose is abandoned and has active CVEs)
- **Access token lifetime:** 1 hour
- **Refresh token lifetime:** 7 days, with silent rotation — the token is regenerated on every use; the previous token is immediately invalidated
- **JWT payload fields:** `user_id`, `roles` (list), `health_station_id` (nullable) — all three embedded so require_role() and the repository isolation layer avoid a DB round-trip on every request
- Refresh tokens are stored in `user_sessions` table; logout = server-side revocation of the session row

### require_role() Signature
- `require_role(["nurse", "physician"])` — accepts a list of allowed role strings; any user whose roles array intersects the allowed list passes
- Dual-role users (nurse + DSO) are automatically handled — their roles list is checked against the allowed list; no special-casing needed
- `require_role()` is a FastAPI dependency used as a guard only (`_ = Depends(require_role([...]))`) — it does NOT return the user object
- Separate `CurrentUser = Annotated[UserSchema, Depends(get_current_user)]` dependency is used when the route handler needs the user object (for health_station_id, display info, etc.)
- Pattern for future phases (Phases 3–9):
  ```python
  async def endpoint(db: AsyncDB, current_user: CurrentUser, _=Depends(require_role(["nurse", "midwife"]))):
  ```

### Role Storage
- `users.roles TEXT[]` — PostgreSQL array column; checked with `ANY()` in SQL or set intersection in Python
- Dual-role example: `roles = ['nurse', 'disease_surveillance_officer']`
- `system_admin` exclusivity enforced at user creation/edit: if `system_admin` is in roles, no other role may be present — validated at the service layer before INSERT/UPDATE
- Nurse + DSO dual-role is explicitly permitted (BHS Surveillance Focal Person use case)

### User Model Additional Fields
- `users.is_active BOOLEAN NOT NULL DEFAULT TRUE` — deactivation sets to False; login attempt by inactive user returns 401
- Deactivation also invalidates all active `user_sessions` rows for that user (set `revoked_at = now()`)

### Barangay Isolation — BaseRepository Pattern
- `BaseRepository.__init__(self, session: AsyncSession, user: UserSchema)` — repository instantiated per-request with both the DB session and current user
- `_isolation_filter(query, model)` method checks if user has any CROSS_BHS_ROLES; if not, applies `WHERE health_station_id = user.health_station_id`
- CROSS_BHS_ROLES = `{'city_health_officer', 'phis_coordinator', 'disease_surveillance_officer'}`
- All clinical repositories in Phases 3–9 inherit from BaseRepository and call `_isolation_filter()` in list/search methods
- Pattern for router instantiation:
  ```python
  repo = PatientRepository(session=db, user=current_user)
  ```

### DSO Read-Only Enforcement
- DSO cross-BHS write restriction enforced via `require_role()` at write endpoints — DSO is simply not included in the allowed roles list for non-PIDSR POST/PUT/DELETE endpoints
- No special handling in BaseRepository or service layer needed; the router-level RBAC gate is sufficient

### Admin Panel — Frontend Scope
- **Login page:** Clean full-screen centered card layout (shadcn `login-01` or `login-02` block), email + password fields, no registration link (accounts are system_admin-provisioned only)
- **Post-login routing:** Role-specific redirect — system_admin → `/admin/users`; all other roles → `/dashboard` (placeholder until Phase 3); sidebar navigation with role-filtered links built with shadcn `sidebar-*` blocks
- **User list table:** Columns: full name, email, role(s), BHS assignment, active status, created date. Sortable, with deactivate/reactivate action per row.
- **Create/Edit user modal:** Fields: full name, email, password (manual entry on create; optional reset on edit), role multi-select (7 checkboxes with system_admin exclusivity enforced in UI and backend), BHS assignment searchable dropdown (32 stations by name; field hidden/disabled when system_admin is selected)
- **Deactivation flow:** Deactivate button in user list → confirmation dialog → sets is_active=False + revokes all sessions. Reactivate available on inactive users.
- **Activity log tab:** Simple table on admin panel showing recent user management actions from `audit_logs` (who did what, when, on which user); no patient PII in log payload (user IDs and changed field names only)

### Claude's Discretion
- Password hashing algorithm (bcrypt via passlib is standard)
- Exact audit_log payload structure for user management events
- CORS configuration
- Token blacklist vs. user_sessions table implementation detail for revocation
- Exact Alembic migration for users + user_sessions tables
- Error message wording for 401 vs 403 responses

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Authentication & Authorization Requirements
- `.planning/REQUIREMENTS.md` §Authentication & Authorization (AUTH-01 to AUTH-10) — Full spec for all 10 auth requirements including JWT, RBAC roles, barangay isolation rules, and cross-BHS access

### Phase 1 Infrastructure (base patterns to extend)
- `.planning/phases/01-infrastructure-devops/01-CONTEXT.md` — Established patterns: `psgc_code` FK standard, `users.health_station_id` nullable rule, async SQLAlchemy 2.0 base, `lazy="raise"` on relationships, `TimestampMixin`/`SoftDeleteMixin` usage

### Existing Code
- `backend/app/core/base.py` — `Base`, `TimestampMixin`, `SoftDeleteMixin`, `do_orm_execute` soft-delete hook (all must be preserved and extended)
- `backend/app/core/dependencies.py` — `AsyncDB` dependency (extend this file with `CurrentUser` and `require_role`)
- `backend/app/core/database.py` — `get_async_session` (used by all repos)
- `backend/app/models/health_station.py` — FK target for `users.health_station_id`

### UI Component Foundation
- CLAUDE.md §UI Development Rules — mandatory `frontend-design` skill invocation before any UI surface; shadcn/ui blocks are the starting point; CSS variable theming required
- shadcn `login-01`/`login-02` blocks for login page
- shadcn `sidebar-*` blocks for navigation shell

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `backend/app/core/base.py`: `Base`, `TimestampMixin`, `SoftDeleteMixin` — User model must use both mixins; `do_orm_execute` hook auto-applies soft-delete filter (User should NOT use SoftDeleteMixin — deactivation uses `is_active` flag instead, not soft delete)
- `backend/app/core/dependencies.py`: `AsyncDB` — extend this file with `CurrentUser` and `require_role` dependencies
- `backend/app/models/health_station.py`: `HealthStation` model — `users.health_station_id` FK target (`health_stations.id`)

### Established Patterns
- `lazy="raise"` on all SQLAlchemy relationships — never use lazy loading; all joins must be explicit
- Async-first throughout — never use sync SQLAlchemy methods; all repository methods must be `async def`
- `INSERT ... ON CONFLICT DO NOTHING` for idempotent seed operations (precedent from Phase 1)
- Repository layer is the single enforcement point for data isolation (not services, not routers)

### Integration Points
- `users.health_station_id` → `health_stations.id` (nullable FK; CHO/PHIS/DSO = NULL, BHS roles = non-null)
- `user_sessions` table: new in this phase; no FK to other clinical tables
- `audit_logs` table: created in Phase 1 migration; Phase 2 must write to it via the existing hook pattern
- All future clinical repositories (Phases 3–9) will inherit from `BaseRepository` defined in this phase

</code_context>

<specifics>
## Specific Ideas

- The CROSS_BHS_ROLES set in BaseRepository should be a named constant (not inlined per method) so Phases 3–9 can import and reuse it
- system_admin exclusivity should raise a clear HTTP 422 with field-level error message ("system_admin cannot be combined with other roles") for the admin form UX
- Deactivation confirmation dialog should show the user's name and current role to prevent accidental deactivation of the wrong user

</specifics>

<deferred>
## Deferred Ideas

- None — discussion stayed within phase scope

</deferred>

---

*Phase: 02-authentication-rbac-user-management*
*Context gathered: 2026-03-16*
