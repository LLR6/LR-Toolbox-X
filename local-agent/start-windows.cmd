@echo off
setlocal
cd /d "%~dp0"
where winget >nul 2>&1
if errorlevel 1 (
 echo Windows App Installer is required. Install it from Microsoft Store, then retry.
 pause
 exit /b 1
)
where ollama >nul 2>&1
if errorlevel 1 (
 echo [1/3] Installing Ollama...
 winget install --id Ollama.Ollama --exact --source winget
 if errorlevel 1 goto failed
)
set "PATH=%LOCALAPPDATA%\Programs\Ollama;%LOCALAPPDATA%\Programs\Python\Python312;%LOCALAPPDATA%\Programs\Python\Python312\Scripts;%PATH%"
python -c "import sys; assert sys.version_info >= (3,10)" >nul 2>&1
if errorlevel 1 (
 echo [2/3] Installing Python...
 winget install --id Python.Python.3.12 --exact --source winget
 if errorlevel 1 goto failed
)
echo [3/3] Starting LR Agent and preparing local model...
python start.py
if errorlevel 1 goto failed
exit /b 0
:failed
echo Setup did not complete. Review the message above and run this launcher again.
pause
exit /b 1
