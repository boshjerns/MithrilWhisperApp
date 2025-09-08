import React, { useState, useEffect } from 'react';

const MithrilWhisper: React.FC = () => {
  const [starCount, setStarCount] = useState<string>('★ GitHub');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [highlightedMacOption, setHighlightedMacOption] = useState<number | null>(null);

  useEffect(() => {
    // Fetch GitHub star count
    const fetchStarCount = async () => {
      try {
        const response = await fetch('https://api.github.com/repos/boshjerns/MithrilWhisperApp');
        const data = await response.json();
        setStarCount(`★ ${data.stargazers_count}`);
      } catch (error) {
        setStarCount('★ GitHub');
      }
    };

    fetchStarCount();

    // Auto-detect Mac architecture
    const detectMacArchitecture = () => {
      const userAgent = navigator.userAgent;
      const isLikelyAppleSilicon = userAgent.includes('Mac') && 
        (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 0) ||
        userAgent.includes('arm64');
      
      if (isLikelyAppleSilicon) {
        setHighlightedMacOption(0);
      } else {
        setHighlightedMacOption(1);
      }
    };

    detectMacArchitecture();

    // Close dropdown when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (!(event.target as Element).closest('.mac-dropdown')) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const toggleMacDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleMacDownload = (version: string) => {
    // Handle download logic here
    console.log(`Downloading ${version}`);
    setIsDropdownOpen(false);
  };

  return (
    <div className="w-1/2 flex items-center justify-center px-4 py-4">
      <div className="max-w-md w-full">
        {/* ASCII Art Logo */}
        <div className="mb-4">
          <pre className="ascii-art text-center text-xs">{`███╗   ███╗██╗████████╗██╗  ██╗██████╗ ██╗██╗     
████╗ ████║██║╚══██╔══╝██║  ██║██╔══██╗██║██║     
██╔████╔██║██║   ██║   ███████║██████╔╝██║██║     
██║╚██╔╝██║██║   ██║   ██╔══██║██╔══██╗██║██║     
██║ ╚═╝ ██║██║   ██║   ██║  ██║██║  ██║██║███████╗
╚═╝     ╚═╝╚═╝   ╚═╝   ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝╚══════╝

██╗    ██╗██╗  ██╗██╗███████╗██████╗ ███████╗██████╗ 
██║    ██║██║  ██║██║██╔════╝██╔══██╗██╔════╝██╔══██╗
██║ █╗ ██║███████║██║███████╗██████╔╝█████╗  ██████╔╝
██║███╗██║██╔══██║██║╚════██║██╔═══╝ ██╔══╝  ██╔══██╗
╚███╔███╔╝██║  ██║██║███████║██║     ███████╗██║  ██║
 ╚══╝╚══╝ ╚═╝  ╚═╝╚═╝╚══════╝╚═╝     ╚══════╝╚═╝  ╚═╝`}</pre>
        </div>
        
        <h2 className="text-sm text-gray-300 mb-4 text-center">Privacy-First AI Voice Dictation</h2>
        
        {/* Clean Download Buttons */}
        <div className="space-y-2 mb-4">
          {/* Mac Download */}
          <div className="mac-dropdown w-full">
            <button 
              onClick={toggleMacDropdown} 
              className="clean-download-mac w-full px-4 py-3 rounded-lg font-medium flex items-center justify-between transition-all duration-200 hover:shadow-lg text-sm">
              <div className="flex items-center space-x-3">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                </svg>
                <span>Download for Mac</span>
              </div>
              <svg 
                className={`w-4 h-4 mac-dropdown-arrow transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <div className={`mac-dropdown-content ${isDropdownOpen ? 'show' : ''}`}>
              <a 
                href="https://github.com/boshjerns/MithrilWhisperApp/releases/download/v1.0.1/MithrilWhisper-1.0.0-arm64.pkg" 
                className={`mac-dropdown-item ${highlightedMacOption === 0 ? 'bg-gradient-to-r from-blue-50 to-cyan-50' : ''}`}
                download="MithrilWhisper-1.0.0-arm64.pkg"
                onClick={() => handleMacDownload('Apple Silicon')}>
                <div className="flex items-center space-x-3">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <div>
                    <div className="font-semibold">
                      {highlightedMacOption === 0 ? '🍎✨ Apple Silicon Macs' : '🍎 Apple Silicon Macs'}
                    </div>
                    <div className="text-sm text-gray-600">M1, M2, M3 chips (2020+) • 196MB</div>
                  </div>
                </div>
              </a>
              <a 
                href="https://github.com/boshjerns/MithrilWhisperApp/releases/download/v1.0.1/MithrilWhisper-1.0.0.pkg" 
                className={`mac-dropdown-item ${highlightedMacOption === 1 ? 'bg-gradient-to-r from-gray-50 to-gray-100' : ''}`}
                download="MithrilWhisper-1.0.0.pkg"
                onClick={() => handleMacDownload('Intel')}>
                <div className="flex items-center space-x-3">
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                  </svg>
                  <div>
                    <div className="font-semibold">
                      {highlightedMacOption === 1 ? '💻✨ Intel Macs' : '💻 Intel Macs'}
                    </div>
                    <div className="text-sm text-gray-600">Intel processors (2019 and earlier) • 208MB</div>
                  </div>
                </div>
              </a>
            </div>
          </div>
          
          {/* Windows Download */}
          <a 
            href="https://github.com/boshjerns/MithrilWhisperApp/archive/refs/tags/v1.0.2-windows.zip" 
            className="clean-download-windows block w-full px-4 py-3 rounded-lg font-medium transition-all duration-200 hover:shadow-lg text-sm touch-48">
            <div className="flex items-center justify-center space-x-3">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3 12V6.75l6-1.32v6.48L3 12M3 17.25l6-1.32v-3.18L3 12v5.25M10.5 6.18l8.5-1.86V12l-8.5-1.86V6.18M10.5 17.82l8.5-1.86v-7.68L10.5 12v5.82Z"/>
              </svg>
              <span>Download for Windows</span>
            </div>
          </a>
        </div>
        
        {/* GitHub Link */}
        <div className="flex justify-center mb-3">
          <a 
            href="https://github.com/boshjerns/MithrilWhisperApp" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-3 text-gray-400 hover:text-white transition-colors text-sm touch-48 px-3 rounded-lg">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
            </svg>
            <span>View on GitHub</span>
            <span className="bg-gray-800 px-2 py-1 rounded text-xs">{starCount}</span>
          </a>
        </div>

        {/* Privacy Link */}
        <div className="flex justify-center">
          <a 
            href="privacy.html" 
            className="text-gray-400 hover:text-white text-xs transition-colors underline">
            Privacy & Terms
          </a>
        </div>
      </div>
    </div>
  );
};

export default MithrilWhisper;
