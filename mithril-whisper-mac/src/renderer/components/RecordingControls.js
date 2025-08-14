import React from 'react';
import { MicrophoneIcon, SoundWaveIcon, InfoIcon } from './Icons';

function RecordingControls({ 
  isRecording, 
  onStartRecording, 
  onStopRecording, 
  onToggleRecording, 
  hotkey,
  disabled,
}) {
  return (
    <div className="recording-controls">
      <div className="section-header">
        <h2>Recording Controls</h2>
      </div>
      <p className="terminal-text">{disabled ? 'Sign in to start recording' : `Use the controls below or press [${hotkey}] to toggle recording`}</p>

      <div className="glass-card" style={{ textAlign: 'center', marginTop: '32px' }}>
        <button
          className={`record-button ${isRecording ? 'recording' : ''}`}
          onClick={disabled ? undefined : onToggleRecording}
          disabled={disabled}
        >
          {isRecording ? (
            <SoundWaveIcon size={60} />
          ) : (
            <MicrophoneIcon size={60} />
          )}
        </button>
        
        <h3 style={{ marginTop: '24px', fontSize: '16px' }}>
          {isRecording ? 'Stop Recording' : 'Start Recording'}
        </h3>
      </div>

      <div className="glass-card" style={{ marginTop: '24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div>
            <div className="input-label">Status:</div>
            <div className={`terminal-text ${isRecording ? 'recording' : ''}`}>
              {isRecording ? 'Recording...' : 'Ready'}
            </div>
          </div>
          
          <div>
            <div className="input-label">Hotkey:</div>
            <div className="terminal-text" style={{ fontFamily: 'JetBrains Mono', fontSize: '14px' }}>
              {hotkey}
            </div>
          </div>
        </div>
      </div>

      <div className="glass-card" style={{ marginTop: '24px' }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <InfoIcon size={20} />
          Tips
        </h3>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          <li className="terminal-text" style={{ marginBottom: '8px' }}>Press {hotkey} to start recording</li>
          <li className="terminal-text" style={{ marginBottom: '8px' }}>Press {hotkey} again to stop and process</li>
          <li className="terminal-text" style={{ marginBottom: '8px' }}>Text will be automatically cleaned up</li>
          <li className="terminal-text" style={{ marginBottom: '8px' }}>Cleaned text is injected into the active app</li>
        </ul>
      </div>
    </div>
  );
}

export default RecordingControls; 