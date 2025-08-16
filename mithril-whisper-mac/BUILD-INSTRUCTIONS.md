# 🔧 **Universal Whisper Build Instructions**

## 🚀 **Automated Build (Recommended)**

Run the automated build script to create universal binaries and upgrade to base-q5_1 model:

```bash
# From your project root
./scripts/build-universal-whisper.sh
```

This script will:
- ✅ Build universal Whisper.cpp binaries (Intel x64 + Apple Silicon arm64)
- ✅ Download base-q5_1 model (59.7MB) from [Hugging Face](https://huggingface.co/ggerganov/whisper.cpp/blob/main/ggml-base-q5_1.bin)
- ✅ Enable Metal acceleration for both architectures
- ✅ Backup existing binaries
- ✅ Verify installation

## 🏗️ **Manual Build (Advanced)**

If you prefer manual control:

```bash
# 1. Clone Whisper.cpp
git clone --depth 1 https://github.com/ggerganov/whisper.cpp.git
cd whisper.cpp

# 2. Build universal binaries
mkdir -p build && cd build
cmake .. \
    -DCMAKE_OSX_ARCHITECTURES="x86_64;arm64" \
    -DWHISPER_METAL=ON \
    -DWHISPER_METAL_NDEBUG=ON \
    -DCMAKE_BUILD_TYPE=Release \
    -DWHISPER_BUILD_EXAMPLES=ON

make -j$(sysctl -n hw.ncpu)

# 3. Verify universal binary
lipo -info main
# Should show: "Architectures in the fat file: main are: x86_64 arm64"

# 4. Download base-q5_1 model
curl -L -o ggml-base-q5_1.bin \
  https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-base-q5_1.bin

# 5. Copy to your project
cp main /path/to/mithril-whisper-mac/whisper-cpp/
cp ggml-base-q5_1.bin /path/to/mithril-whisper-mac/whisper-cpp/
```

## 🧪 **Verification**

Check that everything works:

```bash
# Verify binary architectures
cd whisper-cpp
lipo -info main
file main

# Test basic execution
./main --help

# Check model file
ls -lh ggml-base-q5_1.bin
```

## 📋 **What Changed**

**Binaries:**
- **Before**: arm64-only (Apple Silicon only)
- **After**: Universal binary (Intel x64 + Apple Silicon arm64)

**Model:**
- **Before**: tiny-q5_1 (39MB) - Fast but basic accuracy
- **After**: base-q5_1 (59.7MB) - Better accuracy, still efficient

**Compatibility:**
- **Before**: Only worked on Apple Silicon Macs
- **After**: Works on ALL Mac hardware (2019+ Intel Macs and Apple Silicon)

## 🔄 **App Integration**

The app automatically:
1. Detects system architecture (Intel vs Apple Silicon)
2. Uses the appropriate universal binary
3. Defaults to base-q5_1 model for better transcription quality
4. Provides clear error messages if binaries are incompatible

No code changes needed - everything is backward compatible!

## 📞 **Troubleshooting**

**Build fails with "No CMAKE":**
```bash
# Install CMAKE via Homebrew
brew install cmake
```

**Binary architecture verification:**
```bash
# Should show both architectures
lipo -info whisper-cpp/main
# Expected: "Architectures in the fat file: main are: x86_64 arm64"
```

**Model download fails:**
- Check internet connection
- Try downloading manually from [Hugging Face](https://huggingface.co/ggerganov/whisper.cpp/blob/main/ggml-base-q5_1.bin)

Your app will now work perfectly on both Intel and Apple Silicon Macs! 🎉

