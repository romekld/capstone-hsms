# Design: Health Stations API Endpoint

**Date:** 2026-03-18
**Status:** Approved
**Scope:** Quick fix — replace hardcoded `HEALTH_STATIONS` constant with live backend data

---

## Problem

`frontend/src/features/admin/healthStations.ts` contains a hardcoded list of 32 BHS stations whose IDs and names do not match the actual database. The hardcoded list uses informal abbreviations (e.g., "Burol BHS", id=1) while the seeded DB uses full official names in a different order (e.g., id=1 = "Emmanuel Bergado I Barangay Health Station"). This causes:

- Wrong BHS names displayed in the create/edit user form
- Wrong BHS names displayed in patient registration (ITR)
- Data integrity issues: `health_station_id` values are correct in the DB but the names shown in the UI are misleading

The deliberate decision to defer this to Phase 7 was made assuming the hardcoded list was correct — it is not.

---

## Solution

Add a minimal `GET /api/health-stations` endpoint and replace all 3 hardcoded consumers with a shared React hook.

---

## Backend

### Existing model

`backend/app/models/health_station.py` already defines `HealthStation` (`__tablename__ = "health_stations"`) with:
- `id: int` (primary key, autoincrement)
- `name: str` (TEXT, not null)
- `psgc_code`, `location`, `contact_number`, `address` (present on model but excluded from this endpoint's response)

All 32 rows are seeded from Phase 1 (01-03-PLAN). No new migration needed.

### New files

**`backend/app/schemas/health_station.py`**
```python
from pydantic import BaseModel, ConfigDict

class HealthStationListItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    name: str
```

**`backend/app/routers/health_station.py`**
```python
from sqlalchemy import select
from fastapi import APIRouter
from app.core.dependencies import AsyncDB, CurrentUser
from app.models.health_station import HealthStation
from app.schemas.health_station import HealthStationListItem

router = APIRouter(prefix="/health-stations", tags=["health-stations"])

@router.get("", response_model=list[HealthStationListItem])
async def list_health_stations(db: AsyncDB, _: CurrentUser):
    result = await db.execute(select(HealthStation).order_by(HealthStation.id))
    return result.scalars().all()
```

**Route note:** The decorator is `@router.get("")` (no trailing slash). Combined with `prefix="/health-stations"` and the app-level `prefix="/api"`, the resolved path is `GET /api/health-stations` (no trailing slash). This avoids the 307 redirect bug already documented in commit `8d23535` — some clients (including some Axios configurations) drop the Authorization header on redirect.

### Modified files

**`backend/app/main.py`** — add:
```python
from app.routers.health_station import router as health_station_router
app.include_router(health_station_router, prefix="/api")
```

### Design decisions

- **No service or repository layer** — The project's canonical flow is Router → Service → Repository → AsyncSession (per CLAUDE.md). This endpoint intentionally skips both service and repository layers. Rationale: `health_stations` is immutable reference data seeded once in Phase 1 with zero business logic, zero side effects, and zero write path. Adding a pass-through service and repository would be ceremony with no value. This deviation is scoped to this endpoint only and must be noted in code review.
- **RBAC:** `CurrentUser` only (no `require_role()`) — all 7 roles need BHS names for display. The JWT must be valid (401 if missing/expired), but no role restriction applied.
- **Response shape:** `[{id, name}]` only — `psgc_code`, `address`, `location` excluded until Phase 7 GIS needs them. Consumers will tolerate new fields appearing in the response in Phase 7 (TypeScript structural typing).

### Tests

The existing test suite has no `health_stations` fixture (confirmed in `tests/test_auth/test_login.py`: `health_station_id=None  # null avoids FK constraint in test DB (no health_stations fixture)`).

**Chosen approach:** Write a scoped pytest fixture that inserts 2–3 minimal `HealthStation` rows into the test DB (enough to assert list behavior without seeding all 32). Do NOT assert count == 32 — assert count equals the number of rows the fixture inserted.

Required assertions:
- `GET /api/health-stations` with valid JWT and seeded fixture → HTTP 200, list length equals fixture row count, each item has `id` (int) and `name` (str)
- Items are ordered by `id` ascending
- `GET /api/health-stations` with no Authorization header → HTTP 401

---

## Frontend

### New files

**`frontend/src/features/health-stations/types.ts`**
```ts
export interface HealthStation {
  id: number;
  name: string;
}
```

**`frontend/src/features/health-stations/api.ts`**

The axios instance base URL is `/api` (set in `frontend/src/lib/axios.ts`), so the call path is `/health-stations` (no `/api` prefix, no trailing slash — matches the backend route).

```ts
import api from "@/lib/axios";
import type { HealthStation } from "./types";

export async function listHealthStations(): Promise<HealthStation[]> {
  const { data } = await api.get<HealthStation[]>("/health-stations");
  return data;
}
```

**`frontend/src/features/health-stations/useHealthStations.ts`**

The hook exposes `error` so consumers can distinguish "loaded empty" from "failed to load". If the component unmounts before the fetch resolves, the setState call will be a no-op (React 18 unmounted-component warning was removed); no AbortController is required for this simple reference-data case.

```ts
import { useState, useEffect } from "react";
import { listHealthStations } from "./api";
import type { HealthStation } from "./types";

export function useHealthStations() {
  const [stations, setStations] = useState<HealthStation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listHealthStations()
      .then(setStations)
      .catch(() => setError("Failed to load health stations. Please refresh."))
      .finally(() => setLoading(false));
  }, []);

  return { stations, loading, error };
}
```

No retry logic in any consumer — a page refresh recovers the state. This is intentional across all three consumers: health station reference data is stable within a session and single-attempt fetch is appropriate.

### Modified files

**Implementation constraint:** All three consumer modifications and the deletion of `healthStations.ts` must be in the same commit. Deleting `healthStations.ts` before updating the consumers will break the TypeScript build.

---

**1. `frontend/src/features/admin/components/UserFormSections.tsx`**

Current `BhsAssignmentSectionProps`:
```ts
interface BhsAssignmentSectionProps {
  healthStationId: number | null;
  onHealthStationChange: (id: number | null) => void;
  hidden: boolean;
}
```

New `BhsAssignmentSectionProps` (add three props, keep existing three):
```ts
interface BhsAssignmentSectionProps {
  healthStationId: number | null;
  onHealthStationChange: (id: number | null) => void;
  hidden: boolean;
  stations: HealthStation[];
  stationsLoading: boolean;
  stationsError: string | null;
}
```

Inside `BhsAssignmentSection`:
- Remove `import { HEALTH_STATIONS }` from module imports
- Add `import type { HealthStation } from "@/features/health-stations/types"`
- `Select` gets `disabled={stationsLoading || !!stationsError}`
- `SelectValue` placeholder: `"Loading stations…"` while `stationsLoading` is true, `"— No BHS assignment —"` otherwise (use a conditional `placeholder` prop)
- Replace `HEALTH_STATIONS.map(...)` with `stations.map(...)`
- Add below the Select: `{stationsError && <FieldError>{stationsError}</FieldError>}`

---

**2. `frontend/src/pages/admin/UsersPage.tsx`**

- Remove `import { HEALTH_STATIONS }` from module imports
- Call `const { stations, stationsLoading, stationsError } = useHealthStations()` unconditionally at the top of the page component (not inside a conditional or lazy-loaded block). Rationale: 32 reference items are cheap to fetch on page load; unconditional prefetch eliminates flash-of-empty-dropdown when the user opens the create/edit form. The fetch fires even when `BhsAssignmentSection` is `hidden` — this is intentional and acceptable.
- Pass `stations`, `stationsLoading`, `stationsError` to `<BhsAssignmentSection>` wherever it is rendered

---

**3. `frontend/src/pages/patients/RegisterPatientPage.tsx`**

- Remove `import { HEALTH_STATIONS }` from module imports
- Call `const { stations, stationsLoading, stationsError } = useHealthStations()` at top of component
- The existing BHS `<Select>` already has `disabled={isSubmitting}` — change to `disabled={isSubmitting || stationsLoading || !!stationsError}`
- Replace `HEALTH_STATIONS.map(...)` with `stations.map(...)`
- Add inline error text below the Select: `{stationsError && <p className="text-sm text-destructive">{stationsError}</p>}`

### Deleted files

- **`frontend/src/features/admin/healthStations.ts`** — deleted in the same commit as the three consumer modifications

---

## Error handling summary

| State | User experience |
|-------|----------------|
| Loading | BHS Select disabled, placeholder "Loading…" |
| Error | BHS Select disabled, error text shown below field, form cannot be submitted with empty BHS |
| Success | Normal Select with all 32 stations |

---

## Phase 7 impact

This endpoint is intentionally minimal. Phase 7 (GIS module) will extend `GET /api/health-stations` to include `location`, `psgc_code`, `address`, and add `GET /api/health-stations/{id}` for the GIS detail view. The `HealthStation` TypeScript interface will gain optional fields at that point. Existing consumers use structural typing and will tolerate new response fields transparently.

---

## Files changed summary

| File | Action |
|------|--------|
| `backend/app/schemas/health_station.py` | Create |
| `backend/app/routers/health_station.py` | Create |
| `backend/app/main.py` | Modify — register router |
| `frontend/src/features/health-stations/types.ts` | Create |
| `frontend/src/features/health-stations/api.ts` | Create |
| `frontend/src/features/health-stations/useHealthStations.ts` | Create |
| `frontend/src/features/admin/components/UserFormSections.tsx` | Modify — add 3 props to `BhsAssignmentSectionProps`, swap `HEALTH_STATIONS` for props |
| `frontend/src/pages/admin/UsersPage.tsx` | Modify — call hook, pass props to `BhsAssignmentSection` |
| `frontend/src/pages/patients/RegisterPatientPage.tsx` | Modify — call hook, swap `HEALTH_STATIONS` for hook data |
| `frontend/src/features/admin/healthStations.ts` | Delete (same commit as consumer modifications) |
