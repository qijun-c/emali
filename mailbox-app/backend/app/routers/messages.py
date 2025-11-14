from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from sqlalchemy import select, desc
import httpx
import os
from typing import Optional

from ..database import get_db
from ..models import Message, Attachment
from ..schemas import MessageOut, GenerateAddressOut, SendIn
from ..config import settings
from ..utils import generate_local_part

router = APIRouter()


@router.get("/messages", response_model=list[MessageOut])
async def list_messages(local: Optional[str] = None, limit: int = 50, db: Session = Depends(get_db)):
    stmt = select(Message).order_by(desc(Message.created_at)).limit(limit)
    if local:
        stmt = select(Message).where(Message.to_address.ilike(f"{local}@%"))\
            .order_by(desc(Message.created_at)).limit(limit)
    rows = db.execute(stmt).scalars().unique().all()
    return rows


@router.get("/messages/{message_id}", response_model=MessageOut)
async def get_message(message_id: int, db: Session = Depends(get_db)):
    msg = db.get(Message, message_id)
    if not msg:
        raise HTTPException(status_code=404, detail="Not found")
    return msg


@router.get("/attachments/{attachment_id}/download")
async def download_attachment(attachment_id: int, db: Session = Depends(get_db)):
    att = db.get(Attachment, attachment_id)
    if not att or not os.path.exists(att.path):
        raise HTTPException(status_code=404, detail="Not found")
    return FileResponse(att.path, media_type=att.content_type, filename=att.filename)


@router.get("/generate", response_model=GenerateAddressOut)
async def generate_address():
    local = generate_local_part()
    return {"address": f"{local}@{settings.PUBLIC_DOMAIN}", "local": local}


@router.post("/send")
async def send_email(body: SendIn):
    if not settings.MAILGUN_DOMAIN or not settings.MAILGUN_API_KEY:
        raise HTTPException(status_code=500, detail="Mailgun not configured")
    url = f"https://api.mailgun.net/v3/{settings.MAILGUN_DOMAIN}/messages"
    data = {
        "from": body.from_address,
        "to": body.to,
        "subject": body.subject,
    }
    if body.text:
        data["text"] = body.text
    if body.html:
        data["html"] = body.html

    async with httpx.AsyncClient(timeout=15) as client:
        resp = await client.post(url, data=data, auth=("api", settings.MAILGUN_API_KEY))
        if resp.status_code >= 400:
            raise HTTPException(status_code=502, detail=f"Mailgun error: {resp.text}")
    return {"status": "sent"}
