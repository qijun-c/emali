from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class AttachmentOut(BaseModel):
    id: int
    filename: str
    content_type: str
    size: int

    class Config:
        from_attributes = True

class MessageOut(BaseModel):
    id: int
    to_address: str
    from_address: str
    subject: str
    text_body: str
    html_body: str
    created_at: datetime
    attachments: List[AttachmentOut] = []

    class Config:
        from_attributes = True

class GenerateAddressOut(BaseModel):
    address: str
    local: str

class SendIn(BaseModel):
    from_address: str
    to: str
    subject: str
    text: Optional[str] = None
    html: Optional[str] = None
