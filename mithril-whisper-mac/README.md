# MITHRIL WHISPER

```
███╗   ███╗██╗████████╗██╗  ██╗██████╗ ██╗██╗     
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
 ╚══╝╚══╝ ╚═╝  ╚═╝╚═╝╚══════╝╚═╝     ╚══════╝╚═╝  ╚═╝
```

# Privacy-First Voice Transcription & AI Assistant

**Enterprise-grade voice-to-text with zero-trust security**

Built by [Josh Berns](https://github.com/boshjerns) under [MITHRIL](https://deployforward.com/mithril) - Zero-trust AI solutions for organizations that prioritize security.

---

## 🚀 **Quick Start**

### 1. **Clone & Install**
```bash
git clone https://github.com/boshjerns/MithrilWhisperApp.git
cd MithrilWhisperApp/mithril-whisper-mac
npm install
```

### 2. **Create Configuration Files**
The repository includes template files. Copy them to create your working configuration:

```bash
# Copy webpack configurations
cp webpack.main.config.EXAMPLE.js webpack.main.config.js
cp webpack.renderer.config.EXAMPLE.js webpack.renderer.config.js

# Copy package.json template  
cp package.EXAMPLE.json package.json

# Copy environment template
cp env.example .env
```

### 3. **Configure for Local Mode (Optional)**

**MITHRIL WHISPER** runs in local-only mode with maximum privacy:

**Setup:**
```bash
# Optional: Add OpenAI key for AI assistant features
OPENAI_API_KEY=sk-your_openai_key_here

# Leave empty for transcription-only mode
# OPENAI_API_KEY=
```

**Features:**
- ✅ **Local transcription** with Whisper.cpp
- ✅ **AI assistant** (if OpenAI key provided)
- ✅ **No authentication required**
- ✅ **No external database** required
- ✅ **Works offline** for transcription
- ✅ **Zero usage tracking** - maximum privacy
- ✅ **All processing on your device**

**Models Used:** `gpt-4o-mini` for AI features (when enabled)

---

## 🖥️ **Platform Setup**

### **macOS Requirements:**
- macOS 10.12+ (Sierra or later)
- Node.js 16+ 
- Apple Developer account (for building signed versions)

### **Apple Developer Setup (for building/signing):**
Edit your `.env` file:
```bash
# Required for building signed macOS apps
CSC_NAME=Developer ID Application: Your Name (YOUR_TEAM_ID)
APPLE_ID=your_apple_id@example.com
APPLE_ID_PASSWORD=your_app_specific_password
APPLE_TEAM_ID=YOUR_TEAM_ID
```

Edit `package.json` and replace `YOUR_APPLE_TEAM_ID_HERE` with your actual Apple Team ID.

---


## 🏃‍♂️ **Running the Application**

```bash
# Development mode
npm run dev

# Build for production
npm run build

# Package as macOS app (.pkg installer)
npm run package

# Build and automatically install (recommended)
npm run package:install

# Build, package, and open installer
npm run build:install
```

## 📦 **Models & Packaging Strategy**

### **How Models Are Handled:**
- **✅ Development**: Models included locally (57MB + 31MB) for immediate development
- **✅ Git Repository**: Models excluded via `.gitignore` to keep repo lightweight  
- **✅ User Downloads**: Build script automatically downloads models if missing
- **✅ PKG Installers**: Released via GitHub with models embedded

### **Current Setup:**
1. **Local Development**: Ready to use - models pre-installed
2. **GitHub Users**: Models download automatically during build
3. **End Users**: Download signed PKG from GitHub releases (includes everything)

### **First Launch:**
1. **Grant microphone permissions** when prompted
2. **Set your hotkeys** in Settings (default: `Cmd+Q` for recording, `Cmd+W` for assistant)
3. **Test transcription** by pressing your hotkey and speaking
4. **No sign-in required** - start using immediately

---

## 📊 **Features Overview**

### **Core Transcription:**
- 🎙️ **Real-time voice-to-text** using Whisper.cpp
- ⌨️ **Global hotkeys** for system-wide recording
- 📝 **Auto-injection** into any application
- 🧹 **Smart text cleanup** (remove filler words, fix punctuation)
- 📋 **Transcription history** with search

### **AI Assistant (Requires API key):**
- 🤖 **Intelligent responses** to voice prompts
- ✏️ **Text editing and improvement**
- 🔄 **Content rewriting and formatting**
- 📚 **Context-aware suggestions**
- 💬 **Conversational interface**

### **Privacy & Security:**
- 🔒 **Local audio processing** - voice never leaves your device
- 🛡️ **Hardened runtime** with macOS security features
- 🔐 **Code signed & notarized** by Apple
- 📊 **Row Level Security** (production mode)
- ⚡ **Rate limiting** and abuse protection

---

## ⚙️ **Configuration Guide**

### **Hotkey Settings:**
- **Recording Hotkey** (default: `Cmd+Q`): Start/stop transcription
- **Assistant Hotkey** (default: `Cmd+W`): Start/stop AI assistant

### **Audio Settings:**
- **Voice Activity Detection**: Adjust sensitivity
- **Audio Ducking**: Reduce background volume during recording
- **Whisper Model**: Choose accuracy vs speed (tiny, base, small, medium, large)

### **AI Settings:**
- **Model Selection**: Different models for different use cases
- **Max Tokens**: Control response length (development vs production)
- **Injection Mode**: Auto-inject, replace selection, or manual copy

---

## 🛠️ **Local Setup Instructions**

### **🍎 Mac Local Setup (No Installation Required)**
```bash
# Clone and setup
git clone https://github.com/boshjerns/MithrilWhisperApp.git
cd MithrilWhisperApp/mithril-whisper-mac

# Install dependencies
npm install

# 📦 MODELS: The repository includes pre-built Whisper models for immediate use
# - ggml-base-q5_1.bin (57MB) - High accuracy model  
# - ggml-tiny-q5_1.bin (31MB) - Fast, lightweight model
# If missing, run: npm run build:install (downloads automatically)

# Optional: Add OpenAI API key for AI assistant (voice transcription works without this)
cp env.example .env
# Edit .env and add: OPENAI_API_KEY=your_key_here

# Run locally (no authentication required)
npm run dev
```

### **🪟 Windows Local Setup (No Installation Required)**
```bash
# Clone and setup
git clone https://github.com/boshjerns/MithrilWhisperApp.git
cd MithrilWhisperApp/mithril-whisper-windows

# Install dependencies
npm install

# Optional: Add OpenAI API key for AI assistant (voice transcription works without this)
copy env.example .env
# Edit .env and add: OPENAI_API_KEY=your_key_here

# Run locally (no authentication required)
npm run dev
```

**Local Mode Benefits:**
- ✅ No login or authentication required
- ✅ Complete offline operation
- ✅ Zero telemetry or data collection
- ✅ All processing happens on your device
- ✅ Audio files deleted immediately after transcription

---

## 🔐 **Privacy & Security**

### **Data Processing**
- **🔒 Local Transcription**: All voice-to-text processing uses open-source Whisper-CPP models running entirely on your device
- **🗑️ Immediate Cleanup**: Audio files are automatically deleted after transcription completes
- **🛡️ Zero Content Tracking**: Your spoken words and transcriptions are never stored or transmitted

### **Installation Modes & Telemetry**

#### **📦 Installed Version (Mac/Windows)**
- **Authentication**: Requires login for application access
- **Limited Telemetry**: Only tracks character count when using AI assistant features
- **What's Tracked**: Character count of text sent to/from AI assistant (not content)
- **What's NOT Tracked**: Voice recordings, transcriptions, or any spoken content

#### **💻 Local Development Mode**
- **No Authentication**: Run completely offline without any login
- **Zero Telemetry**: No data collection or transmission whatsoever
- **Complete Privacy**: Everything stays on your device

### **Code Transparency**
Here's the exact code showing our minimal telemetry (character count only):
```javascript
// From src/main/main.js - AI Assistant usage tracking
const payload = {
  transcript_chars_original: sanitizedUserPrompt.length,    // Character count only
  transcript_chars_cleaned: (finalText || '').length,      // Character count only
  metadata: {
    user_words: countWords(sanitizedUserPrompt),           // Word count only
    assistant_words: countWords(finalText),                // Word count only
  }
  // NOTE: Actual content is NEVER included in telemetry
};
```

### **Security Features**
- **🔐 Code Signed**: Apple-verified security for macOS
- **🛡️ Zero-Trust Architecture**: Multiple isolation layers
- **📊 Configurable Privacy**: Choose between offline, local, or production modes

### **File Access:**
This app uses standard macOS permissions (not sandboxed) to enable text injection functionality. It can access files when needed for app operation but follows strict privacy practices for audio and user data.

---

## 🛠️ **Development**

### **Project Structure:**
```
├── src/
│   ├── main/           # Electron main process
│   │   ├── main.js     # App logic, hotkeys, AI integration
│   │   ├── audio-recorder.js  # Voice recording
│   │   ├── text-processor.js  # Whisper integration
│   │   └── volume-manager.js  # Audio ducking
│   ├── renderer/       # React frontend
│   │   ├── components/ # UI components
│   │   └── auth/       # Supabase authentication
│   └── shared/         # Shared utilities
├── build/              # Build configuration
├── whisper-cpp/        # Local Whisper models
└── supabase/           # Database schema & functions
```

### **Key Technologies:**
- **Electron** - Cross-platform desktop framework
- **React** - Frontend UI framework  
- **Whisper.cpp** - Local speech-to-text engine
- **Supabase** - Backend-as-a-Service (optional)
- **OpenAI API** - AI assistant features (optional)

---

## 🤝 **Contributing**

We welcome contributions! Please:

1. **Fork the repository**
2. **Create your feature branch** (`git checkout -b feature/amazing-feature`)
3. **Follow security guidelines** (never commit `.env`, `webpack.*.config.js`, or `package.json` with real credentials)
4. **Test thoroughly** across different setup modes
5. **Submit a pull request**

### **Security Guidelines:**
- Never commit files containing real API keys or credentials
- Use the `.EXAMPLE` template files for reference
- Test in local mode before production
- Follow principle of least privilege

---

## 📞 **Support & Contact**

- **GitHub Issues**: [Create an issue](https://github.com/boshjerns/MithrilWhisperApp/issues)
- **Email**: [boshjerns@gmail.com](mailto:boshjerns@gmail.com)
- **Enterprise Solutions**: [Deploy Forward](https://deployforward.com/mithril)

---

## 📋 **License**

### **Personal Use**: 
This project is licensed under **Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License**. Free to use, modify, and distribute for non-commercial purposes with attribution.

### **Commercial Use**: 
Commercial use, including distribution in commercial products, SaaS offerings, or revenue-generating applications, requires a separate commercial license.

**For commercial licensing inquiries, please contact: Josh Berns at boshjerns@gmail.com**

See [LICENSE](LICENSE) file for full details.

[![License: CC BY-NC-SA 4.0](https://img.shields.io/badge/License-CC%20BY--NC--SA%204.0-lightgrey.svg)](https://creativecommons.org/licenses/by-nc-sa/4.0/)

---

## 🙏 **Acknowledgments**

- **OpenAI Whisper** - Revolutionary speech recognition
- **Whisper.cpp** - Efficient C++ implementation
- **Supabase** - Excellent backend-as-a-service
- **Electron** - Enabling cross-platform desktop apps
- **Deploy Forward** - Supporting secure AI development

---

**Built with ⚡ by [Josh Berns](https://github.com/boshjerns) under [MITHRIL](https://deployforward.com/mithril) - Zero-trust AI solutions**

*© 2025 MITHRIL & Deploy Forward. Securing AI for tomorrow.*