import React from 'react';

// Mac-optimized title bar with ASCII art
function TitleBar() {
  // Compact ASCII art for title bar
  const compactMithrilArt = `███╗   ███╗██╗████████╗██╗  ██╗██████╗ ██╗██╗     
████╗ ████║██║╚══██╔══╝██║  ██║██╔══██╗██║██║     
██╔████╔██║██║   ██║   ███████║██████╔╝██║██║     
██║╚██╔╝██║██║   ██║   ██╔══██║██╔══██╗██║██║     
██║ ╚═╝ ██║██║   ██║   ██║  ██║██║  ██║██║███████╗
╚═╝     ╚═╝╚═╝   ╚═╝   ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝╚══════╝`;

  return (
    <div className="mac-title-bar">
      {/* Left side: Space for native macOS controls (red, yellow, green buttons) */}
      <div className="mac-title-bar-left">
        {/* This area is reserved for native macOS traffic light buttons */}
      </div>
      
      {/* Center: Draggable region */}
      <div className="mac-title-bar-drag-region">
        {/* Intentionally empty - serves as draggable area */}
      </div>
      
      {/* Right side: ASCII art title */}
      <div className="mac-title-bar-right">
        <div className="mac-title-content">
          <pre className="mac-title-ascii">{compactMithrilArt}</pre>
          <div className="mac-subtitle">WHISPER</div>
        </div>
      </div>
    </div>
  );
}

export default TitleBar;