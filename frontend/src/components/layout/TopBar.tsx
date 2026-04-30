/* ============================================================
   components/layout/TopBar.tsx
   Fixed top bar
   ============================================================ */

import { useState, useRef, useEffect } from 'react';
import { useTheme }    from '../../context/ThemeContext';
import { useLanguage, LANGUAGE_META } from '../../context/LanguageContext';
import type { Language } from '../../context/LanguageContext';
import styles from './TopBar.module.css';

function Logo() {
  return (
    <div className={styles.logo}>
      <div className={styles.logoIcon}>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path
            d="M2 12 L5 7 L8 9.5 L11 4 L14 6.5"
            stroke="white"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="14" cy="6.5" r="1.8" fill="var(--_white)" />
        </svg>
      </div>
      <span className={styles.logoWordmark}>
        MC<span className={styles.logoAccent}>Pricer</span>
        <span className={styles.logoSubtitle}>Monte Carlo Option Pricing Engine</span>
      </span>
    </div>
  );
}

function ThemeToggle() {
  const { isDark, toggleTheme } = useTheme();
  const { t } = useLanguage();
  return (
    <button
      className={styles.themeToggle}
      onClick={toggleTheme}
      aria-label={t.theme.toggle}
      title={isDark ? t.theme.light : t.theme.dark}
    >
      {isDark ? (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
        </svg>
      ) : (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79z" />
        </svg>
      )}
    </button>
  );
}

function LanguageDropdown() {
  const { language, setLanguage, t } = useLanguage();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const languages = Object.entries(LANGUAGE_META) as [
    Language,
    { label: string; flag: string },
  ][];

  return (
    <div className={styles.langDropdown} ref={ref}>
      <button
        className={styles.langTrigger}
        onClick={() => setOpen(prev => !prev)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={t.language.label}
      >
        <span className={styles.langFlag}>{LANGUAGE_META[language].flag}</span>
        <span className={styles.langCode}>{language.toUpperCase()}</span>
        <svg
          className={`${styles.langChevron} ${open ? styles.langChevronOpen : ''}`}
          width="12" height="12" viewBox="0 0 12 12" fill="none"
          stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"
        >
          <path d="M2 4l4 4 4-4" />
        </svg>
      </button>

      {open && (
        <ul className={styles.langMenu} role="listbox">
          {languages.map(([code, meta]) => (
            <li
              key={code}
              role="option"
              aria-selected={language === code}
              className={`${styles.langOption} ${language === code ? styles.langOptionActive : ''}`}
              onClick={() => { setLanguage(code); setOpen(false); }}
            >
              <span className={styles.langFlag}>{meta.flag}</span>
              <span className={styles.langLabel}>{meta.label}</span>
              {language === code && (
                <svg className={styles.langCheck} width="12" height="12"
                  viewBox="0 0 12 12" fill="none" stroke="currentColor"
                  strokeWidth="2" strokeLinecap="round">
                  <path d="M2 6l3 3 5-5" />
                </svg>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function TopBar() {
  return (
    <header className={styles.topbar} role="banner">
      <Logo />
      <div className={styles.controls}>
        <ThemeToggle />
        <LanguageDropdown />
      </div>
    </header>
  );
}