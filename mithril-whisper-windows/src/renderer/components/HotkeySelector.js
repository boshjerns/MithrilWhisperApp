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

  // Parse existing hotkey value
  useEffect(() => {
    if (value && !isCapturing) {
      setSelectedKey(value);
    }
  }, [value, isCapturing]);

  const updateHotkey = (hotkeyString) => {
    if (hotkeyString) {
      onChange(hotkeyString);
      setSelectedKey(hotkeyString);
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
    const ctrl = e.ctrlKey;
    const alt = e.altKey;
    const shift = e.shiftKey;
    const meta = e.metaKey;

    // Cancel on Escape
    if (key === 'Escape') {
      setIsCapturing(false);
      if (inputRef.current) {
        inputRef.current.blur();
      }
      return;
    }

    // Normalize key name - handle special cases and convert to base key
    let normalizedKey = key;
    if (key === ' ') normalizedKey = 'Space';
    else if (key === 'ArrowUp') normalizedKey = 'Up';
    else if (key === 'ArrowDown') normalizedKey = 'Down';
    else if (key === 'ArrowLeft') normalizedKey = 'Left';
    else if (key === 'ArrowRight') normalizedKey = 'Right';
    else if (key.length === 1) {
      // For single characters, always use the base key (not shifted version)
      // This ensures Shift+W is captured as 'Shift+W' not 'Shift+W' where W is uppercase
      normalizedKey = key.toLowerCase().toUpperCase();
    }

    // Only process if we have a valid key (not just modifiers)
    if (!['Control', 'Alt', 'Shift', 'Meta', 'OS'].includes(key)) {
      // Accept any key except Tab (since it's used for navigation)
      if (key !== 'Tab') {
        // Build hotkey string with modifiers (convert Meta to CmdOrCtrl for Electron)
        let hotkeyParts = [];
        if (ctrl) hotkeyParts.push('Ctrl');
        if (alt) hotkeyParts.push('Alt');
        if (shift) hotkeyParts.push('Shift');
        if (meta) hotkeyParts.push('CmdOrCtrl'); // Convert Meta to CmdOrCtrl for Electron compatibility
        
        // For letters, always use uppercase in the hotkey string for consistency
        if (key.length === 1 && key.match(/[a-zA-Z]/)) {
          normalizedKey = key.toLowerCase().toUpperCase();
        }
        
        hotkeyParts.push(normalizedKey);

        const hotkeyString = hotkeyParts.join('+');
        updateHotkey(hotkeyString);
        setIsCapturing(false);
        
        if (inputRef.current) {
          inputRef.current.blur();
        }
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
      return selectedKey;
    }
    
    return placeholder;
  };

  const clearHotkey = () => {
    setSelectedKey('');
    onChange('');
  };

  return (
    <div className="hotkey-selector">
      <label className="setting-label">{label}:</label>
      
      {/* Windows Key + Key Input */}
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
          placeholder={placeholder}
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
          Click to capture any key or key combination (e.g., F6, Ctrl+A, Alt+Space).
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
          font-family: 'Consolas', 'Courier New', monospace;
          font-size: 1.1rem;
          background: #f9f9f9;
          cursor: pointer;
          transition: all 0.2s ease;
          text-align: center;
        }

        .hotkey-input:focus,
        .hotkey-input.capturing {
          border-color: #0078D4;
          background: #fff;
          outline: none;
          box-shadow: 0 0 0 3px rgba(0, 120, 212, 0.1);
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
          color: #D13438;
          font-weight: bold;
        }

        .hotkey-clear-btn:hover {
          background: #f0f0f0;
          border-color: #D13438;
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
