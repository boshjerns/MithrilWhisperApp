const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs').promises;
const { app } = require('electron');

class WhisperLocal {
  constructor() {
    this.whisperPath = null;
    this.modelPath = null;
    this.modelSize = 'base-q5_1'; // Default to quantized base model for better accuracy
    this.isInitialized = false;
    this.language = 'auto'; // Default to auto-detect
  }

  async init() {
    // Architecture-aware binary resolution for universal compatibility
    const arch = process.arch; // 'arm64' for Apple Silicon, 'x64' for Intel
    console.log(`🏗️ Initializing Whisper for architecture: ${arch}`);
    
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
      // Architecture-specific binaries (preferred for compatibility)
      path.join(this.whisperDir, `whisper-cli-${arch}`),
      path.join(this.whisperDir, `main-${arch}`),
      path.join(this.whisperDir, 'bin', `whisper-cli-${arch}`),
      path.join(this.whisperDir, 'bin', `main-${arch}`),
      // Universal binaries (modern whisper-cli first)
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
        // Verify binary architecture compatibility
        if (await this.verifyBinaryCompatibility(exePath)) {
          this.whisperPath = exePath;
          console.log(`✅ Found compatible ${arch} whisper binary at:`, exePath);
          break;
        } else {
          console.warn(`⚠️ Binary ${exePath} exists but is not compatible with ${arch} architecture`);
        }
      }
    }

    this.modelPath = path.join(this.whisperDir, `ggml-${this.modelSize}.bin`);

    // If bundled not present, fallback to user directory and attempt the same resolution
    if (!this.whisperPath || !(await awaitExists(this.modelPath))) {
      this.whisperDir = userDir;
      const userExecCandidates = [
        // Architecture-specific binaries
        path.join(this.whisperDir, `whisper-cli-${arch}`),
        path.join(this.whisperDir, `main-${arch}`),
        path.join(this.whisperDir, 'bin', `whisper-cli-${arch}`),
        path.join(this.whisperDir, 'bin', `main-${arch}`),
        // Universal or generic binaries
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
          if (await this.verifyBinaryCompatibility(exePath)) {
              this.whisperPath = exePath;
            break;
          } else {
            console.warn(`⚠️ Binary ${exePath} exists but is not compatible with ${arch} architecture`);
          }
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
      const currentArch = process.arch;
      // On macOS, provide architecture-specific instructions
      console.log(`
📥 macOS setup required for ${currentArch} architecture at: ${this.whisperDir}

ARCHITECTURE COMPATIBILITY ISSUE DETECTED:
Your system: ${currentArch} (${currentArch === 'arm64' ? 'Apple Silicon' : 'Intel'})

SOLUTION - Build Universal Whisper.cpp Binaries:
1. Clone whisper.cpp: git clone https://github.com/ggerganov/whisper.cpp.git
2. Build universal binary: 
   cd whisper.cpp
   make clean
   WHISPER_METAL=1 make -j $(sysctl -n hw.ncpu) ARCH="arm64 x86_64"
3. Copy binaries to: ${this.whisperDir}
   - whisper-cli or main
4. Download model: ${this.modelPath}

TEMPORARY WORKAROUND - Architecture-Specific Binaries:
- Copy your current binary as: main-${currentArch} or whisper-cli-${currentArch}
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
        // Accuracy improvements (limited by tiny model constraints)
        '-bo', '8',      // Max best-of for tiny model (was 10, causing error)
        '-bs', '5',      // Beam size (reduce to be safe with tiny model)
        '-wt', '0.01',   // Word threshold (slightly higher for stability)
        '-tp', '0.0'     // Use greedy decoding (temperature 0) for consistency
      ];

      // Add language parameter if not auto-detecting
      if (this.language && this.language !== 'auto') {
        baseArgs.push('-l', this.language);
      }

      const args = isCli ? [
        ...baseArgs,
        '-f', audioPath,
      ] : [
        ...baseArgs,
        audioPath,
      ];

      console.log(`🔧 Whisper command: ${path.basename(exe)} ${args.join(' ')}`);
      console.log(`🌐 Language: ${this.language}`);
      
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

  async verifyBinaryCompatibility(binaryPath) {
    try {
      const { spawn } = require('child_process');
      
      // Try to get binary architecture info using file command
      return new Promise((resolve) => {
        const fileProcess = spawn('file', [binaryPath], { stdio: 'pipe' });
        let output = '';
        
        fileProcess.stdout.on('data', (data) => {
          output += data.toString();
        });
        
        fileProcess.on('close', (code) => {
          if (code !== 0) {
            console.warn(`⚠️ Could not verify binary architecture for ${binaryPath}`);
            resolve(true); // Assume compatible if we can't check
            return;
          }
          
          const currentArch = process.arch;
          const isCurrentArchCompat = 
            (currentArch === 'arm64' && output.includes('arm64')) ||
            (currentArch === 'x64' && (output.includes('x86_64') || output.includes('x64'))) ||
            output.includes('universal') || 
            output.includes('fat'); // Universal/fat binaries support multiple architectures
          
          console.log(`🔍 Binary ${binaryPath} architecture check: ${isCurrentArchCompat ? 'COMPATIBLE' : 'INCOMPATIBLE'} (current: ${currentArch})`);
          resolve(isCurrentArchCompat);
        });
        
        fileProcess.on('error', () => {
          // If file command fails, assume compatible
          resolve(true);
        });
      });
    } catch (error) {
      console.warn(`⚠️ Error checking binary compatibility: ${error.message}`);
      return true; // Assume compatible if check fails
    }
  }
}

async function awaitExists(p) {
  try { await fs.access(p); return true; } catch { return false; }
}

module.exports = WhisperLocal; 