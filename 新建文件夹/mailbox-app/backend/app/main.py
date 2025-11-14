from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
import asyncio
import json

from .config import settings
from .database import Base, engine
from .events import hub
from .routers import mailgun as mailgun_router
from .routers import messages as messages_router
from .utils import ensure_attachments_dir

app = FastAPI(title="Infinite Mailbox API")

# CORS
origins = settings.CORS_ORIGINS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"] if "*" in origins else origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# DB init
Base.metadata.create_all(bind=engine)
ensure_attachments_dir()

# Routers
app.include_router(mailgun_router.router, prefix="/api")
app.include_router(messages_router.router, prefix="/api")

@app.get("/api/health")
async def health():
    return {"status": "ok"}

@app.get("/api/info")
async def info():
    return {"public_domain": settings.PUBLIC_DOMAIN, "base_url": settings.PUBLIC_BASE_URL}

@app.get("/api/stream/{local}")
async def stream(local: str, request: Request):
    async def event_generator():
        q = await hub.subscribe(local.lower())
        try:
            while True:
                if await request.is_disconnected():
                    break
                try:
                    data = await asyncio.wait_for(q.get(), timeout=15)
                    yield f"data: {json.dumps(data, ensure_ascii=False)}\n\n"
                except asyncio.TimeoutError:
                    # keep-alive
                    yield ": keep-alive\n\n"
        finally:
            await hub.unsubscribe(local.lower(), q)

    return StreamingResponse(event_generator(), media_type="text/event-stream")
