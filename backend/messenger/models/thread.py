from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from datetime import UTC

from messenger.config.database import Base

class Thread(Base):
    __tablename__ = "threads"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100))  # none for dms
    created_at = Column(DateTime, default=datetime.now(UTC))
    updated_at = Column(DateTime, default=datetime.now(UTC), onupdate=datetime.now(UTC))
    
    messages = relationship("Message", back_populates="thread", order_by="Message.created_at")
    participants = relationship("ThreadParticipant", back_populates="thread")
    
    def __repr__(self):
        return f"<Thread(id={self.id}, name='{self.name}')>"

class ThreadParticipant(Base):
    __tablename__ = "thread_participants"
    
    id = Column(Integer, primary_key=True, index=True)
    thread_id = Column(Integer, ForeignKey("threads.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    joined_at = Column(DateTime, default=datetime.utcnow)
    
    thread = relationship("Thread", back_populates="participants")
    user = relationship("User", back_populates="thread_participants")
    
    def __repr__(self):
        return f"<ThreadParticipant(thread_id={self.thread_id}, user_id={self.user_id})>"