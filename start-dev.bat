@echo off
echo 🚀 Starting PDF Invoice Dashboard...
echo.

echo 📡 Starting backend API server...
start "Backend API" /D backend cmd /k "npm run dev"

timeout /t 3

echo 🌐 Starting frontend development server...
start "Frontend" /D frontend cmd /k "npm run dev"

echo.
echo ✅ Both servers are starting...
echo 📡 Backend API: http://localhost:3001
echo 🌐 Frontend: http://localhost:3000
echo.
echo Press any key to continue...
pause
