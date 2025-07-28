

import { app, BrowserWindow, desktopCapturer, ipcMain } from 'electron'
import path from 'node:path'
import { fileURLToPath } from 'node:url'


const __dirname = path.dirname(fileURLToPath(import.meta.url));

const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']


const PRELOAD_PATH = path.join(__dirname, 'preload.js')


ipcMain.handle('get-app-name', () => {
  return app.getName();
});

ipcMain.handle('login', async (_event, apiKey: string) => {
  try {

    const response = await fetch(`http://localhost:3000/api/employees/auth/${apiKey}`);

    if (!response.ok) {

      return null;
    }

    const employee = await response.json();
    return employee;
  } catch (error) {
    console.error('Failed to login:', error);
    return null;
  }
});
ipcMain.handle('get-projects', async (_event, employeeId: string) => {
  try {
    const response = await fetch(`http://localhost:3000/api/employees/${employeeId}/projects`);
    if (!response.ok) return [];

    return response.json();
  } catch (error) {
    console.error('Failed to get projects:', error);
    return [];
  }
});

ipcMain.handle('start-timer', async (_event, employeeId: string, taskId: string) => {
  try {
    const response = await fetch('http://localhost:3000/api/timetracking/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ employeeId, taskId }),
    });
    if (!response.ok) return null;
    return response.json();
  } catch (error) {
    console.error('Failed to start timer:', error);
    return null;
  }
});

ipcMain.handle('stop-timer', async (_event, employeeId: string) => {
  try {
    const response = await fetch('http://localhost:3000/api/timetracking/stop', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ employeeId }),
    });
    if (!response.ok) return null;
    return response.json();
  } catch (error) {
    console.error('Failed to stop timer:', error);
    return null;
  }
});

ipcMain.handle('take-screenshot', async (_event, timeEntryId: string) => {
  let permissionFlag = true;
  let imageBase64 = '';

  try {

    const sources = await desktopCapturer.getSources({ types: ['screen'] });

    const primarySource = sources.find(source => source.display_id) || sources[0];

    imageBase64 = primarySource.thumbnail.toDataURL();

  } catch (error) {
    console.error('Could not capture screen:', error);
    permissionFlag = false;
  }

  try {
    await fetch('http://localhost:3000/api/screenshots', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        timeEntryId,
        imageBase64,
        permissionFlag,
      }),
    });
  } catch (error) {
    console.error('Failed to upload screenshot:', error);
  }
})


function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: PRELOAD_PATH,
      contextIsolation: true,
      nodeIntegration: false,
    },
  })

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL)
    win.webContents.openDevTools()
  } else {

    win.loadFile(path.join(__dirname, '../renderer/index.html'))
  }
}


app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})