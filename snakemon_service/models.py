# Snakemon Database Models 

from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from typing import Optional, List
from sqlalchemy.sql import func
from sqlalchemy.orm import Mapped
from .database import Base

class Workflow(Base):
    __tablename__ = "workflow"

    id: Mapped[str] = Column(String, primary_key=True, index=True)
    name: Mapped[Optional[str]] = Column(String, nullable=True)
    status: Mapped[str] = Column(String, default="running")
    start_time: Mapped[datetime] = Column(DateTime(timezone=True), server_default=func.now())
    end_time: Mapped[Optional[datetime]] = Column(DateTime(timezone=True), nullable=True)
    workdir: Mapped[Optional[str]] = Column(String, nullable=True)
    snakefile_path: Mapped[Optional[str]] = Column(String, nullable=True)
    arguments_json: Mapped[Optional[str]] = Column(Text, nullable=True) # Use Text for potentially long JSON

    logs: Mapped[List["WorkflowLog"]] = relationship("WorkflowLog", back_populates="workflow", cascade="all, delete-orphan")

class WorkflowLog(Base):
    __tablename__ = "workflow_logs"

    id = Column(Integer, primary_key=True, index=True)
    workflow_id = Column(String, ForeignKey("workflow.id"))
    timestamp = Column(DateTime)
    message_repr = Column(Text)

    workflow = relationship("Workflow", back_populates="logs") 