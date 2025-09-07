import React from 'react';
import { MailIcon, FileIcon, ExternalLinkIcon } from './Icons';

function About() {
  return (
    <div className="about-container">
      <div className="about-header">
        <h1>MITHRIL WHISPER</h1>
        <p>Privacy-focused voice transcription for macOS</p>
      </div>

      <div className="about-content">
        <div className="section">
          <h3>What it does</h3>
          <p>Press a hotkey to record your voice. The app transcribes your speech locally and injects the text into whatever application you're using.</p>
        </div>

        <div className="section">
          <h3>How it works</h3>
          <ul>
            <li>All voice processing happens on your device using Whisper.cpp</li>
            <li>Audio files are deleted immediately after transcription</li>
            <li>No internet required for transcription</li>
            <li>Works system-wide with any application</li>
          </ul>
        </div>

        <div className="section">
          <h3>Privacy</h3>
          <p>Your voice never leaves your device. Audio files are processed locally and deleted within seconds. No usage tracking or data collection.</p>
        </div>

        <div className="section">
          <h3>Created by</h3>
          <p>Josh Berns</p>
        </div>
      </div>

      <div className="license-section">
        <h3>License</h3>
        <div className="license-info">
          <div className="license-type">
            <h4>Personal Use: FREE</h4>
            <p>Free to use, modify, and distribute for non-commercial purposes with attribution.</p>
          </div>
          
          <div className="license-type">
            <h4>Commercial Use: LICENSE REQUIRED</h4>
            <p>Commercial use requires a separate commercial license agreement.</p>
          </div>
          
          <div className="license-contact">
            <p>For commercial licensing: 
              <a href="mailto:boshjerns@gmail.com?subject=Commercial License Inquiry - MITHRIL WHISPER">
                boshjerns@gmail.com
              </a>
            </p>
          </div>
          
          <div className="license-links">
            <a href="https://github.com/boshjerns/MithrilWhisperApp/blob/main/LICENSE" target="_blank" rel="noopener noreferrer">
              <FileIcon size={16} /> View Full License
            </a>
            <a href="https://creativecommons.org/licenses/by-nc-sa/4.0/" target="_blank" rel="noopener noreferrer">
              <ExternalLinkIcon size={16} /> About CC BY-NC-SA 4.0
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default About;
