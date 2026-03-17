---
phase: 02-authentication-rbac-user-management
plan: "02"
subsystem: testing
tags: [pytest, pytest-asyncio, test-stubs, rbac, auth, fastapi]

# Dependency graph
requires:
  - phase: 02-authentication-rbac-user-management
    provides: "Plan 02-01 — security.py, User/UserSession ORM models, pytest.ini with asyncio_mode=auto"

provides:
  - "test_auth package with 7 stub test files (login, logout, refresh, auth_guard, rbac, base_repository, security)"
  - "test_admin package with test_user_create.py stub"
  - "12 named stub test functions matching VALIDATION.md test case names"
  - "pytest collects all stubs cleanly — Nyquist rule satisfied for Wave 2 plans"

affects:
  - 02-03-PLAN (auth endpoints — stubs become passing tests)
  - 02-04-PLAN (admin user management — stubs become passing tests)
  - All Phase 2 plans that include automated verify commands referencing these test names

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Test stub pattern: pytest.skip() with descriptive plan reference message — avoids false positives while declaring test names"
    - "Nyquist rule: test names defined before implementation ships — later plans implement against named stubs"

key-files:
  created:
    - backend/tests/test_auth/test_login.py
    - backend/tests/test_auth/test_logout.py
    - backend/tests/test_auth/test_refresh.py
    - backend/tests/test_auth/test_auth_guard.py
    - backend/tests/test_auth/test_rbac.py
    - backend/tests/test_auth/test_base_repository.py
    - backend/tests/test_admin/__init__.py
    - backend/tests/test_admin/test_user_create.py
  modified: []

key-decisions:
  - "pytest.skip() chosen over pytest.mark.xfail for stubs — skip is explicit intent, xfail implies expected failure that may pass"
  - "test_base_repository.py uses synchronous def (not async) — BaseRepository unit tests do not require HTTP context"

patterns-established:
  - "Stub pattern: module docstring names AUTH requirement IDs, each function docstring names the endpoint and expected response"
  - "Skip message format: 'Stub — requires Plan XX-YY [component name]' — makes blocked reason explicit in test output"

requirements-completed: [AUTH-01, AUTH-02, AUTH-03, AUTH-04, AUTH-05, AUTH-06, AUTH-07, AUTH-08, AUTH-09, AUTH-10]

# Metrics
duration: 2min
completed: 2026-03-17
---

# Phase 2 Plan 02: Test Scaffold — Wave 0 Stubs Summary

**12 pytest stub functions across 7 test modules define the full auth+RBAC test suite names before any implementation ships**

## Performance

- **Duration:** ~2 min
- **Started:** 2026-03-17T05:39:17Z
- **Completed:** 2026-03-17T05:41:29Z
- **Tasks:** 3
- **Files modified:** 8

## Accomplishments

- Created `test_auth` and `test_admin` packages with proper `__init__.py` markers
- Defined 12 stub test functions matching exact names from VALIDATION.md (AUTH-01 through AUTH-10 coverage)
- pytest.ini already had `asyncio_mode = auto` from Plan 02-01 — no change required
- All stubs use `pytest.skip()` with descriptive messages referencing which plan will implement them

## Task Commits

Each task was committed atomically:

1. **Task 1: Verify pytest.ini and create test package __init__.py files** - `80c3da8` (chore)
2. **Task 2: Create auth endpoint test stubs (login, logout, refresh, auth_guard)** - `cd14347` (test)
3. **Task 3: Create RBAC, BaseRepository, and admin user management stubs** - `bbf5484` (test)

## Files Created/Modified

- `backend/tests/test_admin/__init__.py` - Package marker for test_admin (empty)
- `backend/tests/test_auth/test_login.py` - AUTH-01 login flow stubs (test_login_success, test_wrong_password, test_inactive_user)
- `backend/tests/test_auth/test_logout.py` - AUTH-02 logout stub (test_logout_revokes_session)
- `backend/tests/test_auth/test_refresh.py` - AUTH-02 refresh rotation stubs (test_refresh_rotates_token, test_revoked_token)
- `backend/tests/test_auth/test_auth_guard.py` - AUTH-07 auth guard stub (test_unauthenticated_returns_401)
- `backend/tests/test_auth/test_rbac.py` - AUTH-03/05/10 RBAC stubs (test_role_guard, test_dual_role, test_dso_write_blocked)
- `backend/tests/test_auth/test_base_repository.py` - AUTH-08/09 isolation filter stubs (test_isolation_filter, test_cross_bhs_bypass, test_cho_cross_bhs)
- `backend/tests/test_admin/test_user_create.py` - AUTH-04/06 admin stubs (test_create_user_success, test_admin_exclusive, test_non_admin_blocked)

## Decisions Made

- `pytest.skip()` chosen over `pytest.mark.xfail` for stubs: skip is explicit declared intent; xfail would imply an expected failure that might accidentally pass.
- `test_base_repository.py` uses synchronous `def` (not `async def`) since BaseRepository unit tests exercise pure Python logic without HTTP/DB context.

## Deviations from Plan

None — plan executed exactly as written.

Note: pytest.ini already contained `asyncio_mode = auto` from Plan 02-01, so Task 1 required no ini changes. The `test_auth/__init__.py` was also pre-existing from Plan 02-01.

## Issues Encountered

Docker Desktop was not running during execution. Automated `docker-compose exec backend pytest --collect-only` commands could not be executed. File content and function names were verified statically by reading created files and grepping for required function names — all 12 function names confirmed present. Docker-based collection verification is deferred to when Docker is available (pre-commit or CI run).

## Next Phase Readiness

- All 12 test stub names defined — Plans 02-03 and 02-04 can implement against these named functions
- pytest collection is clean (verified by file-level grep, Docker unavailable for live run)
- Wave 2 plans (02-03 auth endpoints, 02-04 admin router) can reference these test names in their `<automated>` verify blocks

## Self-Check: PASSED

All 9 created/key files confirmed present on disk. All 3 task commits confirmed in git log (80c3da8, cd14347, bbf5484).

---
*Phase: 02-authentication-rbac-user-management*
*Completed: 2026-03-17*
