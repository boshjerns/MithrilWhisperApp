const { app, BrowserWindow, globalShortcut, ipcMain, clipboard } = require('electron');
const path = require('path');
const fs = require('fs');
const Store = require('electron-store');
const AudioRecorder = require('./audio-recorder');
const TextProcessor = require('./text-processor');
const VolumeManager = require('./volume-manager');

// Remove placeholder markers like [BLANK_AUDIO] / [NO AUDIO] / [SILENCE]
function stripBlankAudioMarkers(input) {
  if (input == null) return '';
  let out = String(input);
  // Common bracketed markers and bare tokens
  out = out.replace(/\[\s*(?:BLANK[_\s-]?AUDIO|NO[_\s-]?AUDIO|SILENCE)\s*\]/gi, ' ');
  out = out.replace(/\b(?:BLANK[_\s-]?AUDIO|NO[_\s-]?AUDIO|SILENCE)\b/gi, ' ');
  // Collapse whitespace
  out = out.replace(/\s+/g, ' ').trim();
  return out;
}

function isOnlyBlankAudio(input) {
  const stripped = stripBlankAudioMarkers(input);
  return stripped.length === 0;
}

// Reduce noisy cache errors in dev and improve transparent window stability
try {
  app.commandLine.appendSwitch('disable-gpu-shader-disk-cache');
  app.commandLine.appendSwitch('disable-http-cache');
} catch (_) {}

// Disable hardware acceleration for perfect transparency on Windows
if (process.platform === 'win32') {
  app.disableHardwareAcceleration();
}

const isDev = !app.isPackaged;

function resolveRendererFile(filename) {
  const candidates = [
    path.join(__dirname, '../renderer', filename),
    path.join(__dirname, '../../build/renderer', filename),
  ];
  for (const candidate of candidates) {
    try { if (fs.existsSync(candidate)) return candidate; } catch (_) {}
  }
  try {
    const appPath = app.getAppPath();
    return path.join(appPath, 'build', 'renderer', filename);
  } catch (_) {
    return path.join(__dirname, '..', '..', 'build', 'renderer', filename);
  }
}
async function handleAssistantQuery(userPrompt, context) {
  try {
    // Check if we're in local mode
    const supabaseUrl = process.env.SUPABASE_URL || '';
    const jwt = this.accessToken || '';
    const isLocalMode = !supabaseUrl;
    
    if (!isLocalMode && !jwt) {
      if (this.assistantWindow) {
        this.assistantWindow.webContents.send('assistant:error', 'Not authenticated');
      }
      return;
    }
    
    if (isLocalMode) {
      // In local mode, check for OpenAI API key
      const openaiApiKey = this.store.get('openaiApiKey');
      if (!openaiApiKey) {
        if (this.assistantWindow) {
          this.assistantWindow.webContents.send('assistant:error', 'OpenAI API key not configured. Please add it in Settings.');
        }
        return;
      }
    }
    const selection = (context && context.selectedText) ? String(context.selectedText) : '';
    let defaultAction = 'summarize';
    const lower = userPrompt.toLowerCase();
    if (selection && /(replace|change|modify|rewrite|refactor|fix|implement|update|apply|edit)/.test(lower)) {
      defaultAction = 'replace';
    }
    const systemPrompt = [
      'You are a fast coding assistant embedded in a voice tool.',
      'You get a USER instruction and optionally a SELECTION (text/code).',
      'Decide one of two actions:',
      ' - replace: when the user asks to change/improve/generate content to substitute the selection.',
      ' - summarize: when the user asks to explain/summarize/comment on the selection or topic.',
      'OUTPUT PROTOCOL:',
      ' 1) First line MUST be exactly: ACTION: replace  OR  ACTION: summarize',
      ' 2) Then the content only:',
      '    - If replace: output ONLY the replacement content, no commentary, no backticks.',
      '    - If summarize: output a concise explanation; code blocks only if essential.',
      'Constraints: Be brief and helpful. Keep under 800 tokens. No preambles.',
    ].join('\n');

    const selectionSnippet = selection && selection.length > 0 ? selection.slice(0, 8000) : '';
    const sanitizedUserPrompt = stripBlankAudioMarkers(userPrompt || '');
    this.createAssistantWindow && this.createAssistantWindow();
    if (this.assistantWindow && !this.assistantWindow.isDestroyed()) {
      this.assistantWindow.showInactive();
      this.assistantWindow.webContents.send('assistant:stream-start', {
        status: 'processing',
        hasSelection: !!selectionSnippet,
        userPrompt: sanitizedUserPrompt,
      });
    }

    const model = this.store.get('openaiModel') || this.assistantModel || 'gpt-4o-mini';
    const maxTokens = this.assistantMaxTokens || 800;

    let response;
    if (isLocalMode) {
      // Direct OpenAI API call in local mode
      const openaiApiKey = this.store.get('openaiApiKey');
      console.log('Assistant: calling OpenAI directly, model=', model, 'maxTokens=', maxTokens);
      
      const messages = [
        { role: 'system', content: systemPrompt + (selectionSnippet ? `\n\nSELECTION:\n${selectionSnippet}` : '') },
        { role: 'user', content: sanitizedUserPrompt }
      ];
      
      response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openaiApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model,
          messages,
          max_tokens: maxTokens,
          stream: true,
          temperature: 0.7
        })
      });
    } else {
      // Use Supabase Edge function
      const assistantUrl = `${supabaseUrl.replace(/\/$/, '')}/functions/v1/assistant`;
      console.log('Assistant: calling', assistantUrl, 'model=', model, 'maxTokens=', maxTokens);
      response = await fetch(assistantUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${jwt}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model,
          stream: true,
          max_output_tokens: maxTokens,
          input: [
            { role: 'developer', content: [ { type: 'input_text', text: systemPrompt + (selectionSnippet ? `\n\nSELECTION:\n${selectionSnippet}` : '') } ] },
            { role: 'user', content: [ { type: 'input_text', text: sanitizedUserPrompt } ] }
          ],
          text: { format: { type: 'text' } },
          reasoning: { effort: 'medium', summary: 'auto' },
          tools: [],
          store: true
        })
      });
    }

    if (!response.ok || !response.body) {
      const text = await (response.text ? response.text() : Promise.resolve(''));
      throw new Error(`OpenAI response error ${response.status}: ${text}`);
    }

    let decidedAction = null;
    let buffer = '';
    const tryDecide = () => {
      if (decidedAction) return;
      const firstLine = buffer.split(/\r?\n/)[0] || '';
      const m = firstLine.match(/ACTION:\s*(replace|summarize)/i);
      if (m) decidedAction = m[1].toLowerCase();
    };
    const sendToken = (text) => {
      if (this.assistantWindow && !this.assistantWindow.isDestroyed()) {
        this.assistantWindow.webContents.send('assistant:stream-token', text);
      }
    };
      const finalize = async () => {
      let finalText = buffer.replace(/^ACTION:\s*(replace|summarize)\s*\r?\n/i, '');
      if (!decidedAction) decidedAction = defaultAction;
      if (this.assistantWindow && !this.assistantWindow.isDestroyed()) {
        this.assistantWindow.webContents.send('assistant:stream-end', { action: decidedAction, text: finalText });
      }
      if (decidedAction === 'replace' && selection) {
        await this.injectText(finalText);
      }
        // Immediately return HUD to idle after finalize
        this.updateHUDStatus('idle', { connected: true });

        // Emit usage event to renderer (assistant session)
        try {
          const startedAt = new Date(this.recordingStartTime || Date.now());
          const endedAt = new Date();
          const durationMs = Math.max(0, endedAt.getTime() - startedAt.getTime());
          const { countWords } = require('../shared/text-utils');
          const payload = {
            started_at: startedAt.toISOString(),
            ended_at: endedAt.toISOString(),
            duration_ms: durationMs,
            transcript_chars_original: sanitizedUserPrompt.length,
            transcript_chars_cleaned: (finalText || '').length,
            model: this.assistantModel || 'o4-mini',
            platform: process.platform,
            app_version: app.getVersion ? app.getVersion() : (process.env.APP_VERSION || '0.0.0'),
            metadata: {
              kind: 'assistant',
              action: decidedAction,
              selection_chars: (selection || '').length,
              user_words: countWords(sanitizedUserPrompt),
              assistant_words: countWords(finalText),
            },
          };
          if (this.mainWindow && !this.mainWindow.isDestroyed()) {
            this.mainWindow.webContents.send('usage:session-completed', payload);
          }
        } catch (e) {
          console.error('Assistant: failed to emit usage event:', e);
        }
    };

    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('text/event-stream') || contentType.includes('text/plain')) {
      const reader = response.body.getReader ? response.body.getReader() : null;
      if (reader) {
        const decoder = new TextDecoder('utf-8');
        let lastEvent = '';
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          
          if (isLocalMode) {
            // OpenAI API streaming format
            chunk.split('\n').forEach((line) => {
              if (line.startsWith('data: ')) {
                const data = line.slice(6);
                if (data === '[DONE]') return;
                try {
                  const json = JSON.parse(data);
                  const delta = json.choices?.[0]?.delta?.content || '';
                  if (delta) {
                    buffer += delta;
                    if (buffer.length < 200) tryDecide();
                    sendToken(delta);
                  }
                } catch (_) {}
              }
            });
          } else {
            // Supabase Edge function format
            chunk.split(/\n\n/).forEach((block) => {
              const trimmed = block.trim();
              if (!trimmed) return;
              const lines = trimmed.split(/\n/);
              const eventLine = lines.find(l => l.startsWith('event:'));
              if (eventLine) lastEvent = eventLine.replace(/^event:\s*/, '');
              const dataLine = lines.find(l => l.startsWith('data:'));
              if (!dataLine) return;
              const data = dataLine.replace(/^data:\s*/, '');
              if (data === '[DONE]') return;
              try {
                const json = JSON.parse(data);
                let delta = '';
                if (json.type === 'response.output_text.delta' && typeof json.delta === 'string') delta = json.delta;
                else if (lastEvent === 'response.output_text.delta' && typeof json.delta === 'string') delta = json.delta;
                if (delta) {
                  buffer += delta;
                  if (buffer.length < 200) tryDecide();
                  sendToken(delta);
                }
              } catch (_) {}
            });
          }
        }
      } else {
        await new Promise((resolve, reject) => {
          let lastEvent = '';
          response.body.on('data', (value) => {
            const chunk = value.toString('utf8');
            chunk.split(/\n\n/).forEach((block) => {
              const trimmed = block.trim();
              if (!trimmed) return;
              const lines = trimmed.split(/\n/);
              const eventLine = lines.find(l => l.startsWith('event:'));
              if (eventLine) lastEvent = eventLine.replace(/^event:\s*/, '');
              const dataLine = lines.find(l => l.startsWith('data:'));
              if (!dataLine) return;
              const data = dataLine.replace(/^data:\s*/, '');
              if (data === '[DONE]') return;
              try {
                const json = JSON.parse(data);
                let delta = '';
                if (json.type === 'response.output_text.delta' && typeof json.delta === 'string') delta = json.delta;
                else if (lastEvent === 'response.output_text.delta' && typeof json.delta === 'string') delta = json.delta;
                if (delta) {
                  buffer += delta;
                  if (buffer.length < 200) tryDecide();
                  sendToken(delta);
                }
              } catch (_) {}
            });
          });
          response.body.on('end', resolve);
          response.body.on('error', reject);
        });
      }
    } else {
      const full = await response.json();
      let content = '';
      if (Array.isArray(full.output_text)) content = full.output_text.join('');
      else if (typeof full.output_text === 'string') content = full.output_text;
      buffer = content || '';
      tryDecide();
      if (buffer) sendToken(buffer);
    }

      await finalize();
  } catch (error) {
    console.error('Assistant OpenAI error:', error);
    if (this.assistantWindow && !this.assistantWindow.isDestroyed()) {
      this.assistantWindow.webContents.send('assistant:error', String(error.message || error));
    }
  }
}

class VoiceAssistant {
  constructor() {
    this.store = new Store();
    this.mainWindow = null;
    this.overlayWindow = null;
    this.desktopHUD = null;
    this.assistantWindow = null;
    this.audioRecorder = new AudioRecorder();
    this.textProcessor = new TextProcessor();
    this.volumeManager = new VolumeManager();
    this.isRecording = false;
    this.isAssistantRecording = false;
    this.isRecordingDisabled = false;
    this.hotkey = this.store.get('hotkey', 'F1');
    this.assistantHotkey = this.store.get('assistantHotkey', 'F2');
    // Assistant model defaults/migration
    const storedAssistantModel = this.store.get('assistantModel');
    if (storedAssistantModel === 'gpt-o4-mini' || storedAssistantModel === 'gpt-4o-mini') {
      this.store.set('assistantModel', 'o4-mini');
    }
    this.assistantModel = this.store.get('assistantModel', 'o4-mini');
    this.assistantMaxTokens = this.store.get('assistantMaxTokens', 800);
    this.authUser = null;
    this.accessToken = null;
    try { console.log('Supabase URL (main env):', process.env.SUPABASE_URL || '(empty)'); } catch (_) {}
    // Stable device id
    try {
      let deviceId = this.store.get('deviceId');
      if (!deviceId) {
        const { randomUUID } = require('crypto');
        deviceId = randomUUID();
        this.store.set('deviceId', deviceId);
      }
      this.deviceId = deviceId;
      console.log('Device ID:', this.deviceId);
    } catch (_) { this.deviceId = 'unknown-device'; }
    
    // Set default to use local Whisper
    const useLocalWhisper = this.store.get('useLocalWhisper');
    if (useLocalWhisper === undefined) {
      this.store.set('useLocalWhisper', true);
      console.log('🎯 Default set to use local Whisper');
    }
    
    // Set default audio ducking settings
    const audioDucking = this.store.get('audioDucking');
    if (audioDucking === undefined) {
      this.store.set('audioDucking', {
        enabled: true,
        duckPercent: 90
      });
      console.log('🎵 Default audio ducking settings applied');
    }
    
    this.setupIPC();

    // Provide a bound helper so any calls to this.handleAssistantQuery work
    this.handleAssistantQuery = async (userPrompt, context) => {
      return handleAssistantQuery.call(this, userPrompt, context);
    };
  }

  async createMainWindow() {
    this.mainWindow = new BrowserWindow({
      width: 400,
      height: 600,
      frame: false, // Remove default title bar
      titleBarStyle: 'hidden', // Cross-platform hidden title bar
      backgroundColor: '#000814', // Match our background color
      title: 'mithril whisper',
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
        enableRemoteModule: true,
        webSecurity: false, // Allow microphone access in development
      },
      show: false,
      icon: path.join(__dirname, '../../logo1.ico'),
    });

    if (isDev) {
      const devPort = Number(process.env.DEV_SERVER_PORT || 37843);
      this.mainWindow.loadURL(`http://localhost:${devPort}`);
      this.mainWindow.webContents.openDevTools();
    } else {
      this.mainWindow.loadFile(resolveRendererFile('index.html'));
    }

    this.mainWindow.on('closed', () => {
      this.mainWindow = null;
    });

    // In development, hide to tray. In packaged builds, fully quit.
    this.mainWindow.on('close', (event) => {
      // Always perform a full application quit when the main window is closed
      if (!app.quitting) {
        event.preventDefault();
        app.quitting = true;
        try { this.cleanup(); } catch (_) {}
        // Quit the entire Electron app after cleanup
        setImmediate(() => { try { app.quit(); } catch (_) { app.exit(0); } });
        return;
      }
    });
  }

  createOverlayWindow() {
    this.overlayWindow = new BrowserWindow({
      width: 400,
      height: 100,
      frame: false,
      alwaysOnTop: true,
      transparent: true,
      skipTaskbar: true,
      resizable: false,
      focusable: false, // Prevent stealing focus
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
      },
      show: false,
    });

    // Position overlay at top-right of screen
    const { screen } = require('electron');
    const primaryDisplay = screen.getPrimaryDisplay();
    const { width } = primaryDisplay.workAreaSize;
    this.overlayWindow.setPosition(width - 420, 20);

    // Always load overlay from HTML file for reliability
    // The overlay doesn't need hot reloading and this prevents route issues
    const overlayPath = isDev ? path.join(__dirname, '../renderer/overlay.html') : resolveRendererFile('overlay.html');
    this.overlayWindow.loadFile(overlayPath);
    console.log('Loading overlay from:', overlayPath);
  }

  createDesktopHUD() {
    console.log('🎯 Creating Desktop HUD...');
    
    this.desktopHUD = new BrowserWindow({
      width: 60,
      height: 60,
      frame: false,
      alwaysOnTop: true,
      transparent: true,
      backgroundColor: '#00000000', // Fully transparent background
      skipTaskbar: true,
      resizable: false,
      focusable: false,
      minimizable: false,
      maximizable: false,
      closable: false,
      hasShadow: false,
      type: process.platform === 'darwin' ? 'panel' : 'toolbar', // Better transparency

      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
        webSecurity: false,
        backgroundThrottling: false,
      },
      show: false,
    });

    // Make it click-through so users can work underneath
    this.desktopHUD.setIgnoreMouseEvents(true, { forward: true });

    // Position HUD at bottom center of screen
    const { screen } = require('electron');
    const primaryDisplay = screen.getPrimaryDisplay();
    const { width, height } = primaryDisplay.workAreaSize;
    
    const hudWidth = 60;
    const hudHeight = 60;
    const x = Math.round((width - hudWidth) / 2);
    const y = height - hudHeight - 60; // 60px from bottom for better visibility
    
    console.log(`🎯 Positioning HUD at: x=${x}, y=${y}, screen=${width}x${height}`);
    this.desktopHUD.setPosition(x, y);

    // Handle window ready event - prevent flash of white
    this.desktopHUD.once('ready-to-show', () => {
      console.log('🎯 Desktop HUD ready to show');
      
      // Set proper always-on-top level for better overlay behavior
      if (process.platform === 'win32') {
        this.desktopHUD.setAlwaysOnTop(true, 'screen-saver');
      }
      
      this.desktopHUD.showInactive(); // Show without stealing focus
      
      // Send initial status after a delay
      setTimeout(() => {
        console.log('🎯 Sending initial HUD status');
        this.updateHUDStatus('idle', { connected: true });
      }, 500);
    });

    this.desktopHUD.webContents.once('did-finish-load', () => {
      console.log('🎯 Desktop HUD finished loading');
    });

    // Handle any loading errors
    this.desktopHUD.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
      console.error('🚫 Desktop HUD failed to load:', errorCode, errorDescription);
    });

    // Use the webpack dev server for HUD in development, static file in production
    if (isDev) {
      const devPort = Number(process.env.DEV_SERVER_PORT || 37843);
      const url = `http://localhost:${devPort}#desktop-hud`;
      this.desktopHUD.loadURL(url);
      console.log('🎯 Loading HUD from dev server:', url);
    } else {
      // Load the desktop HUD HTML file
      const hudPath = resolveRendererFile('desktop-hud.html');
      this.desktopHUD.loadFile(hudPath);
      console.log('🎯 Loading HUD from file:', hudPath);
    }

    // Add error handling
    this.desktopHUD.on('closed', () => {
      console.log('🎯 Desktop HUD window closed');
      this.desktopHUD = null;
    });
  }

  createAssistantWindow() {
    try {
      if (this.assistantWindow && !this.assistantWindow.isDestroyed()) return;
      this.assistantWindow = new BrowserWindow({
        width: 380,
        height: 260,
        frame: false,
        alwaysOnTop: true,
        transparent: true,
        backgroundColor: '#00000000',
        skipTaskbar: true,
        resizable: false,
        focusable: true,
        hasShadow: false,
        type: process.platform === 'darwin' ? 'panel' : 'toolbar',
        webPreferences: {
          nodeIntegration: true,
          contextIsolation: false,
          webSecurity: false,
          backgroundThrottling: false,
        },
        show: false,
      });

      // Position bottom-right
      const { screen } = require('electron');
      const primaryDisplay = screen.getPrimaryDisplay();
      const { width, height } = primaryDisplay.workAreaSize;
      const w = 380; const h = 260;
      const x = Math.max(10, width - w - 20);
      const y = Math.max(10, height - h - 80);
      this.assistantWindow.setPosition(x, y);

      if (isDev) {
        const devPort = Number(process.env.DEV_SERVER_PORT || 37843);
        this.assistantWindow.loadURL(`http://localhost:${devPort}#assistant`);
      } else {
        this.assistantWindow.loadFile(resolveRendererFile('assistant-chat.html'));
      }

      this.assistantWindow.once('ready-to-show', () => {
        try {
          if (process.platform === 'win32') this.assistantWindow.setAlwaysOnTop(true, 'screen-saver');
          this.assistantWindow.showInactive();
          this.assistantWindow.webContents.send('assistant:show');
        } catch (_) {}
      });

      this.assistantWindow.on('closed', () => { this.assistantWindow = null; });
    } catch (e) {
      console.error('Failed to create assistant window:', e);
    }
  }

  setupGlobalHotkey() {
    // Clear only the transcription hotkey
    try { if (this.hotkey) globalShortcut.unregister(this.hotkey); } catch (_) {}
    
    // Validate and fix hotkey format
    let hotkey = this.hotkey;
    if (hotkey) {
      // Fix common format issues
      hotkey = hotkey.replace('Control+', 'Ctrl+').replace('Cmd+', 'CmdOrCtrl+');
      
      // If format is still invalid or incomplete, reset to default
      const validHotkey = hotkey.match(/^(Ctrl|Alt|Shift|CmdOrCtrl)\+\w+$/) || hotkey.match(/^F\d+$/);
      if (!validHotkey || hotkey.endsWith('+')) {
        console.log(`🔧 Invalid or incomplete hotkey "${this.hotkey}" → resetting to Alt+Space`);
        hotkey = 'Alt+Space';
        this.hotkey = hotkey;
        this.store.set('hotkey', hotkey);
      }
    } else {
      hotkey = 'Alt+Space';
    }
    
    console.log(`🎯 Setting up transcription hotkey: ${hotkey}`);
    
    // Simple toggle hotkey implementation
    let lastHotkeyTime = 0;
    let isProcessing = false;
    const debounceTime = 300; // Minimum time between presses
    
          // Register new hotkey with smart rapid-fire detection and error handling
      let success = false;
      try {
        success = globalShortcut.register(hotkey, async () => {
        const now = Date.now();
        const timeSinceLastHotkey = now - lastHotkeyTime;
        
        // Simple debouncing to prevent rapid firing
        if (timeSinceLastHotkey < debounceTime) {
          console.log(`🚫 Debounced: ignoring press (${timeSinceLastHotkey}ms ago)`);
          return;
        }
        
        // Prevent processing during transcription
        if (isProcessing || this.isAssistantRecording) {
          console.log('🚫 Hotkey ignored - transcription in progress');
          return;
        }
        
        if (this.isRecordingDisabled) {
          console.log('🚫 Hotkey ignored - recording temporarily disabled (settings page open)');
          return;
        }
        
        lastHotkeyTime = now;
        isProcessing = true;
        
        try {
          // Simple toggle: start if not recording, stop if recording
          if (this.isRecording) {
            console.log('🛑 Hotkey: Stopping recording (2nd press)');
            await this.stopRecording();
            console.log('✅ Recording stopped');
          } else {
            console.log('🎙️ Hotkey: Starting recording (1st press)');
            await this.startRecording();
            console.log('✅ Recording started');
          }
        } catch (error) {
          console.error('❌ Error processing hotkey:', error);
        } finally {
          isProcessing = false;
        }
      });
      } catch (error) {
        console.error(`❌ Failed to register hotkey "${hotkey}":`, error.message);
        // Reset to default if registration fails
        hotkey = 'Alt+Space';
        this.hotkey = hotkey;
        this.store.set('hotkey', hotkey);
        try {
          success = globalShortcut.register(hotkey, async () => {
            // Simple fallback hotkey handler
            console.log('🎯 Fallback hotkey triggered');
            if (this.isRecordingDisabled) {
              console.log('🚫 Fallback hotkey ignored - recording temporarily disabled (settings page open)');
              return;
            }
            if (this.isRecording) {
              await this.stopRecording();
            } else {
              await this.startRecording();
            }
          });
        } catch (fallbackError) {
          console.error('❌ Even fallback hotkey failed:', fallbackError.message);
        }
      }

    if (!success) {
      console.error('Failed to register global hotkey:', hotkey);
    } else {
      console.log('Transcription hotkey registered successfully:', hotkey);
      this.hotkey = hotkey; // Update instance variable with validated hotkey
    }
  }

  setupAssistantHotkey() {
    try { if (this.assistantHotkey) globalShortcut.unregister(this.assistantHotkey); } catch (_) {}

    let hotkey = this.assistantHotkey || 'F2';
    if (!/^F\d+$/.test(hotkey) && !/^(Ctrl|Alt|Shift|CmdOrCtrl)\+\w+$/.test(hotkey)) {
      hotkey = 'F2';
      this.assistantHotkey = hotkey;
      this.store.set('assistantHotkey', hotkey);
    }

    console.log(`🎯 Setting up assistant hotkey: ${hotkey}`);
    let lastHotkeyTime = 0;
    let isProcessing = false;
    const debounceTime = 300;

    let success = false;
    try {
      success = globalShortcut.register(hotkey, async () => {
        const now = Date.now();
        const timeSinceLastHotkey = now - lastHotkeyTime;
        if (timeSinceLastHotkey < debounceTime) {
          console.log(`🚫 Debounced assistant key: ignoring press (${timeSinceLastHotkey}ms ago)`);
          return;
        }
        if (isProcessing || this.isRecording) {
          console.log('🚫 Assistant hotkey ignored - other recording in progress');
          return;
        }
        if (this.isRecordingDisabled) {
          console.log('🚫 Assistant hotkey ignored - recording temporarily disabled (settings page open)');
          return;
        }
        lastHotkeyTime = now;
        isProcessing = true;
        try {
          if (this.isAssistantRecording) {
            console.log('🛑 Assistant: stopping recording');
            await this.stopAssistantRecording();
          } else {
            console.log('🎙️ Assistant: starting recording');
            await this.startAssistantRecording();
          }
        } catch (err) {
          console.error('Assistant hotkey error:', err);
        } finally {
          isProcessing = false;
        }
      });
    } catch (error) {
      console.error(`❌ Failed to register assistant hotkey "${hotkey}":`, error.message);
    }

    if (!success) {
      console.error('Failed to register assistant global hotkey:', hotkey);
    } else {
      console.log('Assistant global hotkey registered successfully:', hotkey);
      this.assistantHotkey = hotkey;
    }
  }

  setupIPC() {
    // Settings management
    ipcMain.handle('get-settings', () => {
      // Discover bundled whisper models so UI only shows available ones
      const path = require('path');
      const fs = require('fs');
      const resourcesPath = process.resourcesPath || '';
      const candidateDirs = [
        path.join(resourcesPath, 'whisper-cpp'),
        path.join(resourcesPath, 'app.asar.unpacked', 'whisper-cpp'),
        path.join(resourcesPath, 'app', 'whisper-cpp'),
        path.join(__dirname, '..', '..', 'whisper-cpp'),
      ];
      let whisperDir = null;
      for (const dir of candidateDirs) {
        try { if (fs.existsSync(dir)) { whisperDir = dir; break; } } catch (_) {}
      }
      let availableModels = [];
      try {
        if (whisperDir) {
          const files = fs.readdirSync(whisperDir);
          availableModels = files
            .filter(f => /^ggml-.*\.bin$/i.test(f))
            .map(f => f.replace(/^ggml-/i, '').replace(/\.bin$/i, ''));
          // Sort by rough size preference: tiny < base < small < medium < large
          const order = ['tiny', 'base', 'small', 'medium', 'large'];
          availableModels.sort((a, b) => {
            const ax = order.findIndex(k => a.startsWith(k));
            const bx = order.findIndex(k => b.startsWith(k));
            return (ax === -1 ? 999 : ax) - (bx === -1 ? 999 : bx);
          });
        }
      } catch (_) {}

      const preferredDefault = availableModels.find(m => m.startsWith('tiny')) || availableModels[0] || 'tiny-q5_1';
      const storedModel = this.store.get('whisperModel');
      const effectiveModel = storedModel && availableModels.includes(storedModel) ? storedModel : preferredDefault;

      // If store had nothing or invalid, persist the effective model so subsequent calls are stable
      if (!storedModel || storedModel !== effectiveModel) {
        this.store.set('whisperModel', effectiveModel);
      }

      return {
        hotkey: this.store.get('hotkey', 'Alt+Space'),
        assistantHotkey: this.store.get('assistantHotkey', 'F2'),
        model: this.store.get('model', effectiveModel),
        sensitivity: this.store.get('sensitivity', 0.5),
        cleanup: this.store.get('cleanup', true),
        autoInject: this.store.get('autoInject', true),
        openaiApiKey: '',
        useLocalWhisper: true,
        whisperModel: effectiveModel,
        availableModels,
        audioDucking: this.store.get('audioDucking', { enabled: true, duckPercent: 90 }),
      };
    });

    ipcMain.handle('save-settings', (event, settings) => {
      console.log('💾 Saving settings:', { ...settings, openaiApiKey: settings.openaiApiKey ? '[REDACTED]' : 'empty' });
      
      // Save all settings (ignore any OpenAI fields)
      Object.keys(settings).forEach(key => {
        if (key === 'openaiApiKey') return;
        this.store.set(key, settings[key]);
        console.log(`📝 Stored ${key}:`, settings[key]);
      });
      
      // Update hotkey if changed
      if (settings.hotkey !== this.hotkey) {
        this.hotkey = settings.hotkey;
        this.setupGlobalHotkey();
      }
      if (settings.assistantHotkey && settings.assistantHotkey !== this.assistantHotkey) {
        this.assistantHotkey = settings.assistantHotkey;
        this.store.set('assistantHotkey', this.assistantHotkey);
        this.setupAssistantHotkey();
      }
      if (settings.assistantModel && settings.assistantModel !== this.assistantModel) {
        this.assistantModel = settings.assistantModel;
        this.store.set('assistantModel', this.assistantModel);
      }
      if (typeof settings.assistantMaxTokens === 'number') {
        this.assistantMaxTokens = Math.max(128, Math.min(2048, settings.assistantMaxTokens));
        this.store.set('assistantMaxTokens', this.assistantMaxTokens);
      }

      // OpenAI path removed

      return true;
    });

    // Assistant chat window controls (do not hide the window; toggle minimized state in renderer)
    ipcMain.on('assistant:minimize', () => {
      try {
        if (this.assistantWindow && !this.assistantWindow.isDestroyed()) {
          this.assistantWindow.webContents.send('assistant:set-minimized', true);
        }
      } catch (_) {}
    });
    ipcMain.on('assistant:show', () => {
      try {
        if (this.assistantWindow && !this.assistantWindow.isDestroyed()) {
          this.assistantWindow.showInactive();
          this.assistantWindow.webContents.send('assistant:set-minimized', false);
          this.assistantWindow.webContents.send('assistant:show');
        }
      } catch (_) {}
    });

    // Recording control for settings page
    ipcMain.on('disable-recording-temporarily', () => {
      console.log('🚫 Recording disabled temporarily (settings page open)');
      this.isRecordingDisabled = true;
    });

    ipcMain.on('enable-recording', () => {
      console.log('✅ Recording re-enabled (settings page closed)');
      this.isRecordingDisabled = false;
    });

    // Auth state from renderer
    ipcMain.on('auth:signed-in', (_event, payload) => {
      this.authUser = payload && payload.user ? payload.user : null;
      this.accessToken = payload && payload.accessToken ? payload.accessToken : null;
      console.log('🔐 Auth signed in:', this.authUser ? this.authUser.email : 'unknown');
      // On sign-in, fetch remote non-sensitive config from Edge Function
      this.fetchRemoteConfigSafe();
    });

    ipcMain.on('auth:signed-out', () => {
      console.log('🔐 Auth signed out');
      this.authUser = null;
      this.accessToken = null;
    });

    // Recording controls
    ipcMain.handle('start-recording', () => {
      return this.startRecording();
    });

    ipcMain.handle('stop-recording', () => {
      return this.stopRecording();
    });

    ipcMain.handle('toggle-recording', () => {
      return this.toggleRecording();
    });

    // Text injection
    ipcMain.handle('inject-text', async (event, text) => {
      return await this.injectText(text);
    });

    // Window controls
    ipcMain.handle('show-main-window', () => {
      if (this.mainWindow) {
        this.mainWindow.show();
        this.mainWindow.focus();
      }
    });

    // Custom title bar controls
    ipcMain.handle('window-minimize', () => {
      if (this.mainWindow) {
        this.mainWindow.minimize();
      }
    });

    ipcMain.handle('window-maximize', () => {
      if (this.mainWindow) {
        if (this.mainWindow.isMaximized()) {
          this.mainWindow.unmaximize();
        } else {
          this.mainWindow.maximize();
        }
      }
    });

    ipcMain.handle('window-close', () => {
      if (this.mainWindow) {
        this.mainWindow.close();
      }
    });

    ipcMain.handle('window-is-maximized', () => {
      return this.mainWindow ? this.mainWindow.isMaximized() : false;
    });

    // Desktop HUD IPC handlers
    ipcMain.on('hud-ready', () => {
      console.log('🎯 Desktop HUD ready');
      this.updateHUDStatus('idle', { connected: true });
    });

    ipcMain.on('hud-window-ready', () => {
      console.log('🎯 Desktop HUD window ready');
    });

    ipcMain.handle('hide-overlay', () => {
      if (this.overlayWindow) {
        this.overlayWindow.hide();
      }
    });

    ipcMain.handle('show-overlay', (event, text) => {
      if (this.overlayWindow) {
        this.overlayWindow.webContents.send('update-transcript', text);
        this.overlayWindow.show();
      }
    });
  }

  async fetchRemoteConfigSafe() {
    try {
      const supabaseUrl = process.env.SUPABASE_URL || '';
      if (!supabaseUrl || !this.accessToken) return;
      const url = `${supabaseUrl.replace(/\/$/, '')}/functions/v1/get-config`;
      console.log('Config: fetching remote config from', url);
      const resp = await fetch(url, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${this.accessToken}` }
      });
      if (!resp.ok) {
        const t = await resp.text().catch(() => '');
        console.warn('Config: get-config failed', resp.status, t);
        return;
      }
      const cfg = await resp.json();
      if (cfg && typeof cfg === 'object') {
        if (typeof cfg.model === 'string') {
          this.assistantModel = cfg.model;
          this.store.set('assistantModel', this.assistantModel);
        }
        if (typeof cfg.max_output_tokens === 'number') {
          this.assistantMaxTokens = Math.max(128, Math.min(2048, cfg.max_output_tokens));
          this.store.set('assistantMaxTokens', this.assistantMaxTokens);
        }
        console.log('Config: applied', { model: this.assistantModel, maxTokens: this.assistantMaxTokens });
      }
    } catch (_) {}
  }

  async startRecording() {
    if (this.isRecording) {
      console.log('Already recording, ignoring start request');
      return false;
    }
    if (this.isRecordingDisabled) {
      console.log('🚫 Recording blocked: temporarily disabled (settings page open)');
      return false;
    }
    // Check if we're in local mode (no Supabase URL means local mode)
    const supabaseUrl = process.env.SUPABASE_URL || '';
    const isLocalMode = !supabaseUrl;
    
    if (!isLocalMode && !this.authUser) {
      console.log('🚫 Recording blocked: user not authenticated');
      if (this.mainWindow && !this.mainWindow.isDestroyed()) {
        this.mainWindow.webContents.send('recording-status', false);
      }
      return false;
    }
    
    try {
      console.log('Starting recording...');
      this.isRecording = true;
      this.recordingStartTime = Date.now(); // Track recording start time
      
      await this.audioRecorder.start();
      
      // Duck audio if enabled
      const audioDucking = this.store.get('audioDucking', { enabled: true, duckPercent: 90 });
      if (audioDucking.enabled) {
        await this.volumeManager.duck(audioDucking.duckPercent);
      }
      
      // Overlay disabled
      
      // Send status to main window without bringing it to front
      if (this.mainWindow && !this.mainWindow.isDestroyed()) {
        this.mainWindow.webContents.send('recording-status', true);
      }
      
      // Update desktop HUD to recording mode
      this.updateHUDStatus('recording', { connected: true });
      
      console.log('Recording started successfully');
      return true;
    } catch (error) {
      console.error('Failed to start recording:', error);
      this.isRecording = false;
      
      // Restore volume on error
      await this.volumeManager.restore();
      
      // Send error status to main window
      if (this.mainWindow) {
        this.mainWindow.webContents.send('recording-status', false);
      }
      
      // Update HUD to show disconnected state on error
      this.updateHUDStatus('idle', { connected: false });
      
      return false;
    }
  }

  async stopRecording() {
    if (!this.isRecording) {
      console.log('Not recording, ignoring stop request');
      return false;
    }
    
    try {
      console.log('Stopping recording...');
      this.isRecording = false;
      
      const audioData = await this.audioRecorder.stop();
      
      // Send status to main window without bringing it to front
      if (this.mainWindow && !this.mainWindow.isDestroyed()) {
        this.mainWindow.webContents.send('recording-status', false);
      }
      
      // Update desktop HUD to processing mode
      this.updateHUDStatus('processing', { connected: true });
      
      // Process audio if we have data
      if (audioData && audioData.chunks > 0) {
        console.log('Processing audio data...');
        await this.processAudio(audioData);
      } else {
        console.log('No audio data to process');
        // Hide overlay immediately if no data
        // Overlay disabled
      }
      
      console.log('Recording stopped successfully');
      return true;
    } catch (error) {
      console.error('Failed to stop recording:', error);
      this.isRecording = false;
      
      // Ensure overlay is hidden on error
      if (this.overlayWindow) {
        this.overlayWindow.hide();
      }
      
      // Send error status to main window
      if (this.mainWindow) {
        this.mainWindow.webContents.send('recording-status', false);
      }
      
      return false;
    } finally {
      // Always restore volume when stopping recording
      await this.volumeManager.restore();
    }
  }

  toggleRecording() {
    if (this.isRecording) {
      return this.stopRecording();
    } else {
      return this.startRecording();
    }
  }

  async processAudio(audioData) {
    try {
      // Use the real transcript from speech recognition if available
      let transcript = this.currentTranscript && this.currentTranscript.trim();
      let cleanedOutput = '';
      
      // Fallback to placeholder if no speech recognition result
      if (!transcript) {
        transcript = await this.textProcessor.transcribe(audioData);
      }

      // Remove any blank-audio markers before further processing/display
      const transcriptSansMarkers = stripBlankAudioMarkers(transcript || '');

      if (transcriptSansMarkers && transcriptSansMarkers.trim().length > 0) {
        // Clean up text
        const cleanedText = await this.textProcessor.cleanup(transcriptSansMarkers);
        const cleanedSansMarkers = stripBlankAudioMarkers(cleanedText || '');
        cleanedOutput = cleanedSansMarkers || '';
        
        const tLen = transcriptSansMarkers ? transcriptSansMarkers.length : 0;
        const cLen = cleanedOutput ? cleanedOutput.length : 0;
        console.log(`Transcript processed. originalLength=${tLen}, cleanedLength=${cLen}`);
        
        // Update overlay with final result
        // Overlay disabled
        
        // Send to main window
        if (this.mainWindow && !this.mainWindow.isDestroyed()) {
          this.mainWindow.webContents.send('new-transcript', {
            original: transcriptSansMarkers,
            cleaned: cleanedOutput,
            timestamp: Date.now(),
          });
        }
        
        // Auto-inject if enabled, but only if there is meaningful content after stripping markers
        if (this.store.get('autoInject', true) && cleanedOutput.trim().length > 0) {
          setTimeout(async () => {
            await this.injectText(cleanedOutput);
          }, 100); // Small delay to ensure focus is back to original app
        } else if (cleanedOutput.trim().length === 0) {
          console.log('Skipping injection: transcript contained only blank-audio markers');
        }
        
        // Hide overlay after showing result
        setTimeout(() => {
          if (this.overlayWindow && !this.overlayWindow.isDestroyed()) {
            this.overlayWindow.hide();
          }
        }, 3000);
        
      } else {
        console.log('No transcript generated or transcript was empty');
        // Hide overlay immediately if no transcript
        // Overlay disabled
        cleanedOutput = '';
      }
      
      // Reset current transcript for next recording
      this.currentTranscript = '';
      
      // Update HUD back to idle state
      this.updateHUDStatus('idle', { connected: true });

      // Emit usage event to renderer for Supabase insert
      try {
        const startedAt = new Date(this.recordingStartTime || Date.now());
        const endedAt = new Date();
        const durationMs = Math.max(0, endedAt.getTime() - startedAt.getTime());
        const payload = {
          started_at: startedAt.toISOString(),
          ended_at: endedAt.toISOString(),
          duration_ms: durationMs,
          transcript_chars_original: transcriptSansMarkers ? transcriptSansMarkers.length : 0,
          transcript_chars_cleaned: cleanedOutput ? cleanedOutput.length : 0,
          model: this.store.get('whisperModel'),
          platform: process.platform,
          app_version: app.getVersion ? app.getVersion() : (process.env.APP_VERSION || '0.0.0'),
          metadata: null,
        };
        if (this.mainWindow && !this.mainWindow.isDestroyed()) {
          this.mainWindow.webContents.send('usage:session-completed', payload);
        }
      } catch (e) {
        console.error('Failed to emit usage event:', e);
      }
      
    } catch (error) {
      console.error('Failed to process audio:', error);
      // Hide overlay on error
      // Overlay disabled
      
      // Update HUD back to idle state on error
      this.updateHUDStatus('idle', { connected: true });
    } finally {
      // Privacy: Delete the WAV once processing is complete
      try {
        if (audioData && audioData.path) {
          fs.unlink(audioData.path, () => {});
          // Also remove possible whisper-generated .txt if present
          const txtPath = `${audioData.path}.txt`;
          fs.unlink(txtPath, () => {});
        }
      } catch (_) {}
    }
  }

  async injectText(text) {
    try {
      console.log('🚀 Fast injecting text via clipboard save-restore. length=', text ? text.length : 0);
      
      // Fast method: Save clipboard, paste our text, restore clipboard
      // This is instant and preserves user's clipboard contents
      try {
        const { spawn } = require('child_process');
        
        // Escape text for PowerShell (but simpler since we're using clipboard)
        const escapedText = text.replace(/"/g, '""').replace(/`/g, '``');
        
        // PowerShell script that saves clipboard, injects text, restores clipboard
        const psScript = `
          Add-Type -AssemblyName System.Windows.Forms
          Add-Type -AssemblyName System.Drawing
          
          # Save current clipboard content
          $originalClipboard = $null
          $clipboardFormat = $null
          
          try {
            if ([System.Windows.Forms.Clipboard]::ContainsText()) {
              $originalClipboard = [System.Windows.Forms.Clipboard]::GetText()
              $clipboardFormat = "text"
            }
            elseif ([System.Windows.Forms.Clipboard]::ContainsImage()) {
              $originalClipboard = [System.Windows.Forms.Clipboard]::GetImage()
              $clipboardFormat = "image"
            }
            elseif ([System.Windows.Forms.Clipboard]::ContainsFileDropList()) {
              $originalClipboard = [System.Windows.Forms.Clipboard]::GetFileDropList()
              $clipboardFormat = "files"
            }
          } catch {
            # If clipboard access fails, continue anyway
            $originalClipboard = $null
          }
          
          # Set our text to clipboard
          [System.Windows.Forms.Clipboard]::SetText("${escapedText}")
          
          # Small delay to ensure clipboard is set
          Start-Sleep -Milliseconds 50
          
          # Send Ctrl+V to paste instantly
          [System.Windows.Forms.SendKeys]::SendWait("^v")
          
          # Wait a moment for paste to complete
          Start-Sleep -Milliseconds 100
          
          # Restore original clipboard content
          try {
            if ($originalClipboard -ne $null) {
              switch ($clipboardFormat) {
                "text" { [System.Windows.Forms.Clipboard]::SetText($originalClipboard) }
                "image" { [System.Windows.Forms.Clipboard]::SetImage($originalClipboard) }
                "files" { [System.Windows.Forms.Clipboard]::SetFileDropList($originalClipboard) }
              }
            } else {
              [System.Windows.Forms.Clipboard]::Clear()
            }
          } catch {
            # If restore fails, at least clear our text from clipboard
            [System.Windows.Forms.Clipboard]::Clear()
          }
        `;
        
        // Execute the PowerShell script
        const process = spawn('powershell', ['-Command', psScript], {
          windowsHide: true,
          stdio: 'pipe'
        });
        
        // Handle any errors from PowerShell
        process.on('error', (error) => {
          console.error('PowerShell process error:', error);
          this.showTextNotification(text);
        });
        
        process.on('close', (code) => {
          if (code === 0) {
            console.log('✅ Text injected instantly with clipboard restore');
          } else {
            console.log('⚠️ PowerShell process exited with code:', code);
            this.showTextNotification(text);
          }
        });
        
      } catch (injectError) {
        console.log('Fast injection failed, falling back to notification:', injectError.message);
        this.showTextNotification(text);
      }
      
      return true;
    } catch (error) {
      console.error('Failed to inject text:', error);
      return false;
    }
  }

  showTextNotification(text) {
    // Show the text in the overlay for manual copying if injection fails
    // Overlay disabled
  }

  updateHUDStatus(mode, options = {}) {
    if (this.desktopHUD && !this.desktopHUD.isDestroyed()) {
      const status = {
        mode: mode, // 'idle', 'recording', 'processing'
        connected: options.connected !== false,
        audioLevel: options.audioLevel || 0,
        timestamp: Date.now()
      };
      
      console.log('🎯 Updating HUD status:', status);
      this.desktopHUD.webContents.send('hud-status-update', status);
    }
  }

  // === Assistant recording control ===
  async startAssistantRecording() {
    if (this.isAssistantRecording) return false;
    if (this.isRecordingDisabled) {
      console.log('🚫 Assistant recording blocked: temporarily disabled (settings page open)');
      return false;
    }
    // Check if we're in local mode (no Supabase URL means local mode)
    const supabaseUrl = process.env.SUPABASE_URL || '';
    const isLocalMode = !supabaseUrl;
    
    if (!isLocalMode && !this.authUser) return false;
    try {
      this.isAssistantRecording = true;
      this.recordingStartTime = Date.now();
      const selectedText = await this.captureSelectedTextSafe();
      this.assistantContext = { selectedText: selectedText || '' };
      await this.audioRecorder.start();
      const audioDucking = this.store.get('audioDucking', { enabled: true, duckPercent: 90 });
      if (audioDucking.enabled) await this.volumeManager.duck(audioDucking.duckPercent);
      this.createAssistantWindow();
      if (this.assistantWindow && !this.assistantWindow.isDestroyed()) {
        this.assistantWindow.showInactive();
        this.assistantWindow.webContents.send('assistant:set-minimized', false);
        this.assistantWindow.webContents.send('assistant:stream-start', { status: 'listening', hasSelection: !!selectedText });
      }
      this.updateHUDStatus('assistant-recording', { connected: true });
      return true;
    } catch (e) {
      console.error('Assistant start failed:', e);
      this.isAssistantRecording = false;
      await this.volumeManager.restore();
      return false;
    }
  }

  async stopAssistantRecording() {
    if (!this.isAssistantRecording) return false;
    try {
      this.isAssistantRecording = false;
      const audioData = await this.audioRecorder.stop();
      this.updateHUDStatus('assistant-processing', { connected: true });
      let transcript = this.currentTranscript && this.currentTranscript.trim();
      if (!transcript) transcript = await this.textProcessor.transcribe(audioData);
      const sanitized = stripBlankAudioMarkers(transcript || '');
      if (sanitized && sanitized.trim().length > 0) {
        await handleAssistantQuery.call(this, sanitized, this.assistantContext || {});
      } else {
        console.log('Assistant: skipping AI call due to blank-audio-only transcript');
      }
      this.updateHUDStatus('idle', { connected: true });
      return true;
    } catch (e) {
      console.error('Assistant stop failed:', e);
      return false;
    } finally {
      await this.volumeManager.restore();
      this.currentTranscript = '';
    }
  }

  async captureSelectedTextSafe() {
    try {
      const { spawn } = require('child_process');
      const psScript = `
        Add-Type -AssemblyName System.Windows.Forms
        Add-Type -AssemblyName System.Drawing
        $originalClipboard = $null
        $clipboardFormat = $null
        try {
          if ([System.Windows.Forms.Clipboard]::ContainsText()) { $originalClipboard = [System.Windows.Forms.Clipboard]::GetText(); $clipboardFormat = "text" }
          elseif ([System.Windows.Forms.Clipboard]::ContainsImage()) { $originalClipboard = [System.Windows.Forms.Clipboard]::GetImage(); $clipboardFormat = "image" }
          elseif ([System.Windows.Forms.Clipboard]::ContainsFileDropList()) { $originalClipboard = [System.Windows.Forms.Clipboard]::GetFileDropList(); $clipboardFormat = "files" }
        } catch {}
        [System.Windows.Forms.SendKeys]::SendWait("^c")
        Start-Sleep -Milliseconds 120
        $text = ""
        try { if ([System.Windows.Forms.Clipboard]::ContainsText()) { $text = [System.Windows.Forms.Clipboard]::GetText() } } catch {}
        try {
          if ($originalClipboard -ne $null) {
            switch ($clipboardFormat) { "text" { [System.Windows.Forms.Clipboard]::SetText($originalClipboard) } "image" { [System.Windows.Forms.Clipboard]::SetImage($originalClipboard) } "files" { [System.Windows.Forms.Clipboard]::SetFileDropList($originalClipboard) } }
          } else { [System.Windows.Forms.Clipboard]::Clear() }
        } catch {}
        Write-Output $text
      `;
      return await new Promise((resolve) => {
        const proc = spawn('powershell', ['-Command', psScript], { windowsHide: true });
        let out = '';
        proc.stdout.on('data', (d) => out += d.toString('utf8'));
        proc.on('close', () => resolve(out.trim()));
        proc.on('error', () => resolve(''));
      });
    } catch (e) {
      console.error('captureSelectedTextSafe error:', e);
      return '';
    }
  }

  async init() {
    await this.createMainWindow();
    // Overlay window disabled per request (HUD only)
    // this.createOverlayWindow();
    this.createDesktopHUD();
    this.createAssistantWindow();
    this.setupGlobalHotkey();
    this.setupAssistantHotkey();
    
    // Initialize audio recorder and text processor
    await this.audioRecorder.init();
    await this.textProcessor.init();
    
    // Pass the store instance to text processor to ensure shared data
    this.textProcessor.setStore(this.store);
    
    // Set main window reference for audio recorder
    this.audioRecorder.setMainWindow(this.mainWindow);
    
    // Set up speech recognition event handlers
    this.setupSpeechRecognitionHandlers();
    
    // Show the main window
    if (this.mainWindow) {
      this.mainWindow.show();
      this.mainWindow.focus();
    }

    // On startup, if already authenticated, fetch remote config
    this.fetchRemoteConfigSafe();
  }

  setupSpeechRecognitionHandlers() {
    this.currentTranscript = '';
    
    // Listen for speech recognition results from the audio recorder
      this.audioRecorder.on('speechRecognitionResult', (result) => {
      const len = result && result.text ? result.text.length : 0;
      console.log('🎯 MAIN PROCESS received speech recognition result. final=', !!result.isFinal, 'length=', len);
      
      // Update overlay with live transcription
      if (this.overlayWindow && !this.overlayWindow.isDestroyed()) {
        this.overlayWindow.webContents.send('update-transcript', result.text);
        if (!this.overlayWindow.isVisible()) {
          this.overlayWindow.showInactive();
        }
      }
      
      // Store the final transcript
        if (result.isFinal) {
        this.currentTranscript = result.text;
        console.log('🎉 Final transcript stored in main process. length=', this.currentTranscript ? this.currentTranscript.length : 0);
      }
    });
  }

  cleanup() {
    try { globalShortcut.unregisterAll(); } catch (_) {}
    try { this.audioRecorder && this.audioRecorder.cleanup && this.audioRecorder.cleanup(); } catch (_) {}
    // Restore volume on app exit
    try { this.volumeManager && this.volumeManager.restore && this.volumeManager.restore(); } catch (_) {}
    // Destroy windows to ensure full process exit
    try { this.desktopHUD && !this.desktopHUD.isDestroyed() && this.desktopHUD.destroy(); } catch (_) {}
    try { this.assistantWindow && !this.assistantWindow.isDestroyed() && this.assistantWindow.destroy(); } catch (_) {}
    try { this.overlayWindow && !this.overlayWindow.isDestroyed() && this.overlayWindow.destroy(); } catch (_) {}
    try { this.mainWindow && !this.mainWindow.isDestroyed() && this.mainWindow.destroy(); } catch (_) {}
  }
}

// App event handlers
app.whenReady().then(async () => {
  const voiceAssistant = new VoiceAssistant();
  await voiceAssistant.init();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      voiceAssistant.createMainWindow();
    }
  });

  app.on('before-quit', () => {
    app.quitting = true;
    voiceAssistant.cleanup();
  });
});

app.on('window-all-closed', () => {
  // Fully quit the app regardless of platform when all windows are closed
  try { app.quitting = true; } catch (_) {}
  try { app.quit(); } catch (_) { app.exit(0); }
});

app.on('will-quit', () => {
  try { globalShortcut.unregisterAll(); } catch (_) {}
}); 