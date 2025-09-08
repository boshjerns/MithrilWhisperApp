import React from 'react';

const LocalLMSuite: React.FC = () => {
  return (
    <div className="w-1/2 flex flex-col items-center justify-between px-4 py-4">
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
      <div className="flex-1 flex flex-col md:flex-row items-center justify-center gap-0 mb-4">
        <picture>
          <source 
            type="image/jpeg" 
            srcSet="/images/frgerfge-450.jpg 450w, /images/frgerfge-900.jpg 900w" 
            sizes="(min-width: 1024px) 450px, (max-width: 640px) 90vw, 50vw" 
          />
          <img 
            src="/images/frgerfge-900.jpg" 
            alt="Mithril Local LLM Suite - Chat View" 
            className="h-[55vh] w-auto iphone-hero" 
            style={{ marginRight: 0 }}
            fetchPriority="high"
            decoding="async"
            loading="eager"
          />
        </picture>
        <picture>
          <source 
            type="image/jpeg" 
            srcSet="/images/qwedfe-450.jpg 450w, /images/qwedfe-900.jpg 900w" 
            sizes="(min-width: 1024px) 450px, (max-width: 640px) 90vw, 50vw" 
          />
          <img 
            src="/images/qwedfe-900.jpg" 
            alt="Mithril Local LLM Suite - Model Manager" 
            className="h-[55vh] w-auto iphone-hero" 
            fetchPriority="low"
            decoding="async"
            loading="lazy"
          />
        </picture>
      </div>

      {/* Right Third - Local LM Suite Description */}
      <div className="text-center">
        <p className="simple-feature-text-compact mb-1">100% on device • 100% private</p>
        <p className="coming-soon-compact">Coming Soon</p>
      </div>
    </div>
  );
};

export default LocalLMSuite;
