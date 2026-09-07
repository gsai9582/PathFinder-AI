@echo off
echo ===================================================
echo Starting PathFinder AI Development Servers...
echo ===================================================

start "PathFinder Backend" cmd /k "cd /d ""%~dp0..\backend"" && python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload"
start "PathFinder Frontend" cmd /k "cd /d ""%~dp0..\frontend"" && npm run dev"

echo Backend running on http://localhost:8000 (Docs: http://localhost:8000/docs)
echo Frontend running on http://localhost:5173
