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

# MITHRIL WHISPER

Privacy-focused voice transcription for Windows - **100% Local & Offline**

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

**That's it!** No configuration files needed, no login required, no environment variables, no internet connection needed. The app works immediately with local transcription.

## ✨ **Features**

- ✅ **100% Local Processing** - All transcription happens on your device
- ✅ **No Authentication Required** - No accounts, logins, or sign-ups
- ✅ **Works Completely Offline** - No internet connection needed
- ✅ **Zero Data Collection** - Maximum privacy, nothing leaves your device
- ✅ **Global Hotkeys** - Record from anywhere with customizable key combinations
- ✅ **Auto Text Injection** - Transcribed text automatically appears in active applications
- ✅ **Desktop HUD** - Minimal overlay shows recording status
- ✅ **Flexible Hotkeys** - Use any key combination (F6, Ctrl+A, Alt+Space, etc.)
- ✅ **Audio Ducking** - Automatically reduces background volume during recording
- ✅ **Text Cleanup** - Removes filler words and improves formatting

## ⚙️ **Configuration**

### **Hotkey Settings**
- **Default Recording Hotkey**: F6 (can be changed to any key combination)
- **Flexible Setup**: Click the hotkey field in Settings and press your preferred key combination
- **Examples**: F6, Ctrl+A, Alt+Space, Shift+F1, Ctrl+Alt+D

### **Audio Settings**
- **Voice Activity Detection**: Adjust sensitivity for better recording detection
- **Audio Ducking**: Reduce background volume during recording (0-100%)
- **Whisper Model**: Choose between speed vs accuracy (tiny, base models included)

### **Text Settings**
- **Auto-inject**: Automatically paste transcribed text into active application
- **Text Cleanup**: Remove filler words and improve formatting

## 🔧 **Development Setup**

### **Prerequisites**
- Node.js (v16 or higher)
- npm (comes with Node.js)

### **First-Time Setup**
```bash
# Clone the repository
git clone https://github.com/boshjerns/MithrilWhisperApp.git
cd MithrilWhisperApp/mithril-whisper-windows

# Install dependencies
npm install

# Start development server (this creates the necessary webpack configuration)
npm run dev
```

**Note**: The first `npm run dev` command automatically creates the required webpack configuration files (`webpack.renderer.config.js` and `webpack.main.config.js`) that are needed for the development server to work properly.

### **Available Scripts**
```bash
# Development
npm run dev              # Start development server with hot reload

# Building
npm run build           # Build for production
npm run package:win     # Build Windows installer
npm run dist:portable   # Create portable Windows build

# Testing
npm test               # Run tests
```

## 🔐 **Privacy & Security**

### **Complete Privacy**
- **🔒 Local Transcription**: All voice-to-text processing uses open-source Whisper.cpp models running entirely on your device
- **🗑️ Immediate Cleanup**: Audio files are automatically deleted after transcription completes
- **🛡️ Zero Data Transmission**: Your spoken words and transcriptions never leave your device
- **🚫 No Telemetry**: No usage tracking, analytics, or data collection of any kind
- **🔓 No Authentication**: No accounts, logins, or external services required

### **How It Works**
1. **Press hotkey** anywhere on your computer
2. **Speak clearly** into your microphone
3. **Release hotkey** when finished
4. **Text appears** automatically in the active application

Audio is processed locally using bundled Whisper.cpp models and immediately deleted after transcription.

## 📁 **Project Structure**

```
mithril-whisper-windows/
├── src/
│   ├── main/                    # Electron main process
│   │   ├── main.js             # Main application logic
│   │   ├── audio-recorder.js   # Audio capture handling
│   │   ├── text-processor.js   # Whisper integration & text cleanup
│   │   ├── whisper-local.js    # Local Whisper implementation
│   │   └── volume-manager.js   # Audio ducking functionality
│   ├── renderer/               # React frontend
│   │   ├── App.js              # Main application component
│   │   ├── components/         # React components
│   │   │   ├── Settings.js     # Settings configuration
│   │   │   ├── DesktopHUD.js   # Recording status overlay
│   │   │   ├── HotkeySelector.js # Hotkey configuration
│   │   │   └── ...             # Other UI components
│   │   └── styles.css          # Application styles
│   └── shared/                 # Shared utilities
│       └── text-utils.js       # Text processing utilities
├── whisper-cpp/                # Bundled Whisper.cpp binaries and models
│   ├── main.exe               # Whisper.cpp executable
│   ├── ggml-tiny-q5_1.bin     # Tiny model (fast, basic accuracy)
│   └── ...                    # Additional model files
├── webpack.renderer.config.js  # Webpack config for renderer process (auto-created)
├── webpack.main.config.js      # Webpack config for main process (auto-created)
├── package.json               # Dependencies and scripts
└── README.md                  # This file
```

## 🎯 **Model Selection**

### **Bundled Models (No Download Required)**
- **tiny-q5_1**: Fastest transcription, basic accuracy (~16MB) - **Included by default**

### **Optional Models (Manual Download for Better Accuracy)**
1. **Download additional models**:
   ```bash
   # Navigate to whisper-cpp directory
   cd whisper-cpp
   
   # Download base model (recommended for better accuracy)
   curl -L https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-base.en.bin -o ggml-base.en.bin
   ```

2. **Select model in app**:
   - Open Settings
   - Choose model from dropdown
   - Restart app to apply changes

### **Model Comparison**
- **tiny-q5_1** (16MB): Fast, basic accuracy - Good for quick notes
- **base.en** (140MB): Better accuracy - Recommended for most users
- **small** (250MB): High accuracy - Professional quality
- **medium** (750MB): Very high accuracy - Best quality

## 🛠️ **Troubleshooting**

### **Common Issues**

#### **Recording Not Working**
- Check microphone permissions in Windows settings
- Verify microphone works in other applications
- Try different microphone in Windows sound settings
- Restart the application

#### **Hotkey Not Responding**
- Check for conflicts with other applications
- Try different key combination in Settings
- Restart app after changing hotkey
- Ensure app has focus or try running as administrator

#### **Development Server Won't Start**
- Ensure Node.js v16+ is installed
- Delete `node_modules` and run `npm install` again
- Check if ports 37843 is available
- Webpack config files are auto-created on first run

#### **Poor Transcription Quality**
- Speak clearly and directly into microphone
- Reduce background noise
- Adjust VAD sensitivity in Settings
- Try a larger Whisper model (base.en recommended)

#### **App Won't Build/Package**
- Run `npm run build` first to check for errors
- Ensure all dependencies are installed
- Check that whisper-cpp directory contains all required files

## 🏗️ **Building from Source**

### **Development Build**
```bash
npm install
npm run dev
```

### **Production Build**
```bash
# Build the application
npm run build

# Create Windows installer
npm run package:win

# Create portable version
npm run dist:portable
```

### **Build Configuration**
The app automatically bundles Whisper.cpp binaries and models:

```json
"extraResources": [
  {
    "from": "whisper-cpp",
    "to": "whisper-cpp", 
    "filter": ["**/*"]
  }
],
"asarUnpack": [
  "whisper-cpp/**"
]
```

This ensures all Whisper components work offline without downloads.

## 🤝 **Contributing**

We welcome contributions! Please ensure:
- Code follows existing patterns
- Tests pass: `npm test`
- Build succeeds: `npm run build`

### **Development Workflow**
```bash
git clone https://github.com/boshjerns/MithrilWhisperApp.git
cd MithrilWhisperApp/mithril-whisper-windows
npm install
npm run dev
```

## 📄 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 **Acknowledgments**

- **[OpenAI Whisper](https://github.com/openai/whisper)** - Speech recognition model
- **[whisper.cpp](https://github.com/ggerganov/whisper.cpp)** - C++ implementation of Whisper
- **[Electron](https://electronjs.org/)** - Cross-platform app framework
- **[React](https://reactjs.org/)** - UI framework

## 📞 **About Mithril**

Mithril Whisper is part of the **Mithril** suite - open-source, privacy-focused AI tools designed for maximum security and offline operation. Built by [Deploy Forward](https://www.deployforward.com/), we specialize in secure AI solutions for organizations with strict privacy requirements.

**Developer**: Josh Berns  
- GitHub: [@boshjerns](https://github.com/boshjerns)
- Twitter: [@boshjerns](https://x.com/boshjerns)

For enterprise solutions and consulting, visit [Deploy Forward](https://www.deployforward.com/).

---

**Built with ❤️ for privacy-focused voice assistance**

*Mithril Whisper - Where your voice stays private*