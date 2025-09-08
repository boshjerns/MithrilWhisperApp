import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="p-6 border-t border-gray-700">
      <div className="max-w-6xl mx-auto text-center text-gray-400 text-sm">
        <div className="flex justify-center items-center space-x-4 mb-3">
          <a 
            href="https://deployforward.com/mithril" 
            target="_blank" 
            className="hover:text-white transition-colors">
            by <span className="text-white">deploy</span> <span className="text-green-400">forward</span> | <span className="text-blue-400">mithril solutions</span> | <span className="text-white">Josh Berns</span>
          </a>
        </div>
        <div className="mb-3 text-xs">
          <span className="text-gray-300" style={{ fontFamily: 'Courier New, monospace' }}>Licensed under </span>
          <a 
            href="https://github.com/boshjerns/MithrilWhisperApp/blob/main/LICENSE" 
            target="_blank" 
            className="text-green-400 hover:text-green-300 transition-colors underline" 
            style={{ fontFamily: 'Courier New, monospace' }}>
            CC BY-NC-SA 4.0
          </a>
          <span className="text-gray-300" style={{ fontFamily: 'Courier New, monospace' }}> • Free for personal use • Commercial licensing available</span>
        </div>
        <p>© 2025 deploy forward LLC</p>
      </div>
    </footer>
  );
};

export default Footer;