# Mithril Whisper - macOS Edition

## Privacy-First Voice Assistant for macOS

**Mithril Whisper macOS** brings enterprise-grade, air-gapped voice transcription to Apple computers. Built with Electron and React, featuring local Whisper.cpp transcription and complete offline operation.

### 🎯 Features

- **Real-time Voice Transcription**: Convert speech to text instantly with Whisper.cpp
- **AI Assistant Integration**: Optional OpenAI-powered intelligent responses
- **Global Hotkeys**: System-wide recording from any application
- **Smart Text Injection**: Seamless insertion into active applications via AppleScript
- **100% Local Processing**: No internet required for transcription, complete privacy
- **Apple Silicon Optimized**: Native M-series chip acceleration with Metal

## 🔒 Privacy & Data Protection

**Your voice and data stay private with enterprise-grade security measures:**

### Audio Privacy
- **🎙️ Zero Persistence**: Audio files are immediately deleted after transcription (typically within 2-5 seconds)
- **🏠 Local Processing**: Whisper.cpp runs entirely on your device - audio never leaves your machine
- **🗂️ Session Isolation**: Each recording uses unique temporary directories (`/tmp/mithril-whisper/{session-id}/`)
- **🧹 Multi-Layer Cleanup**: Four independent deletion mechanisms ensure no audio remnants

### Technical Safeguards
```bash
# Audio lifecycle (all local):
Recording → Temp File → Whisper.cpp → Transcription → Immediate Deletion
└─ /tmp/mithril-whisper/{pid}-{timestamp}/recording_{time}.wav (deleted instantly)
```

- **📁 Temp Storage**: Files stored in OS temp directories with automatic cleanup
- **⏱️ Time Limits**: Even if cleanup fails, 24-hour auto-deletion removes any strays  
- **🚫 Build Exclusion**: Audio files explicitly excluded from app distributions
- **🔐 Session Scoped**: Process isolation prevents cross-session data access

### Optional Cloud Features
- **Assistant Mode**: Only transcribed *text* (never audio) sent to secure backend when using AI features
- **Rate Limited**: Enterprise-grade throttling prevents abuse (30 req/min, 500/day per user)
- **Row-Level Security**: Database policies ensure users only access their own data
- **Authentication**: JWT tokens and multi-factor validation for all API requests

**Bottom Line**: Your voice recordings are processed locally and deleted immediately. Only if you choose to use AI assistant features is the resulting *text* securely transmitted for processing.

### 📋 Development Requirements

- **macOS**: 10.15 (Catalina) or later
- **Node.js**: 16.x or later
- **npm**: 8.x or later  
- **Memory**: 8GB RAM minimum (16GB recommended)
- **Storage**: 2GB free space
- **Microphone**: Built-in or external microphone

### 🚀 Local Development Setup

#### 1. Clone and Install Dependencies

```bash
# Clone the repository
git clone https://github.com/boshjerns/MITHRILWHISPER.git
cd MITHRILWHISPER/mithril-whisper-mac

# Install Node.js dependencies
npm install
```

#### 2. Download Whisper Models

The repository includes the tiny model, but for better accuracy download additional models:

```bash
# Navigate to whisper-cpp directory
cd whisper-cpp/

# Download base model (141MB) - Recommended for development
curl -L -o ggml-base.en.bin https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-base.en.bin

# Optional: Download small model (244MB) for even better accuracy  
curl -L -o ggml-small.en.bin https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-small.en.bin
```

#### 3. Environment Configuration

The system automatically detects which mode to run based on your environment variables:

**🏠 LOCAL DEVELOPMENT MODE (Recommended for GitHub setup)**
```bash
# Copy environment template
cp .env.example .env

# Add only your OpenAI key - that's it!
echo "OPENAI_API_KEY=your_openai_api_key_here" > .env

# What you get:
# ✅ Full transcription (Whisper.cpp)
# ✅ Assistant features (direct OpenAI API calls)
# ✅ No authentication required
# ✅ No telemetry/database
# ✅ Works completely locally
```

**🚀 PRODUCTION MODE (DMG installer only)**
```bash
# For official DMG builds only - requires proprietary backend
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
# (OpenAI key handled server-side)
```

**📝 TRANSCRIPTION-ONLY MODE**
```bash
# No environment variables needed
# Basic transcription works out of the box
# Assistant features will show helpful setup instructions
```

#### 4. Run Development Server

```bash
# Start the application in development mode
npm run dev
```

### ⚙️ Development Configuration

#### System Modes & Authentication

The app automatically creates a **local developer account** (`developer@localhost`) when running in local mode. This provides:

- **No sign-in required**: Immediate access to all features
- **Privacy-first**: No telemetry sent to external servers  
- **Full functionality**: All features work identically to production
- **Offline operation**: Works completely without internet (except assistant)

**Mode Detection:**
- **Local Mode**: Only `OPENAI_API_KEY` set → Mock auth, direct OpenAI calls
- **Production Mode**: `SUPABASE_URL` + `SUPABASE_ANON_KEY` set → Real auth, proprietary backend
- **Transcription-Only**: No keys → Mock auth, assistant disabled

#### Available Whisper Models

**Included in Repository:**
- ✅ **Tiny (31MB)**: `ggml-tiny-q5_1.bin` - Fast, good for development testing

**Recommended for Development:**
- **Base (141MB)**: Better accuracy, download using curl command above
- **Small (244MB)**: High accuracy for testing advanced features

**Model Priority**: The app automatically selects the best available model in this order:
1. medium → small → base → tiny

#### Global Hotkeys (Customizable in Settings)
- **Recording**: Cmd+Q (or F1, F2, etc.)
- **Assistant**: Cmd+S (or Alt+Space, etc.)

#### Text Injection Modes
- **Auto Paste**: Automatically injects via AppleScript System Events
- **Copy Only**: Places text in clipboard (safer for testing)

#### Development Features
- **HUD Display**: Recording status overlay
- **Local-Only Analytics**: Usage tracking stays on device
- **Debug Logging**: Console output for troubleshooting
- **Hot Reload**: Automatic restart on code changes

### 🔧 Build Commands

```bash
# Development mode with hot reload
npm run dev

# Build renderer and main processes  
npm run build

# Package for distribution (requires code signing setup)
npm run dist

# Individual build commands
npm run build:main     # Build main process
npm run build:renderer # Build renderer process
```

### 📊 Development Workflow

1. **Start Development**: `npm run dev`
2. **Test Recording**: Use Cmd+Q to test transcription
3. **Test Assistant**: Use Cmd+S to test AI features (requires API keys)
4. **Check Console**: Monitor Electron console for debugging
5. **Test Injection**: Try both auto-paste and copy-only modes

### 🏗️ Architecture

- **Frontend**: React with Electron renderer
- **Backend**: Node.js with native addons
- **Transcription**: Whisper.cpp with Metal acceleration
- **Audio**: Web Audio API with PCM processing
- **Platform**: macOS-specific AppleScript integration

### 📝 Usage Examples

#### Basic Transcription
1. Press `Cmd+Q` to start recording
2. Speak clearly
3. Press `Cmd+Q` again to stop
4. Text appears at cursor location

#### AI Assistant
1. Select text or place cursor
2. Press `Cmd+S` to start assistant recording
3. Ask a question or give instruction
4. AI response replaces selected text or appears in chat

### 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](../CONTRIBUTING.md) for details.

### 📄 License

MIT License - see [LICENSE](../LICENSE) for details.

### 🆘 Support

- **Issues**: Report bugs via GitHub Issues
- **Documentation**: See `/docs` folder
- **Community**: Join our Discord for support

---

**Built for organizations that value both innovation and absolute security.**

*Part of the Mithril zero-trust AI ecosystem by Deploy Forward*
