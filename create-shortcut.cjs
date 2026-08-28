const { execSync } = require('child_process');
const path = require('path');

const exePath = path.join(__dirname, 'dist_desktop', 'PustakaSmartRFID-win32-x64', 'PustakaSmartRFID.exe');
const workDir = path.join(__dirname, 'dist_desktop', 'PustakaSmartRFID-win32-x64');

const psScript = `$desktop = [Environment]::GetFolderPath('Desktop'); $wsh = New-Object -ComObject WScript.Shell; $shortcut = $wsh.CreateShortcut(\`"$desktop\\PustakaSmart RFID.lnk\`"); $shortcut.TargetPath = \`"${exePath}\`"; $shortcut.WorkingDirectory = \`"${workDir}\`"; $shortcut.Save(); Write-Host 'SHORTCUT_SUCCESS';`;

try {
  const result = execSync(`powershell -Command "${psScript}"`, { encoding: 'utf8' });
  console.log('✓ SUCCESS:', result.trim());
} catch (err) {
  console.error('❌ Failed to create shortcut:', err.message);
}
