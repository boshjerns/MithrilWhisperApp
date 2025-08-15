import React, { useState, useEffect, useCallback } from 'react';
import { AuthProvider, useAuth } from './auth/AuthContext';
import Settings from './components/Settings';
import UsageHistory from './components/UsageHistory';
import RecordingControls from './components/RecordingControls';
import TitleBar from './components/TitleBar';
import { TerminalIcon } from './components/Icons';
import Account from './components/Account';
import About from './components/About';
import './styles.css';

const { ipcRenderer } = window.require('electron');

function AppInner() {
  const [settings, setSettings] = useState({
    hotkey: 'Cmd+Q',
    assistantHotkey: 'Cmd+W',
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
      
      if (false && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
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
      // Request microphone access with robust constraints
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          sampleRate: options.sampleRate || 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: false
        } 
      });
      
      // Create / resume Web Audio API context for raw PCM data
      audioContext = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 16000 });
      try { await audioContext.resume(); } catch (_) {}
      
      const source = audioContext.createMediaStreamSource(stream);
      audioProcessor = audioContext.createScriptProcessor(4096, 1, 1);
      
      audioChunks = [];
      
      audioProcessor.onaudioprocess = (e) => {
        const inputData = e.inputBuffer.getChannelData(0);
        // Compute RMS to detect silence for visual feedback only
        let sum = 0;
        for (let i = 0; i < inputData.length; i++) { const v = inputData[i]; sum += v * v; }
        const rms = Math.sqrt(sum / inputData.length);
        
        // 🎙️ Visual feedback only - no more IPC chunk sending!
        console.log('🎤 Audio level (RMS):', rms.toFixed(6), 'Length:', inputData.length);
        
        // Note: Audio data now captured by MediaRecorder instead of IPC chunks
        // This fixes the Mac production build audio issue
      };
      
      source.connect(audioProcessor);
      audioProcessor.connect(audioContext.destination);
      
      // 🎯 PROPER MAC APPROACH: AudioWorklet + PCM streaming (no file conversion!)
      // This completely avoids the IPC file transfer issues
      console.log('🚀 Using AudioWorklet for direct PCM streaming...');
      
      // Load the AudioWorklet processor
      try {
        await audioContext.audioWorklet.addModule('data:text/javascript;charset=utf-8,' + 
          encodeURIComponent(`
            class RecorderProcessor extends AudioWorkletProcessor {
              constructor() {
                super();
                this.isRecording = false;
                this.port.onmessage = (event) => {
                  if (event.data.command === 'start') {
                    this.isRecording = true;
                  } else if (event.data.command === 'stop') {
                    this.isRecording = false;
                  }
                };
              }
              
              process(inputs) {
                if (!this.isRecording) return true;
                
                const input = inputs[0];
                if (input && input[0] && input[0].length > 0) {
                  // Convert Float32 PCM to Int16 for Whisper (16kHz mono)
                  const float32Data = input[0]; // First channel
                  const int16Data = new Int16Array(float32Data.length);
                  
                  for (let i = 0; i < float32Data.length; i++) {
                    // Convert [-1,1] float to [-32768,32767] int16 with normal gain
                    let sample = float32Data[i] * 1.0; // Normal gain for Mac microphone capture
                    sample = Math.max(-1, Math.min(1, sample)); // Clamp
                    int16Data[i] = sample < 0 ? sample * 32768 : sample * 32767;
                  }
                  
                  // Send small PCM chunks directly to main process
                  this.port.postMessage({
                    type: 'audioData',
                    data: int16Data,
                    length: int16Data.length
                  });
                }
                return true;
              }
            }
            registerProcessor('recorder-processor', RecorderProcessor);
          `)
        );
        console.log('✅ AudioWorklet processor loaded');
      } catch (error) {
        console.error('❌ Failed to load AudioWorklet:', error);
        throw error;
      }
      
      // Create AudioWorklet node
      const workletNode = new AudioWorkletNode(audioContext, 'recorder-processor');
      
      // Handle PCM data from worklet
      workletNode.port.onmessage = (event) => {
        if (event.data.type === 'audioData') {
          // Send small PCM chunks directly via IPC (much faster than big files!)
          ipcRenderer.send('audio-pcm-chunk', {
            data: Array.from(event.data.data),
            length: event.data.length,
            sampleRate: 16000,
            channels: 1
          });
        }
      };
      
      // Connect audio graph: Microphone → Worklet → Destination
      source.connect(workletNode);
      workletNode.connect(audioContext.destination);
      
      // Create dummy MediaRecorder for compatibility (but don't use it)
      mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      
      mediaRecorder.onstart = () => {
        console.log('✅ AudioWorklet recording started (streaming PCM directly)');
        workletNode.port.postMessage({ command: 'start' });
        ipcRenderer.send('audio-recording-started');
      };
      
      mediaRecorder.onstop = () => {
        console.log('🛑 AudioWorklet recording stopped');
        workletNode.port.postMessage({ command: 'stop' });
        ipcRenderer.send('audio-recording-stopped');
        
        // Cleanup
        workletNode.disconnect();
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
        <button 
          className={`nav-tab ${currentTab === 'about' ? 'active' : ''}`}
          onClick={() => setCurrentTab('about')}
        >
          About
        </button>
      </div>

      <div className="content">
        {currentTab === 'controls' && (
          <RecordingControls
            isRecording={isRecording}
            onStartRecording={handleStartRecording}
            onStopRecording={handleStopRecording}
            onToggleRecording={handleToggleRecording}
            hotkey={settings.hotkey}
            assistantHotkey={settings.assistantHotkey}
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
        {currentTab === 'about' && (
          <About />
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