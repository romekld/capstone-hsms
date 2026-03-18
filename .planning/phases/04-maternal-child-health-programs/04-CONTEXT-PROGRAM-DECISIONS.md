# MCH Program Decisions (Phases 5–7 Reference)

**Source:** Original Phase 4 context, captured 2026-03-18 before phase was split into vertical slices.

**Consumers:**
- Phase 5 (Prenatal + Postpartum): Read all sections below
- Phase 6 (EPI): Read "EPI vaccine schedule" and "Program tabs on patient profile → EPI tab layout"
- Phase 7 (Nutrition): Read "Nutrition / OPT+ program" and "Program tabs on patient profile → Nutrition tab layout"

---

## Program tabs on patient profile

- Patient profile gains four new tabs: **[Consultations] [Prenatal] [Postpartum] [EPI] [Nutrition]**
- Each tab shows an empty state ("Not enrolled in [program]") with an **Enroll Patient** button when the patient has no enrollment
- **Prenatal tab layout:** Enrollment summary card at top (LMP, EDC, gravida/para, HIGH RISK badge if flagged) + "Add Visit" button + "Record Delivery" button. Below: sortable visit history table (columns: date, AOG, BP, weight, next visit date, overdue badge)
- **EPI tab layout:** Enrollment header (DOB, FIC status badge) + "Record Dose" button. Below: vaccine grid — rows = vaccine types (BCG, HepB, Penta, OPV, IPV, PCV, MMR), columns = dose numbers. Each cell shows: ✅ date given (green) | scheduled date (blue) | overdue (red) | — not applicable
- **Nutrition tab layout:** Latest Z-score summary card (WAZ / HAZ / WHZ with color-coded status labels: Normal / Underweight / Wasted / Stunted / Severe Wasting). Severe wasting (WHZ < −3) shows a red alert. Eligibility row: Vitamin A / iron / deworming status computed from age band and OPT+ cycle. Below: visit history table (date, weight, height, MUAC, WAZ, HAZ, WHZ, status)
- **Postpartum tab layout:** Same pattern as Prenatal — enrollment summary card + scheduled visit dates (Day 1, Week 1, Week 6) with overdue badges + visit history table

## Overdue & defaulter visibility

- **Dedicated overdue list page per program** — separate routes for prenatal overdue, postpartum overdue, EPI defaulters, and nutrition at-risk
- Sidebar nav "Maternal & Child Health" section shows live overdue count badges per program (e.g., "Prenatal (3 overdue)")
- Overdue counts are **always live** — no manual clearing. When a nurse records a visit for an overdue patient, the count drops automatically
- Overdue list pages are **view-only** — clicking a patient row navigates to their profile with the relevant program tab active. Visit entry happens on the profile page (not inline on the overdue list)
- Overdue list columns: Patient name | Expected visit date | Days overdue | (click row → profile)

## High-risk prenatal flags

- **Auto-flagged** when any of these conditions is recorded in a prenatal visit:
  - BP ≥ 140/90 (hypertension in pregnancy)
  - Hgb < 11 g/dL (severe anemia)
  - Para ≥ 5 (grand multipara — captured at enrollment)
  - GDM screening positive (checkbox on visit form)
  - Nurse manually checks "High-risk" (free-text reason field, for conditions not auto-detected)
- **Flag placement:** HIGH RISK badge on the Prenatal tab header card + badge on patient rows in the prenatal overdue/high-risk list. **Not** on the main patient identity header — high-risk is program-specific, not patient-wide
- High-risk flag stored as boolean on prenatal enrollment record, updated on each visit evaluation

## Postpartum enrollment flow

- **Entry point:** "Record Delivery" button on the **Prenatal tab** (not a standalone postpartum enrollment flow)
- **Dialog fields:** delivery date (manual date picker — required), outcome (radio: Live birth / Stillbirth / Abortion), place of delivery (free text — optional)
- **On save:** Prenatal enrollment status → "Delivered". System auto-creates a postpartum enrollment and computes the three scheduled visit dates (Day 1, Week 1, Week 6) from the entered delivery date. Postpartum tab becomes active
- **Live birth prompt:** After saving delivery, a dialog appears: "Would you like to register the newborn for EPI?" — "Register Newborn" opens the Patient Registration form pre-filled with mother's barangay and BHS. "Skip" closes without action. The newborn is a separate patient record (not linked under the mother's patient record)

## EPI vaccine schedule

- Hard-coded Philippine DOH EPI schedule (not configurable): BCG (×1), HepB-BD (×1), Penta/DTP-HepB-Hib (×3), OPV (×3), IPV (×1), PCV (×3), MMR (×1), Rotavirus (×2). Exact schedule from DOH immunization guidelines
- Dose sequence enforcement: backend rejects recording Dose N+1 if Dose N has no recorded date — returns a 422 with clear message
- FIC (Fully Immunized Child) computed per BHS per month: child is FIC when all required doses for their age cohort are completed. Stored on the EPI enrollment record and recomputed on each dose recording

## Nutrition / OPT+ program

- WHO Growth Standard tables for WAZ/HAZ/WHZ bundled as static lookup tables in the backend (not fetched at runtime)
- Z-scores auto-computed server-side from weight (kg), height (cm), and birthdate — returned in the visit response
- Vitamin A eligibility: 6–11 months (×1/year), 12–59 months (×2/year, April + August OPT+ cycles); determined at query time from child's age
- Deworming eligibility: ≥ 12 months, every 6 months

## Overdue detection strategy

- Query-time computation (`WHERE next_visit_date < NOW() AND visit not recorded`) rather than a separate cron flag — avoids stale data

## Claude's Discretion (program-level)

- Exact AOG-based prenatal visit schedule (frequency by trimester — standard DOH protocol)
- WHO Growth Standard lookup table format (CSV vs. Python dict vs. PostgreSQL table)
- Specific Celery task scheduling for nightly overdue detection refresh (vs. real-time computation on query)
- Whether FIC is a computed property on query or a stored field updated per dose recording

---

*Preserved from original Phase 4 context — split 2026-03-18*
