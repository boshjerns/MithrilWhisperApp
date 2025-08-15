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

// Lightning Icon
export const LightningIcon = ({ size, className }) => (
  <Icon size={size} className={className}>
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </Icon>
);

// Question Icon
export const QuestionIcon = ({ size, className }) => (
  <Icon size={size} className={className}>
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <line x1="12" y1="17" x2="12.01" y2="17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </Icon>
);

// GitHub Icon
export const GitHubIcon = ({ size, className }) => (
  <Icon size={size} className={className}>
    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </Icon>
);

// Twitter Icon
export const TwitterIcon = ({ size, className }) => (
  <Icon size={size} className={className}>
    <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </Icon>
);

// LinkedIn Icon
export const LinkedInIcon = ({ size, className }) => (
  <Icon size={size} className={className}>
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <rect x="2" y="9" width="4" height="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="4" cy="4" r="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </Icon>
);

// Mail Icon
export const MailIcon = ({ size, className }) => (
  <Icon size={size} className={className}>
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <polyline points="22 6 12 13 2 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </Icon>
);

// External Link Icon
export const ExternalLinkIcon = ({ size, className }) => (
  <Icon size={size} className={className}>
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <polyline points="15 3 21 3 21 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <line x1="10" y1="14" x2="21" y2="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </Icon>
);

// Lock Icon
export const LockIcon = ({ size, className }) => (
  <Icon size={size} className={className}>
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M7 11V7a5 5 0 0 1 10 0v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </Icon>
);

// File Icon
export const FileIcon = ({ size, className }) => (
  <Icon size={size} className={className}>
    <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <polyline points="13 2 13 9 20 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </Icon>
);

// Database Icon
export const DatabaseIcon = ({ size, className }) => (
  <Icon size={size} className={className}>
    <ellipse cx="12" cy="5" rx="9" ry="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </Icon>
);

// Globe Icon
export const GlobeIcon = ({ size, className }) => (
  <Icon size={size} className={className}>
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <line x1="2" y1="12" x2="22" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </Icon>
);

// Target Icon
export const TargetIcon = ({ size, className }) => (
  <Icon size={size} className={className}>
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="12" cy="12" r="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="12" cy="12" r="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </Icon>
);

// Bug Icon
export const BugIcon = ({ size, className }) => (
  <Icon size={size} className={className}>
    <rect x="8" y="6" width="8" height="14" rx="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M19 7s-1-2-3-2-3 2-3 2 1-2 3-2 3 2 3 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M5 7s1-2 3-2 3 2 3 2-1-2-3-2-3 2-3 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M8 2v4M16 2v4M8 18v4M16 18v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </Icon>
);

// Chat Icon
export const ChatIcon = ({ size, className }) => (
  <Icon size={size} className={className}>
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </Icon>
);

// Rocket Icon
export const RocketIcon = ({ size, className }) => (
  <Icon size={size} className={className}>
    <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </Icon>
);

// Building Icon
export const BuildingIcon = ({ size, className }) => (
  <Icon size={size} className={className}>
    <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M6 12h4m0 0h4m-4 0v6m-4-3h.01M18 9h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </Icon>
);

// Chevron Left Icon
export const ChevronLeftIcon = ({ size, className }) => (
  <Icon size={size} className={className}>
    <polyline points="15 18 9 12 15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </Icon>
);

// Chevron Right Icon
export const ChevronRightIcon = ({ size, className }) => (
  <Icon size={size} className={className}>
    <polyline points="9 18 15 12 9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </Icon>
);

// More Horizontal Icon
export const MoreHorizontalIcon = ({ size, className }) => (
  <Icon size={size} className={className}>
    <circle cx="12" cy="12" r="1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="19" cy="12" r="1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="5" cy="12" r="1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
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
  InfoIcon,
  LightningIcon,
  QuestionIcon,
  GitHubIcon,
  TwitterIcon,
  LinkedInIcon,
  MailIcon,
  ExternalLinkIcon,
  LockIcon,
  FileIcon,
  DatabaseIcon,
  GlobeIcon,
  TargetIcon,
  BugIcon,
  ChatIcon,
  RocketIcon,
  BuildingIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  MoreHorizontalIcon
}; 