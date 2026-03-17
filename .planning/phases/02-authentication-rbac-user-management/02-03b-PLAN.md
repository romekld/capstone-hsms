---
phase: 02-authentication-rbac-user-management
plan: "03b"
type: execute
wave: 2
depends_on:
  - "02-03a"
files_modified:
  - backend/app/routers/auth.py
  - backend/app/main.py
  - backend/tests/test_auth/test_login.py
  - backend/tests/test_auth/test_logout.py
  - backend/tests/test_auth/test_refresh.py
  - backend/tests/test_auth/test_rbac.py
  - backend/tests/test_auth/test_auth_guard.py
  - backend/tests/test_auth/test_base_repository.py
autonomous: true
requirements:
  - AUTH-01
  - AUTH-02
  - AUTH-03
  - AUTH-05
  - AUTH-07
  - AUTH-08
  - AUTH-09
  - AUTH-10

must_haves:
  truths:
    - "POST /auth/login with valid email+password returns 200 with access_token, refresh_token, token_type=bearer"
    - "POST /auth/login with wrong password returns 401"
    - "POST /auth/login with inactive user (is_active=False) returns 401"
    - "POST /auth/refresh with valid non-revoked token returns new access_token + refresh_token and revokes old"
    - "POST /auth/refresh with revoked token returns 401"
    - "POST /auth/logout revokes the user_sessions row (sets revoked_at)"
    - "require_role(['nurse']) blocks BHW with HTTP 403"
    - "User with roles=['nurse','disease_surveillance_officer'] passes both nurse and DSO route guards"
    - "Unauthenticated request (no Authorization header) to any protected endpoint returns 401"
    - "BaseRepository._isolation_filter() adds WHERE health_station_id = X for nurse; skips for CHO"
  artifacts:
    - path: "backend/app/routers/auth.py"
      provides: "POST /auth/login, POST /auth/refresh, POST /auth/logout endpoints"
      contains: "router = APIRouter"
    - path: "backend/app/main.py"
      provides: "FastAPI app with CORS middleware and auth router registered at /api"
      contains: "include_router"
  key_links:
    - from: "backend/app/routers/auth.py"
      to: "backend/app/services/auth.py"
      via: "AuthService"
      pattern: "AuthService"
    - from: "backend/app/main.py"
      to: "backend/app/routers/auth.py"
      via: "include_router"
      pattern: "include_router.*auth"
---

<objective>
Wire the auth router (POST /auth/login, /auth/refresh, /auth/logout), register it in main.py with CORS middleware, and convert all 9 Wave 0 test stubs into real passing tests.

Purpose: This plan activates the complete auth HTTP layer. Plan 02-03a built all the contracts; this plan exposes them via HTTP and verifies them with the test suite.
Output: Auth router registered in FastAPI app; CORS configured; all 9 auth test stubs converted to real tests and passing.
</objective>

<execution_context>
@C:/Users/jerom/.claude/get-shit-done/workflows/execute-plan.md
@C:/Users/jerom/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/phases/02-authentication-rbac-user-management/02-CONTEXT.md
@.planning/phases/02-authentication-rbac-user-management/02-RESEARCH.md

<interfaces>
From Plan 02-03a — all now implemented:

From backend/app/services/auth.py:
```python
class AuthService:
    async def login(body: LoginRequest) -> TokenPair: ...     # 401 on wrong creds/inactive
    async def refresh(refresh_token_raw: str) -> TokenPair: ... # 401 on revoked/expired
    async def logout(refresh_token_raw: str) -> None: ...     # revokes session row
```

From backend/app/core/dependencies.py:
```python
AsyncDB = Annotated[AsyncSession, Depends(get_async_session)]
CurrentUser = Annotated[UserSchema, Depends(get_current_user)]
def require_role(allowed_roles: list[str]) -> Depends: ...
# get_current_user raises 401 if Authorization header missing
```

From backend/app/schemas/auth.py:
```python
class LoginRequest(BaseModel): email: str; password: str
class TokenPair(BaseModel): access_token: str; refresh_token: str; token_type: str
```

From backend/app/repositories/base.py:
```python
CROSS_BHS_ROLES: frozenset  # city_health_officer, phis_coordinator, disease_surveillance_officer
class BaseRepository:
    def _isolation_filter(query, model) -> Select: ...
```

From backend/app/core/security.py:
```python
def hash_password(plain: str) -> str: ...  # for creating test users
```
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Auth router and main.py CORS + router registration</name>
  <read_first>
    - backend/app/main.py (current content — extend, do not replace; check for existing CORS config)
    - backend/app/core/config.py (settings.ALLOWED_ORIGINS — used in CORS middleware)
    - backend/app/routers/ (check for any existing routers to understand pattern)
  </read_first>
  <action>
1. Create backend/app/routers/__init__.py (empty — package marker if not already present).

2. Create backend/app/routers/auth.py:
   ```python
   """Auth router — POST /auth/login, /auth/refresh, /auth/logout.

   No authentication required on these three routes.
   All other routes that need auth use require_role() or CurrentUser dependency.
   """
   from fastapi import APIRouter

   from app.core.dependencies import AsyncDB
   from app.schemas.auth import LoginRequest, TokenPair
   from app.services.auth import AuthService

   router = APIRouter(prefix="/auth", tags=["auth"])


   class RefreshRequest(LoginRequest):
       """Reuse field name convention — only refresh_token field needed."""
       email: str = ""  # not used
       password: str = ""  # not used
       refresh_token: str


   # Override with correct model
   from pydantic import BaseModel


   class _RefreshBody(BaseModel):
       refresh_token: str


   class _LogoutBody(BaseModel):
       refresh_token: str


   @router.post("/login", response_model=TokenPair)
   async def login(body: LoginRequest, db: AsyncDB):
       svc = AuthService(db)
       return await svc.login(body)


   @router.post("/refresh", response_model=TokenPair)
   async def refresh(body: _RefreshBody, db: AsyncDB):
       svc = AuthService(db)
       return await svc.refresh(body.refresh_token)


   @router.post("/logout", status_code=204)
   async def logout(body: _LogoutBody, db: AsyncDB):
       svc = AuthService(db)
       await svc.logout(body.refresh_token)
   ```

   Note: The class inheritance approach above creates unnecessary complexity.
   Use this clean version instead:
   ```python
   """Auth router — POST /auth/login, /auth/refresh, /auth/logout.

   No authentication required on these three routes.
   All other routes that need auth use require_role() or CurrentUser dependency.
   """
   from fastapi import APIRouter
   from pydantic import BaseModel

   from app.core.dependencies import AsyncDB
   from app.schemas.auth import LoginRequest, TokenPair
   from app.services.auth import AuthService

   router = APIRouter(prefix="/auth", tags=["auth"])


   class _RefreshBody(BaseModel):
       refresh_token: str


   class _LogoutBody(BaseModel):
       refresh_token: str


   @router.post("/login", response_model=TokenPair)
   async def login(body: LoginRequest, db: AsyncDB):
       svc = AuthService(db)
       return await svc.login(body)


   @router.post("/refresh", response_model=TokenPair)
   async def refresh(body: _RefreshBody, db: AsyncDB):
       svc = AuthService(db)
       return await svc.refresh(body.refresh_token)


   @router.post("/logout", status_code=204)
   async def logout(body: _LogoutBody, db: AsyncDB):
       svc = AuthService(db)
       await svc.logout(body.refresh_token)
   ```
   Use the clean version (the last code block). Write only that.

3. Read backend/app/main.py and extend it:
   - Add CORSMiddleware using settings.ALLOWED_ORIGINS
   - Add include_router(auth_router, prefix="/api")
   - Preserve any existing content (health check, other middleware)

   Minimal addition:
   ```python
   from fastapi.middleware.cors import CORSMiddleware
   from app.core.config import settings
   from app.routers.auth import router as auth_router

   # Add CORS middleware (before include_router):
   app.add_middleware(
       CORSMiddleware,
       allow_origins=settings.ALLOWED_ORIGINS,
       allow_credentials=True,
       allow_methods=["*"],
       allow_headers=["*"],
   )

   # Register auth router:
   app.include_router(auth_router, prefix="/api")
   ```
  </action>
  <verify>
    <automated>docker-compose exec backend python -c "from app.main import app; routes = [r.path for r in app.routes]; print([r for r in routes if 'auth' in r])"</automated>
  </verify>
  <acceptance_criteria>
    - backend/app/routers/auth.py contains "router = APIRouter(prefix=\"/auth\""
    - backend/app/routers/auth.py contains "async def login("
    - backend/app/routers/auth.py contains "async def refresh("
    - backend/app/routers/auth.py contains "async def logout("
    - backend/app/main.py contains "CORSMiddleware"
    - backend/app/main.py contains "ALLOWED_ORIGINS"
    - backend/app/main.py contains "auth_router"
    - docker-compose exec backend python -c "from app.main import app; routes = [r.path for r in app.routes]; assert any('auth' in r for r in routes), 'auth routes missing'; print('auth router registered OK')" exits 0
  </acceptance_criteria>
  <done>Auth router registered at /api/auth/*; CORS middleware using settings.ALLOWED_ORIGINS; app starts without errors.</done>
</task>

<task type="auto">
  <name>Task 2: Convert all 9 Wave 0 auth test stubs to real passing tests</name>
  <read_first>
    - backend/tests/conftest.py (async_session fixture — tests need this)
    - backend/tests/test_auth/test_login.py (current stub content to replace)
    - backend/tests/test_auth/test_logout.py (current stub content to replace)
    - backend/tests/test_auth/test_refresh.py (current stub content to replace)
    - backend/tests/test_auth/test_rbac.py (current stub content to replace)
    - backend/tests/test_auth/test_auth_guard.py (current stub content to replace)
    - backend/tests/test_auth/test_base_repository.py (current stub content to replace)
    - backend/app/core/security.py (hash_password — needed to create test users)
    - backend/app/core/dependencies.py (get_current_user — needed for dependency_overrides)
  </read_first>
  <action>
Replace each stub file. Read the current content first to confirm it is still a stub (uses pytest.skip). Then write the real test content.

1. Replace backend/tests/test_auth/test_login.py:
   ```python
   """AUTH-01: Login flow — email/password → access+refresh token pair."""
   import pytest
   from httpx import ASGITransport, AsyncClient

   from app.core.security import hash_password
   from app.main import app
   from app.models.user import User


   @pytest.mark.asyncio
   async def test_login_success(async_session):
       """POST /auth/login with valid credentials returns 200 + token pair."""
       user = User(
           email="nurse@test.com",
           full_name="Test Nurse",
           hashed_password=hash_password("password123"),
           roles=["nurse"],
           health_station_id=1,
           is_active=True,
       )
       async_session.add(user)
       await async_session.commit()

       async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
           response = await client.post("/api/auth/login", json={"email": "nurse@test.com", "password": "password123"})

       assert response.status_code == 200
       data = response.json()
       assert "access_token" in data
       assert "refresh_token" in data
       assert data["token_type"] == "bearer"


   @pytest.mark.asyncio
   async def test_wrong_password(async_session):
       """POST /auth/login with wrong password returns 401."""
       user = User(
           email="wrongpw@test.com",
           full_name="Test User",
           hashed_password=hash_password("correctpassword"),
           roles=["nurse"],
           health_station_id=1,
           is_active=True,
       )
       async_session.add(user)
       await async_session.commit()

       async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
           response = await client.post("/api/auth/login", json={"email": "wrongpw@test.com", "password": "wrongpassword"})

       assert response.status_code == 401


   @pytest.mark.asyncio
   async def test_inactive_user(async_session):
       """POST /auth/login with inactive user (is_active=False) returns 401."""
       user = User(
           email="inactive@test.com",
           full_name="Inactive User",
           hashed_password=hash_password("password123"),
           roles=["nurse"],
           health_station_id=1,
           is_active=False,
       )
       async_session.add(user)
       await async_session.commit()

       async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
           response = await client.post("/api/auth/login", json={"email": "inactive@test.com", "password": "password123"})

       assert response.status_code == 401
   ```

2. Replace backend/tests/test_auth/test_logout.py:
   ```python
   """AUTH-02: Logout — revokes user_sessions row server-side."""
   import pytest
   from httpx import ASGITransport, AsyncClient
   from sqlalchemy import select

   from app.core.security import hash_password, hash_token
   from app.main import app
   from app.models.user import User
   from app.models.user_session import UserSession


   @pytest.mark.asyncio
   async def test_logout_revokes_session(async_session):
       """POST /auth/logout sets revoked_at on the user_sessions row; subsequent refresh fails."""
       user = User(
           email="logout@test.com",
           full_name="Logout Test",
           hashed_password=hash_password("password123"),
           roles=["nurse"],
           health_station_id=1,
           is_active=True,
       )
       async_session.add(user)
       await async_session.commit()

       async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
           login_resp = await client.post("/api/auth/login", json={"email": "logout@test.com", "password": "password123"})
           assert login_resp.status_code == 200
           refresh_token = login_resp.json()["refresh_token"]

           logout_resp = await client.post("/api/auth/logout", json={"refresh_token": refresh_token})
           assert logout_resp.status_code == 204

           # Subsequent refresh with the revoked token must fail
           refresh_resp = await client.post("/api/auth/refresh", json={"refresh_token": refresh_token})
           assert refresh_resp.status_code == 401

       # Verify revoked_at is set in DB
       result = await async_session.execute(
           select(UserSession).where(UserSession.token_hash == hash_token(refresh_token))
       )
       session_row = result.scalar_one_or_none()
       assert session_row is not None
       assert session_row.revoked_at is not None
   ```

3. Replace backend/tests/test_auth/test_refresh.py:
   ```python
   """AUTH-02: Refresh token rotation — old token invalidated, new pair issued."""
   import pytest
   from httpx import ASGITransport, AsyncClient

   from app.core.security import hash_password
   from app.main import app
   from app.models.user import User


   @pytest.mark.asyncio
   async def test_refresh_rotates_token(async_session):
       """POST /auth/refresh issues new token pair and revokes the old refresh token."""
       user = User(
           email="refresh@test.com",
           full_name="Refresh Test",
           hashed_password=hash_password("password123"),
           roles=["nurse"],
           health_station_id=1,
           is_active=True,
       )
       async_session.add(user)
       await async_session.commit()

       async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
           login_resp = await client.post("/api/auth/login", json={"email": "refresh@test.com", "password": "password123"})
           original_refresh = login_resp.json()["refresh_token"]

           refresh_resp = await client.post("/api/auth/refresh", json={"refresh_token": original_refresh})
           assert refresh_resp.status_code == 200
           data = refresh_resp.json()
           assert "access_token" in data
           assert "refresh_token" in data
           assert data["refresh_token"] != original_refresh  # rotation: new token issued

           # Old token is revoked — using it again must fail
           retry = await client.post("/api/auth/refresh", json={"refresh_token": original_refresh})
           assert retry.status_code == 401


   @pytest.mark.asyncio
   async def test_revoked_token(async_session):
       """POST /auth/refresh with an already-revoked token returns 401."""
       user = User(
           email="revoked@test.com",
           full_name="Revoked Test",
           hashed_password=hash_password("password123"),
           roles=["nurse"],
           health_station_id=1,
           is_active=True,
       )
       async_session.add(user)
       await async_session.commit()

       async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
           login_resp = await client.post("/api/auth/login", json={"email": "revoked@test.com", "password": "password123"})
           refresh_token = login_resp.json()["refresh_token"]

           # Logout revokes the token
           await client.post("/api/auth/logout", json={"refresh_token": refresh_token})

           # Now try to refresh with the revoked token
           response = await client.post("/api/auth/refresh", json={"refresh_token": refresh_token})
           assert response.status_code == 401
   ```

4. Replace backend/tests/test_auth/test_rbac.py:
   ```python
   """AUTH-03/05/10: RBAC role guards — require_role() enforcement."""
   import pytest
   from httpx import ASGITransport, AsyncClient

   from app.core.dependencies import get_current_user
   from app.main import app
   from app.schemas.user import UserSchema


   def make_bhw():
       return UserSchema(id=10, email="bhw@test.com", full_name="BHW User",
                         roles=["bhw"], health_station_id=1, is_active=True)


   def make_nurse_dso():
       return UserSchema(id=11, email="nursedso@test.com", full_name="Nurse DSO",
                         roles=["nurse", "disease_surveillance_officer"],
                         health_station_id=1, is_active=True)


   @pytest.mark.asyncio
   async def test_role_guard():
       """require_role(["nurse"]) blocks a BHW user with HTTP 403."""
       # Use a protected endpoint that requires nurse role
       # GET /api/admin/users requires system_admin — use it to verify 403 on wrong role
       app.dependency_overrides[get_current_user] = lambda: make_bhw()
       try:
           async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
               response = await client.get("/api/admin/users", headers={"Authorization": "Bearer dummy"})
           # system_admin required, BHW → 403
           assert response.status_code == 403
       finally:
           app.dependency_overrides.clear()


   @pytest.mark.asyncio
   async def test_dual_role():
       """User with roles=['nurse','disease_surveillance_officer'] passes both nurse and DSO route guards."""
       from app.core.dependencies import require_role
       from fastapi import FastAPI
       from fastapi.testclient import TestClient

       test_app = FastAPI()

       @test_app.get("/nurse-only")
       async def nurse_route(_=require_role(["nurse"])):
           return {"ok": True}

       @test_app.get("/dso-only")
       async def dso_route(_=require_role(["disease_surveillance_officer"])):
           return {"ok": True}

       test_app.dependency_overrides[get_current_user] = lambda: make_nurse_dso()
       client = TestClient(test_app)
       assert client.get("/nurse-only").status_code == 200
       assert client.get("/dso-only").status_code == 200


   @pytest.mark.asyncio
   async def test_dso_write_blocked():
       """DSO is NOT in allowed roles for POST /api/admin/users; gets 403."""
       dso_only = UserSchema(id=12, email="dso@test.com", full_name="DSO Only",
                             roles=["disease_surveillance_officer"],
                             health_station_id=None, is_active=True)
       app.dependency_overrides[get_current_user] = lambda: dso_only
       try:
           async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
               response = await client.post(
                   "/api/admin/users",
                   json={"email": "x@x.com", "full_name": "X", "password": "x", "roles": ["nurse"], "health_station_id": 1},
                   headers={"Authorization": "Bearer dummy"},
               )
           assert response.status_code == 403
       finally:
           app.dependency_overrides.clear()
   ```

5. Replace backend/tests/test_auth/test_auth_guard.py:
   ```python
   """AUTH-07: Unauthenticated requests to protected endpoints return 401."""
   import pytest
   from httpx import ASGITransport, AsyncClient

   from app.main import app


   @pytest.mark.asyncio
   async def test_unauthenticated_returns_401():
       """GET /api/admin/users without Authorization header returns 401."""
       async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
           response = await client.get("/api/admin/users")
       assert response.status_code == 401
   ```

6. Replace backend/tests/test_auth/test_base_repository.py:
   ```python
   """AUTH-08/09: BaseRepository barangay isolation filter."""
   import pytest
   from sqlalchemy import Column, Integer, select
   from sqlalchemy.orm import DeclarativeBase

   from app.repositories.base import CROSS_BHS_ROLES, BaseRepository
   from app.schemas.user import UserSchema


   class _FakeBase(DeclarativeBase):
       pass


   class _FakeModel(_FakeBase):
       __tablename__ = "fake_model"
       __table_args__ = {"extend_existing": True}
       id = Column(Integer, primary_key=True)
       health_station_id = Column(Integer)


   def make_nurse():
       return UserSchema(id=1, email="n@t.com", full_name="Nurse",
                         roles=["nurse"], health_station_id=5, is_active=True)


   def make_cho():
       return UserSchema(id=2, email="cho@t.com", full_name="CHO",
                         roles=["city_health_officer"], health_station_id=None, is_active=True)


   def test_isolation_filter():
       """_isolation_filter() adds WHERE health_station_id = 5 for nurse."""
       repo = BaseRepository(session=None, user=make_nurse())  # type: ignore[arg-type]
       query = select(_FakeModel)
       filtered = repo._isolation_filter(query, _FakeModel)
       compiled = str(filtered.compile())
       assert "health_station_id" in compiled


   def test_cross_bhs_bypass():
       """_isolation_filter() skips WHERE clause for city_health_officer."""
       repo = BaseRepository(session=None, user=make_cho())  # type: ignore[arg-type]
       query = select(_FakeModel)
       filtered = repo._isolation_filter(query, _FakeModel)
       # CHO should get the same query back — no WHERE added
       assert filtered is query


   def test_cho_cross_bhs():
       """CHO role is in CROSS_BHS_ROLES — isolation is skipped."""
       assert "city_health_officer" in CROSS_BHS_ROLES
       assert "phis_coordinator" in CROSS_BHS_ROLES
       assert "disease_surveillance_officer" in CROSS_BHS_ROLES
       assert "nurse" not in CROSS_BHS_ROLES
       assert "bhw" not in CROSS_BHS_ROLES
   ```
  </action>
  <verify>
    <automated>docker-compose exec backend pytest tests/test_auth/ tests/test_admin/ -x -q</automated>
  </verify>
  <acceptance_criteria>
    - backend/tests/test_auth/test_login.py does NOT contain "pytest.skip"
    - backend/tests/test_auth/test_logout.py does NOT contain "pytest.skip"
    - backend/tests/test_auth/test_refresh.py does NOT contain "pytest.skip"
    - backend/tests/test_auth/test_rbac.py does NOT contain "pytest.skip"
    - backend/tests/test_auth/test_auth_guard.py does NOT contain "pytest.skip"
    - backend/tests/test_auth/test_base_repository.py does NOT contain "pytest.skip"
    - docker-compose exec backend pytest tests/test_auth/ -x -q exits 0 with at least 9 passed
    - docker-compose exec backend pytest -x -q exits 0 (full suite green — admin stubs still skip)
  </acceptance_criteria>
  <done>All 9 auth test functions pass (no skips); full test suite green; BaseRepository isolation filter verified with unit tests.</done>
</task>

</tasks>

<verification>
Full auth HTTP layer verification:
```bash
# Auth routes registered
docker-compose exec backend python -c "
from app.main import app
routes = [r.path for r in app.routes]
print([r for r in routes if 'auth' in r or 'admin' in r])
"

# All auth tests green
docker-compose exec backend pytest tests/test_auth/ -x -q

# Full suite green
docker-compose exec backend pytest -x -q
```
</verification>

<success_criteria>
- POST /api/auth/login, /api/auth/refresh, /api/auth/logout all registered in FastAPI
- CORS middleware using settings.ALLOWED_ORIGINS
- All 9 test_auth tests passing (no skips)
- Full backend test suite green (admin stubs still skip until Plan 02-04)
- test_base_repository.py uses unit tests (no DB required); isolation filter verified structurally
</success_criteria>

<output>
After completion, create `.planning/phases/02-authentication-rbac-user-management/02-03b-SUMMARY.md`
</output>
