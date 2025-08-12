@echo off
echo ========================================
echo CHS Acquittals System - Starting Server
echo ========================================
echo.

echo Setting up Node.js PATH...
set PATH=%PATH%;C:\Program Files\nodejs

echo.
echo Checking Node.js...
node --version
if %errorlevel% neq 0 (
    echo ERROR: Node.js not found!
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo.
echo Compiling TypeScript...
npx tsc
if %errorlevel% neq 0 (
    echo ERROR: TypeScript compilation failed!
    pause
    exit /b 1
)

echo.
echo ========================================
echo ADMIN CREDENTIALS
echo ========================================
echo Email: admin@chsacquittals.com
echo Password: admin123
echo.
echo First time? Register with these credentials!
echo ========================================
echo.

echo Starting server...
echo Server will be available at: http://localhost:3000
echo.
echo Press Ctrl+C to stop the server
echo.

node dist/index.js 