---
phase: 02-authentication-rbac-user-management
plan: "03a"
type: execute
wave: 2
depends_on:
  - "02-01"
  - "02-02"
files_modified:
  - backend/app/core/dependencies.py
  - backend/app/schemas/auth.py
  - backend/app/schemas/user.py
  - backend/app/repositories/base.py
  - backend/app/repositories/user.py
  - backend/app/services/auth.py
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
    - "AuthService.login() returns TokenPair on valid credentials; raises 401 on wrong password; raises 401 on inactive user"
    - "AuthService.refresh() issues new token pair and revokes old user_sessions row; raises 401 on revoked token"
    - "AuthService.logout() sets revoked_at on the user_sessions row for the given token hash"
    - "require_role(['nurse']) raises HTTP 403 for a BHW user; passes for a nurse user"
    - "User with roles=['nurse','disease_surveillance_officer'] passes both nurse and DSO route guards"
    - "BaseRepository._isolation_filter() adds WHERE health_station_id = X for nurse; skips WHERE clause for city_health_officer"
    - "get_current_user() raises 401 if Authorization header is missing"
  artifacts:
    - path: "backend/app/schemas/auth.py"
      provides: "LoginRequest, TokenPair Pydantic schemas"
      exports: ["LoginRequest", "TokenPair"]
    - path: "backend/app/schemas/user.py"
      provides: "UserSchema Pydantic schema used by dependencies and services"
      exports: ["UserSchema", "UserListItem"]
    - path: "backend/app/repositories/base.py"
      provides: "BaseRepository with _isolation_filter() and CROSS_BHS_ROLES constant"
      contains: "class BaseRepository"
    - path: "backend/app/repositories/user.py"
      provides: "UserRepository: create, get_by_id, get_by_email, list_all, update, revoke_all_sessions"
      contains: "class UserRepository"
    - path: "backend/app/services/auth.py"
      provides: "AuthService: login, refresh, logout"
      contains: "class AuthService"
    - path: "backend/app/core/dependencies.py"
      provides: "AsyncDB, CurrentUser, get_current_user, require_role"
      contains: "require_role"
  key_links:
    - from: "backend/app/core/dependencies.py"
      to: "backend/app/core/security.py"
      via: "verify_token()"
      pattern: "verify_token"
    - from: "backend/app/services/auth.py"
      to: "backend/app/repositories/user.py"
      via: "UserRepository"
      pattern: "UserRepository"
    - from: "backend/app/repositories/base.py"
      to: "CROSS_BHS_ROLES"
      via: "imported by all Phase 3–9 repositories"
      pattern: "CROSS_BHS_ROLES"
---

<objective>
Build the backend dependencies layer for auth: Pydantic schemas, BaseRepository with barangay isolation, UserRepository, AuthService (login/refresh/logout), and the FastAPI dependencies (get_current_user, require_role, CurrentUser, AsyncDB).

Purpose: Plan 02-03b (auth router + main.py wiring + test implementations) depends on all these contracts existing first. Plan 02-04 (admin service) also depends on UserRepository and require_role.
Output: 6 Python modules — schemas, repositories, service, dependencies. No router yet. Tests converted to real implementations in 02-03b.
</objective>

<execution_context>
@C:/Users/jerom/.claude/get-shit-done/workflows/execute-plan.md
@C:/Users/jerom/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/phases/02-authentication-rbac-user-management/02-CONTEXT.md
@.planning/phases/02-authentication-rbac-user-management/02-RESEARCH.md

<interfaces>
From backend/app/core/security.py (created in Plan 02-01):
```python
def create_access_token(user_id: int, roles: list[str], health_station_id: int | None) -> str: ...
def create_refresh_token(user_id: int, roles: list[str], health_station_id: int | None) -> str: ...
def verify_token(token: str) -> dict: ...  # raises HTTP 401 on expiry or invalid signature
def hash_password(plain: str) -> str: ...
def verify_password(plain: str, hashed: str) -> bool: ...
def hash_token(raw_token: str) -> str: ...  # SHA-256 hex of token string
```

From backend/app/core/config.py (extended in Plan 02-01):
```python
settings.JWT_SECRET_KEY: str
settings.ACCESS_TOKEN_EXPIRE_MINUTES: int  # 60
settings.REFRESH_TOKEN_EXPIRE_DAYS: int    # 7
```

From backend/app/core/database.py (Phase 1):
```python
async def get_async_session() -> AsyncGenerator[AsyncSession, None]: ...
```

From backend/app/models/user.py (Plan 02-01):
```python
class User(TimestampMixin, Base):
    id: int; email: str; full_name: str; hashed_password: str
    roles: list[str]; is_active: bool; health_station_id: int | None
    sessions: relationship("UserSession", lazy="raise")
```

From backend/app/models/user_session.py (Plan 02-01):
```python
class UserSession(Base):
    id: int; user_id: int; token_hash: str  # SHA-256 hex
    created_at: datetime; revoked_at: datetime | None; expires_at: datetime
```
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Pydantic schemas (auth.py, user.py) and BaseRepository with barangay isolation</name>
  <read_first>
    - backend/app/core/database.py (get_async_session signature — used by BaseRepository)
    - backend/app/models/user.py (User fields — UserSchema must match exactly)
    - backend/app/core/base.py (check for existing imports pattern)
  </read_first>
  <action>
1. Create backend/app/schemas/auth.py:
   ```python
   from pydantic import BaseModel


   class LoginRequest(BaseModel):
       email: str
       password: str


   class TokenPair(BaseModel):
       access_token: str
       refresh_token: str
       token_type: str = "bearer"
   ```

2. Create backend/app/schemas/user.py:
   ```python
   from pydantic import BaseModel


   class UserSchema(BaseModel):
       id: int
       email: str
       full_name: str
       roles: list[str]
       health_station_id: int | None
       is_active: bool

       model_config = {"from_attributes": True}


   class UserListItem(BaseModel):
       id: int
       email: str
       full_name: str
       roles: list[str]
       health_station_id: int | None
       is_active: bool
       created_at: str  # ISO 8601 — serialized from datetime in service layer

       model_config = {"from_attributes": True}
   ```

3. Create backend/app/repositories/__init__.py (empty — package marker):
   ```python
   ```

4. Create backend/app/repositories/base.py:
   ```python
   """BaseRepository — base class for all Phase 2+ repositories.

   Provides barangay data isolation via _isolation_filter().
   All clinical repositories in Phases 3–9 must inherit from this class.

   CROSS_BHS_ROLES is a named constant (not inlined) so downstream phases can
   import and reuse it without duplicating the set.
   """
   from typing import Any

   from sqlalchemy import Select
   from sqlalchemy.ext.asyncio import AsyncSession

   from app.schemas.user import UserSchema

   # Roles that can read/write across ALL barangay health stations.
   # Nurses, physicians, BHWs, and midwives are scoped to their own BHS only.
   CROSS_BHS_ROLES: frozenset[str] = frozenset({
       "city_health_officer",
       "phis_coordinator",
       "disease_surveillance_officer",
   })


   class BaseRepository:
       """Base class for all domain repositories.

       Instantiate per-request with both the DB session and the current user
       so that _isolation_filter() has access to health_station_id without
       a separate DB query.

       Usage (in router):
           repo = PatientRepository(session=db, user=current_user)
       """

       def __init__(self, session: AsyncSession, user: UserSchema) -> None:
           self.session = session
           self.user = user

       def _isolation_filter(self, query: Select, model: Any) -> Select:
           """Apply WHERE health_station_id = user.health_station_id for BHS-scoped roles.

           Skipped for CROSS_BHS_ROLES (CHO, PHIS, DSO) — those roles see all BHS data.
           Also skipped if the model has no health_station_id column (e.g., audit_logs).
           """
           if any(r in CROSS_BHS_ROLES for r in self.user.roles):
               return query
           if not hasattr(model, "health_station_id"):
               return query
           return query.where(model.health_station_id == self.user.health_station_id)
   ```

5. Check whether backend/app/schemas/__init__.py already exists (it may from Phase 1). If not, create it empty. If it exists, leave it.
  </action>
  <verify>
    <automated>docker-compose exec backend python -c "from app.schemas.auth import LoginRequest, TokenPair; from app.schemas.user import UserSchema, UserListItem; from app.repositories.base import BaseRepository, CROSS_BHS_ROLES; print('schemas and BaseRepository OK')"</automated>
  </verify>
  <acceptance_criteria>
    - backend/app/schemas/auth.py contains "class LoginRequest(BaseModel):"
    - backend/app/schemas/auth.py contains "class TokenPair(BaseModel):"
    - backend/app/schemas/user.py contains "class UserSchema(BaseModel):"
    - backend/app/schemas/user.py contains "class UserListItem(BaseModel):"
    - backend/app/repositories/base.py contains "CROSS_BHS_ROLES: frozenset"
    - backend/app/repositories/base.py contains "class BaseRepository:"
    - backend/app/repositories/base.py contains "_isolation_filter"
    - backend/app/repositories/base.py contains "city_health_officer"
    - backend/app/repositories/base.py does NOT contain "inline" (no inlined role sets)
    - docker-compose exec backend python -c "from app.repositories.base import BaseRepository, CROSS_BHS_ROLES; print('OK')" exits 0
  </acceptance_criteria>
  <done>Schemas and BaseRepository importable; CROSS_BHS_ROLES is a named module-level constant; _isolation_filter() logic correct.</done>
</task>

<task type="auto" tdd="true">
  <name>Task 2: UserRepository, AuthService, and FastAPI dependencies (get_current_user, require_role)</name>
  <read_first>
    - backend/app/repositories/base.py (BaseRepository interface — UserRepository inherits from it)
    - backend/app/core/security.py (hash_token, verify_password, create_access_token, create_refresh_token, verify_token)
    - backend/app/core/database.py (get_async_session — used in AsyncDB Annotated type)
    - backend/app/core/dependencies.py (existing AsyncDB — extend, do NOT replace)
  </read_first>
  <behavior>
    - UserRepository.get_by_email("wrong@test.com") returns None for non-existent email
    - UserRepository.create(email, full_name, hashed_password, roles, health_station_id) returns User ORM object
    - AuthService.login({email, password}) with correct credentials returns TokenPair
    - AuthService.login({email, password}) with wrong password raises HTTPException(401)
    - AuthService.login({email, wrong_password}) for inactive user raises HTTPException(401)
    - require_role(["nurse"]) dependency raises HTTPException(403) when called with a BHW user payload
    - require_role(["nurse", "disease_surveillance_officer"]) passes a user with roles=["nurse","disease_surveillance_officer"]
  </behavior>
  <action>
1. Create backend/app/repositories/user.py:
   ```python
   """UserRepository — CRUD for users and user_sessions.

   Does NOT inherit BaseRepository — User management is not BHS-scoped.
   The admin can manage all users regardless of BHS assignment.
   """
   from datetime import datetime, timezone

   from sqlalchemy import select, update
   from sqlalchemy.ext.asyncio import AsyncSession

   from app.models.user import User
   from app.models.user_session import UserSession


   class UserRepository:
       def __init__(self, session: AsyncSession) -> None:
           self.session = session

       async def get_by_email(self, email: str) -> User | None:
           result = await self.session.execute(
               select(User).where(User.email == email)
           )
           return result.scalar_one_or_none()

       async def get_by_id(self, user_id: int) -> User | None:
           result = await self.session.execute(
               select(User).where(User.id == user_id)
           )
           return result.scalar_one_or_none()

       async def list_all(self) -> list[User]:
           result = await self.session.execute(select(User).order_by(User.created_at.desc()))
           return list(result.scalars().all())

       async def create(
           self,
           email: str,
           full_name: str,
           hashed_password: str,
           roles: list[str],
           health_station_id: int | None,
       ) -> User:
           user = User(
               email=email,
               full_name=full_name,
               hashed_password=hashed_password,
               roles=roles,
               health_station_id=health_station_id,
               is_active=True,
           )
           self.session.add(user)
           await self.session.flush()  # get auto-generated id before commit
           return user

       async def update(self, user: User, **fields) -> User:
           for k, v in fields.items():
               setattr(user, k, v)
           self.session.add(user)
           return user

       async def get_session_by_token_hash(self, token_hash: str) -> UserSession | None:
           result = await self.session.execute(
               select(UserSession).where(
                   UserSession.token_hash == token_hash,
                   UserSession.revoked_at.is_(None),
               )
           )
           return result.scalar_one_or_none()

       async def create_session(
           self,
           user_id: int,
           token_hash: str,
           expires_at: datetime,
       ) -> UserSession:
           session = UserSession(
               user_id=user_id,
               token_hash=token_hash,
               expires_at=expires_at,
           )
           self.session.add(session)
           await self.session.flush()
           return session

       async def revoke_session(self, session: UserSession) -> None:
           session.revoked_at = datetime.now(timezone.utc)
           self.session.add(session)

       async def revoke_all_sessions(self, user_id: int) -> None:
           """Revoke all active sessions for a user. Called on deactivation — RESEARCH.md Pitfall 4."""
           await self.session.execute(
               update(UserSession)
               .where(
                   UserSession.user_id == user_id,
                   UserSession.revoked_at.is_(None),
               )
               .values(revoked_at=datetime.now(timezone.utc))
           )
   ```

2. Create backend/app/services/auth.py:
   ```python
   """AuthService — login, refresh token rotation, logout.

   Implements server-side token revocation via user_sessions table.
   Refresh token rotation: every /auth/refresh issues new pair, revokes old session row.
   """
   from datetime import datetime, timedelta, timezone

   from fastapi import HTTPException
   from sqlalchemy.ext.asyncio import AsyncSession

   from app.core.config import settings
   from app.core.security import (
       create_access_token,
       create_refresh_token,
       hash_token,
       verify_password,
       verify_token,
   )
   from app.repositories.user import UserRepository
   from app.schemas.auth import LoginRequest, TokenPair


   class AuthService:
       def __init__(self, session: AsyncSession) -> None:
           self.session = session
           self.repo = UserRepository(session)

       async def login(self, body: LoginRequest) -> TokenPair:
           user = await self.repo.get_by_email(body.email)
           if not user or not verify_password(body.password, user.hashed_password):
               raise HTTPException(status_code=401, detail="Incorrect email or password.")
           if not user.is_active:
               raise HTTPException(status_code=401, detail="Account is inactive.")

           access_token = create_access_token(user.id, user.roles, user.health_station_id)
           refresh_token = create_refresh_token(user.id, user.roles, user.health_station_id)

           expires_at = datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
           await self.repo.create_session(
               user_id=user.id,
               token_hash=hash_token(refresh_token),
               expires_at=expires_at,
           )
           await self.session.commit()

           return TokenPair(
               access_token=access_token,
               refresh_token=refresh_token,
           )

       async def refresh(self, refresh_token_raw: str) -> TokenPair:
           """Rotate refresh token: validate, revoke old session, issue new pair."""
           payload = verify_token(refresh_token_raw)  # raises 401 on expiry/invalid
           if payload.get("type") != "refresh":
               raise HTTPException(status_code=401, detail="Invalid token type.")

           token_hash = hash_token(refresh_token_raw)
           session = await self.repo.get_session_by_token_hash(token_hash)
           if not session:
               raise HTTPException(status_code=401, detail="Token has been revoked.")

           user_id = int(payload["sub"])
           roles: list[str] = payload["roles"]
           health_station_id: int | None = payload.get("health_station_id")

           # Revoke the old session before issuing new tokens (rotation)
           await self.repo.revoke_session(session)

           access_token = create_access_token(user_id, roles, health_station_id)
           new_refresh_token = create_refresh_token(user_id, roles, health_station_id)
           expires_at = datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
           await self.repo.create_session(
               user_id=user_id,
               token_hash=hash_token(new_refresh_token),
               expires_at=expires_at,
           )
           await self.session.commit()

           return TokenPair(access_token=access_token, refresh_token=new_refresh_token)

       async def logout(self, refresh_token_raw: str) -> None:
           """Revoke the user_sessions row for this refresh token. No-op if already revoked."""
           try:
               verify_token(refresh_token_raw)
           except HTTPException:
               return  # already expired — nothing to revoke
           token_hash = hash_token(refresh_token_raw)
           session = await self.repo.get_session_by_token_hash(token_hash)
           if session:
               await self.repo.revoke_session(session)
               await self.session.commit()
   ```

3. Extend backend/app/core/dependencies.py with CurrentUser and require_role.
   Read the current file first — it already has AsyncDB. Add below the existing content:
   ```python
   from typing import Annotated

   from fastapi import Depends, HTTPException, Security
   from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
   from sqlalchemy.ext.asyncio import AsyncSession

   from app.core.database import get_async_session
   from app.core.security import verify_token
   from app.schemas.user import UserSchema

   # Existing from Phase 1:
   AsyncDB = Annotated[AsyncSession, Depends(get_async_session)]

   # Auth bearer scheme — auto-returns 403 for missing header; we override to 401 in get_current_user
   _bearer = HTTPBearer(auto_error=False)


   async def get_current_user(
       credentials: HTTPAuthorizationCredentials | None = Security(_bearer),
   ) -> UserSchema:
       """Extract and validate the JWT from the Authorization: Bearer header.
       Raises HTTP 401 if header is missing or token is invalid/expired."""
       if not credentials:
           raise HTTPException(status_code=401, detail="Not authenticated.")
       payload = verify_token(credentials.credentials)
       return UserSchema(
           id=int(payload["sub"]),
           email="",  # not in JWT — fetched from DB only when needed (admin operations)
           full_name="",
           roles=payload["roles"],
           health_station_id=payload.get("health_station_id"),
           is_active=True,
       )


   CurrentUser = Annotated[UserSchema, Depends(get_current_user)]


   def require_role(allowed_roles: list[str]):
       """FastAPI dependency factory. Returns a dependency that raises 403 if
       the current user's roles do not intersect with allowed_roles.

       Usage:
           async def endpoint(db: AsyncDB, current_user: CurrentUser, _=Depends(require_role(["nurse"]))):
       """
       async def _guard(current_user: CurrentUser) -> None:
           if not any(r in allowed_roles for r in current_user.roles):
               raise HTTPException(
                   status_code=403,
                   detail=f"Access requires one of: {allowed_roles}",
               )
       return Depends(_guard)
   ```
   IMPORTANT: Read the actual current dependencies.py content before writing. Preserve any existing code (AsyncDB from Phase 1). Only append the new definitions. Do not duplicate AsyncDB.
  </action>
  <verify>
    <automated>docker-compose exec backend python -c "from app.repositories.user import UserRepository; from app.services.auth import AuthService; from app.core.dependencies import get_current_user, require_role, CurrentUser; print('repositories, service, dependencies OK')"</automated>
  </verify>
  <acceptance_criteria>
    - backend/app/repositories/user.py contains "class UserRepository:"
    - backend/app/repositories/user.py contains "async def get_by_email("
    - backend/app/repositories/user.py contains "async def revoke_all_sessions("
    - backend/app/repositories/user.py contains "async def create_session("
    - backend/app/services/auth.py contains "class AuthService:"
    - backend/app/services/auth.py contains "async def login("
    - backend/app/services/auth.py contains "async def refresh("
    - backend/app/services/auth.py contains "async def logout("
    - backend/app/services/auth.py contains "revoke_session"
    - backend/app/core/dependencies.py contains "def require_role("
    - backend/app/core/dependencies.py contains "CurrentUser"
    - backend/app/core/dependencies.py contains "get_current_user"
    - backend/app/core/dependencies.py contains "HTTPBearer"
    - docker-compose exec backend python -c "from app.services.auth import AuthService; from app.core.dependencies import require_role; print('OK')" exits 0
  </acceptance_criteria>
  <done>UserRepository, AuthService, and all FastAPI auth dependencies are importable and structurally correct; no DB required to import.</done>
</task>

</tasks>

<verification>
Dependency layer verification:
```bash
# All imports clean
docker-compose exec backend python -c "
from app.schemas.auth import LoginRequest, TokenPair
from app.schemas.user import UserSchema, UserListItem
from app.repositories.base import BaseRepository, CROSS_BHS_ROLES
from app.repositories.user import UserRepository
from app.services.auth import AuthService
from app.core.dependencies import get_current_user, require_role, CurrentUser, AsyncDB
print('All dependencies layer imports OK')
print('CROSS_BHS_ROLES:', CROSS_BHS_ROLES)
"
```
</verification>

<success_criteria>
- All 6 modules importable with no errors
- CROSS_BHS_ROLES = frozenset({'city_health_officer', 'phis_coordinator', 'disease_surveillance_officer'})
- BaseRepository._isolation_filter() adds WHERE clause for BHS-scoped roles; skips for CROSS_BHS_ROLES
- AuthService.login() validates password and is_active; creates user_sessions row; returns TokenPair
- AuthService.refresh() revokes old session, creates new session, returns new TokenPair
- UserRepository.revoke_all_sessions() bulk-revokes all active sessions for a user_id
- require_role() raises 403 when no intersection; passes when at least one role matches
- get_current_user() raises 401 when Authorization header is absent
</success_criteria>

<output>
After completion, create `.planning/phases/02-authentication-rbac-user-management/02-03a-SUMMARY.md`
</output>
