@echo off
title Loft and Craft Web Server Launcher
echo.
echo ==================================================
echo   Loft and Craft Local Web Server (Port 3003)
echo ==================================================
echo.
echo Starting server...
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0server.ps1"
pause
