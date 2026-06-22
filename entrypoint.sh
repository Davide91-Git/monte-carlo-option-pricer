#!/usr/bin/env bash
set -euo pipefail

# ============================================================
# entrypoint.sh — HF Space container startup
#
# Everything below runs on every cold start 
# (container restart after the Space wakes from sleep), 
# not just the first time. 
# ============================================================

# ── 1. Start PostgreSQL ──────────────────────────────────────
PG_VERSION=$(ls /etc/postgresql)
su postgres -c "pg_ctlcluster ${PG_VERSION} main start"

until su postgres -c "pg_isready -q"; do
  echo "Waiting for PostgreSQL..."
  sleep 1
done

# ── 2. Create role + database (idempotent) ──────────────────
su postgres -c "psql -tAc \"SELECT 1 FROM pg_roles WHERE rolname='${POSTGRES_USER}'\"" \
  | grep -q 1 \
  || su postgres -c "psql -c \"CREATE USER ${POSTGRES_USER} WITH SUPERUSER PASSWORD '${POSTGRES_PASSWORD}';\""

su postgres -c "psql -tAc \"SELECT 1 FROM pg_database WHERE datname='${POSTGRES_DB}'\"" \
  | grep -q 1 \
  || su postgres -c "psql -c \"CREATE DATABASE ${POSTGRES_DB} OWNER ${POSTGRES_USER};\""

# ── 3. Create tables + seed DJIA data ────────────────────────
cd /app
python -m scripts.seed

# ── 4. Start the application ─────────────────────────────────
exec uvicorn app.main:app --host 0.0.0.0 --port 7860