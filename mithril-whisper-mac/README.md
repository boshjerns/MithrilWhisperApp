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
git clone https://github.com/boshjerns/MITHRILWHISPER.git
cd MITHRILWHISPER/mithril-whisper-mac
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

### 3. **Choose Your Setup Mode**

**MITHRIL WHISPER** works in three different modes depending on your environment variables:

---

## 🔧 **Setup Modes**

### 🏠 **MODE 1: Local Development (Recommended for GitHub users)**

**Best for:** Individual developers, testing, offline use

**Setup:**
```bash
# Edit .env file - add ONLY your OpenAI key
OPENAI_API_KEY=sk-your_openai_key_here

# Leave these EMPTY for local mode:
# SUPABASE_URL=
# SUPABASE_ANON_KEY=
```

**Features:**
- ✅ **Local transcription** with Whisper.cpp
- ✅ **AI assistant** via direct OpenAI API calls  
- ✅ **Mock authentication** (creates `developer@localhost` account)
- ✅ **No external database** required
- ✅ **Works offline** for transcription (AI features need internet)

**Models Used:** `gpt-4o-mini` for AI features

---

### 🏢 **MODE 2: Production (Enterprise/Multi-user)**

**Best for:** Organizations, shared deployments, enterprise use

**Setup:**
```bash
# Edit .env file with full configuration
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key
OPENAI_API_KEY=sk-your_openai_key_here
```

**Features:**
- ✅ **All local mode features** 
- ✅ **Real user authentication** via Supabase
- ✅ **Usage tracking** and analytics
- ✅ **Rate limiting** and abuse protection
- ✅ **Multi-user support** with individual accounts
- ✅ **Secure AI processing** via Supabase Edge Functions

**Models Used:** `o4-mini` (optimized for production)

**Additional Setup Required:**
1. Create [Supabase account](https://supabase.com)
2. Run database migrations (see Production Setup below)

---

### 🔒 **MODE 3: Fully Offline (Maximum Privacy)**

**Best for:** Air-gapped environments, maximum security

**Setup:**
```bash
# Leave .env file empty or don't create it
# No API keys required
```

**Features:**
- ✅ **Local transcription only** with Whisper.cpp
- ✅ **Zero network calls** - completely offline
- ✅ **No AI assistant** features (transcription only)
- ✅ **Maximum privacy** - nothing ever leaves your device

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

## 🏗️ **Production Setup (Mode 2)**

If you're setting up the full production environment:

### **1. Supabase Setup**
1. Create account at [supabase.com](https://supabase.com)
2. Create new project
3. Get URL and anon key from Settings → API
4. Add to your `.env` file

### **2. Database Setup**
```bash
# Install Supabase CLI
npm install -g supabase

# Link to your project  
npx supabase link

# Apply database migrations
npx supabase db push
```

### **3. Environment Variables**
```bash
# Production .env example
SUPABASE_URL=https://yourproject.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
OPENAI_API_KEY=sk-proj-abc123...

# Apple Developer (for signed builds)
CSC_NAME=Developer ID Application: Your Name (TEAMID)
APPLE_ID=your@apple.id
APPLE_ID_PASSWORD=app-specific-password
APPLE_TEAM_ID=YOUR_TEAM_ID
```

---

## 🏃‍♂️ **Running the Application**

```bash
# Development mode
npm run dev

# Build for production
npm run build

# Package as macOS app
npm run package
```

### **First Launch:**
1. **Grant microphone permissions** when prompted
2. **Set your hotkeys** in Settings (default: `Cmd+Q` for recording, `Cmd+W` for assistant)
3. **Test transcription** by pressing your hotkey and speaking
4. **Sign in** (production mode) or use automatic developer account (local mode)

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

- **GitHub Issues**: [Create an issue](https://github.com/boshjerns/MITHRILWHISPER/issues)
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