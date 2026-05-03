/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import { AppSettings, Language } from '../types';

interface AppContextType {
  settings: AppSettings;
  updateSettings: (newSettings: Partial<AppSettings>) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const defaultSettings: AppSettings = {
  language: 'ar',
  theme: 'light',
  hijriOffset: 0,
  country: 'Iraq',
  city: 'Najaf',
  autoLocation: true,
  adhanEnabled: {
    fajr: true,
    dhuhr: true,
    asr: true,
    maghrib: true,
    isha: true,
  },
  backgroundImage: undefined,
  selectedAdhanUrl: 'https://mp4.shabakngy.com/m/m/2-XRbcLQ6b8.mp3',
  tasbihSoundEnabled: true,
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem('nahj_al_nur_settings');
    return saved ? JSON.parse(saved) : defaultSettings;
  });
  const [activeTab, setActiveTab] = useState('home');

  useEffect(() => {
    localStorage.setItem('nahj_al_nur_settings', JSON.stringify(settings));
    document.documentElement.dir = settings.language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = settings.language;
    
    if (settings.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings]);

  const updateSettings = (newSettings: Partial<AppSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  return (
    <AppContext.Provider value={{ settings, updateSettings, activeTab, setActiveTab }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
