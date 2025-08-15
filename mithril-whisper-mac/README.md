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

## 🔐 **Security Notes**

### **What's Private:**
- ✅ **Audio data** - Never stored, transmitted, or logged
- ✅ **Local transcriptions** - Stored only on your device
- ✅ **Hotkey settings** - Local app preferences only

### **What Uses Network (Optional):**
- 🌐 **AI features** - Only transcribed text (never audio) sent to OpenAI/Supabase
- 🌐 **Authentication** - Only in production mode
- 🌐 **Usage analytics** - Only in production mode (aggregated, anonymized)

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

MIT License - see LICENSE file for details.

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