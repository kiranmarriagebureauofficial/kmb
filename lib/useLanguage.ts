'use client';

import { useEffect, useState, useCallback } from 'react';
import { store } from './db/store';
import type { Language } from './i18n';

/**
 * Reactive hook for English / Urdu switching across every component and page.
 * Automatically re-renders on store language updates and keeps <html dir & lang> in sync.
 */
export function useLanguage() {
  const [lang, setLang] = useState<Language>('en');

  useEffect(() => {
    const sync = () => {
      const current = store.getLanguage();
      setLang(current);
      if (typeof document !== 'undefined') {
        document.documentElement.setAttribute('dir', current === 'ur' ? 'rtl' : 'ltr');
        document.documentElement.setAttribute('lang', current);
      }
    };

    sync();
    const unsub = store.subscribe(sync);
    return unsub;
  }, []);

  const tr = useCallback(
    (en: string, ur: string): string => {
      return lang === 'ur' ? ur : en;
    },
    [lang]
  );

  return {
    lang,
    isUr: lang === 'ur',
    tr,
    setLanguage: (next: Language) => store.setLanguage(next),
  };
}

