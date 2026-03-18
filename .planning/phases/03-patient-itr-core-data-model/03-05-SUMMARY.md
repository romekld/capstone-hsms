---
phase: 03-patient-itr-core-data-model
plan: "05"
subsystem: frontend-patient-profile
tags: [react, typescript, shadcn-ui, patient-itr, clinical-workflow]
dependency_graph:
  requires: [03-02, 03-03]
  provides: [patient-profile-page, consultation-sheet]
  affects: [frontend-routing, app-shell]
tech_stack:
  added: []
  patterns:
    - Sheet side panel for consultation entry (CONTEXT.md locked decision)
    - useParams for dynamic route patient ID extraction
    - Live BMI computation from weight/height inputs
    - Cross-BHS access control at component level (isViewOnly check)
    - refreshConsultations callback pattern for Sheet-to-table sync
key_files:
  created:
    - frontend/src/pages/patients/PatientProfilePage.tsx
    - frontend/src/pages/patients/ConsultationSheet.tsx
  modified:
    - frontend/src/App.tsx
    - frontend/src/layouts/AppShell.tsx
decisions:
  - "Sheet side panel used for Add Consultation per CONTEXT.md locked decision (not a dedicated page)"
  - "Card-style header built with rounded-xl border div (no shadcn card.tsx installed)"
  - "Native textarea element used (no textarea.tsx in UI components) styled to match Input"
  - "AppShell resolvePageTitle function added to handle dynamic /patients/:id pathname matching"
  - "refreshConsultations passed as onSuccess callback to ConsultationSheet to avoid page navigation on save"
metrics:
  duration: "5 min"
  completed_date: "2026-03-18"
  tasks_completed: 1
  files_changed: 4
---

# Phase 3 Plan 05: Patient Profile Page and Consultation Sheet Summary

**One-liner:** Patient profile page at `/patients/:id` with identity header card, sortable consultations table, and Add Consultation Sheet side panel with 7-field vitals grid, live BMI, and collapsible additional vitals.

## What Was Built

### PatientProfilePage (`frontend/src/pages/patients/PatientProfilePage.tsx`)

Patient profile page at `/patients/:id` providing the core clinical record view:

- **Header card**: Displays birthdate (formatted), sex badge, computed age, and health station. Uses styled div with CSS variables (`--card` background, `--border` border) since shadcn `card.tsx` is not installed.
- **Possible Duplicate badge**: Renders with `--status-critical` styling when `patient.possible_duplicate` is true.
- **View Only badge**: Shown when a BHS-level role (nurse/midwife/physician) views a patient from a different BHS (`patient.health_station_id !== user.health_station_id`). Uses `--status-warning` styling.
- **Consultations tab**: Single tab per CONTEXT.md (no placeholder tabs). Sortable date column (click to toggle asc/desc). Table columns: Date, Chief Complaint, Diagnosis, Referring To, Recorded By.
- **Add Consultation button**: Hidden for read-only roles and cross-BHS access (`canAddConsultation` flag). Opens Sheet side panel via `setShowConsultationSheet(true)`.
- **Empty state**: "No consultations recorded" heading + "Add the first consultation record for this patient." body text per UI-SPEC copywriting contract.
- **Pagination**: 20 per page, shadcn Pagination component.
- **Loading state**: Skeleton for header card + skeleton table rows.
- **Error state**: Patient not found (404) shows message + "Back to Patients" link.
- **Breadcrumb**: "Patients > [Patient Name]" with link to `/patients`.
- **Page entrance animation**: `login-page-enter` class applied to root div.

### ConsultationSheet (`frontend/src/pages/patients/ConsultationSheet.tsx`)

Sheet side panel (right side, `sm:max-w-[540px]`) for consultation entry:

- **Header**: SheetTitle "New Consultation" + SheetDescription showing patient name and BHS Badge confirmation strip.
- **Section 1 — Chief Complaint**: Required textarea (3 rows, autofocus), inline error "Chief complaint is required." on empty submit.
- **Section 2 — Vitals**: All 7 discrete fields in card-style container (`--card` background, `--border` border):
  - Blood Pressure: paired systolic/diastolic inputs with "/" separator and "mmHg" unit
  - Heart Rate (bpm), Respiratory Rate (breaths/min), Temperature (°C), Weight (kg), Height (cm)
  - All inputs: `inputMode="numeric"`, `min-h-[48px]`, `text-base` (16px) for gloved-hand ergonomics
  - **BMI computed display**: Read-only div showing live `weight / (height/100)²` rounded to 1 decimal. Shows "--" when inputs missing. Wrapped in `Tooltip` with "Computed from weight and height".
- **Section 3 — Additional Vitals (Collapsible)**: Collapsed by default. Toggle text "Show additional vitals" / "Hide additional vitals". Contains O2 Saturation (%) and Blood Glucose (mg/dL). Values go into `vitals_extra` object.
- **Section 4 — Assessment**: Optional diagnosis textarea (2 rows).
- **Section 5 — Referral**: Optional "Refer to" text input.
- **Submit flow**: Builds `vitals_extra` from additional vitals (only non-null values included). Success: toast + `onSuccess()` callback + `onOpenChange(false)`. Error: "Could not save consultation. Check your connection and try again." toast.
- **Form reset**: All fields reset when `open` changes to `true` via useEffect.

### App.tsx updates

Added `/patients/:id` route after `/patients/new` (correct first-wins order). No `/patients/:id/consultations/new` route added per plan spec.

### AppShell.tsx updates

Added `resolvePageTitle` function with `startsWith("/patients")` fallback to return "Patients" for dynamic patient profile routes.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing component] No shadcn card.tsx installed**
- **Found during:** Task 1
- **Issue:** `frontend/src/components/ui/card.tsx` does not exist — shadcn card was not installed in Phase 2.
- **Fix:** Built header card using a styled div with `rounded-xl border border-border bg-card p-6` using CSS variables matching the design system.
- **Files modified:** `frontend/src/pages/patients/PatientProfilePage.tsx`

**2. [Rule 2 - Missing component] No shadcn textarea.tsx installed**
- **Found during:** Task 1
- **Issue:** `frontend/src/components/ui/textarea.tsx` does not exist — not installed.
- **Fix:** Used native `<textarea>` element styled with the same CSS pattern as the `Input` component (border, ring, focus-visible classes), consistent with project's design tokens.
- **Files modified:** `frontend/src/pages/patients/ConsultationSheet.tsx`

**3. [Rule 1 - Bug] Incorrect toast import**
- **Found during:** Task 1 (self-review before save)
- **Issue:** Initially wrote `import { toast } from "lucide-react"` which would fail (lucide doesn't export toast).
- **Fix:** Removed the erroneous import; kept only `import { toast as sonnerToast } from "sonner"`.
- **Files modified:** `frontend/src/pages/patients/PatientProfilePage.tsx`

## Self-Check

### Files exist
- `frontend/src/pages/patients/PatientProfilePage.tsx` — FOUND
- `frontend/src/pages/patients/ConsultationSheet.tsx` — FOUND

### Commits
- `0177b99` feat(03-05): add PatientProfilePage and ConsultationSheet — FOUND

## Self-Check: PASSED
