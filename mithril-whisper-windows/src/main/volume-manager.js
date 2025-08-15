let winAudio;

try {
  winAudio = require('win-audio');
} catch (error) {
  console.log('🎵 win-audio not available (non-Windows platform or missing dependency)');
  winAudio = null;
}

class VolumeManager {
  constructor() {
    this.previousVolume = null;
    this.isDucked = false;
    this.isAvailable = !!winAudio;
    
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
      // Don't duck if already ducked
      if (this.isDucked) {
        console.log('🎵 VolumeManager: Already ducked, skipping');
        return true;
      }

      // Get current volume
      const currentVolume = winAudio.volume.get();
      this.previousVolume = currentVolume;
      
      // Calculate new volume (reduce by duckPercent)
      const duckFactor = (100 - duckPercent) / 100;
      const newVolume = Math.max(0, Math.min(100, currentVolume * duckFactor));
      
      // Set the new volume
      winAudio.volume.set(newVolume);
      this.isDucked = true;
      
      console.log(`🎵 VolumeManager: Ducked volume from ${currentVolume}% to ${newVolume}% (${duckPercent}% reduction)`);
      return true;
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
      // Don't restore if not ducked or no previous volume
      if (!this.isDucked || this.previousVolume === null) {
        console.log('🎵 VolumeManager: Nothing to restore');
        return true;
      }

      // Restore previous volume
      winAudio.volume.set(this.previousVolume);
      
      console.log(`🎵 VolumeManager: Restored volume to ${this.previousVolume}%`);
      
      // Reset state
      this.isDucked = false;
      this.previousVolume = null;
      
      return true;
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
      return winAudio.volume.get();
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