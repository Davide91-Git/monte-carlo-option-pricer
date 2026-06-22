# ============================================================
# Dockerfile — Hugging Face Space
# ============================================================

# ---- Stage 1: build the React frontend -----------------------------------
FROM node:20-slim AS frontend-builder

WORKDIR /frontend
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci

COPY frontend/ ./
ENV VITE_API_URL=/api/v1
RUN npm run build


# ---- Stage 2: backend + PostgreSQL + built frontend -----------------------
FROM python:3.12-slim

RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq-dev gcc postgresql postgresql-contrib \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY backend/pyproject.toml ./
COPY backend/app ./app
COPY backend/scripts ./scripts
RUN pip install --no-cache-dir -e ".[dev]"

# Built frontend, served by FastAPI's StaticFiles mount
COPY --from=frontend-builder /frontend/dist ./static

COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Internal-only Postgres instance
ENV POSTGRES_USER=mcpricer \
    POSTGRES_PASSWORD=mcpricer \
    POSTGRES_DB=mcpricer \
    DATABASE_URL=postgresql://mcpricer:mcpricer@localhost:5432/mcpricer \
    DEBUG=false

EXPOSE 7860

CMD ["/entrypoint.sh"]
