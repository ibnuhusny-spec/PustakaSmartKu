$WshShell = New-Object -ComObject WScript.Shell
$DesktopPath = [System.Environment]::GetFolderPath('Desktop')
$ShortcutPath = Join-Path -Path $DesktopPath -ChildPath 'PustakaSmart RFID.lnk'
$Shortcut = $WshShell.CreateShortcut($ShortcutPath)
$Shortcut.TargetPath = 'C:\Program Files\PustakaSmart RFID\PustakaSmart RFID.exe'
$Shortcut.WorkingDirectory = 'C:\Program Files\PustakaSmart RFID'
$Shortcut.IconLocation = 'C:\Program Files\PustakaSmart RFID\PustakaSmart RFID.exe,0'
$Shortcut.Description = 'PustakaSmart RFID School System'
$Shortcut.Save()
