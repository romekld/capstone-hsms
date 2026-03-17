# Copilot Instructions for Project LINK (HSMS)

## Build, test, and lint commands

Use Docker Compose from the repository root for backend/infrastructure workflows:

```bash
docker-compose up
docker-compose up backend
docker-compose up celery_worker
```

Backend tests run inside the backend container:

```bash
docker-compose exec backend pytest
docker-compose exec backend pytest tests/test_auth/test_login.py::test_login_success
```

Frontend commands run from `frontend/`:

```bash
npm run dev
npm run build
npm run lint
npm run typecheck
```

## High-level architecture

- Backend is layered: **router -> service -> repository -> async SQLAlchemy session -> Pydantic schema response**.
- FastAPI app wiring is in `backend/app/main.py` and mounts `auth` + `admin` routers under `/api`.
- Auth is JWT-based with refresh-token rotation:
  - frontend keeps access token in memory (`src/lib/axios.ts`)
  - refresh token is in localStorage (`src/lib/auth.ts`)
  - backend stores hashed refresh sessions in `user_sessions` and revokes on rotate/logout (`AuthService`, `UserRepository`).
- Role enforcement is mirrored across backend and frontend:
  - backend uses `require_role(...)` dependencies (`core/dependencies.py`, router-level in `routers/admin.py`)
  - frontend uses `ProtectedRoute` and role-filtered navigation in `AppShell`.
- Soft delete is global: `SoftDeleteMixin` + SQLAlchemy `do_orm_execute` criteria automatically excludes `deleted_at IS NOT NULL`.

## Key conventions

- **Async-first backend**: use `AsyncSession` dependency injection (`AsyncDB`) and async repository/service methods.
- **RBAC boundary**: enforce permissions at router dependency level; keep business rules (like role validation) in services.
- **Barangay/BHS isolation**: repositories for scoped clinical domains should inherit `BaseRepository` and apply `_isolation_filter(...)`; cross-BHS roles are centralized in `CROSS_BHS_ROLES`.
- **No raw ORM objects in API responses**: map through schema models (`app/schemas/*`) before returning JSON.
- **Audit requirements for admin mutations**: user lifecycle changes write to `audit_logs` via service-layer calls.
- **Frontend theming**: use semantic CSS variables/tokens from `src/styles/globals.css`; avoid hardcoded color values in components.
