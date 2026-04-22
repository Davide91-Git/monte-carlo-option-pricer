/* ============================================================
   context/ThemeContext.tsx
   Manages light / dark theme.

   Usage:
     const { theme, toggleTheme, isDark } = useTheme();
   ============================================================ */

import { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextValue {
  theme:       Theme;
  toggleTheme: () => void;
  isDark:      boolean;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

const STORAGE_KEY = 'mcpricer-theme';

function getInitialTheme(): Theme {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === 'light' || stored === 'dark') return stored;
  if (window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark';
  return 'light';
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  /* Explicit generic so `prev` is typed as Theme, not any */
  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  const toggleTheme = () =>
    setTheme((prev: Theme) => (prev === 'light' ? 'dark' : 'light'));

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, isDark: theme === 'dark' }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used inside <ThemeProvider>');
  return ctx;
}