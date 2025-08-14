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

# Mithril Whisper

A powerful, privacy-focused voice-to-text application built with Electron and React. Features real-time transcription with bundled Whisper models, AI assistant integration, and runs completely locally on your computer.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Platform](https://img.shields.io/badge/platform-Windows%20%7C%20macOS%20%7C%20Linux-lightgrey.svg)

## Features

### Core Functionality
- **Global Hotkey Recording**: Press `Alt+Space` (configurable) anywhere to start/stop recording
- **Real-time Transcription**: Uses bundled Whisper.cpp models - no internet required
- **Smart Text Cleanup**: Automatic removal of filler words, punctuation fixes, and capitalization
- **Auto Text Injection**: Cleaned text is automatically pasted into the active application
- **Live Overlay**: Floating transparent overlay shows transcription progress
- **AI Assistant**: Optional OpenAI integration for text processing and coding help

### Privacy & Performance
- **100% Local Processing**: All audio processing happens on your device
- **Bundled Models**: Whisper.cpp binaries and models included - works offline
- **Fast & Efficient**: Low CPU usage when idle, optimized for real-time processing
- **Cross-platform**: Works on Windows, macOS, and Linux

### User Interface
- **Modern Dark UI**: Clean, professional interface with smooth animations
- **Transcription History**: View, copy, and re-inject past transcriptions
- **Flexible Settings**: Configure hotkeys, models, sensitivity, and cleanup rules
- **System Tray Integration**: Runs quietly in the background

## About Mithril - Zero-Trust AI Solutions

Mithril Whisper is part of the **Mithril** suite - our open-source, air-gapped, zero-trust LLM solutions designed for organizations with strict security requirements. Built by [Deploy Forward](https://www.deployforward.com/), we specialize in secure AI systems for government agencies and contractors.

Our bundled systems allow productive use of LLMs in coding IDEs and chat assistants without internet connectivity. With a small hardware investment ($1,000-$2,000), organizations can run high-quality local models that never transmit data externally, providing all the benefits of modern AI in a completely isolated environment.

Visit [deployforward.com](https://www.deployforward.com/) to book a demo and learn how we can build secure AI solutions tailored to your organization's needs.

## Local Model Packaging

Mithril Whisper keeps everything local by bundling Whisper.cpp directly into the application:

### How Models Are Packaged:
- **Whisper.cpp Binaries**: Pre-compiled binaries included in `whisper-cpp/` directory
- **Model Files**: GGML format models (`.bin` files) bundled with the installer
- **Auto-Detection**: App automatically finds bundled models in multiple locations:
  - `extraResources/whisper-cpp/` (production builds)
  - `app.asar.unpacked/whisper-cpp/` (fallback)
  - Local `whisper-cpp/` (development)

### Build Configuration:
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

This ensures all Whisper components are available offline without any downloads or API calls.

## Quick Start

### Installation Options

#### Option 1: Local Development (Zero Data Collection)
Perfect for maximum privacy - no account required, no telemetry:

```bash
# Clone the repository
git clone https://github.com/boshjerns/MITHRILWHISPER.git
cd MITHRILWHISPER/mithril-whisper-windows

# Install dependencies
npm install

# Run in development mode
npm run dev
```

#### Option 2: Official Installer (With Usage Analytics)
Download the official installer from our releases page. Requires Mithril account creation and includes minimal usage analytics to help improve the product.

### First-Time Setup

1. **Launch the application**
2. **Account Setup**:
   - **Local development**: No account needed
   - **Installer version**: Create Mithril account when prompted
3. **Configure AI Assistant (Optional)**:
   - Go to **Settings** tab
   - Add your [OpenAI API key](https://platform.openai.com/api-keys) to enable AI features
   - Select your preferred model (GPT-4o Mini recommended)
4. **Configure Recording**:
   - Set your preferred global hotkey (default: `Alt+Space`)
   - Whisper models are already bundled - no additional setup needed

## Usage

### Recording Voice

Press and hold your configured hotkey anywhere on your computer, speak clearly, then release. The transcribed text appears in the overlay and is automatically injected into the active application.

### Using the AI Assistant

Say "whisper [your request]" during recording to activate the AI assistant:
- "whisper fix this code" (with text selected)
- "whisper rewrite this professionally"
- "whisper explain this"

## Configuration

### Model Selection

Bundled Whisper models (no download required):
- **tiny-q5_1**: Fastest, basic accuracy (~16MB) - Quantized for optimal performance
- **base.en**: Good balance (~140MB) - **Recommended** - English-only model with better accuracy

### OpenAI Integration (Optional)

For AI assistant features:
1. Get API key from [OpenAI Platform](https://platform.openai.com/api-keys)
2. Add to Settings → OpenAI API Key
3. Select model (GPT-4o Mini recommended for cost efficiency)

**Cost Estimation:**
- GPT-4o Mini: ~$0.001-0.01 per voice interaction
- GPT-4o: ~$0.01-0.10 per voice interaction

## Development

### Project Structure

```
MITHRILWHISPER/mithril-whisper-windows/
├── src/
│   ├── main/                    # Electron main process
│   │   ├── main.js             # Main application logic
│   │   ├── audio-recorder.js   # Audio capture handling
│   │   ├── text-processor.js   # Whisper integration & text cleanup
│   │   └── whisper-local.js    # Local Whisper implementation
│   ├── renderer/               # React frontend
│   │   ├── App.js              # Main application component
│   │   ├── components/         # React components
│   │   └── styles.css          # Application styles
│   └── shared/                 # Shared utilities
├── whisper-cpp/                # Bundled Whisper.cpp binaries and models
├── package.json               # Dependencies and scripts
└── README.md                  # This file
```

### Available Scripts

```bash
# Development
npm run dev              # Start development server

# Building
npm run build           # Build for production
npm run package:win     # Build Windows installer
npm run dist:portable   # Create portable Windows build

# Testing
npm test               # Run tests
```

### Building from Source

```bash
# Install dependencies
npm install

# Build the application
npm run build

# Create installer (Windows)
npm run package:win

# Create portable version
npm run dist:portable
```

## Troubleshooting

### Common Issues

#### Recording Not Working
- Check microphone permissions in system settings
- Verify microphone works in other applications
- Try different input device in app settings

#### Hotkey Not Responding
- Check for conflicts with other applications
- Try different key combination in Settings
- Restart app after changing hotkey

#### AI Assistant Not Working
- Ensure OpenAI API key is configured in Settings
- Check internet connection (AI features require internet)
- Verify API key has available credits

#### Poor Transcription Quality
- Speak clearly into microphone
- Reduce background noise
- Try larger Whisper model in Settings
- Adjust VAD sensitivity

## Architecture

### Local vs Cloud Mode

**Local Mode (Default)**
- No external credentials required
- All features work offline except AI assistant
- AI assistant uses direct OpenAI API calls (if configured)
- Perfect for personal use and privacy

**Cloud Mode (Optional)**
- Requires SUPABASE_URL and SUPABASE_ANON_KEY environment variables
- Enables user authentication and cloud storage
- Uses Supabase Edge Functions for AI (more secure)
- Better for team/enterprise deployments

### Privacy & Security

- **Local Processing**: All audio processing happens on your device
- **Bundled Dependencies**: Whisper models included - no downloads
- **Secure Storage**: API keys stored locally in encrypted storage
- **Transparent Data Practices**: See Data Collection section below for full details

## Data Collection & Privacy Policy

### Local Development Setup (No Data Collection)
When running from source code locally:
- **Zero Telemetry**: No usage data, analytics, or telemetry collected
- **No Account Required**: Run completely anonymously
- **Fully Offline**: Works without internet (except optional OpenAI assistant)
- **Your Data Stays Local**: Audio, transcriptions, and settings never leave your device

### Installer Version (Minimal Usage Analytics)
When using the official installer:
- **Account Required**: Create a Mithril account to use the application
- **Usage Analytics Only**: We collect minimal usage statistics to improve the product:
  - Number of recording sessions
  - Session duration
  - Whisper model used
  - Assistant interaction counts (when used)
- **AI Assistant Metrics** (if you use OpenAI integration):
  - Character count of prompts sent
  - Character count of responses received
  - Word count statistics
  - Model type used (e.g., GPT-4o-mini)
- **What We DON'T Collect**:
  - Audio recordings
  - Transcribed text content
  - Personal conversations
  - File contents or code
  - Specific prompts or responses

### Why We Collect This Data
Usage analytics help us:
- Understand which features are most valuable
- Optimize performance for common use cases
- Plan future development priorities
- Ensure assistant features meet user needs

### Your Control
- **Choose Your Privacy Level**: Use local setup for zero data collection
- **Transparent Analytics**: All collected data is aggregated and anonymized
- **Data Retention**: Usage statistics are retained for product improvement only
- **No Selling**: We never sell or share user data with third parties

## Developer

**Josh Berns** - Software Developer  
- GitHub: [@boshjerns](https://github.com/boshjerns)
- Twitter: [@boshjerns](https://x.com/boshjerns)

For enterprise solutions and consulting, visit [Deploy Forward](https://www.deployforward.com/).

## Contributing

We welcome contributions! Please ensure:
- Code follows existing patterns
- Tests pass: `npm test`
- Build succeeds: `npm run build`

### Development Setup

```bash
git clone https://github.com/boshjerns/MITHRILWHISPER.git
cd MITHRILWHISPER/mithril-whisper-windows
npm install
npm run dev
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- **[OpenAI Whisper](https://github.com/openai/whisper)** - Speech recognition model
- **[whisper.cpp](https://github.com/ggerganov/whisper.cpp)** - C++ implementation of Whisper
- **[Electron](https://electronjs.org/)** - Cross-platform app framework
- **[React](https://reactjs.org/)** - UI framework

---

**Built with ❤️ for privacy-focused voice assistance**

*Mithril Whisper - Where your voice stays private*