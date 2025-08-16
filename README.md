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

# Zero-Trust Voice Assistant Platform

**Mithril Whisper** is a privacy-focused, air-gapped voice-to-text platform designed for organizations and individuals who prioritize data security. Built for environments where sensitive information cannot leave local systems, it provides enterprise-grade speech recognition with military-level security.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-CC%20BY--NC--SA%204.0-lightgrey.svg)
![Platform](https://img.shields.io/badge/platform-Windows%20%7C%20macOS-lightgrey.svg)

## What is Mithril Whisper?

**Mithril Whisper** transforms speech into text using advanced AI models that run entirely on your local machine. No internet connection required. No data ever leaves your device. Perfect for government agencies, contractors, and privacy-conscious users who need powerful voice recognition without compromising security.

### Core Capabilities

- **Real-time Voice Transcription**: Convert speech to text as you speak
- **Global Hotkey Integration**: Record from anywhere in your system with a simple key combination
- **AI-Powered Text Processing**: Optional OpenAI integration for intelligent text enhancement
- **Smart Text Cleanup**: Automatic removal of filler words and intelligent formatting
- **Auto-Injection**: Seamlessly insert transcribed text into any application
- **100% Local Processing**: All audio processing happens on your device

### Privacy & Security First

- **Air-Gapped Operation**: Works completely offline
- **Zero Data Transmission**: Audio never leaves your computer  
- **Bundled AI Models**: Whisper.cpp models included - no downloads required
- **Enterprise-Grade Security**: Designed for classified and sensitive environments
- **Transparent Processing**: Open source - audit every line of code
- **Immediate File Deletion**: Audio files automatically deleted after transcription

## Why Mithril Whisper?

In today's digital landscape, voice recognition has become essential for productivity, but most solutions require sending your voice data to cloud servers. **Mithril Whisper** solves this fundamental privacy problem by bringing enterprise-grade speech recognition directly to your desktop.

### Built for Secure Environments

Whether you're working with:
- **Classified Information** - Government and military applications
- **Proprietary Code** - Software development in secure environments  
- **Confidential Documents** - Legal, medical, and financial sectors
- **Personal Privacy** - Anyone who values data sovereignty

**Mithril Whisper** ensures your voice data remains under your complete control.

## Platform Support

Navigate to the appropriate folder for your operating system:

### 📁 [mithril-whisper-windows/](./mithril-whisper-windows/)
Complete Windows implementation with:
- Bundled Whisper.cpp models and binaries
- Windows-optimized audio processing
- System integration and global hotkeys
- Comprehensive setup and usage documentation

### 📁 [mithril-whisper-mac/](./mithril-whisper-mac/)
Complete macOS implementation featuring:
- Native macOS integration
- Optimized for Apple Silicon and Intel Macs
- Seamless system-wide voice recognition
- Comprehensive setup and usage documentation

## Privacy & Telemetry Transparency

**Mithril Whisper** offers two distinct usage modes to meet different privacy and deployment needs:

### 🔒 **Local Development Mode** (Maximum Privacy)
Run the application directly from source code without any installation:

**Privacy Features:**
- ✅ **No Authentication Required**: Works immediately without login
- ✅ **Zero Telemetry**: No data collection or transmission whatsoever
- ✅ **Complete Offline Operation**: Never connects to internet
- ✅ **Voice Data Never Stored**: Audio files deleted immediately after transcription
- ✅ **Local AI Processing**: All transcription happens on your device using bundled Whisper.cpp

**Setup:** Clone repository → Install dependencies → Run locally

### 📦 **Installed Version** (Minimal Telemetry)
Pre-built applications for easy installation and updates:

**Authentication:**
- Requires user login for application access
- Login credentials managed through secure Supabase authentication

**Telemetry (AI Assistant Only):**
- **Voice Dictation**: Zero telemetry - completely private
- **AI Assistant Feature**: Minimal telemetry when actively used
  - Character count of text sent to/from AI assistant
  - Session duration and timestamps  
  - Model used (e.g., whisper-tiny)
  - Platform information (Windows/Mac)
  - **Content is NEVER tracked** - only statistical metadata

**What is NOT Tracked:**
- Voice recordings or audio data
- Transcription content or text
- Conversations with AI assistant
- Personal or sensitive information
- Usage outside of AI assistant feature

### Code Transparency
Our telemetry implementation is fully transparent. Here's the actual code showing what data is collected:

```javascript
// From src/main/main.js - AI Assistant usage tracking only
const payload = {
  transcript_chars_original: userPrompt.length,     // Character count only
  transcript_chars_cleaned: assistantReply.length, // Character count only
  metadata: {
    user_words: countWords(userPrompt),            // Word count only  
    assistant_words: countWords(assistantReply),   // Word count only
  }
  // NOTE: Actual content is NEVER included in telemetry
};
```

### Data Flow Summary
1. **Voice Input** → Local Whisper.cpp processing → **Transcribed Text** (100% local)
2. **AI Assistant** (optional) → Character count metadata → Encrypted transmission to OpenAI
3. **File Cleanup** → Audio files immediately deleted after processing

**Bottom Line:** Your voice never leaves your device. Only if you choose to use the AI assistant feature do we track minimal usage statistics (character counts, not content).

## About Mithril - Zero-Trust AI Solutions

**Mithril Whisper** is part of the larger **Mithril** ecosystem - our comprehensive suite of open-source, air-gapped, zero-trust AI solutions. Designed for organizations with stringent security requirements, Mithril enables productive use of cutting-edge AI technologies without compromising data security.

### Our Solutions Include:
- **Voice Recognition** (Mithril Whisper) - This repository
- **Code Assistants** - AI-powered development tools that work offline
- **Document Analysis** - Secure text processing and analysis
- **Custom AI Deployments** - Tailored solutions for specific organizational needs

With minimal hardware investment ($1,000-$2,000), organizations can deploy high-quality local AI models that never connect to the internet, providing all the benefits of modern AI in completely isolated environments.

## About Deploy Forward

**Deploy Forward** specializes in building secure AI systems for government agencies, defense contractors, and enterprises requiring the highest levels of data protection. We understand that in sensitive environments, the power of AI must be balanced with absolute security.

### Our Mission
To democratize access to advanced AI capabilities while maintaining complete data sovereignty and security. We believe organizations shouldn't have to choose between cutting-edge technology and data protection.

### Our Approach
- **Security by Design**: Every solution built with zero-trust principles
- **Open Source Transparency**: Full code visibility for security auditing
- **Local Processing**: AI that works without internet connectivity
- **Custom Solutions**: Tailored implementations for unique requirements

### Work With Us
Ready to implement secure AI in your organization? We provide:
- **Consultation**: Assessment of your AI and security needs
- **Custom Development**: Bespoke solutions for your environment
- **Training & Support**: Comprehensive onboarding for your team
- **Ongoing Maintenance**: Long-term partnership for success

**[Schedule a consultation →](https://www.deployforward.com/)**

## Developer

**Josh Berns** - Security-Focused AI Developer

Passionate about building AI solutions that respect privacy and maintain security. Specializing in air-gapped AI systems for sensitive environments where data protection is paramount.

- **GitHub**: [@boshjerns](https://github.com/boshjerns)
- **Twitter**: [@boshjerns](https://x.com/boshjerns)
- **Company**: [Deploy Forward](https://www.deployforward.com/)

## Getting Started

### Quick Setup - Local Development Mode (Maximum Privacy)

**Windows:**
```bash
git clone https://github.com/boshjerns/MithrilWhisperApp.git
cd MithrilWhisperApp/mithril-whisper-windows
npm install
npm run dev  # No authentication required, zero telemetry
```

**macOS:**
```bash
git clone https://github.com/boshjerns/MithrilWhisperApp.git
cd MithrilWhisperApp/mithril-whisper-mac
npm install
npm run dev  # No authentication required, zero telemetry
```

**Optional AI Assistant Setup:**
```bash
# Add OpenAI API key for enhanced text processing (optional)
cp env.example .env
# Edit .env and add: OPENAI_API_KEY=your_key_here
```

### Platform-Specific Documentation

1. **Choose Your Platform**: Navigate to the appropriate platform folder
2. **Follow Detailed Setup**: Each platform has comprehensive documentation
3. **Start Transcribing**: Begin using voice recognition immediately
4. **Enhance (Optional)**: Add OpenAI integration for advanced text processing

## Open Source Commitment

**Mithril Whisper** is available under the Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License for personal use, with commercial licensing available. We believe security through obscurity is a flawed approach - true security comes from transparency, peer review, and community validation.

### Contributing
We welcome contributions from the security and AI communities. Whether you're fixing bugs, adding features, or improving documentation, your input helps make voice recognition more secure for everyone.

## The Future of Secure AI

As AI becomes increasingly central to productivity, the need for secure, local AI solutions grows. **Mithril Whisper** represents our vision of a future where powerful AI capabilities and complete data privacy coexist.

Join us in building a more secure, privacy-respecting AI ecosystem.

---

**Built with ❤️ for organizations that value both innovation and security**

*Deploy Forward - Securing AI for Tomorrow*
# Last updated: 08/15/2025 10:02:21

