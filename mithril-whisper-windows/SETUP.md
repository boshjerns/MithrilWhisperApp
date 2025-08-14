# Setup Guide - Whisper Voice Assistant

This guide explains how to set up and configure the Whisper Voice Assistant for local or cloud deployment.

## 🏠 Local Mode Setup (Recommended)

Local mode is the default and provides maximum privacy. No external services are required except for the optional AI assistant feature.

### Step 1: Install Dependencies

```bash
# Clone the repository
git clone https://github.com/your-username/whisper-voice-assistant.git
cd whisper-voice-assistant

# Install Node.js dependencies
npm install
```

### Step 2: Run the Application

```bash
# Development mode (hot reload)
npm run dev

# Or build and run production
npm run build
npm run package:win  # Windows
npm run package:mac  # macOS
npm run package:linux  # Linux
```

### Step 3: Configure AI Assistant (Optional)

1. Launch the application
2. Go to **Settings** tab
3. Add your OpenAI API key in the "OpenAI API Key" field
4. Select your preferred model (GPT-4o Mini recommended)

**Getting an OpenAI API Key:**
1. Visit [OpenAI Platform](https://platform.openai.com/api-keys)
2. Create a new API key
3. Copy the key (starts with `sk-...`)
4. Paste it in the app settings

**Cost Estimation:**
- GPT-4o Mini: ~$0.001-0.01 per voice interaction
- GPT-4o: ~$0.01-0.10 per voice interaction

## ☁️ Cloud Mode Setup (Advanced)

Cloud mode enables user authentication, usage tracking, and server-side OpenAI integration through Supabase.

### Prerequisites

- Supabase account and project
- OpenAI API key (for server-side integration)

### Step 1: Supabase Setup

1. **Create Supabase Project**:
   - Visit [Supabase Dashboard](https://supabase.com/dashboard)
   - Create a new project
   - Copy your project URL and anon key

2. **Database Setup**:
   ```sql
   -- Run in Supabase SQL Editor
   create table if not exists public.app_config (
     key text primary key,
     value jsonb not null,
     updated_at timestamptz not null default now()
   );

   alter table public.app_config enable row level security;

   create policy "read app config"
   on public.app_config for select
   to authenticated
   using (true);

   insert into public.app_config(key, value)
   values (
     'assistant',
     jsonb_build_object(
       'model', 'gpt-4o-mini',
       'max_output_tokens', 800,
       'hudTheme', 'violet',
       'features', jsonb_build_object('enableAssistant', true, 'enableLocalWhisper', true)
     )
   )
   on conflict (key) do nothing;
   ```

3. **Deploy Edge Functions**:
   ```bash
   # Install Supabase CLI
   npm install -g supabase

   # Login and link project
   supabase login
   supabase link --project-ref your-project-ref

   # Deploy functions
   supabase functions deploy get-config
   supabase functions deploy assistant

   # Set OpenAI API key secret
   supabase secrets set OPENAI_API_KEY=sk-your-openai-key
   ```

### Step 2: Environment Configuration

Set environment variables for cloud mode:

**Windows:**
```cmd
set SUPABASE_URL=https://your-project.supabase.co
set SUPABASE_ANON_KEY=your-anon-key
npm run dev
```

**macOS/Linux:**
```bash
export SUPABASE_URL=https://your-project.supabase.co
export SUPABASE_ANON_KEY=your-anon-key
npm run dev
```

**Or create a `.env` file:**
```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
```

### Step 3: Authentication

In cloud mode, users can:
1. Create accounts through the app
2. Sign in to sync settings and usage data
3. Use server-side AI features (more secure)

## 🛠️ Development Setup

### Prerequisites

- Node.js 16+
- Git
- Code editor (VS Code recommended)

### Development Environment

```bash
# Clone and setup
git clone https://github.com/your-username/whisper-voice-assistant.git
cd whisper-voice-assistant
npm install

# Start development server
npm run dev

# The app will open with hot reload enabled
# Main window: Electron app
# DevTools: Automatically opened in development
```

### Project Structure

```
whisper-voice-assistant/
├── src/
│   ├── main/              # Electron main process
│   │   ├── main.js        # App lifecycle, IPC handlers
│   │   ├── audio-recorder.js  # Audio capture
│   │   ├── text-processor.js  # Whisper integration
│   │   └── whisper-local.js   # Local Whisper wrapper
│   ├── renderer/          # React frontend
│   │   ├── App.js         # Main component
│   │   ├── components/    # UI components
│   │   ├── auth/          # Authentication logic
│   │   └── styles.css     # Styles
│   └── shared/            # Shared utilities
├── whisper-cpp/           # Whisper.cpp binaries
├── models/                # Whisper model files
├── supabase/              # Edge functions (cloud mode)
├── package.json           # Dependencies
└── webpack.*.config.js    # Build configuration
```

### Building for Distribution

```bash
# Build production version
npm run build

# Package for Windows
npm run package:win

# Package for macOS
npm run package:mac

# Package for Linux
npm run package:linux
```

## 🔧 Troubleshooting

### Local Mode Issues

**App won't start:**
```bash
# Clear node modules and reinstall
rm -rf node_modules package-lock.json
npm install
npm run dev
```

**Whisper models not found:**
- Models are automatically downloaded on first use
- Check `models/` directory for downloaded models
- Manually download from [Hugging Face](https://huggingface.co/ggerganov/whisper.cpp) if needed

**OpenAI API errors:**
- Verify API key is correct and has credits
- Check internet connection
- Try a different model (gpt-3.5-turbo for testing)

### Cloud Mode Issues

**Supabase connection failed:**
- Verify SUPABASE_URL and SUPABASE_ANON_KEY
- Check project is active in Supabase dashboard
- Ensure RLS policies are correctly configured

**Edge function errors:**
- Check function deployment: `supabase functions list`
- Verify OPENAI_API_KEY secret: `supabase secrets list`
- Check function logs: `supabase functions logs`

### General Issues

**Recording not working:**
- Check microphone permissions
- Test microphone in other apps
- Try different input device in settings

**Hotkey conflicts:**
- Change global hotkey in settings
- Disable conflicting apps
- Try function keys (F1-F12)

## 📦 Distribution

### Creating Installers

The app can be packaged as:
- **Windows**: NSIS installer (`.exe`)
- **macOS**: DMG or PKG installer
- **Linux**: AppImage, DEB, or RPM

Configuration is in `package.json` under the `build` section.

### Signing (Optional)

For production releases, consider code signing:
- **Windows**: Use certificate from trusted CA
- **macOS**: Use Apple Developer certificate
- **Linux**: GPG signing for repositories

## 🚀 Deployment

### Self-Hosted (Local Mode)

Simply distribute the built application:
1. Run `npm run package`
2. Share the installer from `dist/` directory
3. Users run installer and use immediately

### Cloud Deployment

For teams/organizations:
1. Deploy Supabase project with Edge functions
2. Configure environment variables in CI/CD
3. Build and distribute app with Supabase credentials
4. Users authenticate through the app

## 📋 Checklist

Before distributing, ensure:

- [ ] App builds successfully on target platforms
- [ ] Whisper models are included or download automatically
- [ ] OpenAI API integration works (local mode)
- [ ] Supabase integration works (cloud mode)
- [ ] All hotkeys function properly
- [ ] Audio recording works on different systems
- [ ] Text injection works in various applications
- [ ] Error handling provides helpful messages
- [ ] Documentation is complete and accurate

## 🆘 Support

For additional help:
- Check the [main README](README.md)
- Browse [GitHub Issues](https://github.com/your-username/whisper-voice-assistant/issues)
- Create a new issue with detailed information
- Join community discussions

---

*This setup guide covers both local and cloud deployment options. Choose the approach that best fits your privacy requirements and technical needs.*
