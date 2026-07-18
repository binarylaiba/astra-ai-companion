@echo off
title Astra AI Companion Launcher
echo 🌌 Booting up Astra AI Companion...

:: Start the Frontend Dev Server in a new window
start "Astra Frontend" cmd /k "npm run dev"

:: Start the Backend Express Server in a new window
start "Astra Backend" cmd /k "npm run server"

echo 🚀 Servers are booting up in separate terminals!
echo 👉 Open http://localhost:5173 in your web browser.
echo.
echo Press any key to close this launcher console...
pause >nul
