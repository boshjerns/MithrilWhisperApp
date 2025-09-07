import React, { useState, useRef, useEffect } from 'react';
import { SettingsIcon, KeyIcon, ShieldIcon, CheckIcon } from './Icons';
import HotkeySelector from './HotkeySelector';

const { ipcRenderer } = window.require('electron');

function Settings({ settings, onChange }) {
  const [localSettings, setLocalSettings] = useState({
    ...settings,
    useLocalWhisper: settings.useLocalWhisper !== undefined ? settings.useLocalWhisper : true,
    whisperModel: settings.whisperModel || 'tiny-q5_1',
    audioDucking: settings.audioDucking || { enabled: true, duckPercent: 90 }
  });
  const [availableModels, setAvailableModels] = useState(settings.availableModels || []);

  const handleChange = (key, value) => {
    const newSettings = { ...localSettings, [key]: value };
    setLocalSettings(newSettings);
    onChange(newSettings);
  };

  const handleAudioDuckingChange = (duckingKey, duckingValue) => {
    const newAudioDucking = { ...localSettings.audioDucking, [duckingKey]: duckingValue };
    const newSettings = { ...localSettings, audioDucking: newAudioDucking };
    setLocalSettings(newSettings);
    onChange(newSettings);
  };

  // Disable recording while in settings to prevent hotkey conflicts
  useEffect(() => {
    ipcRenderer.send('disable-recording-temporarily');
    return () => {
      ipcRenderer.send('enable-recording');
    };
  }, []);



  return (
    <div className="settings">
      <div className="section-header">
        <h2>
          <SettingsIcon size={24} />
          Settings
        </h2>
      </div>

      <div className="settings-group">
        <h3>
          <KeyIcon size={20} />
          Hotkey Configuration
        </h3>
        <div className="setting-item">
          <HotkeySelector
            label="Recording Hotkey"
            value={localSettings.hotkey}
            onChange={(hotkey) => handleChange('hotkey', hotkey)}
            placeholder="Press a key"
          />
          <div className="setting-description">
            Global shortcut to start/stop voice recording from any application
          </div>
        </div>

      </div>

      <div className="settings-group">
        <h3>
          <SettingsIcon size={20} />
          mithril whisper Settings
        </h3>
        
        {/* Local Whisper is always enabled in this build */}
        <div className="setting-item">
          <div className="setting-description">All transcription happens locally on your device</div>
        </div>

        <div className="setting-item">
          <label htmlFor="whisperModel" className="input-label">Local Whisper Model:</label>
          <select
            id="whisperModel"
            value={localSettings.whisperModel}
            onChange={(e) => handleChange('whisperModel', e.target.value)}
            className="input-field select-field"
            disabled={!localSettings.useLocalWhisper}
          >
            {availableModels && availableModels.length > 0 ? (
              availableModels.map(m => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))
            ) : (
              <option value={localSettings.whisperModel}>{localSettings.whisperModel}</option>
            )}
          </select>
          <div className="setting-description">
            {localSettings.useLocalWhisper 
              ? 'Larger models are more accurate but slower'
              : 'Model selection only applies to local mode'
            }
          </div>
        </div>

        <div className="setting-item">
          <label htmlFor="sensitivity">VAD Sensitivity:</label>
          <input
            id="sensitivity"
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={localSettings.sensitivity}
            onChange={(e) => handleChange('sensitivity', parseFloat(e.target.value))}
            className="setting-range"
          />
          <span className="range-value">{localSettings.sensitivity}</span>
          <div className="setting-description">
            Voice activity detection sensitivity (0 = less sensitive, 1 = more sensitive)
          </div>
        </div>

        <div className="setting-item">
          <label htmlFor="audioDucking" className="checkbox-label">
            <input
              id="audioDucking"
              type="checkbox"
              checked={localSettings.audioDucking.enabled}
              onChange={(e) => handleAudioDuckingChange('enabled', e.target.checked)}
            />
            <span className="checkbox-box"><CheckIcon size={14} /></span>
            <span className="checkbox-text">Auto-Duck Background Audio</span>
          </label>
          <div className="setting-description">Automatically reduce background audio during recording</div>
        </div>

        {localSettings.audioDucking.enabled && (
          <div className="setting-item">
            <label htmlFor="duckPercent">Volume Reduction:</label>
            <input
              id="duckPercent"
              type="range"
              min="50"
              max="95"
              step="5"
              value={localSettings.audioDucking.duckPercent}
              onChange={(e) => handleAudioDuckingChange('duckPercent', parseInt(e.target.value))}
              className="setting-range"
            />
            <span className="range-value">{localSettings.audioDucking.duckPercent}%</span>
            <div className="setting-description">
              Percentage to reduce background volume during recording (higher = quieter background)
            </div>
          </div>
        )}
      </div>


      <div className="settings-group">
        <h3>✨ Text Processing</h3>
        <div className="setting-item">
          <label className="setting-checkbox">
            <input
              type="checkbox"
              checked={localSettings.cleanup}
              onChange={(e) => handleChange('cleanup', e.target.checked)}
            />
            <span className="checkmark"></span>
            Enable text cleanup
          </label>
          <div className="setting-description">
            Remove filler words, fix punctuation, and apply formatting
          </div>
        </div>

        <div className="setting-item">
          <label className="setting-checkbox">
            <input
              type="checkbox"
              checked={localSettings.autoInject}
              onChange={(e) => handleChange('autoInject', e.target.checked)}
            />
            <span className="checkmark"></span>
            Auto-inject text
          </label>
          <div className="setting-description">
            Automatically paste transcribed text into the active application
          </div>
        </div>
      </div>

      <div className="settings-group">
        <h3>ℹ️ Information</h3>
        <div className="info-grid">
          <div className="info-card">
            <div className="info-title">Current Model</div>
            <div className="info-value">{localSettings.model}</div>
          </div>
          <div className="info-card">
            <div className="info-title">Hotkey</div>
            <div className="info-value"><kbd>{localSettings.hotkey}</kbd></div>
          </div>
          <div className="info-card">
            <div className="info-title">Auto-inject</div>
            <div className="info-value">{localSettings.autoInject ? 'Enabled' : 'Disabled'}</div>
          </div>
          <div className="info-card">
            <div className="info-title">Text Cleanup</div>
            <div className="info-value">{localSettings.cleanup ? 'Enabled' : 'Disabled'}</div>
          </div>
          {/* OpenAI info removed */}
          <div className="info-card">
            <div className="info-title">Audio Ducking</div>
            <div className="info-value">{localSettings.audioDucking.enabled ? `✅ ${localSettings.audioDucking.duckPercent}%` : '❌ Disabled'}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Settings; 