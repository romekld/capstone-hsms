import pytest
import pytest_asyncio

try:
    from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
    from sqlalchemy.pool import NullPool
    from app.core.base import Base
    from app.core.config import settings
    HAS_BASE = True
except ImportError:
    HAS_BASE = False


@pytest_asyncio.fixture(scope="session")
async def async_engine():
    if not HAS_BASE:
        pytest.skip("app.core.base not yet implemented (Plan 02)")
    engine = create_async_engine(settings.TEST_DATABASE_URL, poolclass=NullPool)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield engine
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
    await engine.dispose()


@pytest_asyncio.fixture
async def async_session(async_engine) -> AsyncSession:
    async with async_sessionmaker(async_engine, expire_on_commit=False)() as session:
        yield session
