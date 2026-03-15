from typing import Annotated
from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_async_session

AsyncDB = Annotated[AsyncSession, Depends(get_async_session)]
# Usage in routers: async def endpoint(db: AsyncDB): ...
