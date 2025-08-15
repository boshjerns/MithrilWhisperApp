const fs = require('fs');
const path = require('path');
const { EventEmitter } = require('events');
const { app } = require('electron');

class AudioRecorder extends EventEmitter {
  constructor() {
    super();
    this.audioChunks = [];
    this.isRecording = false;
    this.outputPath = null;
    this.vadEnabled = false; // Will implement VAD later
    this.silenceThreshold = 3000; // ms of silence before stopping
    this.silenceTimer = null;
    this.mainWindow = null; // Will be set by main process
    this.sessionTempDir = null;
  }

  async init() {
    // Use OS temp directory scoped to app and session
    const baseTemp = app.getPath('temp');
    const appTempRoot = path.join(baseTemp, 'mithril-whisper');
    const sessionId = `${process.pid}-${Date.now()}`;
    this.sessionTempDir = path.join(appTempRoot, sessionId);

    try {
      fs.mkdirSync(this.sessionTempDir, { recursive: true });
    } catch (e) {
      // Fallback to app temp root if session dir cannot be created
      this.sessionTempDir = appTempRoot;
      try { fs.mkdirSync(this.sessionTempDir, { recursive: true }); } catch (_) {}
    }

    console.log('Audio recorder initialized. Temp dir:', this.sessionTempDir);
  }

  async start() {
    if (this.isRecording) {
      throw new Error('Already recording');
    }

    try {
      this.isRecording = true;
      this.audioChunks = [];
      
      // Generate unique filename in session temp directory
      const timestamp = Date.now();
      const tempDir = this.sessionTempDir || path.join(app.getPath('temp'), 'mithril-whisper');
      this.outputPath = path.join(tempDir, `recording_${timestamp}.wav`);
      
      console.log('Starting Web Audio recording...');
      
      // Use Web Audio API through renderer process
      if (this.mainWindow && this.mainWindow.webContents) {
        // Send message to renderer to start recording
        this.mainWindow.webContents.send('start-audio-recording', {
          outputPath: this.outputPath,
          sampleRate: 16000
        });
        
        // Set up IPC handler for audio data
        this.setupAudioDataHandler();
        
        console.log('Recording started, output:', this.outputPath);
        this.emit('started');
        return true;
      } else {
        throw new Error('Main window not available for recording');
      }
    } catch (error) {
      this.isRecording = false;
      console.error('Failed to start recording:', error);
      throw error;
    }
  }

  async stop() {
    if (!this.isRecording) {
      return null;
    }

    try {
      this.isRecording = false;
      
      // Clear silence timer
      if (this.silenceTimer) {
        clearTimeout(this.silenceTimer);
        this.silenceTimer = null;
      }

      // Stop recording in renderer process
      if (this.mainWindow && this.mainWindow.webContents) {
        this.mainWindow.webContents.send('stop-audio-recording');
      }

      // Wait a bit for final audio data
      await new Promise(resolve => setTimeout(resolve, 500));

      // Create audio data object
      let audioData = null;
      if (this.audioChunks.length > 0) {
        // Convert audio chunks to buffer
        const totalLength = this.audioChunks.reduce((acc, chunk) => acc + chunk.length, 0);
        const pcmData = Buffer.concat(this.audioChunks, totalLength);
        
        // Create WAV file with header
        const wavBuffer = this.createWAVFile(pcmData, 16000, 1, 16);
        
        // Write to file
        if (this.outputPath) {
          fs.writeFileSync(this.outputPath, wavBuffer);
        }
        
        audioData = {
          path: this.outputPath,
          buffer: wavBuffer,
          chunks: this.audioChunks.length,
          sampleRate: 16000,
        };
      }

      console.log('Recording stopped, chunks:', this.audioChunks.length);
      this.emit('stopped', audioData);
      
      return audioData;
    } catch (error) {
      console.error('Failed to stop recording:', error);
      this.isRecording = false;
      return null;
    }
  }

  // Set up IPC handler for audio data from renderer
  setupAudioDataHandler() {
    const { ipcMain } = require('electron');
    
    // Remove existing listeners to avoid duplicates
    ipcMain.removeAllListeners('audio-data-chunk');
    ipcMain.removeAllListeners('audio-recording-started');
    ipcMain.removeAllListeners('audio-recording-stopped');
    ipcMain.removeAllListeners('audio-recording-error');
    ipcMain.removeAllListeners('speech-recognition-result');
    
    // Handle speech recognition results
    ipcMain.on('speech-recognition-result', (event, result) => {
      console.log('🔥 RECEIVED speech recognition result:', result.text, result.isFinal ? '(final)' : '(interim)');
      this.emit('speechRecognitionResult', result);
    });
    
    // Handle audio data chunks
    ipcMain.on('audio-data-chunk', (event, audioBuffer) => {
      if (this.isRecording && audioBuffer && audioBuffer.length > 0) {
        const chunk = Buffer.from(audioBuffer);
        this.audioChunks.push(chunk);
        this.emit('audioData', chunk);
        
        // Reset silence timer when we get audio data
        if (this.silenceTimer) {
          clearTimeout(this.silenceTimer);
        }
        
        // Set new silence timer
        this.silenceTimer = setTimeout(() => {
          this.emit('silenceDetected');
        }, this.silenceThreshold);
      }
    });
    
    // Handle recording events
    ipcMain.on('audio-recording-started', () => {
      console.log('Audio recording started in renderer');
    });
    
    ipcMain.on('audio-recording-stopped', () => {
      console.log('Audio recording stopped in renderer');
    });
    
    ipcMain.on('audio-recording-error', (event, error) => {
      console.error('Audio recording error in renderer:', error);
      this.emit('error', new Error(error));
    });
  }

  // Simple Voice Activity Detection based on audio level
  detectVoiceActivity(audioChunk) {
    if (!audioChunk || audioChunk.length === 0) return false;
    
    // Calculate RMS (Root Mean Square) for audio level
    let sum = 0;
    for (let i = 0; i < audioChunk.length; i += 2) {
      const sample = audioChunk.readInt16LE(i);
      sum += sample * sample;
    }
    
    const rms = Math.sqrt(sum / (audioChunk.length / 2));
    const threshold = 500; // Adjust based on microphone sensitivity
    
    return rms > threshold;
  }

  // Set main window reference
  setMainWindow(mainWindow) {
    this.mainWindow = mainWindow;
  }

  // Get current recording status
  getStatus() {
    return {
      isRecording: this.isRecording,
      chunksRecorded: this.audioChunks.length,
      outputPath: this.outputPath,
    };
  }

  // Clean up temporary files
  cleanup() {
    if (this.isRecording) {
      try {
        this.stop();
      } catch (error) {
        console.error('Error stopping recording during cleanup:', error);
      }
    }

    // Clear any active timers
    if (this.silenceTimer) {
      clearTimeout(this.silenceTimer);
      this.silenceTimer = null;
    }

    // Clear audio chunks
    this.audioChunks = [];

    // Clean up IPC listeners
    try {
      const { ipcMain } = require('electron');
      ipcMain.removeAllListeners('audio-data-chunk');
      ipcMain.removeAllListeners('audio-recording-started');
      ipcMain.removeAllListeners('audio-recording-stopped');
      ipcMain.removeAllListeners('audio-recording-error');
      ipcMain.removeAllListeners('speech-recognition-result');
    } catch (error) {
      console.error('Error cleaning up IPC listeners:', error);
    }

    // Attempt to remove session temp files eagerly
    try {
      if (this.sessionTempDir && fs.existsSync(this.sessionTempDir)) {
        const files = fs.readdirSync(this.sessionTempDir);
        files.forEach(file => {
          try { fs.unlinkSync(path.join(this.sessionTempDir, file)); } catch (_) {}
        });
        try { fs.rmdirSync(this.sessionTempDir); } catch (_) {}
      }
    } catch (error) {
      console.error('Error cleaning up session temp files:', error);
    }

    // Legacy cleanup: remove any stale files older than 24h in app temp root
    const appTempRoot = path.join(app.getPath('temp'), 'mithril-whisper');
    if (fs.existsSync(appTempRoot)) {
      try {
        const files = fs.readdirSync(appTempRoot);
        const cutoff = Date.now() - (24 * 60 * 60 * 1000); // 24 hours ago
        files.forEach(file => {
          const filePath = path.join(appTempRoot, file);
          try {
            const stats = fs.statSync(filePath);
            if (stats.mtime.getTime() < cutoff) {
              fs.unlinkSync(filePath);
            }
          } catch (_) {}
        });
      } catch (error) {
        console.error('Error cleaning up app temp root:', error);
      }
    }
  }

  // Update settings
  updateSettings(settings) {
    if (settings.silenceThreshold) {
      this.silenceThreshold = settings.silenceThreshold;
    }
    if (settings.vadEnabled !== undefined) {
      this.vadEnabled = settings.vadEnabled;
    }
  }

  createWAVFile(pcmData, sampleRate, numChannels, bitsPerSample) {
    const bytesPerSample = bitsPerSample / 8;
    const blockAlign = numChannels * bytesPerSample;
    const byteRate = sampleRate * blockAlign;
    const dataSize = pcmData.length;
    const fileSize = 44 + dataSize;
    
    const buffer = Buffer.alloc(fileSize);
    
    // Write WAV header
    buffer.write('RIFF', 0);
    buffer.writeUInt32LE(fileSize - 8, 4);
    buffer.write('WAVE', 8);
    buffer.write('fmt ', 12);
    buffer.writeUInt32LE(16, 16); // fmt chunk size
    buffer.writeUInt16LE(1, 20); // PCM format
    buffer.writeUInt16LE(numChannels, 22);
    buffer.writeUInt32LE(sampleRate, 24);
    buffer.writeUInt32LE(byteRate, 28);
    buffer.writeUInt16LE(blockAlign, 32);
    buffer.writeUInt16LE(bitsPerSample, 34);
    buffer.write('data', 36);
    buffer.writeUInt32LE(dataSize, 40);
    
    // Copy PCM data
    pcmData.copy(buffer, 44);
    
    return buffer;
  }
}

module.exports = AudioRecorder; 