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

REM ── Step 1: Controlla se Docker è già attivo ─────────────────
echo  [1/3] Checking Docker...

docker info > nul 2>&1
if %errorlevel% equ 0 (
    echo  Docker already running.
    goto start_backend
)

REM ── Docker non attivo: trovalo e avvialo ─────────────────────
echo  Docker not running. Looking for Docker Desktop...

REM Prova i path più comuni
set DOCKER_PATH=

if exist "%ProgramFiles%\Docker\Docker\Docker Desktop.exe" (
    set DOCKER_PATH=%ProgramFiles%\Docker\Docker\Docker Desktop.exe
    goto found_docker
)

if exist "%ProgramFiles(x86)%\Docker\Docker\Docker Desktop.exe" (
    set DOCKER_PATH=%ProgramFiles(x86)%\Docker\Docker\Docker Desktop.exe
    goto found_docker
)

if exist "%LocalAppData%\Docker\Docker Desktop.exe" (
    set DOCKER_PATH=%LocalAppData%\Docker\Docker Desktop.exe
    goto found_docker
)

REM Prova dal registro di sistema
for /f "tokens=2*" %%a in ('reg query "HKLM\SOFTWARE\Docker Inc.\Docker Desktop" /v AppPath 2^>nul') do (
    set DOCKER_PATH=%%b\Docker Desktop.exe
    goto found_docker
)

REM Docker Desktop non trovato
echo.
echo  ERROR: Docker Desktop not found.
echo  Please install Docker Desktop from https://www.docker.com
echo  or start it manually before running this script.
echo.
pause
exit /b 1

:found_docker
echo  Found Docker Desktop at: %DOCKER_PATH%
start "" "%DOCKER_PATH%"

echo  Waiting for Docker to be ready...
:waitloop
timeout /t 5 /nobreak > nul
docker info > nul 2>&1
if %errorlevel% neq 0 (
    echo  Still waiting...
    goto waitloop
)
echo  Docker Desktop is ready.

REM ── Step 2: Backend via Docker Compose ───────────────────────
:start_backend
echo.
echo  [2/3] Starting backend (Docker Compose)...
start "MCPricer Backend" cmd /k "docker compose up"

timeout /t 15 /nobreak > nul

REM ── Step 3: Frontend via Vite ────────────────────────────────
echo  [3/3] Starting frontend (Vite)...
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