const { execSync } = require('child_process');
const path = require('path');

const exePath = path.join(__dirname, 'dist_desktop', 'PustakaSmartRFID-win32-x64', 'PustakaSmartRFID.exe');
const workDir = path.join(__dirname, 'dist_desktop', 'PustakaSmartRFID-win32-x64');

const psCmd = `powershell -ExecutionPolicy Bypass -File "${path.join(workDir, 'make_lnk.ps1')}"`;

try {
  const result = execSync(psCmd, { encoding: 'utf8' });
  console.log('✓ SUCCESS:', result.trim());
} catch (err) {
  console.error('❌ Failed to create shortcut:', err.message);
}
