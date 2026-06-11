import { useState, useEffect } from 'react';
import { STORAGE_KEY, resolveLocale, t, type Locale } from './i18n';

export function useI18n() {
  const [locale, setLocale] = useState<Locale>(() => {
    if (typeof window !== 'undefined') {
      try {
        return resolveLocale(localStorage.getItem(STORAGE_KEY));
      } catch (_) {}
    }
    return 'en';
  });

  useEffect(() => {
    const handleLocale = (e: Event) => {
      const ce = e as CustomEvent<{ locale: Locale }>;
      if (ce.detail?.locale) {
        setLocale(ce.detail.locale);
      }
    };
    document.addEventListener('at75:locale-changed', handleLocale);
    return () => document.removeEventListener('at75:locale-changed', handleLocale);
  }, []);

  return {
    locale,
    t: (key: string) => t(locale, key),
    dir: (['ar'] as readonly string[]).includes(locale) ? ('rtl' as const) : ('ltr' as const),
  };
}
