/* ============================================================
   context/LanguageContext.tsx
   Manages UI language (EN / IT / DE).

   Usage:
     const { t, language, setLanguage } = useLanguage();
     <p>{t.config.title}</p>
     <p>{t.progress.running.replace('{n}', '50000')}</p>
   ============================================================ */

import { createContext, useContext, useState } from 'react';
import { en } from '../messages/en';
import { it } from '../messages/it';
import { de } from '../messages/de';
import type { Messages } from '../messages/en';

export type Language = 'en' | 'it' | 'de';

interface LanguageContextValue {
  language:    Language;
  setLanguage: (lang: Language) => void;
  t:           Messages;
}

const dictionaries: Record<Language, Messages> = { en, it, de };

const STORAGE_KEY = 'mcpricer-lang';

const LANGUAGE_META: Record<Language, { label: string; flag: string }> = {
  en: { label: 'English',  flag: '🇬🇧' },
  it: { label: 'Italiano', flag: '🇮🇹' },
  de: { label: 'Deutsch',  flag: '🇩🇪' },
};

export { LANGUAGE_META };

function getInitialLanguage(): Language {
  const stored = localStorage.getItem(STORAGE_KEY) as Language | null;
  if (stored && stored in dictionaries) return stored;

  /* Browser language hint */
  const browser = navigator.language.slice(0, 2).toLowerCase();
  if (browser in dictionaries) return browser as Language;

  return 'en';
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>(getInitialLanguage);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem(STORAGE_KEY, lang);
  };

  return (
    <LanguageContext.Provider
      value={{ language, setLanguage, t: dictionaries[language] }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used inside <LanguageProvider>');
  return ctx;
}