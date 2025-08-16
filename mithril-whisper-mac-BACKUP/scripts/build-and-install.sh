#!/bin/bash

# 🚀 MITHRIL WHISPER - Build and Install Script
# Creates a clean PKG installer and opens it for installation

set -e  # Exit on any error

echo "🔧 MITHRIL WHISPER - Build and Install"
echo "======================================"

# Get script directory and project root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

cd "$PROJECT_ROOT"

echo ""
echo "📁 Working directory: $PROJECT_ROOT"

# Clean any existing PKG installation records
echo ""
echo "🧹 Step 1: Cleaning existing installation records..."
if pkgutil --pkgs | grep -q "com.voiceassistant"; then
    echo "   Removing old package records..."
    for pkg in $(pkgutil --pkgs | grep "com.voiceassistant"); do
        echo "   Forgetting: $pkg"
        sudo pkgutil --forget "$pkg" 2>/dev/null || true
    done
else
    echo "   No existing package records found"
fi

# Clean dist directory
echo ""
echo "🗑️  Step 2: Cleaning build directory..."
rm -rf dist/
echo "   Removed dist/ directory"

# Build the application
echo ""
echo "🏗️  Step 3: Building application..."
npm run build
echo "   Build completed"

# Package the application
echo ""
echo "📦 Step 4: Creating PKG installer..."
npm run package

# Find the created PKG
PKG_FILE=$(find dist -name "*.pkg" | head -1)

if [ -z "$PKG_FILE" ]; then
    echo "❌ Error: No PKG file found in dist/"
    echo "   Build may have failed. Check the output above."
    exit 1
fi

echo "✅ PKG created: $PKG_FILE"

# Get PKG info
PKG_SIZE=$(du -h "$PKG_FILE" | cut -f1)
echo "   Size: $PKG_SIZE"

echo ""
echo "🎯 Step 5: Opening installer..."
echo "   This will open the macOS installer"
echo "   Follow the prompts to install to /Applications"

# Open the PKG file
open "$PKG_FILE"

echo ""
echo "✅ SUCCESS! Installation process started"
echo ""
echo "📋 What happens next:"
echo "   1. The macOS installer will open"
echo "   2. Follow the installation prompts"
echo "   3. The app will be installed to /Applications"
echo "   4. Look for 'MithrilWhisper' in your Applications folder"
echo ""
echo "🔍 After installation, you can run:"
echo "   open /Applications/MithrilWhisper.app"
echo ""
