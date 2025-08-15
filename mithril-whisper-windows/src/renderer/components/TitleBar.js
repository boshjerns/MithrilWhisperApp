import React, { useState, useEffect } from 'react';
import { TerminalIcon } from './Icons';

const { ipcRenderer } = window.require('electron');

// Custom window control icons
const MinimizeIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
    <path d="M4 8h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

const MaximizeIcon = ({ size = 16, isMaximized = false }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
    {isMaximized ? (
      // Restore icon
      <>
        <rect x="3" y="5" width="8" height="8" stroke="currentColor" strokeWidth="1.5" fill="none"/>
        <path d="M5 5V3a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1h-2" stroke="currentColor" strokeWidth="1.5" fill="none"/>
      </>
    ) : (
      // Maximize icon
      <rect x="3" y="3" width="10" height="10" stroke="currentColor" strokeWidth="1.5" fill="none"/>
    )}
  </svg>
);

const CloseIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
    <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

function TitleBar() {
  const [isMaximized, setIsMaximized] = useState(false);

  useEffect(() => {
    // Get initial maximized state
    const checkMaximized = async () => {
      const maximized = await ipcRenderer.invoke('window-is-maximized');
      setIsMaximized(maximized);
    };
    
    checkMaximized();

    // Listen for window state changes
    const handleMaximize = () => setIsMaximized(true);
    const handleUnmaximize = () => setIsMaximized(false);

    // Note: These events might not be available, so we'll poll instead
    const interval = setInterval(checkMaximized, 1000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  const handleMinimize = () => {
    ipcRenderer.invoke('window-minimize');
  };

  const handleMaximize = () => {
    ipcRenderer.invoke('window-maximize');
  };

  const handleClose = () => {
    ipcRenderer.invoke('window-close');
  };

  return (
    <div className="title-bar">
      {/* Draggable area */}
      <div className="title-bar-drag-region">
        <div className="title-bar-title">
          <TerminalIcon size={16} />
          <span>mithril whisper</span>
        </div>
      </div>

      {/* Window controls */}
      <div className="title-bar-controls">
        <button 
          className="title-bar-button minimize"
          onClick={handleMinimize}
          title="Minimize"
        >
          <MinimizeIcon />
        </button>
        
        <button 
          className="title-bar-button maximize"
          onClick={handleMaximize}
          title={isMaximized ? "Restore" : "Maximize"}
        >
          <MaximizeIcon isMaximized={isMaximized} />
        </button>
        
        <button 
          className="title-bar-button close"
          onClick={handleClose}
          title="Close"
        >
          <CloseIcon />
        </button>
      </div>
    </div>
  );
}

export default TitleBar; 