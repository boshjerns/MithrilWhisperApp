// Sign extra binaries after electron-builder signs the app bundle
// This ensures our embedded whisper-cli is properly codesigned

const { sign } = require('electron-osx-sign');
const path = require('path');
const fs = require('fs');

exports.default = async function afterSign(context) {
  const appOutDir = context.appOutDir;
  const appName = context.packager.appInfo.productFilename;

  const appPath = path.join(appOutDir, `${appName}.app`);
  const resourcesDir = path.join(appPath, 'Contents', 'Resources');
  const whisperDir = path.join(resourcesDir, 'whisper-cpp');

  const extraBinaries = [];
  const candidates = [
    path.join(whisperDir, 'whisper-cli'),
    path.join(whisperDir, 'main'),
    path.join(whisperDir, 'bin', 'main'),
    path.join(resourcesDir, 'key-injector'),  // Mac-native key injection binary
  ];

  for (const p of candidates) {
    if (fs.existsSync(p)) extraBinaries.push(p);
  }

  if (extraBinaries.length === 0) {
    console.log('[after-sign] no extra binaries found to sign');
    return;
  }

  console.log('[after-sign] signing extra binaries:', extraBinaries);

  for (const bin of extraBinaries) {
    await sign({
      app: bin,
      identity: process.env.CSC_NAME || undefined,
      'hardened-runtime': true,
      'gatekeeper-assess': false,
      entitlements: path.join(__dirname, 'entitlements.mac.plist'),
      'entitlements-inherit': path.join(__dirname, 'entitlements.mac.plist'),
      // deep is not used here since we sign individual binaries
    });
  }
};


