@echo off
echo ========================================
echo CHS Acquittals System - Implementation
echo ========================================
echo.

echo Checking Node.js installation...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo.
    echo ERROR: Node.js is not installed!
    echo.
    echo Please follow these steps:
    echo 1. Go to https://nodejs.org/
    echo 2. Download the LTS version
    echo 3. Run the installer with default settings
    echo 4. Restart your computer
    echo 5. Run this script again
    echo.
    pause
    exit /b 1
)

echo Node.js is installed: 
node --version
echo.

echo Checking npm...
npm --version
echo.

echo Installing project dependencies...
npm install
if %errorlevel% neq 0 (
    echo ERROR: Failed to install dependencies!
    pause
    exit /b 1
)

echo.
echo Dependencies installed successfully!
echo.

echo Checking XAMPP...
if not exist "C:\xampp" (
    echo WARNING: XAMPP not found in C:\xampp
    echo Please install XAMPP from https://www.apachefriends.org/
    echo After installation, start Apache and MySQL services
    echo.
    echo Press any key to continue anyway...
    pause
) else (
    echo XAMPP found in C:\xampp
    echo Please make sure Apache and MySQL are running in XAMPP Control Panel
)

echo.
echo Checking database setup...
echo Please ensure you have:
echo 1. Started XAMPP (Apache and MySQL)
echo 2. Created database 'chs_acquittals' in phpMyAdmin
echo 3. Imported setup.sql file
echo.

echo Environment file (.env) is configured for XAMPP
echo.

echo ========================================
echo Implementation completed!
echo ========================================
echo.
echo Next steps:
echo 1. Start XAMPP Control Panel
echo 2. Start Apache and MySQL services
echo 3. Open http://localhost/phpmyadmin
echo 4. Create database 'chs_acquittals'
echo 5. Import setup.sql file
echo 6. Run: npm run dev
echo 7. Open http://localhost:3000
echo.
echo Press any key to start the application...
pause

echo.
echo Starting the application...
npm run dev 