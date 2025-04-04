###########################
Snakemon - Snakemake Monitor
###########################

Snakemon is a lightweight web service designed to monitor the execution of Snakemake workflows, specifically targeting versions using the **legacy WMS monitoring protocol (generally prior to v9.x)**.

It listens for HTTP requests sent by Snakemake when configured with the ``--wms-monitor`` flag found in those older versions, logs workflow events to a database, and attempts to determine the final status (success or error) of the workflow.

Purpose
*******

*   Provide a persistent record of Snakemake workflow runs.
*   Offer a simple API compatible with the legacy ``--wms-monitor`` feature.
*   Store workflow details (ID, start/end times, status) and logs in a configurable database (SQLite or PostgreSQL).

.. toctree::
   :maxdepth: 2
   :caption: Contents:

   usage
   limitations 