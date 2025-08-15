# 🚀 MITHRIL WHISPER Setup Guide

## 📋 Quick Start for Contributors

### 1️⃣ **Clone & Install**
```bash
git clone [YOUR_REPO_URL]
cd mithril-whisper-mac
npm install
```

### 2️⃣ **Create Required Configuration Files**

The following files are not included in the repository for security reasons. Copy the examples and customize:

```bash
# Copy webpack configurations
cp webpack.main.config.EXAMPLE.js webpack.main.config.js
cp webpack.renderer.config.EXAMPLE.js webpack.renderer.config.js

# Copy package.json template  
cp package.EXAMPLE.json package.json

# Copy environment template
cp env.example .env
```

### 3️⃣ **Configure Your Environment**

Edit `.env` with your credentials:
```bash
# Supabase (get from https://supabase.com dashboard)
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key

# OpenAI (optional - get from https://platform.openai.com)
OPENAI_API_KEY=sk-your_openai_key

# Apple Developer (for building/signing on macOS)
CSC_NAME=Developer ID Application: Your Name (YOUR_TEAM_ID)
APPLE_ID=your_apple_id@example.com
APPLE_ID_PASSWORD=your_app_specific_password
APPLE_TEAM_ID=YOUR_TEAM_ID
```

### 4️⃣ **Update package.json**

Edit `package.json` and replace `YOUR_APPLE_TEAM_ID_HERE` with your actual Apple Team ID (only needed for macOS builds).

### 5️⃣ **Run the Application**

```bash
# Development mode
npm run dev

# Build for production
npm run build

# Package for distribution (requires Apple Developer account)
npm run package
```

## 🔐 **Security Notes**

- **Never commit** your actual `.env`, `webpack.*.config.js`, or customized `package.json` files
- These files contain sensitive credentials and are automatically ignored by git
- Use different credentials for development vs production
- Keep your Apple Developer credentials secure

## 🆘 **Need Help?**

- Check the example files for configuration guidance
- Create an issue if you're stuck with setup
- Contact: [YOUR_EMAIL] for enterprise support

## 📁 **File Structure**

```
├── webpack.main.config.EXAMPLE.js      # Template for main webpack config
├── webpack.renderer.config.EXAMPLE.js  # Template for renderer webpack config  
├── package.EXAMPLE.json                # Template for package.json
├── env.example                         # Template for environment variables
├── src/                                # Source code (safe to commit)
├── build/                              # Build outputs (ignored)
└── dist/                               # Distribution files (ignored)
```

---

**🛡️ This approach keeps sensitive data secure while allowing easy setup for contributors!**
