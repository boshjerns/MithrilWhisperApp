# MITHRIL WHISPER - Windows Version Update Guide

This document outlines all the changes made to the Mac version that need to be applied to the Windows version to create a simplified, local-only experience.

## 🎯 **OVERVIEW OF CHANGES**

We transformed the app from a complex authentication-required system to a simple, privacy-focused local transcription tool that works immediately without any setup.

### **Key Improvements:**
- ✅ **Removed all authentication barriers** - works instantly
- ✅ **Eliminated Supabase dependencies** - no external services
- ✅ **Simplified hotkey system** - Command + single key only
- ✅ **Removed tracking/history UI** - privacy-focused
- ✅ **Streamlined interface** - focused on core transcription
- ✅ **Updated documentation** - accurate setup instructions

---

## 📋 **DETAILED CHANGES TO IMPLEMENT**

### **1. REMOVE AUTHENTICATION SYSTEM**

#### **Files to Delete:**
```
src/renderer/auth/AuthContext.js
src/renderer/auth/supabaseClient.js
src/renderer/auth/supabaseClient.test.js
src/renderer/components/Account.js
```

#### **Main Process Changes (main.js equivalent):**
- Remove `authUser` and `accessToken` properties
- Remove authentication check in `startRecording()`:
```javascript
// REMOVE THIS BLOCK:
if (!this.authUser) {
  console.log('🚫 Recording blocked: user not authenticated');
  if (this.mainWindow && !this.mainWindow.isDestroyed()) {
    this.mainWindow.webContents.send('recording-status', false);
  }
  return false;
}
```
- Remove `startAssistantRecording()` authentication check
- Remove auth IPC handlers (`auth:signed-in`, `auth:signed-out`)
- Remove `fetchRemoteConfigSafe()` function entirely
- Remove all usage tracking/telemetry code

#### **Environment Detection Changes:**
```javascript
// REPLACE getAssistantMode() function:
function getAssistantMode() {
  const hasOpenAI = !!process.env.OPENAI_API_KEY;
  
  if (hasOpenAI) {
    return { mode: 'local', requiresAuth: false };
  } else {
    return { mode: 'disabled', requiresAuth: false };
  }
}

// Remove all Supabase/production mode logic
```

### **2. SIMPLIFY HOTKEY SYSTEM**

#### **Update HotkeySelector Component:**
Replace the complex multi-modifier system with Command + single key only:

```javascript
// Key changes for HotkeySelector.js:
const HotkeySelector = ({ 
  value = '', 
  onChange, 
  placeholder = 'Press a key',
  disabled = false,
  label = 'Hotkey'
}) => {
  const [isCapturing, setIsCapturing] = useState(false);
  const [selectedKey, setSelectedKey] = useState('');

  // Parse existing hotkey value (extract key after "CmdOrCtrl+")
  useEffect(() => {
    if (value && !isCapturing) {
      if (value.startsWith('CmdOrCtrl+')) {
        const key = value.replace('CmdOrCtrl+', '');
        setSelectedKey(key);
      } else if (value.startsWith('Cmd+')) {
        const key = value.replace('Cmd+', '');
        setSelectedKey(key);
      } else {
        setSelectedKey('');
      }
    }
  }, [value, isCapturing]);

  const updateHotkey = (key) => {
    if (key) {
      const hotkeyString = `CmdOrCtrl+${key}`;
      onChange(hotkeyString);
      setSelectedKey(key);
    }
  };

  const formatDisplayValue = () => {
    if (isCapturing) {
      return 'Press any key...';
    }
    
    if (selectedKey) {
      return `⌘${selectedKey}`;  // Use ⊞ for Windows key
    }
    
    return `⌘${placeholder}`;
  };

  // Rest of implementation focuses on single key capture
};
```

### **3. REMOVE ASSISTANT UI COMPONENTS**

#### **Update RecordingControls.js:**
```javascript
// Remove assistantHotkey prop:
function RecordingControls({ 
  isRecording, 
  onStartRecording, 
  onStopRecording, 
  onToggleRecording, 
  hotkey
}) {

// Remove assistant hotkey status display
// Remove assistant instructions section
```

#### **Update App.js:**
```javascript
// Remove assistant hotkey from props:
<RecordingControls
  isRecording={isRecording}
  onStartRecording={handleStartRecording}
  onStopRecording={handleStopRecording}
  onToggleRecording={handleToggleRecording}
  hotkey={settings.hotkey}
/>

// Remove History tab from navigation
// Remove Account tab from navigation  
// Remove UsageHistory component import
```

#### **Update Settings.js:**
```javascript
// Remove from initial state:
// assistantInjectOnReplace: settings.assistantInjectOnReplace || false

// Remove assistant hotkey setting section
// Remove assistant injection setting
```

### **4. SIMPLIFY UI COMPONENTS**

#### **Update UsageHistory.js (Privacy-focused):**
```javascript
import React from 'react';
import { HistoryIcon, InfoIcon } from './Icons';

export default function UsageHistory() {
  return (
    <div className="usage-history">
      <div className="section-header" style={{ marginBottom: '24px' }}>
        <h2>
          <HistoryIcon size={24} />
          Usage History
        </h2>
      </div>

      <div className="glass-card" style={{ padding: 24 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
          <InfoIcon size={24} />
          <div>
            <h3 style={{ margin: '0 0 12px 0', color: '#00ff00' }}>Local Mode - Privacy First</h3>
            <div className="terminal-text" style={{ lineHeight: 1.5 }}>
              <p style={{ margin: '0 0 12px 0' }}>
                Usage tracking is <strong>disabled</strong> in local mode to protect your privacy.
              </p>
              <p style={{ margin: '0 0 12px 0' }}>
                ✅ <strong>Your voice recordings</strong> are processed locally and deleted immediately<br/>
                ✅ <strong>Your transcriptions</strong> never leave your device<br/>
                ✅ <strong>No usage data</strong> is collected or transmitted<br/>
                ✅ <strong>Complete offline operation</strong> for transcription features
              </p>
              <p style={{ margin: 0 }}>
                This ensures maximum privacy and security for your voice data.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
```

#### **Simplified About.js:**
```javascript
import React from 'react';
import { MailIcon, FileIcon, ExternalLinkIcon } from './Icons';

function About() {
  return (
    <div className="about-container">
      <div className="about-header">
        <h1>MITHRIL WHISPER</h1>
        <p>Privacy-focused voice transcription for Windows</p>
      </div>

      <div className="about-content">
        <div className="section">
          <h3>What it does</h3>
          <p>Press a hotkey to record your voice. The app transcribes your speech locally and injects the text into whatever application you're using.</p>
        </div>

        <div className="section">
          <h3>How it works</h3>
          <ul>
            <li>All voice processing happens on your device using Whisper.cpp</li>
            <li>Audio files are deleted immediately after transcription</li>
            <li>No internet required for transcription</li>
            <li>Works system-wide with any application</li>
          </ul>
        </div>

        <div className="section">
          <h3>Privacy</h3>
          <p>Your voice never leaves your device. Audio files are processed locally and deleted within seconds. No usage tracking or data collection.</p>
        </div>

        <div className="section">
          <h3>Created by</h3>
          <p>Josh Berns</p>
        </div>
      </div>

      <div className="license-section">
        <h3>License</h3>
        <div className="license-info">
          <div className="license-type">
            <h4>Personal Use: FREE</h4>
            <p>Free to use, modify, and distribute for non-commercial purposes with attribution.</p>
          </div>
          
          <div className="license-type">
            <h4>Commercial Use: LICENSE REQUIRED</h4>
            <p>Commercial use requires a separate commercial license agreement.</p>
          </div>
          
          <div className="license-contact">
            <p>For commercial licensing: 
              <a href="mailto:boshjerns@gmail.com?subject=Commercial License Inquiry - MITHRIL WHISPER">
                boshjerns@gmail.com
              </a>
            </p>
          </div>
          
          <div className="license-links">
            <a href="https://github.com/boshjerns/MithrilWhisperApp/blob/main/LICENSE" target="_blank" rel="noopener noreferrer">
              <FileIcon size={16} /> View Full License
            </a>
            <a href="https://creativecommons.org/licenses/by-nc-sa/4.0/" target="_blank" rel="noopener noreferrer">
              <ExternalLinkIcon size={16} /> About CC BY-NC-SA 4.0
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default About;
```

### **5. DISABLE USAGE TRACKING**

#### **Update uploader.js:**
```javascript
// Local mode - usage tracking disabled for privacy
// These functions are no-ops to maintain compatibility with existing code

export async function uploadUsageEvent(event) {
  // No-op in local mode - usage tracking disabled for privacy
  console.log('Local mode: Usage tracking disabled, event discarded');
}

export async function flushQueue() {
  // No-op in local mode - no usage data to flush
}
```

---

## 🎨 **UI STYLING & FRONT PAGE DESIGN**

### **Main Front Page Component (RecordingControls.js)**

This is the primary interface users see when they open the app. It features the MITHRIL WHISPER ASCII logo and clean status interface.

```javascript
import React from 'react';
import { MicrophoneIcon, SoundWaveIcon, InfoIcon } from './Icons';

function RecordingControls({ 
  isRecording, 
  onStartRecording, 
  onStopRecording, 
  onToggleRecording, 
  hotkey
}) {
  // ASCII art for the homepage
  const mithrilAsciiArt = `███╗   ███╗██╗████████╗██╗  ██╗██████╗ ██╗██╗     
████╗ ████║██║╚══██╔══╝██║  ██║██╔══██╗██║██║     
██╔████╔██║██║   ██║   ███████║██████╔╝██║██║     
██║╚██╔╝██║██║   ██║   ██╔══██║██╔══██╗██║██║     
██║ ╚═╝ ██║██║   ██║   ██║  ██║██║  ██║██║███████╗
╚═╝     ╚═╝╚═╝   ╚═╝   ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝╚══════╝

██╗    ██╗██╗  ██╗██╗███████╗██████╗ ███████╗██████╗ 
██║    ██║██║  ██║██║██╔════╝██╔══██╗██╔════╝██╔══██╗
██║ █╗ ██║███████║██║███████╗██████╔╝█████╗  ██████╔╝
██║███╗██║██╔══██║██║╚════██║██╔═══╝ ██╔══╝  ██╔══██╗
╚███╔███╔╝██║  ██║██║███████║██║     ███████╗██║  ██║
 ╚══╝╚══╝ ╚═╝  ╚═╝╚═╝╚══════╝╚═╝     ╚══════╝╚═╝  ╚═╝`;

  return (
    <div className="recording-controls">
      {/* ASCII Art Header */}
      <div className="homepage-header">
        <pre className="homepage-ascii">{mithrilAsciiArt}</pre>
        <p className="homepage-subtitle">Enterprise-Grade Voice Transcription</p>
      </div>

      {/* Quick Status Overview */}
      <div className="glass-card status-overview">
        <div className="status-grid">
          <div className="status-item">
            <div className="status-label">STATUS:</div>
            <div className={`status-value ${isRecording ? 'recording' : 'ready'}`}>
              {isRecording ? '🔴 Recording...' : '🟢 Ready'}
            </div>
          </div>
          
          <div className="status-item">
            <div className="status-label">RECORDING HOTKEY:</div>
            <div className="status-value hotkey-display">
              <kbd>{hotkey || 'Not Set'}</kbd>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Start Instructions */}
      <div className="glass-card instructions-card">
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <InfoIcon size={20} />
          Quick Start Guide
        </h3>
        
        <div className="instructions-grid">
          <div className="instruction-section">
            <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <MicrophoneIcon size={16} />
              Voice Recording
            </h4>
            <ul className="instruction-list">
              <li>Press <kbd>{hotkey || 'hotkey'}</kbd> to start recording</li>
              <li>Press <kbd>{hotkey || 'hotkey'}</kbd> again to stop and process</li>
              <li>Text automatically cleans up and injects into active app</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Manual Record Button */}
      <div className="glass-card manual-controls" style={{ textAlign: 'center', marginTop: '20px' }}>
        <p className="manual-controls-label">Manual Control (Hotkeys Recommended)</p>
        <button
          className={`record-button-small ${isRecording ? 'recording' : ''}`}
          onClick={onToggleRecording}
        >
          {isRecording ? (
            <>
              <SoundWaveIcon size={24} />
              <span>Stop Recording</span>
            </>
          ) : (
            <>
              <MicrophoneIcon size={24} />
              <span>Start Recording</span>
            </>
          )}
        </button>
        <p className="manual-controls-note">
          Note: You'll still need to use <kbd>{hotkey}</kbd> to stop and inject text from other apps
        </p>
      </div>
    </div>
  );
}

export default RecordingControls;
```

### **CSS Styling for Front Page**

Key CSS classes and styling for the front page:

```css
/* Homepage Header with ASCII Art */
.homepage-header {
  text-align: center;
  margin-bottom: 2rem;
  padding: 1.5rem;
}

.homepage-ascii {
  font-family: 'Courier New', 'SF Mono', Monaco, 'Cascadia Code', monospace;
  font-size: 0.6rem;
  line-height: 1.1;
  color: #00ff00; /* Matrix green */
  background: #000;
  padding: 1rem;
  border-radius: 8px;
  border: 1px solid #333;
  margin: 0 auto;
  white-space: pre;
  overflow-x: auto;
}

.homepage-subtitle {
  margin-top: 1rem;
  font-size: 1.2rem;
  font-weight: 600;
  color: #333;
  opacity: 0.9;
}

/* Glass Card Effect */
.glass-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

/* Status Overview Grid */
.status-overview {
  background: linear-gradient(135deg, rgba(0, 255, 0, 0.1), rgba(0, 0, 255, 0.1));
}

.status-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}

.status-item {
  text-align: center;
}

.status-label {
  font-family: 'SF Mono', Monaco, 'Cascadia Code', monospace;
  font-size: 0.8rem;
  font-weight: 700;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 0.5rem;
}

.status-value {
  font-size: 1.1rem;
  font-weight: 600;
  padding: 0.5rem;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.1);
}

.status-value.ready {
  color: #00aa00;
  background: rgba(0, 255, 0, 0.1);
}

.status-value.recording {
  color: #ff4444;
  background: rgba(255, 0, 0, 0.1);
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

/* Hotkey Display */
.hotkey-display kbd {
  font-family: 'SF Mono', Monaco, monospace;
  font-size: 1rem;
  padding: 0.3rem 0.6rem;
  background: #f0f0f0;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

/* Instructions */
.instructions-card {
  background: rgba(240, 248, 255, 0.1);
}

.instruction-section h4 {
  color: #2c5aa0;
  margin-bottom: 0.75rem;
}

.instruction-list {
  list-style: none;
  padding: 0;
}

.instruction-list li {
  padding: 0.5rem 0;
  border-bottom: 1px solid rgba(0,0,0,0.1);
  display: flex;
  align-items: center;
}

.instruction-list li:last-child {
  border-bottom: none;
}

.instruction-list kbd {
  font-family: 'SF Mono', Monaco, monospace;
  font-size: 0.9rem;
  padding: 0.2rem 0.4rem;
  background: #e8e8e8;
  border: 1px solid #ccc;
  border-radius: 3px;
  margin: 0 0.25rem;
}

/* Manual Controls */
.manual-controls {
  background: rgba(248, 249, 250, 0.1);
}

.manual-controls-label {
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 1rem;
}

.record-button-small {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border: 2px solid #007AFF;
  border-radius: 8px;
  background: linear-gradient(135deg, #007AFF, #0056CC);
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 1rem;
}

.record-button-small:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 122, 255, 0.3);
}

.record-button-small.recording {
  background: linear-gradient(135deg, #ff4444, #cc0000);
  border-color: #ff4444;
  animation: pulse 2s infinite;
}

.manual-controls-note {
  margin-top: 0.75rem;
  font-size: 0.8rem;
  color: #666;
  line-height: 1.4;
}
```

### **Navigation Structure**

The app uses a simple 3-tab navigation:

```javascript
// App.js navigation structure:
<div className="nav-tabs">
  <button 
    className={`nav-tab ${currentTab === 'controls' ? 'active' : ''}`}
    onClick={() => setCurrentTab('controls')}
  >
    Controls
  </button>
  <button 
    className={`nav-tab ${currentTab === 'settings' ? 'active' : ''}`}
    onClick={() => setCurrentTab('settings')}
  >
    Settings
  </button>
  <button 
    className={`nav-tab ${currentTab === 'about' ? 'active' : ''}`}
    onClick={() => setCurrentTab('about')}
  >
    About
  </button>
</div>
```

**Note for Windows:** Replace the ⌘ symbol with ⊞ (Windows key) in the hotkey displays and adjust the ASCII art background color if needed for Windows theming.

---

## 🔧 **ENVIRONMENT & CONFIGURATION**

### **Update .env.example:**
```bash
# MITHRIL WHISPER - LOCAL DEVELOPMENT MODE
# This configuration runs in local-only mode with no authentication required
# NEVER commit .env files to version control!

# ==============================================================================
# 🤖 OPENAI CONFIGURATION (Optional - for AI assistant features)  
# ==============================================================================
# Get this from https://platform.openai.com/api-keys
# Leave empty for transcription-only mode
OPENAI_API_KEY=

# ==============================================================================
# 🔧 DEVELOPMENT CONFIGURATION
# ==============================================================================
# Node environment
NODE_ENV=development

# Development server port
DEV_SERVER_PORT=37843

# ==============================================================================
# 📝 LOCAL MODE SETUP
# ==============================================================================
# 
# MITHRIL WHISPER runs in LOCAL MODE when no configuration is provided.
# This mode provides:
# ✅ Local transcription with Whisper.cpp
# ✅ No authentication required
# ✅ Complete offline operation
# ✅ Zero telemetry or data collection
# ✅ All processing happens on your device
#
# ==============================================================================
```

### **Update README.md:**
```markdown
## 🚀 **Quick Start**

### 1. **Clone & Install**
```bash
git clone https://github.com/boshjerns/MithrilWhisperApp.git
cd MithrilWhisperApp/mithril-whisper-windows
npm install
```

### 2. **Run Immediately**
```bash
npm run dev
```

**That's it!** No configuration files needed, no login required, no environment variables. The app works immediately with local transcription.

**Features:**
- ✅ **Local transcription** with Whisper.cpp
- ✅ **No authentication required**
- ✅ **Works completely offline**
- ✅ **Zero usage tracking** - maximum privacy
- ✅ **All processing on your device**
- ✅ **System-wide voice recording** with global hotkeys
- ✅ **Auto text injection** into any application
```

---

## ✅ **TESTING CHECKLIST**

After implementing all changes, verify:

1. **App starts without .env file** - `npm run dev` works immediately
2. **No authentication prompts** - app is usable right away  
3. **Recording works** - hotkey triggers recording and transcription
4. **Hotkey setting works** - simplified Command + key interface
5. **No History tab** - navigation only shows Controls, Settings, About
6. **About page is simple** - no complex FAQ, just essential info
7. **No error messages** - no auth-related errors in console
8. **Usage tracking disabled** - no network calls except Whisper models

---

## 📝 **SUMMARY**

These changes transform the Windows version into a simple, privacy-focused transcription tool that:

- **Works immediately** without any setup
- **Focuses on core functionality** (voice transcription)
- **Respects user privacy** (no tracking, local processing)
- **Provides clean UI** (simplified interface, clear branding)
- **Removes barriers** (no authentication, no complex configuration)

The result should be an app that users can clone, install, and use within minutes, providing immediate value without any friction or privacy concerns.
