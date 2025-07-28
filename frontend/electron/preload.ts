


const { contextBridge, ipcRenderer } = require('electron');


const api = {
  getAppName: (): Promise<string> => ipcRenderer.invoke('get-app-name'),
  login: (apiKey: string): Promise<any | null> => ipcRenderer.invoke('login', apiKey),
  getProjects: (employeeId: string): Promise<any[]> => ipcRenderer.invoke('get-projects', employeeId),
  startTimer: (employeeId: string, taskId: string): Promise<any | null> => ipcRenderer.invoke('start-timer', employeeId, taskId),
  stopTimer: (employeeId: string): Promise<any | null> => ipcRenderer.invoke('stop-timer', employeeId),

};

try {
  contextBridge.exposeInMainWorld('t3', api);
} catch (error) {
  console.error(error);
}