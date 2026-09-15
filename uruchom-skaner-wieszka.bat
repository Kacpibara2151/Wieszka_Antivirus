@echo off
title Wieszka AI Antivirus - System Bridge
echo ========================================================
echo   Wieszka AI - Agent Skanowania Calego Dysku C:\
echo ========================================================
echo Pobieranie i uruchamianie silnika bezpieczenstwa w PowerShell...
powershell -NoProfile -ExecutionPolicy Bypass -Command "iex (New-Object Net.WebClient).DownloadString('%~dp0wieszka-agent.ps1')"
pause
