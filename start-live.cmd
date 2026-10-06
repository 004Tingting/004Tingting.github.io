@echo off
title Now Playing - Last.fm Pusher
cd /d "%~dp0"

rem Fallback runtime: WorkBuddy's bundled Node (not on the user PATH).
set "FALLBACK=C:\Users\SaiKo\.workbuddy\binaries\node\versions\22.22.2-6\node.exe"
set "NODE_EXE="

rem 1) Prefer a node that is already on PATH.
where node >nul 2>nul
if not errorlevel 1 set "NODE_EXE=node"

rem 2) Otherwise use the bundled runtime, if it exists.
if not defined NODE_EXE if exist "%FALLBACK%" set "NODE_EXE=%FALLBACK%"

rem 3) Still nothing -> bail out with a clear message.
if not defined NODE_EXE goto :no_node

rem 4) Config file check.
if not exist ".env.local" goto :no_env

echo.
echo   Now Playing - live pusher
echo   -------------------------
echo   Checks playback every 30 seconds; pushes on track change.
echo   Keep this window open. Press Ctrl+C to stop.
echo.
echo   Using runtime: %NODE_EXE%
echo.

"%NODE_EXE%" scripts\push-now.mjs

echo.
echo   Stopped.
pause
exit /b 0

:no_node
echo.
echo [ERROR] Node.js not found.
echo   Tried: "node" in PATH, and
echo          %FALLBACK%
echo.
echo   Install Node.js, or edit the FALLBACK line in this script.
echo.
pause
exit /b 1

:no_env
echo.
echo [ERROR] .env.local is missing in this folder.
echo   It must contain LASTFM_API_KEY / LASTFM_USER / GITHUB_TOKEN.
echo.
pause
exit /b 1
