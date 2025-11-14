from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Index
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from .database import Base

class Message(Base):
    __tablename__ = "messages"
    id = Column(Integer, primary_key=True, index=True)
    to_address = Column(String(255), index=True, nullable=False)
    from_address = Column(String(255), nullable=False)
    subject = Column(String(500), default="")
    text_body = Column(Text, default="")
    html_body = Column(Text, default="")
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), index=True)
    attachments = relationship("Attachment", back_populates="message", cascade="all,delete-orphan")

Index("ix_messages_to_created", Message.to_address, Message.created_at)

class Attachment(Base):
    __tablename__ = "attachments"
    id = Column(Integer, primary_key=True, index=True)
    message_id = Column(Integer, ForeignKey("messages.id", ondelete="CASCADE"), nullable=False)
    filename = Column(String(512), nullable=False)
    content_type = Column(String(255), default="application/octet-stream")
    size = Column(Integer, default=0)
    path = Column(String(1024), nullable=False)
    message = relationship("Message", back_populates="attachments")
