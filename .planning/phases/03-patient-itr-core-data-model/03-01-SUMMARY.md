---
phase: 03-patient-itr-core-data-model
plan: "01"
subsystem: backend
tags: [orm, pydantic, alembic, postgresql, tsvector, gin-index, soft-delete]
dependency_graph:
  requires: []
  provides: [Patient ORM model, Consultation ORM model, PatientCreate schema, PatientResponse schema, ConsultationCreate schema, ConsultationResponse schema, migration 0004]
  affects: [03-02-api-layer, 03-03-frontend-types, all subsequent Phase 3 plans]
tech_stack:
  added: []
  patterns: [tsvector STORED generated column, GIN index via raw SQL, hybrid vitals (discrete + JSONB), computed_field BMI, PaginatedResponse generic]
key_files:
  created:
    - backend/app/models/patient.py
    - backend/app/models/consultation.py
    - backend/app/schemas/patient.py
    - backend/app/schemas/consultation.py
    - backend/alembic/versions/0004_patients_and_consultations.py
    - backend/tests/test_patients/__init__.py
    - backend/tests/test_patients/test_patient_model.py
    - backend/tests/test_patients/test_consultation_model.py
    - backend/tests/test_patients/test_duplicate_detection.py
    - backend/tests/test_patients/test_patient_search.py
    - backend/tests/test_patients/test_patient_registration.py
    - backend/tests/test_patients/test_patient_profile.py
    - backend/tests/test_patients/test_consultation_create.py
    - backend/tests/test_patients/test_patient_rbac.py
    - backend/tests/test_patients/test_city_wide_readonly.py
    - backend/tests/test_patients/test_patient_audit.py
  modified:
    - backend/app/models/__init__.py
decisions:
  - "[03-01] Patient model uses TEXT + CHECK constraint for sex column (not PostgreSQL ENUM) — consistent with project TEXT preference, easier to extend"
  - "[03-01] GIN index created via raw SQL in migration (not op.create_index) to avoid Alembic autogenerate re-detecting it every revision (GitHub issue #1390)"
  - "[03-01] tsvector uses 'simple' config (not 'english') — Filipino names must not be stemmed by stop-word removal or stemming algorithms"
  - "[03-01] BMI is a Pydantic computed_field on ConsultationResponse — never stored in DB; eliminates stale data risk"
  - "[03-01] health_station_id not in PatientCreate request body — auto-set from current_user in service layer to prevent cross-BHS registration"
metrics:
  duration: "5 min"
  completed_date: "2026-03-18"
  tasks_completed: 3
  files_created: 16
  files_modified: 1
---

# Phase 3 Plan 01: Patient + Consultation Data Model Summary

**One-liner:** Patient and Consultation ORM models with STORED tsvector GIN search, hybrid vitals (discrete + JSONB), Alembic migration 0004, and 10 Wave 0 pytest stubs.

## What Was Built

### Task 1: ORM Models + Pydantic Schemas (commit c7a24c5)

**`backend/app/models/patient.py`** — Patient ORM model with:
- All identity fields: last_name, first_name, middle_name, birthdate, sex, barangay_psgc_code, address_line, health_station_id, mobile_number, possible_duplicate
- `search_vector` TSVECTOR STORED generated column using `to_tsvector('simple', ...)` — Filipino name search requires 'simple' (no stemming)
- GIN index defined in `__table_args__` with `postgresql_using="gin"`
- `TimestampMixin + SoftDeleteMixin` (RA 10173 compliance — no hard deletes)
- All 3 relationships (`consultations`, `barangay`, `health_station`) use `lazy="raise"` per project convention

**`backend/app/models/consultation.py`** — Consultation ORM model with:
- Hybrid vitals: 7 discrete typed columns (bp_systolic/diastolic INT, heart_rate INT, respiratory_rate INT, temperature NUMERIC(4,1), weight NUMERIC(5,2), height NUMERIC(5,2))
- `vitals_extra JSONB` for extensible additional vitals
- FKs to `patients.id` and `users.id`, `lazy="raise"` on all relationships
- BMI NOT stored — computed on read in schema

**`backend/app/schemas/patient.py`** — Pydantic schemas:
- `PatientCreate`: sex validated via `pattern=r"^(male|female)$"`, health_station_id excluded (service-layer concern), `force_duplicate` flag
- `PatientResponse`: includes `barangay_name` and `health_station_name` (joined fields), `age` as computed_field
- `PatientListItem`: includes `full_name` computed_field in Philippine format (LAST, First Middle)
- `DuplicateCheckResult`, `PatientSearchResponse`, `PaginatedResponse[T]` generic

**`backend/app/schemas/consultation.py`** — Pydantic schemas:
- `ConsultationCreate`: all vitals optional with range validation (bp_systolic ge=40 le=300, temperature ge=30.0 le=45.0, etc.)
- `ConsultationResponse`: `bmi` as `@computed_field @property` — never stored, computed from weight/height

### Task 2: Alembic Migration 0004 (commit 6ff8178)

**`backend/alembic/versions/0004_patients_and_consultations.py`** — Migration with:
- `patients` table with all columns including `deleted_at` (soft delete)
- CHECK constraint on sex: `CHECK (sex IN ('male', 'female'))` — TEXT not ENUM
- tsvector generated column via `op.execute(ALTER TABLE ... ADD COLUMN search_vector tsvector GENERATED ALWAYS AS ... STORED)` — raw SQL required (Alembic op.add_column cannot handle GENERATED ALWAYS AS)
- GIN index via `op.execute(CREATE INDEX ... USING GIN)` — raw SQL avoids autogenerate re-detection (RESEARCH.md Pitfall 2)
- `consultations` table with NUMERIC(4,1) for temperature, NUMERIC(5,2) for weight/height, JSONB for vitals_extra
- Reversible: downgrade drops consultations first (FK order), then patients

Migration verified: `alembic upgrade head` and `downgrade -1 && upgrade head` both exit 0.

### Task 3: Wave 0 Test Stubs (commit 9fab7db)

10 stub files in `backend/tests/test_patients/` covering all Phase 3 requirements:
- P3-01 through P3-10, each with a docstring explaining what real tests will verify
- All 10 pass: `pytest tests/test_patients/` exits 0, 10 collected, 10 passed

## Decisions Made

| Decision | Rationale |
|----------|-----------|
| TEXT + CHECK for sex (not ENUM) | PostgreSQL ENUM is immutable; TEXT + CHECK can be extended without ALTER TYPE |
| GIN index via raw SQL | Alembic autogenerate cannot reflect expression-based indexes — re-detects as DROP+CREATE every revision |
| 'simple' tsvector config | Filipino names must not be stemmed; 'english' would corrupt "dela Cruz", "Santos" |
| BMI as computed_field only | Stored BMI becomes stale when weight/height are updated; compute on read is always accurate |
| health_station_id excluded from PatientCreate | Prevents cross-BHS registration; service layer auto-sets from current_user |

## Deviations from Plan

None — plan executed exactly as written.

## Self-Check: PASSED

All key files found on disk:
- backend/app/models/patient.py — FOUND
- backend/app/models/consultation.py — FOUND
- backend/app/schemas/patient.py — FOUND
- backend/app/schemas/consultation.py — FOUND
- backend/alembic/versions/0004_patients_and_consultations.py — FOUND
- backend/tests/test_patients/ (11 files) — FOUND

All task commits verified in git log:
- c7a24c5: feat(03-01): create Patient and Consultation ORM models + Pydantic schemas
- 6ff8178: feat(03-01): add Alembic migration 0004 for patients and consultations tables
- 9fab7db: test(03-01): create Wave 0 test stubs for Phase 3 Nyquist sampling
