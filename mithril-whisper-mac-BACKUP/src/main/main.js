const { app, BrowserWindow, globalShortcut, ipcMain, clipboard, systemPreferences, dialog, session } = require('electron');
const path = require('path');
const fs = require('fs');
const Store = require('electron-store');
const AudioRecorder = require('./audio-recorder');
const TextProcessor = require('./text-processor');
const VolumeManager = require('./volume-manager');

// Simple file logger for packaged builds
let __logStream = null;
function initFileLogger() {
  try {
    const userData = app.getPath('userData');
    const logDir = path.join(userData, 'logs');
    try { fs.mkdirSync(logDir, { recursive: true }); } catch (_) {}
    const logPath = path.join(logDir, 'main.log');
    __logStream = fs.createWriteStream(logPath, { flags: 'a' });
    const write = (level, args) => {
      try {
        const ts = new Date().toISOString();
        const line = `[${ts}] [${level}] ${args.map(a => {
          try { return typeof a === 'string' ? a : JSON.stringify(a); } catch (_) { return String(a); }
        }).join(' ')}\n`;
        __logStream.write(line);
      } catch (_) {}
    };
    const orig = { log: console.log, warn: console.warn, error: console.error };
    console.log = (...args) => { try { orig.log.apply(console, args); } catch (_) {}; write('INFO', args); };
    console.warn = (...args) => { try { orig.warn.apply(console, args); } catch (_) {}; write('WARN', args); };
    console.error = (...args) => { try { orig.error.apply(console, args); } catch (_) {}; write('ERROR', args); };
    console.log('File logger initialized at', logPath);
    process.on('uncaughtException', (e) => { console.error('uncaughtException', e && e.stack ? e.stack : e); });
    process.on('unhandledRejection', (e) => { console.error('unhandledRejection', e && e.stack ? e.stack : e); });
  } catch (e) {
    // ignore
  }
}

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
// --- macOS helpers (top-level) ---
async function getFrontmostAppName() {
  try {
    const { spawnSync } = require('child_process');
    const res = spawnSync('osascript', ['-e', 'tell application "System Events" to get name of first application process whose frontmost is true']);
    if (res.status === 0) return String(res.stdout || '').trim();
  } catch (_) {}
  return '';
}

async function getFrontmostAppBundleId() {
  try {
    const name = await getFrontmostAppName();
    if (!name) return '';
    const { spawnSync } = require('child_process');
    const res = spawnSync('osascript', ['-e', `id of application "${name.replace(/"/g, '\\"')}"`]);
    if (res.status === 0) return String(res.stdout || '').trim();
  } catch (_) {}
  return '';
}

// Environment detection for dual-mode system
function getAssistantMode() {
  const hasSupabase = !!(process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY);
  const hasOpenAI = !!process.env.OPENAI_API_KEY;
  
  if (hasSupabase) {
    return { mode: 'production', requiresAuth: true };
  } else if (hasOpenAI) {
    return { mode: 'local', requiresAuth: false };
  } else {
    return { mode: 'disabled', requiresAuth: false };
  }
}

// Direct OpenAI API call for local development mode
async function callOpenAIDirectly(systemPrompt, userPrompt, model = 'gpt-4o-mini', maxTokens = 4000) {
  const openaiKey = process.env.OPENAI_API_KEY;
  if (!openaiKey) {
    throw new Error('OpenAI API key not found in environment');
  }

  console.log('🏠 Local mode: Calling OpenAI API directly');
  
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openaiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: model,
      stream: true,
      max_tokens: maxTokens,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.7
    })
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`OpenAI API error ${response.status}: ${text}`);
  }

  return response;
}

async function handleAssistantQuery(userPrompt, context) {
  try {
    const { mode, requiresAuth } = getAssistantMode();
    
    // Handle different modes
    if (mode === 'disabled') {
      if (this.assistantWindow) {
        this.assistantWindow.webContents.send('assistant:error', 'Assistant disabled: No API keys configured. Add OPENAI_API_KEY to .env for local mode.');
      }
      return;
    }
    
    // Production mode: requires Supabase authentication
    if (mode === 'production') {
      const supabaseUrl = process.env.SUPABASE_URL || '';
      const jwt = this.accessToken || '';
      if (!supabaseUrl || !jwt) {
        if (this.assistantWindow) {
          this.assistantWindow.webContents.send('assistant:error', 'Not authenticated or missing Supabase URL');
        }
        return;
      }
    }
    
    // Local mode: no authentication required, just OpenAI key
    console.log(`🔧 Assistant mode: ${mode} (auth required: ${requiresAuth})`)
    const selection = (context && context.selectedText) ? String(context.selectedText) : '';
    let defaultAction = 'summarize';
    const lower = userPrompt.toLowerCase();
    
    // Enhanced intent detection for three actions
    if (selection && /(replace|change|modify|rewrite|refactor|fix|implement|update|apply|edit|improve)/.test(lower)) {
      defaultAction = 'replace';
    } else if (
      // Strong generation keywords
      /(output|generate|create|write|build|make|produce|print|display|code|function|class|component|method|script|file|document|app|game|website|page)/.test(lower) ||
      // Programming language keywords  
      /(html|css|javascript|python|java|cpp|sql|json|xml|yaml|markdown|react|vue|angular)/.test(lower) ||
      // Generation phrases
      /^(show me|give me|provide|write me|make me|create me|generate me) (a|an|the|some)/.test(lower) ||
      /(write|create|make|generate|build|produce) (a|an|the|some|my)/.test(lower) ||
      // Direct requests for content
      /^(create|write|make|generate|build|produce|code|develop)/.test(lower)
    ) {
      // More precise: only inject for clear output/generation requests
      // Avoid conversational queries like questions, explanations, etc.
      if (!/^(tell me|explain|what|how|why|describe|define|summarize|can you|could you|would you|will you|do you|are you|is there|where|when|who|help me understand|walk me through)/.test(lower) &&
          !/\?$/.test(userPrompt.trim()) &&
          !/(explain|description|tutorial|guide|help|learn|understand|meaning|definition)/.test(lower)) {
        defaultAction = 'inject';
      }
    }
    
    const systemPrompt = [
      'You are a coding assistant that responds based on detected user intent.',
      '',
      'RESPONSE RULES:',
      `INTENT DETECTED: ${defaultAction.toUpperCase()}`,
      '',
      defaultAction === 'inject' || defaultAction === 'replace' ? [
        '🔧 OUTPUT MODE: PURE CONTENT ONLY',
        ' - Output ONLY the requested content, nothing else',
        ' - No explanations, instructions, or conversational text',
        ' - No "Save this as..." or "Run with..." comments',
        ' - No backticks unless part of the actual content',
        ' - Content should be ready to paste/inject directly'
      ].join('\n') : [
        '💬 CONVERSATION MODE: HELPFUL EXPLANATION',
        ' - Provide helpful conversational responses',
        ' - Include explanations and context as needed',
        ' - Use normal conversational tone'
      ].join('\n'),
      '',
      'EXAMPLES:',
      ' - "create a Python game" → [Pure Python code only]',
      ' - "generate HTML form" → [Pure HTML only]', 
      ' - "replace this function" → [Pure improved code only]',
      ' - "explain this code" → [Conversational explanation]',
      ' - "what is recursion?" → [Conversational educational response]',
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

    const model = this.assistantModel || (mode === 'production' ? 'o4-mini' : 'gpt-4o-mini');
    const maxTokens = this.assistantMaxTokens || 800;

    let response;
    
    if (mode === 'production') {
      // Production mode: Use Supabase Edge Function
      const supabaseUrl = process.env.SUPABASE_URL;
      const jwt = this.accessToken;
      const assistantUrl = `${supabaseUrl.replace(/\/$/, '')}/functions/v1/assistant`;
      console.log('🚀 Production mode: calling', assistantUrl, 'model=', model, 'maxTokens=', maxTokens);
      
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
    } else {
      // Local mode: Call OpenAI API directly  
      console.log('🏠 Local mode: calling OpenAI directly, model=', model, 'maxTokens=', maxTokens);
      const fullSystemPrompt = systemPrompt + (selectionSnippet ? `\n\nSELECTION:\n${selectionSnippet}` : '');
      response = await callOpenAIDirectly(fullSystemPrompt, sanitizedUserPrompt, model, maxTokens);
    }

    if (!response.ok || !response.body) {
      const text = await (response.text ? response.text() : Promise.resolve(''));
      throw new Error(`OpenAI response error ${response.status}: ${text}`);
    }

    let buffer = '';
    // Use intent detection instead of parsing AI response for actions
    const decidedAction = defaultAction;
    const sendToken = (text) => {
      if (this.assistantWindow && !this.assistantWindow.isDestroyed()) {
        this.assistantWindow.webContents.send('assistant:stream-token', text);
      }
    };
      const finalize = async () => {
      // No need to strip ACTION prefix since we don't use it anymore
      let finalText = buffer;
      if (this.assistantWindow && !this.assistantWindow.isDestroyed()) {
        this.assistantWindow.webContents.send('assistant:stream-end', { action: decidedAction, text: finalText });
      }
        
        // Handle injection logic for different actions
        const allowAssistantInject = this.store.get('assistantInjectOnReplace', false);
        
        if (decidedAction === 'inject') {
          // Always inject when user explicitly asks for output generation
          console.log('🎯 Assistant: Injecting generated content');
          await this.injectText(finalText);
        } else if (decidedAction === 'replace' && selection && allowAssistantInject) {
          // Only inject replacement if setting is enabled
          console.log('🎯 Assistant: Injecting replacement content');
          await this.injectText(finalText);
        }
        // summarize action stays in chat only
        
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
          
          // Process streaming response differently based on mode
          if (mode === 'production') {
            // Supabase Edge Function format (OpenAI Realtime API format)
            console.log('🔍 Production chunk received:', chunk);
            chunk.split(/\n\n/).forEach((block) => {
              const trimmed = block.trim();
              if (!trimmed) return;
              console.log('🔍 Processing block:', trimmed);
              const lines = trimmed.split(/\n/);
              const eventLine = lines.find(l => l.startsWith('event:'));
              if (eventLine) {
                lastEvent = eventLine.replace(/^event:\s*/, '');
                console.log('🔍 Event:', lastEvent);
              }
              const dataLine = lines.find(l => l.startsWith('data:'));
              if (!dataLine) return;
              const data = dataLine.replace(/^data:\s*/, '');
              if (data === '[DONE]') return;
              console.log('🔍 Data:', data);
              try {
                const json = JSON.parse(data);
                console.log('🔍 Parsed JSON:', json);
                let delta = '';
                if (json.type === 'response.output_text.delta' && typeof json.delta === 'string') delta = json.delta;
                else if (lastEvent === 'response.output_text.delta' && typeof json.delta === 'string') delta = json.delta;
                else if (json.content_part && json.content_part.text) delta = json.content_part.text;
                else if (json.delta && typeof json.delta === 'string') delta = json.delta;
                if (delta) {
                  console.log('🔍 Sending delta:', delta);
                  buffer += delta;
                  if (buffer.length < 200) tryDecide();
                  sendToken(delta);
                }
              } catch (e) {
                console.log('🔍 JSON parse error:', e.message, 'for data:', data);
              }
            });
          } else {
            // Standard OpenAI Chat Completions streaming format
            chunk.split(/\n/).forEach((line) => {
              const trimmed = line.trim();
              if (!trimmed || !trimmed.startsWith('data: ')) return;
              const data = trimmed.replace(/^data:\s*/, '');
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
            });
          }
        }
      } else {
        await new Promise((resolve, reject) => {
          let lastEvent = '';
          response.body.on('data', (value) => {
            const chunk = value.toString('utf8');
            
            if (mode === 'production') {
              // Supabase Edge Function format
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
            } else {
              // Standard OpenAI streaming format
              chunk.split(/\n/).forEach((line) => {
                const trimmed = line.trim();
                if (!trimmed || !trimmed.startsWith('data: ')) return;
                const data = trimmed.replace(/^data:\s*/, '');
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
              });
            }
          });
          response.body.on('end', resolve);
          response.body.on('error', reject);
        });
      }
    } else {
      const full = await response.json();
      let content = '';
      if (mode === 'production') {
        // Supabase format
        if (Array.isArray(full.output_text)) content = full.output_text.join('');
        else if (typeof full.output_text === 'string') content = full.output_text;
      } else {
        // OpenAI format
        content = full.choices?.[0]?.message?.content || '';
      }
      buffer = content || '';
      tryDecide();
      if (buffer) sendToken(buffer);
    }
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
    this.hotkey = this.store.get('hotkey', 'Cmd+Q');
    this.assistantHotkey = this.store.get('assistantHotkey', 'Cmd+W');
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
      frame: true, // Use native frame on macOS
      titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'hidden', // macOS-specific title bar
      backgroundColor: '#000814', // Match our background color
      title: 'MITHRIL WHISPER',
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
        enableRemoteModule: true,
        webSecurity: false, // Allow microphone access in development
      },
      show: false,
      icon: path.join(__dirname, '../../logo1.ico'),
      // macOS-specific window appearance
      ...(process.platform === 'darwin' && {
        trafficLightPosition: { x: 20, y: 18 }, // Position native controls
        transparent: false,
        vibrancy: 'dark',
      }),
    });

    if (isDev) {
      const devPort = Number(process.env.DEV_SERVER_PORT || 37843);
      this.mainWindow.loadURL(`http://localhost:${devPort}`);
      this.mainWindow.webContents.openDevTools();
    } else {
      try {
        this.mainWindow.loadFile(resolveRendererFile('index.html'));
      } catch (e) {
        console.error('Failed to load index.html, falling back to app:// path', e);
        try {
          const appPath = app.getAppPath();
          const fallback = path.join(appPath, 'build', 'renderer', 'index.html');
          this.mainWindow.loadFile(fallback);
        } catch (_) {}
      }
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
    try { this.overlayWindow.loadFile(overlayPath); } catch (e) { console.error('overlay load failed', e); }
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
      try { this.desktopHUD.loadFile(hudPath); } catch (e) { console.error('hud load failed', e); }
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
        try { this.assistantWindow.loadFile(resolveRendererFile('assistant-chat.html')); } catch (e) { console.error('assistant load failed', e); }
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
      // Fix common format issues for Mac
      hotkey = hotkey.replace('Control+', 'Ctrl+').replace('CmdOrCtrl+', 'Cmd+');
      
      // If format is still invalid or incomplete, reset to default
      const validHotkey = hotkey.match(/^(Ctrl|Alt|Shift|Cmd|CmdOrCtrl)\+\w+$/) || hotkey.match(/^F\d+$/);
      if (!validHotkey || hotkey.endsWith('+')) {
        console.log(`🔧 Invalid or incomplete hotkey "${this.hotkey}" → resetting to Cmd+Q`);
        hotkey = 'Cmd+Q';
        this.hotkey = hotkey;
        this.store.set('hotkey', hotkey);
      }
    } else {
      hotkey = 'Cmd+Q';
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
        hotkey = 'Cmd+Q';
        this.hotkey = hotkey;
        this.store.set('hotkey', hotkey);
        try {
          success = globalShortcut.register(hotkey, async () => {
            // Simple fallback hotkey handler
            console.log('🎯 Fallback hotkey triggered');
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

    let hotkey = this.assistantHotkey || 'Cmd+W';
    
    // Warn about potentially problematic hotkeys
    if (hotkey === 'CmdOrCtrl+s' || hotkey === 'Ctrl+s' || hotkey === 'Cmd+s') {
      console.warn('⚠️ Assistant hotkey conflicts with system Save shortcut. Consider using Cmd+W or Alt+A instead.');
    }
    
    if (!/^F\d+$/.test(hotkey) && !/^(Ctrl|Alt|Shift|Cmd|CmdOrCtrl)\+\w+$/.test(hotkey)) {
      console.log('🔧 Invalid assistant hotkey format, defaulting to Cmd+W');
      hotkey = 'Cmd+W';
      this.assistantHotkey = hotkey;
      this.store.set('assistantHotkey', hotkey);
    }

    console.log(`🎯 Setting up assistant hotkey: ${hotkey}`);
    let lastHotkeyTime = 0;
    let isProcessing = false;
    const quickDebounceTime = 150; // Short debounce for rapid double-presses
    
    let success = false;
    try {
      success = globalShortcut.register(hotkey, async () => {
        const now = Date.now();
        const timeSinceLastHotkey = now - lastHotkeyTime;
        const currentState = this.isAssistantRecording;
        
        // Smart debouncing: Allow quick stop actions, prevent only rapid duplicates
        if (timeSinceLastHotkey < quickDebounceTime && !currentState) {
          // Only debounce start actions (not stop actions)
          console.log(`🚫 Debounced assistant start: ignoring press (${timeSinceLastHotkey}ms ago)`);
          return;
        }
        
        // Don't block stop actions - only block if another operation is actively running
        if (isProcessing && timeSinceLastHotkey < quickDebounceTime) {
          console.log('🚫 Assistant hotkey: operation already in progress');
          return;
        }
        
        // Block regular recording but allow assistant operations
        if (this.isRecording && !currentState) {
          console.log('🚫 Assistant hotkey ignored - regular recording in progress');
          return;
        }
        
        lastHotkeyTime = now;
        isProcessing = true;
        
        try {
          console.log('🎯 Assistant hotkey pressed. isAssistantRecording:', currentState);
          
          if (currentState) {
            console.log('🛑 Assistant: stopping recording');
            const result = await this.stopAssistantRecording();
            console.log('🛑 Assistant: stop result:', result);
          } else {
            console.log('🎙️ Assistant: starting recording');
            const result = await this.startAssistantRecording();
            console.log('🎙️ Assistant: start result:', result);
          }
        } catch (err) {
          console.error('Assistant hotkey error:', err);
        } finally {
          // Quick reset for responsive UX
          setTimeout(() => {
            isProcessing = false;
          }, 50); // Much shorter delay
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

      const preferredDefault = availableModels.find(m => m.startsWith('base-q5_1')) || availableModels.find(m => m.startsWith('base')) || availableModels.find(m => m.startsWith('tiny')) || availableModels[0] || 'base-q5_1';
      const storedModel = this.store.get('whisperModel');
      const effectiveModel = storedModel && availableModels.includes(storedModel) ? storedModel : preferredDefault;

      // If store had nothing or invalid, persist the effective model so subsequent calls are stable
      if (!storedModel || storedModel !== effectiveModel) {
        this.store.set('whisperModel', effectiveModel);
      }

      return {
        hotkey: this.store.get('hotkey', 'Cmd+Q'),
        assistantHotkey: this.store.get('assistantHotkey', 'Cmd+W'),
        assistantInjectOnReplace: this.store.get('assistantInjectOnReplace', false),
        model: this.store.get('model', effectiveModel),
        sensitivity: this.store.get('sensitivity', 0.5),
        cleanup: this.store.get('cleanup', true),
        autoInject: this.store.get('autoInject', true),
        injectionMode: this.store.get('injectionMode', 'auto'),
        openaiApiKey: '',
        useLocalWhisper: true,
        whisperModel: effectiveModel,
        whisperLanguage: this.store.get('whisperLanguage', 'auto'),
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
      
      // Update hotkey if changed - properly unregister old hotkey first
      if (settings.hotkey !== this.hotkey) {
        const oldHotkey = this.hotkey;
        console.log(`🔄 Hotkey change: "${oldHotkey}" → "${settings.hotkey}"`);
        
        // Unregister the OLD hotkey before setting the new one
        try { 
          if (oldHotkey) {
            globalShortcut.unregister(oldHotkey);
            console.log(`🗑️ Unregistered old hotkey: ${oldHotkey}`);
          }
        } catch (e) {
          console.warn('Failed to unregister old hotkey:', e.message);
        }
        
        // Now update to the new hotkey and register it
        this.hotkey = settings.hotkey;
        this.setupGlobalHotkey();
      }
      
      if (settings.assistantHotkey && settings.assistantHotkey !== this.assistantHotkey) {
        const oldAssistantHotkey = this.assistantHotkey;
        console.log(`🔄 Assistant hotkey change: "${oldAssistantHotkey}" → "${settings.assistantHotkey}"`);
        
        // Unregister the OLD assistant hotkey before setting the new one
        try { 
          if (oldAssistantHotkey) {
            globalShortcut.unregister(oldAssistantHotkey);
            console.log(`🗑️ Unregistered old assistant hotkey: ${oldAssistantHotkey}`);
          }
        } catch (e) {
          console.warn('Failed to unregister old assistant hotkey:', e.message);
        }
        
        // Now update to the new hotkey and register it
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

      // Update Whisper language settings
      if (settings.whisperLanguage !== undefined) {
        this.store.set('whisperLanguage', settings.whisperLanguage);
        if (this.textProcessor && this.textProcessor.whisperLocal) {
          this.textProcessor.whisperLocal.setLanguage(settings.whisperLanguage);
        }
      }

      // Update Whisper model if changed
      if (settings.whisperModel && settings.whisperModel !== this.store.get('whisperModel')) {
        this.store.set('whisperModel', settings.whisperModel);
        if (this.textProcessor && this.textProcessor.whisperLocal) {
          this.textProcessor.whisperLocal.setModel(settings.whisperModel);
        }
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

    // Audio ducking test for debugging
    ipcMain.handle('test-audio-ducking', async () => {
      try {
        console.log('🎵 IPC: Testing audio ducking...');
        const result = await this.volumeManager.testDucking();
        return { success: result, message: result ? 'Audio ducking test passed' : 'Audio ducking test failed' };
      } catch (error) {
        console.error('🎵 IPC: Audio ducking test error:', error);
        return { success: false, message: error.message };
      }
    });

    // Direct AppleScript test to trigger permission request
    ipcMain.handle('test-applescript-permission', async () => {
      const { spawnSync } = require('child_process');
      try {
        console.log('🎵 Testing AppleScript permission directly...');
        const result = spawnSync('osascript', ['-e', 'output volume of (get volume settings)'], {
          timeout: 5000,
          encoding: 'utf8'
        });
        
        console.log('🎵 AppleScript result:', { 
          status: result.status, 
          stdout: result.stdout, 
          stderr: result.stderr 
        });
        
        if (result.status === 0 && result.stdout) {
          const volume = parseInt(result.stdout.trim());
          return { 
            success: true, 
            message: `✅ AppleScript permission granted! Current volume: ${volume}%`,
            volume 
          };
        } else {
          return { 
            success: false, 
            message: `❌ AppleScript permission denied or error. Status: ${result.status}, Error: ${result.stderr}`,
            error: result.stderr 
          };
        }
      } catch (error) {
        console.error('🎵 AppleScript test error:', error);
        return { 
          success: false, 
          message: `❌ AppleScript test failed: ${error.message}`,
          error: error.message 
        };
      }
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
    if (!this.authUser) {
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
      // Remember frontmost app on macOS so we can target paste reliably
      if (process.platform === 'darwin') {
        try {
          this.frontAppId = await getFrontmostAppBundleId();
          if (!this.frontAppId) this.frontAppName = await getFrontmostAppName();
        } catch (_) {}
      }
      
      await this.audioRecorder.start();
      
      // Duck audio if enabled
      const audioDucking = this.store.get('audioDucking', { enabled: true, duckPercent: 90 });
      console.log(`🎵 Audio ducking settings: enabled=${audioDucking.enabled}, duckPercent=${audioDucking.duckPercent}`);
      console.log('🎵 VolumeManager available:', !!this.volumeManager);
      console.log('🎵 VolumeManager isAvailable:', this.volumeManager ? this.volumeManager.isAvailable : 'N/A');
      
      if (audioDucking.enabled) {
        console.log('🎵 Attempting to duck background audio during recording...');
        if (!this.volumeManager) {
          console.error('🎵 ERROR: VolumeManager is not initialized!');
        } else {
          console.log('🎵 Current volume before ducking:', this.volumeManager.getCurrentVolume());
          const duckSuccess = await this.volumeManager.duck(audioDucking.duckPercent);
          console.log(`🎵 Audio ducking result: ${duckSuccess ? 'SUCCESS' : 'FAILED'}`);
          console.log('🎵 Current volume after ducking:', this.volumeManager.getCurrentVolume());
        }
      } else {
        console.log('🎵 Audio ducking disabled in settings');
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
      if (!audioData || !audioData.buffer || audioData.buffer.length < 1024) {
        console.warn('StopRecording: captured audio too small or missing. audioData=', audioData ? {
          path: audioData.path,
          chunks: audioData.chunks,
          sampleRate: audioData.sampleRate,
          bufferLength: audioData.buffer ? audioData.buffer.length : 0,
        } : null);
      }
      
      // Send status to main window without bringing it to front
      if (this.mainWindow && !this.mainWindow.isDestroyed()) {
        this.mainWindow.webContents.send('recording-status', false);
      }
      
      // Update desktop HUD to processing mode
      this.updateHUDStatus('processing', { connected: true });
      
      // Process audio even if small (whisper will return no-speech)
      if (audioData && audioData.buffer && audioData.buffer.length > 0) {
        console.log('Processing audio data...');
        await this.processAudio(audioData);
      } else {
        console.log('No audio data to process (file too small or empty)');
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
      console.log('🎵 Attempting to restore background audio volume after recording...');
      const restoreSuccess = await this.volumeManager.restore();
      console.log(`🎵 Volume restoration result: ${restoreSuccess ? 'SUCCESS' : 'FAILED'}`);
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
      // Prefer robust local Whisper transcription over Web Speech API
      let cleanedOutput = '';
      const webSpeechTranscript = (this.currentTranscript && this.currentTranscript.trim()) || '';
      let whisperTranscript = '';
      try {
        whisperTranscript = await this.textProcessor.transcribe(audioData) || '';
      } catch (e) {
        console.error('Whisper transcription failed:', e);
      }

      // Choose the most meaningful transcript
      const wordCount = (s) => (s || '').trim().split(/\s+/).filter(Boolean).length;
      let transcript = '';
      if (whisperTranscript && (wordCount(whisperTranscript) >= 3 || wordCount(whisperTranscript) >= wordCount(webSpeechTranscript))) {
        transcript = whisperTranscript;
      } else {
        transcript = webSpeechTranscript || whisperTranscript;
      }
      console.log('Transcript choice:', {
        webSpeechLen: webSpeechTranscript.length,
        webSpeechWords: wordCount(webSpeechTranscript),
        whisperLen: whisperTranscript.length,
        whisperWords: wordCount(whisperTranscript),
        chosenLen: (transcript || '').length,
      });

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

      const { spawn } = require('child_process');

      if (process.platform === 'win32') {
        // Existing Windows PowerShell flow
        const escapedText = text.replace(/"/g, '""').replace(/`/g, '``');
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
          [System.Windows.Forms.Clipboard]::SetText("${escapedText}")
          Start-Sleep -Milliseconds 50
          [System.Windows.Forms.SendKeys]::SendWait("^v")
          Start-Sleep -Milliseconds 100
          try {
            if ($originalClipboard -ne $null) {
              switch ($clipboardFormat) { "text" { [System.Windows.Forms.Clipboard]::SetText($originalClipboard) } "image" { [System.Windows.Forms.Clipboard]::SetImage($originalClipboard) } "files" { [System.Windows.Forms.Clipboard]::SetFileDropList($originalClipboard) } }
            } else { [System.Windows.Forms.Clipboard]::Clear() }
          } catch { [System.Windows.Forms.Clipboard]::Clear() }
        `;
        const proc = spawn('powershell', ['-Command', psScript], { windowsHide: true, stdio: 'pipe' });
        proc.on('error', (e) => { console.error('PowerShell error:', e); this.showTextNotification(text); });
        proc.on('close', (code) => { if (code !== 0) this.showTextNotification(text); });
        return true;
      }

      if (process.platform === 'darwin') {
        // macOS: Mac-native text injection using CGEventPost (no Accessibility permissions needed)
        const mode = (this.store && this.store.get('injectionMode')) || 'auto';
        const original = clipboard.readText();
        clipboard.writeText(text || '');
        const restore = () => { try { if (original) clipboard.writeText(original); else clipboard.clear(); } catch (_) {} };

        if (mode === 'copy-only') {
          console.log('macOS inject: copy-only mode.');
          return true;
        }

        // Do NOT bring our windows to front; avoid stealing focus
        try { this.assistantWindow && this.assistantWindow.hide && this.assistantWindow.hide(); } catch (_) {}
        // Keep main window hidden during paste to prevent focus changes

        // Use our native key-injector (CGEventPost) instead of osascript
        // In development, fall back to osascript since key-injector is only in production builds
        const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;
        
        if (isDev) {
          console.log('🎯 Development mode: using osascript fallback');
          const osaScript = `tell application "System Events" to keystroke "v" using command down`;
          const osa = spawn('osascript', ['-e', osaScript]);
          await new Promise((resolve) => setTimeout(resolve, 50));
          await new Promise((resolve) => osa.on('close', resolve));
        } else {
          const keyInjectorPath = path.join(process.resourcesPath, 'key-injector');
          console.log('🎯 Production mode: using native key injector:', keyInjectorPath);
          
          const keyInjector = spawn(keyInjectorPath, ['paste']);
          await new Promise((resolve) => setTimeout(resolve, 50));
          await new Promise((resolve) => keyInjector.on('close', resolve));
        }
        
        // Give paste time to complete before restoring clipboard to avoid truncation
        await new Promise((resolve) => setTimeout(resolve, 400));
        restore();
        return true;
      }

      // Other platforms: fallback notification
      this.showTextNotification(text);
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
    if (!this.authUser) return false;
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
    if (!this.isAssistantRecording) {
      console.log('🚫 stopAssistantRecording called but not recording');
      return false;
    }
    try {
      console.log('🛑 Stopping assistant recording, setting state to false');
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
      console.log('✅ Assistant recording stopped successfully');
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
      if (process.platform === 'win32') {
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
      }

      if (process.platform === 'darwin') {
        const original = clipboard.readText();
        return await new Promise((resolve) => {
          const osa = spawn('osascript', ['-e', 'tell application "System Events" to keystroke "c" using command down']);
          let done = false;
          osa.on('close', async () => {
            setTimeout(() => {
              try {
                const text = clipboard.readText();
                if (original) clipboard.writeText(original); else clipboard.clear();
                resolve((text || '').trim());
              } catch (_) { resolve(''); }
            }, 120);
          });
          osa.on('error', () => { try { if (original) clipboard.writeText(original); } catch (_) {} ; if (!done) resolve(''); });
        });
      }

      return '';
    } catch (e) {
      console.error('captureSelectedTextSafe error:', e);
      return '';
    }
  }

  async init() {
    await this.createMainWindow();
    // Show the main window as early as possible
    try { this.mainWindow && this.mainWindow.show(); } catch (_) {}
    try { this.mainWindow && this.mainWindow.focus(); } catch (_) {}

    // Overlay window disabled per request (HUD only)
    // this.createOverlayWindow();
    this.createDesktopHUD();
    this.setupGlobalHotkey();
    this.setupAssistantHotkey();
    
    // Initialize audio recorder and text processor
    try { await this.audioRecorder.init(); } catch (e) { console.error('audioRecorder.init failed', e); }
    
    // Pass the store instance to text processor BEFORE init so model/settings are respected
    try { this.textProcessor.setStore(this.store); } catch (_) {}
    try { await this.textProcessor.init(); } catch (e) { console.error('textProcessor.init failed', e); }
    
    // Initialize Whisper language settings
    try {
      if (this.textProcessor.whisperLocal) {
        const language = this.store.get('whisperLanguage', 'auto');
        this.textProcessor.whisperLocal.setLanguage(language);
        console.log(`🌐 Whisper language set to: ${language}`);
      }
    } catch (e) { 
      console.error('Failed to set Whisper language settings:', e); 
    }
    
    // Set main window reference for audio recorder
    try { this.audioRecorder.setMainWindow(this.mainWindow); } catch (_) {}
    
    // Set up speech recognition event handlers
    try { this.setupSpeechRecognitionHandlers(); } catch (e) { console.error('setupSpeechRecognitionHandlers failed', e); }

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
    // Restore volume on app exit (fire and forget)
    try { 
      if (this.volumeManager && this.volumeManager.restore) {
        this.volumeManager.restore().catch(error => {
          console.error('🎵 Error restoring volume on cleanup:', error);
        });
      }
    } catch (error) {
      console.error('🎵 Error restoring volume on cleanup:', error);
    }
    // Destroy windows to ensure full process exit
    try { this.desktopHUD && !this.desktopHUD.isDestroyed() && this.desktopHUD.destroy(); } catch (_) {}
    try { this.assistantWindow && !this.assistantWindow.isDestroyed() && this.assistantWindow.destroy(); } catch (_) {}
    try { this.overlayWindow && !this.overlayWindow.isDestroyed() && this.overlayWindow.destroy(); } catch (_) {}
    try { this.mainWindow && !this.mainWindow.isDestroyed() && this.mainWindow.destroy(); } catch (_) {}
  }
}

// App event handlers
app.whenReady().then(async () => {
  try {
    // Initialize file logger early (packaged builds)
    try { initFileLogger(); } catch (_) {}
    if (process.platform === 'darwin') {
      // Proactively request microphone access on macOS
      const status = systemPreferences.getMediaAccessStatus ? systemPreferences.getMediaAccessStatus('microphone') : 'unknown';
      if (status !== 'granted') {
        try { await systemPreferences.askForMediaAccess('microphone'); } catch (_) {}
      }
      // Allow in-page media permission prompts
      try {
        const sess = session.defaultSession;
        if (sess && sess.setPermissionRequestHandler) {
          sess.setPermissionRequestHandler((webContents, permission, callback) => {
            if (permission === 'media' || permission === 'audioCapture') return callback(true);
            return callback(true);
          });
        }
      } catch (_) {}
    }
  } catch (_) {}

  const voiceAssistant = new VoiceAssistant();
  await voiceAssistant.init();

  // Debug auto-recording to exercise the full microphone → whisper path in packaged builds
  try {
    if (String(process.env.DEBUG_AUTOREC || '').toLowerCase() === '1') {
      const delayMs = Number(process.env.DEBUG_AUTOREC_DELAY_MS || 1500);
      const recMs = Number(process.env.DEBUG_AUTOREC_MS || 2500);
      console.log('DEBUG_AUTOREC enabled. delayMs=', delayMs, 'recMs=', recMs);
      try { if (!voiceAssistant.authUser) voiceAssistant.authUser = { id: 'debug', email: 'debug@example.com' }; } catch (_) {}
      setTimeout(async () => {
        console.log('DEBUG_AUTOREC: startRecording');
        const ok = await voiceAssistant.startRecording();
        console.log('DEBUG_AUTOREC: startRecording ok=', ok);
        setTimeout(async () => {
          console.log('DEBUG_AUTOREC: stopRecording');
          try { await voiceAssistant.stopRecording(); } catch (e) { console.error('DEBUG_AUTOREC stop error', e); }
        }, recMs);
      }, delayMs);
    }
  } catch (e) { console.error('DEBUG_AUTOREC setup failed', e); }

  // Optional: built-in debug transcription path for packaged builds
  try {
    if (String(process.env.DEBUG_TRANSCRIBE || '').toLowerCase() === '1') {
      console.log('DEBUG_TRANSCRIBE enabled: generating test audio and running transcription');
      const { spawnSync } = require('child_process');
      const aiff = '/tmp/mithril-debug.aiff';
      const wav = '/tmp/mithril-debug.wav';
      try { fs.unlinkSync(aiff); } catch (_) {}
      try { fs.unlinkSync(wav); } catch (_) {}
      const tts = String(process.env.DEBUG_TTS_TEXT || 'hello this is a mithril transcription test');
      spawnSync('say', ['-o', aiff, tts]);
      spawnSync('afconvert', ['-f', 'WAVE', '-d', 'LEI16@16000', aiff, wav]);
      try {
        const wavBuf = fs.readFileSync(wav);
        await voiceAssistant.processAudio({ path: wav, buffer: wavBuf, chunks: 1, sampleRate: 16000 });
        console.log('DEBUG_TRANSCRIBE completed');
      } catch (e) {
        console.error('DEBUG_TRANSCRIBE failed', e);
      }
    }
  } catch (e) { console.error('DEBUG init failed', e); }

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