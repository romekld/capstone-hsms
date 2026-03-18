# Phase 3: Patient ITR + Core Data Model — Research

**Researched:** 2026-03-18
**Domain:** PostgreSQL full-text search, SQLAlchemy 2.0 async ORM, Alembic migrations, FastAPI RBAC patterns, React/TypeScript feature modules
**Confidence:** HIGH (based entirely on existing project code + verified patterns)

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Role Access**
- Nurse / Midwife: Full CRUD — register patients, record consultations, run duplicate check, search patients (own BHS default, city-wide toggle)
- Physician: Create consultations + view patient records (clinical notes, diagnoses scope per CLAUDE.md)
- CHO / DSO / PHIS Coordinator: Read-only, city-wide patient search (already in CROSS_BHS_ROLES)
- BHW: Zero access in Phase 3 — no patient lookup, no profile view, no consultation entry

**Vitals Model — Hybrid approach**
- Discrete columns: `bp_systolic INT`, `bp_diastolic INT`, `heart_rate INT`, `respiratory_rate INT`, `temperature NUMERIC(4,1)`, `weight NUMERIC(5,2)`, `height NUMERIC(5,2)`
- BMI computed on read from weight/height — not stored
- `vitals_extra JSONB` for O2 saturation, blood glucose, and future vital signs
- All vitals optional; backend validates range only when a field is provided

**Consultation Record**
- Fields: `chief_complaint TEXT` (required), discrete vitals + `vitals_extra JSONB` (optional), `diagnosis TEXT` (free text, optional), `referring_to TEXT` nullable
- No full SOAP note

**Patient Identity Fields**
- Required: `last_name`, `first_name`, `middle_name` (nullable), `birthdate DATE`, `sex ENUM('male','female')`, `barangay_psgc_code TEXT FK`, `address_line TEXT` nullable, `health_station_id INT FK`, `mobile_number TEXT` nullable
- Extended fields (PhilHealth ID, civil status, guardian/emergency contact) deferred

**Duplicate Detection**
- Strategy: exact case-insensitive match on `last_name + first_name + birthdate`
- Scope: city-wide regardless of registering nurse's BHS
- UX: warning card (not blocking modal), two actions: "Use Existing Patient" or "Register Anyway" (audit-logged, sets `possible_duplicate BOOLEAN DEFAULT FALSE` flag)

**Patient Search**
- Default scope: own BHS; "Search all BHS" toggle for city-wide
- Search fields: GIN index on `last_name + first_name` tsvector + exact match on patient ID
- City-wide results are read-only for BHS-level roles

**Patient Profile Page**
- Header card: name, birthdate, sex, age (computed), BHS — no mobile/address
- Consultations tab only — no placeholder tabs for Phase 4–8 programs
- Add Consultation opens a dedicated page (not a Sheet)

**UI: Dedicated Pages — Not Sheets**
- `/patients` — Patient search page
- `/patients/new` — Register Patient (dedicated page, NOT sheet)
- `/patients/:id` — Patient profile page
- `/patients/:id/consultations/new` — Add Consultation (dedicated page, NOT sheet)

### Claude's Discretion
- Auto-generated `patient_id` format (sequential INT PK or formatted code like `BHS##-YYYYNNNN`)
- GIN index definition and tsvector configuration for name search
- Alembic migration structure for `patients` and `consultations` tables
- Error message wording for duplicate warning and city-wide read-only enforcement
- Exact consultation form field layout

### Deferred Ideas (OUT OF SCOPE)
- BHW patient access (read-only or entry) — zero BHW access in Phase 3
- `local_id UUID` + `status record_status` sync columns — add in Phase 9
- PhilHealth ID + membership type — defer to Phase 8
- Civil status / occupation — defer to Phase 8
- Guardian / emergency contact — defer to Phase 4
- Global Cmd+K patient search — defer to polish phase
- Patient merge / deactivate duplicate workflow — defer; `possible_duplicate` flag enables later
- ICD-10 code picker / autocomplete — defer; free text sufficient
- Program tabs on patient profile — added progressively in Phases 4–8
</user_constraints>

---

## Summary

Phase 3 builds the foundational patient data model that every clinical phase (4–8) depends on via `patient_id` FK. The existing codebase (Phases 1–2) provides all necessary infrastructure: `BaseRepository._isolation_filter()` for BHS scoping, `TimestampMixin`/`SoftDeleteMixin` for audit compliance, `require_role()` for RBAC, and `audit_logs` for event recording. Phase 3 extends these patterns rather than inventing new ones.

The two non-trivial technical challenges are: (1) PostgreSQL GIN full-text search index with SQLAlchemy 2.0 async — requires DDL-level index creation in Alembic using `op.execute()` raw SQL because SQLAlchemy's `Index()` does not directly support `tsvector` computed expressions; and (2) the city-wide search toggle for BHS-level roles — this requires a second repository method that bypasses `_isolation_filter()`, keeping the isolation pattern intact for regular queries.

The frontend follows the exact same structure as the `admin` feature module: `features/patients/api.ts`, `features/patients/types.ts`, `features/patients/components/`, and dedicated pages under `pages/patients/`. Routes are registered in `App.tsx` using the `ProtectedRoute` + `AppShell` pattern already established in Phase 2.

**Primary recommendation:** Use sequential INT primary key for `patients.id` (simple, reliable) and a computed display string `BHS{station_id:02d}-{year}{sequence:04d}` derived at the API layer — not stored. This avoids schema complexity while giving nurses a human-readable identifier.

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| SQLAlchemy 2.0 async | Already installed | ORM models for `patients`, `consultations` | Project-locked; all existing models use it |
| Pydantic v2 | Already installed | Request/response schemas | Project-locked; all existing schemas use it |
| Alembic | Already installed | `0004_patients_and_consultations.py` migration | Project-locked; async env.py already configured |
| PostgreSQL GIN index | Built-in PG feature | Full-text search on name tsvector | No extra dependency; used via `op.execute()` in Alembic |
| FastAPI | Already installed | Patient + consultation routers | Project-locked |
| React + TypeScript | Already installed | Frontend pages + feature module | Project-locked |
| React Router DOM | Already installed (used in App.tsx) | `/patients`, `/patients/:id`, `/patients/:id/consultations/new` routes | Already wired in App.tsx |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `sqlalchemy.dialects.postgresql.ENUM` | Part of SQLAlchemy | `sex` column ENUM type | Required for PostgreSQL native ENUM; matches `roles ARRAY(Text)` pattern |
| `sqlalchemy.dialects.postgresql.JSONB` | Part of SQLAlchemy | `vitals_extra` column | Required for typed JSONB; already used in `audit_logs` |
| `lucide-react` | Already installed | Icons in patient forms and tables | Consistent with Phase 2 UI |
| `sonner` | Already installed | Toast notifications on save/error | Already used in CreateUserPage |

### Installation
No new packages required. All dependencies are already installed in Phase 1–2.

---

## Architecture Patterns

### Recommended Project Structure (Backend additions)

```
backend/app/
├── models/
│   ├── patient.py         # Patient ORM model
│   └── consultation.py    # Consultation ORM model
├── schemas/
│   └── patient.py         # PatientCreate, PatientResponse, ConsultationCreate, ConsultationResponse, DuplicateCheckResult
├── repositories/
│   └── patient.py         # PatientRepository(BaseRepository) + ConsultationRepository(BaseRepository)
├── services/
│   └── patient.py         # PatientService — duplicate check, city-wide search logic, audit writes
├── routers/
│   └── patients.py        # /patients routes with require_role()
└── models/__init__.py     # Add Patient, Consultation imports so Alembic autogenerate detects them
```

### Recommended Project Structure (Frontend additions)

```
frontend/src/
├── features/patients/
│   ├── api.ts             # listPatients(), createPatient(), getPatient(), checkDuplicate(), createConsultation()
│   ├── types.ts           # Patient, PatientCreate, Consultation, ConsultationCreate, DuplicateMatch
│   └── components/
│       └── (shared form section components if needed — follow admin/components/UserFormSections.tsx pattern)
└── pages/patients/
    ├── PatientsPage.tsx               # /patients — search + table
    ├── RegisterPatientPage.tsx        # /patients/new — registration form
    ├── PatientProfilePage.tsx         # /patients/:id — profile + consultations tab
    └── AddConsultationPage.tsx        # /patients/:id/consultations/new — consultation form
```

### Pattern 1: GIN Full-Text Search on Name

**What:** PostgreSQL GIN index on a computed `tsvector` combining `last_name` and `first_name`. SQLAlchemy cannot express computed index expressions natively, so the index is created with raw SQL in Alembic.

**Alembic DDL (in `0004_patients_and_consultations.py`):**
```python
# GIN index — cannot use op.create_index() for computed tsvector expressions
op.execute(
    """
    CREATE INDEX ix_patients_name_search
    ON patients
    USING GIN (to_tsvector('simple', last_name || ' ' || first_name))
    """
)
```

**Repository query pattern (partial name, case-insensitive):**
```python
# In PatientRepository.search_by_name()
from sqlalchemy import func, text

stmt = (
    select(Patient)
    .where(
        func.to_tsvector("simple", Patient.last_name + " " + Patient.first_name)
        .op("@@")(func.plainto_tsquery("simple", search_term))
    )
    .order_by(Patient.last_name, Patient.first_name)
)
```

**Why `'simple'` config:** The `simple` text search configuration does NOT apply language stemming (no English/Filipino morphological reduction). For names, stemming is wrong — "Santos" must match "Santos", not be stemmed. `'simple'` lowercases and tokenizes only. This gives case-insensitive partial matching.

**Fallback for partial prefix (e.g., "San" matching "Santos"):** `plainto_tsquery` matches whole words. For prefix matching, use `to_tsquery('simple', :term || ':*')` — the `:*` suffix enables prefix matching in PostgreSQL.

```python
# Prefix-aware query (handles partial names like "San" -> "Santos")
stmt = (
    select(Patient)
    .where(
        func.to_tsvector("simple", Patient.last_name + " " + Patient.first_name)
        .op("@@")(func.to_tsquery("simple", search_term.strip() + ":*"))
    )
)
```

**Confidence:** HIGH — verified against PostgreSQL documentation; `simple` dictionary confirmed for name search use case.

### Pattern 2: Duplicate Detection Query

**What:** Exact case-insensitive match on `last_name + first_name + birthdate`. Used city-wide (bypasses BHS isolation).

**Index strategy:** A B-tree composite index on `(lower(last_name), lower(first_name), birthdate)` supports this exact query efficiently. Create in Alembic:

```python
op.execute(
    """
    CREATE INDEX ix_patients_duplicate_check
    ON patients (lower(last_name), lower(first_name), birthdate)
    """
)
```

**Repository query (city-wide, ignores `_isolation_filter`):**
```python
async def find_duplicates(
    self, last_name: str, first_name: str, birthdate: date
) -> list[Patient]:
    """City-wide duplicate check — explicitly bypasses _isolation_filter()."""
    stmt = (
        select(Patient)
        .where(
            func.lower(Patient.last_name) == last_name.lower(),
            func.lower(Patient.first_name) == first_name.lower(),
            Patient.birthdate == birthdate,
        )
        .options(joinedload(Patient.health_station))  # need BHS name for warning card
    )
    result = await self.session.execute(stmt)
    return list(result.scalars().all())
```

This method is called without `_isolation_filter()` — it is always city-wide because duplicate detection must cross BHS boundaries.

**Confidence:** HIGH — direct application of existing SQL patterns in the codebase.

### Pattern 3: City-Wide Search Toggle with BHS Isolation Bypass

**What:** Two separate repository methods — one BHS-scoped (uses `_isolation_filter`), one city-wide (bypasses it). This is the cleanest extension of the existing pattern without modifying `_isolation_filter()` itself.

**PatientRepository:**
```python
async def search_patients_bhs_scoped(
    self, search_term: str, limit: int = 20, offset: int = 0
) -> list[Patient]:
    """Own-BHS search — applies _isolation_filter()."""
    stmt = (
        select(Patient)
        .where(
            func.to_tsvector("simple", Patient.last_name + " " + Patient.first_name)
            .op("@@")(func.to_tsquery("simple", search_term.strip() + ":*"))
        )
        .limit(limit)
        .offset(offset)
    )
    stmt = self._isolation_filter(stmt, Patient)
    result = await self.session.execute(stmt)
    return list(result.scalars().all())


async def search_patients_city_wide(
    self, search_term: str, limit: int = 20, offset: int = 0
) -> list[Patient]:
    """City-wide search — bypasses _isolation_filter(). Called only when city_wide=True."""
    stmt = (
        select(Patient)
        .where(
            func.to_tsvector("simple", Patient.last_name + " " + Patient.first_name)
            .op("@@")(func.to_tsquery("simple", search_term.strip() + ":*"))
        )
        .limit(limit)
        .offset(offset)
    )
    result = await self.session.execute(stmt)
    return list(result.scalars().all())
```

**Service layer — read-only enforcement for BHS roles on city-wide results:**
```python
# PatientService.search()
async def search(self, search_term: str, city_wide: bool) -> list[PatientResponse]:
    is_cross_bhs_role = any(r in CROSS_BHS_ROLES for r in self.current_user.roles)

    if city_wide or is_cross_bhs_role:
        patients = await self.repo.search_patients_city_wide(search_term)
    else:
        patients = await self.repo.search_patients_bhs_scoped(search_term)

    return [
        PatientResponse.from_orm(p, read_only=(
            # Read-only if BHS-level role is viewing another BHS's patient
            not is_cross_bhs_role and p.health_station_id != self.current_user.health_station_id
        ))
        for p in patients
    ]
```

**Confidence:** HIGH — direct extension of `CROSS_BHS_ROLES` + `_isolation_filter()` pattern confirmed in `backend/app/repositories/base.py`.

### Pattern 4: Patient ID Format (Claude's Discretion)

**Recommendation:** Use sequential `INT` primary key as `patients.id` (autoincrement, same as `users.id`). Do not store a formatted code in the database.

**Display format computed at API layer:** `BHS{health_station_id:02d}-{created_at.year}{id:04d}` — e.g., `BHS03-20260001`. This is returned as a computed field in `PatientResponse` (Pydantic `@computed_field` or service-layer derivation).

**Why not a stored formatted code:**
- Avoids race condition on sequence + BHS ID combination
- Sequential INT PK is simpler to FK in Phases 4–8 enrollment tables
- Alembic migration is simpler
- The formatted display code can always be computed from `(id, health_station_id, created_at)` — no data loss

**Patient_id search:** The search endpoint also accepts exact match on the formatted display string. Service layer parses the string back to `patient.id` for lookup, or the frontend queries with the raw INT if available.

**Confidence:** MEDIUM — recommendation based on project constraints; exact format is Claude's discretion per CONTEXT.md.

### Pattern 5: Alembic Migration Structure

**Recommendation:** One migration file `0004_patients_and_consultations.py` covering both tables. Tables in one file because `consultations` has a non-nullable FK to `patients.id` — they must be created in order within the same upgrade() transaction.

**Migration order within upgrade():**
1. Create `sex_enum` PostgreSQL ENUM type
2. Create `patients` table (with all columns, FKs to `health_stations.id` and `barangays.psgc_code`)
3. Create B-tree index for duplicate check
4. Create GIN index for name search
5. Create `consultations` table (FK to `patients.id`)
6. Create B-tree index on `consultations.patient_id` for fast patient history queries

**Key columns for `patients` table:**
```python
op.create_table(
    "patients",
    sa.Column("id", sa.Integer, primary_key=True, autoincrement=True),
    sa.Column("last_name", sa.Text, nullable=False),
    sa.Column("first_name", sa.Text, nullable=False),
    sa.Column("middle_name", sa.Text, nullable=True),
    sa.Column("birthdate", sa.Date, nullable=False),
    sa.Column("sex", postgresql.ENUM("male", "female", name="sex_enum"), nullable=False),
    sa.Column("barangay_psgc_code", sa.Text, sa.ForeignKey("barangays.psgc_code"), nullable=False),
    sa.Column("address_line", sa.Text, nullable=True),
    sa.Column("health_station_id", sa.Integer, sa.ForeignKey("health_stations.id"), nullable=False),
    sa.Column("mobile_number", sa.Text, nullable=True),
    sa.Column("possible_duplicate", sa.Boolean, nullable=False, server_default=sa.false()),
    sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True),  # SoftDeleteMixin
    sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("NOW()"), nullable=False),
    sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("NOW()"), nullable=False),
)
```

**Key columns for `consultations` table:**
```python
op.create_table(
    "consultations",
    sa.Column("id", sa.Integer, primary_key=True, autoincrement=True),
    sa.Column("patient_id", sa.Integer, sa.ForeignKey("patients.id"), nullable=False),
    sa.Column("recorded_by_id", sa.Integer, sa.ForeignKey("users.id"), nullable=False),
    sa.Column("chief_complaint", sa.Text, nullable=False),
    # Discrete vitals
    sa.Column("bp_systolic", sa.Integer, nullable=True),
    sa.Column("bp_diastolic", sa.Integer, nullable=True),
    sa.Column("heart_rate", sa.Integer, nullable=True),
    sa.Column("respiratory_rate", sa.Integer, nullable=True),
    sa.Column("temperature", sa.Numeric(4, 1), nullable=True),
    sa.Column("weight", sa.Numeric(5, 2), nullable=True),
    sa.Column("height", sa.Numeric(5, 2), nullable=True),
    # Extra vitals JSONB
    sa.Column("vitals_extra", postgresql.JSONB, nullable=True),
    # Clinical fields
    sa.Column("diagnosis", sa.Text, nullable=True),
    sa.Column("referring_to", sa.Text, nullable=True),
    # Soft delete
    sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True),
    sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("NOW()"), nullable=False),
    sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("NOW()"), nullable=False),
)
```

**downgrade():** Drop consultations first (FK dependency), then indexes, then ENUM type, then patients. Pattern from `0003_users_and_sessions.py` — use `op.drop_table()` and `op.execute("DROP TYPE IF EXISTS sex_enum")`.

**Confidence:** HIGH — migration pattern verified from `0001_initial_schema.py` and `0003_users_and_sessions.py`.

### Pattern 6: SQLAlchemy ORM Model

**Patient model following existing conventions:**
```python
# backend/app/models/patient.py
from sqlalchemy import Boolean, Date, ForeignKey, Integer, Numeric, Text
from sqlalchemy.dialects.postgresql import ENUM as PG_ENUM
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.base import Base, TimestampMixin, SoftDeleteMixin


class Patient(TimestampMixin, SoftDeleteMixin, Base):
    __tablename__ = "patients"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    last_name: Mapped[str] = mapped_column(Text, nullable=False)
    first_name: Mapped[str] = mapped_column(Text, nullable=False)
    middle_name: Mapped[str | None] = mapped_column(Text, nullable=True)
    birthdate: Mapped[date] = mapped_column(Date, nullable=False)
    sex: Mapped[str] = mapped_column(
        PG_ENUM("male", "female", name="sex_enum"), nullable=False
    )
    barangay_psgc_code: Mapped[str] = mapped_column(
        Text, ForeignKey("barangays.psgc_code"), nullable=False
    )
    address_line: Mapped[str | None] = mapped_column(Text, nullable=True)
    health_station_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("health_stations.id"), nullable=False, index=True
    )
    mobile_number: Mapped[str | None] = mapped_column(Text, nullable=True)
    possible_duplicate: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)

    # Relationships — lazy="raise" is MANDATORY per CLAUDE.md
    health_station = relationship("HealthStation", lazy="raise")
    barangay = relationship("Barangay", lazy="raise")
    consultations = relationship("Consultation", back_populates="patient", lazy="raise")
```

**Key constraint:** Both `TimestampMixin` and `SoftDeleteMixin` MUST be applied. Per `backend/app/core/base.py`, `SoftDeleteMixin` triggers the `do_orm_execute` hook which auto-filters `deleted_at IS NULL` on all SELECT statements. This means soft deletes work automatically — no extra WHERE clause needed in queries.

### Pattern 7: Audit Logging for Duplicate Override

**What:** When nurse clicks "Register Anyway", the service calls `_write_audit()` with `operation="CREATE"` and `new_values` containing the override metadata.

**Pattern from `AdminService._write_audit()`:**
```python
# In PatientService — audit the duplicate override
async def _write_audit_duplicate_override(self, new_patient_id: int, matched_patient_id: int) -> None:
    payload = {
        "action": "duplicate_override",
        "new_patient_id": new_patient_id,
        "matched_patient_id": matched_patient_id,
        "performed_by_user_id": self.current_user.id,
    }
    await self.session.execute(
        text(
            "INSERT INTO audit_logs (table_name, record_id, operation, performed_by, new_values) "
            "VALUES (:table, gen_random_uuid(), :op, NULL, :new)"
        ),
        {
            "table": "patients",
            "op": "CREATE",
            "new": json.dumps(payload),
        },
    )
```

**Audit log schema (confirmed from `0001_initial_schema.py`):**
```
audit_logs(
    id BIGSERIAL,
    table_name TEXT,
    record_id UUID,          -- use gen_random_uuid()
    operation TEXT,          -- 'CREATE' | 'UPDATE' | 'SOFT_DELETE'
    performed_by UUID,       -- NULL (actor is in new_values JSONB per Pitfall 8)
    performed_at TIMESTAMPTZ DEFAULT NOW(),
    old_values JSONB,
    new_values JSONB         -- store performed_by_user_id here
)
```

**Critical constraint:** `audit_logs` has a PostgreSQL RULE + TRIGGER making it append-only (`no_update_audit_logs`, `no_delete_audit_logs`). Never attempt UPDATE or DELETE on this table. Always use the `INSERT ... gen_random_uuid()` pattern from `AdminService`.

### Pattern 8: Frontend Feature Module

**Confirmed structure from `frontend/src/features/admin/`:**
```
features/admin/
├── api.ts           — async functions: listUsers(), createUser(), getUser(), updateUser(), etc.
├── types.ts         — TypeScript interfaces: UserListItem, UserCreateRequest, etc. + constants
├── healthStations.ts — static data (not an API call)
└── components/
    └── UserFormSections.tsx — reusable form section components
```

**Phase 3 will mirror this exactly:**
```
features/patients/
├── api.ts           — listPatients(), createPatient(), getPatient(), checkDuplicate(), listConsultations(), createConsultation()
├── types.ts         — Patient, PatientCreate, PatientSearch, Consultation, ConsultationCreate, DuplicateMatch
└── components/
    └── PatientFormSections.tsx — IdentitySection, DemographicsSection, AddressSection, ContactSection
```

**API function pattern (from `features/admin/api.ts`):**
```typescript
// features/patients/api.ts
import api from "@/lib/axios";
import type { Patient, PatientCreate, PatientSearch, Consultation, ConsultationCreate, DuplicateMatch } from "./types";

export async function listPatients(params: PatientSearch): Promise<Patient[]> {
  const { data } = await api.get<Patient[]>("/patients", { params });
  return data;
}

export async function createPatient(body: PatientCreate): Promise<Patient> {
  const { data } = await api.post<Patient>("/patients", body);
  return data;
}

export async function getPatient(patientId: number): Promise<Patient> {
  const { data } = await api.get<Patient>(`/patients/${patientId}`);
  return data;
}

export async function checkDuplicate(last_name: string, first_name: string, birthdate: string): Promise<DuplicateMatch[]> {
  const { data } = await api.get<DuplicateMatch[]>("/patients/duplicate-check", {
    params: { last_name, first_name, birthdate },
  });
  return data;
}

export async function createConsultation(patientId: number, body: ConsultationCreate): Promise<Consultation> {
  const { data } = await api.post<Consultation>(`/patients/${patientId}/consultations`, body);
  return data;
}
```

### Pattern 9: Route Registration in App.tsx

**Confirmed pattern from `frontend/src/App.tsx`:**

Patients routes need a combined role guard (nurse, midwife, physician, CHO, DSO, PHIS coordinator — everyone except system_admin and BHW). Use the same `ProtectedRoute allowedRoles` pattern.

```typescript
// In App.tsx — add after the admin ProtectedRoute block
import { PatientsPage } from "@/pages/patients/PatientsPage";
import { RegisterPatientPage } from "@/pages/patients/RegisterPatientPage";
import { PatientProfilePage } from "@/pages/patients/PatientProfilePage";
import { AddConsultationPage } from "@/pages/patients/AddConsultationPage";

// Patients — nurse, midwife, physician, CHO, DSO, PHIS coordinator
<Route element={<ProtectedRoute allowedRoles={["nurse", "midwife", "physician", "city_health_officer", "disease_surveillance_officer", "phis_coordinator"]} />}>
  <Route element={<AppShell />}>
    <Route path="/patients" element={<PatientsPage />} />
    <Route path="/patients/new" element={<RegisterPatientPage />} />
    <Route path="/patients/:id" element={<PatientProfilePage />} />
    <Route path="/patients/:id/consultations/new" element={<AddConsultationPage />} />
  </Route>
</Route>
```

**AppShell PAGE_TITLES update required:**
```typescript
const PAGE_TITLES: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/admin/users": "User Management",
  "/patients": "Patients",
  // Dynamic titles (/patients/:id) must be handled in the page component itself
}
```

**Sidebar nav update required in `app-sidebar.tsx`:**
```typescript
const NAV_ITEMS = [
  // ... existing items
  {
    label: "Patients",
    href: "/patients",
    icon: UserRound,  // lucide-react
    roles: ["nurse", "midwife", "physician", "city_health_officer", "disease_surveillance_officer", "phis_coordinator"],
  },
]
```

### Pattern 10: Dedicated Page UX (matches Phase 2 CreateUserPage)

The `CreateUserPage.tsx` establishes the project's dedicated-page form pattern:
- Max-width container: `max-w-2xl mx-auto px-6 py-8 space-y-8`
- Page header: back navigation button + h1 title + subtitle
- Form sections: `space-y-8 divide-y divide-border` with `pt-8` between sections
- Sticky footer action bar: `sticky bottom-0 bg-background border-t border-border pt-4 pb-6 flex gap-3 justify-end`
- Submit button loading state: inline spinner with `animate-spin rounded-full border-2 border-current border-t-transparent`
- Error handling: `toast.error()` for server errors, inline field errors for validation

The `RegisterPatientPage.tsx` and `AddConsultationPage.tsx` must follow this exact structural pattern for UX consistency.

**UI differences from CreateUserPage for Phase 3:**
- `RegisterPatientPage`: uses `shadcn Breadcrumb` instead of back button; two-column grid on 768px+ (form sections side-by-side)
- `AddConsultationPage`: includes patient identity confirmation strip above form; vitals grid with `inputmode="numeric"` on number inputs; Collapsible for additional vitals

### Anti-Patterns to Avoid

- **Do NOT use `lazy="select"` on relationships** — all relationships must be `lazy="raise"` per `CLAUDE.md` and confirmed in every existing model (`health_station.py`, `barangay.py`, `user.py`)
- **Do NOT call `_isolation_filter()` in `find_duplicates()`** — duplicate check must be city-wide by design
- **Do NOT store BMI as a column** — compute from `weight / (height/100)^2` in Pydantic response schema (`@computed_field`) or frontend
- **Do NOT add `local_id UUID` or `status record_status` columns** — explicitly deferred to Phase 9
- **Do NOT add placeholder tabs for Phase 4–8 programs** on the patient profile page — per CONTEXT.md decision
- **Do NOT use Sheets for create/edit flows** — all Phase 3 forms are dedicated pages per UI-SPEC.md user clarification
- **Do NOT hardcode OKLCH/hex colors in components** — use CSS variables (`var(--primary)`, `var(--status-critical)`, etc.)
- **Do NOT use `plainto_tsquery` for partial name matching** — use `to_tsquery` with `:*` suffix for prefix matching
- **Do NOT create a separate `sex_enum` ENUM in the ORM model without first checking** that `op.execute("CREATE TYPE sex_enum AS ENUM('male','female')")` runs before `op.create_table()` in the migration

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Soft delete auto-filter | Custom WHERE clause in every query | `SoftDeleteMixin` + `do_orm_execute` hook | Already implemented; automatic on all SELECT statements |
| BHS isolation filter | Per-method WHERE health_station_id | `_isolation_filter()` from `BaseRepository` | Single enforcement point; already tested |
| JWT auth + RBAC | Custom auth middleware | `CurrentUser` + `require_role()` from `dependencies.py` | Already implemented; tested in Phase 2 |
| Append-only audit logging | Custom audit table | `audit_logs` INSERT via `session.execute(text(...))` | Table exists with RULE + TRIGGER enforcement |
| Token refresh + 401 retry | Custom axios interceptor | Existing `lib/axios.ts` | Already handles token refresh queue |
| Form loading state button | Custom spinner component | Inline `animate-spin` pattern from `CreateUserPage` | Consistent with Phase 2 UX |
| PostgreSQL ENUM type | TEXT column with app-level validation | `postgresql.ENUM("male", "female", name="sex_enum")` | Database-level constraint; prevents bad data |

**Key insight:** Phase 3 is almost entirely plumbing work wiring new models/schemas/repos/routers into the existing infrastructure. The infrastructure from Phases 1–2 handles 80% of the complexity (soft deletes, isolation, auth, audit). The actual new work is the GIN index + duplicate detection query, city-wide search toggle, and 4 frontend pages.

---

## Common Pitfalls

### Pitfall 1: PostgreSQL ENUM type in Alembic

**What goes wrong:** Creating the ORM model with `PG_ENUM("male", "female", name="sex_enum")` without explicitly creating the ENUM type in Alembic before `op.create_table()` causes `ProgrammingError: type "sex_enum" does not exist`.

**Why it happens:** Alembic's `op.create_table()` does not automatically create ENUM types. The ENUM must be pre-created with `op.execute("CREATE TYPE sex_enum AS ENUM('male', 'female')")` before the table DDL.

**How to avoid:** In `upgrade()`, always create ENUM types before the table that uses them. In `downgrade()`, drop the ENUM after dropping the table.

**Warning signs:** `ProgrammingError` during `alembic upgrade head` mentioning the type name.

### Pitfall 2: GIN Index With Spaces in Name Concatenation

**What goes wrong:** `to_tsvector("simple", Patient.last_name + Patient.first_name)` without a space separator creates a single token `"SantosJuan"` that does not match `to_tsquery("simple", "Juan:*")`.

**Why it happens:** String concatenation without separator merges the words.

**How to avoid:** Always concatenate with a space: `Patient.last_name + " " + Patient.first_name`. Or use `func.concat_ws(" ", Patient.last_name, Patient.first_name)`.

**Warning signs:** Name search returns no results when searching by first name alone.

### Pitfall 3: Forgetting to Import New Models in `__init__.py`

**What goes wrong:** Alembic `autogenerate` does not detect `patients` or `consultations` tables because the models were not imported.

**Why it happens:** The existing `alembic/env.py` uses `from app.models import *` — this only works if `app/models/__init__.py` exports all model classes.

**How to avoid:** After creating `patient.py` and `consultation.py`, add imports to `backend/app/models/__init__.py`:
```python
from app.models.patient import Patient  # noqa
from app.models.consultation import Consultation  # noqa
```

**Warning signs:** Running `alembic revision --autogenerate` produces a migration with no detected changes despite new model files existing.

### Pitfall 4: City-Wide Search Returning Read-Only Results Without Frontend Enforcement

**What goes wrong:** City-wide search results are returned and a nurse from BHS-01 can navigate to and edit a patient belonging to BHS-07.

**Why it happens:** The read-only restriction is a UX + API concern, not purely a data isolation concern. The backend must return a `read_only` field on patient responses (or the frontend must derive it from `health_station_id != user.health_station_id`).

**How to avoid:** The frontend derives `is_read_only` from `patient.health_station_id !== currentUser.health_station_id` and the user's role. Do NOT render the "Add Consultation" button and hide "Edit Patient" for read-only patients. The backend should also reject PUT/PATCH calls on patients belonging to another BHS for BHS-level roles (service layer check).

**Warning signs:** Nurse successfully submits a consultation for a patient from another BHS.

### Pitfall 5: `do_orm_execute` Hook Filtering Soft-Deleted Patients in Duplicate Check

**What goes wrong:** A soft-deleted patient (`deleted_at IS NOT NULL`) is not detected by the duplicate check, allowing a new registration of the same person. Later, admin restores the soft-deleted record creating two active records.

**Why it happens:** `do_orm_execute` automatically applies `WHERE deleted_at IS NULL` to all queries via `with_loader_criteria(SoftDeleteMixin, ...)`. The duplicate check query will miss soft-deleted patients.

**How to avoid:** For duplicate detection, decide whether soft-deleted patients should still block new registrations. The safest approach: use raw SQL via `session.execute(text(...))` bypassing the ORM filter when checking for duplicates, or include `deleted_at IS NULL OR deleted_at IS NOT NULL` explicitly. For Phase 3 (no deactivation/merge UI yet), the simple approach is to accept this limitation — note it as a known gap since soft-deletion of patients is not a Phase 3 use case.

**Warning signs:** Duplicate check returns empty when there is a soft-deleted patient with matching name+birthdate.

### Pitfall 6: `recorded_by_id` FK Not in JWT Payload as INT

**What goes wrong:** `consultations.recorded_by_id` should store the `users.id` (INT) of the logged-in nurse. The JWT payload has `sub` (user ID as string), not the `users.id` as int directly.

**Why it happens:** The JWT `sub` field is a string per RFC 7519. `get_current_user()` in `dependencies.py` converts: `id=int(payload["sub"])`. So `current_user.id` is already the correct INT.

**How to avoid:** Use `current_user.id` (from `CurrentUser` dependency) for `recorded_by_id`. Do not re-query the database for the user's ID.

### Pitfall 7: INFRA-04 Bug (Known Tech Debt)

**What goes wrong:** `gis-data/` not mounted in Docker container — `alembic upgrade head` may fail with `FileNotFoundError` if migration 0002 (GIS seed) runs.

**Why it happens:** Known bug carried from Phase 1 (noted in `PROJECT.md` §Active Known Gaps).

**How to avoid:** Fix before Phase 3 startup. The developer must verify the GIS data mount is correct in `docker-compose.yml` before running migrations. Phase 3 migration `0004` does not require GIS data, but the full migration chain runs 0001→0002→0003→0004.

**Warning signs:** `alembic upgrade head` fails with FileNotFoundError on GIS seed step.

### Pitfall 8: OKLCH Color Variables — base-nova Preset

**What goes wrong:** Using `hsl(var(--primary))` syntax from the shadcn default (Radix) theme when the project uses base-nova (Base UI) with OKLCH tokens. The CSS variable format is `var(--primary)` directly, not `hsl(var(--primary))`.

**Why it happens:** The UI-SPEC.md confirms: "Token format: OKLCH via CSS variables — never hardcode hex/rgb". The base-nova preset uses `var(--primary)` directly (not the double-wrap `hsl(var(--primary))` pattern of the older shadcn themes).

**How to avoid:** Use `var(--primary)`, `var(--status-critical)`, `var(--bhs-tier)` directly. Never write `hsl(var(...))`. Verify with existing component files to see the pattern in use.

---

## Code Examples

### Verified: Existing `_write_audit()` pattern (from `backend/app/services/admin.py`)

```python
await self.session.execute(
    text(
        "INSERT INTO audit_logs (table_name, record_id, operation, performed_by, new_values) "
        "VALUES (:table, gen_random_uuid(), :op, NULL, :new)"
    ),
    {
        "table": "patients",
        "op": "CREATE",
        "new": json.dumps({"action": "duplicate_override", "new_patient_id": 42, "matched_patient_id": 17, "performed_by_user_id": current_user.id}),
    },
)
await self.session.commit()
```

### Verified: Existing `_isolation_filter()` usage pattern (from `backend/app/repositories/base.py`)

```python
# PatientRepository inherits BaseRepository
class PatientRepository(BaseRepository):
    async def list_own_bhs(self) -> list[Patient]:
        stmt = select(Patient).order_by(Patient.last_name)
        stmt = self._isolation_filter(stmt, Patient)  # adds WHERE health_station_id = user.health_station_id
        result = await self.session.execute(stmt)
        return list(result.scalars().all())
```

### Verified: Existing router + service instantiation pattern (from `backend/app/routers/admin.py`)

```python
@router.post("/patients", response_model=PatientResponse, status_code=201)
async def create_patient(
    body: PatientCreate,
    db: AsyncDB,
    current_user: CurrentUser,
    _=require_role(["nurse", "midwife"]),
):
    svc = PatientService(db, current_user)
    return await svc.create_patient(body)
```

### Verified: Existing page structure pattern (from `frontend/src/pages/admin/CreateUserPage.tsx`)

```typescript
export function RegisterPatientPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  // form state ...
  // duplicate state: DuplicateMatch[] | null

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      // Step 1: check duplicate
      const dupes = await checkDuplicate(lastName, firstName, birthdate);
      if (dupes.length > 0 && !forceCreate) {
        setDuplicateMatches(dupes);  // show warning card
        return;
      }
      // Step 2: create patient (with possible_duplicate flag if forceCreate)
      await createPatient({ ...formData, possible_duplicate: forceCreate });
      toast.success("Patient registered.");
      navigate("/patients");
    } catch (err) {
      toast.error("Could not save patient record. Check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  };
  // ...
}
```

### Verified: BMI computed field (Pydantic v2 `@computed_field`)

```python
from pydantic import BaseModel, computed_field

class ConsultationResponse(BaseModel):
    weight: float | None
    height: float | None

    @computed_field
    @property
    def bmi(self) -> float | None:
        if self.weight and self.height and self.height > 0:
            height_m = self.height / 100
            return round(self.weight / (height_m ** 2), 1)
        return None

    model_config = {"from_attributes": True}
```

---

## State of the Art

| Old Approach | Current Approach | Impact |
|--------------|------------------|--------|
| `lazy="select"` SQLAlchemy relationships | `lazy="raise"` + explicit joinedload() | Prevents N+1 queries; mandatory per CLAUDE.md |
| python-jose for JWT | PyJWT 2.12 + pwdlib[argon2] | Shipped in Phase 2; carry forward |
| Sheets for create/edit forms | Dedicated pages (per UI-SPEC.md user clarification) | Phase 3 uses dedicated pages; NOT Sheets despite CONTEXT.md initially suggesting Sheet for consultation |

**Deprecated/outdated:**
- Sheet pattern for Add Consultation: The UI-SPEC.md explicitly states "This is a dedicated page, NOT a sheet or modal. Source: user clarification decision." The CONTEXT.md mentions "Sheet side panel" in §Patient Profile Page but the UI-SPEC overrides this.

---

## Open Questions

1. **`barangay_psgc_code` for patient vs. `health_station_id`**
   - What we know: `patients.barangay_psgc_code` is the patient's home barangay (for GIS Phase 7 choropleth). `patients.health_station_id` is the registering BHS. These are different concepts.
   - What's unclear: Should the barangay Select on the registration form show ALL 32 barangays or only the one for the nurse's BHS? A patient from Burol may register at Burol I BHS if they're visiting nearby.
   - Recommendation: Show all 32 barangays (the `HEALTH_STATIONS` constant pattern can be replicated for barangays — fetch from `GET /barangays` or use a static constant seeded from Phase 1 data). This gives GIS accuracy without restricting registration.

2. **Vitals range validation boundaries**
   - What we know: Backend validates range only when a field is provided (CONTEXT.md decision).
   - What's unclear: Exact physiological limits to enforce (e.g., BP systolic: 60–300 mmHg? Temperature: 34–43°C?).
   - Recommendation: Use standard clinical bounds (BP systolic 50–300, diastolic 30–200, HR 20–300, RR 4–80, temp 33.0–43.0, weight 0.5–300kg, height 20–250cm). Implement as Pydantic `@field_validator` with HTTP 422 response.

3. **Consultation `recorded_by` display name**
   - What we know: `consultations.recorded_by_id FK → users.id`. The consultations table shows "Recorded By" column.
   - What's unclear: The consultations list query needs to join `users.full_name`. This requires `joinedload(Consultation.recorded_by)` or a separate query. With `lazy="raise"`, the join must be explicit.
   - Recommendation: Add `joinedload(Consultation.recorded_by)` in the repository `list_by_patient()` method. The consultation response schema includes `recorded_by_name: str` populated from the joined user.

4. **Patient profile read-only for BHS nurses viewing cross-BHS results**
   - What we know: City-wide results for BHS-level roles are "read-only". The UI shows a "View Only" badge.
   - What's unclear: Should the backend reject PUT/PATCH on cross-BHS patients for BHS-level roles, or is this frontend-only enforcement?
   - Recommendation: Enforce at both layers. Service layer checks `patient.health_station_id != current_user.health_station_id` for BHS-level roles and raises HTTP 403. Frontend hides edit controls. Belt-and-suspenders for clinical data integrity.

5. **INFRA-04 fix scope**
   - What we know: The GIS data mount bug must be fixed before Phase 3 migrations can run successfully in Docker.
   - What's unclear: Is this a developer prerequisite handled outside the planning scope, or should it be a task in Phase 3 Wave 0?
   - Recommendation: Include as Wave 0 task: "Verify INFRA-04 GIS mount fix; confirm `alembic upgrade head` runs cleanly through 0003 before creating 0004."

---

## Validation Architecture

Nyquist validation is enabled (`workflow.nyquist_validation: true` in `.planning/config.json`).

### Test Framework
| Property | Value |
|----------|-------|
| Framework | pytest + pytest-asyncio (existing, confirmed in `backend/tests/conftest.py`) |
| Config file | `backend/pytest.ini` or `backend/pyproject.toml` (check existing) |
| Quick run command | `docker-compose exec backend pytest tests/test_patients/ -x -q` |
| Full suite command | `docker-compose exec backend pytest -x -q` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| PAT-01 | Patient registration creates record with all required fields | integration | `pytest tests/test_patients/test_patient_create.py -x` | ❌ Wave 0 |
| PAT-02 | Duplicate detection returns matching patient on exact name+birthdate | unit | `pytest tests/test_patients/test_duplicate_detection.py -x` | ❌ Wave 0 |
| PAT-03 | `_isolation_filter()` applied to BHS-scoped search | unit | `pytest tests/test_patients/test_patient_repository.py::test_bhs_scoped_search -x` | ❌ Wave 0 |
| PAT-04 | City-wide search returns patients from all BHS | integration | `pytest tests/test_patients/test_patient_repository.py::test_city_wide_search -x` | ❌ Wave 0 |
| PAT-05 | "Register Anyway" sets `possible_duplicate=True` and writes audit log | integration | `pytest tests/test_patients/test_duplicate_override.py -x` | ❌ Wave 0 |
| PAT-06 | Consultation creation requires `chief_complaint` (422 without it) | integration | `pytest tests/test_patients/test_consultation_create.py::test_missing_chief_complaint -x` | ❌ Wave 0 |
| PAT-07 | BHW role receives 403 on all patient endpoints | integration | `pytest tests/test_patients/test_patient_rbac.py::test_bhw_blocked -x` | ❌ Wave 0 |
| PAT-08 | Nurse cannot edit patient from different BHS (403) | integration | `pytest tests/test_patients/test_patient_rbac.py::test_cross_bhs_edit_blocked -x` | ❌ Wave 0 |
| PAT-09 | CHO/DSO can list patients from all BHS (read-only) | integration | `pytest tests/test_patients/test_patient_rbac.py::test_cho_city_wide_read -x` | ❌ Wave 0 |
| PAT-10 | Soft-deleted patient not returned in search results | unit | `pytest tests/test_patients/test_soft_delete.py -x` | ❌ Wave 0 |
| PAT-11 | GIN name search returns results for partial name prefix | integration | `pytest tests/test_patients/test_patient_search.py::test_partial_name_search -x` | ❌ Wave 0 |
| PAT-12 | BMI computed field correct (weight/height^2) | unit | `pytest tests/test_patients/test_consultation_schema.py::test_bmi_computed -x` | ❌ Wave 0 |

### Sampling Rate
- **Per task commit:** `docker-compose exec backend pytest tests/test_patients/ -x -q`
- **Per wave merge:** `docker-compose exec backend pytest -x -q`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `backend/tests/test_patients/__init__.py` — module marker
- [ ] `backend/tests/test_patients/test_patient_create.py` — covers PAT-01
- [ ] `backend/tests/test_patients/test_duplicate_detection.py` — covers PAT-02
- [ ] `backend/tests/test_patients/test_patient_repository.py` — covers PAT-03, PAT-04
- [ ] `backend/tests/test_patients/test_duplicate_override.py` — covers PAT-05
- [ ] `backend/tests/test_patients/test_consultation_create.py` — covers PAT-06
- [ ] `backend/tests/test_patients/test_patient_rbac.py` — covers PAT-07, PAT-08, PAT-09
- [ ] `backend/tests/test_patients/test_soft_delete.py` — covers PAT-10
- [ ] `backend/tests/test_patients/test_patient_search.py` — covers PAT-11
- [ ] `backend/tests/test_patients/test_consultation_schema.py` — covers PAT-12
- [ ] No new `conftest.py` fixtures needed — existing `async_engine`, `db_session`, `async_client` fixtures from `tests/conftest.py` are reusable

---

## Dependencies on Existing Code

| Existing File | How Phase 3 Depends on It |
|---------------|--------------------------|
| `backend/app/core/base.py` | `Patient` and `Consultation` models must inherit `TimestampMixin, SoftDeleteMixin, Base` |
| `backend/app/repositories/base.py` | `PatientRepository(BaseRepository)` and `ConsultationRepository(BaseRepository)`; import `CROSS_BHS_ROLES` for city-wide toggle |
| `backend/app/core/dependencies.py` | `AsyncDB`, `CurrentUser`, `require_role()` used in all patient routers |
| `backend/app/models/health_station.py` | FK target `health_stations.id`; `Patient.health_station = relationship("HealthStation", lazy="raise")` |
| `backend/app/models/barangay.py` | FK target `barangays.psgc_code`; `Patient.barangay = relationship("Barangay", lazy="raise")` |
| `backend/alembic/versions/0003_users_and_sessions.py` | Phase 3 migration `0004` sets `down_revision = "0003"` |
| `backend/app/models/__init__.py` | Must add `Patient`, `Consultation` imports for Alembic autogenerate |
| `frontend/src/App.tsx` | Add `/patients/*` routes in ProtectedRoute block |
| `frontend/src/layouts/AppShell.tsx` | Add `"/patients"` to `PAGE_TITLES` |
| `frontend/src/components/app-sidebar.tsx` | Add "Patients" nav item to `NAV_ITEMS` with appropriate roles |
| `frontend/src/lib/axios.ts` | Used as-is; `features/patients/api.ts` imports `api` from it |
| `frontend/src/hooks/useAuth.ts` | Used in patient pages for `user.health_station_id` and `user.roles` to determine read-only state |

---

## Recommended Implementation Order

### Wave 0 — Foundation (no dependencies on Wave 1+)
1. Fix INFRA-04 GIS mount bug (prerequisite for migrations)
2. Create `backend/app/models/patient.py` and `consultation.py`
3. Update `backend/app/models/__init__.py` to export new models
4. Create `backend/alembic/versions/0004_patients_and_consultations.py` (both tables + indexes)
5. Run `docker-compose exec backend alembic upgrade head`
6. Create all test files (`tests/test_patients/`) — test fixtures only, no implementation yet
7. Create `backend/app/schemas/patient.py` (all request + response schemas including computed BMI)

### Wave 1 — Backend API
8. Create `backend/app/repositories/patient.py` (PatientRepository + ConsultationRepository)
9. Create `backend/app/services/patient.py` (PatientService with duplicate check + audit write)
10. Create `backend/app/routers/patients.py` (all routes + RBAC)
11. Register router in `backend/app/main.py`
12. Run Wave 0 test suite against Wave 1 implementation

### Wave 2 — Frontend
13. Create `frontend/src/features/patients/types.ts`
14. Create `frontend/src/features/patients/api.ts`
15. Create `frontend/src/pages/patients/PatientsPage.tsx` (search + table + pagination)
16. Create `frontend/src/pages/patients/RegisterPatientPage.tsx` (form + duplicate warning)
17. Create `frontend/src/pages/patients/PatientProfilePage.tsx` (header card + consultations tab)
18. Create `frontend/src/pages/patients/AddConsultationPage.tsx` (vitals form)
19. Register routes in `App.tsx` + update AppShell titles + update sidebar nav

---

## Sources

### Primary (HIGH confidence)
- `backend/app/core/base.py` — TimestampMixin, SoftDeleteMixin, do_orm_execute hook (read directly)
- `backend/app/repositories/base.py` — BaseRepository, CROSS_BHS_ROLES, _isolation_filter (read directly)
- `backend/app/core/dependencies.py` — AsyncDB, CurrentUser, require_role (read directly)
- `backend/app/services/admin.py` — _write_audit() pattern, service layer structure (read directly)
- `backend/alembic/versions/0001_initial_schema.py` — audit_logs DDL, RULE/TRIGGER pattern (read directly)
- `backend/alembic/versions/0003_users_and_sessions.py` — migration structure, ARRAY type, indexes (read directly)
- `backend/alembic/env.py` — async Alembic configuration (read directly)
- `frontend/src/App.tsx` — route registration pattern (read directly)
- `frontend/src/features/admin/api.ts` — feature API module pattern (read directly)
- `frontend/src/features/admin/types.ts` — TypeScript type pattern (read directly)
- `frontend/src/pages/admin/CreateUserPage.tsx` — dedicated page UX pattern (read directly)
- `frontend/src/layouts/AppShell.tsx` — page title + layout pattern (read directly)
- `frontend/src/components/app-sidebar.tsx` — nav item pattern (read directly)
- `.planning/phases/03-patient-itr-core-data-model/03-CONTEXT.md` — locked decisions (read directly)
- `.planning/phases/03-patient-itr-core-data-model/03-UI-SPEC.md` — UI design contract (read directly)

### Secondary (MEDIUM confidence)
- PostgreSQL `to_tsvector` / `to_tsquery` with `simple` dictionary + `:*` prefix operator: standard PostgreSQL documentation pattern; applied to this project's use case
- Pydantic v2 `@computed_field` for BMI: standard Pydantic v2 pattern

### Tertiary (LOW confidence)
- None — all findings verified directly against existing project code

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all dependencies already installed, verified in existing code
- Architecture patterns: HIGH — all patterns extrapolated directly from Phase 1–2 code with zero inference gaps
- Pitfalls: HIGH — most pitfalls identified from direct code reading; ENUM and GIN pitfalls are well-known PostgreSQL/SQLAlchemy patterns
- Validation architecture: HIGH — test framework and conftest confirmed from existing test files

**Research date:** 2026-03-18
**Valid until:** 2026-04-18 (stable stack, 30-day window; no fast-moving dependencies)
