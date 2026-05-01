@echo off
REM ============================================================
REM start.bat — Avvia Docker Desktop, backend e frontend
REM Portabile: trova Docker Desktop automaticamente.
REM Esegui dalla root del progetto: .\start.bat
REM ============================================================
echo.
echo  MC Option Pricer — Starting...
echo  ================================
echo.

REM ── Step 0: Crea/sovrascrive .env da .env.example ───────────
echo  Configuring environment...
copy /Y ".env.example" ".env" > nul
echo  .env configured from .env.example.
echo.

REM ── Step 1: Verifica Docker ───────────────────────────────────
echo  [1/4] Checking Docker...
docker info > nul 2>&1
if %errorlevel% neq 0 (
    echo.
    echo  ERROR: Docker is not running.
    echo  Please start Docker Desktop manually and run this script again.
    echo.
    pause
    exit /b 1
)
echo  Docker is running.

REM ── Step 2: Backend + DB via Docker Compose (background) ─────
:start_backend
echo.
echo  [2/4] Starting backend and database...
docker compose up --build -d
echo  Waiting for database to be ready...
timeout /t 30 /nobreak > nul

REM ── Step 3: Seed del database (idempotente) ──────────────────
echo.
echo  [3/4] Seeding database (skipped if already populated)...
docker compose exec backend python scripts/seed.py
if %errorlevel% neq 0 (
    echo.
    echo  WARNING: Seed may have failed. The app will still start
    echo  but stock data might be unavailable.
    echo.
)

REM ── Step 4: Frontend via Vite ────────────────────────────────
echo.
echo  [4/4] Starting frontend (Vite)...
start "MCPricer Backend Logs" cmd /k "docker compose logs -f backend"
start "MCPricer Frontend" cmd /k "cd frontend && npm run dev"
echo.
echo  Services starting in separate windows:
echo    Backend:  http://localhost:8000
echo    Frontend: http://localhost:5173
echo.
timeout /t 8 /nobreak > nul
start http://localhost:5173
echo  Done. Press any key to exit this window.
pause > nul