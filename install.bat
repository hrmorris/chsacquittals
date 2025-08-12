@echo off
echo ========================================
echo CHS Acquittals System - Installation
echo ========================================
echo.

echo Checking Node.js installation...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed!
    echo Please install Node.js from https://nodejs.org/
    echo Download the LTS version and run the installer.
    echo After installation, restart this script.
    pause
    exit /b 1
)

echo Node.js is installed.
echo.

echo Installing dependencies...
npm install
if %errorlevel% neq 0 (
    echo ERROR: Failed to install dependencies!
    pause
    exit /b 1
)

echo.
echo Creating uploads directory...
if not exist "uploads" mkdir uploads

echo.
echo ========================================
echo Installation completed successfully!
echo ========================================
echo.
echo Next steps:
echo 1. Set up your Supabase project
echo 2. Copy .env.example to .env and fill in your credentials
echo 3. Run the SQL script from setup.sql in your Supabase SQL editor
echo 4. Run: npm run dev
echo.
echo For detailed instructions, see SETUP.md
echo.
pause 