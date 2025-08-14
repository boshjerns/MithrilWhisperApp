// ═══════════════════════════════════════════════════════════════════════
// 🔒 SECURE FILE SYSTEM WRAPPER FOR MITHRIL WHISPER
// 
// This module provides a security layer over Node.js fs operations to ensure
// the app can only access files it absolutely needs and blocks access to
// sensitive user data like Documents, Desktop, Downloads, etc.
// ═══════════════════════════════════════════════════════════════════════

const fs = require('fs');
const path = require('path');
const os = require('os');
const { app } = require('electron');

class SecureFileSystem {
  constructor() {
    this.allowedPaths = this.initializeAllowedPaths();
    this.blockedPaths = this.initializeBlockedPaths();
    console.log('🔒 Secure FileSystem initialized');
    console.log('✅ Allowed paths:', this.allowedPaths.length, 'patterns');
    console.log('🚫 Blocked paths:', this.blockedPaths.length, 'patterns');
  }

  initializeAllowedPaths() {
    const homedir = os.homedir();
    const tempDir = os.tmpdir();
    const appPath = app ? app.getPath('userData') : path.join(homedir, 'Library/Application Support/mithril whisper');
    const appResourcesPath = process.resourcesPath || path.join(__dirname, '..', '..');

    return [
      // App's own data directories
      path.normalize(appPath),
      path.join(appPath, '**'),
      
      // Temporary directories (for audio files)
      path.normalize(tempDir),
      path.join(tempDir, 'mithril-whisper', '**'),
      path.join(tempDir, '**'), // Allow general temp access but we'll be more specific in real use
      
      // App bundle and resources
      path.normalize(appResourcesPath),
      path.join(appResourcesPath, '**'),
      
      // Whisper models directories
      path.join(__dirname, '..', '..', 'whisper-cpp', '**'),
      path.join(__dirname, '..', '..', 'models', '**'),
      
      // Development paths
      path.join(process.cwd(), '**'), // Allow current working directory in dev
      
      // System paths needed for app functionality
      '/System/Library/Frameworks/**', // macOS system frameworks
      '/usr/lib/**', // System libraries
      
      // Log files
      path.join(appPath, 'logs', '**'),
    ];
  }

  initializeBlockedPaths() {
    const homedir = os.homedir();
    
    return [
      // User personal directories - STRICTLY FORBIDDEN
      path.join(homedir, 'Documents', '**'),
      path.join(homedir, 'Desktop', '**'),
      path.join(homedir, 'Downloads', '**'),
      path.join(homedir, 'Pictures', '**'),
      path.join(homedir, 'Movies', '**'),
      path.join(homedir, 'Music', '**'),
      
      // Other apps' data - FORBIDDEN
      path.join(homedir, 'Library/Containers/**'),
      path.join(homedir, 'Library/Application Support/**'), // Block others, allow only ours
      
      // System sensitive files - FORBIDDEN
      '/etc/**',
      '/var/log/**',
      '/private/**',
      '/System/**',
      '/usr/bin/**',
      '/usr/sbin/**',
      
      // Browser data - FORBIDDEN
      path.join(homedir, 'Library/Safari/**'),
      path.join(homedir, 'Library/Application Support/Google/Chrome/**'),
      path.join(homedir, 'Library/Application Support/Firefox/**'),
      
      // SSH and security - FORBIDDEN
      path.join(homedir, '.ssh/**'),
      path.join(homedir, '.gnupg/**'),
      
      // Development sensitive - FORBIDDEN
      path.join(homedir, '.aws/**'),
      path.join(homedir, '.docker/**'),
    ];
  }

  // Check if a path is allowed
  isPathAllowed(targetPath) {
    try {
      const normalizedPath = path.resolve(targetPath);
      
      // First check if it's explicitly blocked
      for (const blockedPattern of this.blockedPaths) {
        if (this.matchesPattern(normalizedPath, blockedPattern)) {
          console.warn(`🚫 BLOCKED ACCESS: ${normalizedPath} (matched blocked pattern: ${blockedPattern})`);
          return false;
        }
      }
      
      // Special case: Allow our own app support directory even though we block others
      const appPath = app ? app.getPath('userData') : '';
      if (appPath && normalizedPath.startsWith(appPath)) {
        return true;
      }
      
      // Check if it matches allowed patterns
      for (const allowedPattern of this.allowedPaths) {
        if (this.matchesPattern(normalizedPath, allowedPattern)) {
          return true;
        }
      }
      
      console.warn(`🚫 PATH NOT IN ALLOWLIST: ${normalizedPath}`);
      return false;
    } catch (error) {
      console.error(`🚫 PATH VALIDATION ERROR: ${error.message}`);
      return false;
    }
  }

  // Simple pattern matching (supports ** wildcard)
  matchesPattern(targetPath, pattern) {
    if (pattern.includes('**')) {
      const basePattern = pattern.replace('/**', '');
      return targetPath.startsWith(basePattern);
    }
    return targetPath === pattern || targetPath.startsWith(pattern + path.sep);
  }

  // Throw security error
  throwSecurityError(operation, targetPath) {
    const error = new Error(`SECURITY: Access denied to ${targetPath} for operation: ${operation}`);
    error.code = 'EACCES';
    error.errno = -13;
    error.path = targetPath;
    throw error;
  }

  // SECURE FILE OPERATIONS
  
  readFileSync(filePath, options) {
    if (!this.isPathAllowed(filePath)) {
      this.throwSecurityError('readFileSync', filePath);
    }
    return fs.readFileSync(filePath, options);
  }

  writeFileSync(filePath, data, options) {
    if (!this.isPathAllowed(filePath)) {
      this.throwSecurityError('writeFileSync', filePath);
    }
    return fs.writeFileSync(filePath, data, options);
  }

  existsSync(filePath) {
    if (!this.isPathAllowed(filePath)) {
      // For exists checks, return false instead of throwing (less disruptive)
      console.warn(`🚫 BLOCKED existsSync: ${filePath}`);
      return false;
    }
    return fs.existsSync(filePath);
  }

  mkdirSync(dirPath, options) {
    if (!this.isPathAllowed(dirPath)) {
      this.throwSecurityError('mkdirSync', dirPath);
    }
    return fs.mkdirSync(dirPath, options);
  }

  readdirSync(dirPath, options) {
    if (!this.isPathAllowed(dirPath)) {
      this.throwSecurityError('readdirSync', dirPath);
    }
    return fs.readdirSync(dirPath, options);
  }

  statSync(filePath, options) {
    if (!this.isPathAllowed(filePath)) {
      this.throwSecurityError('statSync', filePath);
    }
    return fs.statSync(filePath, options);
  }

  unlinkSync(filePath) {
    if (!this.isPathAllowed(filePath)) {
      this.throwSecurityError('unlinkSync', filePath);
    }
    return fs.unlinkSync(filePath);
  }

  rmSync(dirPath, options) {
    if (!this.isPathAllowed(dirPath)) {
      this.throwSecurityError('rmSync', dirPath);
    }
    return fs.rmSync(dirPath, options);
  }

  createWriteStream(filePath, options) {
    if (!this.isPathAllowed(filePath)) {
      this.throwSecurityError('createWriteStream', filePath);
    }
    return fs.createWriteStream(filePath, options);
  }

  createReadStream(filePath, options) {
    if (!this.isPathAllowed(filePath)) {
      this.throwSecurityError('createReadStream', filePath);
    }
    return fs.createReadStream(filePath, options);
  }

  // ASYNC VERSIONS

  async readFile(filePath, options) {
    if (!this.isPathAllowed(filePath)) {
      this.throwSecurityError('readFile', filePath);
    }
    return fs.promises.readFile(filePath, options);
  }

  async writeFile(filePath, data, options) {
    if (!this.isPathAllowed(filePath)) {
      this.throwSecurityError('writeFile', filePath);
    }
    return fs.promises.writeFile(filePath, data, options);
  }

  async mkdir(dirPath, options) {
    if (!this.isPathAllowed(dirPath)) {
      this.throwSecurityError('mkdir', dirPath);
    }
    return fs.promises.mkdir(dirPath, options);
  }

  async readdir(dirPath, options) {
    if (!this.isPathAllowed(dirPath)) {
      this.throwSecurityError('readdir', dirPath);
    }
    return fs.promises.readdir(dirPath, options);
  }

  async stat(filePath, options) {
    if (!this.isPathAllowed(filePath)) {
      this.throwSecurityError('stat', filePath);
    }
    return fs.promises.stat(filePath, options);
  }

  async unlink(filePath) {
    if (!this.isPathAllowed(filePath)) {
      this.throwSecurityError('unlink', filePath);
    }
    return fs.promises.unlink(filePath);
  }

  async rm(dirPath, options) {
    if (!this.isPathAllowed(dirPath)) {
      this.throwSecurityError('rm', dirPath);
    }
    return fs.promises.rm(dirPath, options);
  }

  // Utility method to check if a path would be allowed (for testing)
  checkAccess(targetPath) {
    return {
      allowed: this.isPathAllowed(targetPath),
      normalizedPath: path.resolve(targetPath)
    };
  }
}

// Create singleton instance
const secureFS = new SecureFileSystem();

module.exports = secureFS;
