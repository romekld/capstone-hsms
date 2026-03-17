---
phase: 02-authentication-rbac-user-management
plan: "05"
subsystem: ui
tags: [react, typescript, vite, tailwind, shadcn, ibm-plex, frontend-scaffold]

# Dependency graph
requires:
  - phase: 02-authentication-rbac-user-management
    provides: UI-SPEC design tokens (OKLCH colors, font decisions, component inventory)
provides:
  - Vite+React+TS dev server at http://localhost:5173 with /api proxy to localhost:8000
  - shadcn/ui initialized (components.json, 17 components + login-02 + sidebar-07 blocks)
  - Design tokens in src/styles/globals.css (OKLCH palette, --status-*, --bhs-tier, --cho-tier)
  - IBM Plex Sans 400/600 + IBM Plex Mono 400 loaded via @fontsource
  - TypeScript @ path alias resolving src/* via tsconfig.app.json
affects:
  - 02-05b (AuthContext, Axios client, ProtectedRoute depend on this scaffold)
  - 02-06 (LoginPage uses login-form.tsx block from this plan)
  - 02-07 (Admin UI uses sidebar-07 block and all shadcn components)

# Tech tracking
tech-stack:
  added:
    - vite@8.0.0 (frontend build tool)
    - react@19.2.4 + react-dom@19.2.4
    - typescript@5.9.3
    - tailwindcss@4.2.1 (CSS-first @theme, no tailwind.config.ts)
    - "@tailwindcss/vite@4.2.1" (Tailwind v4 Vite plugin)
    - shadcn@4.0.8 (component library, base-nova style)
    - "@fontsource/ibm-plex-sans@5.2.8"
    - "@fontsource/ibm-plex-mono@5.2.7"
    - axios@1.13.6
    - react-router-dom@7.13.1
    - jwt-decode@4.0.0
    - lucide-react@0.577.0 (shadcn default icons)
    - tw-animate-css@1.4.0
    - class-variance-authority@0.7.1
    - clsx@2.1.1 + tailwind-merge@3.3.0
  patterns:
    - "Tailwind v4 CSS-first: @theme block in globals.css, no tailwind.config.ts"
    - "OKLCH design tokens: all colors expressed as oklch() values in :root/.dark"
    - "shadcn CSS variable mapping: @theme references var(--token) for Tailwind utility classes"
    - ".npmrc legacy-peer-deps=true for Vite 8 / @tailwindcss/vite peer compat"

key-files:
  created:
    - frontend/src/styles/globals.css (design tokens — OKLCH palette, semantic tokens, dark mode)
    - frontend/components.json (shadcn config — base-nova style, @ aliases)
    - frontend/vite.config.ts (Tailwind plugin, @ alias, /api proxy)
    - frontend/tsconfig.app.json (@ path alias, strict TypeScript)
    - frontend/.npmrc (legacy-peer-deps=true)
    - frontend/src/main.tsx (IBM Plex font imports, globals.css import)
    - frontend/src/components/ui/* (17 shadcn components)
    - frontend/src/components/login-form.tsx (login-02 block)
    - frontend/src/components/app-sidebar.tsx + nav-*.tsx (sidebar-07 block)
  modified:
    - frontend/package.json (added typecheck script, all runtime/dev deps)

key-decisions:
  - "Removed embedded .git from frontend/ — npm create vite inits a git repo; must be deleted before staging in parent repo"
  - ".npmrc legacy-peer-deps=true added — @tailwindcss/vite@4.2.1 peer requires vite^5/6/7, project uses vite@8; flag resolves without downgrading"
  - "globals.css placed at src/styles/globals.css (not src/index.css) — plan requirement; components.json updated to point there"
  - "shadcn init generated base-nova style with OKLCH tokens; globals.css overwrites with UI-SPEC OKLCH palette (CHO 2 brand colors, --status-* semantic tokens)"
  - "Sidebar tokens (--sidebar, --sidebar-primary, etc.) added to globals.css — required by sidebar-07 block, not in original UI-SPEC token list"
  - "popover tokens (--popover, --popover-foreground) added — required by shadcn dropdown-menu and select components"

patterns-established:
  - "Pattern: All color references via CSS var() — components use var(--primary), never oklch() literals"
  - "Pattern: @theme block maps --color-* Tailwind utilities to CSS var() references"
  - "Pattern: .npmrc persisted in repo — ensures consistent npm behavior for all contributors"

requirements-completed: [AUTH-01, AUTH-07]

# Metrics
duration: 13min
completed: 2026-03-17
---

# Phase 2 Plan 05: Frontend Scaffold Summary

**Vite 8 + React 19 + TypeScript + shadcn/ui base-nova initialized with IBM Plex fonts and OKLCH design tokens for CHO 2 health station branding**

## Performance

- **Duration:** 13 min
- **Started:** 2026-03-17T06:31:20Z
- **Completed:** 2026-03-17T06:44:50Z
- **Tasks:** 2
- **Files modified:** 52 files created, 3 modified

## Accomplishments

- Vite 8 + React 19 + TypeScript project scaffolded; all deps installed; `npm run typecheck` and `npm run build` both exit 0
- shadcn/ui initialized (base-nova style, OKLCH tokens); 17 UI components + login-02 + sidebar-07 blocks added
- `src/styles/globals.css` with complete UI-SPEC OKLCH token set: --primary, --background, --status-critical/warning/safe, --bhs-tier, --cho-tier, full dark mode
- IBM Plex Sans (400/600) and IBM Plex Mono (400) fonts imported in main.tsx via @fontsource
- Vite proxy: `/api` -> `http://localhost:8000` configured in vite.config.ts

## Task Commits

1. **Task 1: Scaffold Vite+React+TS, install deps, initialize shadcn** - `94db82d` (feat)
2. **Task 2: Create globals.css with UI-SPEC design tokens, update main.tsx** - `bd34937` (feat)

## Files Created/Modified

- `frontend/src/styles/globals.css` - OKLCH design tokens for all shadcn + project-specific semantic tokens
- `frontend/src/main.tsx` - IBM Plex font imports + globals.css import
- `frontend/vite.config.ts` - @tailwindcss/vite plugin, @ alias, /api proxy
- `frontend/tsconfig.app.json` - TypeScript @ path alias (src/*)
- `frontend/components.json` - shadcn config; CSS path updated to src/styles/globals.css
- `frontend/package.json` - typecheck script added; all runtime/dev dependencies
- `frontend/.npmrc` - legacy-peer-deps=true for Vite 8 compatibility
- `frontend/src/components/ui/*.tsx` - 17 shadcn components (button through tooltip)
- `frontend/src/components/login-form.tsx` - login-02 block
- `frontend/src/components/app-sidebar.tsx` + nav-*.tsx - sidebar-07 block

## Decisions Made

- Removed embedded `.git` from `frontend/` — `npm create vite` initializes a git repo in the output directory; must be deleted before the parent repo can track it as regular files.
- Added `.npmrc` with `legacy-peer-deps=true` — `@tailwindcss/vite@4.2.1` declares a peer dep on `vite@^5/6/7` but the project uses Vite 8. The flag resolves the conflict without downgrading Vite. `.npmrc` is committed so all contributors and CI use the same resolution.
- Used `src/styles/globals.css` instead of `src/index.css` — as specified in plan; `components.json` updated to point there; `src/index.css` is now effectively unused (import removed from main.tsx).
- Added sidebar tokens and popover tokens to globals.css — not in the UI-SPEC token list but required by the sidebar-07 block and shadcn dropdown/select components. Tokens follow same OKLCH convention.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Tailwind CSS not installed before shadcn init**
- **Found during:** Task 1 (shadcn init)
- **Issue:** `npx shadcn@latest init --defaults` failed with "No Tailwind CSS configuration found" — Tailwind v4 must be installed and a CSS file with `@import "tailwindcss"` must exist before shadcn can validate the setup
- **Fix:** Installed `tailwindcss @tailwindcss/vite --legacy-peer-deps`, created minimal `src/index.css` with `@import "tailwindcss"`, then ran shadcn init
- **Files modified:** `frontend/src/index.css` (temporary), `frontend/package.json`
- **Verification:** shadcn init succeeded on second attempt, `components.json` created
- **Committed in:** `94db82d` (Task 1 commit)

**2. [Rule 3 - Blocking] Path alias not in root tsconfig.json**
- **Found during:** Task 1 (shadcn init)
- **Issue:** shadcn init validates import alias from `tsconfig.json` (root), not `tsconfig.app.json`; initial setup had no paths in root
- **Fix:** Added `compilerOptions.baseUrl` and `paths: {"@/*": ["./src/*"]}` to root `tsconfig.json`
- **Files modified:** `frontend/tsconfig.json`
- **Verification:** shadcn init passed "Validating import alias" check
- **Committed in:** `94db82d` (Task 1 commit)

**3. [Rule 3 - Blocking] npm peer deps conflict (Vite 8 vs @tailwindcss/vite)**
- **Found during:** Task 1 (shadcn init dependency install step)
- **Issue:** `npm install` called by shadcn internally fails without `--legacy-peer-deps`
- **Fix:** Added `.npmrc` with `legacy-peer-deps=true` so all subsequent npm calls use the flag automatically
- **Files modified:** `frontend/.npmrc`
- **Verification:** shadcn init completed successfully
- **Committed in:** `94db82d` (Task 1 commit)

---

**Total deviations:** 3 auto-fixed (all Rule 3 - blocking)
**Impact on plan:** All three were setup/environment issues caused by Vite 8 being newer than shadcn's current peer dep range. Zero scope creep — the plan's intended outcome (Vite scaffold + shadcn initialized + design tokens) was fully delivered.

## Issues Encountered

- `npm create vite` initializes a new git repo in the output directory. Staging `frontend/` as a git submodule (detected as embedded repo) and then re-staging after removing the `.git` dir was required.
- shadcn's internal `npm install` call does not inherit `--legacy-peer-deps` from the shell command; the `.npmrc` file is the correct way to make it inherit the flag.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Plan 02-05b (AuthContext, Axios client, ProtectedRoute) can proceed — scaffold and design tokens are complete
- Plan 02-06 (LoginPage) can proceed — login-form.tsx block from login-02 is available
- Plan 02-07 (Admin UI) can proceed — sidebar-07 block, all shadcn components are available
- Frontend dev server: `cd frontend && npm run dev` starts on http://localhost:5173
- `/api` proxy configured to `http://localhost:8000` (backend must be running for API calls)

---
*Phase: 02-authentication-rbac-user-management*
*Completed: 2026-03-17*

## Self-Check: PASSED

- FOUND: frontend/src/styles/globals.css
- FOUND: frontend/components.json
- FOUND: frontend/vite.config.ts
- FOUND: frontend/src/main.tsx
- FOUND: .planning/phases/02-authentication-rbac-user-management/02-05-SUMMARY.md
- FOUND commit: 94db82d (Task 1)
- FOUND commit: bd34937 (Task 2)
