# Snakemon FastAPI Application 
from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from contextlib import asynccontextmanager
import uuid
from datetime import datetime
import time
from pydantic import BaseModel
import re

from .database import create_db_and_tables, get_db
from . import models

# Pydantic model for the request body of /update_workflow_status
class WorkflowUpdate(BaseModel):
    msg: str
    timestamp: str
    id: str

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

@app.get("/api/service-info")
async def service_info():
    """Returns the status of the monitoring service."""
    return {"status": "running"}

@app.get("/create_workflow")
async def create_workflow(db: Session = Depends(get_db)):
    """Generates a unique ID for a new workflow and registers it."""
    workflow_id = str(uuid.uuid4())
    db_workflow = models.Workflow(id=workflow_id, status="running")
    db.add(db_workflow)
    db.commit()
    # db.refresh(db_workflow) # Optional: if you need the full object back immediately
    return {"id": workflow_id}

@app.post("/update_workflow_status")
async def update_workflow_status(update_data: WorkflowUpdate, db: Session = Depends(get_db)):
    """Receives status updates for a workflow and logs them."""
    # Find the workflow
    db_workflow = db.query(models.Workflow).filter(models.Workflow.id == update_data.id).first()
    if db_workflow is None:
        raise HTTPException(status_code=404, detail=f"Workflow with id {update_data.id} not found")

    # Parse the timestamp (asctime format: 'Wed Jun 30 21:48:08 2021')
    try:
        timestamp_dt = datetime.strptime(update_data.timestamp, "%a %b %d %H:%M:%S %Y")
    except ValueError as e:
        # Log the error and the problematic string for debugging
        print(f"Error parsing timestamp: {update_data.timestamp}. Error: {e}") 
        # Consider raising an HTTPException or returning an error response
        raise HTTPException(status_code=400, detail=f"Invalid timestamp format: {update_data.timestamp}")

    # Create log entry
    db_log = models.WorkflowLog(
        workflow_id=update_data.id,
        timestamp=timestamp_dt,
        message_repr=update_data.msg
    )
    db.add(db_log)
    # Don't commit the log immediately, commit after potential workflow update
    # db.commit()

    # --- Workflow Status Parsing Logic ---
    # Check if workflow is already marked as finished (error/success)
    if db_workflow.status not in ["running"]:
        db.commit() # Commit the log entry
        return {"status": "log recorded, workflow already finished"}

    workflow_changed = False
    msg_text = update_data.msg # The text to parse

    # 1. Check for errors
    if "Error in rule" in msg_text or "Error in group" in msg_text:
        db_workflow.status = "error"
        db_workflow.end_time = timestamp_dt
        workflow_changed = True
    else:
        # 2. Check for 100% progress (heuristic for success)
        # Example pattern: "10 of 10 steps (100.0%) done"
        progress_match = re.search(r"(\d+) of (\d+) steps \((\d+(\.\d+)?)%\) done", msg_text)
        if progress_match:
            done = int(progress_match.group(1))
            total = int(progress_match.group(2))
            if done == total and done > 0: # Ensure it's actually 100% and not 0/0
                # Check if any prior logs for this workflow indicated an error
                # This check prevents marking success if an error occurred earlier but 100% progress was still reported
                # Note: This requires querying logs, could impact performance slightly on very large logs.
                # Consider optimizing if needed (e.g., adding an 'has_errors' flag to Workflow model).
                # For now, let's keep the logic simple.
                # Simplification: We already checked db_workflow.status != 'error' above. 
                # If it reached here and is 100%, we assume success for now.
                db_workflow.status = "success"
                db_workflow.end_time = timestamp_dt
                workflow_changed = True

    # Commit changes if workflow status or end_time was updated
    if workflow_changed:
        db.add(db_workflow) # Add the updated workflow object to the session
        print(f"Workflow {db_workflow.id} status updated to {db_workflow.status}")
    
    db.commit() # Commit log entry and potentially workflow updates together

    return {"status": "log recorded"} 