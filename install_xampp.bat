@echo off
echo ========================================
echo CHS Acquittals System - XAMPP Setup
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

echo Checking XAMPP installation...
if not exist "C:\xampp" (
    echo WARNING: XAMPP not found in C:\xampp
    echo Please install XAMPP from https://www.apachefriends.org/
    echo After installation, restart this script.
    echo.
    echo Press any key to continue anyway...
    pause
) else (
    echo XAMPP found in C:\xampp
)

echo.
echo Installing Node.js dependencies...
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
echo Creating .env file...
if not exist ".env" (
    copy .env.example .env
    echo .env file created. Please edit it with your database settings.
) else (
    echo .env file already exists.
)

echo.
echo ========================================
echo Installation completed successfully!
echo ========================================
echo.
echo Next steps:
echo 1. Start XAMPP Control Panel
echo 2. Start Apache and MySQL services
echo 3. Open http://localhost/phpmyadmin
echo 4. Create database 'chs_acquittals'
echo 5. Import setup.sql file
echo 6. Edit .env file with database settings
echo 7. Run: npm run dev
echo.
echo For detailed instructions, see XAMPP_SETUP.md
echo.
pause 