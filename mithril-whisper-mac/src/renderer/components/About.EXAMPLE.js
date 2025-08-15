import React from 'react';
import { LightningIcon, QuestionIcon, GitHubIcon, TwitterIcon, LinkedInIcon, MailIcon, ExternalLinkIcon, LockIcon, ShieldIcon, FileIcon, DatabaseIcon, GlobeIcon, TargetIcon, BugIcon, ChatIcon, RocketIcon, BuildingIcon } from './Icons';

function About() {
  const faqSections = [
    {
      question: "What is MITHRIL?",
      answer: (
        <div>
          <p className="faq-text">
            <BuildingIcon size={18} className="inline-icon" />
            <strong>MITHRIL</strong> is our enterprise-grade platform delivering zero-trust AI solutions for organizations that prioritize security and privacy.
          </p>
          <p className="faq-text">We specialize in air-gapped, locally-processed AI systems that never compromise your data.</p>
          <ul className="feature-list">
            <li><LightningIcon size={16} className="inline-icon" /> <strong>High-performance AI</strong> - Optimized for Apple Silicon and real-time processing</li>
            <li><LockIcon size={16} className="inline-icon" /> <strong>Zero-trust architecture</strong> - No data ever leaves your control</li>
            <li><TargetIcon size={16} className="inline-icon" /> <strong>Enterprise focus</strong> - Built for government, defense, and regulated industries</li>
          </ul>
        </div>
      )
    },
    {
      question: "Who created this application?",
      answer: (
        <div>
          <p>This application was created by <strong>[YOUR NAME HERE]</strong> ([YOUR USERNAME]), a software engineer specializing in AI, security, and enterprise solutions.</p>
          <div className="social-links-grid">
            <a href="https://github.com/[YOUR_GITHUB_USERNAME]" target="_blank" rel="noopener noreferrer" className="social-link-card github">
              <div className="social-link-content">
                <GitHubIcon size={24} className="social-icon" />
                <div className="social-info">
                  <span className="social-platform">GitHub</span>
                  <span className="social-handle">[YOUR GITHUB USERNAME]</span>
                </div>
              </div>
              <ExternalLinkIcon size={16} className="external-icon" />
            </a>
            
            <a href="https://www.linkedin.com/in/[YOUR_LINKEDIN_PROFILE]/" target="_blank" rel="noopener noreferrer" className="social-link-card linkedin">
              <div className="social-link-content">
                <LinkedInIcon size={24} className="social-icon" />
                <div className="social-info">
                  <span className="social-platform">LinkedIn</span>
                  <span className="social-handle">[YOUR NAME]</span>
                </div>
              </div>
              <ExternalLinkIcon size={16} className="external-icon" />
            </a>
            
            <a href="mailto:[YOUR_EMAIL@DOMAIN.COM]" className="social-link-card email">
              <div className="social-link-content">
                <MailIcon size={24} className="social-icon" />
                <div className="social-info">
                  <span className="social-platform">Email</span>
                  <span className="social-handle">[YOUR_EMAIL@DOMAIN.COM]</span>
                </div>
              </div>
              <ExternalLinkIcon size={16} className="external-icon" />
            </a>
          </div>
        </div>
      )
    },
    {
      question: "Why was this application created?",
      answer: (
        <div>
          <p>Designed for knowledge workers who need fast, accurate transcription with AI assistance without compromising security.</p>
          <div className="use-case-grid">
            <div className="use-case-item">
              <RocketIcon size={20} className="use-case-icon" />
              <div>
                <h5>Performance</h5>
                <p>Real-time transcription with minimal latency</p>
              </div>
            </div>
            <div className="use-case-item">
              <ShieldIcon size={20} className="use-case-icon" />
              <div>
                <h5>Privacy</h5>
                <p>All processing happens locally on your device</p>
              </div>
            </div>
            <div className="use-case-item">
              <TargetIcon size={20} className="use-case-icon" />
              <div>
                <h5>Precision</h5>
                <p>Enterprise-grade accuracy for professional use</p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      question: "How does this app manage security?",
      answer: (
        <div>
          <p>When using AI features, only transcribed text (never audio) is sent to secure endpoints (OpenAI/Supabase).</p>
          <div className="security-features">
            <h5><LockIcon size={18} className="security-icon" /> Code Signed & Notarized</h5>
            <p>Fully signed and notarized by Apple, ensuring authenticity and no malicious modifications.</p>
            
            <h5><ShieldIcon size={18} className="security-icon" /> Hardened Runtime</h5>
            <p>App runs with macOS Hardened Runtime protections against code injection and runtime attacks.</p>
            
            <h5><DatabaseIcon size={18} className="security-icon" /> Row Level Security</h5>
            <p>Built-in server-side protection against abuse with intelligent throttling and usage monitoring.</p>
            
            <div className="security-note">
              <strong>Security Model:</strong> This application uses standard macOS permissions (not sandboxed) to enable text injection functionality. It can access files when needed for app operation, but follows strict privacy practices for audio and user data.
            </div>
          </div>
        </div>
      )
    },
    {
      question: "Are my files and conversations stored?",
      answer: (
        <div>
          <div className="data-handling">
            <h5><FileIcon size={18} className="data-icon" /> Audio Privacy</h5>
            <p>Voice recordings are processed locally and immediately deleted. No audio data is ever stored or transmitted.</p>
            
            <h5><DatabaseIcon size={18} className="data-icon" /> Local Storage</h5>
            <p>Your preferences and hotkey settings are stored locally on your device using standard app storage.</p>
            
            <h5><GlobeIcon size={18} className="data-icon" /> Network Usage</h5>
            <p>Only transcribed text is sent for AI processing when using cloud features. All communications are encrypted and rate-limited.</p>
          </div>
        </div>
      )
    },
    {
      question: "How can I contribute or get support?",
      answer: (
        <div>
          <div className="support-section">
            <div className="support-links">
              <a href="https://github.com/[YOUR_GITHUB_USERNAME]/[YOUR_REPO_NAME]" target="_blank" rel="noopener noreferrer" className="support-link">
                <GitHubIcon size={16} /> View Source Code
              </a>
              <a href="https://github.com/[YOUR_GITHUB_USERNAME]/[YOUR_REPO_NAME]/issues" target="_blank" rel="noopener noreferrer" className="support-link">
                <BugIcon size={16} /> Report Issues
              </a>
              <a href="mailto:[YOUR_EMAIL@DOMAIN.COM]" className="support-link">
                <MailIcon size={16} /> Email Support
              </a>
            </div>
            
            <div className="enterprise-section">
              <h5>Enterprise Solutions</h5>
              <p>For enterprise deployments, custom integrations, or air-gapped solutions:</p>
              <a href="mailto:[YOUR_EMAIL@DOMAIN.COM]?subject=Enterprise AI Solutions Inquiry" className="enterprise-contact">
                <BuildingIcon size={16} /> Contact for Enterprise
              </a>
            </div>
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
        
        <div className="hero-stats">
          <div className="stat-item">
            <RocketIcon size={24} className="stat-icon" />
            <div>
              <span className="stat-number">Real-time</span>
              <span className="stat-label">Processing</span>
            </div>
          </div>
          <div className="stat-item">
            <LockIcon size={24} className="stat-icon" />
            <div>
              <span className="stat-number">100%</span>
              <span className="stat-label">Private</span>
            </div>
          </div>
          <div className="stat-item">
            <TargetIcon size={24} className="stat-icon" />
            <div>
              <span className="stat-number">Enterprise</span>
              <span className="stat-label">Grade</span>
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
        <div className="footer-content">
          <ChatIcon size={20} className="footer-icon" />
          <span>Built with ⚡ by [YOUR NAME HERE]</span>
        </div>
      </div>
    </div>
  );
}

export default About;
