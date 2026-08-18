@echo off
:: Start the DRCT dev server and open the browser (Windows)

set PORT=8080
set URL=http://localhost:%PORT%/

echo Starting DRCT server at %URL%

:: Kill anything on the port (ignore errors)
for /f "tokens=5" %%a in ('netstat -aon ^| find ":%PORT%"') do taskkill /f /pid %%a 2>nul

start /b node server.js
timeout /t 1 /nobreak >nul

start "" "%URL%"

echo Server started. Close this window to stop the server.
pause
