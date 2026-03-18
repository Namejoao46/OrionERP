const { app, BrowserWindow } = require('electron');
const path = require ('path');

// Ativa o reload automático observando a pasta de build
require('electron-reload')(path.join(__dirname, '../../dist/orion-ui/browser'), {
  electron: path.join(__dirname, '../../node_modules', '.bin', 'electron')
});

app.disableHardwareAcceleration();

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
    }
  });

  if (process.env.NODE_ENV === 'development') {
    // Em desenvolvimento, conecta ao servidor Angular
    win.loadURL('http://localhost:4200');
    win.webContents.openDevTools();
  } else {
    // Em produção, carrega o build do Angular
    win.loadFile(path.join(__dirname, '../../dist/orion-ui/browser/index.html'));
  }

  win.on('closed', function() {
    win = null
  })
}

app.on('ready', createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
