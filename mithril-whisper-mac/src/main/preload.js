// ═══════════════════════════════════════════════════════════════════════
// 🔒 SECURE PRELOAD SCRIPT FOR MITHRIL WHISPER
// 
// This script runs in the renderer process context but has access to Node.js APIs.
// It provides a secure bridge between the main and renderer processes by exposing
// only the necessary APIs through contextBridge.
// ═══════════════════════════════════════════════════════════════════════

const { contextBridge, ipcRenderer } = require('electron');

// Expose secure APIs to the renderer process
contextBridge.exposeInMainWorld('electronAPI', {
  // Settings management
  getSettings: () => ipcRenderer.invoke('get-settings'),
  saveSettings: (settings) => ipcRenderer.invoke('save-settings', settings),
  
  // Audio recording
  startRecording: () => ipcRenderer.invoke('start-recording'),
  stopRecording: () => ipcRenderer.invoke('stop-recording'),
  
  // Assistant
  startAssistantRecording: () => ipcRenderer.invoke('start-assistant-recording'),
  stopAssistantRecording: () => ipcRenderer.invoke('stop-assistant-recording'),
  sendAssistantMessage: (message) => ipcRenderer.invoke('send-assistant-message', message),
  
  // Authentication
  signInWithEmail: (email, password) => ipcRenderer.invoke('sign-in-with-email', email, password),
  signUpWithEmail: (email, password) => ipcRenderer.invoke('sign-up-with-email', email, password),
  signOut: () => ipcRenderer.invoke('sign-out'),
  getUser: () => ipcRenderer.invoke('get-user'),
  
  // Usage and history
  getUsageHistory: () => ipcRenderer.invoke('get-usage-history'),
  getTranscriptionHistory: () => ipcRenderer.invoke('get-transcription-history'),
  clearTranscriptionHistory: () => ipcRenderer.invoke('clear-transcription-history'),
  
  // Window management
  minimizeWindow: () => ipcRenderer.invoke('minimize-window'),
  maximizeWindow: () => ipcRenderer.invoke('maximize-window'),
  closeWindow: () => ipcRenderer.invoke('close-window'),
  hideWindow: () => ipcRenderer.invoke('hide-window'),
  
  // Event listeners (with automatic cleanup)
  onRecordingStarted: (callback) => {
    const handler = (event, ...args) => callback(...args);
    ipcRenderer.on('recording:started', handler);
    return () => ipcRenderer.removeListener('recording:started', handler);
  },
  
  onRecordingStopped: (callback) => {
    const handler = (event, ...args) => callback(...args);
    ipcRenderer.on('recording:stopped', handler);
    return () => ipcRenderer.removeListener('recording:stopped', handler);
  },
  
  onTranscriptionResult: (callback) => {
    const handler = (event, ...args) => callback(...args);
    ipcRenderer.on('transcription:result', handler);
    return () => ipcRenderer.removeListener('transcription:result', handler);
  },
  
  onTranscriptionError: (callback) => {
    const handler = (event, ...args) => callback(...args);
    ipcRenderer.on('transcription:error', handler);
    return () => ipcRenderer.removeListener('transcription:error', handler);
  },
  
  onAssistantStarted: (callback) => {
    const handler = (event, ...args) => callback(...args);
    ipcRenderer.on('assistant:started', handler);
    return () => ipcRenderer.removeListener('assistant:started', handler);
  },
  
  onAssistantStopped: (callback) => {
    const handler = (event, ...args) => callback(...args);
    ipcRenderer.on('assistant:stopped', handler);
    return () => ipcRenderer.removeListener('assistant:stopped', handler);
  },
  
  onAssistantToken: (callback) => {
    const handler = (event, ...args) => callback(...args);
    ipcRenderer.on('assistant:token', handler);
    return () => ipcRenderer.removeListener('assistant:token', handler);
  },
  
  onAssistantComplete: (callback) => {
    const handler = (event, ...args) => callback(...args);
    ipcRenderer.on('assistant:complete', handler);
    return () => ipcRenderer.removeListener('assistant:complete', handler);
  },
  
  onAssistantError: (callback) => {
    const handler = (event, ...args) => callback(...args);
    ipcRenderer.on('assistant:error', handler);
    return () => ipcRenderer.removeListener('assistant:error', handler);
  },
  
  onAuthStateChanged: (callback) => {
    const handler = (event, ...args) => callback(...args);
    ipcRenderer.on('auth:state-changed', handler);
    return () => ipcRenderer.removeListener('auth:state-changed', handler);
  },
  
  // Remove all listeners (cleanup function)
  removeAllListeners: () => {
    ipcRenderer.removeAllListeners('recording:started');
    ipcRenderer.removeAllListeners('recording:stopped');
    ipcRenderer.removeAllListeners('transcription:result');
    ipcRenderer.removeAllListeners('transcription:error');
    ipcRenderer.removeAllListeners('assistant:started');
    ipcRenderer.removeAllListeners('assistant:stopped');
    ipcRenderer.removeAllListeners('assistant:token');
    ipcRenderer.removeAllListeners('assistant:complete');
    ipcRenderer.removeAllListeners('assistant:error');
    ipcRenderer.removeAllListeners('auth:state-changed');
  }
});

// Expose version information
contextBridge.exposeInMainWorld('appInfo', {
  name: 'Mithril Whisper',
  version: '1.0.0',
  platform: process.platform,
  isSecure: true // Indicates this is the secure context-isolated version
});

// Security: Remove any global variables that might be unsafe
delete window.require;
delete window.exports;
delete window.module;

console.log('🔒 Secure preload script initialized with context isolation');
