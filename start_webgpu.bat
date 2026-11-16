@echo off
title Badminton HUD - WebGPU Launcher
echo ========================================================
echo   KHOI DONG BADMINTON HUD VIET NAM (WEBGPU PROFILE)
echo ========================================================

:: 1. Khoi dong Python Server o che do nen neu chua chay
netstat -ano | findstr :8080 | findstr LISTENING >nul
if %errorlevel% neq 0 (
    echo [1/2] Dang bat HTTP Server tai http://127.0.0.1:8080 ...
    start /b python -m http.server 8080 --bind 127.0.0.1 --directory "C:\Users\Admin\.gemini\antigravity\scratch\badminton-hud-vi" >nul 2>&1
    timeout /t 2 /nobreak >nul
) else (
    echo [1/2] Server da san sang tai port 8080.
)

:: 2. Tim Google Chrome
set CHROME="C:\Program Files\Google\Chrome\Application\chrome.exe"
if not exist %CHROME% set CHROME="C:\Program Files (x86)\Google\Chrome\Application\chrome.exe"
if not exist %CHROME% set CHROME="%LOCALAPPDATA%\Google\Chrome\Application\chrome.exe"

set DATA_DIR="C:\Users\Admin\.gemini\antigravity\scratch\badminton-hud-vi\browser_profile"
set FLAGS=--user-data-dir=%DATA_DIR% --enable-unsafe-webgpu --enable-features=Vulkan,DefaultANGLEVulkan,WebGPU --use-angle=vulkan --ignore-gpu-blocklist --disable-gpu-driver-bug-workarounds

echo [2/2] Dang khoi chay Chrome voi card roi NVIDIA GTX 1660 SUPER...
start "" %CHROME% %FLAGS% "http://127.0.0.1:8080/#/app"

timeout /t 2 >nul
exit
