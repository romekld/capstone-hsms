from fastapi import FastAPI
from app.core.config import settings

app = FastAPI(title="Project LINK HSMS", version="0.1.0")


@app.get("/health")
async def health_check():
    return {"status": "ok", "debug": settings.DEBUG}
