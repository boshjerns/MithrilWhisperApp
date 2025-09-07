import React from 'react';
import { HistoryIcon, InfoIcon } from './Icons';

export default function UsageHistory() {
  return (
    <div className="usage-history">
      <div className="section-header" style={{ marginBottom: '24px' }}>
        <h2>
          <HistoryIcon size={24} />
          Usage History
        </h2>
      </div>

      <div className="glass-card" style={{ padding: 24 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
          <InfoIcon size={24} />
          <div>
            <h3 style={{ margin: '0 0 12px 0', color: '#0078D4' }}>Local Mode - Privacy First</h3>
            <div className="terminal-text" style={{ lineHeight: 1.5 }}>
              <p style={{ margin: '0 0 12px 0' }}>
                Usage tracking is <strong>disabled</strong> in local mode to protect your privacy.
              </p>
              <p style={{ margin: '0 0 12px 0' }}>
                ✅ <strong>Your voice recordings</strong> are processed locally and deleted immediately<br/>
                ✅ <strong>Your transcriptions</strong> never leave your device<br/>
                ✅ <strong>No usage data</strong> is collected or transmitted<br/>
                ✅ <strong>Complete offline operation</strong> for transcription features
              </p>
              <p style={{ margin: 0 }}>
                This ensures maximum privacy and security for your voice data.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}