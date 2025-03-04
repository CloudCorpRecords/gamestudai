@echo off
echo ===============================================
echo            GameStuAI Engine Starter
echo       AI-Assisted 3D Game Development
echo ===============================================
echo.

:: Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo X Node.js is not installed. Please install Node.js v18 or newer.
    echo Visit: https://nodejs.org/
    pause
    exit /b 1
)

:: Get Node.js version
for /f "tokens=1,2,3 delims=." %%a in ('node -v') do (
    set NODE_MAJOR=%%a
)
set NODE_MAJOR=%NODE_MAJOR:~1%

if %NODE_MAJOR% LSS 18 (
    echo X Node.js version is too old. Please upgrade to v18 or newer.
    echo Current version: %NODE_MAJOR%
    pause
    exit /b 1
)

echo ✓ Node.js detected

:: Install dependencies
echo.
echo Installing dependencies (this may take a minute)...
call npm install --legacy-peer-deps

if %ERRORLEVEL% neq 0 (
    echo.
    echo Dependency installation failed. Trying one more time with force...
    call npm install --force
    
    if %ERRORLEVEL% neq 0 (
        echo.
        echo Could not install dependencies. Please check your internet connection and try again.
        pause
        exit /b 1
    )
)

echo.
echo ✓ Dependencies installed successfully!
echo.
echo Starting development server...
echo.
echo The application will open in your browser shortly...
echo Press Ctrl+C to stop the server when you're done.
echo.

:: Start the development server
call npm run dev

:: This line will only execute if the server is stopped
echo.
echo Thanks for using GameStuAI Engine!
pause 