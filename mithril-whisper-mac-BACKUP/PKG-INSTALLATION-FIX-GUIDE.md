# 🚀 PKG Installation Fix Guide - MithrilWhisper

## 📋 Problem Summary

**Issue**: MithrilWhisper PKG installer was installing to a deep distribution folder instead of `/Applications`, making it impossible for users to find and run the app properly.

**Root Cause**: electron-builder PKG configuration was not properly setting the installation location, causing the installer to target the build directory instead of the system Applications folder.

## 🔍 Investigation Process

### What We Discovered

1. **App Bundle vs PKG Installer Confusion**
   - We were running the app bundle directly from `dist/mac-arm64/MithrilWhisper.app`
   - This bypassed the PKG installer entirely
   - The PKG installer had separate configuration issues

2. **PKG Configuration Missing Key Settings**
   - `installLocation` was not being properly applied by electron-builder
   - PKG Distribution file was missing installation path directives
   - App ID conflicts between different package versions

3. **Why PKG vs DMG Matters for This App**
   - Embedded whisper-cpp binaries need specific permissions
   - Code signing works better with automated PKG installation
   - Path consistency is critical for binary execution

## ✅ The Complete Solution

### 1. Fixed package.json Configuration

**Key Changes Made:**

```json
{
  "build": {
    "appId": "com.voiceassistant.mithrilwhisper",
    "productName": "MithrilWhisper",
    "mac": {
      "target": [
        {
          "target": "pkg",
          "arch": ["arm64", "x64"]
        }
      ],
      "category": "public.app-category.productivity",
      "icon": "build/icon.icns",
      "hardenedRuntime": true,
      "gatekeeperAssess": false,
      "entitlements": "build/entitlements.mac.plist",
      "entitlementsInherit": "build/entitlements.mac.plist",
      "notarize": {
        "teamId": "D763V8H675"
      }
    },
    "pkg": {
      "installLocation": "/Applications",
      "allowAnywhere": false,
      "allowCurrentUserHome": false,
      "allowRootDirectory": false,
      "isRelocatable": false,
      "isVersionChecked": true
    }
  }
}
```

**Critical PKG Settings:**
- `installLocation: "/Applications"` - Forces installation to proper location
- `allowAnywhere: false` - Prevents user from installing elsewhere
- `isRelocatable: false` - Ensures consistent paths
- `isVersionChecked: true` - Proper upgrade handling

### 2. Enhanced Build Scripts

**Added to package.json scripts:**

```json
{
  "scripts": {
    "package:install": "npm run package && npm run open:installer",
    "build:install": "./scripts/build-and-install.sh",
    "open:installer": "find dist -name '*.pkg' -exec open {} \\; || (echo 'No PKG found in dist/, building...' && npm run package && find dist -name '*.pkg' -exec open {} \\;)"
  }
}
```

### 3. Created Automated Build Script

**File: `scripts/build-and-install.sh`**

```bash
#!/bin/bash

# 🚀 MITHRIL WHISPER - Build and Install Script
# Creates a clean PKG installer and opens it for installation

set -e  # Exit on any error

echo "🔧 MITHRIL WHISPER - Build and Install"
echo "======================================"

# Clean any existing PKG installation records
echo "🧹 Step 1: Cleaning existing installation records..."
if pkgutil --pkgs | grep -q "com.voiceassistant"; then
    echo "   Removing old package records..."
    for pkg in $(pkgutil --pkgs | grep "com.voiceassistant"); do
        echo "   Forgetting: $pkg"
        sudo pkgutil --forget "$pkg" 2>/dev/null || true
    done
fi

# Clean dist directory
echo "🗑️  Step 2: Cleaning build directory..."
rm -rf dist/
echo "   Removed dist/ directory"

# Build and package
echo "🏗️  Step 3: Building application..."
npm run build

echo "📦 Step 4: Creating PKG installer..."
npm run package

# Find and open the PKG
PKG_FILE=$(find dist -name "*.pkg" | head -1)
if [ -n "$PKG_FILE" ]; then
    echo "✅ PKG created: $PKG_FILE"
    echo "🎯 Opening installer..."
    open "$PKG_FILE"
    echo "✅ SUCCESS! Installation process started"
else
    echo "❌ Error: No PKG file found!"
    exit 1
fi
```

## 🧪 Testing and Verification Process

### 1. Test PKG Configuration

```bash
# Extract and examine PKG contents
pkgutil --expand dist/MithrilWhisper-1.0.0-arm64.pkg temp-check
cat temp-check/Distribution
cat temp-check/com.voiceassistant.mithrilwhisper.pkg/PackageInfo
```

**Look for in PackageInfo:**
```xml
install-location="/Applications"
```

### 2. Test Installation

```bash
# Install the PKG
sudo installer -pkg dist/MithrilWhisper-1.0.0-arm64.pkg -target /

# Verify installation location
ls -la /Applications/MithrilWhisper.app
```

### 3. Test PKG Validation (For Signed/Notarized PKGs)

```bash
# Test PKG acceptance
spctl -a -vvv -t install dist/MithrilWhisper-1.0.0-arm64.pkg

# Should show:
# accepted
# source=Notarized Developer ID
# origin=Developer ID Installer: [Your Name] ([Team ID])
```

## 🔧 Code Signing & Notarization Process

### Environment Variables for Signing

```bash
export CSC_IDENTITY_AUTO_DISCOVERY=false
export CSC_NAME="Joshua Bernstein (D763V8H675)"
export APPLE_ID="boshjerns@gmail.com"
export APPLE_APP_SPECIFIC_PASSWORD="nkkl-yiot-crzb-sfms"
export APPLE_TEAM_ID="D763V8H675"
```

### Full Signed Build Process

```bash
# Clean build with signing
sudo rm -rf dist/
CSC_IDENTITY_AUTO_DISCOVERY=false \
CSC_NAME="Joshua Bernstein (D763V8H675)" \
APPLE_ID="boshjerns@gmail.com" \
APPLE_APP_SPECIFIC_PASSWORD="nkkl-yiot-crzb-sfms" \
APPLE_TEAM_ID="D763V8H675" \
npm run package

# Manual notarization if needed
xcrun notarytool submit dist/MithrilWhisper-1.0.0-arm64.pkg \
  --apple-id "boshjerns@gmail.com" \
  --password "nkkl-yiot-crzb-sfms" \
  --team-id "D763V8H675" \
  --wait

# Staple the notarization
xcrun stapler staple dist/MithrilWhisper-1.0.0-arm64.pkg
```

## 🎯 Key Lessons Learned

### 1. PKG vs DMG for Complex Apps

**Use PKG when:**
- App has embedded binaries that need specific permissions
- Consistent installation paths are critical
- App requires admin privileges for proper setup
- Code signing and notarization need to cover multiple components

**Use DMG when:**
- Simple app with no special requirements
- User flexibility in installation location is desired
- No embedded binaries or permission issues

### 2. electron-builder PKG Configuration Gotchas

**Critical Settings:**
- Must set both `mac.target` to include "pkg" AND configure `pkg` section
- `installLocation` must be explicit - doesn't default to /Applications
- `isRelocatable: false` prevents path confusion
- App ID conflicts can cause installation issues

### 3. Testing Installation Properly

**Always test the actual installer, not the app bundle:**
- Run the PKG installer, don't just run from dist/
- Test on a clean system or after `pkgutil --forget`
- Verify with `spctl` for signed packages

## 🚨 Common Pitfalls to Avoid

1. **Running app bundle directly** instead of testing PKG installer
2. **Forgetting to set `installLocation`** in PKG configuration
3. **Not cleaning previous installations** before testing
4. **Mixing up app IDs** between different builds
5. **Assuming DMG and PKG behave the same** for complex apps

## 📝 Quick Reference Commands

### Build and Test Locally
```bash
npm run build:install
```

### Clean Build for Distribution
```bash
sudo rm -rf dist/
npm run package
```

### Test PKG Installation
```bash
sudo installer -pkg dist/*.pkg -target /
ls -la /Applications/MithrilWhisper.app
```

### Verify Signed PKG
```bash
spctl -a -vvv -t install dist/*.pkg
```

## 🎉 Final Result

With these changes, the PKG installer now:
- ✅ Installs to `/Applications` automatically
- ✅ Sets proper permissions on all binaries
- ✅ Works with code signing and notarization
- ✅ Provides consistent user experience
- ✅ Supports both ARM64 and Intel architectures

**The key insight**: For apps with embedded binaries like whisper-cpp, PKG installers with proper configuration are essential for reliable distribution.
