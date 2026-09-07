@echo off
echo ===================================================
echo Running Full PathFinder AI Verification Tests
echo ===================================================

echo [1/2] Running Backend Pytest Suite...
set PYTHONPATH=%~dp0..\backend
python -m pytest "%~dp0..\backend\tests" -v
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Backend tests failed!
    exit /b %ERRORLEVEL%
)

echo [2/2] Running Frontend TypeScript Build...
cd /d "%~dp0..\frontend"
call npm run build
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Frontend build failed!
    exit /b %ERRORLEVEL%
)

echo ===================================================
echo ALL VERIFICATION TESTS PASSED SUCCESSFULLY!
echo ===================================================
