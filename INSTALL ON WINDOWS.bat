@echo off
echo ==============================
echo   Installing V.E.D.A.
echo ==============================

set INSTALL_DIR=%USERPROFILE%\VEDA
mkdir "%INSTALL_DIR%" 2>/dev/null
xcopy /E /Y /I "%~dp0web" "%INSTALL_DIR%\web"
copy /Y "%~dp0OPEN ON WINDOWS.exe" "%INSTALL_DIR%\veda.exe"

powershell -Command "$s=(New-Object -COM WScript.Shell).CreateShortcut('%USERPROFILE%\Desktop\VEDA.lnk');$s.TargetPath='%INSTALL_DIR%\veda.exe';$s.WorkingDirectory='%INSTALL_DIR%';$s.Description='Vedic Education & Data Archive';$s.Save()"

echo.
echo   Installed to %INSTALL_DIR%
echo   Shortcut on Desktop
echo   You can remove the USB now.
echo ==============================
pause
