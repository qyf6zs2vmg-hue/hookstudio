import React, { createContext, useContext, useState, useEffect } from 'react';
import { UILanguage, ThemeMode, AppSettings } from '../lib/types';
import { i18n, I18nType } from '../lib/i18n';

interface SettingsContextType {
  settings: AppSettings;
  t: I18nType;
  setLanguage: (lang: UILanguage) => void;
  setTheme: (theme: ThemeMode) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem('hook-studio-settings');
    if (saved) return JSON.parse(saved);
    return {
      language: 'ru',
      theme: 'system'
    };
  });

  useEffect(() => {
    localStorage.setItem('hook-studio-settings', JSON.stringify(settings));
    
    // Theme logic
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');

    if (settings.theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      root.classList.add(systemTheme);
    } else {
      root.classList.add(settings.theme);
    }
  }, [settings]);

  // Listen for system theme changes
  useEffect(() => {
    if (settings.theme !== 'system') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      const root = window.document.documentElement;
      root.classList.remove('light', 'dark');
      root.classList.add(mediaQuery.matches ? 'dark' : 'light');
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [settings.theme]);

  const setLanguage = (language: UILanguage) => setSettings(prev => ({ ...prev, language }));
  const setTheme = (theme: ThemeMode) => setSettings(prev => ({ ...prev, theme }));

  const t = i18n[settings.language];

  return (
    <SettingsContext.Provider value={{ settings, t, setLanguage, setTheme }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
