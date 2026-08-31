// Electron Main Process Launcher with SQLite Express Server for PustakaSmart RFID

const { app, BrowserWindow, Menu, ipcMain } = require('electron');
const path = require('path');
const { fork } = require('child_process');

let serverProcess = null;
let mainWindow = null;

function forceActivateWindow() {
  if (mainWindow) {
    try {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.show();
      mainWindow.setAlwaysOnTop(true);
      mainWindow.focus();
      mainWindow.setAlwaysOnTop(false);
      if (mainWindow.webContents) {
        mainWindow.webContents.focus();
      }
    } catch (e) {}
  }
}

// Start Embedded Express + SQLite Server in background thread
function startBackendServer() {
  try {
    const serverPath = path.join(__dirname, 'server.cjs');
    serverProcess = fork(serverPath, [], {
      env: { ...process.env, PORT: 3001 }
    });
    console.log('⚡ SQLite Backend Server started on port 3001 via Electron fork.');
  } catch (err) {
    console.error('❌ Failed to launch backend SQLite server:', err);
  }
}

function createWindow() {
  const iconPath = path.join(__dirname, 'public/icon.ico');
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 1024,
    minHeight: 700,
    title: "PustakaSmart RFID - Sistem Perpustakaan Sekolah Digital",
    icon: iconPath,
    show: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  mainWindow.once('ready-to-show', () => {
    forceActivateWindow();
  });

  mainWindow.on('focus', () => {
    if (mainWindow.webContents) {
      mainWindow.webContents.focus();
    }
  });

  // Remove default menu bar for clean full-screen desktop experience
  Menu.setApplicationMenu(null);

  const isDev = process.env.NODE_ENV === 'development';
  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
  } else {
    mainWindow.loadFile(path.join(__dirname, 'dist/index.html'));
  }
}

ipcMain.on('app-force-focus', () => {
  forceActivateWindow();
});

app.whenReady().then(() => {
  startBackendServer();
  createWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function () {
  if (serverProcess) {
    serverProcess.kill();
  }
  if (process.platform !== 'darwin') app.quit();
});
