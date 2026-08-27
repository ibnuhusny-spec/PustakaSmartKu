@echo off
title Membuat Shortcut Desktop PustakaSmart RFID...
color 0A

echo =========================================================
echo    MEMBUAT SHORTCUT PUSTAKASMART RFID DI DESKTOP WINDOWS
echo =========================================================
echo.

set EXE_PATH=%~dp0PustakaSmartRFID.exe

powershell -Command "$desktop = [Environment]::GetFolderPath('Desktop'); $WshShell = New-Object -comObject WScript.Shell; $Shortcut = $WshShell.CreateShortcut(\"$desktop\PustakaSmart RFID.lnk\"); $Shortcut.TargetPath = '%EXE_PATH%'; $Shortcut.WorkingDirectory = '%~dp0'; $Shortcut.Save();"

echo ---------------------------------------------------------
echo [BERHASIL] Shortcut "PustakaSmart RFID" dengan Ikon Resmi 
echo telah berhasil dibuat di Layar Desktop Windows Anda!
echo ---------------------------------------------------------
echo.
pause
