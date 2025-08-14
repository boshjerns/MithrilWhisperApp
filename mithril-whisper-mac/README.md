# Mithril Whisper - macOS Edition

## Privacy-First Voice Assistant for macOS

**Mithril Whisper macOS** brings enterprise-grade, air-gapped voice transcription to Apple computers. Built with Electron and React, featuring bundled Whisper.cpp models and complete offline operation.

### 🎯 Features

- **Real-time Voice Transcription**: Convert speech to text instantly
- **AI Assistant Integration**: Optional OpenAI-powered intelligent responses
- **Global Hotkeys**: System-wide recording from any application
- **Smart Text Injection**: Seamless insertion into active applications
- **100% Local Processing**: No internet required, complete privacy
- **Apple Silicon Optimized**: Native M-series chip acceleration

### 🛡️ Security & Privacy

- **Air-Gapped Operation**: Works completely offline
- **Zero Data Transmission**: Audio never leaves your Mac
- **Bundled Models**: Whisper.cpp included - no downloads needed
- **macOS Hardened Runtime**: Signed and notarized for security
- **Enterprise-Ready**: Perfect for classified environments

### 📋 Requirements

- **macOS**: 10.15 (Catalina) or later
- **Memory**: 8GB RAM minimum (16GB recommended)
- **Storage**: 2GB free space
- **Microphone**: Built-in or external microphone

### 🚀 Quick Start

1. **Download**: Get the latest `.dmg` from releases
2. **Install**: Drag to Applications folder
3. **Permissions**: Grant microphone and accessibility access
4. **Record**: Use global hotkey (Cmd+Q) to start/stop recording
5. **Assistant**: Use assistant hotkey (Cmd+S) for AI-powered responses

### ⚙️ Configuration

#### Global Hotkeys
- **Recording**: Cmd+Q (customizable)
- **Assistant**: Cmd+S (customizable)

#### Models
- **Tiny**: Fastest, good for most use cases
- **Base**: Better accuracy, slightly slower

#### Text Injection
- **Auto Paste**: Automatically injects via System Events
- **Copy Only**: Places text in clipboard for manual pasting

### 🔧 Development Setup

```bash
# Install dependencies
npm install

# Development mode
npm run dev

# Build for production
npm run build

# Package DMG
npm run dist
```

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
