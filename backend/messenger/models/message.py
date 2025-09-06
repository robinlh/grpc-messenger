from datetime import datetime

from sqlalchemy import Column, Integer, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship

from messenger.config.database import Base


class Message(Base):
    __tablename__ = "messages"
    
    id = Column(Integer, primary_key=True, index=True)
    content = Column(Text, nullable=False)
    sender_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    thread_id = Column(Integer, ForeignKey("threads.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    sender = relationship("User", foreign_keys=[sender_id], back_populates="sent_messages")
    thread = relationship("Thread", back_populates="messages")
    
    def __repr__(self):
        return f"<Message(id={self.id}, sender_id={self.sender_id}, content='{self.content[:50]}...')>"