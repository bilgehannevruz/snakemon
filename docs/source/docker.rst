#####################
Docker Deployment
#####################

This section provides detailed information about deploying Snakemon using Docker containers.

Quick Start
**********

The simplest way to get Snakemon running with Docker:

.. code-block:: bash

    # Clone the repository
    git clone https://github.com/bilgehannevruz/snakemon
    cd snakemon
    
    # Start the containers
    docker-compose up -d
    
    # Access the UI
    # Open http://localhost:5173 in your browser

Container Architecture
*********************

Snakemon uses a multi-container setup:

1. **Backend Container:**
   * Built from ``./Dockerfile``
   * Runs the FastAPI service on port 8000
   * Provides the REST API endpoints for Snakemake monitoring
   * Manages database connections and persistence

2. **Frontend Container:**
   * Built from ``./frontend/Dockerfile``
   * Nginx server hosting the React SPA on port 80 (mapped to 5173)
   * Communicates with the backend API

Container Configuration
**********************

Database Configuration
=====================

The backend container supports two database options:

1. **SQLite (Default):**
   
   .. code-block:: yaml
   
       environment:
         DATABASE_URL: "sqlite:///./snakemon.db"

   **Important:** For data persistence with SQLite, add a volume mount:
   
   .. code-block:: yaml
   
       volumes:
         - ./data:/app/data  # Mount a directory to persist the SQLite database

2. **PostgreSQL:**
   
   .. code-block:: yaml
   
       environment:
         DATABASE_URL: "postgresql://user:password@postgres:5432/snakemon"
       
       # Add a postgres service
       postgres:
         image: postgres:14
         environment:
           POSTGRES_USER: user
           POSTGRES_PASSWORD: password
           POSTGRES_DB: snakemon
         volumes:
           - postgres_data:/var/lib/postgresql/data

Custom Network Configuration
===========================

For more complex setups, you can customize the network configuration:

.. code-block:: yaml

    networks:
      snakemon-network:
        driver: bridge
    
    services:
      backend:
        networks:
          - snakemon-network
      
      frontend:
        networks:
          - snakemon-network

Production Deployment
********************

For production deployments, consider these additional steps:

1. **Use PostgreSQL** for database reliability and performance
2. **Set up reverse proxy** (like Nginx or Traefik) for HTTPS support
3. **Configure proper volume mounts** for data persistence
4. **Add health checks** to the containers
5. **Adjust resource limits** based on expected load

Example production docker-compose section:

.. code-block:: yaml

    backend:
      restart: always
      healthcheck:
        test: ["CMD", "curl", "-f", "http://localhost:8000/api/service-info"]
        interval: 30s
        timeout: 10s
        retries: 3
      deploy:
        resources:
          limits:
            cpus: '1'
            memory: 1G

Troubleshooting
**************

1. **Database Connection Issues:**
   
   * Verify the DATABASE_URL environment variable
   * For PostgreSQL, ensure the database service is running
   * Check network connectivity between containers

2. **Frontend Can't Connect to Backend:**
   
   * Verify that VITE_API_BASE_URL is set correctly
   * Ensure the backend container is running and healthy
   * Check if the ports are correctly mapped

3. **Container Fails to Start:**
   
   * Check logs: ``docker-compose logs backend``
   * Verify that ports aren't already in use on the host
   * Ensure Docker has sufficient resources 