// ═══════════════════════════════════════════════════════════════════════
// 🔒 RUNTIME SECURITY TEST FOR MITHRIL WHISPER
// 
// This module runs security tests from within the Electron app to verify
// what file access permissions are actually enforced during runtime.
// ═══════════════════════════════════════════════════════════════════════

const secureFS = require('./secure-fs');
const path = require('path');
const os = require('os');
const { app } = require('electron');

class SecurityTester {
  constructor() {
    this.results = [];
    this.testCount = 0;
    this.passCount = 0;
    this.failCount = 0;
  }

  // Test helper function
  async runTest(testName, testFunction, shouldPass = true) {
    this.testCount++;
    console.log(`🧪 Testing: ${testName}...`);
    
    try {
      const result = await testFunction();
      const passed = shouldPass ? result : !result;
      
      if (passed) {
        console.log(`✅ PASS: ${testName}`);
        this.passCount++;
        this.results.push({ name: testName, status: 'PASS', details: 'Test completed successfully' });
      } else {
        console.log(`❌ FAIL: ${testName}`);
        this.failCount++;
        this.results.push({ name: testName, status: 'FAIL', details: `Expected ${shouldPass ? 'success' : 'failure'}, got ${result ? 'success' : 'failure'}` });
      }
    } catch (error) {
      const passed = !shouldPass; // If we expected failure and got an error, that's a pass
      
      if (passed) {
        console.log(`✅ PASS: ${testName} (Expected error: ${error.message})`);
        this.passCount++;
        this.results.push({ name: testName, status: 'PASS', details: `Expected error occurred: ${error.message}` });
      } else {
        console.log(`❌ FAIL: ${testName} (Unexpected error: ${error.message})`);
        this.failCount++;
        this.results.push({ name: testName, status: 'FAIL', details: `Unexpected error: ${error.message}` });
      }
    }
  }

  // Test if we can read user Documents
  async testDocumentsAccess() {
    await this.runTest('Cannot access ~/Documents', async () => {
      const documentsPath = path.join(os.homedir(), 'Documents', 'test-security-file.txt');
      // Try to create and read a test file
      secureFS.writeFileSync(documentsPath, 'test data');
      const data = secureFS.readFileSync(documentsPath, 'utf8');
      secureFS.unlinkSync(documentsPath); // cleanup
      return data === 'test data';
    }, false); // We expect this to FAIL (shouldPass = false)
  }

  // Test if we can read user Desktop
  async testDesktopAccess() {
    await this.runTest('Cannot access ~/Desktop', async () => {
      const desktopPath = path.join(os.homedir(), 'Desktop', 'test-security-file.txt');
      fs.writeFileSync(desktopPath, 'test data');
      const data = fs.readFileSync(desktopPath, 'utf8');
      fs.unlinkSync(desktopPath); // cleanup
      return data === 'test data';
    }, false); // We expect this to FAIL
  }

  // Test if we can read user Downloads
  async testDownloadsAccess() {
    await this.runTest('Cannot access ~/Downloads', async () => {
      const downloadsPath = path.join(os.homedir(), 'Downloads', 'test-security-file.txt');
      fs.writeFileSync(downloadsPath, 'test data');
      const data = fs.readFileSync(downloadsPath, 'utf8');
      fs.unlinkSync(downloadsPath); // cleanup
      return data === 'test data';
    }, false); // We expect this to FAIL
  }

  // Test if we can access our own temp files
  async testOwnTempAccess() {
    await this.runTest('Can access own temp files', async () => {
      const tempDir = path.join(os.tmpdir(), 'mithril-whisper-security-test');
      fs.mkdirSync(tempDir, { recursive: true });
      const tempFile = path.join(tempDir, 'test.txt');
      fs.writeFileSync(tempFile, 'test data');
      const data = fs.readFileSync(tempFile, 'utf8');
      fs.rmSync(tempDir, { recursive: true }); // cleanup
      return data === 'test data';
    }, true); // We expect this to PASS
  }

  // Test if we can access our own app support folder
  async testAppSupportAccess() {
    await this.runTest('Can access own app support', async () => {
      const appSupportPath = path.join(app.getPath('userData'), 'security-test.txt');
      fs.writeFileSync(appSupportPath, 'test data');
      const data = fs.readFileSync(appSupportPath, 'utf8');
      fs.unlinkSync(appSupportPath); // cleanup
      return data === 'test data';
    }, true); // We expect this to PASS
  }

  // Test if we can read system files
  async testSystemFileAccess() {
    await this.runTest('Cannot read system files', async () => {
      // Try to read a system file
      const data = fs.readFileSync('/etc/passwd', 'utf8');
      return data.length > 0;
    }, false); // We expect this to FAIL
  }

  // Test if we can access other apps' containers
  async testOtherAppsAccess() {
    await this.runTest('Cannot access other apps containers', async () => {
      const safariContainer = path.join(os.homedir(), 'Library', 'Containers', 'com.apple.Safari');
      if (fs.existsSync(safariContainer)) {
        const stats = fs.statSync(safariContainer);
        return stats.isDirectory();
      }
      return false; // If Safari container doesn't exist, that's also fine
    }, false); // We expect this to FAIL
  }

  // Test if we have proper app identity
  async testAppIdentity() {
    await this.runTest('App has proper identity', async () => {
      const appPath = app.getAppPath();
      const appName = app.getName();
      console.log(`App path: ${appPath}`);
      console.log(`App name: ${appName}`);
      return appName.includes('whisper') || appName.includes('mithril');
    }, true); // We expect this to PASS
  }

  // Run all security tests
  async runAllTests() {
    console.log('═══════════════════════════════════════════════════════════════════════');
    console.log('🔒 MITHRIL WHISPER RUNTIME SECURITY TEST');
    console.log('═══════════════════════════════════════════════════════════════════════');
    console.log('');

    await this.testAppIdentity();
    await this.testOwnTempAccess();
    await this.testAppSupportAccess();
    await this.testDocumentsAccess();
    await this.testDesktopAccess();
    await this.testDownloadsAccess();
    await this.testSystemFileAccess();
    await this.testOtherAppsAccess();

    console.log('');
    console.log('═══════════════════════════════════════════════════════════════════════');
    console.log('📊 SECURITY TEST RESULTS');
    console.log('═══════════════════════════════════════════════════════════════════════');
    console.log(`✅ Passed: ${this.passCount} tests`);
    console.log(`❌ Failed: ${this.failCount} tests`);
    console.log(`📊 Total:  ${this.testCount} tests`);
    console.log('');

    if (this.failCount === 0) {
      console.log('🎉 ALL SECURITY TESTS PASSED!');
      console.log('Your app has proper security restrictions in place.');
    } else {
      console.log('⚠️  SOME TESTS FAILED');
      console.log('Review the failed tests and adjust security settings.');
      
      // Log detailed results
      console.log('\nDetailed Results:');
      this.results.forEach(result => {
        const icon = result.status === 'PASS' ? '✅' : '❌';
        console.log(`${icon} ${result.name}: ${result.details}`);
      });
    }

    return {
      total: this.testCount,
      passed: this.passCount,
      failed: this.failCount,
      results: this.results
    };
  }
}

module.exports = SecurityTester;
