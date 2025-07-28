


const { contextBridge, ipcRenderer } = require('electron');


const api = {
  getAppName: (): Promise<string> => ipcRenderer.invoke('get-app-name'),
  login: (apiKey: string): Promise<any | null> => ipcRenderer.invoke('login', apiKey),
  getProjects: (employeeId: string): Promise<any[]> => ipcRenderer.invoke('get-projects', employeeId),
  startTimer: (employeeId: string, taskId: string): Promise<any | null> => ipcRenderer.invoke('start-timer', employeeId, taskId),
  stopTimer: (employeeId: string): Promise<any | null> => ipcRenderer.invoke('stop-timer', employeeId),

  getScreenId: (): Promise<string | null> => ipcRenderer.invoke('get-screen-id'),

  captureScreen: async (sourceId: string): Promise<string> => {
    // This uses the browser's built-in media capture APIs
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: false,
      video: {
        mandatory: {
          chromeMediaSource: 'desktop',
          chromeMediaSourceId: sourceId,
        },
      },
    });

    const video = document.createElement('video');

    return new Promise((resolve) => {
      video.onloadedmetadata = () => {
        video.play();


        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;


        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);


        const dataUrl = canvas.toDataURL('image/png');


        stream.getTracks().forEach(track => track.stop());

        resolve(dataUrl);
      };

      video.srcObject = stream;
    });
  },
};




try {
  contextBridge.exposeInMainWorld('t3', api);
} catch (error) {
  console.error(error);
}