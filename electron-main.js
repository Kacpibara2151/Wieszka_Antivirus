import { app, BrowserWindow, Tray, Menu, Notification } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mainWindow;
let tray = null;
let isQuitting = false;

async function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    title: 'Wieszka Antivirus Ultimate',
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  // Handle minimize-to-tray on close
  mainWindow.on('close', (event) => {
    if (!isQuitting) {
      event.preventDefault();
      mainWindow.hide();
      if (Notification.isSupported()) {
        new Notification({
          title: 'Wieszka Antivirus Ultimate',
          body: 'Aplikacja działa w tle w zasobniku systemowym (System Tray). Twoja ochrona jest aktywna.',
        }).show();
      }
      return false;
    }
  });

  // Start embedded server or load local build
  try {
    await import('./dist/server.cjs');
    
    // Poll for active port (or fallback to 3000 after timeout)
    let checks = 0;
    const interval = setInterval(() => {
      checks++;
      const activePort = process.env.SERVER_PORT || '3000';
      if (process.env.SERVER_PORT || checks >= 25) {
        clearInterval(interval);
        mainWindow.loadURL(`http://localhost:${activePort}`);
      }
    }, 100);
  } catch (e) {
    console.log('Loading static fallback...', e);
    mainWindow.loadFile(path.join(__dirname, 'dist/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function createTray() {
  try {
    const contextMenu = Menu.buildFromTemplate([
      { label: 'Otwórz Wieszka Antivirus', click: () => mainWindow.show() },
      { label: 'Szybki Skan Systemu', click: () => {
          mainWindow.show();
          mainWindow.webContents.send('trigger-quick-scan');
        } 
      },
      { type: 'separator' },
      { label: 'Ochrona w czasie rzeczywistym: AKTYWNA', enabled: false },
      { type: 'separator' },
      { label: 'Zamknij Całkowicie', click: () => {
          isQuitting = true;
          app.quit();
        } 
      }
    ]);

    // Simple default tray setup
    tray = new Tray(path.join(__dirname, 'public/vite.svg'));
    tray.setToolTip('Wieszka Antivirus - Ochrona Aktywna');
    tray.setContextMenu(contextMenu);
    tray.on('double-click', () => mainWindow.show());
  } catch (err) {
    console.log('Tray creation skipped or unsupported in environment:', err.message);
  }
}

app.whenReady().then(() => {
  createWindow();
  createTray();
});

app.on('before-quit', () => {
  isQuitting = true;
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin' && isQuitting) {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  } else if (mainWindow) {
    mainWindow.show();
  }
});

