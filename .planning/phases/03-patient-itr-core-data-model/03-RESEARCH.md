# Phase 3: Patient ITR + Core Data Model - Research

**Researched:** 2026-03-18
**Domain:** Patient registration, clinical data model, full-text search, BHS-scoped CRUD
**Confidence:** HIGH

## Summary

Phase 3 establishes the foundational patient data model that every subsequent clinical phase (4-8) depends on via `patient_id` FK. The core deliverables are: (1) `patients` table with city-wide duplicate detection, (2) `consultations` table with hybrid vitals storage, (3) full-text GIN-indexed name search with BHS-scoped and city-wide toggle, (4) patient registration and profile UI, and (5) consultation recording via Sheet side panel.

The technical stack is entirely within what Phase 1-2 already established: SQLAlchemy 2.0 async models with `TimestampMixin` + `SoftDeleteMixin`, repositories inheriting `BaseRepository` with `_isolation_filter()`, FastAPI routers with `require_role()`, and React + shadcn/ui frontend. The primary new technical element is PostgreSQL full-text search via `tsvector` computed column with GIN index, using the `'simple'` text search configuration (not `'english'`) because Filipino personal names must not be stemmed.

**Primary recommendation:** Use a STORED generated `tsvector` column on `patients` (concatenating `last_name` and `first_name`) with a GIN index, queried via `to_tsquery('simple', term || ':*')` for prefix matching. Duplicate detection uses a simple case-insensitive exact match on `(lower(last_name), lower(first_name), birthdate)` with a unique partial index to prevent accidental duplicates while allowing intentional overrides.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **Role Access:** Nurse/Midwife: full CRUD. Physician: create consultations + view. CHO/DSO/PHIS Coordinator: read-only city-wide. BHW: zero access in Phase 3.
- **Vitals Model:** Hybrid approach -- core vitals as discrete typed columns (`bp_systolic INT`, `bp_diastolic INT`, `heart_rate INT`, `respiratory_rate INT`, `temperature NUMERIC(4,1)`, `weight NUMERIC(5,2)`, `height NUMERIC(5,2)`); additional vitals in `vitals_extra JSONB`. BMI computed on read. All vitals optional.
- **Consultation Record:** Fields: `chief_complaint TEXT` (required), discrete vitals + `vitals_extra JSONB` (optional), `diagnosis TEXT` (free text, optional), `referring_to TEXT` nullable. No full SOAP note.
- **Patient Identity Fields:** Required at registration: `last_name`, `first_name`, `middle_name` (nullable), `birthdate DATE`, `sex ENUM('male','female')`, `barangay_psgc_code TEXT FK`, `address_line TEXT` nullable, `health_station_id INT FK`, `mobile_number TEXT` nullable. Extended fields deferred.
- **Duplicate Detection:** Exact case-insensitive match on `last_name + first_name + birthdate`. City-wide scope. Warning card UX with "Use existing patient" and "Continue anyway" actions. `possible_duplicate BOOLEAN DEFAULT FALSE` flag.
- **Patient Search:** Default BHS-scoped, city-wide toggle. GIN index on `last_name + first_name` tsvector. Case-insensitive, partial-match. Dedicated `/patients` route with search bar, sortable table, Register button.
- **Patient Profile Page:** Header card (name, birthdate, sex, age, BHS) + Consultations tab only. No placeholder tabs. Consultations table sorted newest first. Add Consultation via Sheet side panel.

### Claude's Discretion
- Auto-generated `patient_id` format (e.g., sequential INT PK, or formatted code like `BHS##-YYYYNNNN`).
- GIN index definition and tsvector configuration for name search.
- Alembic migration structure for `patients` and `consultations` tables.
- Error message wording for duplicate warning and city-wide read-only enforcement.
- Exact consultation form field layout within the Sheet panel.

### Deferred Ideas (OUT OF SCOPE)
- BHW patient access -- zero BHW access in Phase 3; all BHW-facing UI is Phase 9.
- `local_id UUID` + `status record_status` sync columns -- add via migration in Phase 9.
- PhilHealth ID + membership type -- defer to Phase 8 or later.
- Civil status / occupation -- defer to Phase 8 (FHSIS).
- Guardian / emergency contact -- defer to Phase 4.
- Global Cmd+K patient search -- defer to polish/UX phase.
- Patient merge / deactivate duplicate workflow -- defer to admin tooling.
- ICD-10 code picker / autocomplete -- defer; free text sufficient.
- Program tabs on patient profile (Prenatal, EPI, TB, NCD) -- added in Phases 4-8.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| P3-01 | `patients` table with all identity fields, FKs, soft delete, timestamps | SQLAlchemy model pattern with `TimestampMixin` + `SoftDeleteMixin`; Alembic migration |
| P3-02 | `consultations` table with hybrid vitals (discrete + JSONB), FK to patients | SQLAlchemy model; vitals validation in Pydantic schema |
| P3-03 | City-wide duplicate detection on `(last_name, first_name, birthdate)` | Case-insensitive exact match; `possible_duplicate` flag; audit logging |
| P3-04 | Full-text GIN-indexed patient search (BHS-scoped default, city-wide toggle) | PostgreSQL tsvector STORED generated column with `'simple'` config; prefix matching |
| P3-05 | Patient registration form with duplicate check pre-save | Frontend Sheet/page form; backend POST endpoint with duplicate check response |
| P3-06 | Patient profile page with header card + consultations table | Frontend route `/patients/:id`; backend GET endpoints |
| P3-07 | Add consultation via Sheet side panel | Frontend Sheet form; backend POST endpoint; vitals validation |
| P3-08 | RBAC enforcement: nurse/midwife CRUD, physician view+consult, CHO/DSO/PHIS read-only | `require_role()` at router layer; `_isolation_filter()` at repo layer |
| P3-09 | City-wide search results are read-only for BHS-level roles | Frontend disables edit actions; backend enforces via isolation filter |
| P3-10 | Audit logging for registration and duplicate-override events | `audit_logs` INSERT via existing pattern from AdminService |
</phase_requirements>

## Standard Stack

### Core (already installed -- extend, don't add)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| SQLAlchemy | 2.0+ (async) | ORM models for `patients`, `consultations` | Already used; `TimestampMixin`, `SoftDeleteMixin`, `Base` established |
| Alembic | (project version) | Migration for new tables + GIN index | Already configured with async engine + GeoAlchemy2 helpers |
| FastAPI | (project version) | Patient and consultation API routers | `require_role()`, `CurrentUser`, `AsyncDB` dependencies established |
| Pydantic v2 | (project version) | Request/response schemas with validation | `model_config = {"from_attributes": True}` pattern established |
| PostgreSQL | 15+ with PostGIS | tsvector, GIN index, JSONB, NUMERIC types | Already running in Docker |
| React + TypeScript | 19.x + 5.9 | Patient UI pages and components | Vite 8.0, react-router-dom 7.x |
| shadcn/ui | 4.0.8 (base-nova) | Table, Sheet, Badge, Tabs, Pagination, Skeleton, Input | Already installed -- all needed components available |
| Axios | 1.13.x | API client for patient/consultation endpoints | Interceptor pattern with token refresh established |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| lucide-react | 0.577.x | Icons for patient UI (User, Search, Plus, etc.) | Already installed; use `data-icon` pattern per shadcn rules |

### No New Dependencies Required

Phase 3 requires zero new Python or npm packages. Everything needed is already in the stack:
- PostgreSQL native `tsvector` + `to_tsquery` + GIN index (no pg_trgm extension needed)
- SQLAlchemy `Computed` + `TSVECTOR` from `sqlalchemy.dialects.postgresql`
- Pydantic `NUMERIC` validation via `condecimal` or `Field(ge=..., le=...)`
- shadcn `table`, `sheet`, `tabs`, `badge`, `pagination`, `skeleton`, `input` already installed

## Architecture Patterns

### Recommended Backend Structure (new files)

```
backend/app/
├── models/
│   ├── patient.py          # Patient ORM model
│   └── consultation.py     # Consultation ORM model
├── schemas/
│   ├── patient.py          # PatientCreate, PatientResponse, PatientListItem, DuplicateCheckResponse
│   └── consultation.py     # ConsultationCreate, ConsultationResponse
├── repositories/
│   ├── patient.py          # PatientRepository(BaseRepository)
│   └── consultation.py     # ConsultationRepository(BaseRepository)
├── services/
│   └── patient.py          # PatientService (registration, duplicate check, search)
├── routers/
│   └── patient.py          # /patients and /patients/{id}/consultations routes
```

### Recommended Frontend Structure (new files)

```
frontend/src/
├── features/
│   └── patients/
│       ├── api.ts           # API client functions
│       ├── types.ts         # TypeScript interfaces
│       └── components/
│           ├── PatientSearchBar.tsx
│           ├── PatientTable.tsx
│           ├── PatientRegistrationForm.tsx
│           ├── DuplicateWarningCard.tsx
│           ├── PatientProfileHeader.tsx
│           ├── ConsultationTable.tsx
│           └── ConsultationForm.tsx
├── pages/
│   └── patients/
│       ├── PatientsPage.tsx    # /patients - search + list
│       └── PatientProfilePage.tsx  # /patients/:id - profile + consultations
```

### Pattern 1: Patient Model with tsvector Computed Column

**What:** A STORED generated column that auto-updates a tsvector index whenever `last_name` or `first_name` changes.

**When to use:** On the `patients` model -- this is the foundation for fast name search.

**Why `'simple'` not `'english'`:** Filipino names (e.g., "dela Cruz", "Santos", "Villanueva") must not be stemmed. The `'english'` config would stem "Santos" and potentially distort results. The `'simple'` config tokenizes and lowercases without stemming -- exactly what name search needs.

**Example:**
```python
# Source: PostgreSQL 18 docs + SQLAlchemy 2.1 docs
from sqlalchemy import Index, Computed, Text, Integer, Date, Boolean, ForeignKey, Numeric
from sqlalchemy.dialects.postgresql import TSVECTOR, JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.base import Base, TimestampMixin, SoftDeleteMixin


class Patient(TimestampMixin, SoftDeleteMixin, Base):
    __tablename__ = "patients"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    last_name: Mapped[str] = mapped_column(Text, nullable=False)
    first_name: Mapped[str] = mapped_column(Text, nullable=False)
    middle_name: Mapped[str | None] = mapped_column(Text, nullable=True)
    birthdate: Mapped[date] = mapped_column(Date, nullable=False)
    sex: Mapped[str] = mapped_column(Text, nullable=False)  # 'male' or 'female'
    barangay_psgc_code: Mapped[str] = mapped_column(
        Text, ForeignKey("barangays.psgc_code"), nullable=False
    )
    address_line: Mapped[str | None] = mapped_column(Text, nullable=True)
    health_station_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("health_stations.id"), nullable=False
    )
    mobile_number: Mapped[str | None] = mapped_column(Text, nullable=True)
    possible_duplicate: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    # STORED generated tsvector for full-text search
    search_vector: Mapped[object] = mapped_column(
        TSVECTOR,
        Computed(
            "to_tsvector('simple', coalesce(last_name, '') || ' ' || coalesce(first_name, ''))",
            persisted=True,
        ),
    )

    # Relationships
    consultations = relationship("Consultation", back_populates="patient", lazy="raise")
    barangay = relationship("Barangay", lazy="raise")
    health_station = relationship("HealthStation", lazy="raise")

    __table_args__ = (
        Index("ix_patients_search_vector", "search_vector", postgresql_using="gin"),
        Index("ix_patients_health_station_id", "health_station_id"),
        Index("ix_patients_barangay_psgc_code", "barangay_psgc_code"),
    )
```

### Pattern 2: Repository with BHS Isolation and City-Wide Toggle

**What:** `PatientRepository` inherits `BaseRepository`, using `_isolation_filter()` for default BHS scoping. City-wide search uses a separate method that skips isolation.

**When to use:** For patient search and listing.

**Example:**
```python
# Source: existing BaseRepository pattern from Phase 2
from sqlalchemy import select, func
from app.repositories.base import BaseRepository, CROSS_BHS_ROLES
from app.models.patient import Patient


class PatientRepository(BaseRepository):

    async def search(self, query_text: str, city_wide: bool = False) -> list[Patient]:
        """Search patients by name using tsvector GIN index.
        Default: BHS-scoped. If city_wide=True and user has BHS-level role,
        skip isolation filter (results are read-only in frontend)."""
        tsquery = func.to_tsquery("simple", query_text + ":*")
        stmt = select(Patient).where(Patient.search_vector.op("@@")(tsquery))

        if not city_wide:
            stmt = self._isolation_filter(stmt, Patient)
        # city_wide + CROSS_BHS_ROLES: no filter needed (they always see all)
        # city_wide + BHS-role: intentionally skip filter for read-only results

        return list((await self.session.execute(stmt)).scalars().all())

    async def check_duplicate(
        self, last_name: str, first_name: str, birthdate: date
    ) -> Patient | None:
        """City-wide duplicate check -- always checks all BHS."""
        stmt = select(Patient).where(
            func.lower(Patient.last_name) == last_name.lower(),
            func.lower(Patient.first_name) == first_name.lower(),
            Patient.birthdate == birthdate,
        )
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()
```

### Pattern 3: Consultation Model with Hybrid Vitals

**What:** Core vitals as discrete typed columns for validation and querying; `vitals_extra` JSONB for extensibility.

**Example:**
```python
class Consultation(TimestampMixin, SoftDeleteMixin, Base):
    __tablename__ = "consultations"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    patient_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("patients.id"), nullable=False
    )
    recorded_by: Mapped[int] = mapped_column(
        Integer, ForeignKey("users.id"), nullable=False
    )
    chief_complaint: Mapped[str] = mapped_column(Text, nullable=False)

    # Discrete vitals -- all optional
    bp_systolic: Mapped[int | None] = mapped_column(Integer, nullable=True)
    bp_diastolic: Mapped[int | None] = mapped_column(Integer, nullable=True)
    heart_rate: Mapped[int | None] = mapped_column(Integer, nullable=True)
    respiratory_rate: Mapped[int | None] = mapped_column(Integer, nullable=True)
    temperature: Mapped[Decimal | None] = mapped_column(Numeric(4, 1), nullable=True)
    weight: Mapped[Decimal | None] = mapped_column(Numeric(5, 2), nullable=True)
    height: Mapped[Decimal | None] = mapped_column(Numeric(5, 2), nullable=True)
    vitals_extra: Mapped[dict | None] = mapped_column(JSONB, nullable=True)

    diagnosis: Mapped[str | None] = mapped_column(Text, nullable=True)
    referring_to: Mapped[str | None] = mapped_column(Text, nullable=True)

    # Relationships
    patient = relationship("Patient", back_populates="consultations", lazy="raise")
    recorded_by_user = relationship("User", lazy="raise")

    __table_args__ = (
        Index("ix_consultations_patient_id", "patient_id"),
    )
```

### Pattern 4: Router with Multi-Role Access Levels

**What:** A single router with different access levels per endpoint, matching the Phase 2 admin router pattern.

**Example:**
```python
from fastapi import APIRouter, Depends
from app.core.dependencies import AsyncDB, CurrentUser, require_role

# All clinical roles that can access patient data (excludes BHW and system_admin)
PATIENT_READ_ROLES = [
    "nurse", "midwife", "physician",
    "city_health_officer", "phis_coordinator", "disease_surveillance_officer"
]
PATIENT_WRITE_ROLES = ["nurse", "midwife"]
CONSULTATION_WRITE_ROLES = ["nurse", "midwife", "physician"]

router = APIRouter(prefix="/patients", tags=["patients"])

@router.get("/", response_model=PatientSearchResponse)
async def search_patients(
    q: str = "",
    city_wide: bool = False,
    page: int = 1,
    page_size: int = 20,
    db: AsyncDB,
    current_user: CurrentUser,
    _=Depends(require_role(PATIENT_READ_ROLES)),
):
    ...

@router.post("/", response_model=PatientResponse, status_code=201)
async def register_patient(
    body: PatientCreateRequest,
    db: AsyncDB,
    current_user: CurrentUser,
    _=Depends(require_role(PATIENT_WRITE_ROLES)),
):
    ...
```

### Pattern 5: Pagination Response Schema

**What:** A generic paginated response pattern for patient search results.

**Example:**
```python
from pydantic import BaseModel
from typing import Generic, TypeVar

T = TypeVar("T")

class PaginatedResponse(BaseModel, Generic[T]):
    items: list[T]
    total: int
    page: int
    page_size: int
    total_pages: int
```

### Anti-Patterns to Avoid

- **Do NOT bypass `_isolation_filter()` by modifying BaseRepository.** Instead, add a `city_wide` parameter to the search method that conditionally skips the filter.
- **Do NOT store BMI in the database.** It is computed on read from weight/height. Storing it creates stale data risk.
- **Do NOT create a separate "city-wide search" endpoint.** Use a query parameter (`city_wide=True`) on the same search endpoint.
- **Do NOT use `'english'` text search configuration** for Filipino name search -- it applies stemming that distorts proper nouns.
- **Do NOT use `plainto_tsquery()` for prefix matching** -- it does not support the `:*` prefix operator. Use `to_tsquery('simple', term || ':*')`.
- **Do NOT add `local_id UUID` or `status record_status` columns** -- these are Phase 9 (offline sync).
- **Do NOT create program tabs (Prenatal, EPI, TB, NCD)** on the patient profile page -- those come in Phases 4-8.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Full-text name search | Custom LIKE/ILIKE queries | PostgreSQL tsvector + GIN + `to_tsquery` | GIN is 3x faster than GiST; tsvector handles tokenization, prefix matching natively |
| Pagination metadata | Manual count queries | Single query with `func.count().over()` window function, or separate COUNT query | Consistent pattern; avoids N+1 count queries |
| Vitals range validation | Custom if/else chains | Pydantic v2 `Field(ge=..., le=...)` validators | Declarative, auto-documented, generates OpenAPI schema |
| Date/age computation | Manual date arithmetic | Python `date.today() - birthdate` for age; Pydantic computed field | Avoids timezone bugs; single computation point |
| Soft delete filtering | Manual WHERE clauses | `SoftDeleteMixin` + `do_orm_execute` hook (already exists) | Automatic; cannot forget the filter |
| BHS data isolation | Manual WHERE on every query | `BaseRepository._isolation_filter()` (already exists) | Single enforcement point; prevents data leakage |

**Key insight:** Phase 3 has zero novel infrastructure needs. Every "hard" problem (soft deletes, RBAC, BHS isolation, audit logging) was already solved in Phase 1-2. The work is extending established patterns to a new domain.

## Common Pitfalls

### Pitfall 1: Using `'english'` Text Search Config for Names
**What goes wrong:** Filipino names get stemmed -- "Santos" might be reduced, "dela" might be treated as a stop word and removed entirely.
**Why it happens:** `'english'` is the PostgreSQL default and most examples use it.
**How to avoid:** Always use `'simple'` for personal name search. `'simple'` tokenizes on whitespace and lowercases, but does not stem or remove stop words.
**Warning signs:** Search for "dela Cruz" returns no results; search for "Santos" behaves unexpectedly.

### Pitfall 2: Alembic Autogenerate Detects tsvector Index Changes Every Run
**What goes wrong:** Alembic autogenerate cannot reflect expression-based indexes (like GIN on a computed tsvector column), so it generates a DROP+CREATE migration for the index on every `alembic revision --autogenerate`.
**Why it happens:** PostgreSQL dialect does not support reflecting expression-based indexes (sqlalchemy/alembic#1390).
**How to avoid:** Write the GIN index creation as raw SQL in `op.execute()` inside the migration, not via `op.create_index()`. This avoids autogenerate interference. Alternatively, use `op.create_index()` but add `ix_patients_search_vector` to an exclude list in `env.py`.
**Warning signs:** Every autogenerate produces a migration that drops and recreates the same index.

### Pitfall 3: plainto_tsquery Does Not Support Prefix Matching
**What goes wrong:** Typing "San" in the search bar returns zero results for "Santos" because `plainto_tsquery` does not support the `:*` prefix operator.
**Why it happens:** `plainto_tsquery()` strips all punctuation including `:*`. Only `to_tsquery()` supports prefix matching.
**How to avoid:** Use `func.to_tsquery('simple', sanitized_term + ':*')` for the search query.
**Warning signs:** Partial name searches return empty results; only exact full-word matches work.

### Pitfall 4: City-Wide Search Allows BHS-Level Roles to Edit Other BHS Patients
**What goes wrong:** A nurse at BHS-1 searches city-wide, clicks a patient from BHS-5, and edits their record.
**Why it happens:** The city-wide toggle bypasses `_isolation_filter()`, and if the edit endpoint doesn't re-check BHS ownership, the nurse can modify data they shouldn't.
**How to avoid:** City-wide search bypasses isolation only on the GET/search endpoint. All mutation endpoints (PUT, POST consultation) must enforce BHS isolation. Frontend should also disable edit actions for cross-BHS results.
**Warning signs:** Test: nurse at BHS-1 creates a consultation for a patient at BHS-5 -- should return 403.

### Pitfall 5: Missing `health_station_id` on Patient Registration
**What goes wrong:** Patient is registered without a `health_station_id`, breaking `_isolation_filter()` queries.
**Why it happens:** Frontend might not send `health_station_id` if it's not in the form.
**How to avoid:** Auto-set `health_station_id` from `current_user.health_station_id` in the service layer, not from the request body. The registering nurse's BHS is the patient's BHS.
**Warning signs:** Patients with NULL `health_station_id` appear in no one's search results.

### Pitfall 6: Computed Column Not Persisted
**What goes wrong:** The tsvector column is VIRTUAL instead of STORED, so the GIN index cannot be created (GIN requires materialized data).
**Why it happens:** Forgetting `persisted=True` in the `Computed()` construct.
**How to avoid:** Always use `Computed(..., persisted=True)` for tsvector columns. PostgreSQL requires STORED for GIN indexing.
**Warning signs:** Migration fails with "index on virtual column" error.

### Pitfall 7: Forgetting to Sanitize Search Input for to_tsquery
**What goes wrong:** User types `O'Brien` or `&` in the search box, and `to_tsquery` throws a syntax error because these characters have special meaning in tsquery syntax.
**Why it happens:** `to_tsquery()` expects tsquery syntax, not plain text.
**How to avoid:** Strip all non-alphanumeric characters (except spaces) from the search input before building the tsquery. Or use `websearch_to_tsquery('simple', term)` (PostgreSQL 11+) which handles plain text safely, but note it does not support `:*` prefix matching directly. The safest approach: sanitize input by removing special characters, split on whitespace, append `:*` to each token, join with `&`.
**Warning signs:** 500 error on search input containing apostrophes, ampersands, or colons.

### Pitfall 8: Not Registering New Models in `__init__.py`
**What goes wrong:** Alembic autogenerate does not detect the new `patients` or `consultations` tables.
**Why it happens:** `alembic/env.py` imports from `app.models` which re-exports models via `__init__.py`. If new models aren't added to `__init__.py`, they're invisible to Alembic.
**How to avoid:** Add `from app.models.patient import Patient` and `from app.models.consultation import Consultation` to `app/models/__init__.py`.
**Warning signs:** `alembic revision --autogenerate` produces an empty migration.

## Code Examples

### Alembic Migration for Patients Table with GIN Index

```python
# Source: PostgreSQL 18 docs + existing 0003_users_and_sessions.py pattern
def upgrade() -> None:
    # Patients table
    op.create_table(
        "patients",
        sa.Column("id", sa.Integer, primary_key=True, autoincrement=True),
        sa.Column("last_name", sa.Text, nullable=False),
        sa.Column("first_name", sa.Text, nullable=False),
        sa.Column("middle_name", sa.Text, nullable=True),
        sa.Column("birthdate", sa.Date, nullable=False),
        sa.Column("sex", sa.Text, nullable=False),
        sa.Column("barangay_psgc_code", sa.Text,
                  sa.ForeignKey("barangays.psgc_code"), nullable=False),
        sa.Column("address_line", sa.Text, nullable=True),
        sa.Column("health_station_id", sa.Integer,
                  sa.ForeignKey("health_stations.id"), nullable=False),
        sa.Column("mobile_number", sa.Text, nullable=True),
        sa.Column("possible_duplicate", sa.Boolean, nullable=False,
                  server_default=sa.false()),
        sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True),
                  server_default=sa.text("NOW()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True),
                  server_default=sa.text("NOW()"), nullable=False),
    )

    # Add tsvector generated column via raw SQL (Alembic op.add_column
    # does not handle GENERATED ALWAYS AS well for expression columns)
    op.execute("""
        ALTER TABLE patients ADD COLUMN search_vector tsvector
        GENERATED ALWAYS AS (
            to_tsvector('simple', coalesce(last_name, '') || ' ' || coalesce(first_name, ''))
        ) STORED
    """)

    # GIN index on tsvector column -- raw SQL to avoid autogenerate detection issues
    op.execute("""
        CREATE INDEX ix_patients_search_vector
        ON patients USING GIN (search_vector)
    """)

    op.create_index("ix_patients_health_station_id", "patients", ["health_station_id"])
    op.create_index("ix_patients_barangay_psgc_code", "patients", ["barangay_psgc_code"])
```

### Search Input Sanitization

```python
# Source: PostgreSQL 18 docs on tsquery syntax
import re

def sanitize_search_input(raw: str) -> str:
    """Sanitize user input for use with to_tsquery().
    Strips special tsquery characters, splits into tokens,
    appends :* for prefix matching, joins with & (AND)."""
    # Remove everything except letters, digits, spaces
    cleaned = re.sub(r"[^\w\s]", "", raw, flags=re.UNICODE)
    tokens = cleaned.split()
    if not tokens:
        return ""
    # Each token gets prefix matching
    return " & ".join(f"{token}:*" for token in tokens)
```

### Pydantic Vitals Validation

```python
# Source: Pydantic v2 docs + CONTEXT.md vitals specification
from pydantic import BaseModel, Field
from decimal import Decimal
from typing import Any

class ConsultationCreate(BaseModel):
    chief_complaint: str = Field(..., min_length=1, max_length=2000)

    # Discrete vitals -- all optional, validated when provided
    bp_systolic: int | None = Field(None, ge=40, le=300)
    bp_diastolic: int | None = Field(None, ge=20, le=200)
    heart_rate: int | None = Field(None, ge=20, le=300)
    respiratory_rate: int | None = Field(None, ge=4, le=80)
    temperature: Decimal | None = Field(None, ge=Decimal("30.0"), le=Decimal("45.0"))
    weight: Decimal | None = Field(None, ge=Decimal("0.5"), le=Decimal("500.00"))
    height: Decimal | None = Field(None, ge=Decimal("20.00"), le=Decimal("300.00"))
    vitals_extra: dict[str, Any] | None = None

    diagnosis: str | None = Field(None, max_length=2000)
    referring_to: str | None = Field(None, max_length=500)
```

### Frontend API Client Pattern

```typescript
// Source: existing frontend/src/features/admin/api.ts pattern
import api from "@/lib/axios";
import type { PatientSearchResponse, PatientResponse, ConsultationResponse } from "./types";

export async function searchPatients(
  q: string,
  cityWide: boolean = false,
  page: number = 1,
  pageSize: number = 20
): Promise<PatientSearchResponse> {
  const { data } = await api.get<PatientSearchResponse>("/patients", {
    params: { q, city_wide: cityWide, page, page_size: pageSize },
  });
  return data;
}

export async function getPatient(id: number): Promise<PatientResponse> {
  const { data } = await api.get<PatientResponse>(`/patients/${id}`);
  return data;
}

export async function registerPatient(body: PatientCreateRequest): Promise<PatientResponse> {
  const { data } = await api.post<PatientResponse>("/patients", body);
  return data;
}

export async function checkDuplicate(
  lastName: string,
  firstName: string,
  birthdate: string
): Promise<DuplicateCheckResponse> {
  const { data } = await api.get<DuplicateCheckResponse>("/patients/check-duplicate", {
    params: { last_name: lastName, first_name: firstName, birthdate },
  });
  return data;
}
```

### BMI Computed on Read (Not Stored)

```python
# Source: CONTEXT.md decision -- BMI computed on read
class PatientConsultationResponse(BaseModel):
    # ... other fields ...
    weight: Decimal | None
    height: Decimal | None

    @computed_field
    @property
    def bmi(self) -> float | None:
        if self.weight and self.height and self.height > 0:
            h_meters = float(self.height) / 100
            return round(float(self.weight) / (h_meters ** 2), 1)
        return None
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `LIKE '%term%'` for name search | tsvector + GIN index with `to_tsquery` | Standard since PostgreSQL 8.3+ | Orders of magnitude faster on large datasets; index-backed |
| Vitals as flat JSONB | Hybrid: discrete columns + JSONB overflow | CONTEXT.md decision | Queryable vitals (BP, weight, height) for analytics; extensible via JSONB |
| python-jose for JWT | PyJWT 2.12 | Phase 2 decision | Already migrated; no impact on Phase 3 |

**Deprecated/outdated:**
- `plainto_tsquery()` for prefix matching -- does not support `:*`. Use `to_tsquery()` with sanitized input.
- SQLAlchemy-Searchable library -- unnecessary; native SQLAlchemy 2.0 `Computed` + `TSVECTOR` type is sufficient.

## Open Questions

1. **Patient ID format: sequential INT PK vs formatted code (BHS##-YYYYNNNN)**
   - What we know: CONTEXT.md says this is Claude's discretion. Sequential INT PK is simpler and consistent with the existing `users.id` pattern. A formatted code adds human readability but requires generation logic and makes FK references more complex.
   - Recommendation: Use sequential INT PK (consistent with all other tables). If a human-readable display ID is needed later, it can be a computed/virtual field (`BHS{health_station_id:02d}-{created_at.year}{id:04d}`), not stored.

2. **sex column: TEXT with CHECK constraint vs PostgreSQL ENUM type**
   - What we know: The project uses `TEXT` for `roles` (as ARRAY), and CONTEXT.md specifies `ENUM('male', 'female')`. PostgreSQL ENUMs are immutable (adding values requires ALTER TYPE). TEXT with CHECK constraint is more flexible.
   - Recommendation: Use `TEXT` with a CHECK constraint (`CHECK (sex IN ('male', 'female'))`) in the migration. This is consistent with the project's preference for TEXT over custom types, and easier to extend if needed.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | pytest 8.4.2 + pytest-asyncio (auto mode) |
| Config file | `backend/pytest.ini` |
| Quick run command | `docker-compose exec backend pytest tests/test_patients/ -x` |
| Full suite command | `docker-compose exec backend pytest` |

### Phase Requirements to Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| P3-01 | Patient model creates with all fields | integration | `pytest tests/test_patients/test_patient_model.py -x` | Wave 0 |
| P3-02 | Consultation model creates with hybrid vitals | integration | `pytest tests/test_patients/test_consultation_model.py -x` | Wave 0 |
| P3-03 | Duplicate detection finds exact match city-wide | integration | `pytest tests/test_patients/test_duplicate_detection.py -x` | Wave 0 |
| P3-04 | Search returns results via GIN tsvector, BHS-scoped and city-wide | integration | `pytest tests/test_patients/test_patient_search.py -x` | Wave 0 |
| P3-05 | POST /patients registers patient, checks duplicate pre-save | integration | `pytest tests/test_patients/test_patient_registration.py -x` | Wave 0 |
| P3-06 | GET /patients/:id returns patient with consultations | integration | `pytest tests/test_patients/test_patient_profile.py -x` | Wave 0 |
| P3-07 | POST /patients/:id/consultations creates consultation | integration | `pytest tests/test_patients/test_consultation_create.py -x` | Wave 0 |
| P3-08 | Nurse CRUD, physician view+consult, CHO read-only, BHW blocked | integration | `pytest tests/test_patients/test_patient_rbac.py -x` | Wave 0 |
| P3-09 | City-wide results are read-only for BHS-level roles | integration | `pytest tests/test_patients/test_city_wide_readonly.py -x` | Wave 0 |
| P3-10 | Registration and duplicate-override write audit_logs | integration | `pytest tests/test_patients/test_patient_audit.py -x` | Wave 0 |

### Sampling Rate
- **Per task commit:** `docker-compose exec backend pytest tests/test_patients/ -x`
- **Per wave merge:** `docker-compose exec backend pytest`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `tests/test_patients/__init__.py` -- package init
- [ ] `tests/test_patients/test_patient_model.py` -- covers P3-01
- [ ] `tests/test_patients/test_consultation_model.py` -- covers P3-02
- [ ] `tests/test_patients/test_duplicate_detection.py` -- covers P3-03
- [ ] `tests/test_patients/test_patient_search.py` -- covers P3-04
- [ ] `tests/test_patients/test_patient_registration.py` -- covers P3-05
- [ ] `tests/test_patients/test_patient_profile.py` -- covers P3-06
- [ ] `tests/test_patients/test_consultation_create.py` -- covers P3-07
- [ ] `tests/test_patients/test_patient_rbac.py` -- covers P3-08
- [ ] `tests/test_patients/test_city_wide_readonly.py` -- covers P3-09
- [ ] `tests/test_patients/test_patient_audit.py` -- covers P3-10

Note: `conftest.py` at `tests/conftest.py` already handles async session setup and audit_logs DDL. New models will be auto-detected via `Base.metadata.create_all` once registered in `app/models/__init__.py`.

## Sources

### Primary (HIGH confidence)
- PostgreSQL 18 Documentation -- [Text Search Types](https://www.postgresql.org/docs/current/datatype-textsearch.html), [Tables and Indexes](https://www.postgresql.org/docs/current/textsearch-tables.html), [Controlling Text Search](https://www.postgresql.org/docs/current/textsearch-controls.html), [GIN Indexes](https://www.postgresql.org/docs/current/gin.html)
- SQLAlchemy 2.1 Documentation -- [PostgreSQL Dialect](https://docs.sqlalchemy.org/en/21/dialects/postgresql.html) (TSVECTOR type, GIN index via `postgresql_using`)
- SQLAlchemy 2.1 Documentation -- [Server Defaults and Computed Columns](https://docs.sqlalchemy.org/en/21/core/defaults.html) (Computed with `persisted=True`)
- Existing codebase -- `backend/app/core/base.py`, `backend/app/repositories/base.py`, `backend/app/core/dependencies.py`, `backend/app/models/user.py`, `backend/app/services/admin.py`, `backend/app/routers/admin.py`

### Secondary (MEDIUM confidence)
- [Alembic GitHub Issue #1390](https://github.com/sqlalchemy/alembic/issues/1390) -- autogenerate detection problem with expression-based indexes; verified through issue discussion
- [pganalyze GIN Index Guide](https://pganalyze.com/blog/gin-index) -- GIN performance characteristics and best practices

### Tertiary (LOW confidence)
- None -- all findings verified against primary sources.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- all libraries already in the project; zero new dependencies
- Architecture: HIGH -- extends Phase 1-2 patterns exactly (BaseRepository, require_role, shadcn/ui)
- Pitfalls: HIGH -- tsvector/GIN pitfalls verified against PostgreSQL docs; RBAC pitfalls derived from existing `_isolation_filter()` behavior
- Validation: HIGH -- test infrastructure exists; only new test files needed

**Research date:** 2026-03-18
**Valid until:** 2026-04-18 (stable domain -- PostgreSQL FTS, SQLAlchemy 2.0 both mature)
