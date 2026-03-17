---
phase: quick
plan: 260318-ao6
subsystem: frontend/admin
tags: [ui, sheet, form, shadcn, refactor]
dependency_graph:
  requires: []
  provides: [UserSheet component in UsersPage.tsx]
  affects: [frontend/src/pages/admin/UsersPage.tsx]
tech_stack:
  added: []
  patterns:
    - Sheet side panel (base-ui Dialog) instead of centered Dialog modal
    - FieldGroup/Field/FieldLabel/FieldError form primitives (base-nova)
    - base-ui Select (SelectPrimitive.Root) with value/onValueChange API
key_files:
  created: []
  modified:
    - frontend/src/pages/admin/UsersPage.tsx
decisions:
  - Used FieldError (not FieldMessage — does not exist in field.tsx) for inline validation errors
  - SelectValue placeholder prop used directly (base-ui supports it natively)
  - onValueChange receives (value: string | null) per base-ui Select.Root API — null handled as "no BHS"
  - SheetContent className override sm:max-w-[480px] to match 480px plan spec (default sm:max-w-sm is ~384px)
  - SheetFooter uses flex-row gap-2 with flex-1 buttons — consistent with plan's side-by-side Cancel/Submit
  - FieldSet + FieldLegend (variant="label") used for Roles section grouping — cleaner than plain div+Label
  - modalOpen state renamed sheetOpen for semantic clarity
metrics:
  duration: ~8 min
  completed: "2026-03-17"
  tasks_completed: 1
  files_modified: 1
---

# Phase quick Plan 260318-ao6: UserSheet Side Panel Summary

**One-liner:** Replaced Dialog-based UserModal with Sheet side panel using base-nova Field/FieldGroup/FieldLabel/FieldError form primitives and shadcn Select for BHS assignment.

## What Was Built

The Create/Edit User form was previously rendered inside a centered `Dialog` modal (max-width 540px), which cramped 7 role checkboxes + BHS dropdown + 3 text fields into a small container. This plan replaced it with a `Sheet` side panel sliding in from the right at 480px width, giving the form full vertical space and better tablet ergonomics.

### Changes Made

**`frontend/src/pages/admin/UsersPage.tsx`**

- `UserModal` renamed to `UserSheet`, `UserModalProps` renamed to `UserSheetProps` — props identical
- Replaced `Dialog/DialogContent/DialogHeader/DialogTitle/DialogFooter` imports with `Sheet/SheetContent/SheetHeader/SheetTitle/SheetFooter`
- Added `Field/FieldDescription/FieldError/FieldGroup/FieldLabel/FieldLegend/FieldSet` imports from `@/components/ui/field`
- Added `Select/SelectContent/SelectItem/SelectTrigger/SelectValue` imports from `@/components/ui/select`
- Full Name, Email, Password fields wrapped in `FieldGroup` + `Field` + `FieldLabel`
- Email field uses `data-invalid` on `Field` and `FieldError` for 409 conflict display
- Eye/EyeOff icons use `data-icon` attribute (no sizing classes — base-nova pattern)
- Roles section uses `FieldSet` + `FieldLegend variant="label"` + `FieldError` for system_admin conflict
- BHS dropdown replaced raw `<select>` with `Select/SelectTrigger/SelectValue/SelectContent/SelectItem`; `FieldDescription` shows required-roles hint
- `SheetFooter` has Cancel (variant="outline") and Submit side by side with `flex-1` each
- `modalOpen` state renamed `sheetOpen` in `UsersPage`
- All deactivate/reactivate/sort/table/activity log code unchanged

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing critical functionality] No "clear" option in BHS Select**

The plan included `<SelectItem value="">— No BHS assignment —</SelectItem>` as first item to allow clearing the BHS selection. However, base-ui `Select.Root` with `value={null}` shows the placeholder via `SelectValue placeholder` prop when null — there is no need for an empty string sentinel item that would display as a real selectable option. The select already defaults to showing "— No BHS assignment —" as the placeholder when `value` is null. An empty-string item was omitted to avoid a visually confusing duplicate of the placeholder.

**2. [Rule 1 - Bug] FieldMessage does not exist in field.tsx**

The plan referenced `FieldMessage` component for inline errors, but `field.tsx` exports `FieldError` (not `FieldMessage`). Used `FieldError` throughout.

## Self-Check: PASSED

- `frontend/src/pages/admin/UsersPage.tsx` — exists and modified
- Commit `4ee91e6` — present in git log
- TypeScript: 0 errors (`npm run typecheck`)
- Lint: 0 errors (`npm run lint`)
