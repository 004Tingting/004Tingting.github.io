@echo off
title Now Playing - Last.fm Pusher
cd /d "%~dp0"

rem Prefer node from PATH; fall back to the WorkBuddy-bundled runtime.
where node >nul 2>nul
if %errorlevel%==0 (
  set "NODE=node"
) else (
  set "NODE=C:\Users\SaiKo\.workbuddy\binaries\node\versions\22.22.2-6\node.exe"
  if not exist "%NODE%" (
    echo.
    echo [ERROR] Node.js not found.
    echo   Tried: "node" in PATH, and %NODE%
    echo   Install Node.js, or edit the path in this script.
    echo.
    pause
    exit /b 1
  )
)

if not exist ".env.local" (
  echo.
  echo [ERROR] .env.local is missing.
  echo   It must contain LASTFM_API_KEY / LASTFM_USER / GITHUB_TOKEN.
  echo.
  pause
  exit /b 1
)

echo.
echo   Now Playing - live pusher started
echo   ---------------------------------
echo   Checks playback every 30 seconds, pushes on track change.
echo   Keep this window open. Press Ctrl+C to stop.
echo.

"%NODE%" scripts\push-now.mjs

echo.
echo   Stopped.
pause
