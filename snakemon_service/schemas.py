# Pydantic Schemas for Snakemon

from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional # Ensure Optional is imported

# Base model configuration
class BaseConfig(BaseModel):
    from_attributes: bool = True # Pydantic v2 way to enable ORM mode

# Schema for creating a workflow (implicitly handled by /create_workflow response)
# Schema for reading a single workflow log entry
class WorkflowLogRead(BaseModel):
    id: int
    timestamp: datetime
    message_repr: Optional[str] = None # Allow None to match potential DB NULLs

    class Config:
        from_attributes = True # Enable ORM mode

# Schema for reading a workflow, including its logs
class WorkflowRead(BaseModel):
    id: str
    name: Optional[str] = None # Add new field
    start_time: datetime
    end_time: Optional[datetime] = None
    status: str
    workdir: Optional[str] = None # Add new field
    snakefile_path: Optional[str] = None # Add new field
    arguments_json: Optional[str] = None # Add new field
    logs: List[WorkflowLogRead] = []

    class Config:
        from_attributes = True # Enable ORM mode

# Schema for updating a workflow (PUT request)
class WorkflowUpdate(BaseModel):
    name: Optional[str] = None
    arguments_json: Optional[str] = None
    # Add other fields here if they should be updatable via PUT

# Schema for the request body of the PUT /api/workflow/{workflow_id} endpoint
class WorkflowStatusUpdatePayload(BaseModel):
    msg: str
    timestamp: str
    # No 'id' field here, as it comes from the path parameter

# Add other schemas as needed (e.g., for creating/updating workflows or logs) 