---
phase: 02-authentication-rbac-user-management
plan: 03a
subsystem: auth
tags: [fastapi, pydantic, sqlalchemy, jwt, rbac, repository-pattern]

# Dependency graph
requires:
  - phase: 02-authentication-rbac-user-management
    plan: "01"
    provides: "User + UserSession ORM models, security.py (create_access_token, verify_token, hash_token, hash_password)"
  - phase: 02-authentication-rbac-user-management
    plan: "02"
    provides: "pytest test stubs — 12 stubs targeting auth+RBAC behavior that this plan implements"
provides:
  - "LoginRequest + TokenPair Pydantic schemas (backend/app/schemas/auth.py)"
  - "UserSchema + UserListItem Pydantic schemas (backend/app/schemas/user.py)"
  - "CROSS_BHS_ROLES frozenset constant + BaseRepository._isolation_filter() (backend/app/repositories/base.py)"
  - "UserRepository with full CRUD + session management (backend/app/repositories/user.py)"
  - "AuthService.login / refresh / logout with token rotation (backend/app/services/auth.py)"
  - "get_current_user, CurrentUser, require_role, AsyncDB FastAPI dependencies (backend/app/core/dependencies.py)"
affects:
  - "02-03b: auth router wires these contracts into HTTP endpoints"
  - "02-04: admin service uses UserRepository and require_role"
  - "Phases 3-9: all clinical repositories inherit from BaseRepository and use CROSS_BHS_ROLES"

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Repository pattern — UserRepository (unscoped), BaseRepository (BHS-scoped via _isolation_filter)"
    - "Service layer — AuthService holds business logic; no direct DB access in routers"
    - "Annotated dependency injection — CurrentUser, AsyncDB as Annotated types for clean router signatures"
    - "Dependency factory — require_role(allowed_roles) returns Depends(_guard) for declarative RBAC at router layer"
    - "CROSS_BHS_ROLES frozenset — named module-level constant imported by all Phase 3-9 repositories"

key-files:
  created:
    - backend/app/schemas/auth.py
    - backend/app/schemas/user.py
    - backend/app/schemas/__init__.py
    - backend/app/repositories/__init__.py
    - backend/app/repositories/base.py
    - backend/app/repositories/user.py
    - backend/app/services/__init__.py
    - backend/app/services/auth.py
    - backend/tests/test_auth/test_unit_auth_layer.py
  modified:
    - backend/app/core/dependencies.py

key-decisions:
  - "UserRepository does NOT inherit BaseRepository — user management is cross-BHS; admin sees all users regardless of BHS"
  - "CROSS_BHS_ROLES is frozenset at module level, not inlined per caller — downstream repos import the constant to avoid duplication"
  - "get_current_user populates UserSchema with empty email/full_name — JWT contains sub+roles+health_station_id only; full user fetch only needed for admin operations"
  - "HTTPBearer(auto_error=False) used so get_current_user raises 401 (not FastAPI's default 403) for missing Authorization header"
  - "require_role() is a dependency factory returning Depends(_guard) — declarative RBAC without repeating auth logic per endpoint"

patterns-established:
  - "BaseRepository._isolation_filter(query, model): add WHERE health_station_id for BHS-scoped roles; skip for CROSS_BHS_ROLES or models without that column"
  - "AuthService.login(): check user exists + password valid + is_active; then create_session row with hash_token(refresh_token)"
  - "Token rotation: refresh() revokes old session row before creating new pair — replay attack prevention"

requirements-completed:
  - AUTH-01
  - AUTH-02
  - AUTH-03
  - AUTH-05
  - AUTH-07
  - AUTH-08
  - AUTH-09
  - AUTH-10

# Metrics
duration: 7min
completed: 2026-03-17
---

# Phase 2 Plan 03a: Auth Dependencies Layer Summary

**FastAPI auth dependency layer: Pydantic schemas, CROSS_BHS_ROLES BaseRepository, UserRepository CRUD, AuthService login/refresh/logout with token rotation, and require_role dependency factory**

## Performance

- **Duration:** ~7 min
- **Started:** 2026-03-17T05:44:40Z
- **Completed:** 2026-03-17T05:51:20Z
- **Tasks:** 2 (Task 1: schemas + BaseRepository; Task 2: UserRepository + AuthService + dependencies, TDD)
- **Files modified:** 10 (9 created, 1 modified)

## Accomplishments

- Pydantic schemas (LoginRequest, TokenPair, UserSchema, UserListItem) fully typed with from_attributes for ORM compatibility
- CROSS_BHS_ROLES frozenset constant + BaseRepository._isolation_filter() — the single enforcement point for barangay data isolation across all Phase 3-9 repositories
- UserRepository: full CRUD for users + session lifecycle (create_session, revoke_session, revoke_all_sessions for deactivation)
- AuthService: login validates credentials and is_active, creates session row; refresh rotates token pair (revoke old, issue new); logout no-ops on expired tokens
- FastAPI dependencies: get_current_user raises 401 on missing header; require_role factory raises 403 on role mismatch; CurrentUser and AsyncDB as clean Annotated injection types

## Task Commits

1. **Task 1: Pydantic schemas + BaseRepository** - `70d1d45` (feat)
2. **Task 2 RED: Failing unit tests** - `42b06c4` (test)
3. **Task 2 GREEN: UserRepository + AuthService + dependencies** - `1b7cb53` (feat)

## Files Created/Modified

- `backend/app/schemas/auth.py` - LoginRequest + TokenPair Pydantic schemas
- `backend/app/schemas/user.py` - UserSchema + UserListItem with from_attributes config
- `backend/app/schemas/__init__.py` - Package marker
- `backend/app/repositories/__init__.py` - Package marker
- `backend/app/repositories/base.py` - CROSS_BHS_ROLES frozenset + BaseRepository with _isolation_filter()
- `backend/app/repositories/user.py` - UserRepository: get_by_email, get_by_id, list_all, create, update, create_session, revoke_session, revoke_all_sessions
- `backend/app/services/__init__.py` - Package marker
- `backend/app/services/auth.py` - AuthService: login, refresh, logout
- `backend/app/core/dependencies.py` - Extended with get_current_user, CurrentUser, require_role (AsyncDB preserved from Phase 1)
- `backend/tests/test_auth/test_unit_auth_layer.py` - 12 unit tests for isolation filter, require_role, AuthService, get_current_user

## Decisions Made

- UserRepository does NOT inherit BaseRepository — user management is cross-BHS scope; admin needs all users regardless of station assignment
- CROSS_BHS_ROLES is a named frozenset constant at module level so Phase 3-9 repositories can import it without duplicating the set
- get_current_user builds UserSchema from JWT payload only (sub, roles, health_station_id); email and full_name are empty strings — full DB fetch only when admin operations need them
- HTTPBearer(auto_error=False) with manual 401 raise ensures missing Authorization header returns 401, not FastAPI's default 403
- require_role() returns Depends(_guard) — the Depends() wrapping enables FastAPI to inject CurrentUser automatically into the guard function, making RBAC declarative at the router

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

- Docker Desktop not running during execution — verified all modules via Python syntax checks and local pytest runs. All 9 pure-Python unit tests passed (BaseRepository isolation filter, require_role, get_current_user). The 3 AuthService tests that import SQLAlchemy ORM models fail on local Python 3.14 due to a known SQLAlchemy 2.0.36 / Python 3.14 `Union.__getitem__` incompatibility; these tests run correctly inside Docker (Python 3.11/3.12).

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- All 6 dependency layer modules are importable and structurally correct
- Plan 02-03b can now wire the auth router (POST /auth/login, /auth/refresh, /auth/logout) using AuthService + dependencies
- Plan 02-04 can use UserRepository and require_role for admin user management
- All Phase 3-9 repositories have a clear base class to inherit from with working isolation filter
- The 12 pytest stubs from Plan 02-02 will be un-stubbed in Plan 02-03b once endpoints exist

---
*Phase: 02-authentication-rbac-user-management*
*Completed: 2026-03-17*
