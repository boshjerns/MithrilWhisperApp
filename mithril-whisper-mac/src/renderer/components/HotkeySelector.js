import React, { useState, useEffect, useRef } from 'react';

const HotkeySelector = ({ 
  value = '', 
  onChange, 
  placeholder = 'Click to set hotkey',
  disabled = false,
  label = 'Hotkey'
}) => {
  const [isCapturing, setIsCapturing] = useState(false);
  const [selectedModifiers, setSelectedModifiers] = useState([]);
  const [selectedKey, setSelectedKey] = useState('');
  const [showDropdowns, setShowDropdowns] = useState(false);
  const inputRef = useRef(null);

  // Parse existing hotkey value
  useEffect(() => {
    if (value && !isCapturing) {
      const parts = value.split('+');
      const mainKey = parts[parts.length - 1];
      const modifiers = parts.slice(0, -1);
      
      setSelectedKey(mainKey);
      setSelectedModifiers(modifiers);
    }
  }, [value, isCapturing]);

  // Mac modifier options
  const modifierOptions = [
    { key: 'Cmd', label: '⌘ Command', electron: 'CmdOrCtrl' },
    { key: 'Ctrl', label: '⌃ Control', electron: 'Ctrl' },
    { key: 'Alt', label: '⌥ Option', electron: 'Alt' },
    { key: 'Shift', label: '⇧ Shift', electron: 'Shift' },
  ];

  // Main key options (commonly used keys)
  const keyOptions = [
    // Function keys
    'F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9', 'F10', 'F11', 'F12',
    // Letters
    'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M',
    'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',
    // Numbers
    '1', '2', '3', '4', '5', '6', '7', '8', '9', '0',
    // Special keys
    'Space', 'Tab', 'Enter', 'Escape', 'Backspace',
    'Up', 'Down', 'Left', 'Right',
    'Home', 'End', 'PageUp', 'PageDown'
  ];

  const handleModifierToggle = (modifier) => {
    const electronKey = modifierOptions.find(m => m.key === modifier)?.electron || modifier;
    
    setSelectedModifiers(prev => {
      const newModifiers = prev.includes(electronKey)
        ? prev.filter(m => m !== electronKey)
        : [...prev, electronKey];
      
      updateHotkey(newModifiers, selectedKey);
      return newModifiers;
    });
  };

  const handleKeySelect = (key) => {
    setSelectedKey(key);
    updateHotkey(selectedModifiers, key);
  };

  const updateHotkey = (modifiers, key) => {
    if (key && modifiers.length > 0) {
      const hotkeyString = [...modifiers, key].join('+');
      onChange(hotkeyString);
    } else if (key && isFunctionKey(key)) {
      // Function keys don't need modifiers
      onChange(key);
    }
  };

  const isFunctionKey = (key) => /^F([1-9]|1[0-2])$/.test(key);

  const handleQuickCapture = () => {
    setIsCapturing(true);
    setShowDropdowns(false);
    
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleKeyDown = (e) => {
    if (!isCapturing) return;
    
    e.preventDefault();
    e.stopPropagation();

    const pressedModifiers = [];
    const key = e.key;

    // Capture modifiers
    if (e.metaKey) pressedModifiers.push('CmdOrCtrl');
    if (e.ctrlKey) pressedModifiers.push('Ctrl');
    if (e.altKey) pressedModifiers.push('Alt');
    if (e.shiftKey) pressedModifiers.push('Shift');

    // Normalize key name
    let normalizedKey = key;
    if (key === ' ') normalizedKey = 'Space';
    else if (key === 'ArrowUp') normalizedKey = 'Up';
    else if (key === 'ArrowDown') normalizedKey = 'Down';
    else if (key === 'ArrowLeft') normalizedKey = 'Left';
    else if (key === 'ArrowRight') normalizedKey = 'Right';
    else if (key.length === 1) normalizedKey = key.toUpperCase();

    // Only process if we have a valid key (not just modifiers)
    if (!['Control', 'Alt', 'Shift', 'Meta', 'OS'].includes(key)) {
      const hasModifier = pressedModifiers.length > 0;
      const isFKey = isFunctionKey(normalizedKey);
      
      // Valid combinations: modifier + key OR function key alone
      if (hasModifier || isFKey) {
        setSelectedModifiers(pressedModifiers);
        setSelectedKey(normalizedKey);
        updateHotkey(pressedModifiers, normalizedKey);
        setIsCapturing(false);
        
        if (inputRef.current) {
          inputRef.current.blur();
        }
      }
    }

    // Cancel on Escape
    if (key === 'Escape') {
      setIsCapturing(false);
      if (inputRef.current) {
        inputRef.current.blur();
      }
    }
  };

  const handleBlur = () => {
    setIsCapturing(false);
  };

  const formatDisplayValue = () => {
    if (isCapturing) {
      return 'Press your hotkey combination...';
    }
    
    if (selectedKey) {
      const modifierSymbols = selectedModifiers.map(mod => {
        switch (mod) {
          case 'CmdOrCtrl': return '⌘';
          case 'Ctrl': return '⌃';
          case 'Alt': return '⌥';
          case 'Shift': return '⇧';
          default: return mod;
        }
      });
      
      return modifierSymbols.length > 0 
        ? `${modifierSymbols.join('')}${selectedKey}`
        : selectedKey;
    }
    
    return placeholder;
  };

  const clearHotkey = () => {
    setSelectedModifiers([]);
    setSelectedKey('');
    onChange('');
  };

  return (
    <div className="hotkey-selector">
      <label className="setting-label">{label}:</label>
      
      {/* Quick Capture Input */}
      <div className="hotkey-input-group">
        <input
          ref={inputRef}
          type="text"
          value={formatDisplayValue()}
          onClick={handleQuickCapture}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          readOnly
          disabled={disabled}
          className={`hotkey-input ${isCapturing ? 'capturing' : ''}`}
          placeholder={placeholder}
        />
        
        <button 
          type="button"
          onClick={() => setShowDropdowns(!showDropdowns)}
          className="hotkey-toggle-btn"
          disabled={disabled}
        >
          ⚙️
        </button>
        
        {value && (
          <button 
            type="button"
            onClick={clearHotkey}
            className="hotkey-clear-btn"
            disabled={disabled}
            title="Clear hotkey"
          >
            ✕
          </button>
        )}
      </div>

      {/* Manual Selection Dropdowns */}
      {showDropdowns && !disabled && (
        <div className="hotkey-manual-selection">
          <div className="modifier-selection">
            <span className="selection-label">Modifiers:</span>
            <div className="modifier-buttons">
              {modifierOptions.map(({ key, label, electron }) => (
                <button
                  key={key}
                  type="button"
                  className={`modifier-btn ${selectedModifiers.includes(electron) ? 'selected' : ''}`}
                  onClick={() => handleModifierToggle(key)}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="key-selection">
            <span className="selection-label">Main Key:</span>
            <select
              value={selectedKey}
              onChange={(e) => handleKeySelect(e.target.value)}
              className="key-select"
            >
              <option value="">Select a key...</option>
              <optgroup label="Function Keys">
                {keyOptions.filter(k => k.startsWith('F')).map(key => (
                  <option key={key} value={key}>{key}</option>
                ))}
              </optgroup>
              <optgroup label="Letters">
                {keyOptions.filter(k => /^[A-Z]$/.test(k)).map(key => (
                  <option key={key} value={key}>{key}</option>
                ))}
              </optgroup>
              <optgroup label="Numbers">
                {keyOptions.filter(k => /^[0-9]$/.test(k)).map(key => (
                  <option key={key} value={key}>{key}</option>
                ))}
              </optgroup>
              <optgroup label="Special Keys">
                {keyOptions.filter(k => !k.startsWith('F') && !/^[A-Z0-9]$/.test(k)).map(key => (
                  <option key={key} value={key}>{key}</option>
                ))}
              </optgroup>
            </select>
          </div>
        </div>
      )}

      {/* Help Text */}
      <div className="hotkey-help">
        <small>
          💡 Click the input to capture a hotkey quickly, or use ⚙️ for manual selection
        </small>
      </div>

      <style jsx>{`
        .hotkey-selector {
          margin-bottom: 1rem;
        }

        .setting-label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 500;
          color: #333;
        }

        .hotkey-input-group {
          display: flex;
          gap: 0.5rem;
          align-items: center;
        }

        .hotkey-input {
          flex: 1;
          padding: 0.5rem;
          border: 2px solid #ddd;
          border-radius: 4px;
          font-family: 'SF Mono', Monaco, 'Cascadia Code', monospace;
          background: #f9f9f9;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .hotkey-input:focus,
        .hotkey-input.capturing {
          border-color: #007AFF;
          background: #fff;
          outline: none;
          box-shadow: 0 0 0 3px rgba(0, 122, 255, 0.1);
        }

        .hotkey-input:disabled {
          background: #f0f0f0;
          cursor: not-allowed;
          opacity: 0.6;
        }

        .hotkey-toggle-btn,
        .hotkey-clear-btn {
          padding: 0.5rem;
          border: 1px solid #ddd;
          border-radius: 4px;
          background: #fff;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .hotkey-toggle-btn:hover,
        .hotkey-clear-btn:hover {
          background: #f0f0f0;
          border-color: #007AFF;
        }

        .hotkey-clear-btn {
          color: #ff3b30;
          font-weight: bold;
        }

        .hotkey-manual-selection {
          margin-top: 1rem;
          padding: 1rem;
          border: 1px solid #ddd;
          border-radius: 8px;
          background: #f9f9f9;
        }

        .modifier-selection,
        .key-selection {
          margin-bottom: 1rem;
        }

        .key-selection:last-child {
          margin-bottom: 0;
        }

        .selection-label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 500;
          color: #555;
        }

        .modifier-buttons {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .modifier-btn {
          padding: 0.4rem 0.8rem;
          border: 1px solid #ddd;
          border-radius: 4px;
          background: #fff;
          cursor: pointer;
          transition: all 0.2s ease;
          font-size: 0.9rem;
        }

        .modifier-btn:hover {
          border-color: #007AFF;
          background: #f0f8ff;
        }

        .modifier-btn.selected {
          background: #007AFF;
          color: white;
          border-color: #007AFF;
        }

        .key-select {
          width: 100%;
          padding: 0.5rem;
          border: 1px solid #ddd;
          border-radius: 4px;
          background: #fff;
          font-family: 'SF Mono', Monaco, monospace;
        }

        .hotkey-help {
          margin-top: 0.5rem;
          color: #666;
        }
      `}</style>
    </div>
  );
};

export default HotkeySelector;

