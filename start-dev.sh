#!/bin/bash

# Start both frontend and backend applications

echo "🚀 Starting PDF Invoice Dashboard..."
echo ""

# Start backend
echo "📡 Starting backend API server..."
cd backend
npm run dev &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 3

# Start frontend
echo "🌐 Starting frontend development server..."
cd ../frontend
npm run dev &
FRONTEND_PID=$!

echo ""
echo "✅ Both servers are starting..."
echo "📡 Backend API: http://localhost:3001"
echo "🌐 Frontend: http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop both servers"

# Wait for Ctrl+C
trap "echo ''; echo '🛑 Stopping servers...'; kill $BACKEND_PID $FRONTEND_PID; exit" INT
wait
