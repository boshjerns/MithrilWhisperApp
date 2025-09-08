import React, { useState, useEffect } from 'react';

const Navigation: React.FC = () => {
  const [isLightMode, setIsLightMode] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    setIsLightMode(savedTheme === 'light');
    if (savedTheme === 'light') {
      document.body.classList.add('light-mode');
    }
  }, []);

  const toggleTheme = () => {
    const body = document.body;
    const newTheme = !isLightMode;
    
    setIsLightMode(newTheme);
    
    if (newTheme) {
      body.classList.add('light-mode');
      localStorage.setItem('theme', 'light');
    } else {
      body.classList.remove('light-mode');
      localStorage.setItem('theme', 'dark');
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 p-4 border-b nav-border" 
         style={{ 
           background: 'var(--nav-bg)', 
           backdropFilter: 'blur(10px)', 
           borderColor: 'var(--border-color)' 
         }}>
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between flex-nowrap">
          <div className="flex items-center">
            <div className="ascii-nav-card">
              <pre className="nav-ascii-art">{`█▄█ █ ▀█▀ █▄█ █▀▄ █ █
█ █ █  █  █▀█ █▀▄ █ █
█ █ █  █  █ █ █▀▄ █ █▄`}</pre>
              <div className="nav-solutions-text">SOLUTIONS</div>
            </div>
          </div>
          <div className="flex items-center space-x-1 sm:space-x-2 md:space-x-3 flex-nowrap">
            <div className="nav-attribution text-gray-300 hover:text-white transition-colors text-xs flex items-center flex-nowrap">
              <span className="mr-1 sm:mr-2">by</span>
              <a href="https://deployforward.com/mithril" target="_blank" className="hover:text-white">
                <span className="text-white">deploy</span> <span className="text-green-400">forward</span>
              </a>
              <a href="https://x.com/deployforward" target="_blank" 
                 className="ml-1 p-3 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors inline-flex"
                 aria-label="Deploy Forward on X">
                <svg className="w-3 h-3" fill="url(#gradient-x-deploy)" viewBox="0 0 24 24">
                  <defs>
                    <linearGradient id="gradient-x-deploy" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" style={{stopColor: '#10b981', stopOpacity: 1}} />
                      <stop offset="100%" style={{stopColor: '#ffffff', stopOpacity: 1}} />
                    </linearGradient>
                  </defs>
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
              <span className="mx-1 sm:mx-2">|</span>
              <span className="text-white">Josh Berns</span>
            </div>
            <div className="flex items-center space-x-1 sm:space-x-2">
              <button 
                className="p-3 theme-toggle-nav group" 
                onClick={toggleTheme} 
                aria-label="Toggle theme">
                <svg 
                  className="w-3 h-3 text-gray-300 group-hover:text-white sun-icon" 
                  style={{ display: isLightMode ? 'block' : 'none' }} 
                  viewBox="0 0 24 24" 
                  fill="currentColor">
                  <path d="M12 17.5C9.5 17.5 7.5 15.5 7.5 13S9.5 8.5 12 8.5 16.5 10.5 16.5 13 14.5 17.5 12 17.5M12 7C8.7 7 6 9.7 6 13S8.7 19 12 19 18 16.3 18 13 15.3 7 12 7M12 2L14.4 6.4L19 5.7L16.2 9.8L18.6 14L14 12.7L10 15.5L10.2 10.8L6 8.3L10.5 6.7L12 2Z"/>
                </svg>
                <svg 
                  className="w-3 h-3 text-gray-300 group-hover:text-white moon-icon" 
                  style={{ display: isLightMode ? 'none' : 'block' }} 
                  viewBox="0 0 24 24" 
                  fill="currentColor">
                  <path d="M17.75,4.09L15.22,6.03L16.13,9.09L13.5,7.28L10.87,9.09L11.78,6.03L9.25,4.09L12.44,4L13.5,1L14.56,4L17.75,4.09M21.25,11L19.61,12.25L20.2,14.23L18.5,13.06L16.8,14.23L17.39,12.25L15.75,11L17.81,10.95L18.5,9L19.19,10.95L21.25,11M18.97,15.95C19.8,15.87 20.69,17.05 20.16,17.8C19.84,18.25 19.5,18.67 19.08,19.07C15.17,23 8.84,23 4.94,19.07C1.03,15.17 1.03,8.83 4.94,4.93C5.34,4.53 5.76,4.17 6.21,3.85C6.96,3.32 8.14,4.21 8.06,5.04C7.79,7.9 8.75,10.87 10.95,13.06C13.14,15.26 16.1,16.22 18.97,15.95M17.33,17.97C14.5,17.81 11.7,16.64 9.53,14.5C7.36,12.31 6.2,9.5 6.04,6.68C3.23,9.82 3.34,14.64 6.35,17.66C9.37,20.67 14.19,20.78 17.33,17.97Z"/>
                </svg>
              </button>
              <a 
                href="https://github.com/boshjerns" 
                target="_blank" 
                className="p-3 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors group"
                aria-label="Josh Berns on GitHub">
                <svg 
                  className="w-3 h-3 text-gray-300 group-hover:text-white" 
                  fill="currentColor" 
                  viewBox="0 0 24 24">
                  <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
                </svg>
              </a>
              <a 
                href="https://twitter.com/boshjerns" 
                target="_blank" 
                className="p-3 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors group"
                aria-label="Josh Berns on Twitter">
                <svg 
                  className="w-3 h-3 text-gray-300 group-hover:text-white" 
                  fill="currentColor" 
                  viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;