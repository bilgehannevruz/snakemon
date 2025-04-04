############################
Snakemon - Snakemake Monitor
############################

Snakemon is a lightweight web service designed to monitor the execution of Snakemake workflows, specifically targeting versions using the **legacy WMS monitoring protocol (generally prior to v9.x)**.

It listens for HTTP requests sent by Snakemake when configured with the ``--wms-monitor`` flag found in those older versions, logs workflow events to a database, and attempts to determine the final status (success or error) of the workflow.

Purpose
*******

*   Provide a persistent record of Snakemake workflow runs.
*   Offer a simple API compatible with the legacy ``--wms-monitor`` feature.
*   Store workflow details (ID, start/end times, status) and logs in a configurable database (SQLite or PostgreSQL).

Features
********

*   **Workflow Tracking:** Monitor and persist the progress of Snakemake workflows.
*   **Status Detection:** Automatically determine workflow success or error status.
*   **Log Collection:** Store and view all log messages generated during workflow execution.
*   **Web Interface:** Access workflow information through a simple web UI.
*   **Flexible Database Support:** Use SQLite for development or PostgreSQL for production environments.
*   **Docker Support:** Deploy easily using Docker containers for both backend API and frontend UI.

Architecture
***********

Snakemon consists of two main components:

1. **Backend API Service:**
   * FastAPI-based REST API that receives and processes Snakemake monitoring events
   * SQLAlchemy ORM for database operations
   * Provides endpoints for creating and updating workflow status

2. **Frontend Web Interface:**
   * React-based single-page application
   * View workflows and their details, including logs and execution status
   * Simple, responsive UI for monitoring workflow progress

.. toctree::
   :maxdepth: 2
   :caption: Contents:

   usage
   docker
   limitations
   faq 