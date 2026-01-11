@echo off
REM =================================
REM Within App - Windows Deployment
REM =================================

echo ==========================================
echo   Within App - Docker Deployment
echo ==========================================

REM Check if .env exists
if not exist .env (
    echo Error: .env file not found!
    echo Please copy .env.example to .env and configure it.
    echo   copy .env.example .env
    exit /b 1
)

echo.
echo Building and starting containers...
echo.

REM Stop existing containers
docker-compose down --remove-orphans 2>nul

REM Build and run
docker-compose build --no-cache
docker-compose up -d

echo.
echo ==========================================
echo   Deployment Complete!
echo ==========================================
echo.
echo Services:
echo   Frontend: http://localhost
echo   Backend:  http://localhost/api/health
echo.
echo Commands:
echo   View logs:    docker-compose logs -f
echo   Stop:         docker-compose down
echo   Restart:      docker-compose restart
echo.

REM Wait for health check
echo Waiting for services to start...
timeout /t 10 /nobreak >nul

echo.
echo Check status at: http://localhost/api/health
pause
