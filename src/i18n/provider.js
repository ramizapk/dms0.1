'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import ar from './ar.json';
import en from './en.json';

const translations = { ar, en };

const I18nContext = createContext();

export function I18nProvider({ children }) {
  const [locale, setLocaleState] = useState('ar');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const savedLocale = localStorage.getItem('dms-locale') || 'ar';
    setLocaleState(savedLocale);
    document.documentElement.setAttribute('dir', savedLocale === 'ar' ? 'rtl' : 'ltr');
    document.documentElement.setAttribute('lang', savedLocale);
    setMounted(true);
  }, []);

  const setLocale = useCallback((newLocale) => {
    setLocaleState(newLocale);
    localStorage.setItem('dms-locale', newLocale);
    document.documentElement.setAttribute('dir', newLocale === 'ar' ? 'rtl' : 'ltr');
    document.documentElement.setAttribute('lang', newLocale);
  }, []);

  const t = useCallback((key) => {
    const keys = key.split('.');
    let value = translations[locale];
    for (const k of keys) {
      value = value?.[k];
    }
    return value || key;
  }, [locale]);

  const dir = locale === 'ar' ? 'rtl' : 'ltr';
  const isRTL = locale === 'ar';

  const toggleLocale = useCallback(() => {
    setLocale(locale === 'ar' ? 'en' : 'ar');
  }, [locale, setLocale]);

  if (!mounted) {
    return null;
  }

  return (
    <I18nContext.Provider value={{ locale, setLocale, t, dir, isRTL, toggleLocale }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
}
