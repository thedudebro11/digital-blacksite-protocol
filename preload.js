const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  runCommand: (label) => ipcRenderer.send('run-command', label),
  onResponse: (callback) => ipcRenderer.on('command-response', (event, data) => callback(data))
})
