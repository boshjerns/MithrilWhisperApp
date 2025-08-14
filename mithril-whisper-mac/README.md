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

```bash
# Copy environment template
cp .env.example .env

# Edit .env with your settings (optional for basic transcription)
# SUPABASE_URL=your_supabase_url_for_assistant_features
# SUPABASE_ANON_KEY=your_supabase_key_for_assistant_features
# OPENAI_API_KEY=your_openai_key_for_assistant_features
```

#### 4. Run Development Server

```bash
# Start the application in development mode
npm run dev
```

### ⚙️ Development Configuration

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
- **Usage Tracking**: Optional Supabase integration for analytics
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
