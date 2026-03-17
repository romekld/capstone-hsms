---
phase: "02"
plan: "03b"
subsystem: auth-http-layer
tags: [auth, fastapi, cors, rbac, tests]
dependency_graph:
  requires: [02-03a]
  provides: [auth-http-endpoints, cors-middleware, admin-router-stub]
  affects: [02-04, all-subsequent-plans]
tech_stack:
  added: []
  patterns: [APIRouter, CORSMiddleware, ASGITransport, dependency_overrides, DeclarativeBase unit test]
key_files:
  created:
    - backend/app/routers/__init__.py
    - backend/app/routers/auth.py
    - backend/app/routers/admin.py
  modified:
    - backend/app/main.py
    - backend/tests/test_auth/test_login.py
    - backend/tests/test_auth/test_logout.py
    - backend/tests/test_auth/test_refresh.py
    - backend/tests/test_auth/test_rbac.py
    - backend/tests/test_auth/test_auth_guard.py
    - backend/tests/test_auth/test_base_repository.py
decisions:
  - "Admin router stub (GET/POST /admin/users) created in 02-03b to unblock RBAC and auth-guard tests — full implementation deferred to Plan 02-04"
  - "test_rbac.py uses dependency_overrides[get_current_user] for role injection — avoids live DB dependency for RBAC logic tests"
  - "test_base_repository.py uses SQLAlchemy DeclarativeBase with extend_existing to create an isolated fake model — no DB needed for isolation filter unit tests"
metrics:
  duration_minutes: 3
  completed_date: "2026-03-17"
  tasks_completed: 2
  files_changed: 10
requirements_satisfied: [AUTH-01, AUTH-02, AUTH-03, AUTH-05, AUTH-07, AUTH-08, AUTH-09, AUTH-10]
---

# Phase 02 Plan 03b: Auth HTTP Layer and Test Suite Summary

**One-liner:** FastAPI auth router (POST /auth/login|refresh|logout) wired with CORS at /api prefix; all 9 Wave 0 auth test stubs replaced with real assertions.

## Tasks Completed

| Task | Name | Commit | Key Files |
|------|------|--------|-----------|
| 1 | Auth router and CORS middleware registration | 99d2fdf | routers/auth.py, main.py |
| 2 | Convert 9 Wave 0 auth test stubs to passing tests | 3dd21c1 | test_login.py, test_logout.py, test_refresh.py, test_rbac.py, test_auth_guard.py, test_base_repository.py, routers/admin.py |

## What Was Built

### Task 1: Auth router and main.py CORS + router registration

Created `backend/app/routers/auth.py` with three endpoints:
- `POST /api/auth/login` — delegates to `AuthService.login()`
- `POST /api/auth/refresh` — delegates to `AuthService.refresh()`
- `POST /api/auth/logout` — delegates to `AuthService.logout()`, returns 204

Updated `backend/app/main.py`:
- Added `CORSMiddleware` using `settings.ALLOWED_ORIGINS`
- Registered auth router at `/api` prefix

### Task 2: Convert all 9 auth test stubs to real tests

Replaced all `pytest.skip()` stubs with real assertions:

- **test_login.py** (3 tests): valid login returns 200 + token pair; wrong password returns 401; inactive user returns 401
- **test_logout.py** (1 test): POST /auth/logout sets `revoked_at` on the `user_sessions` row; subsequent refresh returns 401
- **test_refresh.py** (2 tests): refresh rotates token (new pair issued, old revoked); revoked token returns 401
- **test_rbac.py** (3 tests): BHW blocked from system_admin route (403); dual-role user passes both nurse and DSO guards; DSO blocked from POST /admin/users (403)
- **test_auth_guard.py** (1 test): unauthenticated GET /api/admin/users returns 401
- **test_base_repository.py** (3 tests): isolation filter adds WHERE for nurse; skips WHERE for CHO; CROSS_BHS_ROLES content verified

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Created minimal admin router stub**
- **Found during:** Task 2
- **Issue:** `test_rbac.py` (test_role_guard, test_dso_write_blocked) and `test_auth_guard.py` (test_unauthenticated_returns_401) reference `/api/admin/users`. Without this route registered in the app, those tests would return 404 instead of the expected 403/401, causing test failures.
- **Fix:** Created `backend/app/routers/admin.py` with minimal GET and POST `/admin/users` endpoints protected by `require_role(['system_admin'])`. Both endpoints have `TODO(Plan 02-04)` comments for full implementation. Registered in main.py.
- **Files modified:** `backend/app/routers/admin.py`, `backend/app/main.py`
- **Commit:** 3dd21c1

## Decisions Made

1. **Admin router stub in 02-03b:** The RBAC tests require a protected endpoint that returns 403/401 correctly. Creating a minimal stub now unblocks the full auth test suite without building out the complete admin service prematurely. Plan 02-04 will replace the stub with the full implementation.

2. **dependency_overrides for RBAC tests:** `test_rbac.py` uses `app.dependency_overrides[get_current_user]` to inject specific user roles without hitting the database. This makes RBAC logic tests fast, isolated, and independent of test data setup.

3. **DeclarativeBase unit test for isolation filter:** `test_base_repository.py` creates a `_FakeModel` using SQLAlchemy's `DeclarativeBase` with `extend_existing=True`. This tests the `_isolation_filter()` logic at the SQL compilation level without needing a live database connection.

## Self-Check: PASSED

All files exist and both task commits are present in git log.
