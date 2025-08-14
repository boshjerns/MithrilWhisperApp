import React, { useState, useRef, useEffect } from 'react';
import { SettingsIcon, KeyIcon, BrainIcon, ShieldIcon, CheckIcon } from './Icons';
import { isLocalMode } from '../auth/supabaseClient';

function Settings({ settings, onChange }) {
  const [localSettings, setLocalSettings] = useState({
    ...settings,
    useLocalWhisper: settings.useLocalWhisper !== undefined ? settings.useLocalWhisper : true,
    whisperModel: settings.whisperModel || 'tiny-q5_1',
    audioDucking: settings.audioDucking || { enabled: true, duckPercent: 90 }
  });
  const [availableModels, setAvailableModels] = useState(settings.availableModels || []);
  const [isListeningForHotkey, setIsListeningForHotkey] = useState(false);
  const [isListeningForAssistantHotkey, setIsListeningForAssistantHotkey] = useState(false);
  const [capturedKeys, setCapturedKeys] = useState([]);
  const [capturedAssistantKeys, setCapturedAssistantKeys] = useState([]);
  const hotkeyInputRef = useRef(null);
  const assistantHotkeyInputRef = useRef(null);

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

  const formatHotkey = (keys) => {
    if (keys.length === 0) return '';
    
    const modifiers = [];
    const regularKeys = [];
    
    keys.forEach(key => {
      if (['Control', 'Alt', 'Shift', 'Meta'].includes(key)) {
        // Map to Electron's expected format
        if (key === 'Control') {
          modifiers.push('Ctrl');
        } else if (key === 'Meta') {
          modifiers.push('Cmd');
        } else {
          modifiers.push(key); // Alt, Shift stay the same
        }
      } else {
        regularKeys.push(key);
      }
    });
    
    return [...modifiers, ...regularKeys].join('+');
  };

  const handleHotkeyInputClick = () => {
    setIsListeningForHotkey(true);
    setCapturedKeys([]);
    if (hotkeyInputRef.current) {
      hotkeyInputRef.current.focus();
    }
  };

  const handleHotkeyKeyDown = (e) => {
    if (!isListeningForHotkey) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    const key = e.key;
    const pressedKeys = [];
    
    // Capture modifiers first
    if (e.ctrlKey) pressedKeys.push('Control');
    if (e.altKey) pressedKeys.push('Alt');
    if (e.shiftKey) pressedKeys.push('Shift');
    if (e.metaKey) pressedKeys.push('Meta');
    
    // Capture the main key (if it's not a modifier)
    if (!['Control', 'Alt', 'Shift', 'Meta', 'OS'].includes(key)) {
      // Normalize key names
      let normalizedKey = key;
      if (key === ' ') normalizedKey = 'Space';
      else if (key === 'ArrowUp') normalizedKey = 'Up';
      else if (key === 'ArrowDown') normalizedKey = 'Down';
      else if (key === 'ArrowLeft') normalizedKey = 'Left';
      else if (key === 'ArrowRight') normalizedKey = 'Right';
      else if (key === 'Escape') normalizedKey = 'Esc';
      
      pressedKeys.push(normalizedKey);
    }
    
    setCapturedKeys(pressedKeys);
    
    // Check validation conditions
    const hasModifier = pressedKeys.some(k => ['Control', 'Alt', 'Shift', 'Meta'].includes(k));
    const hasRegularKey = pressedKeys.some(k => !['Control', 'Alt', 'Shift', 'Meta'].includes(k));
    const isFunctionKey = /^F(1[0-2]|[1-9])$/.test(key); // F1-F12
    
    // Complete hotkey conditions:
    // 1. Function key alone (F1, F2, etc.)
    // 2. Modifier(s) + regular key
    // 3. Don't allow standalone modifier keys
    if (isFunctionKey || (hasModifier && hasRegularKey)) {
      const hotkeyString = formatHotkey(pressedKeys);
      console.log('🎯 Valid hotkey captured:', hotkeyString, 'Keys:', pressedKeys);
      
      // Add a small delay to ensure the UI updates properly
      setTimeout(() => {
        handleChange('hotkey', hotkeyString);
        setIsListeningForHotkey(false);
        setCapturedKeys([]);
        if (hotkeyInputRef.current) {
          hotkeyInputRef.current.blur();
        }
      }, 100);
    } else if (key === 'Escape') {
      // Cancel hotkey setting on Escape
      console.log('🚫 Hotkey setting cancelled');
      setIsListeningForHotkey(false);
      setCapturedKeys([]);
      if (hotkeyInputRef.current) {
        hotkeyInputRef.current.blur();
      }
    }
  };

  const handleHotkeyInputBlur = (e) => {
    // Add a small delay to allow for the timeout in handleHotkeyKeyDown to complete
    setTimeout(() => {
      if (isListeningForHotkey) {
        console.log('🚫 Hotkey setting cancelled (blur)');
        setIsListeningForHotkey(false);
        setCapturedKeys([]);
      }
    }, 150);
  };

  const getHotkeyDisplayValue = () => {
    if (isListeningForHotkey) {
      if (capturedKeys.length === 0) {
        return 'Press your hotkey...';
      } else {
        const preview = formatHotkey(capturedKeys);
        const hasModifier = capturedKeys.some(k => ['Control', 'Alt', 'Shift', 'Meta'].includes(k));
        const hasRegularKey = capturedKeys.some(k => !['Control', 'Alt', 'Shift', 'Meta'].includes(k));
        const isFunctionKey = capturedKeys.some(k => /^F(1[0-2]|[1-9])$/.test(k));
        
        // Show feedback about whether the combination is valid
        if (isFunctionKey || (hasModifier && hasRegularKey)) {
          return preview + ' ✓';
        } else if (hasModifier && !hasRegularKey) {
          return preview + '+ ?';
        } else {
          return preview + '...';
        }
      }
    }
    return localSettings.hotkey || 'Alt+Space';
  };

  // Assistant hotkey handlers
  const handleAssistantHotkeyInputClick = () => {
    setIsListeningForAssistantHotkey(true);
    setCapturedAssistantKeys([]);
    if (assistantHotkeyInputRef.current) {
      assistantHotkeyInputRef.current.focus();
    }
  };

  const handleAssistantHotkeyKeyDown = (e) => {
    if (!isListeningForAssistantHotkey) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    const key = e.key;
    const pressedKeys = [];
    
    // Capture modifiers first
    if (e.ctrlKey) pressedKeys.push('Control');
    if (e.altKey) pressedKeys.push('Alt');
    if (e.shiftKey) pressedKeys.push('Shift');
    if (e.metaKey) pressedKeys.push('Meta');
    
    // Capture the main key (if it's not a modifier)
    if (!['Control', 'Alt', 'Shift', 'Meta', 'OS'].includes(key)) {
      // Normalize key names
      let normalizedKey = key;
      if (key === ' ') normalizedKey = 'Space';
      else if (key === 'ArrowUp') normalizedKey = 'Up';
      else if (key === 'ArrowDown') normalizedKey = 'Down';
      else if (key === 'ArrowLeft') normalizedKey = 'Left';
      else if (key === 'ArrowRight') normalizedKey = 'Right';
      else if (key === 'Escape') normalizedKey = 'Esc';
      
      pressedKeys.push(normalizedKey);
    }
    
    setCapturedAssistantKeys(pressedKeys);
    
    // Check validation conditions
    const hasModifier = pressedKeys.some(k => ['Control', 'Alt', 'Shift', 'Meta'].includes(k));
    const hasRegularKey = pressedKeys.some(k => !['Control', 'Alt', 'Shift', 'Meta'].includes(k));
    const isFunctionKey = /^F(1[0-2]|[1-9])$/.test(key); // F1-F12
    
    // Complete hotkey conditions:
    if (isFunctionKey || (hasModifier && hasRegularKey)) {
      const hotkeyString = formatHotkey(pressedKeys);
      console.log('🎯 Valid assistant hotkey captured:', hotkeyString, 'Keys:', pressedKeys);
      
      // Add a small delay to ensure the UI updates properly
      setTimeout(() => {
        handleChange('assistantHotkey', hotkeyString);
        setIsListeningForAssistantHotkey(false);
        setCapturedAssistantKeys([]);
        if (assistantHotkeyInputRef.current) {
          assistantHotkeyInputRef.current.blur();
        }
      }, 100);
    } else if (key === 'Escape') {
      // Cancel hotkey setting on Escape
      console.log('🚫 Assistant hotkey setting cancelled');
      setIsListeningForAssistantHotkey(false);
      setCapturedAssistantKeys([]);
      if (assistantHotkeyInputRef.current) {
        assistantHotkeyInputRef.current.blur();
      }
    }
  };

  const handleAssistantHotkeyInputBlur = (e) => {
    // Add a small delay to allow for the timeout in handleAssistantHotkeyKeyDown to complete
    setTimeout(() => {
      if (isListeningForAssistantHotkey) {
        console.log('🚫 Assistant hotkey setting cancelled (blur)');
        setIsListeningForAssistantHotkey(false);
        setCapturedAssistantKeys([]);
      }
    }, 150);
  };

  const getAssistantHotkeyDisplayValue = () => {
    if (isListeningForAssistantHotkey) {
      if (capturedAssistantKeys.length === 0) {
        return 'Press your hotkey...';
      } else {
        const preview = formatHotkey(capturedAssistantKeys);
        const hasModifier = capturedAssistantKeys.some(k => ['Control', 'Alt', 'Shift', 'Meta'].includes(k));
        const hasRegularKey = capturedAssistantKeys.some(k => !['Control', 'Alt', 'Shift', 'Meta'].includes(k));
        const isFunctionKey = capturedAssistantKeys.some(k => /^F(1[0-2]|[1-9])$/.test(k));
        
        // Show feedback about whether the combination is valid
        if (isFunctionKey || (hasModifier && hasRegularKey)) {
          return preview + ' ✓';
        } else if (hasModifier && !hasRegularKey) {
          return preview + '+ ?';
        } else {
          return preview + '...';
        }
      }
    }
    return localSettings.assistantHotkey || 'F2';
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
          <label htmlFor="hotkey">Recording Hotkey:</label>
          <input
            ref={hotkeyInputRef}
            id="hotkey"
            type="text"
            value={getHotkeyDisplayValue()}
            onClick={handleHotkeyInputClick}
            onKeyDown={handleHotkeyKeyDown}
            onBlur={handleHotkeyInputBlur}
            readOnly
            placeholder="Click to set hotkey"
            className={`input-field ${isListeningForHotkey ? 'listening' : ''}`}
            style={{
              cursor: 'pointer',
              borderColor: isListeningForHotkey ? 'var(--primary)' : undefined,
              boxShadow: isListeningForHotkey ? '0 0 0 3px rgba(0, 212, 255, 0.2)' : undefined
            }}
          />
          <div className="setting-description">
            {isListeningForHotkey 
              ? 'Press your desired key combination (e.g., Ctrl+Alt+S)'
              : 'Click to change the global shortcut for voice recording'
            }
          </div>
        </div>

        <div className="setting-item">
          <label htmlFor="assistantHotkey">Assistant Hotkey:</label>
          <input
            ref={assistantHotkeyInputRef}
            id="assistantHotkey"
            type="text"
            value={getAssistantHotkeyDisplayValue()}
            onClick={handleAssistantHotkeyInputClick}
            onKeyDown={handleAssistantHotkeyKeyDown}
            onBlur={handleAssistantHotkeyInputBlur}
            readOnly
            placeholder="Click to set assistant hotkey"
            className={`input-field ${isListeningForAssistantHotkey ? 'listening' : ''}`}
            style={{
              cursor: 'pointer',
              borderColor: isListeningForAssistantHotkey ? 'var(--primary)' : undefined,
              boxShadow: isListeningForAssistantHotkey ? '0 0 0 3px rgba(0, 212, 255, 0.2)' : undefined
            }}
          />
          <div className="setting-description">
            {isListeningForAssistantHotkey 
              ? 'Press your desired key combination (e.g., F3, Ctrl+Alt+A)'
              : 'Click to change the global shortcut for AI assistant'
            }
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

      {/* OpenAI API Configuration - Only shown in local mode */}
      {isLocalMode && (
        <div className="settings-group">
          <h3>
            <BrainIcon size={20} />
            OpenAI Assistant (Local Mode)
          </h3>
          <div className="setting-item">
            <label htmlFor="openaiApiKey">OpenAI API Key:</label>
            <input
              id="openaiApiKey"
              type="password"
              value={localSettings.openaiApiKey || ''}
              onChange={(e) => handleChange('openaiApiKey', e.target.value)}
              placeholder="sk-..."
              className="input-field"
            />
            <div className="setting-description">
              Enter your OpenAI API key to enable the AI assistant features. Get yours from <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer">OpenAI Platform</a>.
            </div>
          </div>
          
          <div className="setting-item">
            <label htmlFor="openaiModel">Assistant Model:</label>
            <select
              id="openaiModel"
              value={localSettings.openaiModel || 'gpt-4o-mini'}
              onChange={(e) => handleChange('openaiModel', e.target.value)}
              className="input-field select-field"
            >
              <option value="gpt-4o-mini">GPT-4o Mini (Recommended)</option>
              <option value="gpt-4o">GPT-4o</option>
              <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
            </select>
            <div className="setting-description">
              Select the OpenAI model for assistant responses. GPT-4o Mini offers the best balance of cost and performance.
            </div>
          </div>
        </div>
      )}

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
            <div className="info-title">Recording Hotkey</div>
            <div className="info-value"><kbd>{localSettings.hotkey}</kbd></div>
          </div>
          <div className="info-card">
            <div className="info-title">Assistant Hotkey</div>
            <div className="info-value"><kbd>{localSettings.assistantHotkey || 'F2'}</kbd></div>
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