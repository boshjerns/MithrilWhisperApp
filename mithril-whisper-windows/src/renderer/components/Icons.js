import React from 'react';

// Base Icon component
const Icon = ({ children, size = 20, className = '' }) => (
  <svg 
    className={`icon ${className}`} 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
  >
    {children}
  </svg>
);

// Microphone Icon
export const MicrophoneIcon = ({ size, className }) => (
  <Icon size={size} className={className}>
    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M19 10v2a7 7 0 0 1-14 0v-2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <line x1="12" y1="19" x2="12" y2="23" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <line x1="8" y1="23" x2="16" y2="23" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </Icon>
);

// Settings Icon
export const SettingsIcon = ({ size, className }) => (
  <Icon size={size} className={className}>
    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12 1v6m0 6v6m4.22-10.22l1.42-1.42m-1.42 8.49l1.42 1.42M23 12h-6m-6 0H1m16.24 4.22l-1.42-1.42m-8.49 1.42l-1.42 1.42" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </Icon>
);

// History Icon
export const HistoryIcon = ({ size, className }) => (
  <Icon size={size} className={className}>
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <polyline points="12 6 12 12 16 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </Icon>
);

// Terminal Icon
export const TerminalIcon = ({ size, className }) => (
  <Icon size={size} className={className}>
    <polyline points="4 17 10 11 4 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <line x1="12" y1="19" x2="20" y2="19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </Icon>
);

// Brain/AI Icon
export const BrainIcon = ({ size, className }) => (
  <Icon size={size} className={className}>
    <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </Icon>
);

// Key Icon
export const KeyIcon = ({ size, className }) => (
  <Icon size={size} className={className}>
    <path d="m21 2-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0 3 3L22 7l-3-3m-3.5 3.5L19 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </Icon>
);

// Shield Icon for Security
export const ShieldIcon = ({ size, className }) => (
  <Icon size={size} className={className}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </Icon>
);

// Sound Wave Icon
export const SoundWaveIcon = ({ size, className }) => (
  <Icon size={size} className={className}>
    <path d="M12 2v20M8 6v12M4 10v4M16 6v12M20 10v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </Icon>
);

// Check Icon
export const CheckIcon = ({ size, className }) => (
  <Icon size={size} className={className}>
    <polyline points="20 6 9 17 4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </Icon>
);

// Copy Icon
export const CopyIcon = ({ size, className }) => (
  <Icon size={size} className={className}>
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </Icon>
);

// Paste Icon
export const PasteIcon = ({ size, className }) => (
  <Icon size={size} className={className}>
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <rect x="8" y="2" width="8" height="4" rx="1" ry="1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </Icon>
);

// Power Icon
export const PowerIcon = ({ size, className }) => (
  <Icon size={size} className={className}>
    <path d="M18.36 6.64a9 9 0 1 1-12.73 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <line x1="12" y1="2" x2="12" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </Icon>
);

// Info Icon
export const InfoIcon = ({ size, className }) => (
  <Icon size={size} className={className}>
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <line x1="12" y1="16" x2="12" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <line x1="12" y1="8" x2="12.01" y2="8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </Icon>
);

// Export all icons
export default {
  MicrophoneIcon,
  SettingsIcon,
  HistoryIcon,
  TerminalIcon,
  BrainIcon,
  KeyIcon,
  ShieldIcon,
  SoundWaveIcon,
  CheckIcon,
  CopyIcon,
  PasteIcon,
  PowerIcon,
  InfoIcon
}; 