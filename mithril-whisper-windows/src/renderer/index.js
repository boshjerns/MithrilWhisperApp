import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import Overlay from './Overlay';
import DesktopHUD from './components/DesktopHUD';
import AssistantChat from './components/AssistantChat';
import './styles.css';

// Check which component to render based on the URL
const isOverlay = window.location.pathname === '/overlay' || window.location.hash === '#overlay';
const isDesktopHUD = window.location.pathname === '/desktop-hud' || window.location.hash === '#desktop-hud';
const isAssistant = window.location.pathname === '/assistant' || window.location.hash === '#assistant';

let rootElement;
if (isDesktopHUD) {
  rootElement = document.getElementById('hud-root') || document.getElementById('root');
} else {
  rootElement = document.getElementById('root');
}

const root = ReactDOM.createRoot(rootElement);

if (isDesktopHUD) {
  console.log('Rendering Desktop HUD');
  root.render(<DesktopHUD />);
} else if (isOverlay) {
  console.log('Rendering Overlay');
  root.render(<Overlay />);
} else if (isAssistant) {
  console.log('Rendering Assistant Chat');
  root.render(<AssistantChat />);
} else {
  console.log('Rendering Main App');
  root.render(<App />);
} 