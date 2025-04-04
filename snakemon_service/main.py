# Snakemon FastAPI Application 
from fastapi import FastAPI, Depends, HTTPException, Request, Form
from sqlalchemy.orm import Session, selectinload
from contextlib import asynccontextmanager
import uuid
from datetime import datetime
import time
from pydantic import BaseModel
import re
from fastapi.middleware.cors import CORSMiddleware
from typing import List
import json # Import json library

from .database import create_db_and_tables, get_db
from . import models
from . import schemas # Import the new schemas module

# Pydantic model for the request body of /update_workflow_status
# This is no longer used for the PUT endpoint and can be removed
# class WorkflowUpdate(BaseModel):
#     msg: str
#     timestamp: str
#     id: str

# Regex to capture progress percentage
PROGRESS_RE = re.compile(r"^(\d+)% done$")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # On startup
    print("Creating database and tables...")
    create_db_and_tables()
    print("Database and tables created.")
    yield
    # On shutdown (if needed)
    print("Shutting down...")

app = FastAPI(lifespan=lifespan)

# --- Add CORS Middleware ---
origins = [
    "http://localhost",
    "http://localhost:5173", # Default Vite dev port for frontend
    "http://localhost:8000", # Default FastAPI dev port for backend
    # Add the production frontend URL if applicable later
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# --- End CORS Middleware ---

@app.get("/api/service-info")
async def service_info():
    """Returns the status of the monitoring service."""
    return {"status": "running"}

@app.get("/api/workflows", response_model=List[schemas.WorkflowRead])
async def get_all_workflows(db: Session = Depends(get_db)):
    """Returns a list of all monitored workflow runs."""
    # Eagerly load logs to avoid N+1 queries if accessed in schema
    workflows = db.query(models.Workflow).options(selectinload(models.Workflow.logs)).order_by(models.Workflow.start_time.desc()).all()
    return workflows

@app.get("/api/workflows/{workflow_id}", response_model=schemas.WorkflowRead)
async def get_workflow_details(workflow_id: str, db: Session = Depends(get_db)):
    """Returns details for a specific workflow run."""
    db_workflow = db.query(models.Workflow).options(selectinload(models.Workflow.logs)).filter(models.Workflow.id == workflow_id).first()
    if db_workflow is None:
        raise HTTPException(status_code=404, detail=f"Workflow with id {workflow_id} not found")
    return db_workflow

@app.get("/create_workflow")
async def create_workflow(db: Session = Depends(get_db)):
    """Generates a unique ID for a new workflow and registers it."""
    workflow_id = str(uuid.uuid4())
    db_workflow = models.Workflow(id=workflow_id, status="running")
    db.add(db_workflow)
    db.commit()
    # db.refresh(db_workflow) # Optional: if you need the full object back immediately
    return {"id": workflow_id}

@app.put("/api/workflow/{workflow_id}")
# Remove request body parameter entirely as it's empty
async def update_workflow_status(workflow_id: str, db: Session = Depends(get_db)):
    """Receives completion/update signal for a workflow via PUT request (legacy WMS)."""
    
    # Find the workflow using the ID from the path
    db_workflow = db.query(models.Workflow).filter(models.Workflow.id == workflow_id).first()
    if db_workflow is None:
        # Log an error but maybe don't raise HTTPException? 
        # Or raise 404 as before, depending on desired strictness.
        print(f"WARN: Received PUT for unknown workflow id {workflow_id}")
        raise HTTPException(status_code=404, detail=f"Workflow with id {workflow_id} not found")

    # Log that we received the signal
    # We don't get msg/timestamp from this request based on observed behavior
    timestamp_dt = datetime.utcnow() # Use current time 
    db_log = models.WorkflowLog(
        workflow_id=workflow_id,
        timestamp=timestamp_dt,
        message_repr="[Workflow Update Signal Received (PUT)]" # Generic message
    )
    db.add(db_log)

    # Optionally, update workflow status or end_time here
    # Simplest: Update end_time and mark as 'finished' (cannot distinguish success/error)
    if db_workflow.status == "running":
        db_workflow.status = "finished (unknown)" # Generic finished status
        db_workflow.end_time = timestamp_dt
        print(f"Workflow {db_workflow.id} marked as finished by PUT signal.")
        db.add(db_workflow)
    
    db.commit() 

    # Return a simple success status
    return {"status": "update signal received"}

# Endpoint to update specific fields like name or arguments
@app.put("/api/workflows/{workflow_id}", response_model=schemas.WorkflowRead)
async def update_workflow_metadata(workflow_id: str, workflow_update: schemas.WorkflowUpdate, db: Session = Depends(get_db)):
    """Updates specific metadata for a workflow (e.g., name, arguments)."""
    db_workflow = db.query(models.Workflow).filter(models.Workflow.id == workflow_id).first()
    if db_workflow is None:
        raise HTTPException(status_code=404, detail=f"Workflow with id {workflow_id} not found")

    update_data = workflow_update.model_dump(exclude_unset=True) # Pydantic v2
    # update_data = workflow_update.dict(exclude_unset=True) # Pydantic v1
    
    for key, value in update_data.items():
        setattr(db_workflow, key, value)
        
    db.add(db_workflow)
    db.commit()
    db.refresh(db_workflow) # Refresh to get updated state
    return db_workflow

@app.post("/update_workflow_status")
# Change signature to accept Request and db session
async def update_workflow_log(request: Request, db: Session = Depends(get_db)):
    """Receives log messages and status updates from Snakemake (as form data)."""
    
    # --- Remove Temporary Debugging ---
    # try:
    #     raw_body = await request.body()
    #     print(f"DEBUG: Raw request body for /update_workflow_status: {raw_body.decode()}")
    # except Exception as e:
    #     print(f"DEBUG: Error reading raw request body: {e}")
    # --- End Debugging ---

    try:
        form_data = await request.form()
        workflow_id = form_data.get('id')
        timestamp_str = form_data.get('timestamp')
        msg_json_str = form_data.get('msg')

        if not all([workflow_id, timestamp_str, msg_json_str]):
             print(f"ERROR: Missing required form fields in /update_workflow_status. Received id={workflow_id}, timestamp={timestamp_str is not None}, msg={msg_json_str is not None}")
             # Return 200 OK still, to avoid breaking Snakemake
             return {"status": "log received, missing fields"}

    except Exception as e:
        print(f"ERROR: Could not parse form data for /update_workflow_status: {e}")
        raw_body = await request.body()
        print(f"DEBUG: Failing raw body: {raw_body.decode()}")
        return {"status": "log received, form parse error"}

    try:
        # Parse the timestamp (asctime format)
        timestamp_dt = datetime.strptime(timestamp_str, "%a %b %d %H:%M:%S %Y")
    except ValueError:
        print(f"WARN: Could not parse timestamp '{timestamp_str}' for workflow {workflow_id}. Using current time.")
        timestamp_dt = datetime.utcnow()

    # Parse the inner JSON message
    try:
        msg_data = json.loads(msg_json_str)
        # Extract the actual message, handle potential missing key
        actual_msg = msg_data.get('msg', msg_json_str) # Fallback to the raw JSON string if 'msg' key missing
    except json.JSONDecodeError:
        print(f"WARN: Could not parse msg JSON '{msg_json_str}' for workflow {workflow_id}. Using raw string.")
        actual_msg = msg_json_str # Use the raw string if it's not valid JSON
    except Exception as e:
        print(f"ERROR: Unexpected error processing msg field for workflow {workflow_id}: {e}")
        actual_msg = msg_json_str # Fallback

    # Find the workflow
    db_workflow = db.query(models.Workflow).filter(models.Workflow.id == workflow_id).first()

    if db_workflow is None:
        print(f"WARN: Received log for unknown workflow id {workflow_id}")
        return {"status": "log received, workflow unknown"}

    # Create the log entry using the actual message
    db_log = models.WorkflowLog(
        workflow_id=workflow_id,
        timestamp=timestamp_dt,
        message_repr=actual_msg 
    )
    db.add(db_log)

    # --- Heuristic Status Update (using actual_msg) --- 
    try:
        if "error" in actual_msg.lower() or "failed" in actual_msg.lower():
            if db_workflow.status == "running":
                db_workflow.status = "failed"
                db_workflow.end_time = timestamp_dt
                print(f"Workflow {workflow_id} marked as failed based on message: {actual_msg}")
        elif "Nothing to be done" in actual_msg:
             if db_workflow.status == "running":
                db_workflow.status = "successful"
                db_workflow.end_time = timestamp_dt
                print(f"Workflow {workflow_id} marked as successful (nothing to be done).")
        else:
            progress_match = PROGRESS_RE.match(actual_msg) # Check actual message for progress
            if progress_match:
                progress = int(progress_match.group(1))
                if progress == 100:
                     if db_workflow.status == "running":
                        db_workflow.status = "successful"
                        db_workflow.end_time = timestamp_dt
                        print(f"Workflow {workflow_id} marked as successful (100% done).")
                elif db_workflow.status == "running":
                    db_workflow.status = f"running ({progress}%)"
    except Exception as e:
        print(f"ERROR: Failed heuristic status update for workflow {workflow_id}: {e}")
    # --- End Heuristic --- 

    db.commit()
    return {"status": "log received"} 