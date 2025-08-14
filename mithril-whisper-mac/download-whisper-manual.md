# Manual Whisper.cpp Download Instructions

Since the automatic download is temporarily unavailable, here's how to set up whisper.cpp manually:

## Option 1: Direct Download (When Available)

1. Download whisper.cpp Windows binary:
   - Go to: https://github.com/ggerganov/whisper.cpp/releases
   - ███╗   ███╗██╗████████╗██╗  ██╗██████╗ ██╗██╗     
████╗ ████║██║╚══██╔══╝██║  ██║██╔══██╗██║██║     
██╔████╔██║██║   ██║   ███████║██████╔╝██║██║     
██║╚██╔╝██║██║   ██║   ██╔══██║██╔══██╗██║██║     
██║ ╚═╝ ██║██║   ██║   ██║  ██║██║  ██║██║███████╗
╚═╝     ╚═╝╚═╝   ╚═╝   ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝╚══════╝Download `whisper-bin-x64.zip` from the latest release
   
2. Extract to the following directory:
   ```
   C:\Users\[YourUsername]\AppData\Roaming\whisper-voice-assistant\whisper-cpp\
   ```

3. Download the model file:
   - Go to: https://huggingface.co/ggerganov/whisper.cpp/tree/main
   - Download `ggml-base.en.bin` (74 MB for English)
   - Save it in the same directory as above

## Option 2: Build from Source

1. Install required tools:
   - Git: https://git-scm.com/
   - CMake: https://cmake.org/download/
   - Visual Studio Build Tools: https://visualstudio.microsoft.com/downloads/

2. Clone and build:
   ```bash
   git clone https://github.com/ggerganov/whisper.cpp
   cd whisper.cpp
   mkdir build
   cd build
   cmake ..
   cmake --build . --config Release
   ```

3. Copy `main.exe` from `build\bin\Release\` to the app directory

## Using the App (Bundled Local Whisper)

This build bundles whisper.cpp and the `ggml-base.en.bin` model. No API keys are required, and transcription runs locally by default.

If you replace the model file with a larger one, update the model selection in Settings accordingly.

███╗   ███╗██╗████████╗██╗  ██╗██████╗ ██╗██╗     
████╗ ████║██║╚══██╔══╝██║  ██║██╔══██╗██║██║     
██╔████╔██║██║   ██║   ███████║██████╔╝██║██║     
██║╚██╔╝██║██║   ██║   ██╔══██║██╔══██╗██║██║     
██║ ╚═╝ ██║██║   ██║   ██║  ██║██║  ██║██║███████╗
╚═╝     ╚═╝╚═╝   ╚═╝   ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝╚══════╝
