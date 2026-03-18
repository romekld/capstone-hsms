---
phase: quick
plan: 260318-eh1
subsystem: admin-ui
tags: [admin, user-management, create-user, full-page, form, react, shadcn]
completed_date: "2026-03-18T02:32:57Z"
duration: ~12 min
tasks_completed: 2
files_created:
  - frontend/src/features/admin/components/UserFormSections.tsx
  - frontend/src/pages/admin/CreateUserPage.tsx
files_modified:
  - frontend/src/pages/admin/UsersPage.tsx
  - frontend/src/App.tsx
key_decisions:
  - "Matched Select API to existing UsersPage pattern (Radix-style SelectTrigger/SelectValue) — not base-ui items prop — for consistency"
  - "Empty string value used for 'No BHS assignment' SelectItem to avoid null/undefined value type conflict with Select component"
  - "FieldSet FieldLegend uses sr-only class since section h2 provides visible label — avoids duplicate visual heading for RolesSection"
---

# Quick Task 260318-eh1: Full Redesign — Admin Create User Page

**One-liner:** Replaced cramped Sheet side-panel create flow with a dedicated /admin/users/new full-page form using four modular section components (Identity, Credentials, Roles, BHS Assignment).

## What Was Built

### UserFormSections.tsx
Four named, stateless section components that accept controlled props and delegate all state to the parent page:

- **IdentitySection** — Full Name + Email fields, h-12 touch targets, inline `FieldError` on `emailError`
- **CredentialsSection** — Password input with Eye/EyeOff show-hide toggle, h-12 height
- **RolesSection** — Checkbox list from `ROLE_OPTIONS`; system_admin exclusivity enforced (checking it unchecks all others; other roles dim with `opacity-50` when system_admin active)
- **BhsAssignmentSection** — Health station dropdown from `HEALTH_STATIONS`; returns null when `hidden` prop is true (hidden when system_admin selected)

Each section is wrapped in a `<section>` with a visible uppercase tracking-wider `h2` header.

### CreateUserPage.tsx
Full-page owner of all form state. Layout:
- Back navigation button (ghost, -ml-2 offset, ArrowLeft icon)
- Page title + description header
- Four sections stacked with `divide-y divide-border` + `pt-8` wrappers
- Sticky footer action bar: Cancel (outline) + Create User (primary, min-w-[120px], loading spinner)
- `canSubmit` gates the submit button: all required fields must be non-empty
- Error handling: 409 → inline emailError, 422 + system_admin → inline roleError, other → toast.error

### UsersPage.tsx changes
- Added `useNavigate` from react-router-dom
- Header "Create User" button: `onClick` now calls `navigate("/admin/users/new")`
- Empty-state "Create User" button: same navigate call
- `UserSheet` component, `sheetOpen` state, and all edit handlers are fully intact — edit flow unchanged

### App.tsx changes
- Imported `CreateUserPage`
- Added `<Route path="/admin/users/new" element={<CreateUserPage />} />` inside the existing `system_admin` ProtectedRoute + AppShell block, directly after `/admin/users`

## Key Decisions

1. **Select API matched to existing UsersPage pattern** — The project uses base-ui under the hood but the existing `UsersPage.tsx` already uses Radix-style Select (no `items` prop). Matched that pattern for consistency rather than switching to base-ui `items` prop.

2. **Empty string for null BHS** — Used `value=""` for the "No BHS assignment" SelectItem and converted `""` back to `null` in `onValueChange`. Avoids null type conflicts in the Select component's value prop.

3. **FieldLegend sr-only** — `RolesSection` uses an `h2` as the visible section heading and `FieldLegend variant="label" className="sr-only"` for accessibility without visual duplication.

## Deviations from Plan

None — plan executed exactly as written. The `SelectItem value=""` for null BHS is an implementation detail not specified in the plan but required for correct typing.

## Self-Check

- [x] `frontend/src/features/admin/components/UserFormSections.tsx` exists
- [x] `frontend/src/pages/admin/CreateUserPage.tsx` exists
- [x] `frontend/src/pages/admin/UsersPage.tsx` updated (navigate, not Sheet open for create)
- [x] `frontend/src/App.tsx` updated (route registered)
- [x] `npm run typecheck` — 0 errors
- [x] `npm run lint` — 0 errors
- [x] Task 1 commit: fb06ac1
- [x] Task 2 commit: 045c954

## Self-Check: PASSED
