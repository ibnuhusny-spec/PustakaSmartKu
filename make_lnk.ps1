$desktop = [Environment]::GetFolderPath('Desktop')
$exePath = "C:\Users\AsusV16\.gemini\antigravity-ide\scratch\smart-perpustakaan-rfid\dist_desktop\PustakaSmartRFID-win32-x64\PustakaSmartRFID.exe"
$workDir = "C:\Users\AsusV16\.gemini\antigravity-ide\scratch\smart-perpustakaan-rfid\dist_desktop\PustakaSmartRFID-win32-x64"

$wsh = New-Object -ComObject WScript.Shell
$shortcut = $wsh.CreateShortcut("$desktop\PustakaSmart RFID.lnk")
$shortcut.TargetPath = $exePath
$shortcut.WorkingDirectory = $workDir
$shortcut.Save()
Write-Host "CREATED DESKTOP SHORTCUT AT $desktop\PustakaSmart RFID.lnk"
