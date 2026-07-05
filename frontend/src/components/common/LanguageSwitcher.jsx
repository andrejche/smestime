import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const LANGUAGES = [
  { code: 'mk', label: 'МКД', flag: '🇲🇰' },
  // { code: 'en', label: 'ENG', flag: '🇬🇧' },
  // { code: 'sq', label: 'ALB', flag: '🇦🇱' },
];

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const current = LANGUAGES.find((l) => l.code === i18n.language) || LANGUAGES[0];

  const changeLanguage = (code) => {
    i18n.changeLanguage(code);
    localStorage.setItem('smestime-lang', code);
    setOpen(false);
  };

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-3 py-2 rounded-full border border-gray-200 hover:border-gray-400 text-sm font-semibold text-gray-600 transition-colors"
      >
        <span>{current.flag}</span>
        <span>{current.label}</span>
        <svg className={`w-3 h-3 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-36 bg-white rounded-xl shadow-modal border border-gray-100 overflow-hidden z-50">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              onClick={() => changeLanguage(lang.code)}
              className={`flex items-center gap-2.5 w-full px-4 py-2.5 text-sm font-medium transition-colors ${
                lang.code === i18n.language
                  ? 'bg-brand-50 text-brand-600'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <span>{lang.flag}</span>
              <span>{lang.label}</span>
              {lang.code === i18n.language && (
                <svg className="w-3.5 h-3.5 ml-auto text-brand-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
