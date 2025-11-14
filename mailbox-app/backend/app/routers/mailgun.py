from fastapi import APIRouter, Request, Depends, HTTPException
from sqlalchemy.orm import Session
import hmac
import hashlib

from ..database import get_db
from ..models import Message, Attachment
from ..config import settings
from ..utils import sanitize_html, save_attachment
from ..events import hub

router = APIRouter()


def _verify_mailgun_signature(timestamp: str, token: str, signature: str) -> bool:
    if not settings.MAILGUN_SIGNING_KEY:
        # In development, allow missing signing key (NOT for production)
        return True
    digest = hmac.new(settings.MAILGUN_SIGNING_KEY.encode(), msg=f"{timestamp}{token}".encode(), digestmod=hashlib.sha256).hexdigest()
    return hmac.compare_digest(digest, signature or "")


@router.post("/webhooks/mailgun")
async def mailgun_inbound(request: Request, db: Session = Depends(get_db)):
    form = await request.form()
    timestamp = form.get("timestamp")
    token = form.get("token")
    signature = form.get("signature")

    if not _verify_mailgun_signature(timestamp, token, signature):
        raise HTTPException(status_code=403, detail="Invalid Mailgun signature")

    recipient = (form.get("recipient") or "").strip()
    from_address = (form.get("from") or form.get("sender") or "").strip()
    subject = (form.get("subject") or "").strip()
    text = (form.get("stripped-text") or form.get("body-plain") or "").strip()
    html = sanitize_html(form.get("stripped-html") or form.get("body-html") or "")

    if not recipient or not from_address:
        raise HTTPException(status_code=400, detail="Missing recipient/from")

    msg = Message(
        to_address=recipient.lower(),
        from_address=from_address,
        subject=subject,
        text_body=text,
        html_body=html,
    )
    db.add(msg)
    db.flush()  # get msg.id

    # Save attachments: keys "attachment-1", "inline-1", etc.
    for key, value in form.items():
        if not hasattr(value, "filename") or not hasattr(value, "file"):
            continue
        if not key.startswith("attachment-") and not key.startswith("inline-"):
            continue
        if not value.filename:
            continue
        path, size = save_attachment(value.file, value.filename)
        att = Attachment(
            message_id=msg.id,
            filename=value.filename,
            content_type=getattr(value, "content_type", "application/octet-stream"),
            size=size,
            path=path,
        )
        db.add(att)

    db.commit()

    # Publish SSE event keyed by local part
    try:
        local = recipient.split("@")[0].lower()
        await hub.publish(local, {"type": "new_message", "message_id": msg.id})
    except Exception:
        pass

    return {"status": "ok", "id": msg.id}
