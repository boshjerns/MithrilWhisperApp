import React, { useState } from 'react';

// Comprehensive list of Whisper-supported languages with their flags
const SUPPORTED_LANGUAGES = [
  { code: 'auto', name: 'Auto-detect', flag: '🌐', description: 'Automatically detect spoken language' },
  { code: 'en', name: 'English', flag: '🇺🇸', description: 'English (US/UK)' },
  { code: 'es', name: 'Spanish', flag: '🇪🇸', description: 'Español' },
  { code: 'fr', name: 'French', flag: '🇫🇷', description: 'Français' },
  { code: 'de', name: 'German', flag: '🇩🇪', description: 'Deutsch' },
  { code: 'it', name: 'Italian', flag: '🇮🇹', description: 'Italiano' },
  { code: 'pt', name: 'Portuguese', flag: '🇵🇹', description: 'Português' },
  { code: 'ru', name: 'Russian', flag: '🇷🇺', description: 'Русский' },
  { code: 'ja', name: 'Japanese', flag: '🇯🇵', description: '日本語' },
  { code: 'zh', name: 'Chinese', flag: '🇨🇳', description: '中文' },
  { code: 'ko', name: 'Korean', flag: '🇰🇷', description: '한국어' },
  { code: 'ar', name: 'Arabic', flag: '🇸🇦', description: 'العربية' },
  { code: 'hi', name: 'Hindi', flag: '🇮🇳', description: 'हिन्दी' },
  { code: 'nl', name: 'Dutch', flag: '🇳🇱', description: 'Nederlands' },
  { code: 'pl', name: 'Polish', flag: '🇵🇱', description: 'Polski' },
  { code: 'sv', name: 'Swedish', flag: '🇸🇪', description: 'Svenska' },
  { code: 'da', name: 'Danish', flag: '🇩🇰', description: 'Dansk' },
  { code: 'no', name: 'Norwegian', flag: '🇳🇴', description: 'Norsk' },
  { code: 'fi', name: 'Finnish', flag: '🇫🇮', description: 'Suomi' },
  { code: 'tr', name: 'Turkish', flag: '🇹🇷', description: 'Türkçe' },
  { code: 'he', name: 'Hebrew', flag: '🇮🇱', description: 'עברית' },
  { code: 'th', name: 'Thai', flag: '🇹🇭', description: 'ไทย' },
  { code: 'vi', name: 'Vietnamese', flag: '🇻🇳', description: 'Tiếng Việt' },
  { code: 'uk', name: 'Ukrainian', flag: '🇺🇦', description: 'Українська' },
  { code: 'cs', name: 'Czech', flag: '🇨🇿', description: 'Čeština' },
  { code: 'hu', name: 'Hungarian', flag: '🇭🇺', description: 'Magyar' },
  { code: 'ro', name: 'Romanian', flag: '🇷🇴', description: 'Română' },
  { code: 'bg', name: 'Bulgarian', flag: '🇧🇬', description: 'Български' },
  { code: 'hr', name: 'Croatian', flag: '🇭🇷', description: 'Hrvatski' },
  { code: 'sk', name: 'Slovak', flag: '🇸🇰', description: 'Slovenčina' },
  { code: 'sl', name: 'Slovenian', flag: '🇸🇮', description: 'Slovenščina' },
  { code: 'et', name: 'Estonian', flag: '🇪🇪', description: 'Eesti' },
  { code: 'lv', name: 'Latvian', flag: '🇱🇻', description: 'Latviešu' },
  { code: 'lt', name: 'Lithuanian', flag: '🇱🇹', description: 'Lietuvių' },
  { code: 'ca', name: 'Catalan', flag: '🏴󠁥󠁳󠁣󠁴󠁿', description: 'Català' },
  { code: 'eu', name: 'Basque', flag: '🏴󠁥󠁳󠁰󠁶󠁿', description: 'Euskera' },
  { code: 'gl', name: 'Galician', flag: '🏴󠁥󠁳󠁧󠁡󠁿', description: 'Galego' },
  { code: 'is', name: 'Icelandic', flag: '🇮🇸', description: 'Íslenska' },
  { code: 'mt', name: 'Maltese', flag: '🇲🇹', description: 'Malti' },
  { code: 'cy', name: 'Welsh', flag: '🏴󠁧󠁢󠁷󠁬󠁳󠁿', description: 'Cymraeg' },
  { code: 'ga', name: 'Irish', flag: '🇮🇪', description: 'Gaeilge' },
  { code: 'fa', name: 'Persian', flag: '🇮🇷', description: 'فارسی' },
  { code: 'ur', name: 'Urdu', flag: '🇵🇰', description: 'اردو' },
  { code: 'bn', name: 'Bengali', flag: '🇧🇩', description: 'বাংলা' },
  { code: 'ta', name: 'Tamil', flag: '🇱🇰', description: 'தமிழ்' },
  { code: 'te', name: 'Telugu', flag: '🇮🇳', description: 'తెలుగు' },
  { code: 'ml', name: 'Malayalam', flag: '🇮🇳', description: 'മലയാളം' },
  { code: 'kn', name: 'Kannada', flag: '🇮🇳', description: 'ಕನ್ನಡ' },
  { code: 'gu', name: 'Gujarati', flag: '🇮🇳', description: 'ગુજરાતી' },
  { code: 'pa', name: 'Punjabi', flag: '🇮🇳', description: 'ਪੰਜਾਬੀ' },
  { code: 'ne', name: 'Nepali', flag: '🇳🇵', description: 'नेपाली' },
  { code: 'si', name: 'Sinhala', flag: '🇱🇰', description: 'සිංහල' },
  { code: 'my', name: 'Myanmar', flag: '🇲🇲', description: 'မြန်မာ' },
  { code: 'km', name: 'Khmer', flag: '🇰🇭', description: 'ខ្មែរ' },
  { code: 'lo', name: 'Lao', flag: '🇱🇦', description: 'ລາວ' },
  { code: 'ka', name: 'Georgian', flag: '🇬🇪', description: 'ქართული' },
  { code: 'am', name: 'Amharic', flag: '🇪🇹', description: 'አማርኛ' },
  { code: 'sw', name: 'Swahili', flag: '🇰🇪', description: 'Kiswahili' },
  { code: 'zu', name: 'Zulu', flag: '🇿🇦', description: 'isiZulu' },
  { code: 'af', name: 'Afrikaans', flag: '🇿🇦', description: 'Afrikaans' },
  { code: 'sq', name: 'Albanian', flag: '🇦🇱', description: 'Shqip' },
  { code: 'az', name: 'Azerbaijani', flag: '🇦🇿', description: 'Azərbaycan' },
  { code: 'be', name: 'Belarusian', flag: '🇧🇾', description: 'Беларуская' },
  { code: 'bs', name: 'Bosnian', flag: '🇧🇦', description: 'Bosanski' },
  { code: 'mk', name: 'Macedonian', flag: '🇲🇰', description: 'Македонски' },
  { code: 'sr', name: 'Serbian', flag: '🇷🇸', description: 'Српски' },
  { code: 'tl', name: 'Filipino', flag: '🇵🇭', description: 'Filipino' },
  { code: 'id', name: 'Indonesian', flag: '🇮🇩', description: 'Bahasa Indonesia' },
  { code: 'ms', name: 'Malay', flag: '🇲🇾', description: 'Bahasa Melayu' },
  { code: 'haw', name: 'Hawaiian', flag: '🏝️', description: 'ʻŌlelo Hawaiʻi' },
  { code: 'mi', name: 'Maori', flag: '🇳🇿', description: 'Te Reo Māori' }
];

const TRANSLATION_MODES = [
  { 
    mode: 'transcribe', 
    name: 'Transcribe Only', 
    icon: '🎙️', 
    description: 'Transcribe in the original language (best accuracy)' 
  },
  { 
    mode: 'translate', 
    name: 'Translate to English', 
    icon: '🔄', 
    description: 'Transcribe and translate to English (requires clear speech)' 
  }
];

export default function LanguageSelector({ 
  selectedLanguage = 'auto', 
  translationMode = 'transcribe',
  onLanguageChange, 
  onTranslationModeChange 
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const selectedLang = SUPPORTED_LANGUAGES.find(lang => lang.code === selectedLanguage) || SUPPORTED_LANGUAGES[0];
  const selectedTransMode = TRANSLATION_MODES.find(mode => mode.mode === translationMode) || TRANSLATION_MODES[0];

  const filteredLanguages = SUPPORTED_LANGUAGES.filter(lang =>
    lang.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lang.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="language-selector">
      <div className="language-setting-group">
        {/* Translation Mode Selector */}
        <div className="setting-item">
          <label className="setting-label">Transcription Mode:</label>
          <div className="translation-mode-buttons">
            {TRANSLATION_MODES.map(mode => (
              <button
                key={mode.mode}
                className={`translation-mode-btn ${translationMode === mode.mode ? 'active' : ''}`}
                onClick={() => onTranslationModeChange(mode.mode)}
                title={mode.description}
              >
                <span className="mode-icon">{mode.icon}</span>
                <span className="mode-name">{mode.name}</span>
              </button>
            ))}
          </div>
          <p className="setting-description">
            {selectedTransMode.description}
          </p>
          {translationMode === 'translate' && (
            <div className="translation-notice">
              <div className="notice-header">📝 Translation Quality Tips:</div>
              <ul className="notice-list">
                <li>• Speak clearly and at a moderate pace</li>
                <li>• Minimize background noise</li>
                <li>• Translation works best with common languages</li>
                <li>• For best results, use "Transcribe Only" then translate text separately</li>
              </ul>
            </div>
          )}
        </div>

        {/* Language Selector */}
        <div className="setting-item">
          <label className="setting-label">
            {translationMode === 'translate' ? 'Source Language:' : 'Transcription Language:'}
          </label>
          
          <div className="language-dropdown">
            <button
              className="language-dropdown-trigger"
              onClick={() => setIsOpen(!isOpen)}
            >
              <span className="selected-language">
                <span className="flag">{selectedLang.flag}</span>
                <span className="language-info">
                  <span className="language-name">{selectedLang.name}</span>
                  <span className="language-description">{selectedLang.description}</span>
                </span>
              </span>
              <span className={`dropdown-arrow ${isOpen ? 'open' : ''}`}>▼</span>
            </button>

            {isOpen && (
              <div className="language-dropdown-menu">
                <div className="language-search">
                  <input
                    type="text"
                    placeholder="Search languages..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="language-search-input"
                  />
                </div>
                
                <div className="language-options">
                  {filteredLanguages.map(lang => (
                    <button
                      key={lang.code}
                      className={`language-option ${selectedLanguage === lang.code ? 'selected' : ''}`}
                      onClick={() => {
                        onLanguageChange(lang.code);
                        setIsOpen(false);
                        setSearchTerm('');
                      }}
                    >
                      <span className="flag">{lang.flag}</span>
                      <span className="language-info">
                        <span className="language-name">{lang.name}</span>
                        <span className="language-description">{lang.description}</span>
                      </span>
                      {selectedLanguage === lang.code && (
                        <span className="selected-indicator">✓</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        .language-selector {
          margin: 16px 0;
        }

        .language-setting-group {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .setting-item {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .setting-label {
          font-size: 14px;
          font-weight: 600;
          color: #e6edf3;
          margin-bottom: 4px;
        }

        .setting-description {
          font-size: 12px;
          color: #8b949e;
          margin: 4px 0 0 0;
          font-style: italic;
        }

        .translation-mode-buttons {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .translation-mode-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 16px;
          background: rgba(88, 166, 255, 0.1);
          border: 1px solid rgba(88, 166, 255, 0.2);
          border-radius: 8px;
          color: #e6edf3;
          font-size: 13px;
          cursor: pointer;
          transition: all 0.2s ease;
          flex: 1;
          min-width: 140px;
        }

        .translation-mode-btn:hover {
          background: rgba(88, 166, 255, 0.15);
          border-color: rgba(88, 166, 255, 0.3);
        }

        .translation-mode-btn.active {
          background: rgba(88, 166, 255, 0.2);
          border-color: rgba(88, 166, 255, 0.4);
          color: #58a6ff;
        }

        .mode-icon {
          font-size: 16px;
        }

        .mode-name {
          font-weight: 500;
        }

        .language-dropdown {
          position: relative;
        }

        .language-dropdown-trigger {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          padding: 12px 16px;
          background: rgba(33, 38, 45, 0.8);
          border: 1px solid rgba(88, 166, 255, 0.2);
          border-radius: 8px;
          color: #e6edf3;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .language-dropdown-trigger:hover {
          border-color: rgba(88, 166, 255, 0.3);
          background: rgba(33, 38, 45, 1);
        }

        .selected-language {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .flag {
          font-size: 20px;
          width: 24px;
          text-align: center;
        }

        .language-info {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 2px;
        }

        .language-name {
          font-size: 14px;
          font-weight: 500;
          color: #e6edf3;
        }

        .language-description {
          font-size: 12px;
          color: #8b949e;
        }

        .dropdown-arrow {
          font-size: 12px;
          color: #8b949e;
          transition: transform 0.2s ease;
        }

        .dropdown-arrow.open {
          transform: rotate(180deg);
        }

        .language-dropdown-menu {
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          background: rgba(22, 27, 34, 0.95);
          border: 1px solid rgba(88, 166, 255, 0.2);
          border-radius: 8px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
          z-index: 1000;
          margin-top: 4px;
          backdrop-filter: blur(8px);
        }

        .language-search {
          padding: 12px;
          border-bottom: 1px solid rgba(88, 166, 255, 0.1);
        }

        .language-search-input {
          width: 100%;
          padding: 8px 12px;
          background: rgba(33, 38, 45, 0.8);
          border: 1px solid rgba(88, 166, 255, 0.2);
          border-radius: 6px;
          color: #e6edf3;
          font-size: 13px;
        }

        .language-search-input:focus {
          outline: none;
          border-color: rgba(88, 166, 255, 0.4);
        }

        .language-search-input::placeholder {
          color: #8b949e;
        }

        .language-options {
          max-height: 300px;
          overflow-y: auto;
          padding: 8px 0;
        }

        .language-option {
          display: flex;
          align-items: center;
          gap: 12px;
          width: 100%;
          padding: 10px 16px;
          background: transparent;
          border: none;
          color: #e6edf3;
          cursor: pointer;
          transition: background-color 0.2s ease;
          text-align: left;
        }

        .language-option:hover {
          background: rgba(88, 166, 255, 0.1);
        }

        .language-option.selected {
          background: rgba(88, 166, 255, 0.15);
          color: #58a6ff;
        }

        .selected-indicator {
          margin-left: auto;
          color: #58a6ff;
          font-weight: bold;
        }

        /* Scrollbar styling */
        .language-options::-webkit-scrollbar {
          width: 6px;
        }

        .language-options::-webkit-scrollbar-track {
          background: rgba(33, 38, 45, 0.5);
        }

        .language-options::-webkit-scrollbar-thumb {
          background: rgba(88, 166, 255, 0.3);
          border-radius: 3px;
        }

        .language-options::-webkit-scrollbar-thumb:hover {
          background: rgba(88, 166, 255, 0.5);
        }

        .translation-notice {
          margin-top: 12px;
          padding: 12px;
          background: rgba(251, 191, 36, 0.1);
          border: 1px solid rgba(251, 191, 36, 0.2);
          border-radius: 8px;
          border-left: 4px solid #f59e0b;
        }

        .notice-header {
          font-size: 13px;
          font-weight: 600;
          color: #fbbf24;
          margin-bottom: 8px;
        }

        .notice-list {
          margin: 0;
          padding: 0;
          list-style: none;
        }

        .notice-list li {
          font-size: 12px;
          color: #e5e7eb;
          margin-bottom: 4px;
          line-height: 1.4;
        }
      `}</style>
    </div>
  );
}
