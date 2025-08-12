@echo off
echo ========================================
echo CHS Acquittals System - Complete Setup
echo ========================================
echo.

echo Step 1: Checking Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js not found!
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)
echo ✓ Node.js is installed

echo.
echo Step 2: Checking XAMPP/MySQL...
echo Please make sure XAMPP is running and MySQL is started
echo You can start XAMPP Control Panel and click "Start" next to MySQL
echo.

echo Step 3: Installing dependencies...
npm install
if %errorlevel% neq 0 (
    echo ERROR: Failed to install dependencies
    pause
    exit /b 1
)
echo ✓ Dependencies installed

echo.
echo Step 4: Compiling TypeScript...
npx tsc
if %errorlevel% neq 0 (
    echo ERROR: TypeScript compilation failed
    pause
    exit /b 1
)
echo ✓ TypeScript compiled

echo.
echo Step 5: Creating uploads directory...
if not exist "uploads" mkdir uploads
echo ✓ Uploads directory ready

echo.
echo Step 6: Database Setup Instructions
echo ========================================
echo IMPORTANT: You need to set up the database first!
echo.
echo Option A: Using phpMyAdmin (Recommended)
echo 1. Open XAMPP Control Panel
echo 2. Click "Admin" next to MySQL
echo 3. In phpMyAdmin, click "SQL" tab
echo 4. Copy and paste the contents of setup_database.sql
echo 5. Click "Go" to execute
echo.
echo Option B: Using MySQL Command Line
echo 1. Open Command Prompt as Administrator
echo 2. Navigate to XAMPP MySQL bin directory:
echo    cd "C:\xampp\mysql\bin"
echo 3. Run: mysql -u root -p < "C:\Users\PC\Documents\CHS ACQUITTALS\chsacquittals\setup_database.sql"
echo.
echo Press any key after you've set up the database...
pause

echo.
echo Step 7: Testing database connection...
node -e "require('dotenv').config(); const mysql = require('mysql2/promise'); const pool = mysql.createPool({host: process.env.DB_HOST, user: process.env.DB_USER, password: process.env.DB_PASSWORD, database: process.env.DB_NAME, port: parseInt(process.env.DB_PORT)}); pool.getConnection().then(conn => {console.log('✓ Database connection successful'); conn.release(); process.exit(0);}).catch(err => {console.log('✗ Database connection failed:', err.message); process.exit(1);});"
if %errorlevel% neq 0 (
    echo ERROR: Database connection failed!
    echo Please check:
    echo 1. XAMPP is running
    echo 2. MySQL is started
    echo 3. Database 'chs_acquittals' exists
    echo 4. Tables are created
    pause
    exit /b 1
)
echo ✓ Database connection successful

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

echo Step 8: Starting server...
echo Server will be available at: http://localhost:3000
echo.
echo Press Ctrl+C to stop the server
echo.

node dist/index.js 