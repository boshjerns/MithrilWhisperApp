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
    <>
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

      <style>{`
        .mac-title-bar {
          display: flex;
          align-items: center;
          height: 40px;
          width: 100%;
          background: rgba(0, 8, 20, 0.95);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 1000;
          -webkit-app-region: drag;
          padding: 0;
        }

        .mac-title-bar-left {
          width: 80px;
          height: 100%;
          flex-shrink: 0;
          /* Reserve space for native macOS controls */
        }

        .mac-title-bar-drag-region {
          flex: 1;
          height: 100%;
          /* This area allows window dragging */
        }

        .mac-title-bar-right {
          padding-right: 20px;
          flex-shrink: 0;
          -webkit-app-region: no-drag;
          display: flex;
          align-items: center;
          height: 100%;
        }

        .mac-title-content {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .mac-title-ascii {
          font-family: 'JetBrains Mono', 'SF Mono', Monaco, 'Cascadia Code', monospace;
          font-size: 3px;
          line-height: 0.8;
          color: #58a6ff;
          text-shadow: 0 0 4px rgba(88, 166, 255, 0.3);
          margin: 0;
          white-space: pre;
          transform: scale(0.8);
          transform-origin: center;
          opacity: 0.9;
        }

        .mac-subtitle {
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px;
          font-weight: 600;
          color: #58a6ff;
          letter-spacing: 1px;
          opacity: 0.8;
          margin-left: 4px;
        }

        /* Responsive scaling for smaller windows */
        @media (max-width: 500px) {
          .mac-title-ascii {
            font-size: 2.5px;
            transform: scale(0.7);
          }
          .mac-subtitle {
            font-size: 9px;
          }
        }

        @media (max-width: 350px) {
          .mac-title-ascii {
            font-size: 2px;
            transform: scale(0.6);
          }
          .mac-subtitle {
            font-size: 8px;
          }
        }
      `}</style>
    </>
  );
}

export default TitleBar;