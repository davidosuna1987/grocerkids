'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { IMAGE_PROVIDERS, AppSettings, ImageProvider, IMAGE_PROVIDERS_MAP, ViewType, VIEW_TYPES_MAP, VIEW_TYPES } from '@/types';

const SETTINGS_KEY = 'grocerkids-settings';
const DEFAULT_SETTINGS: AppSettings = {
  provider: IMAGE_PROVIDERS_MAP.pexels,
  viewType: VIEW_TYPES_MAP.list,
};

interface SettingsContextType {
  provider: ImageProvider;
  viewType: ViewType;
  setProvider: (provider: ImageProvider) => void;
  setViewType: (viewType: ViewType) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

interface SettingsProviderProps {
  children: ReactNode;
}

export function SettingsProvider({ children }: SettingsProviderProps) {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);

  useEffect(() => {
    try {
      const storedSettings = window.localStorage.getItem(SETTINGS_KEY);
      if (storedSettings) {
        const parsedSettings = JSON.parse(storedSettings);
        // Basic validation to ensure provider and viewType are valid values
        if (IMAGE_PROVIDERS.includes(parsedSettings.provider) && 
            VIEW_TYPES.includes(parsedSettings.viewType)) {
            setSettings(parsedSettings);
        } else {
          // If validation fails, merge with defaults to ensure all required properties exist
          setSettings({
            ...DEFAULT_SETTINGS,
            ...parsedSettings,
            provider: IMAGE_PROVIDERS.includes(parsedSettings.provider) ? parsedSettings.provider : DEFAULT_SETTINGS.provider,
            viewType: VIEW_TYPES.includes(parsedSettings.viewType) ? parsedSettings.viewType : DEFAULT_SETTINGS.viewType,
          });
        }
      }
    } catch (error) {
      console.error('Failed to load settings from localStorage', error);
    }
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch (error) {
      console.error('Failed to save settings to localStorage', error);
    }
  }, [settings]);

  const setProvider = useCallback((provider: ImageProvider) => {
    setSettings((prev) => ({ ...prev, provider }));
  }, []);

  const setViewType = useCallback((viewType: ViewType) => {
    setSettings((prev) => ({ ...prev, viewType }));
  }, []);

  return (
    <SettingsContext.Provider value={{
      provider: settings.provider,
      viewType: settings.viewType,
      setProvider,
      setViewType,
    }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings(): SettingsContextType {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
