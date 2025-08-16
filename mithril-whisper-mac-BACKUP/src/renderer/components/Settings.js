import React, { useState, useRef, useEffect } from 'react';
import { SettingsIcon, KeyIcon, BrainIcon, ShieldIcon, CheckIcon } from './Icons';
import HotkeySelector from './HotkeySelector';
import LanguageSelector from './LanguageSelector';

function Settings({ settings, onChange }) {
  const [localSettings, setLocalSettings] = useState({
    ...settings,
    useLocalWhisper: settings.useLocalWhisper !== undefined ? settings.useLocalWhisper : true,
    whisperModel: settings.whisperModel || 'tiny-q5_1',
    whisperLanguage: settings.whisperLanguage || 'auto',
    audioDucking: settings.audioDucking || { enabled: true, duckPercent: 90 },
    injectionMode: settings.injectionMode || 'auto',
    assistantInjectOnReplace: settings.assistantInjectOnReplace || false
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
            label="Global Recording Hotkey"
            value={localSettings.hotkey}
            onChange={(hotkey) => handleChange('hotkey', hotkey)}
            placeholder="Click to set recording hotkey"
          />
          <div className="setting-description">
            Global shortcut to start/stop voice recording from any application
          </div>
        </div>

        <div className="setting-item">
          <HotkeySelector
            label="Assistant Hotkey"
            value={localSettings.assistantHotkey}
            onChange={(hotkey) => handleChange('assistantHotkey', hotkey)}
            placeholder="Click to set assistant hotkey"
          />
          <div className="setting-description">
            Global shortcut to start/stop AI assistant recording
          </div>
        </div>
      </div>

      <div className="settings-group">
        <h3>
          <BrainIcon size={20} />
          mithril whisper Settings
        </h3>
        
        {/* Local Whisper is always enabled in this build */}
        <div className="setting-item">
          <label className="setting-checkbox">
            <input
              type="checkbox"
              checked={!!localSettings.assistantInjectOnReplace}
              onChange={(e) => handleChange('assistantInjectOnReplace', e.target.checked)}
            />
            <span className="checkmark"></span>
            Allow assistant to replace selection in apps (inject on replace)
          </label>
          <div className="setting-description">
            When enabled, assistant replacement requests will paste into the current app. Otherwise they will stay in the chat window.
          </div>
        </div>

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

        {/* Language Settings */}
        <LanguageSelector
          selectedLanguage={localSettings.whisperLanguage}
          onLanguageChange={(language) => handleChange('whisperLanguage', language)}
        />

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

        {localSettings.audioDucking.enabled && (
          <div className="setting-item">
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button 
                className="test-ducking-btn"
                onClick={async () => {
                  try {
                    const result = await window.electronAPI.invoke('test-applescript-permission');
                    alert(result.message);
                  } catch (error) {
                    alert(`Permission test failed: ${error.message}`);
                  }
                }}
              >
                🔐 Test AppleScript Permission
              </button>
              <button 
                className="test-ducking-btn"
                onClick={async () => {
                  try {
                    const result = await window.electronAPI.invoke('test-audio-ducking');
                    alert(result.message);
                  } catch (error) {
                    alert(`Test failed: ${error.message}`);
                  }
                }}
              >
                🎵 Test Audio Ducking
              </button>
            </div>
            <div className="setting-description">
              First test AppleScript permission (may trigger macOS permission dialog), then test audio ducking
            </div>
          </div>
        )}
      </div>

      {/* OpenAI configuration removed for fully local operation */}

      <div className="settings-group">
        <h3>✨ Text Processing</h3>
        <div className="setting-item">
          <label htmlFor="injectionMode" className="input-label">Injection Mode (macOS):</label>
          <select
            id="injectionMode"
            value={localSettings.injectionMode}
            onChange={(e) => handleChange('injectionMode', e.target.value)}
            className="input-field select-field"
          >
            <option value="auto">Auto paste (requires Accessibility)</option>
            <option value="copy-only">Copy only (press Cmd+V)</option>
          </select>
          <div className="setting-description">
            Auto paste tries a Cmd+V keystroke via System Events. If permission is denied, text is still copied safely.
          </div>
        </div>

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
            <div className="info-title">Assistant Hotkey</div>
            <div className="info-value"><kbd>{localSettings.assistantHotkey}</kbd></div>
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