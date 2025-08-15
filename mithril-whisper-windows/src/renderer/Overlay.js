import React, { useState, useEffect } from 'react';
import { MicrophoneIcon, SoundWaveIcon } from './components/Icons';
import './styles.css';

const { ipcRenderer } = window.require('electron');

function Overlay() {
  const [transcript, setTranscript] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const handleUpdateTranscript = (event, text) => {
      setTranscript(text);
      setIsVisible(true);
      setFadeOut(false);
      
      // Auto-hide after 3 seconds of no updates
      const fadeTimer = setTimeout(() => {
        setFadeOut(true);
        setTimeout(() => {
          setIsVisible(false);
          setTranscript('');
        }, 500);
      }, 3000);

      return () => clearTimeout(fadeTimer);
    };

    ipcRenderer.on('update-transcript', handleUpdateTranscript);

    return () => {
      ipcRenderer.removeListener('update-transcript', handleUpdateTranscript);
    };
  }, []);

  if (!isVisible) {
    return null;
  }

  const isListening = transcript === 'Listening...';
  
  return (
    <div className={`overlay ${fadeOut ? 'fade-out' : ''}`} style={{ 
      position: 'fixed',
      top: '20px',
      right: '20px',
      zIndex: 9999,
      pointerEvents: 'none'
    }}>
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '12px',
        minWidth: '200px'
      }}>
        <div style={{ 
          animation: isListening ? 'pulse 2s infinite' : 'none',
          color: isListening ? 'var(--primary)' : 'var(--success)'
        }}>
          {isListening ? (
            <SoundWaveIcon size={24} />
          ) : (
            <MicrophoneIcon size={24} />
          )}
        </div>
        <div className="terminal-text" style={{ 
          fontSize: '14px',
          maxWidth: '300px',
          wordWrap: 'break-word'
        }}>
          {transcript || 'Listening...'}
        </div>
      </div>
    </div>
  );
}

export default Overlay; 