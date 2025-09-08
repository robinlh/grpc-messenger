from datetime import datetime, UTC

from sqlalchemy import Column, Integer, Text, DateTime, ForeignKey, Index
from sqlalchemy.orm import relationship

from messenger.config.database import Base


class Message(Base):
    __tablename__ = "messages"
    
    id = Column(Integer, primary_key=True, index=True)
    content = Column(Text, nullable=False)
    sender_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    thread_id = Column(Integer, ForeignKey("threads.id"), nullable=False, index=True)
    created_at = Column(DateTime, default=datetime.now(UTC), index=True)
    
    sender = relationship("User", foreign_keys=[sender_id], back_populates="sent_messages")
    thread = relationship("Thread", back_populates="messages")
    
    __table_args__ = (
        Index('ix_message_thread_created', 'thread_id', 'created_at'),
    )
    
    def __repr__(self):
        return f"<Message(id={self.id}, sender_id={self.sender_id}, content='{self.content[:50]}...')>"