import React, { useState, useEffect, useCallback } from 'react';
import { AuthProvider, useAuth } from './auth/AuthContext';
import Settings from './components/Settings';
import UsageHistory from './components/UsageHistory';
import RecordingControls from './components/RecordingControls';
import TitleBar from './components/TitleBar';
import { TerminalIcon } from './components/Icons';
import Account from './components/Account';
import './styles.css';

const { ipcRenderer } = window.require('electron');

function AppInner() {
  const [settings, setSettings] = useState({
    hotkey: 'Alt+Space',
    model: 'small',
    sensitivity: 0.5,
    cleanup: true,
    autoInject: true,
  });
  
  const [transcriptions, setTranscriptions] = useState([]); // retained only for tab label count migration
  const [isRecording, setIsRecording] = useState(false);
  const [currentTab, setCurrentTab] = useState('controls');
  const { user } = useAuth();

  // Load settings on component mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const savedSettings = await ipcRenderer.invoke('get-settings');
        setSettings(prevSettings => ({ ...prevSettings, ...savedSettings }));
      } catch (error) {
        console.error('Failed to load settings:', error);
      }
    };

    loadSettings();
  }, []);

  // Set up IPC listeners
  useEffect(() => {
    const handleNewTranscript = (event, data) => {
      setTranscriptions(prev => [
        {
          id: Date.now(),
          ...data
        },
        ...prev
      ]);
    };

    const handleRecordingStatus = (event, recording) => {
      setIsRecording(recording);
    };

    const handleStartAudioRecording = (event, options) => {
      startWebAudioRecording(options);
    };

    const handleStopAudioRecording = () => {
      stopWebAudioRecording();
    };

    ipcRenderer.on('new-transcript', handleNewTranscript);
    ipcRenderer.on('recording-status', handleRecordingStatus);
    ipcRenderer.on('start-audio-recording', handleStartAudioRecording);
    ipcRenderer.on('stop-audio-recording', handleStopAudioRecording);

    return () => {
      ipcRenderer.removeListener('new-transcript', handleNewTranscript);
      ipcRenderer.removeListener('recording-status', handleRecordingStatus);
      ipcRenderer.removeListener('start-audio-recording', handleStartAudioRecording);
      ipcRenderer.removeListener('stop-audio-recording', handleStopAudioRecording);
    };
  }, []);

  const handleSettingsChange = useCallback(async (newSettings) => {
    try {
      setSettings(newSettings);
      await ipcRenderer.invoke('save-settings', newSettings);
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  }, []);

  const handleStartRecording = useCallback(async () => {
    try {
      await ipcRenderer.invoke('start-recording');
    } catch (error) {
      console.error('Failed to start recording:', error);
    }
  }, []);

  const handleStopRecording = useCallback(async () => {
    try {
      await ipcRenderer.invoke('stop-recording');
    } catch (error) {
      console.error('Failed to stop recording:', error);
    }
  }, []);

  const handleToggleRecording = useCallback(async () => {
    try {
      await ipcRenderer.invoke('toggle-recording');
    } catch (error) {
      console.error('Failed to toggle recording:', error);
    }
  }, []);

  const handleInjectText = useCallback(async (text) => {
    try {
      await ipcRenderer.invoke('inject-text', text);
    } catch (error) {
      console.error('Failed to inject text:', error);
    }
  }, []);

  const clearTranscriptions = useCallback(() => {
    setTranscriptions([]);
  }, []);

  // Listen for usage events and forward to Supabase uploader
  useEffect(() => {
    const handler = async (_event, payload) => {
      try {
        const { uploadUsageEvent } = await import('./usage/uploader');
        await uploadUsageEvent(payload);
      } catch (e) {
        console.error('Failed to upload usage event', e);
      }
    };
    ipcRenderer.on('usage:session-completed', handler);
    return () => ipcRenderer.removeListener('usage:session-completed', handler);
  }, []);

    // Web Audio API recording functions
  let mediaRecorder = null;
  let audioChunks = [];
  let recognition = null;
  let finalTranscript = '';
  let audioContext = null;
  let audioProcessor = null;

  const startWebAudioRecording = async (options) => {
    try {
      console.log('Starting Web Audio recording with options:', options);
      
      // Reset transcript
      finalTranscript = '';
      
      // Start Web Speech API recognition
      console.log('Checking speech recognition availability...');
      console.log('webkitSpeechRecognition available:', 'webkitSpeechRecognition' in window);
      console.log('SpeechRecognition available:', 'SpeechRecognition' in window);
      
      if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        try {
          const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
          recognition = new SpeechRecognition();
          
          recognition.continuous = true;
          recognition.interimResults = true;
          recognition.lang = 'en-US';
          
          console.log('Speech recognition instance created, starting...');
          
          recognition.onstart = () => {
            console.log('🎤 Speech recognition started successfully!');
          };
          
          recognition.onresult = (event) => {
            console.log('🎯 Speech recognition result received:', event);
            let interimTranscript = '';
            
            for (let i = event.resultIndex; i < event.results.length; i++) {
              const transcript = event.results[i][0].transcript;
              if (event.results[i].isFinal) {
                finalTranscript += transcript + ' ';
                console.log('✅ Final transcript:', transcript);
              } else {
                interimTranscript += transcript;
                console.log('⏳ Interim transcript:', transcript);
              }
            }
            
            // Send interim results to show live transcription
            const fullTranscript = (finalTranscript + interimTranscript).trim();
            if (fullTranscript) {
              console.log('📤 Sending speech result to main:', fullTranscript);
              ipcRenderer.send('speech-recognition-result', {
                text: fullTranscript,
                isFinal: false
              });
            }
          };
          
          recognition.onerror = (event) => {
            console.error('❌ Speech recognition error:', event.error, event);
          };
          
          recognition.onend = () => {
            console.log('🔚 Speech recognition ended');
            if (finalTranscript.trim()) {
              console.log('📤 Sending final transcript:', finalTranscript.trim());
              ipcRenderer.send('speech-recognition-result', {
                text: finalTranscript.trim(),
                isFinal: true
              });
            }
          };
          
          recognition.start();
          console.log('🚀 Speech recognition start() called');
          
        } catch (error) {
          console.error('❌ Failed to create/start speech recognition:', error);
        }
      } else {
        console.warn('⚠️ Speech recognition not available in this browser/context');
      }
      
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          sampleRate: options.sampleRate || 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true
        } 
      });
      
      // Create Web Audio API context for raw PCM data
      audioContext = new (window.AudioContext || window.webkitAudioContext)({
        sampleRate: 16000
      });
      
      const source = audioContext.createMediaStreamSource(stream);
      audioProcessor = audioContext.createScriptProcessor(4096, 1, 1);
      
      audioChunks = [];
      
      audioProcessor.onaudioprocess = (e) => {
        const inputData = e.inputBuffer.getChannelData(0);
        // Convert float32 to int16
        const int16Data = new Int16Array(inputData.length);
        for (let i = 0; i < inputData.length; i++) {
          const s = Math.max(-1, Math.min(1, inputData[i]));
          int16Data[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
        }
        
        // Send PCM data to main process
        const buffer = new Uint8Array(int16Data.buffer);
        ipcRenderer.send('audio-data-chunk', Array.from(buffer));
      };
      
      source.connect(audioProcessor);
      audioProcessor.connect(audioContext.destination);
      
      // Still create MediaRecorder for compatibility but don't use its data
      mediaRecorder = new MediaRecorder(stream);
      mediaRecorder.ondataavailable = () => {};
      
      mediaRecorder.onstart = () => {
        console.log('MediaRecorder started');
        ipcRenderer.send('audio-recording-started');
      };
      
      mediaRecorder.onstop = () => {
        console.log('MediaRecorder stopped');
        ipcRenderer.send('audio-recording-stopped');
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorder.onerror = (error) => {
        console.error('MediaRecorder error:', error);
        ipcRenderer.send('audio-recording-error', error.toString());
      };
      
      // Start recording with 100ms intervals
      mediaRecorder.start(100);
      
    } catch (error) {
      console.error('Failed to start Web Audio recording:', error);
      ipcRenderer.send('audio-recording-error', error.toString());
    }
  };

  const stopWebAudioRecording = () => {
    try {
      // Stop speech recognition
      if (recognition) {
        console.log('Stopping speech recognition');
        recognition.stop();
        recognition = null;
      }
      
      // Stop audio context and processor
      if (audioProcessor) {
        audioProcessor.disconnect();
        audioProcessor = null;
      }
      
      if (audioContext) {
        audioContext.close();
        audioContext = null;
      }
      
      // Stop media recorder
      if (mediaRecorder && mediaRecorder.state !== 'inactive') {
        console.log('Stopping Web Audio recording');
        mediaRecorder.stop();
      }
    } catch (error) {
      console.error('Failed to stop Web Audio recording:', error);
      ipcRenderer.send('audio-recording-error', error.toString());
    }
  };

  return (
    <div className="app">
      <TitleBar />
      
      <div className="app-header">
        <div className="status-indicator">
          <div className={`status-dot ${isRecording ? 'recording' : ''}`}></div>
          <span className="status-text">{isRecording ? 'Recording' : 'Ready'}</span>
        </div>
      </div>

      <div className="nav-tabs">
        <button 
          className={`nav-tab ${currentTab === 'controls' ? 'active' : ''}`}
          onClick={() => setCurrentTab('controls')}
        >
          Controls
        </button>
        <button 
          className={`nav-tab ${currentTab === 'history' ? 'active' : ''}`}
          onClick={() => setCurrentTab('history')}
        >
          History
        </button>
        <button 
          className={`nav-tab ${currentTab === 'settings' ? 'active' : ''}`}
          onClick={() => setCurrentTab('settings')}
        >
          Settings
        </button>
        <button 
          className={`nav-tab ${currentTab === 'account' ? 'active' : ''}`}
          onClick={() => setCurrentTab('account')}
        >
          Account
        </button>
      </div>

      <div className="content">
        {/* mithril whisper ASCII mark */}
        {currentTab === 'controls' && (
          <pre className="mythril-ascii">{`███╗   ███╗██╗████████╗██╗  ██╗██████╗ ██╗██╗     
████╗ ████║██║╚══██╔══╝██║  ██║██╔══██╗██║██║     
██╔████╔██║██║   ██║   ███████║██████╔╝██║██║     
██║╚██╔╝██║██║   ██║   ██╔══██║██╔══██╗██║██║     
██║ ╚═╝ ██║██║   ██║   ██║  ██║██║  ██║██║███████╗
╚═╝     ╚═╝╚═╝   ╚═╝   ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝╚══════╝`}</pre>
        )}
        {currentTab === 'controls' && (
          <RecordingControls
            isRecording={isRecording}
            onStartRecording={handleStartRecording}
            onStopRecording={handleStopRecording}
            onToggleRecording={handleToggleRecording}
            hotkey={settings.hotkey}
            disabled={!user}
          />
        )}

        {currentTab === 'history' && (
          <UsageHistory />
        )}

        {currentTab === 'settings' && (
          <Settings
            settings={settings}
            onChange={handleSettingsChange}
          />
        )}
        {currentTab === 'account' && (
          <Account />
        )}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppInner />
    </AuthProvider>
  );
}