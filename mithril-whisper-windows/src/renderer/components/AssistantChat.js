import React, { useEffect, useRef, useState } from 'react';
const { ipcRenderer } = window.require('electron');

export default function AssistantChat() {
  const [messages, setMessages] = useState([]); // {role: 'ai'|'user', text}
  const [status, setStatus] = useState('idle'); // idle|listening|processing
  const [minimized, setMinimized] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    // Force transparent backgrounds at mount (belt-and-suspenders)
    try {
      document.documentElement.style.background = 'transparent';
      document.documentElement.style.backgroundColor = 'transparent';
      document.body.style.background = 'transparent';
      document.body.style.backgroundColor = 'transparent';
      const root = document.getElementById('root');
      if (root) {
        root.style.background = 'transparent';
        root.style.backgroundColor = 'transparent';
      }
    } catch (_) {}

    const onStart = (_e, payload) => {
      setStatus(payload && payload.status ? payload.status : 'processing');
      setMinimized(false);
      if (payload && payload.userPrompt) {
        setMessages((m) => [...m, { role: 'user', text: payload.userPrompt }]);
      }
    };
    const onToken = (_e, token) => {
      setMinimized(false);
      setMessages((m) => {
        const last = m[m.length - 1];
        if (last && last.role === 'ai') {
          const updated = m.slice(0, -1).concat([{ role: 'ai', text: (last.text || '') + token }]);
          return updated;
        }
        return m.concat([{ role: 'ai', text: token }]);
      });
      setStatus('processing');
    };
    const onEnd = (_e, { action, text }) => {
      setMinimized(false);
      // Ensure the last AI message is the final text
      setMessages((m) => {
        const hasAI = m.some((x) => x.role === 'ai');
        if (!hasAI) return m.concat([{ role: 'ai', text }]);
        const lastIdx = [...m].reverse().findIndex((x) => x.role === 'ai');
        if (lastIdx === -1) return m.concat([{ role: 'ai', text }]);
        const idx = m.length - 1 - lastIdx;
        const clone = m.slice();
        clone[idx] = { role: 'ai', text };
        return clone;
      });
      setStatus('idle');
    };
    const onError = (_e, msg) => {
      setMessages((m) => m.concat([{ role: 'ai', text: `Error: ${msg}` }]));
      setStatus('idle');
    };
    const onShow = () => setMinimized(false);
    const onSetMin = (_e, val) => setMinimized(!!val);

    ipcRenderer.on('assistant:stream-start', onStart);
    ipcRenderer.on('assistant:stream-token', onToken);
    ipcRenderer.on('assistant:stream-end', onEnd);
    ipcRenderer.on('assistant:error', onError);
    ipcRenderer.on('assistant:show', onShow);
    ipcRenderer.on('assistant:set-minimized', onSetMin);

    return () => {
      ipcRenderer.removeListener('assistant:stream-start', onStart);
      ipcRenderer.removeListener('assistant:stream-token', onToken);
      ipcRenderer.removeListener('assistant:stream-end', onEnd);
      ipcRenderer.removeListener('assistant:error', onError);
      ipcRenderer.removeListener('assistant:show', onShow);
      ipcRenderer.removeListener('assistant:set-minimized', onSetMin);
    };
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleMinimize = () => {
    setMinimized(true);
    try { ipcRenderer.send('assistant:minimize'); } catch (_) {}
  };

  const containerStyle = {
    position: 'fixed',
    right: '20px',
    bottom: '20px',
    width: '360px',
    height: '240px',
    opacity: minimized ? 0 : 1,
    transform: minimized ? 'translateY(6px) scale(0.98)' : 'none',
    transition: 'opacity 120ms ease, transform 160ms ease',
    pointerEvents: minimized ? 'none' : 'auto',
    zIndex: 10000,
    background: 'transparent',
    // very subtle, radius-matched shadow that follows the card (not OS window)
    filter: minimized ? 'none' : 'drop-shadow(0 8px 12px rgba(0,0,0,0.18))',
  };

  const cardStyle = {
    position: 'relative',
    width: '100%',
    height: '100%',
    borderRadius: '16px',
    backdropFilter: 'blur(14px) saturate(160%)',
    WebkitBackdropFilter: 'blur(14px) saturate(160%)',
    // slightly stronger frost for readability
    background: 'rgba(13,17,23,0.42)',
    border: '1px solid rgba(255,255,255,0.14)',
    // inner + subtle outer; clipPath keeps corners rounded
    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.12), inset 0 -10px 28px rgba(0,0,0,0.28), 0 4px 10px rgba(0,0,0,0.18)',
    clipPath: 'inset(0 round 16px)',
    color: '#ffffff',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
  };

  const headerStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '8px 10px',
    fontSize: '12px',
    letterSpacing: '0.3px',
    color: '#ffffff',
  };

  const streamStyle = {
    flex: 1,
    overflowY: 'auto',
    padding: '8px 12px',
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
    fontSize: '12px',
    lineHeight: 1.4,
    whiteSpace: 'pre-wrap',
  };

  const footerStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '6px 10px',
    borderTop: '1px solid rgba(255,255,255,0.06)',
    color: '#ffffff',
    fontSize: '11px',
  };

  return (
    <div className="assistant-chat-container" style={containerStyle}>
      {/* Local CSS for translucent scrollbar and scoping */}
      <style>{`
        .assistant-chat-container, .assistant-chat-container * {
          background: transparent !important;
          background-color: transparent !important;
        }
        .assistant-chat-stream::-webkit-scrollbar { width: 8px; height: 8px; }
        .assistant-chat-stream::-webkit-scrollbar-track { background: rgba(13,17,23,0.12); border-radius: 8px; }
        .assistant-chat-stream::-webkit-scrollbar-thumb { background: rgba(139,92,246,0.35); border-radius: 8px; }
        .assistant-chat-stream { scrollbar-width: thin; scrollbar-color: rgba(139,92,246,0.35) rgba(13,17,23,0.12); }
      `}</style>
      <div className="assistant-chat-card" style={cardStyle}>
        {/* subtle inner gradient highlight */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(120% 70% at 100% 0%, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 35%, rgba(255,255,255,0) 60%)',
          borderRadius: '16px',
          pointerEvents: 'none'
        }} />
        {/* subtle frost layer */}
        <div style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '16px',
          background: 'linear-gradient(180deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.00) 60%)',
          mixBlendMode: 'overlay',
          pointerEvents: 'none'
        }} />
        {/* micro texture for a frosted feeling */}
        <div style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '16px',
          backgroundImage: 'repeating-linear-gradient(45deg, rgba(255,255,255,0.028) 0 2px, rgba(255,255,255,0) 2px 5px)',
          opacity: 0.5,
          pointerEvents: 'none'
        }} />

        <div style={headerStyle}>
        <span>Assistant</span>
        <div style={{ display: 'flex', gap: 8 }}>
          <span style={{ color: '#ffffff' }}>
            {status.toUpperCase()}
          </span>
          <button onClick={handleMinimize} style={{
            background: 'transparent', color: '#ffffff', border: 'none', cursor: 'pointer'
          }}>—</button>
        </div>
      </div>
      <div ref={scrollRef} style={streamStyle} className="assistant-chat-stream">
        {messages.map((m, i) => (
          <div key={i} style={{ margin: '4px 0' }}>
            <span style={{ color: '#ffffff' }}>
              {m.role === 'user' ? 'You: ' : ''}
            </span>
            <span>{m.text}</span>
          </div>
        ))}
      </div>
      <div style={footerStyle}>
        <span>F2 to start/stop. Says “whisper …” to engage tasks.</span>
        <span style={{ opacity: 0.7 }}>model: o4-mini</span>
      </div>
      </div>
    </div>
  );
}


