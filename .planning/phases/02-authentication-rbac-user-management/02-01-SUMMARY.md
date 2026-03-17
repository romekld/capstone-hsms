---
phase: 02-authentication-rbac-user-management
plan: "01"
subsystem: auth
tags: [jwt, pyjwt, pwdlib, argon2, sqlalchemy, postgres, alembic, security]

# Dependency graph
requires:
  - phase: 01-infrastructure-devops
    provides: Base, TimestampMixin, health_stations table, alembic migration chain (0001/0002)

provides:
  - PyJWT-based JWT encode/decode (create_access_token, create_refresh_token, verify_token)
  - Argon2 password hashing (hash_password, verify_password)
  - SHA-256 refresh token hashing (hash_token)
  - User SQLAlchemy model (users table, roles ARRAY, is_active, health_station_id FK)
  - UserSession SQLAlchemy model (user_sessions table, token_hash, revoked_at, expires_at)
  - Alembic migration 0003 creating both tables with indexes
  - JWT settings in config.py (JWT_SECRET_KEY, JWT_ALGORITHM, expiry settings, ALLOWED_ORIGINS)

affects:
  - 02-authentication-rbac-user-management (all subsequent plans depend on User model and security primitives)
  - 03-patient-itr (User FK referenced by audit trail)
  - 04-maternal-child-health (author_id uses User.id)
  - 06-disease-surveillance (DSO user role lookup)

# Tech tracking
tech-stack:
  added:
    - pyjwt==2.12.*
    - pwdlib[argon2]==0.3.*
    - python-multipart
  patterns:
    - "JWT payload: sub=str(user_id), roles=list[str], health_station_id=int|None, exp, iat, type"
    - "Refresh tokens get jti=secrets.token_urlsafe(32) for revocation tracking"
    - "DB stores SHA-256 hash of refresh token (not the token itself)"
    - "User uses is_active flag NOT SoftDeleteMixin — avoids auto-filter breaking deactivation"
    - "lazy='raise' on all ORM relationships — forces explicit joins, prevents N+1 queries"

key-files:
  created:
    - backend/app/core/security.py
    - backend/app/models/user.py
    - backend/app/models/user_session.py
    - backend/alembic/versions/0003_users_and_sessions.py
    - backend/tests/test_auth/test_security.py
    - backend/tests/test_auth/__init__.py
  modified:
    - backend/requirements.txt
    - backend/app/core/config.py
    - backend/app/models/__init__.py

key-decisions:
  - "Replaced python-jose (abandoned, CVEs) with PyJWT 2.12 — active maintenance, no cryptography dependency"
  - "User model uses is_active Boolean instead of SoftDeleteMixin.deleted_at — deactivation is not deletion, must remain queryable"
  - "Refresh tokens stored as SHA-256 hash in user_sessions — DB breach cannot yield valid tokens"
  - "JWT payload encodes user_id as str(user_id) for sub field — JWT spec requires string subject"
  - "UserSession has no TimestampMixin — created_at explicit, no updated_at needed on session records"
  - "roles column is PostgreSQL ARRAY(TEXT) — native array avoids JOIN to roles table for simple RBAC checks"

patterns-established:
  - "security.py is the single source of truth for all token operations — never use jwt.encode/decode directly"
  - "All JWT verification raises HTTPException(401) — callers never handle jwt exceptions directly"
  - "hash_token() is used by the auth router to store refresh tokens — plain token never persisted"

requirements-completed: [AUTH-01, AUTH-02, AUTH-03, AUTH-05]

# Metrics
duration: 20min
completed: 2026-03-17
---

# Phase 2 Plan 01: Auth Foundation Summary

**PyJWT + Argon2 security primitives, User/UserSession ORM models, and Alembic migration 0003 creating users and user_sessions tables with SHA-256 refresh token hashing**

## Performance

- **Duration:** ~20 min
- **Started:** 2026-03-17T05:15:00Z
- **Completed:** 2026-03-17T05:35:05Z
- **Tasks:** 3 of 3 completed
- **Files modified:** 9

## Accomplishments

- Replaced python-jose (abandoned, CVE-affected) with PyJWT 2.12 + pwdlib[argon2]
- Created security.py with 6 functions: create_access_token, create_refresh_token, verify_token, hash_password, verify_password, hash_token
- Defined User ORM model with ARRAY(String) roles, is_active flag, and nullable health_station_id FK
- Defined UserSession ORM model with token_hash (SHA-256 stored), revoked_at, expires_at, and CASCADE FK to users
- Created Alembic migration 0003 that creates both tables with appropriate indexes
- Extended config.py with JWT_SECRET_KEY, JWT_ALGORITHM, expiry settings, and ALLOWED_ORIGINS
- Added comprehensive TDD test suite for security.py (17 tests covering round-trips, expired tokens, tampered signatures, Argon2 salting)

## Task Commits

Each task was committed atomically:

1. **Task 1: Replace python-jose with PyJWT, extend config.py, create security.py** - `fee8f6a` (feat)
2. **Task 2: Create User and UserSession ORM models** - `51978b4` (feat)
3. **Task 3: Alembic migration 0003 — users and user_sessions tables** - `ec3f2b9` (feat)

**Plan metadata:** (docs commit to follow)

_Note: Task 1 used TDD (test file written before security.py)_

## Files Created/Modified

- `backend/app/core/security.py` - JWT encode/decode + Argon2 password hashing + SHA-256 token hashing
- `backend/app/core/config.py` - Added JWT_SECRET_KEY, JWT_ALGORITHM, ACCESS_TOKEN_EXPIRE_MINUTES, REFRESH_TOKEN_EXPIRE_DAYS, ALLOWED_ORIGINS
- `backend/app/models/user.py` - User model: email unique, roles ARRAY(String), is_active, health_station_id FK nullable
- `backend/app/models/user_session.py` - UserSession model: token_hash unique, revoked_at nullable, expires_at, CASCADE FK
- `backend/app/models/__init__.py` - Added User and UserSession exports
- `backend/alembic/versions/0003_users_and_sessions.py` - Migration creating users + user_sessions tables + indexes
- `backend/requirements.txt` - Removed python-jose, added pyjwt + pwdlib[argon2] + python-multipart
- `backend/tests/test_auth/test_security.py` - 17 TDD tests for security.py
- `backend/tests/test_auth/__init__.py` - Test package init

## Decisions Made

- Used PyJWT instead of python-jose: python-jose is abandoned (last release 2022), has open CVEs, and PyJWT is the actively maintained successor with identical API surface
- User model omits SoftDeleteMixin: user deactivation (is_active=False) is semantically different from deletion — admin tools need to list inactive users, which SoftDeleteMixin's auto-filter would break
- SHA-256 hashing for refresh tokens in DB: if the user_sessions table is compromised, stolen token_hash values cannot be replayed (SHA-256 is one-way)
- JWT sub field as string: JWT spec (RFC 7519) requires "sub" to be a string — integer user_id is cast to str(user_id) on encode, callers must int() it back
- ARRAY(String) for roles: eliminates a roles JOIN table for the simple RBAC use case; PostgreSQL supports array containment operators for role checks

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

Docker Desktop was not running during execution, so docker-compose verification commands (alembic upgrade head, psql table checks) could not be run. All file-level acceptance criteria were verified via grep. Runtime verification (migration execution, table creation) must be run when Docker is started.

## User Setup Required

Before running `docker-compose exec backend alembic upgrade head`, the `.env` file must include:

```
JWT_SECRET_KEY=<strong-random-secret-at-least-32-chars>
```

The other JWT settings have defaults (HS256, 60min access, 7day refresh) but JWT_SECRET_KEY has no default and the backend will fail to start without it.

## Next Phase Readiness

- security.py exports are stable — plans 02-02 through 02-09 can import from app.core.security
- User and UserSession models are importable — auth router (02-02) can use them immediately
- Migration 0003 is ready to run — needs Docker up and `alembic upgrade head`
- Concern: JWT_SECRET_KEY must be in .env before any auth tests or server startup

## Self-Check: PASSED

All created files confirmed present on disk:
- backend/app/core/security.py: FOUND
- backend/app/models/user.py: FOUND
- backend/app/models/user_session.py: FOUND
- backend/alembic/versions/0003_users_and_sessions.py: FOUND
- backend/tests/test_auth/test_security.py: FOUND
- .planning/phases/02-authentication-rbac-user-management/02-01-SUMMARY.md: FOUND

All task commits confirmed in git log:
- fee8f6a (Task 1 — security.py + config + requirements): FOUND
- 51978b4 (Task 2 — User + UserSession models): FOUND
- ec3f2b9 (Task 3 — migration 0003): FOUND

---
*Phase: 02-authentication-rbac-user-management*
*Completed: 2026-03-17*
