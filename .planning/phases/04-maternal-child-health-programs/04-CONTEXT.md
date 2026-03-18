# Phase 4: Maternal + Child Health Programs - Context (Head Phase)

**Status:** Head phase — implementation delivered via sub-phases 4.1–4.4

This is an organizational grouping. All decisions and plans live in the sub-phase directories.

## Sub-Phases

| Sub-phase | Directory | What it delivers |
|-----------|-----------|-----------------|
| **4.1** | `.planning/phases/04.1-mch-shared-data-model/` | ORM models, Pydantic schemas, Alembic migration for all 8 MCH tables |
| **4.2** | `.planning/phases/04.2-prenatal-postpartum/` | Full prenatal + postpartum stack (backend + frontend) |
| **4.3** | `.planning/phases/04.3-epi-vaccination/` | Full EPI vaccination stack (backend + frontend) |
| **4.4** | `.planning/phases/04.4-nutrition-opt-plus/` | Full nutrition / OPT+ stack (backend + frontend) |

## Program Decisions Reference

All captured implementation decisions for the four MCH programs (UI layout, workflow, overdue detection, high-risk flags, vaccine grid, Z-score display) are in:

- `.planning/phases/04.1-mch-shared-data-model/04-CONTEXT-PROGRAM-DECISIONS.md`

Sub-phase planners (4.2, 4.3, 4.4) MUST read this file before planning.

---

*Phase: 04-maternal-child-health-programs*
*Reorganized: 2026-03-18 — split into vertical sub-phases 4.1–4.4*
