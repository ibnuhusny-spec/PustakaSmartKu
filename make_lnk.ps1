$desktop = [Environment]::GetFolderPath('Desktop')
$exePath = Join-Path $PSScriptRoot "dist_desktop\PustakaSmartRFID-win32-x64\PustakaSmartRFID.exe"
$workDir = Join-Path $PSScriptRoot "dist_desktop\PustakaSmartRFID-win32-x64"

$wsh = New-Object -ComObject WScript.Shell
$shortcut = $wsh.CreateShortcut("$desktop\PustakaSmart RFID.lnk")
$shortcut.TargetPath = $exePath
$shortcut.WorkingDirectory = $workDir
$shortcut.Save()

Write-Host "SHORTCUT_CREATED_SUCCESSFULLY"
