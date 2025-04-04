###########
Limitations
###########

It is crucial to understand the limitations of the current Snakemon implementation:

1.  **Snakemake Version Compatibility:**

    *   Snakemon is designed for Snakemake versions using the **legacy WMS monitoring protocol**. This protocol was present in older versions (analysis confirmed up to v8.3.3) and is generally expected in versions **prior to v9.x**.
    *   It specifically implements the simple API interaction associated with the ``--wms-monitor`` flag in those older versions.
    *   Later versions of Snakemake (approximately v9.x onwards) use a different, more structured monitoring API (`Monitor Schema <https://github.com/panoptes-organization/monitor-schema>`_) which is **not compatible** with this service.

2.  **Heuristic Status Determination:**

    *   The monitored Snakemake versions (like v8.3.3 based on analyzed code commit ``0998cc5``) do not appear to send an explicit "Workflow finished successfully" message via this legacy protocol.
    *   Snakemon determines the final status (``success`` or ``error``) **heuristically**:

        *   **Error:** Status is set to ``error`` if a log message containing ``"Error in rule"`` or ``"Error in group"`` is received.
        *   **Success:** Status is set to ``success`` *only* if a progress message indicating 100% completion (e.g., ``"10 of 10 steps (100%) done"``) is received **AND** the workflow has not already been marked as ``error``.

    *   **Risk:** This heuristic might incorrectly mark a workflow as ``success`` if an error occurs *after* the 100% progress message is logged but before Snakemake fully exits or sends a final error message that isn't captured by the standard error patterns.

3.  **Message Parsing:**

    *   The parsing logic relies on simple string matching within the received log message (``update_data.msg``).
    *   It assumes the key phrases (``"Error in rule"``, ``"Error in group"``, ``"X of Y steps...done"``) are present as plain text within the message sent by Snakemake.
    *   While analysis suggests this is likely for the target versions, variations in Snakemake patch versions *could* potentially alter message formatting slightly, impacting the reliability of the heuristic parsing.

4.  **Basic API:**

    *   The service only implements the three essential API endpoints required by the older ``--wms-monitor`` protocol (``/api/service-info``, ``/create_workflow``, ``/update_workflow_status``).
    *   It does not offer any additional endpoints for querying workflow status or logs via HTTP; database access is required for inspection. 