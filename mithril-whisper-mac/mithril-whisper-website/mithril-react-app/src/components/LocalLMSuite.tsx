import React from 'react';

const LocalLMSuite: React.FC = () => {
  return (
    <div className="w-1/2 flex flex-col items-center justify-between px-4 py-4 hero-right">
      {/* Slim Title Card */}
      <div className="ascii-title-card mb-2">
        <pre className="mithril-compact-ascii">{`███╗   ███╗██╗████████╗██╗  ██╗██████╗ ██╗██╗     
████╗ ████║██║╚══██╔══╝██║  ██║██╔══██╗██║██║     
██╔████╔██║██║   ██║   ███████║██████╔╝██║██║     
██║╚██╔╝██║██║   ██║   ██╔══██║██╔══██╗██║██║     
██║ ╚═╝ ██║██║   ██║   ██║  ██║██║  ██║██║███████╗
╚═╝     ╚═╝╚═╝   ╚═╝   ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝╚══════╝`}</pre>
        <p className="app-subtitle-compact">LOCAL LLM SUITE</p>
        {/* Official App Store badge directly under title */}
        <div className="text-center mt-2">
          <a
            href="https://apps.apple.com/us/app/local-llm-mithril/id6751945393"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Download on the App Store"
            className="inline-block"
          >
            <img
              className="app-store-badge"
              src="https://tools.applemediaservices.com/api/badges/download-on-the-app-store/black/en-us?size=250x83&releaseDate=1725494400"
              alt="Download on the App Store"
              loading="eager"
              decoding="async"
            />
          </a>
        </div>
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

      {/* Feature Text */}
      <div className="text-center">
        <p className="simple-feature-text-compact">100% on device • 100% private</p>
      </div>
    </div>
  );
};

export default LocalLMSuite;
