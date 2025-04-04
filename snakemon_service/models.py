# Snakemon Database Models 

from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime

from .database import Base

class Workflow(Base):
    __tablename__ = "workflows"

    id = Column(String, primary_key=True, index=True)
    status = Column(String, index=True)
    start_time = Column(DateTime, default=datetime.utcnow)
    end_time = Column(DateTime, nullable=True)

    logs = relationship("WorkflowLog", back_populates="workflow")

class WorkflowLog(Base):
    __tablename__ = "workflow_logs"

    id = Column(Integer, primary_key=True, index=True)
    workflow_id = Column(String, ForeignKey("workflows.id"))
    timestamp = Column(DateTime)
    message_repr = Column(Text)

    workflow = relationship("Workflow", back_populates="logs") 