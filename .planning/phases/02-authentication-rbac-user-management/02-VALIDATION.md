---
phase: 2
slug: authentication-rbac-user-management
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-16
---

# Phase 2 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | pytest 8.x + pytest-asyncio 0.24.x |
| **Config file** | `backend/pytest.ini` — Wave 0 creates if absent |
| **Quick run command** | `docker-compose exec backend pytest tests/test_auth/ -x -q` |
| **Full suite command** | `docker-compose exec backend pytest -x -q` |
| **Estimated runtime** | ~30 seconds |

---

## Sampling Rate

- **After every task commit:** Run `docker-compose exec backend pytest tests/test_auth/ -x -q`
- **After every plan wave:** Run `docker-compose exec backend pytest -x -q`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 2-01 | 01 | 0 | AUTH-01 | integration | `pytest tests/test_auth/test_login.py -x` | ❌ W0 | ⬜ pending |
| 2-02 | 01 | 0 | AUTH-01 | integration | `pytest tests/test_auth/test_login.py::test_wrong_password -x` | ❌ W0 | ⬜ pending |
| 2-03 | 01 | 0 | AUTH-01 | integration | `pytest tests/test_auth/test_login.py::test_inactive_user -x` | ❌ W0 | ⬜ pending |
| 2-04 | 01 | 0 | AUTH-02 | integration | `pytest tests/test_auth/test_logout.py -x` | ❌ W0 | ⬜ pending |
| 2-05 | 01 | 0 | AUTH-02 | integration | `pytest tests/test_auth/test_refresh.py::test_revoked_token -x` | ❌ W0 | ⬜ pending |
| 2-06 | 01 | 1 | AUTH-03 | unit | `pytest tests/test_auth/test_rbac.py::test_role_guard -x` | ❌ W0 | ⬜ pending |
| 2-07 | 01 | 1 | AUTH-04 | integration | `pytest tests/test_admin/test_user_create.py::test_admin_exclusive -x` | ❌ W0 | ⬜ pending |
| 2-08 | 01 | 1 | AUTH-05 | unit | `pytest tests/test_auth/test_rbac.py::test_dual_role -x` | ❌ W0 | ⬜ pending |
| 2-09 | 02 | 1 | AUTH-06 | integration | `pytest tests/test_admin/test_user_create.py -x` | ❌ W0 | ⬜ pending |
| 2-10 | 02 | 1 | AUTH-06 | integration | `pytest tests/test_admin/test_user_create.py::test_non_admin_blocked -x` | ❌ W0 | ⬜ pending |
| 2-11 | 01 | 1 | AUTH-07 | integration | `pytest tests/test_auth/test_auth_guard.py -x` | ❌ W0 | ⬜ pending |
| 2-12 | 01 | 1 | AUTH-08 | unit | `pytest tests/test_auth/test_base_repository.py::test_isolation_filter -x` | ❌ W0 | ⬜ pending |
| 2-13 | 01 | 1 | AUTH-08 | unit | `pytest tests/test_auth/test_base_repository.py::test_cross_bhs_bypass -x` | ❌ W0 | ⬜ pending |
| 2-14 | 01 | 1 | AUTH-09 | unit | `pytest tests/test_auth/test_base_repository.py::test_cho_cross_bhs -x` | ❌ W0 | ⬜ pending |
| 2-15 | 01 | 1 | AUTH-10 | unit | `pytest tests/test_auth/test_rbac.py::test_dso_write_blocked -x` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `backend/tests/test_auth/__init__.py` — test package init
- [ ] `backend/tests/test_auth/test_login.py` — stubs for AUTH-01 login flow
- [ ] `backend/tests/test_auth/test_logout.py` — stubs for AUTH-02 logout/revocation
- [ ] `backend/tests/test_auth/test_refresh.py` — stubs for AUTH-02 refresh rotation
- [ ] `backend/tests/test_auth/test_rbac.py` — stubs for AUTH-03, AUTH-05, AUTH-10 role guards
- [ ] `backend/tests/test_auth/test_auth_guard.py` — stubs for AUTH-07 unauthenticated → 401
- [ ] `backend/tests/test_auth/test_base_repository.py` — stubs for AUTH-08, AUTH-09 isolation filter
- [ ] `backend/tests/test_admin/__init__.py` — test package init
- [ ] `backend/tests/test_admin/test_user_create.py` — stubs for AUTH-04, AUTH-06
- [ ] `backend/pytest.ini` — verify `asyncio_mode = auto` exists; create if absent

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Login page renders, form submits, redirect to /dashboard on success | AUTH-01 | No e2e framework in Phase 2; Playwright not set up yet | Open http://localhost:5173/login, enter valid credentials, verify redirect to /dashboard |
| Logout clears tokens, redirect to /login | AUTH-02 | No e2e framework | Click logout in sidebar, verify redirect to /login, verify localStorage has no refresh token |
| system_admin redirects to /admin/users post-login | AUTH-06 | No e2e framework | Log in as system_admin, verify URL is /admin/users |
| Non-admin role redirects to /dashboard post-login | AUTH-07 | No e2e framework | Log in as nurse, verify URL is /dashboard |
| system_admin checkbox exclusivity in create user modal | AUTH-04 | No e2e framework | Open create user modal, check system_admin, verify all other checkboxes disabled |
| Sidebar shows only role-appropriate nav links | AUTH-03 | No e2e framework | Log in as BHW, verify admin nav links are absent |
| Deactivation AlertDialog shows user name | AUTH-06 | No e2e framework | Click deactivate on a user, verify AlertDialog shows full name |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
