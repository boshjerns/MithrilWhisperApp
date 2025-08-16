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
    </div>
  );
}

export default RecordingControls; 