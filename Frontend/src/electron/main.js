const { app, BrowserWindow } = require('electron');
const path = require ('path');

// Ativa o reload automático observando a pasta de build
require('electron-reload')(path.join(__dirname, '../../dist/orion-ui/browser'), {
  electron: path.join(__dirname, '../../node_modules', '.bin', 'electron')
});

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false // Facilita a comunicação inicial, mas requer atenção em produção
    }
  });

  // Aponta para o arquivo gerado pelo build do Angular
  win.loadFile(path.join(__dirname, '../../dist/orion-ui/browser/index.html'));

  // Abre o console do desenvolvedor automaticamente
  win.webContents.openDevTools();
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
