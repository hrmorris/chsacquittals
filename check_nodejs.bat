@echo off
echo ========================================
echo Node.js Installation Check
echo ========================================
echo.

echo Checking for Node.js installation...

REM Check common Node.js installation paths
if exist "C:\Program Files\nodejs\node.exe" (
    echo Node.js found in: C:\Program Files\nodejs
    set NODE_PATH=C:\Program Files\nodejs
    goto :found
)

if exist "C:\Program Files (x86)\nodejs\node.exe" (
    echo Node.js found in: C:\Program Files (x86)\nodejs
    set NODE_PATH=C:\Program Files (x86)\nodejs
    goto :found
)

if exist "%APPDATA%\npm\node.exe" (
    echo Node.js found in: %APPDATA%\npm
    set NODE_PATH=%APPDATA%\npm
    goto :found
)

echo.
echo ========================================
echo Node.js NOT FOUND!
echo ========================================
echo.
echo Please install Node.js:
echo 1. Go to https://nodejs.org/
echo 2. Download the LTS version
echo 3. Install with default settings
echo 4. Restart your computer
echo 5. Run this script again
echo.
pause
exit /b 1

:found
echo.
echo Node.js is installed!
echo.
echo Setting PATH and testing...
set PATH=%PATH%;%NODE_PATH%

node --version
if %errorlevel% neq 0 (
    echo ERROR: Node.js found but not working properly
    echo Please reinstall Node.js
    pause
    exit /b 1
)

echo.
echo ========================================
echo Node.js is working! Starting server...
echo ========================================
echo.

REM Compile TypeScript
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