'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { AppSettings, ImageProvider, IMAGE_PROVIDERS_MAP, ViewType, VIEW_TYPES_MAP, THEMES_MAP, Theme, IMAGE_PROVIDERS, VIEW_TYPES, THEMES } from '@/types';
import { useTheme } from 'next-themes';
import { doc, setDoc, getDoc, deleteDoc } from 'firebase/firestore';
import { useFirestore } from '@/firebase';

const SETTINGS_KEY = 'grocerkids-settings';
const DEFAULT_SETTINGS: AppSettings = {
  provider: IMAGE_PROVIDERS_MAP.google,
  viewType: VIEW_TYPES_MAP.list,
  theme: THEMES_MAP.system,
  familyId: null,
};

interface SettingsContextType {
  provider: ImageProvider;
  viewType: ViewType;
  theme: Theme;
  familyId: string | null | undefined;
  setProvider: (provider: ImageProvider) => void;
  setViewType: (viewType: ViewType) => void;
  setTheme: (theme: Theme) => void;
  createNewFamily: (currentProducts: any[]) => Promise<string | null>;
  joinFamily: (familyId: string) => Promise<boolean>;
  leaveFamily: () => Promise<boolean>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

interface SettingsProviderProps {
  children: ReactNode;
}

export function SettingsProvider({ children }: SettingsProviderProps) {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const { setTheme: setNextTheme } = useTheme();
  const firestore = useFirestore();

  useEffect(() => {
    try {
      const storedSettings = window.localStorage.getItem(SETTINGS_KEY);
      if (storedSettings) {
        const parsedSettings = JSON.parse(storedSettings);
        const validSettings: AppSettings = {
          provider: IMAGE_PROVIDERS.includes(parsedSettings.provider) ? parsedSettings.provider : DEFAULT_SETTINGS.provider,
          viewType: VIEW_TYPES.includes(parsedSettings.viewType) ? parsedSettings.viewType : DEFAULT_SETTINGS.viewType,
          theme: THEMES.includes(parsedSettings.theme) ? parsedSettings.theme : DEFAULT_SETTINGS.theme,
          familyId: parsedSettings.familyId || null,
        };
        setSettings(validSettings);
        setNextTheme(validSettings.theme);
      }
    } catch (error) {
      console.error('Failed to load settings from localStorage', error);
    }
  }, [setNextTheme]);

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

  const setTheme = useCallback((theme: Theme) => {
    setSettings((prev) => ({ ...prev, theme }));
    setNextTheme(theme);
  }, [setNextTheme]);

  const setFamilyId = useCallback((familyId: string | null) => {
    setSettings(prev => ({ ...prev, familyId }));
  }, []);

  const createNewFamily = useCallback(async (currentProducts: any[]) => {
    if (!firestore) return null;
    const newFamilyId = crypto.randomUUID().split('-')[0];
    const familyRef = doc(firestore, 'families', newFamilyId);
    try {
      await setDoc(familyRef, { id: newFamilyId, shoppingList: currentProducts });
      setFamilyId(newFamilyId);
      return newFamilyId;
    } catch (error) {
      console.error("Error creating new family:", error);
      return null;
    }
  }, [firestore, setFamilyId]);

  const joinFamily = useCallback(async (familyIdToJoin: string) => {
    if (!firestore) return false;
    const familyRef = doc(firestore, 'families', familyIdToJoin);
    try {
      const docSnap = await getDoc(familyRef);
      if (docSnap.exists()) {
        setFamilyId(familyIdToJoin);
        // The useShoppingList hook will handle syncing the list
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error joining family:", error);
      return false;
    }
  }, [firestore, setFamilyId]);

  const leaveFamily = useCallback(async () => {
    if (!firestore || !settings.familyId) return false;
    const familyRef = doc(firestore, 'families', settings.familyId);
    try {
      // Optional: Delete the family document from Firestore.
      // Be careful: this will delete the list for ALL members.
      // A safer approach might be to just have the user "leave" without deleting the doc.
      // For this implementation, we'll delete it as requested.
      await deleteDoc(familyRef);
      setFamilyId(null);
      return true;
    } catch (error) {
      console.error("Error leaving/deleting family:", error);
      return false;
    }
  }, [firestore, settings.familyId, setFamilyId]);

  return (
    <SettingsContext.Provider value={{
      provider: settings.provider,
      viewType: settings.viewType,
      theme: settings.theme,
      familyId: settings.familyId,
      setProvider,
      setViewType,
      setTheme,
      createNewFamily,
      joinFamily,
      leaveFamily,
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
