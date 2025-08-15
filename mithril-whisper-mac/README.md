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

### macOS Application
```bash
git clone https://github.com/boshjerns/MithrilWhisperApp.git
cd MithrilWhisperApp/mithril-whisper-mac
npm install
npm run dev  # ✅ Works immediately, no setup required!
```

**📖 [Full Documentation & Setup Guide →](./mithril-whisper-mac/README.md)**

---

## 📁 **Repository Structure**

### **🍎 [`mithril-whisper-mac/`](./mithril-whisper-mac/)**
Complete macOS voice transcription application with AI assistant features.

**Features:**
- 🎙️ **Local voice transcription** using Whisper.cpp
- 🤖 **AI assistant** with smart intent detection  
- ⌨️ **Global hotkeys** for system-wide recording
- 🔒 **Multiple privacy modes** (offline, local, production)
- 📝 **Auto-injection** into any application
- 🛡️ **Enterprise security** with code signing & notarization

### **🪟 [`mithril-whisper-windows/`](./mithril-whisper-windows/)**
Windows version (separate implementation for cross-platform support).

### **🌐 [`mithril-whisper-website/`](./mithril-whisper-website/)**
Landing page and download portal for distribution.

---

## ⚡ **Getting Started**

### **Option 1: Instant Start (Offline Mode)**
```bash
cd mithril-whisper-mac
npm install && npm run dev
```
*No configuration needed! Works completely offline with maximum privacy.*

### **Option 2: Development Mode (with AI)**
```bash
cd mithril-whisper-mac
# Follow the setup guide in the Mac folder README
```
*Add OpenAI API key for AI assistant features.*

### **Option 3: Enterprise/Production**
```bash
cd mithril-whisper-mac  
# Full setup with Supabase for multi-user deployment
```
*Complete cloud integration with user management.*

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

---

## 🎯 **Use Cases**

- **Individual Developers**: Fast voice-to-text for coding and documentation
- **Content Creators**: Efficient transcription for videos, podcasts, articles
- **Enterprises**: Secure AI-powered voice workflows with audit trails
- **Privacy-Conscious Users**: Completely offline transcription
- **Accessibility**: Voice control for users with typing difficulties

---

## 📞 **Support & Contact**

- **GitHub Issues**: [Report issues or request features](https://github.com/boshjerns/MithrilWhisperApp/issues)
- **Email**: [boshjerns@gmail.com](mailto:boshjerns@gmail.com)
- **Enterprise Solutions**: [Deploy Forward](https://deployforward.com/mithril)

---

## 📋 **License**

MIT License - Open source software for secure voice AI.

---

**Built with ⚡ by [Josh Berns](https://github.com/boshjerns) under [MITHRIL](https://deployforward.com/mithril)**

*© 2025 MITHRIL & Deploy Forward. Securing AI for tomorrow.*