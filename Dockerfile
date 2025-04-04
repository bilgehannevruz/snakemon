# Stage 1: Base with Python and uv
FROM python:3.11-slim as base
ENV PATH="/root/.local/bin:$PATH"
# Install uv using pip
RUN pip install --upgrade pip
RUN pip install uv
RUN uv --version

# Stage 2: Install dependencies using uv sync
FROM base as builder
WORKDIR /app
COPY pyproject.toml uv.lock* ./
# Install dependencies based on lock file (uv handles the venv)
RUN uv sync --group dev --group prod

# Stage 3: Final image - Use the builder image directly
FROM builder as runtime
WORKDIR /app # WORKDIR is inherited

# Copy application code (dependencies are already present in the venv within builder)
COPY snakemon_service ./snakemon_service
COPY main.py .

# Expose the port the app runs on
EXPOSE 8000

# Run the application using python -m to ensure module is found
# Python will use the activated venv or find the module correctly
# Explicitly use python from the venv:
CMD ["/app/.venv/bin/python", "-m", "uvicorn", "snakemon_service.main:app", "--host", "0.0.0.0", "--port", "8000"]