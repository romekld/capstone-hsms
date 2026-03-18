---
phase: quick-260318-ew3
plan: 01
subsystem: frontend/admin
tags: [ui, routing, edit-user, sheet-removal]
dependency_graph:
  requires: [CreateUserPage, UserFormSections, admin/api.ts]
  provides: [EditUserPage, getUser, /admin/users/:id/edit route]
  affects: [UsersPage, App.tsx]
tech_stack:
  added: []
  patterns: [full-page edit form, react-router useParams, skeleton loading, disabled input for read-only field]
key_files:
  created:
    - frontend/src/pages/admin/EditUserPage.tsx
  modified:
    - frontend/src/features/admin/api.ts
    - frontend/src/App.tsx
    - frontend/src/pages/admin/UsersPage.tsx
decisions:
  - Inlined Identity section in EditUserPage rather than reusing IdentitySection — IdentitySection always renders an editable email input; edit mode requires disabled/read-only email, so a custom inline section avoids modifying the shared component
  - Email shown as disabled Input with FieldDescription "Email cannot be changed after account creation." — visible to user but not editable
  - canSubmit checks fullName + roles only (no email/password) — both are optional on edit
  - UserSheet component and all its imports removed entirely from UsersPage — no dead code left behind
metrics:
  duration: ~12min
  completed: 2026-03-18
  tasks_completed: 2
  files_modified: 4
---

# Quick Task 260318-ew3 Summary

**One-liner:** Replaced edit-user Sheet/drawer with a dedicated /admin/users/:id/edit full-page form that mirrors CreateUserPage, with pre-populated fields and read-only email display.

## Tasks Completed

| # | Task | Commit | Files |
|---|------|--------|-------|
| 1 | Add getUser API function and create EditUserPage | 8537de0 | api.ts, EditUserPage.tsx |
| 2 | Register route and remove UserSheet from UsersPage | 076bee2 | App.tsx, UsersPage.tsx |

## What Was Built

**EditUserPage** (`frontend/src/pages/admin/EditUserPage.tsx`):
- Full-page form at `/admin/users/:id/edit` reading `id` from `useParams`
- Fetches user via `getUser(id)` on mount, pre-populates all fields
- Skeleton loading state (3 section skeletons) while fetching
- Destructive error banner if fetch fails
- Inline Identity section with editable Full Name + disabled Email Input (with helper text)
- CredentialsSection reused; "leave blank to keep current" note added below it
- RolesSection and BhsAssignmentSection reused and pre-populated
- Sticky footer with Cancel and Save Changes buttons matching CreateUserPage exactly
- On 422 system_admin conflict: sets roleError; on other errors: toast

**getUser** (`frontend/src/features/admin/api.ts`):
- `GET /admin/users/:id` returning `UserListItem`

**Route** (`frontend/src/App.tsx`):
- `/admin/users/:id/edit` registered inside system_admin ProtectedRoute block

**UsersPage cleanup** (`frontend/src/pages/admin/UsersPage.tsx`):
- Removed `UserSheet` function (248 lines), all Sheet/Field/Input/Select/Label/Eye/EyeOff imports
- Removed `sheetOpen`/`editTarget` useState declarations
- Edit DropdownMenuItem now calls `navigate(`/admin/users/${user.id}/edit`)`
- Removed `createUser`/`updateUser` from api imports (no longer used here)

## Deviations from Plan

None — plan executed exactly as written.

## Self-Check

- [x] `frontend/src/pages/admin/EditUserPage.tsx` exists
- [x] `frontend/src/features/admin/api.ts` exports `getUser`
- [x] `frontend/src/App.tsx` has `/admin/users/:id/edit` route
- [x] `frontend/src/pages/admin/UsersPage.tsx` has no UserSheet, no sheetOpen/editTarget
- [x] `npm run typecheck` exits 0
- [x] `npm run lint` exits 0
- [x] Commits 8537de0 and 076bee2 exist

## Self-Check: PASSED
