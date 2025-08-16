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

### 2. **Choose Your Mode**

MITHRIL WHISPER supports **multiple operating modes** depending on your needs:

#### 🔒 **Offline Development Mode (Zero Setup)**
Perfect for maximum privacy and immediate testing:
```bash
# No configuration needed! Just run:
npm run dev  # ✅ Works immediately, no authentication required
```

#### 🏠 **Local Development Mode**  
For development with AI features:
```bash
# Copy configuration templates
cp webpack.main.config.EXAMPLE.js webpack.main.config.js
cp webpack.renderer.config.EXAMPLE.js webpack.renderer.config.js
cp package.EXAMPLE.json package.json
cp env.example .env

# Edit .env with your OpenAI key only
# Leave Supabase fields empty for local mode
```

#### 🌐 **Production Mode**
For full enterprise features with user management:
```bash
# Set up all environment variables (see Environment Setup below)
# Include Supabase credentials for full cloud features
```

---

## 🔧 **Setup Modes Explained**

### 🔐 **MODE 0: Fully Offline (Zero Configuration)**

**Best for:** Maximum privacy, no external dependencies, immediate testing

**Setup:**
```bash
# No configuration needed!
npm run dev
```

**Features:**
- ✅ **Local transcription** with Whisper.cpp
- ✅ **Complete privacy** - no network calls
- ✅ **No authentication** required  
- ✅ **Works offline** entirely
- ❌ **No AI assistant** features
- ❌ **No cloud storage**

**Implementation:** The app automatically detects offline mode when no Supabase credentials are configured and creates a fake "offline@local" user for UI consistency.

---

### 🏠 **MODE 1: Local Development**

**Best for:** Individual developers, testing AI features, local-first approach

**Setup:**
```bash
# Copy configuration files
cp webpack.main.config.EXAMPLE.js webpack.main.config.js
cp webpack.renderer.config.EXAMPLE.js webpack.renderer.config.js
cp package.EXAMPLE.json package.json
cp env.example .env

# Edit .env file - add ONLY your OpenAI key
OPENAI_API_KEY=sk-your_openai_key_here

# Leave Supabase fields EMPTY for local mode:
# SUPABASE_URL=
# SUPABASE_ANON_KEY=
```

**Features:**
- ✅ **Local transcription** with Whisper.cpp
- ✅ **AI assistant** via direct OpenAI API calls  
- ✅ **Mock authentication** (creates `developer@localhost` account)
- ✅ **No external database** required
- ✅ **Works offline** for transcription (AI features need internet)
- ✅ **Local storage** for history and settings

**Models Used:** `gpt-4o-mini` for optimal cost/performance

---

### 🏢 **MODE 2: Production (Enterprise)**

**Best for:** Organizations, shared deployments, multi-user environments

**Setup:**
```bash
# Full configuration required
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key
OPENAI_API_KEY=sk-your_openai_key_here

# Additional production setup required (see below)
```

**Features:**
- ✅ **All local mode features** 
- ✅ **Real user authentication** via Supabase
- ✅ **Usage tracking** and analytics
- ✅ **Rate limiting** and abuse protection
- ✅ **Multi-user support** with individual accounts
- ✅ **Secure AI processing** via Supabase Edge Functions
- ✅ **Row Level Security (RLS)** for data isolation

**Models Used:** `o4-mini` (optimized for production scale)

---

## 📋 **First-Time Setup Guide**

### **Option A: Quick Start (Offline Mode)**
```bash
git clone https://github.com/boshjerns/MithrilWhisperApp.git
cd MithrilWhisperApp/mithril-whisper-mac
npm install
npm run dev  # ✅ Works immediately!
```

### **Option B: Development Mode with AI**
```bash
git clone https://github.com/boshjerns/MithrilWhisperApp.git
cd MithrilWhisperApp/mithril-whisper-mac
npm install

# Copy template files
cp webpack.main.config.EXAMPLE.js webpack.main.config.js
cp webpack.renderer.config.EXAMPLE.js webpack.renderer.config.js
cp package.EXAMPLE.json package.json
cp env.example .env

# Edit .env with your OpenAI key
# Edit package.json with your Apple Team ID (for building)
npm run dev
```

---

## 🔑 **Environment Configuration**

### **Development .env Template:**
```bash
# OpenAI (for AI assistant features)
OPENAI_API_KEY=sk-your_openai_key_here

# Leave empty for local development mode:
SUPABASE_URL=
SUPABASE_ANON_KEY=

# Apple Developer (only needed for building signed apps)
CSC_NAME=Developer ID Application: Your Name (YOUR_TEAM_ID)
APPLE_ID=your_apple_id@example.com
APPLE_ID_PASSWORD=your_app_specific_password  
APPLE_TEAM_ID=YOUR_TEAM_ID
```

### **Production .env Template:**
```bash
# Supabase (from your project dashboard)
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key

# OpenAI (required for AI features)
OPENAI_API_KEY=sk-your_openai_key_here

# Apple Developer (for code signing)
CSC_NAME=Developer ID Application: Your Name (YOUR_TEAM_ID)
APPLE_ID=your_apple_id@example.com
APPLE_ID_PASSWORD=your_app_specific_password
APPLE_TEAM_ID=YOUR_TEAM_ID
```

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

### **3. Apple Developer Setup (for macOS builds)**
1. Get Apple Developer account
2. Generate app-specific password
3. Get your Team ID from Apple Developer portal
4. Edit `package.json` and replace `YOUR_APPLE_TEAM_ID_HERE`

---

## 🏃‍♂️ **Running the Application**

### **Development Commands:**
```bash
# Start development mode
npm run dev

# Build for production  
npm run build

# Package as macOS app (.app bundle)
npm run package

# Build and package as DMG (signed & notarized)
npm run dist
```

### **First Launch:**
1. **Grant microphone permissions** when prompted by macOS
2. **Set your hotkeys** in Settings (default: `Cmd+Q` for recording, `Cmd+W` for assistant)
3. **Test transcription** by pressing your hotkey and speaking
4. **Configure AI settings** if using assistant features

---

## 📊 **Features Overview**

### **Core Transcription:**
- 🎙️ **Real-time voice-to-text** using Whisper.cpp
- ⌨️ **Global hotkeys** for system-wide recording (`Cmd+Q` default)
- 📝 **Auto-injection** into any application
- 🧹 **Smart text cleanup** (remove filler words, fix punctuation)
- 📋 **Transcription history** with search and pagination
- 🔄 **Text replacement** for highlighted content

### **AI Assistant (Requires API key):**
- 🤖 **Intelligent responses** to voice prompts (`Cmd+W` default)
- ✏️ **Text editing and improvement**
- 🔄 **Content rewriting and formatting**
- 📚 **Context-aware suggestions**
- 💬 **Conversational interface**
- 🎯 **Smart intent detection** (inject vs conversational)

### **Privacy & Security:**
- 🔒 **Local audio processing** - voice never leaves your device
- 🛡️ **Hardened runtime** with macOS security features
- 🔐 **Code signed & notarized** by Apple
- 📊 **Row Level Security** (production mode)
- ⚡ **Rate limiting** and abuse protection
- 🚫 **No telemetry** in offline mode

---

## ⚙️ **Configuration Guide**

### **Hotkey Settings:**
- **Recording Hotkey** (default: `Cmd+Q`): Start/stop voice transcription
- **Assistant Hotkey** (default: `Cmd+W`): Start/stop AI assistant
- **Custom hotkeys** supported in Settings

### **Audio Settings:**
- **Voice Activity Detection**: Adjust microphone sensitivity
- **Audio Ducking**: Reduce background volume during recording
- **Whisper Model**: Choose accuracy vs speed (tiny, base, small, medium, large)
- **Gain Control**: Automatic microphone level adjustment

### **AI Settings:**
- **Model Selection**: Different models for different use cases
- **Max Tokens**: Control response length (4000 dev, 8000 prod)
- **Injection Mode**: Auto-inject, replace selection, or manual copy
- **Intent Detection**: Smart classification of user prompts

---

## 🖥️ **Platform Requirements**

### **macOS:**
- macOS 10.12+ (Sierra or later)
- Node.js 16+ 
- 4GB RAM minimum, 8GB recommended
- Microphone access permissions
- Apple Developer account (for building signed versions)

### **Windows:**
- Windows 10+ (separate `mithril-whisper-windows` folder)
- Node.js 16+
- Visual Studio Build Tools

---

## 🔐 **Security & Privacy**

### **What's Private:**
- ✅ **Audio data** - Never stored, transmitted, or logged
- ✅ **Local transcriptions** - Stored only on your device
- ✅ **Hotkey settings** - Local app preferences only
- ✅ **User files** - App follows strict access principles

### **What Uses Network (Optional):**
- 🌐 **AI features** - Only transcribed text (never audio) sent to OpenAI/Supabase
- 🌐 **Authentication** - Only in production mode
- 🌐 **Usage analytics** - Only in production mode (aggregated, anonymized)

### **File Access:**
This app uses standard macOS permissions (not sandboxed) to enable text injection functionality. It can access files when needed for app operation but follows strict privacy practices for audio and user data.

### **Data Storage:**
- **Offline Mode**: All data stays local, no external storage
- **Local Mode**: Usage tracked locally, no cloud sync
- **Production Mode**: User data encrypted with RLS, stored in Supabase

---

## 🛠️ **Development & Architecture**

### **Project Structure:**
```
├── src/
│   ├── main/                   # Electron main process
│   │   ├── main.js            # App logic, hotkeys, AI integration  
│   │   ├── audio-recorder.js  # Voice recording with cleanup
│   │   ├── text-processor.js  # Whisper.cpp integration
│   │   └── volume-manager.js  # Audio ducking & restoration
│   ├── renderer/              # React frontend
│   │   ├── components/        # UI components (Settings, History, etc.)
│   │   ├── auth/             # Supabase authentication context
│   │   └── usage/            # Usage tracking & analytics
│   └── shared/               # Shared utilities
├── build/                    # Build configuration & entitlements
├── whisper-cpp/             # Local Whisper models & binaries
├── supabase/                # Database schema & Edge Functions
└── assets/                  # Icons & branding
```

### **Key Technologies:**
- **Electron** - Cross-platform desktop framework
- **React** - Frontend UI framework  
- **Whisper.cpp** - Local speech-to-text engine
- **Supabase** - Backend-as-a-Service (optional)
- **OpenAI API** - AI assistant features (optional)

### **Development vs Production Builds:**

**Development Mode:**
- No `.env` file = Automatic offline mode
- Copy `.EXAMPLE` files for AI features
- Uses environment variables for configuration

**Production Mode:**
- Copy production credentials to `.env`
- Build with `npm run build && npm run dist`
- Results in signed DMG requiring user authentication

---

## 🚨 **Security Guidelines for Contributors**

### **⚠️ NEVER COMMIT:**
- ❌ `.env` files (any environment files)
- ❌ `webpack.main.config.js` (if containing hardcoded credentials)
- ❌ `webpack.renderer.config.js` (if containing hardcoded credentials)  
- ❌ `package.json` (if containing real Apple Team ID)
- ❌ Personal email addresses or credentials
- ❌ Signing certificates or private keys

### **✅ SAFE TO COMMIT:**
- ✅ `webpack.main.config.EXAMPLE.js`
- ✅ `webpack.renderer.config.EXAMPLE.js`
- ✅ `package.EXAMPLE.json`
- ✅ `env.example`
- ✅ All source code files
- ✅ Documentation and README files

### **🔧 Security Setup Process:**
```bash
# Replace configs with sanitized examples
cp webpack.main.config.EXAMPLE.js webpack.main.config.js  
cp webpack.renderer.config.EXAMPLE.js webpack.renderer.config.js
cp package.EXAMPLE.json package.json

# Create environment file from template
cp env.example .env

# Edit with your actual credentials (never commit this!)
# The .gitignore will automatically exclude these files
```

---

## 🤝 **Contributing**

We welcome contributions! Please:

1. **Fork the repository**
2. **Create your feature branch** (`git checkout -b feature/amazing-feature`)
3. **Follow security guidelines** (never commit sensitive credentials)
4. **Test thoroughly** across different setup modes
5. **Submit a pull request**

### **Development Workflow:**
```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/MithrilWhisperApp.git
cd MithrilWhisperApp/mithril-whisper-mac

# Set up development environment (choose your mode)
npm install
npm run dev

# Make changes, test, commit
git add .
git commit -m "feat: Add amazing feature"
git push origin feature/amazing-feature
```

---

## 🆘 **Emergency: Credentials Accidentally Committed?**

If you accidentally committed sensitive information:

1. **Immediately rotate exposed credentials:**
   - Regenerate Supabase keys
   - Regenerate OpenAI API keys
   - Create new Apple app-specific password

2. **Contact maintainers** to clean Git history

3. **Never commit real credentials again** - use the template system

---

## 📞 **Support & Contact**

- **GitHub Issues**: [Create an issue](https://github.com/boshjerns/MithrilWhisperApp/issues)
- **Email**: [boshjerns@gmail.com](mailto:boshjerns@gmail.com)
- **Enterprise Solutions**: [Deploy Forward](https://deployforward.com/mithril)
- **Security Issues**: Please report privately via email

---

## 📋 **License**

MIT License - see LICENSE file for details.

---

## 🙏 **Acknowledgments**

- **OpenAI Whisper** - Revolutionary speech recognition
- **Whisper.cpp** - Efficient C++ implementation by [ggerganov](https://github.com/ggerganov)
- **Supabase** - Excellent backend-as-a-service platform
- **Electron** - Enabling cross-platform desktop apps
- **Deploy Forward** - Supporting secure AI development

---

**Built with ⚡ by [Josh Berns](https://github.com/boshjerns) under [MITHRIL](https://deployforward.com/mithril) - Zero-trust AI solutions**

*© 2025 MITHRIL & Deploy Forward. Securing AI for tomorrow.*
