// preload.js
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  // ... các API khác
  login: () => ipcRenderer.invoke('login'),
  scan:  (payload) => ipcRenderer.invoke('scan', payload),
  resolve: (url) => ipcRenderer.invoke('resolve', url),
  download: (payload) => ipcRenderer.invoke('download', payload),
  pickFileFor: (id) => ipcRenderer.invoke('pick-file', id),
  upload: (payload) => ipcRenderer.invoke('upload', payload),

  onScanProgress: (cb) => {
    const fn = (_e, d) => cb(d);
    ipcRenderer.on('scan:progress', fn);
    return () => ipcRenderer.off('scan:progress', fn);
  }
});