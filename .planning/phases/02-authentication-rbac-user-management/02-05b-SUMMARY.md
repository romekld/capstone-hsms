---
phase: 02-authentication-rbac-user-management
plan: "05b"
subsystem: auth
tags: [react, axios, jwt, react-router, shadcn, typescript, rbac]

# Dependency graph
requires:
  - phase: 02-authentication-rbac-user-management
    provides: "Plan 02-05: Vite+React+TS scaffold, shadcn init, IBM Plex fonts, OKLCH globals.css, sidebar-07 block"

provides:
  - "Axios client with in-memory access token + 401 refresh queue (isRefreshing + failedQueue)"
  - "Token storage helpers: refresh token in localStorage, access token never persisted"
  - "AuthContext with user, login(), logout(), isLoading — async/await restoreSession on mount"
  - "useAuth and useIsAuthorized hooks"
  - "ProtectedRoute component: loading spinner, /login redirect, /unauthorized role guard"
  - "App.tsx router skeleton: /login, /dashboard, /admin/users wired into AppShell via Outlet"
  - "main.tsx wrapped in AuthProvider"
  - "AppShell with shadcn sidebar-07 (base-ui render prop), role-filtered nav links, Sign Out footer"

affects:
  - "02-06: LoginPage and DashboardPage consume AuthContext, ProtectedRoute, Axios"
  - "02-07: UsersPage renders inside AppShell; admin API calls go through Axios interceptor"
  - "All future phases: Axios interceptor handles token refresh transparently"

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Access token in memory only (React Context module variable); refresh token in localStorage"
    - "Axios 401 interceptor with shared promise queue to prevent concurrent refresh race conditions"
    - "AuthContext useEffect uses async/await inside restoreSession — no .then() chains"
    - "SidebarMenuButton uses base-ui render prop pattern (not Radix asChild)"
    - "ProtectedRoute with Outlet — protected pages render inside AppShell, not alongside it"
    - "Role filtering: NAV_ITEMS array filtered by user.roles at render time"

key-files:
  created:
    - frontend/src/features/auth/types.ts
    - frontend/src/features/auth/api.ts
    - frontend/src/lib/auth.ts
    - frontend/src/lib/axios.ts
    - frontend/src/contexts/AuthContext.tsx
    - frontend/src/hooks/useAuth.ts
    - frontend/src/components/ProtectedRoute.tsx
    - frontend/src/layouts/AppShell.tsx
  modified:
    - frontend/src/App.tsx
    - frontend/src/main.tsx

key-decisions:
  - "SidebarMenuButton uses base-ui render prop (render={<NavLink to=... />}) not asChild — this shadcn installation uses @base-ui/react, not Radix"
  - "RetryableConfig extends InternalAxiosRequestConfig to type _retry flag — avoids casting errors with strict TypeScript"
  - "AppShell stub committed in Task 2 to allow App.tsx typecheck before Task 3 full implementation"
  - "void handleLogout() in onClick to satisfy @typescript-eslint/no-floating-promises without blocking render"

patterns-established:
  - "Pattern: Axios interceptor with isRefreshing flag serializes concurrent 401 refresh calls"
  - "Pattern: NavItem.roles empty array = all authenticated roles; non-empty = restricted to those roles"

requirements-completed:
  - AUTH-01
  - AUTH-02
  - AUTH-07

# Metrics
duration: 7min
completed: 2026-03-17
---

# Phase 2 Plan 05b: Auth Infrastructure Layer Summary

**React auth infrastructure: Axios 401 refresh interceptor, AuthContext with async session restore, ProtectedRoute, and AppShell shadcn sidebar-07 with role-filtered navigation**

## Performance

- **Duration:** 7 min
- **Started:** 2026-03-17T06:49:29Z
- **Completed:** 2026-03-17T06:56:38Z
- **Tasks:** 3
- **Files modified:** 10

## Accomplishments

- Axios client with in-memory access token and shared promise queue prevents concurrent 401 refresh race conditions
- AuthContext uses async/await restoreSession on mount (no `.then()` chains) with JWT decode for user hydration
- ProtectedRoute with loading state, unauthenticated redirect, and role-based unauthorized redirect
- AppShell with shadcn sidebar-07 using base-ui `render` prop pattern for NavLink integration; role-filtered nav (Dashboard for non-admin, Users for system_admin)
- `npm run typecheck` and `npm run build` both exit 0

## Task Commits

Each task was committed atomically:

1. **Task 1: Auth types, token storage, Axios client, auth API module** - `586c695` (feat)
2. **Task 2: AuthContext, useAuth, ProtectedRoute, App router skeleton, AuthProvider wrap** - `bcdd4c9` (feat)
3. **Task 3: AppShell with shadcn sidebar-07 and role-filtered navigation** - `32e403f` (feat)

## Files Created/Modified

- `frontend/src/features/auth/types.ts` - LoginRequest, TokenResponse, UserSchema interfaces
- `frontend/src/features/auth/api.ts` - loginApi (JWT decode for user), logoutApi
- `frontend/src/lib/auth.ts` - Refresh token localStorage helpers; access token never persisted
- `frontend/src/lib/axios.ts` - Axios instance with request interceptor (Bearer token) and 401 response interceptor (refresh queue)
- `frontend/src/contexts/AuthContext.tsx` - AuthProvider with async restoreSession, login/logout
- `frontend/src/hooks/useAuth.ts` - useAuth + useIsAuthorized
- `frontend/src/components/ProtectedRoute.tsx` - Loading spinner, /login, /unauthorized guards
- `frontend/src/layouts/AppShell.tsx` - Sidebar-07 layout with role-filtered nav and Sign Out footer
- `frontend/src/App.tsx` - BrowserRouter skeleton: /login, /dashboard, /admin/users with ProtectedRoute + AppShell
- `frontend/src/main.tsx` - Wrapped App in AuthProvider

## Decisions Made

- **base-ui render prop instead of asChild:** This shadcn installation uses `@base-ui/react/use-render`, not Radix UI slots. `SidebarMenuButton` does not support `asChild` — using `render={<NavLink />}` pattern instead.
- **RetryableConfig type:** Extended `InternalAxiosRequestConfig` with `_retry?: boolean` to avoid TypeScript cast errors under strict mode.
- **AppShell stub in Task 2:** Created a minimal AppShell stub during Task 2 so App.tsx could typecheck before Task 3 built the full implementation.
- **void handleLogout() pattern:** Used `onClick={() => void handleLogout()}` to handle async click handler without floating-promise lint errors.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed axios.ts type errors under strict TypeScript**
- **Found during:** Task 1 (TypeScript typecheck)
- **Issue:** Plan's axios.ts code used `Parameters<typeof api>[0]` cast which TypeScript rejected under strict mode because the custom config type did not overlap with Axios's expected string type
- **Fix:** Introduced `RetryableConfig extends InternalAxiosRequestConfig` and typed the error handler as `error: unknown` with a typed cast; removed the incorrect `Parameters` cast
- **Files modified:** `frontend/src/lib/axios.ts`
- **Verification:** `npm run typecheck` exits 0
- **Committed in:** `586c695` (Task 1 commit)

**2. [Rule 1 - Bug] Fixed SidebarMenuButton asChild error**
- **Found during:** Task 3 (TypeScript typecheck)
- **Issue:** Plan's AppShell used `SidebarMenuButton asChild` but this shadcn installation uses `@base-ui/react` which exposes a `render` prop, not Radix `asChild`
- **Fix:** Changed to `SidebarMenuButton render={<NavLink to={item.href} ... />}` pattern as used in the installed `nav-main.tsx` example
- **Files modified:** `frontend/src/layouts/AppShell.tsx`
- **Verification:** `npm run typecheck && npm run build` both exit 0
- **Committed in:** `32e403f` (Task 3 commit)

---

**Total deviations:** 2 auto-fixed (2 Rule 1 bugs — TypeScript strict mode incompatibilities)
**Impact on plan:** Both fixes resolved TypeScript strict-mode incompatibilities introduced by the base-ui shadcn variant. No scope creep.

## Issues Encountered

None beyond the auto-fixed TypeScript issues above.

## Next Phase Readiness

- Plan 02-06 (LoginPage) can import `useAuth`, `loginApi`, and render inside the existing `/login` route
- Plan 02-07 (UsersPage) can import `useAuth` and render inside `/admin/users` with the AppShell sidebar already wired
- AppShell placeholder pages (`LoginPage`, `DashboardPage`, `UsersPage`) in App.tsx are clearly marked as "Plan 02-06/02-07" comments

---
*Phase: 02-authentication-rbac-user-management*
*Completed: 2026-03-17*

## Self-Check: PASSED

All created files verified on disk. All task commits verified in git log.

| Check | Result |
|-------|--------|
| features/auth/types.ts | FOUND |
| features/auth/api.ts | FOUND |
| lib/auth.ts | FOUND |
| lib/axios.ts | FOUND |
| contexts/AuthContext.tsx | FOUND |
| hooks/useAuth.ts | FOUND |
| components/ProtectedRoute.tsx | FOUND |
| layouts/AppShell.tsx | FOUND |
| 02-05b-SUMMARY.md | FOUND |
| commit 586c695 | FOUND |
| commit bcdd4c9 | FOUND |
| commit 32e403f | FOUND |
