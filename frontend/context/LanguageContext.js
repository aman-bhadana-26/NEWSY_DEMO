import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  DEFAULT_LANGUAGE,
  SUPPORTED_LANGUAGES,
  translate,
} from '../utils/translations';

const STORAGE_KEY = 'newsytech.language';

const LanguageContext = createContext(null);

export const useLanguage = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return ctx;
};

const isSupported = (code) =>
  SUPPORTED_LANGUAGES.some((l) => l.code === code);

export const LanguageProvider = ({ children }) => {
  const [language, setLanguageState] = useState(DEFAULT_LANGUAGE);
  const [hydrated, setHydrated] = useState(false);

  // Hydrate from localStorage once on mount.
  useEffect(() => {
    try {
      const stored = typeof window !== 'undefined'
        ? window.localStorage.getItem(STORAGE_KEY)
        : null;
      if (stored && isSupported(stored)) {
        setLanguageState(stored);
      }
    } catch (e) {
      // localStorage may be unavailable (private mode, SSR). Safe to ignore.
    } finally {
      setHydrated(true);
    }
  }, []);

  // Keep <html lang="..."> in sync for accessibility / SEO.
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = language;
    }
  }, [language]);

  const setLanguage = useCallback((code) => {
    if (!isSupported(code)) return;
    setLanguageState(code);
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(STORAGE_KEY, code);
      }
    } catch (e) {
      // Ignore storage errors.
    }
  }, []);

  const t = useCallback((key) => translate(language, key), [language]);

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      languages: SUPPORTED_LANGUAGES,
      t,
      hydrated,
    }),
    [language, setLanguage, t, hydrated]
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export default LanguageContext;
