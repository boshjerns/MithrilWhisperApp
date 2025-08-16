let winAudio;
try {
  winAudio = require('win-audio');
} catch (error) {
  console.log('🎵 win-audio not available (non-Windows platform or missing dependency)');
  winAudio = null;
}

let loudness;
try {
  loudness = require('loudness');
} catch (error) {
  console.log('🎵 loudness package not available:', error.message);
  loudness = null;
}

class VolumeManager {
  constructor() {
    this.previousVolume = null;
    this.isDucked = false;
    
    // Check availability based on platform and required packages
    if (process.platform === 'win32') {
      this.isAvailable = !!winAudio;
      this.method = winAudio ? 'win-audio' : null;
    } else if (process.platform === 'darwin') {
      this.isAvailable = !!loudness;
      this.method = loudness ? 'loudness' : null;
    } else {
      this.isAvailable = false;
      this.method = null;
    }
    
    if (!this.isAvailable) {
      console.log(`🎵 VolumeManager: Audio ducking not available on ${process.platform}`);
    } else {
      console.log(`🎵 VolumeManager: Audio ducking ready using ${this.method}`);
    }
  }

  /**
   * Duck (reduce) the system volume by the specified percentage
   * @param {number} duckPercent - Percentage to reduce volume (0-100)
   */
  async duck(duckPercent = 90) {
    if (!this.isAvailable) {
      console.log('🎵 VolumeManager: Ducking skipped (not available)');
      return false;
    }

    try {
      if (this.isDucked) {
        console.log('🎵 VolumeManager: Already ducked, skipping');
        return true;
      }

      console.log(`🎵 VolumeManager: Starting audio duck (${duckPercent}% reduction)...`);

      if (process.platform === 'win32' && winAudio) {
        const currentVolume = winAudio.volume.get();
        this.previousVolume = currentVolume;
        const duckFactor = (100 - duckPercent) / 100;
        const newVolume = Math.max(0, Math.min(100, Math.round(currentVolume * duckFactor)));
        winAudio.volume.set(newVolume);
        this.isDucked = true;
        console.log(`🎵 VolumeManager: ✅ Ducked volume from ${currentVolume}% to ${newVolume}%`);
        return true;
      }

      if (process.platform === 'darwin' && loudness) {
        try {
          // Get current volume using loudness package
          const currentVolume = await loudness.getVolume();
          console.log(`🎵 VolumeManager(macOS): Current volume is ${currentVolume}%`);
          this.previousVolume = currentVolume;
          
          // Calculate target volume
          const duckFactor = (100 - duckPercent) / 100;
          const newVolume = Math.max(1, Math.min(100, Math.round(currentVolume * duckFactor)));
          
          console.log(`🎵 VolumeManager(macOS): Setting volume to ${newVolume}% (was ${currentVolume}%)`);
          
          // Apply volume change using loudness package
          await loudness.setVolume(newVolume);
          this.isDucked = true;
          
          console.log(`🎵 VolumeManager(macOS): ✅ Successfully ducked volume from ${currentVolume}% to ${newVolume}%`);
          
          // Verify the change took effect
          const verifyVolume = await loudness.getVolume();
          if (Math.abs(verifyVolume - newVolume) <= 2) { // Allow small difference
            console.log(`🎵 VolumeManager(macOS): ✅ Volume change verified: ${verifyVolume}%`);
          } else {
            console.warn(`🎵 VolumeManager(macOS): ⚠️ Volume verification mismatch: expected ${newVolume}%, got ${verifyVolume}%`);
          }
          
          return true;
        } catch (error) {
          console.error('🎵 VolumeManager(macOS): ❌ Failed to duck volume with loudness package:', error);
          return false;
        }
      }

      return false;
    } catch (error) {
      console.error('🎵 VolumeManager: ❌ Failed to duck volume:', error);
      return false;
    }
  }

  /**
   * Restore the volume to its previous level
   */
  async restore() {
    if (!this.isAvailable) {
      console.log('🎵 VolumeManager: Restore skipped (not available)');
      return false;
    }

    try {
      if (!this.isDucked || this.previousVolume === null) {
        console.log('🎵 VolumeManager: Nothing to restore (not ducked or no previous volume)');
        return true;
      }

      console.log(`🎵 VolumeManager: Restoring volume to ${this.previousVolume}%...`);

      if (process.platform === 'win32' && winAudio) {
        winAudio.volume.set(this.previousVolume);
        console.log(`🎵 VolumeManager: ✅ Restored volume to ${this.previousVolume}%`);
        this.isDucked = false;
        this.previousVolume = null;
        return true;
      }

      if (process.platform === 'darwin' && loudness) {
        try {
          const targetVolume = this.previousVolume;
          
          // Restore volume using loudness package
          await loudness.setVolume(targetVolume);
          console.log(`🎵 VolumeManager(macOS): ✅ Restored volume to ${targetVolume}%`);
          
          // Verify the restoration
          const verifyVolume = await loudness.getVolume();
          if (Math.abs(verifyVolume - targetVolume) <= 2) { // Allow small difference
            console.log(`🎵 VolumeManager(macOS): ✅ Volume restoration verified: ${verifyVolume}%`);
          } else {
            console.warn(`🎵 VolumeManager(macOS): ⚠️ Volume restoration mismatch: expected ${targetVolume}%, got ${verifyVolume}%`);
          }
          
          this.isDucked = false;
          this.previousVolume = null;
          return true;
        } catch (error) {
          console.error('🎵 VolumeManager(macOS): ❌ Failed to restore volume with loudness package:', error);
          
          // Reset state even on error to prevent stuck state
          this.isDucked = false;
          this.previousVolume = null;
          return false;
        }
      }

      return false;
    } catch (error) {
      console.error('🎵 VolumeManager: ❌ Failed to restore volume:', error);
      
      // Reset state even on error to prevent stuck state
      this.isDucked = false;
      this.previousVolume = null;
      
      return false;
    }
  }

  /**
   * Get current system volume
   */
  async getCurrentVolume() {
    if (!this.isAvailable) return null;
    try {
      if (process.platform === 'win32' && winAudio) {
        return winAudio.volume.get();
      }
      if (process.platform === 'darwin' && loudness) {
        return await loudness.getVolume();
      }
      return null;
    } catch (error) {
      console.error('🎵 VolumeManager: Failed to get volume:', error);
      return null;
    }
  }

  /**
   * Check if volume is currently ducked
   */
  isDuckingActive() {
    return this.isDucked;
  }

  /**
   * Force reset the ducking state (useful for cleanup)
   */
  reset() {
    this.isDucked = false;
    this.previousVolume = null;
    console.log('🎵 VolumeManager: State reset');
  }

  /**
   * Test audio ducking functionality (for debugging)
   */
  async testDucking() {
    console.log('🎵 VolumeManager: Testing audio ducking functionality...');
    
    if (!this.isAvailable) {
      console.log('🎵 VolumeManager: ❌ Audio ducking not available on this platform');
      return false;
    }

    try {
      // Get initial volume
      const initialVolume = await this.getCurrentVolume();
      console.log(`🎵 VolumeManager: Initial volume: ${initialVolume}%`);
      
      if (initialVolume === null) {
        console.log('🎵 VolumeManager: ❌ Cannot get current volume');
        return false;
      }

      // Test ducking
      console.log('🎵 VolumeManager: Testing duck to 25%...');
      const duckSuccess = await this.duck(75); // 75% reduction
      
      if (!duckSuccess) {
        console.log('🎵 VolumeManager: ❌ Duck test failed');
        return false;
      }

      // Wait a moment
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Test restore
      console.log('🎵 VolumeManager: Testing restore...');
      const restoreSuccess = await this.restore();
      
      if (!restoreSuccess) {
        console.log('🎵 VolumeManager: ❌ Restore test failed');
        return false;
      }

      // Verify final volume
      const finalVolume = await this.getCurrentVolume();
      console.log(`🎵 VolumeManager: Final volume: ${finalVolume}%`);
      
      const success = Math.abs(finalVolume - initialVolume) <= 2;
      console.log(`🎵 VolumeManager: ${success ? '✅' : '❌'} Audio ducking test ${success ? 'passed' : 'failed'}`);
      
      return success;
    } catch (error) {
      console.error('🎵 VolumeManager: ❌ Test ducking error:', error);
      return false;
    }
  }
}

module.exports = VolumeManager;