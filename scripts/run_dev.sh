#!/usr/bin/env bash
echo "==================================================="
echo "Starting PathFinder AI Development Servers..."
echo "==================================================="

# Start backend
(cd backend && python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload) &
BACKEND_PID=$!

# Start frontend
(cd frontend && npm run dev) &
FRONTEND_PID=$!

echo "Backend running on http://localhost:8000"
echo "Frontend running on http://localhost:5173"

trap "kill $BACKEND_PID $FRONTEND_PID" EXIT
wait
