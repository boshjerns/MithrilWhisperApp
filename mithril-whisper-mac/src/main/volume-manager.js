let winAudio;
try {
  winAudio = require('win-audio');
} catch (error) {
  console.log('🎵 win-audio not available (non-Windows platform or missing dependency)');
  winAudio = null;
}

const { spawnSync } = require('child_process');

class VolumeManager {
  constructor() {
    this.previousVolume = null;
    this.isDucked = false;
    this.isAvailable = process.platform === 'win32' ? !!winAudio : (process.platform === 'darwin');
    
    if (!this.isAvailable) {
      console.log('🎵 VolumeManager: Audio ducking not available on this platform');
    } else {
      console.log('🎵 VolumeManager: Audio ducking ready');
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

      if (process.platform === 'win32' && winAudio) {
        const currentVolume = winAudio.volume.get();
        this.previousVolume = currentVolume;
        const duckFactor = (100 - duckPercent) / 100;
        const newVolume = Math.max(0, Math.min(100, Math.round(currentVolume * duckFactor)));
        winAudio.volume.set(newVolume);
        this.isDucked = true;
        console.log(`🎵 VolumeManager: Ducked volume from ${currentVolume}% to ${newVolume}% (${duckPercent}% reduction)`);
        return true;
      }

      if (process.platform === 'darwin') {
        const currentVolume = this.getCurrentVolume();
        if (typeof currentVolume === 'number') this.previousVolume = currentVolume;
        const duckFactor = (100 - duckPercent) / 100;
        const newVolume = Math.max(0, Math.min(100, Math.round(currentVolume * duckFactor)));
        const ok = setMacOutputVolume(newVolume);
        this.isDucked = ok;
        console.log(`🎵 VolumeManager(macOS): Ducked volume from ${currentVolume}% to ${newVolume}% (${duckPercent}% reduction)`);
        return ok;
      }

      return false;
    } catch (error) {
      console.error('🎵 VolumeManager: Failed to duck volume:', error);
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
        console.log('🎵 VolumeManager: Nothing to restore');
        return true;
      }

      if (process.platform === 'win32' && winAudio) {
        winAudio.volume.set(this.previousVolume);
        console.log(`🎵 VolumeManager: Restored volume to ${this.previousVolume}%`);
        this.isDucked = false;
        this.previousVolume = null;
        return true;
      }

      if (process.platform === 'darwin') {
        const ok = setMacOutputVolume(this.previousVolume);
        console.log(`🎵 VolumeManager(macOS): Restored volume to ${this.previousVolume}%`);
        this.isDucked = false;
        this.previousVolume = null;
        return ok;
      }

      return false;
    } catch (error) {
      console.error('🎵 VolumeManager: Failed to restore volume:', error);
      
      // Reset state even on error to prevent stuck state
      this.isDucked = false;
      this.previousVolume = null;
      
      return false;
    }
  }

  /**
   * Get current system volume
   */
  getCurrentVolume() {
    if (!this.isAvailable) return null;
    try {
      if (process.platform === 'win32' && winAudio) {
        return winAudio.volume.get();
      }
      if (process.platform === 'darwin') {
        return getMacOutputVolume();
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
}

module.exports = VolumeManager; 

// --- macOS helpers ---
function getMacOutputVolume() {
  try {
    const res = spawnSync('osascript', ['-e', 'output volume of (get volume settings)']);
    if (res.status === 0) {
      const out = String(res.stdout || '').trim();
      const vol = parseInt(out, 10);
      if (!Number.isNaN(vol)) return vol;
    }
  } catch (_) {}
  return 0;
}

function setMacOutputVolume(vol) {
  try {
    const clamped = Math.max(0, Math.min(100, Math.round(vol)));
    const script = `set volume output volume ${clamped}`;
    const res = spawnSync('osascript', ['-e', script]);
    return res.status === 0;
  } catch (_) { return false; }
}