# Download whisper.cpp for Windows
$ErrorActionPreference = "Stop"

Write-Host "Whisper.cpp Downloader for Windows" -ForegroundColor Cyan
Write-Host ""

# Get app data path
$appData = [Environment]::GetFolderPath('ApplicationData')
$whisperDir = Join-Path $appData "whisper-voice-assistant\whisper-cpp"

# Create directory
Write-Host "Creating directory: $whisperDir" -ForegroundColor Yellow
New-Item -ItemType Directory -Force -Path $whisperDir | Out-Null

# Download whisper.cpp Windows binary
# Using the correct URL from ggerganov/whisper.cpp releases
$whisperUrl = "https://github.com/ggerganov/whisper.cpp/releases/download/v1.5.4/whisper-bin-x64.zip"
$zipPath = Join-Path $whisperDir "whisper-bin-x64.zip"

Write-Host "Downloading whisper.cpp binary..." -ForegroundColor Yellow
try {
    Invoke-WebRequest -Uri $whisperUrl -OutFile $zipPath
    Write-Host "Downloaded whisper.cpp" -ForegroundColor Green
} catch {
    Write-Host "Failed to download whisper.cpp binary" -ForegroundColor Red
    Write-Host $_.Exception.Message
    exit 1
}

# Extract the binary
Write-Host "Extracting whisper.cpp..." -ForegroundColor Yellow
Expand-Archive -Path $zipPath -DestinationPath $whisperDir -Force
Remove-Item $zipPath

# Download base.en model
$modelUrl = "https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-base.en.bin"
$modelPath = Join-Path $whisperDir "ggml-base.en.bin"

Write-Host "Downloading base English model (74 MB)..." -ForegroundColor Yellow
try {
    Invoke-WebRequest -Uri $modelUrl -OutFile $modelPath
    Write-Host "Downloaded model" -ForegroundColor Green
} catch {
    Write-Host "Failed to download model" -ForegroundColor Red
    Write-Host $_.Exception.Message
    exit 1
}

Write-Host ""
Write-Host "Whisper.cpp setup complete!" -ForegroundColor Green
Write-Host "Location: $whisperDir" -ForegroundColor Cyan
Write-Host ""
Write-Host "You can now use local transcription in the app!" -ForegroundColor Green
Write-Host ""
Write-Host "Press Enter to exit..."
Read-Host 