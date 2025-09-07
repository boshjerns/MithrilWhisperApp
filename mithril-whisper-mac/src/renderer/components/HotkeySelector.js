import React, { useState, useEffect, useRef } from 'react';

const HotkeySelector = ({ 
  value = '', 
  onChange, 
  placeholder = 'Press a key',
  disabled = false,
  label = 'Hotkey'
}) => {
  const [isCapturing, setIsCapturing] = useState(false);
  const [selectedKey, setSelectedKey] = useState('');
  const inputRef = useRef(null);

  // Parse existing hotkey value (extract key after "CmdOrCtrl+")
  useEffect(() => {
    if (value && !isCapturing) {
      if (value.startsWith('CmdOrCtrl+')) {
        const key = value.replace('CmdOrCtrl+', '');
        setSelectedKey(key);
      } else if (value.startsWith('Cmd+')) {
        const key = value.replace('Cmd+', '');
        setSelectedKey(key);
      } else {
        setSelectedKey('');
      }
    }
  }, [value, isCapturing]);

  const updateHotkey = (key) => {
    if (key) {
      const hotkeyString = `CmdOrCtrl+${key}`;
      onChange(hotkeyString);
      setSelectedKey(key);
    }
  };

  const handleCapture = () => {
    setIsCapturing(true);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleKeyDown = (e) => {
    if (!isCapturing) return;
    
    e.preventDefault();
    e.stopPropagation();

    const key = e.key;

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
      // Accept any key except Tab (since it's used for navigation)
      if (key !== 'Tab') {
        updateHotkey(normalizedKey);
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
      return 'Press any key...';
    }
    
    if (selectedKey) {
      return `⌘${selectedKey}`;
    }
    
    return `⌘${placeholder}`;
  };

  const clearHotkey = () => {
    setSelectedKey('');
    onChange('');
  };

  return (
    <div className="hotkey-selector">
      <label className="setting-label">{label}:</label>
      
      {/* Command + Key Input */}
      <div className="hotkey-input-group">
        <input
          ref={inputRef}
          type="text"
          value={formatDisplayValue()}
          onClick={handleCapture}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          readOnly
          disabled={disabled}
          className={`hotkey-input ${isCapturing ? 'capturing' : ''}`}
          placeholder={`⌘${placeholder}`}
        />
        
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

      {/* Help Text */}
      <div className="hotkey-help">
        <small>
          ⌘ All hotkeys use Command + another key. Click to set your key.
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
          padding: 0.75rem;
          border: 2px solid #ddd;
          border-radius: 6px;
          font-family: 'SF Mono', Monaco, 'Cascadia Code', monospace;
          font-size: 1.1rem;
          background: #f9f9f9;
          cursor: pointer;
          transition: all 0.2s ease;
          text-align: center;
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

        .hotkey-clear-btn {
          padding: 0.5rem;
          border: 1px solid #ddd;
          border-radius: 4px;
          background: #fff;
          cursor: pointer;
          transition: all 0.2s ease;
          color: #ff3b30;
          font-weight: bold;
        }

        .hotkey-clear-btn:hover {
          background: #f0f0f0;
          border-color: #ff3b30;
        }

        .hotkey-help {
          margin-top: 0.5rem;
          color: #666;
          font-style: italic;
        }
      `}</style>
    </div>
  );
};

export default HotkeySelector;

