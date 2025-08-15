# 🚨 SECURITY SETUP GUIDE for MITHRIL WHISPER

**⚠️ CRITICAL: Follow this guide before pushing to public repositories!**

## 📋 Pre-GitHub Checklist

### ✅ **REQUIRED: Clean Sensitive Files**

1. **Replace webpack configs with example versions:**
   ```bash
   # Remove the configs with hardcoded secrets
   rm webpack.main.config.js webpack.renderer.config.js
   
   # Use the sanitized examples
   cp webpack.main.config.EXAMPLE.js webpack.main.config.js
   cp webpack.renderer.config.EXAMPLE.js webpack.renderer.config.js
   ```

2. **Replace package.json with sanitized version:**
   ```bash
   # Backup current package.json (has your Apple Team ID)
   cp package.json package.json.PRIVATE
   
   # Use sanitized version
   cp package.EXAMPLE.json package.json
   
   # Edit package.json and replace YOUR_APPLE_TEAM_ID_HERE with your actual Team ID
   ```

3. **Create environment file:**
   ```bash
   # Copy template
   cp env.example .env
   
   # Edit .env with your actual credentials (never commit this file!)
   ```

4. **Set up proper .gitignore:**
   ```bash
   # Use the security-focused gitignore
   cp .gitignore.SECURITY .gitignore
   ```

### 🔐 **Environment Variables Setup**

Create `.env` file with your actual values:

```bash
# Supabase (from your project dashboard)
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_ANON_KEY=your_actual_anon_key

# OpenAI (optional, for local mode)
OPENAI_API_KEY=sk-your_openai_key

# Apple Developer (for building/signing)
CSC_NAME=Developer ID Application: Your Name (YOUR_TEAM_ID)
APPLE_ID=your_apple_id@example.com  
APPLE_ID_PASSWORD=your_app_specific_password
APPLE_TEAM_ID=YOUR_TEAM_ID
```

## 🚫 **NEVER COMMIT THESE FILES:**

❌ **Files with sensitive data:**
- `.env` (any environment files)
- `webpack.main.config.js` (if it has hardcoded Supabase creds)
- `webpack.renderer.config.js` (if it has hardcoded Supabase creds)
- `package.json` (if it has your real Apple Team ID)
- Any files with personal email addresses
- Certificates, keys, or signing materials

✅ **Safe to commit:**
- `webpack.main.config.EXAMPLE.js`
- `webpack.renderer.config.EXAMPLE.js`
- `package.EXAMPLE.json`
- `env.example`
- `About.EXAMPLE.js`
- All source code files
- Documentation

## 🔧 **For Contributors/Users:**

### First-time setup:
1. Clone the repository
2. Copy example files:
   ```bash
   cp webpack.main.config.EXAMPLE.js webpack.main.config.js
   cp webpack.renderer.config.EXAMPLE.js webpack.renderer.config.js
   cp package.EXAMPLE.json package.json
   cp env.example .env
   ```
3. Edit `.env` with your credentials
4. Edit `package.json` and replace `YOUR_APPLE_TEAM_ID_HERE` with your Apple Team ID
5. Run `npm install`

### Building:
```bash
# Development
npm run dev

# Production build
npm run build

# Package for distribution (requires Apple Developer account)
npm run package
```

## 🛡️ **Security Best Practices**

### For Developers:
1. **Never hardcode secrets** in source files
2. **Use environment variables** for all sensitive configuration
3. **Rotate credentials** regularly
4. **Use different credentials** for development/production
5. **Review commits** before pushing to ensure no secrets leaked

### For Users:
1. **Keep your .env file private** and secure
2. **Don't share your Apple Developer credentials**
3. **Use app-specific passwords** for Apple ID
4. **Enable 2FA** on all accounts (Apple, Supabase, OpenAI)

## 🆘 **Emergency: Secret Already Committed?**

If you accidentally committed sensitive information:

1. **Immediately rotate the exposed credentials:**
   - Regenerate Supabase keys
   - Regenerate OpenAI API keys
   - Create new Apple app-specific password

2. **Remove from Git history:**
   ```bash
   # WARNING: This rewrites Git history!
   git filter-branch --force --index-filter \
   'git rm --cached --ignore-unmatch webpack.main.config.js' \
   --prune-empty --tag-name-filter cat -- --all
   ```

3. **Force push clean history:**
   ```bash
   git push origin --force --all
   ```

## 📞 **Support**

For security questions or if you've accidentally exposed credentials:
- Create an issue in the repository (don't include the actual secrets!)
- Contact: [YOUR_EMAIL@DOMAIN.COM]

---

**🔒 Remember: Security is a process, not a product. Stay vigilant!**
