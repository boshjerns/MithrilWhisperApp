import React from 'react';

const LocalLMSuite: React.FC = () => {
  return (
    <div className="w-1/2 flex flex-col items-center justify-between px-4 py-4 hero-right">
      {/* Slim Title Card */}
      <div className="ascii-title-card mb-4">
        <pre className="mithril-compact-ascii">{`███╗   ███╗██╗████████╗██╗  ██╗██████╗ ██╗██╗     
████╗ ████║██║╚══██╔══╝██║  ██║██╔══██╗██║██║     
██╔████╔██║██║   ██║   ███████║██████╔╝██║██║     
██║╚██╔╝██║██║   ██║   ██╔══██║██╔══██╗██║██║     
██║ ╚═╝ ██║██║   ██║   ██║  ██║██║  ██║██║███████╗
╚═╝     ╚═╝╚═╝   ╚═╝   ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝╚══════╝`}</pre>
        <p className="app-subtitle-compact">LOCAL LLM SUITE</p>
      </div>

      {/* Center Third - iPhone */}
      <div className="flex-1 flex flex-col md:flex-row items-center justify-center gap-0 mb-3">
        <picture>
          <source 
            type="image/webp"
            srcSet="/images/frgerfge-450.webp 450w, /images/frgerfge-600.webp 600w, /images/frgerfge-900.webp 900w"
            sizes="(max-width: 640px) 90vw, (min-width: 1280px) 420px, 360px"
          />
          <img 
            src="/frgerfge.png" 
            alt="Mithril Local LLM Suite - Chat View" 
            className="h-[48vh] w-auto iphone-hero" 
            style={{ marginRight: -40, backgroundColor: 'transparent', maxHeight: '480px' }}
            fetchPriority="high"
            decoding="async"
            loading="eager"
          />
        </picture>
        <picture>
          <source 
            type="image/webp"
            srcSet="/images/qwedfe-450.webp 450w, /images/qwedfe-600.webp 600w, /images/qwedfe-900.webp 900w"
            sizes="(max-width: 640px) 90vw, (min-width: 1280px) 420px, 360px"
          />
          <img 
            src="/qwedfe.png" 
            alt="Mithril Local LLM Suite - Model Manager" 
            className="h-[48vh] w-auto iphone-hero" 
            style={{ backgroundColor: 'transparent', maxHeight: '480px' }}
            fetchPriority="low"
            decoding="async"
            loading="lazy"
          />
        </picture>
      </div>

      {/* App Store Download Button */}
      <div className="text-center mb-3">
        <a 
          href="https://apps.apple.com/us/app/local-llm-mithril/id6751945393" 
          target="_blank" 
          rel="noopener noreferrer"
          className="app-store-button inline-flex items-center space-x-3 px-6 py-3 rounded-xl transition-all duration-200 hover:shadow-lg"
        >
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
          </svg>
          <span className="font-semibold">Download for iOS</span>
        </a>
      </div>

      {/* Feature Text */}
      <div className="text-center">
        <p className="simple-feature-text-compact">100% on device • 100% private</p>
      </div>
    </div>
  );
};

export default LocalLMSuite;
