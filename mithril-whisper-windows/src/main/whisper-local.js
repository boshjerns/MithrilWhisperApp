const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs').promises;
const { app } = require('electron');

class WhisperLocal {
  constructor() {
    this.whisperPath = null;
    this.modelPath = null;
    this.modelSize = 'tiny-q5_1'; // Default to quantized tiny model for speed
    this.isInitialized = false;
  }

  async init() {
    // Resolve bundled locations across dev, portable, and installed builds
    // Priority: extraResources → app.asar.unpacked → resources/app → dev repo
    const userDir = path.join(app.getPath('userData'), 'whisper-cpp');
    const resourcesPath = process.resourcesPath || '';

    const candidateDirs = [
      // electron-builder extraResources
      path.join(resourcesPath, 'whisper-cpp'),
      // electron-builder asarUnpack fallback
      path.join(resourcesPath, 'app.asar.unpacked', 'whisper-cpp'),
      // electron-packager portable layout (resources/app)
      path.join(resourcesPath, 'app', 'whisper-cpp'),
      // development layout (run from build/main)
      path.join(__dirname, '..', '..', 'whisper-cpp'),
    ];

    let resolvedDir = null;
    for (const dir of candidateDirs) {
      if (await awaitExists(dir)) {
        resolvedDir = dir;
        break;
      }
    }

    this.whisperDir = resolvedDir || userDir;

    // Find a valid executable among common whisper.cpp names and subdirectories
    const execCandidates = [
      // Prefer Release builds where DLLs live alongside the exe
      path.join(this.whisperDir, 'Release', 'whisper-cli.exe'),
      path.join(this.whisperDir, 'Release', 'main.exe'),
      // Then try top-level binaries
      path.join(this.whisperDir, 'whisper-cli.exe'),
      path.join(this.whisperDir, 'main.exe'),
      path.join(this.whisperDir, 'whisper.exe'),
    ];

    this.whisperPath = null;
    for (const exePath of execCandidates) {
      if (await awaitExists(exePath)) {
        this.whisperPath = exePath;
        break;
      }
    }

    this.modelPath = path.join(this.whisperDir, `ggml-${this.modelSize}.bin`);

    // If bundled not present, fallback to user directory and attempt the same resolution
    if (!this.whisperPath || !(await awaitExists(this.modelPath))) {
      this.whisperDir = userDir;
      const userExecCandidates = [
        path.join(this.whisperDir, 'whisper-cli.exe'),
        path.join(this.whisperDir, 'main.exe'),
        path.join(this.whisperDir, 'Release', 'whisper-cli.exe'),
        path.join(this.whisperDir, 'Release', 'main.exe'),
      ];
      this.whisperPath = null;
      for (const exePath of userExecCandidates) {
        if (await awaitExists(exePath)) {
          this.whisperPath = exePath;
          break;
        }
      }
      this.modelPath = path.join(this.whisperDir, `ggml-${this.modelSize}.bin`);
    }

    // Validate final resolution or initiate download instructions
    try {
      await fs.access(this.whisperPath);
      await fs.access(this.modelPath);
      console.log('✅ Whisper.cpp found at:', this.whisperPath);
      console.log('✅ Model found at:', this.modelPath);
      this.isInitialized = true;
    } catch (_) {
      console.log('⚠️ Whisper.cpp binaries or model not found. Triggering download instructions.');
      await this.downloadWhisper();
    }
  }

  async downloadWhisper() {
    console.log('📥 Downloading whisper.cpp...');
    
    // Create directory if it doesn't exist
    await fs.mkdir(this.whisperDir, { recursive: true });

    // For Windows, we'll download pre-built binaries
    const whisperUrl = 'https://github.com/ggml/whisper.cpp/releases/latest/download/whisper-bin-x64.zip';
    const modelUrl = `https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-${this.modelSize}.bin`;

    try {
      // Download instructions for user
      console.log(`
📥 MANUAL DOWNLOAD REQUIRED:
1. Download whisper.cpp Windows binary from:
   ${whisperUrl}
   
2. Extract main.exe to:
   ${this.whisperDir}
   
3. Download the model from:
   ${modelUrl}
   
4. Save it as:
   ${this.modelPath}
   
5. Restart the application
`);
      
      // For now, we'll provide instructions. In production, you'd implement actual download
      this.isInitialized = false;
    } catch (error) {
      console.error('❌ Failed to download whisper.cpp:', error);
      throw error;
    }
  }

  async transcribe(audioPath) {
    if (!this.isInitialized) {
      console.error('❌ Whisper.cpp not initialized');
      return null;
    }

    return new Promise((resolve, reject) => {
      console.log('🎙️ Starting local Whisper transcription...');
      
      // Whisper.cpp command arguments
      const args = [
        '-m', this.modelPath,     // Model path
        '-t', '4',                // Number of threads
        '-otxt',                  // Output result in a text file
        audioPath,                // Input audio file (must be last)
      ];

      console.log('Running whisper binary with sanitized args');
      
      const whisperProcess = spawn(this.whisperPath, args);
      let output = '';
      let error = '';

      whisperProcess.stdout.on('data', (data) => {
        output += data.toString();
        // Avoid logging stdout text as it can contain transcript content
      });

      whisperProcess.stderr.on('data', (data) => {
        error += data.toString();
        // Avoid logging stderr content to prevent leaking text
      });

      whisperProcess.on('close', (code) => {
        if (code === 0) {
          // Whisper.cpp creates a .txt file with the same name as input
          const txtPath = audioPath + '.txt';
          
          // Read the transcription from the output file
          fs.readFile(txtPath, 'utf8')
            .then(text => {
              console.log('✅ Local transcription complete. length=', text.length);
              // Delete the whisper output file immediately for privacy
              fs.unlink(txtPath).catch(() => {});
              // Best-effort deletion of input WAV here as a fallback; primary cleanup happens in main flow
              fs.unlink(audioPath).catch(() => {});
              resolve(text.trim());
            })
            .catch(err => {
              console.error('❌ Failed to read transcription:', err);
              reject(err);
            });
        } else {
          console.error('❌ Whisper.cpp error:', error);
          reject(new Error(`Whisper process exited with code ${code}: ${error}`));
        }
      });

      whisperProcess.on('error', (err) => {
        console.error('❌ Failed to start whisper.cpp:', err);
        reject(err);
      });
    });
  }

  setModel(modelSize) {
    this.modelSize = modelSize;
    // Do not compute modelPath here because whisperDir may not be resolved yet
    // It will be computed during init() after resolving the directory
    this.isInitialized = false; // Force re-init with new model
  }
}

async function awaitExists(p) {
  try { await fs.access(p); return true; } catch { return false; }
}

module.exports = WhisperLocal; 