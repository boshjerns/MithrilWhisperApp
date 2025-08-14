const fs = require('fs');
const path = require('path');
// Cloud transcription removed for fully local operation
const WhisperLocal = require('./whisper-local');

class TextProcessor {
  constructor() {
    this.whisperInstance = null;
    this.modelPath = null;
    this.isInitialized = false;
    this.openai = null;
    this.store = null;
    this.whisperLocal = new WhisperLocal();
    this.useLocalWhisper = true; // Default to local mode
    this.cleanupRules = {
      fillerWords: ['um', 'uh', 'like', 'you know', 'basically', 'actually', 'literally'],
      contractions: {
        'cant': "can't",
        'wont': "won't",
        'dont': "don't",
        'didnt': "didn't",
        'wasnt': "wasn't",
        'werent': "weren't",
        'shouldnt': "shouldn't",
        'wouldnt': "wouldn't",
        'couldnt': "couldn't",
        'isnt': "isn't",
        'arent': "aren't",
        'hasnt': "hasn't",
        'havent': "haven't",
        'hadnt': "hadn't"
      },
      customMacros: {
        'slash shrug': '¯\\_(ツ)_/¯',
        'slash table flip': '(╯°□°）╯︵ ┻━┻',
        'slash thumbs up': '👍',
        'slash heart': '❤️'
      }
    };
  }

  async init() {
    try {
      // Create models directory
      this.modelsDir = path.join(__dirname, '../../models');
      if (!fs.existsSync(this.modelsDir)) {
        fs.mkdirSync(this.modelsDir, { recursive: true });
      }

      // Check if we should use local Whisper
      if (this.store) {
        this.useLocalWhisper = this.store.get('useLocalWhisper', true);
      }
      
      // Initialize local Whisper if enabled
      if (this.useLocalWhisper) {
        // Set model size from settings BEFORE init, so init validates correct model file
        if (this.store) {
          const modelSize = this.store.get('whisperModel', 'tiny-q5_1');
          this.whisperLocal.setModel(modelSize);
        }
        console.log('🎯 Initializing local Whisper...');
        await this.whisperLocal.init();
      }
      
      console.log('Text processor initialized');
      this.isInitialized = true;
      
      return true;
    } catch (error) {
      console.error('Failed to initialize text processor:', error);
      throw error;
    }
  }

  setStore(store) {
    this.store = store;
    console.log('🔗 Store instance passed to TextProcessor');
  }

  async transcribe(audioData) {
    if (!this.isInitialized) {
      await this.init();
    }

    try {
      if (!audioData || !audioData.path) {
        throw new Error('Invalid audio data');
      }

      console.log('Transcribing audio file:', audioData.path);

      // Always use local Whisper in this build
      let transcript;
      if (this.whisperLocal.isInitialized) {
        console.log('🎯 Using local Whisper transcription');
        transcript = await this.whisperLocal.transcribe(audioData.path);
      } else {
        console.log('⚠️ Local Whisper not initialized; simulating transcription');
        transcript = await this.simulateTranscription(audioData.path);
      }
      
      console.log('Transcription result:', transcript);
      return transcript;
    } catch (error) {
      console.error('Transcription failed:', error);
      return null;
    }
  }

  // Cloud transcription path removed

  // Placeholder function until we integrate real Whisper
  async simulateTranscription(audioPath) {
    // This is just for testing - will be replaced with real Whisper
    return new Promise((resolve) => {
      setTimeout(() => {
        // Check file size to determine if audio was captured
        try {
          const stats = require('fs').statSync(audioPath);
          const fileSizeKB = (stats.size / 1024).toFixed(1);
          const timestamp = new Date().toLocaleTimeString();
          
          if (stats.size > 1000) { // More than 1KB suggests actual audio
            resolve(`🎤 Audio captured! File: ${fileSizeKB}KB at ${timestamp}. [Placeholder transcription - real Whisper integration coming next]`);
          } else {
            resolve(`⚠️ Small audio file (${fileSizeKB}KB) - please speak louder or closer to microphone.`);
          }
        } catch (error) {
          resolve("❌ Could not read audio file - please try again.");
        }
      }, 500);
    });
  }

  async cleanup(text) {
    if (!text || typeof text !== 'string') {
      return '';
    }

    let cleanedText = text.trim();

    try {
      // Remove filler words
      cleanedText = this.removeFiller(cleanedText);
      
      // Fix contractions
      cleanedText = this.fixContractions(cleanedText);
      
      // Apply custom macros
      cleanedText = this.applyMacros(cleanedText);
      
      // Fix punctuation and capitalization
      cleanedText = this.fixPunctuation(cleanedText);
      
      // Final cleanup
      cleanedText = this.finalCleanup(cleanedText);
      
      return cleanedText;
    } catch (error) {
      console.error('Text cleanup failed:', error);
      return text; // Return original text if cleanup fails
    }
  }

  removeFiller(text) {
    let cleaned = text;
    
    // Remove filler words (case insensitive)
    this.cleanupRules.fillerWords.forEach(filler => {
      const regex = new RegExp(`\\b${filler}\\b`, 'gi');
      cleaned = cleaned.replace(regex, '');
    });
    
    // Clean up extra spaces
    cleaned = cleaned.replace(/\s+/g, ' ').trim();
    
    return cleaned;
  }

  fixContractions(text) {
    let fixed = text;
    
    Object.entries(this.cleanupRules.contractions).forEach(([wrong, correct]) => {
      const regex = new RegExp(`\\b${wrong}\\b`, 'gi');
      fixed = fixed.replace(regex, correct);
    });
    
    return fixed;
  }

  applyMacros(text) {
    let processed = text;
    
    Object.entries(this.cleanupRules.customMacros).forEach(([trigger, replacement]) => {
      const regex = new RegExp(trigger, 'gi');
      processed = processed.replace(regex, replacement);
    });
    
    return processed;
  }

  fixPunctuation(text) {
    let fixed = text;
    
    // Add periods at the end of sentences that don't have punctuation
    fixed = fixed.replace(/([a-zA-Z0-9])\s*$/g, '$1.');
    
    // Capitalize first letter
    fixed = fixed.charAt(0).toUpperCase() + fixed.slice(1);
    
    // Capitalize after periods
    fixed = fixed.replace(/\.\s+([a-z])/g, (match, letter) => {
      return match.slice(0, -1) + letter.toUpperCase();
    });
    
    // Fix spacing around punctuation
    fixed = fixed.replace(/\s+([.!?])/g, '$1');
    fixed = fixed.replace(/([.!?])([a-zA-Z])/g, '$1 $2');
    
    return fixed;
  }

  finalCleanup(text) {
    // Remove extra whitespace
    let cleaned = text.replace(/\s+/g, ' ').trim();
    
    // Remove empty sentences
    cleaned = cleaned.replace(/\.\s*\./g, '.');
    
    // Ensure single space after punctuation
    cleaned = cleaned.replace(/([.!?])\s+/g, '$1 ');
    
    return cleaned;
  }

  // Add custom cleanup rule
  addCleanupRule(type, key, value) {
    if (this.cleanupRules[type]) {
      if (Array.isArray(this.cleanupRules[type])) {
        if (!this.cleanupRules[type].includes(key)) {
          this.cleanupRules[type].push(key);
        }
      } else if (typeof this.cleanupRules[type] === 'object') {
        this.cleanupRules[type][key] = value;
      }
    }
  }

  // Remove custom cleanup rule
  removeCleanupRule(type, key) {
    if (this.cleanupRules[type]) {
      if (Array.isArray(this.cleanupRules[type])) {
        const index = this.cleanupRules[type].indexOf(key);
        if (index > -1) {
          this.cleanupRules[type].splice(index, 1);
        }
      } else if (typeof this.cleanupRules[type] === 'object') {
        delete this.cleanupRules[type][key];
      }
    }
  }

  // Get current cleanup rules
  getCleanupRules() {
    return JSON.parse(JSON.stringify(this.cleanupRules));
  }

  // Update settings
  updateSettings(settings) {
    if (settings.cleanupRules) {
      this.cleanupRules = { ...this.cleanupRules, ...settings.cleanupRules };
    }
  }
}

module.exports = TextProcessor; 