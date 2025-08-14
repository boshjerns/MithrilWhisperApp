import React, { useState, useEffect } from 'react';
import { MicrophoneIcon, SoundWaveIcon, PowerIcon } from './Icons';
import './DesktopHUD.css';

const { ipcRenderer } = window.require('electron');

function DesktopHUD() {
  const [status, setStatus] = useState('idle'); // idle, recording, processing
  const [isConnected, setIsConnected] = useState(true);
  const [audioLevel, setAudioLevel] = useState(0);
  const [collapsed, setCollapsed] = useState(false); // collapse to flat bar after inactivity
  const [idleTimerId, setIdleTimerId] = useState(null);

  useEffect(() => {
    // Listen for status updates from main process
    const handleStatusUpdate = (event, newStatus) => {
      setStatus(newStatus.mode || 'idle');
      setAudioLevel(newStatus.audioLevel || 0);
      setIsConnected(newStatus.connected !== false);
    };

    const handleAudioLevel = (event, level) => {
      setAudioLevel(Math.min(level * 100, 100));
    };

    ipcRenderer.on('hud-status-update', handleStatusUpdate);
    ipcRenderer.on('hud-audio-level', handleAudioLevel);

    // Send ready signal
    ipcRenderer.send('hud-ready');

    return () => {
      ipcRenderer.removeListener('hud-status-update', handleStatusUpdate);
      ipcRenderer.removeListener('hud-audio-level', handleAudioLevel);
    };
  }, []);

  // Collapse behavior: if not recording for 5 seconds, collapse to flat bar
  useEffect(() => {
    // Reset any previous timer
    if (idleTimerId) {
      clearTimeout(idleTimerId);
    }

    if (
      status === 'recording' ||
      status === 'processing' ||
      status === 'assistant-recording' ||
      status === 'assistant-processing'
    ) {
      setCollapsed(false);
      setIdleTimerId(null);
      return;
    }

    // status is idle → start 5s timer to collapse
    const timer = setTimeout(() => {
      setCollapsed(true);
    }, 5000);
    setIdleTimerId(timer);

    return () => {
      clearTimeout(timer);
    };
  }, [status]);

  const getStatusIcon = () => {
    try {
      switch (status) {
        case 'recording':
          return <SoundWaveIcon size={20} className="status-icon recording" />;
        case 'processing':
          return <MicrophoneIcon size={20} className="status-icon processing" />;
        case 'assistant-recording':
          return <SoundWaveIcon size={20} className="status-icon assistant-recording" />;
        case 'assistant-processing':
          return <MicrophoneIcon size={20} className="status-icon assistant-processing" />;
        default:
          return <PowerIcon size={20} className="status-icon idle" />;
      }
    } catch (error) {
      console.error('Icon error:', error);
      // Fallback to text if icons fail
      switch (status) {
        case 'recording':
          return <span style={{ color: '#00d4ff' }}>🎵</span>;
        case 'processing':
          return <span style={{ color: '#ffaa00' }}>⚙️</span>;
        default:
          return <span style={{ color: '#0099cc' }}>●</span>;
      }
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'recording':
        return 'REC';
      case 'processing':
        return 'PROC';
      default:
        return 'READY';
    }
  };

  // Debug transparency
  React.useEffect(() => {
    console.log('🎯 DesktopHUD rendering with complete transparency');
    
    // Force background transparency on mount
    const root = document.getElementById('hud-root');
    if (root) {
      root.style.background = 'transparent';
      root.style.backgroundColor = 'transparent';
    }
    
    document.body.style.background = 'transparent';
    document.body.style.backgroundColor = 'transparent';
    document.documentElement.style.background = 'transparent';
    document.documentElement.style.backgroundColor = 'transparent';
  }, []);

  return (
    <div id="hud-root" className={`desktop-hud ${status} ${collapsed ? 'collapsed' : ''} ${!isConnected ? 'disconnected' : ''}`}>
      {/* Pure Circular Button - No Containers */}
      <div className="status-section">
        {!collapsed && getStatusIcon()}
        {status === 'recording' && !collapsed && (
          <div className="recording-pulse-ring"></div>
        )}
        {status === 'assistant-recording' && !collapsed && (
          <div className="recording-pulse-ring" style={{ borderColor: 'rgba(139,92,246,0.35)' }}></div>
        )}
      </div>
    </div>
  );
}

export default DesktopHUD; 