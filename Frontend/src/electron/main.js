const { app, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');

if (process.env.NODE_ENV === 'development') {
  const electronPath = path.join(__dirname, '..', '..', 'node_modules', '.bin', 'electron.cmd');
  
  if (fs.existsSync(electronPath)) {
    // MUDANÇA AQUI: Passamos a vigiar APENAS o arquivo main.js do Electron.
    // Assim, se você mudar o HTML/CSS/TS do Angular, o Electron NÃO reinicia.
    require('electron-reload')(path.join(__dirname, 'main.js'), {
      electron: electronPath,
      hardResetMethod: 'exit'
    });
  }
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    icon: path.join(__dirname, '..', '..', 'src', 'assets', 'orion.png'), 
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      webSecurity: false, 
      allowRunningInsecureContent: true 
    }
  });

  win.webContents.session.clearCache().then(() => {
    console.log('Cache limpo');
  });

  if (process.env.NODE_ENV === 'development') {
    win.loadURL('http://localhost:4200');
    win.webContents.openDevTools();

    // Isso aqui é importante: se o Angular recompilar, o Electron apenas
    // espera o sinal do WebSocket do Angular para atualizar a página internamente.
    win.webContents.on('did-fail-load', () => {
      setTimeout(() => {
        if (!win.isDestroyed()) win.loadURL('http://localhost:4200');
      }, 1000);
    });
  } else {
    win.loadFile(path.join(__dirname, '../../dist/orion-ui/browser/index.html'));
  }
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});