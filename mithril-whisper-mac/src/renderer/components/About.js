import React from 'react';
import { 
  LightningIcon, 
  QuestionIcon, 
  GitHubIcon, 
  TwitterIcon, 
  LinkedInIcon, 
  MailIcon, 
  ExternalLinkIcon,
  LockIcon,
  ShieldIcon,
  FileIcon,
  DatabaseIcon,
  GlobeIcon,
  TargetIcon,
  BugIcon,
  ChatIcon,
  RocketIcon,
  BuildingIcon
} from './Icons';

function About() {
  const faqSections = [
    {
      question: "What is MITHRIL?",
      answer: (
        <div>
          <p><strong>MITHRIL</strong> is my specialized entity focused on delivering <strong>zero-trust LLM solutions</strong> for enterprise and organizational clients.</p>
          <p>We develop proprietary software that leverages cutting-edge AI and large language models while maintaining the highest security standards. This voice assistant application serves as a demonstration of our capabilities in:</p>
          <ul>
            <li><LockIcon size={16} className="inline-icon" /> <strong>Privacy-first AI</strong> - Local processing, zero data persistence</li>
            <li><ShieldIcon size={16} className="inline-icon" /> <strong>Enterprise security</strong> - Sandboxed environments, encrypted communications</li>
            <li><LightningIcon size={16} className="inline-icon" /> <strong>High-performance AI</strong> - Optimized for Apple Silicon and real-time processing</li>
            <li><TargetIcon size={16} className="inline-icon" /> <strong>Custom integrations</strong> - Tailored solutions for specific organizational needs</li>
          </ul>
          <p>If your organization is interested in proprietary AI solutions, custom LLM integrations, or secure voice/text processing systems, let's start a conversation.</p>
        </div>
      )
    },
    {
      question: "Who created this application?",
      answer: (
        <div>
          <p>This application was created by <strong>Josh Berns</strong> (boshjerns), a software engineer specializing in AI, security, and enterprise solutions.</p>
          <div className="creator-links">
            <h4>Connect with me:</h4>
            <div className="social-links">
              <a href="https://github.com/boshjerns" target="_blank" rel="noopener noreferrer" className="social-link github">
                <GitHubIcon size={20} className="social-icon" />
                <span>GitHub: @boshjerns</span>
              </a>
              <a href="https://twitter.com/boshjerns" target="_blank" rel="noopener noreferrer" className="social-link twitter">
                <TwitterIcon size={20} className="social-icon" />
                <span>Twitter: @boshjerns</span>
              </a>
              <a href="https://linkedin.com/in/joshberns" target="_blank" rel="noopener noreferrer" className="social-link linkedin">
                <LinkedInIcon size={20} className="social-icon" />
                <span>LinkedIn: Josh Berns</span>
              </a>
              <a href="mailto:josh@mithril.dev" className="social-link email">
                <MailIcon size={20} className="social-icon" />
                <span>josh@mithril.dev</span>
              </a>
            </div>
          </div>
        </div>
      )
    },
    {
      question: "Why was this application created?",
      answer: (
        <div>
          <p>This voice assistant was developed to address critical gaps in the current AI landscape:</p>
          <div className="why-reasons">
            <div className="reason">
              <h5><LockIcon size={18} className="reason-icon" /> Privacy Concerns</h5>
              <p>Most voice assistants send your audio to cloud servers. This app processes everything locally on your device.</p>
            </div>
            <div className="reason">
              <h5><TargetIcon size={18} className="reason-icon" /> Professional Productivity</h5>
              <p>Designed for knowledge workers who need fast, accurate transcription with AI assistance without compromising security.</p>
            </div>
            <div className="reason">
              <h5><ShieldIcon size={18} className="reason-icon" /> Enterprise Readiness</h5>
              <p>Demonstrates enterprise-grade security practices and serves as a foundation for custom organizational solutions.</p>
            </div>
            <div className="reason">
              <h5><LightningIcon size={18} className="reason-icon" /> Innovation Showcase</h5>
              <p>Showcases MITHRIL's capabilities in developing secure, high-performance AI applications for potential clients.</p>
            </div>
          </div>
        </div>
      )
    },
    {
      question: "How does this app manage security?",
      answer: (
        <div>
          <p>Security is built into every layer of this application:</p>
          <div className="security-features">
            <div className="security-item">
              <h5><LockIcon size={18} className="security-icon" /> Local Processing</h5>
              <p>All voice recognition happens on your device using Whisper.cpp - no audio ever leaves your machine.</p>
            </div>
            <div className="security-item">
              <h5><DatabaseIcon size={18} className="security-icon" /> Zero Persistence</h5>
              <p>Audio files are immediately deleted (within 2-5 seconds) after transcription with multi-layer cleanup.</p>
            </div>
            <div className="security-item">
              <h5><ShieldIcon size={18} className="security-icon" /> Sandboxed Environment</h5>
              <p>App runs in an isolated container - cannot access your Documents, Desktop, or other applications' data.</p>
            </div>
            <div className="security-item">
              <h5><GlobeIcon size={18} className="security-icon" /> Network Restrictions</h5>
              <p>When using AI features, only transcribed text (never audio) is sent to declared, secure endpoints.</p>
            </div>
            <div className="security-item">
              <h5><TargetIcon size={18} className="security-icon" /> Rate Limiting</h5>
              <p>Built-in protection against abuse with intelligent throttling and usage monitoring.</p>
            </div>
            <div className="security-item">
              <h5><LockIcon size={18} className="security-icon" /> Code Signed & Notarized</h5>
              <p>Fully signed and notarized by Apple, ensuring no malicious modifications.</p>
            </div>
          </div>
        </div>
      )
    },
    {
      question: "Are my files and conversations stored?",
      answer: (
        <div>
          <div className="storage-answer">
            <div className="storage-section">
              <h5><FileIcon size={18} className="storage-icon" /> Audio Files: <span className="status-no">NOT STORED</span></h5>
              <p>Voice recordings are immediately deleted after transcription. The app uses temporary directories that are cleaned up within seconds.</p>
            </div>
            <div className="storage-section">
              <h5><ChatIcon size={18} className="storage-icon" /> Transcriptions: <span className="status-local">STORED LOCALLY</span></h5>
              <p>Text transcriptions are stored locally on your device in the app's sandboxed container. You can view and clear them anytime.</p>
            </div>
            <div className="storage-section">
              <h5><RocketIcon size={18} className="storage-icon" /> AI Conversations: <span className="status-optional">OPTIONAL</span></h5>
              <p>When using AI assistant features, only the text (never audio) is sent to secure servers with proper authentication and encryption.</p>
            </div>
            <div className="storage-section">
              <h5><DatabaseIcon size={18} className="storage-icon" /> Settings: <span className="status-local">STORED LOCALLY</span></h5>
              <p>Your preferences and hotkey settings are stored locally in the app's sandboxed container.</p>
            </div>
          </div>
          <div className="data-control">
            <h5><LockIcon size={18} className="control-icon" /> You Control Your Data</h5>
            <p>All local data can be cleared from the app settings. No hidden files, no external storage, complete transparency.</p>
          </div>
        </div>
      )
    },
    {
      question: "How can I contribute or get support?",
      answer: (
        <div>
          <div className="contribute-section">
            <h5><GitHubIcon size={18} className="section-icon" /> Open Source Project</h5>
            <p>This application is open source and available on GitHub:</p>
            <a href="https://github.com/boshjerns/MITHRILWHISPER" target="_blank" rel="noopener noreferrer" className="repo-link">
              <GitHubIcon size={20} className="repo-icon" />
              <span>GitHub Repository: MITHRILWHISPER</span>
            </a>
          </div>
          
          <div className="support-options">
            <h5><ChatIcon size={18} className="section-icon" /> Get Support</h5>
            <div className="support-links">
              <a href="https://github.com/boshjerns/MITHRILWHISPER/issues" target="_blank" rel="noopener noreferrer" className="support-link">
                <BugIcon size={16} /> Report Issues
              </a>
              <a href="https://github.com/boshjerns/MITHRILWHISPER/discussions" target="_blank" rel="noopener noreferrer" className="support-link">
                <ChatIcon size={16} /> Join Discussions
              </a>
              <a href="mailto:josh@mithril.dev" className="support-link">
                <MailIcon size={16} /> Email Support
              </a>
            </div>
          </div>

          <div className="enterprise-section">
            <h5><BuildingIcon size={18} className="section-icon" /> Enterprise Solutions</h5>
            <p>Interested in custom AI solutions for your organization? Let's discuss how MITHRIL can help with proprietary LLM integrations, secure voice processing, or custom AI applications.</p>
            <a href="mailto:josh@mithril.dev?subject=Enterprise AI Solutions Inquiry" className="enterprise-contact">
              <RocketIcon size={20} className="contact-icon" /> Contact for Enterprise Solutions
            </a>
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="about-container">
      <div className="about-header">
        <div className="about-title-section">
          <h1 className="about-title">
            <LightningIcon size={40} className="mithril-logo" />
            About MITHRIL WHISPER
          </h1>
          <p className="about-subtitle">
            Privacy-first voice assistant powered by zero-trust AI solutions
          </p>
        </div>
        
        <div className="about-hero">
          <div className="hero-stats">
            <div className="stat">
              <span className="stat-value">100%</span>
              <span className="stat-label">Local Processing</span>
            </div>
            <div className="stat">
              <span className="stat-value">0s</span>
              <span className="stat-label">Audio Persistence</span>
            </div>
            <div className="stat">
              <span className="stat-value">∞</span>
              <span className="stat-label">Privacy Protection</span>
            </div>
          </div>
        </div>
      </div>

      <div className="faq-sections">
        {faqSections.map((section, index) => (
          <div key={index} className="faq-item">
            <h3 className="faq-question">
              <QuestionIcon size={24} className="question-icon" />
              {section.question}
            </h3>
            <div className="faq-answer">
              {section.answer}
            </div>
          </div>
        ))}
      </div>

      <div className="about-footer">
        <div className="footer-brand">
          <div className="brand-text">
            <span className="mithril-text">MITHRIL</span>
            <span className="brand-tagline">Zero-Trust AI Solutions</span>
          </div>
        </div>
        <div className="footer-version">
          <span>Version 1.0.0</span>
          <span>•</span>
          <span>Built with ⚡ by Josh Berns</span>
        </div>
      </div>
    </div>
  );
}

export default About;
