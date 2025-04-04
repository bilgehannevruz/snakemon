###########
Usage Guide
###########

Installation
************

1.  **Clone the Repository:**

    .. code-block:: bash

        git clone https://github.com/bilgehannevruz/snakemon
        cd snakemon

2.  **Install Dependencies:** Snakemon uses ``uv`` for package management.

    *   For Production (running the service):

        .. code-block:: bash

            # Install uv if you don't have it: https://github.com/astral-sh/uv
            uv sync --group prod

    *   For Development (including docs dependencies):

        .. code-block:: bash

            uv sync --group dev --group prod # Installs both prod and dev dependencies
            # OR install all groups if no specific group is needed for dev
            # uv sync

    This command installs dependencies listed in ``pyproject.toml`` under the specified groups.

Configuration
*************

Snakemon uses a ``.env`` file in the project root directory for configuration. Create one if it doesn't exist.

**.env Example:**

.. code-block:: bash

    # Database URL (SQLAlchemy format)
    # Default is SQLite in the project directory
    DATABASE_URL="sqlite:///./snakemon.db"

    # Example for PostgreSQL:
    # DATABASE_URL="postgresql://user:password@host:port/mydatabase"

*   If using PostgreSQL, ensure you have the ``psycopg2-binary`` driver installed (it's included in the ``prod`` group).

Running the Service
*******************

Use ``uv`` to run the Uvicorn server:

.. code-block:: bash

    uv run uvicorn snakemon_service.main:app --host 0.0.0.0 --port 8000

*   Adjust ``--host`` and ``--port`` as needed.
*   For development, you can add the ``--reload`` flag:

    .. code-block:: bash

        uv run uvicorn snakemon_service.main:app --reload --port 8000

The service will start, and on the first run, it will create the database file (``snakemon.db`` by default) and the necessary tables.

Snakemake Integration
*********************

To make your Snakemake workflow send monitoring events to Snakemon, add the ``--wms-monitor`` flag to your Snakemake command:

.. code-block:: bash

    snakemake --wms-monitor http://<snakemon_host>:<snakemon_port> [your other snakemake arguments]

*   Replace ``<snakemon_host>`` with the hostname or IP address where Snakemon is running (e.g., ``127.0.0.1`` if running locally).
*   Replace ``<snakemon_port>`` with the port Snakemon is listening on (e.g., ``8000``).

**Example:**

.. code-block:: bash

    snakemake -j 4 --wms-monitor http://127.0.0.1:8000 --use-conda

**Important:** This integration works with Snakemake versions using the legacy WMS monitoring protocol (generally **prior to v9.x**). It is **not compatible** with the newer Monitor Schema found in later versions.

Viewing Data
************

Workflow details and logs are stored in the configured database. You can use standard database tools (like DB Browser for SQLite, psql, pgAdmin, etc.) to inspect the ``workflows`` and ``workflow_logs`` tables.

Building Documentation
**********************

To build or serve the documentation locally using Sphinx:

.. code-block:: bash

    # In the docs/ directory
    make html  # Build static HTML files (output in docs/build/html/)

    # Or serve locally (usually requires sphinx-autobuild)
    # pip install sphinx-autobuild
    # make livehtml 