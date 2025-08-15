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
    this.language = 'auto'; // Default to auto-detect
    this.translationMode = 'transcribe'; // Default to transcribe only
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
      // development layout (run from src/main during tests)
      path.join(__dirname, '..', '..', '..', 'whisper-cpp'),
      // app root
      (function(){ try { return path.join(app.getAppPath(), 'whisper-cpp'); } catch(_) { return null; } })(),
      // cwd fallback
      (function(){ try { return path.join(process.cwd(), 'whisper-cpp'); } catch(_) { return null; } })(),
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
      // Prefer the modern whisper-cli first
      path.join(this.whisperDir, 'whisper-cli'),
      path.join(this.whisperDir, 'bin', 'whisper-cli'),
      path.join(this.whisperDir, 'Release', 'whisper-cli.exe'),
      path.join(this.whisperDir, 'whisper-cli.exe'),
      // Legacy main binaries
      path.join(this.whisperDir, 'Release', 'main.exe'),
      path.join(this.whisperDir, 'main.exe'),
      path.join(this.whisperDir, 'whisper.exe'),
      path.join(this.whisperDir, 'main'),
      path.join(this.whisperDir, 'bin', 'main'),
      // Homebrew/common install paths
      '/opt/homebrew/bin/whisper-cpp',
      '/usr/local/bin/whisper-cpp',
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
        // Prefer whisper-cli
        path.join(this.whisperDir, 'whisper-cli'),
        path.join(this.whisperDir, 'bin', 'whisper-cli'),
        path.join(this.whisperDir, 'whisper-cli.exe'),
        // Legacy main
        path.join(this.whisperDir, 'main'),
        path.join(this.whisperDir, 'bin', 'main'),
        path.join(this.whisperDir, 'main.exe'),
        path.join(this.whisperDir, 'Release', 'whisper-cli.exe'),
        path.join(this.whisperDir, 'Release', 'main.exe'),
        '/opt/homebrew/bin/whisper-cpp',
        '/usr/local/bin/whisper-cpp',
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
    console.log('📥 Downloading/setting up whisper.cpp...');

    await fs.mkdir(this.whisperDir, { recursive: true });
    const modelUrl = `https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-${this.modelSize}.bin`;

    if (process.platform === 'win32') {
      console.log(`
📥 MANUAL DOWNLOAD REQUIRED (Windows):
1) Download whisper.cpp Windows binary ZIP.
2) Extract main.exe into: ${this.whisperDir}
3) Download model: ${modelUrl}
4) Save as: ${this.modelPath}
`);
      this.isInitialized = false;
      return;
    }

    if (process.platform === 'darwin') {
      // On macOS, provide concise instructions; automated fetching happens in setup commands we run for dev
      console.log(`
📥 macOS setup expected at: ${this.whisperDir}
- Binary: main (built from whisper.cpp)
- Model: ${this.modelPath}
`);
      this.isInitialized = false;
      return;
    }

    this.isInitialized = false;
  }

  async transcribe(audioPath) {
    if (!this.isInitialized) {
      console.error('❌ Whisper.cpp not initialized');
      return null;
    }

    return new Promise((resolve, reject) => {
      console.log('🎙️ Starting local Whisper transcription...');
      
      const exe = this.whisperPath || '';
      const base = path.basename(exe).toLowerCase();
      const isCli = base.includes('whisper-cli');
      // Whisper.cpp command arguments (prefer whisper-cli API)
      const baseArgs = [
        '-m', this.modelPath,
        '-t', '4',
        '-otxt',
        // Accuracy improvements
        '-bo', '10',     // Increase best-of candidates for better accuracy
        '-bs', '8',      // Increase beam size for better decoding
        '-wt', '0.005',  // Lower word threshold for more confident words
        '-tp', '0.0'     // Use greedy decoding (temperature 0) for consistency
      ];

      // Add language parameter if not auto-detecting
      if (this.language && this.language !== 'auto') {
        baseArgs.push('-l', this.language);
      }

      // Add translation flag if translating to English
      if (this.translationMode === 'translate') {
        baseArgs.push('-tr'); // Use correct whisper.cpp flag
      }

      const args = isCli ? [
        ...baseArgs,
        '-f', audioPath,
      ] : [
        ...baseArgs,
        audioPath,
      ];

      console.log(`🔧 Whisper command: ${path.basename(exe)} ${args.join(' ')}`);
      console.log(`🌐 Language: ${this.language}, Translation: ${this.translationMode}`);
      
      // Ensure we execute from the same directory as the binary to resolve any relative Metal libraries
      const cwd = path.dirname(exe);
      const whisperProcess = spawn(exe, args, { cwd });
      console.log('whisper-local spawn:', { exe, args, cwd });
      let output = '';
      let error = '';

      whisperProcess.stdout.on('data', (data) => {
        output += data.toString();
        try { if (process.env.WHISPER_DEBUG === '1') console.log('[whisper stdout]', data.toString().slice(0, 500)); } catch (_) {}
      });

      whisperProcess.stderr.on('data', (data) => {
        error += data.toString();
        try { console.log('[whisper stderr]', data.toString().slice(0, 500)); } catch (_) {}
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
          console.error('❌ Whisper.cpp error (code', code, '):', error || '(no stderr)');
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

  setLanguage(language) {
    this.language = language || 'auto';
  }

  setTranslationMode(mode) {
    this.translationMode = mode || 'transcribe';
  }
}

async function awaitExists(p) {
  try { await fs.access(p); return true; } catch { return false; }
}

module.exports = WhisperLocal; 