import React from 'react';
import { MicrophoneIcon, SoundWaveIcon, InfoIcon, BrainIcon } from './Icons';

function RecordingControls({ 
  isRecording, 
  onStartRecording, 
  onStopRecording, 
  onToggleRecording, 
  hotkey,
  assistantHotkey,
  disabled,
}) {
  // ASCII art for the homepage
  const mithrilAsciiArt = `███╗   ███╗██╗████████╗██╗  ██╗██████╗ ██╗██╗     
████╗ ████║██║╚══██╔══╝██║  ██║██╔══██╗██║██║     
██╔████╔██║██║   ██║   ███████║██████╔╝██║██║     
██║╚██╔╝██║██║   ██║   ██╔══██║██╔══██╗██║██║     
██║ ╚═╝ ██║██║   ██║   ██║  ██║██║  ██║██║███████╗
╚═╝     ╚═╝╚═╝   ╚═╝   ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝╚══════╝

██╗    ██╗██╗  ██╗██╗███████╗██████╗ ███████╗██████╗ 
██║    ██║██║  ██║██║██╔════╝██╔══██╗██╔════╝██╔══██╗
██║ █╗ ██║███████║██║███████╗██████╔╝█████╗  ██████╔╝
██║███╗██║██╔══██║██║╚════██║██╔═══╝ ██╔══╝  ██╔══██╗
╚███╔███╔╝██║  ██║██║███████║██║     ███████╗██║  ██║
 ╚══╝╚══╝ ╚═╝  ╚═╝╚═╝╚══════╝╚═╝     ╚══════╝╚═╝  ╚═╝`;

  return (
    <div className="recording-controls">
      {/* ASCII Art Header */}
      <div className="homepage-header">
        <pre className="homepage-ascii">{mithrilAsciiArt}</pre>
        <p className="homepage-subtitle">Enterprise-Grade Voice Transcription & AI Assistant</p>
      </div>

      {/* Quick Status Overview */}
      <div className="glass-card status-overview">
        <div className="status-grid">
          <div className="status-item">
            <div className="status-label">STATUS:</div>
            <div className={`status-value ${isRecording ? 'recording' : 'ready'}`}>
              {disabled ? 'Sign In Required' : (isRecording ? '🔴 Recording...' : '🟢 Ready')}
            </div>
          </div>
          
          <div className="status-item">
            <div className="status-label">RECORDING HOTKEY:</div>
            <div className="status-value hotkey-display">
              <kbd>{hotkey || 'Not Set'}</kbd>
            </div>
          </div>

          <div className="status-item">
            <div className="status-label">ASSISTANT HOTKEY:</div>
            <div className="status-value hotkey-display">
              <kbd>{assistantHotkey || 'Not Set'}</kbd>
            </div>
          </div>
        </div>
      </div>

      {/* Dynamic Instructions */}
      <div className="glass-card instructions-card">
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <InfoIcon size={20} />
          Quick Start Guide
        </h3>
        
        <div className="instructions-grid">
          {/* Recording Instructions */}
          <div className="instruction-section">
            <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <MicrophoneIcon size={16} />
              Voice Recording
            </h4>
            <ul className="instruction-list">
              <li>Press <kbd>{hotkey || 'hotkey'}</kbd> to start recording</li>
              <li>Press <kbd>{hotkey || 'hotkey'}</kbd> again to stop and process</li>
              <li>Text automatically cleans up and injects into active app</li>
            </ul>
          </div>

          {/* Assistant Instructions */}
          <div className="instruction-section">
            <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <BrainIcon size={16} />
              AI Assistant
            </h4>
            <ul className="instruction-list">
              <li>Press <kbd>{assistantHotkey || 'assistant hotkey'}</kbd> to start assistant</li>
              <li>Speak your question or request</li>
              <li>AI responds and can inject code/text automatically</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Optional: Manual Record Button - smaller and less prominent */}
      {!disabled && (
        <div className="glass-card manual-controls" style={{ textAlign: 'center', marginTop: '20px' }}>
          <p className="manual-controls-label">Manual Control (Hotkeys Recommended)</p>
          <button
            className={`record-button-small ${isRecording ? 'recording' : ''}`}
            onClick={onToggleRecording}
          >
            {isRecording ? (
              <>
                <SoundWaveIcon size={24} />
                <span>Stop Recording</span>
              </>
            ) : (
              <>
                <MicrophoneIcon size={24} />
                <span>Start Recording</span>
              </>
            )}
          </button>
          <p className="manual-controls-note">
            Note: You'll still need to use <kbd>{hotkey}</kbd> to stop and inject text from other apps
          </p>
        </div>
      )}

      <style>{`
        .homepage-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .homepage-ascii {
          font-family: 'JetBrains Mono', 'SF Mono', Monaco, 'Cascadia Code', monospace;
          font-size: 10px;
          line-height: 0.9;
          color: #58a6ff;
          text-shadow: 0 0 8px rgba(88, 166, 255, 0.3);
          margin: 0;
          white-space: pre;
          background: rgba(0, 8, 20, 0.6);
          padding: 1rem;
          border-radius: 8px;
          border: 1px solid rgba(88, 166, 255, 0.2);
          overflow-x: auto;
        }

        .homepage-subtitle {
          margin-top: 1rem;
          color: #8b949e;
          font-size: 14px;
          letter-spacing: 1px;
        }

        .status-overview {
          margin-bottom: 1.5rem;
        }

        .status-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
        }

        .status-item {
          text-align: center;
        }

        .status-label {
          font-size: 11px;
          color: #8b949e;
          letter-spacing: 1px;
          margin-bottom: 0.5rem;
          font-weight: 600;
        }

        .status-value {
          font-family: 'JetBrains Mono', monospace;
          font-size: 14px;
          font-weight: 500;
        }

        .status-value.ready {
          color: #3fb950;
        }

        .status-value.recording {
          color: #f85149;
          animation: pulse 1s infinite;
        }

        .hotkey-display kbd {
          background: rgba(88, 166, 255, 0.1);
          border: 1px solid rgba(88, 166, 255, 0.3);
          border-radius: 4px;
          padding: 4px 8px;
          font-size: 12px;
          color: #58a6ff;
        }

        .instructions-card {
          margin-bottom: 1.5rem;
        }

        .instructions-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5rem;
        }

        .instruction-section h4 {
          color: #58a6ff;
          margin: 0 0 12px 0;
          font-size: 14px;
        }

        .instruction-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .instruction-list li {
          margin-bottom: 8px;
          padding-left: 16px;
          position: relative;
          color: #e6edf3;
          font-size: 13px;
          line-height: 1.4;
        }

        .instruction-list li::before {
          content: '▶';
          position: absolute;
          left: 0;
          color: #58a6ff;
          font-size: 10px;
        }

        .instruction-list kbd {
          background: rgba(88, 166, 255, 0.1);
          border: 1px solid rgba(88, 166, 255, 0.3);
          border-radius: 3px;
          padding: 2px 6px;
          font-size: 11px;
          color: #58a6ff;
          margin: 0 2px;
        }

        .manual-controls {
          opacity: 0.8;
        }

        .manual-controls-label {
          font-size: 12px;
          color: #8b949e;
          margin-bottom: 12px;
        }

        .record-button-small {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          background: rgba(88, 166, 255, 0.1);
          border: 1px solid rgba(88, 166, 255, 0.3);
          border-radius: 6px;
          color: #58a6ff;
          cursor: pointer;
          transition: all 0.2s ease;
          font-size: 13px;
          margin: 0 auto;
        }

        .record-button-small:hover {
          background: rgba(88, 166, 255, 0.2);
          border-color: rgba(88, 166, 255, 0.5);
        }

        .record-button-small.recording {
          background: rgba(248, 81, 73, 0.1);
          border-color: rgba(248, 81, 73, 0.3);
          color: #f85149;
        }

        .manual-controls-note {
          font-size: 11px;
          color: #8b949e;
          margin-top: 8px;
          line-height: 1.3;
        }

        .manual-controls-note kbd {
          background: rgba(88, 166, 255, 0.1);
          border: 1px solid rgba(88, 166, 255, 0.3);
          border-radius: 3px;
          padding: 2px 4px;
          font-size: 10px;
          color: #58a6ff;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }

        /* Responsive adjustments */
        @media (max-width: 600px) {
          .homepage-ascii {
            font-size: 8px;
            padding: 0.5rem;
          }
          
          .status-grid {
            grid-template-columns: 1fr;
            gap: 0.5rem;
          }
          
          .instructions-grid {
            grid-template-columns: 1fr;
            gap: 1rem;
          }
        }
      `}</style>
    </div>
  );
}

export default RecordingControls; 