@echo off
cd /d "%~dp0\.."
where node >nul 2>nul || (echo Please install Node.js 24 LTS from https://nodejs.org & pause & exit /b 1)
if not exist node_modules call npm ci
if errorlevel 1 exit /b 1
start "" http://localhost:4173
call npm run dev
