/**
 * Memory Card Game - Electron Preload Script
 * Secure bridge between main and renderer processes
 */

const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // App control
  closeApp: () => ipcRenderer.invoke('close-app'),
  
  // File operations
  saveGameData: (data) => ipcRenderer.invoke('save-game-data', data),
  loadGameData: () => ipcRenderer.invoke('load-game-data'),
  
  // Window state
  getWindowState: () => ipcRenderer.invoke('get-window-state'),
  
  // Menu events
  onMenuNewGame: (callback) => ipcRenderer.on('menu-new-game', callback),
  onMenuMainMenu: (callback) => ipcRenderer.on('menu-main-menu', callback),
  
  // Remove listeners
  removeAllListeners: (channel) => ipcRenderer.removeAllListeners(channel),
  
  // Platform detection
  platform: process.platform,
  isElectron: true
});

// Expose version information
contextBridge.exposeInMainWorld('versions', {
  node: process.versions.node,
  chrome: process.versions.chrome,
  electron: process.versions.electron
});

// Console logging for development
if (process.env.NODE_ENV === 'development') {
  console.log('Electron preload script loaded');
  console.log('Versions:', {
    node: process.versions.node,
    chrome: process.versions.chrome,
    electron: process.versions.electron
  });
}