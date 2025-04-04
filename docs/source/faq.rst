###
FAQ
###

Frequently Asked Questions about Snakemon.

General Questions
****************

**What is Snakemon?**

Snakemon is a lightweight service designed to monitor the execution of Snakemake workflows, specifically for versions using the legacy WMS monitoring protocol (generally prior to v9.x).

**Why would I use Snakemon?**

Snakemon helps you track and monitor Snakemake workflow executions by:

* Providing a persistent record of workflow runs
* Storing logs and execution details
* Offering a simple UI to view workflow status and history
* Working with older Snakemake versions that use the legacy monitoring protocol

**What versions of Snakemake does Snakemon support?**

Snakemon is designed for Snakemake versions that use the legacy ``--wms-monitor`` parameter, typically versions prior to v9.x. It is not compatible with newer versions that use the Monitor Schema protocol.

Technical Questions
******************

**How does Snakemon detect workflow success or failure?**

Snakemon uses a heuristic approach:

* Success: Workflow is marked as successful if a progress message indicating 100% completion is received AND no error messages are detected
* Error: Workflow is marked as failed if a log message containing "Error in rule" or "Error in group" is received

**Can Snakemon be used with Snakemake v9.x and newer?**

No, Snakemon is specifically designed for older Snakemake versions using the legacy ``--wms-monitor`` protocol. Newer versions of Snakemake (approximately v9.x onwards) use a different monitoring API (Monitor Schema) which is not compatible with Snakemon.

**How do I configure PostgreSQL instead of SQLite?**

Set the ``DATABASE_URL`` environment variable to your PostgreSQL connection string:

.. code-block:: bash

    # Format: postgresql://user:password@host:port/database
    DATABASE_URL="postgresql://postgres:password@localhost:5432/snakemon"

In a Docker environment, update the environment section in your docker-compose.yml.

Docker Questions
***************

**How do I persist data when using Docker?**

For SQLite database persistence, add a volume mount to your docker-compose.yml:

.. code-block:: yaml

    backend:
      volumes:
        - ./data:/app/data  # Adjust path as needed

For PostgreSQL, use a named volume:

.. code-block:: yaml

    postgres:
      volumes:
        - postgres_data:/var/lib/postgresql/data

    volumes:
      postgres_data:

**Can I run only the backend without the frontend?**

Yes, you can run just the backend service:

.. code-block:: bash

    docker-compose up -d backend

**How do I update to a new version?**

To update your Snakemon instance:

.. code-block:: bash

    # Pull the latest code
    git pull
    
    # Rebuild and restart containers
    docker-compose down
    docker-compose build
    docker-compose up -d

Troubleshooting
**************

**Why isn't my workflow status updating?**

Common reasons include:

* Incorrect ``--wms-monitor`` URL in your Snakemake command
* Network connectivity issues between Snakemake and Snakemon
* Using a Snakemake version that doesn't support the legacy monitoring protocol

**How can I debug issues with the Docker setup?**

Check the container logs:

.. code-block:: bash

    # View backend logs
    docker-compose logs backend
    
    # Follow logs in real-time
    docker-compose logs -f

**Why am I getting database errors?**

For SQLite, ensure your database file is writable and the container has proper permissions to the data directory.

For PostgreSQL, verify connection parameters and that the PostgreSQL service is running and accessible. 