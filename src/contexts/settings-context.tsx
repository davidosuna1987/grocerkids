'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { AppSettings, ImageProvider, IMAGE_PROVIDERS_MAP, ViewType, VIEW_TYPES_MAP, THEMES_MAP, Theme, IMAGE_PROVIDERS, VIEW_TYPES, THEMES } from '@/types';
import { useTheme } from 'next-themes';
import { doc, setDoc, getDoc, deleteDoc, onSnapshot, runTransaction, increment } from 'firebase/firestore';
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
  membersCount: number;
  setProvider: (provider: ImageProvider) => void;
  setViewType: (viewType: ViewType) => void;
  setTheme: (theme: Theme) => void;
  createNewFamily: (currentProducts: any[]) => Promise<string | null>;
  joinFamily: (familyId: string) => Promise<boolean>;
  leaveFamily: () => Promise<{ success: boolean; wasLastMember: boolean }>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

interface SettingsProviderProps {
  children: ReactNode;
}

export function SettingsProvider({ children }: SettingsProviderProps) {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [membersCount, setMembersCount] = useState(0);
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
  
  useEffect(() => {
    if (settings.familyId && firestore) {
      const familyRef = doc(firestore, 'families', settings.familyId);
      const unsubscribe = onSnapshot(familyRef, (docSnap) => {
        if (docSnap.exists()) {
          setMembersCount(docSnap.data().members || 0);
        } else {
          setMembersCount(0);
          // If doc is deleted from another client, reset local state
          setFamilyId(null);
        }
      }, (error) => {
        console.error("Error with family snapshot:", error);
        setMembersCount(0);
        setFamilyId(null);
      });
      return () => unsubscribe();
    } else {
        setMembersCount(0);
    }
  }, [settings.familyId, firestore]);

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
      await setDoc(familyRef, { id: newFamilyId, shoppingList: currentProducts, members: 1 });
      setFamilyId(newFamilyId);
      return newFamilyId;
    } catch (error) {
      console.error("Error creating new family:", error);
      return null;
    }
  }, [firestore, setFamilyId]);

  const joinFamily = useCallback(async (familyIdToJoin: string) => {
    if (!firestore || settings.familyId === familyIdToJoin) return false;
    const familyRef = doc(firestore, 'families', familyIdToJoin);
    try {
      await runTransaction(firestore, async (transaction) => {
        const familyDoc = await transaction.get(familyRef);
        if (!familyDoc.exists()) {
            throw new Error("Document does not exist!");
        }
        transaction.update(familyRef, { members: increment(1) });
      });
      if(settings.familyId) {
        await leaveFamily();
      }
      setFamilyId(familyIdToJoin);
      return true;
    } catch (error) {
      console.error("Error joining family:", error);
      return false;
    }
  }, [firestore, setFamilyId, settings.familyId]);

  const leaveFamily = useCallback(async (): Promise<{ success: boolean; wasLastMember: boolean }> => {
    if (!settings.familyId || !firestore) return { success: false, wasLastMember: false };
    
    const familyRef = doc(firestore, 'families', settings.familyId);
    let wasLastMember = false;

    try {
        await runTransaction(firestore, async (transaction) => {
            const familyDoc = await transaction.get(familyRef);
            if (!familyDoc.exists()) {
                // Document already gone, so just clean up locally
                return;
            }
            
            const currentMembers = familyDoc.data().members || 0;
            if (currentMembers <= 1) {
                wasLastMember = true;
                transaction.delete(familyRef);
            } else {
                transaction.update(familyRef, { members: increment(-1) });
            }
        });

        setFamilyId(null);
        return { success: true, wasLastMember };
    } catch (error) {
        console.error("Error leaving/deleting family:", error);
        return { success: false, wasLastMember: false };
    }
}, [settings.familyId, firestore, setFamilyId]);

  return (
    <SettingsContext.Provider value={{
      provider: settings.provider,
      viewType: settings.viewType,
      theme: settings.theme,
      familyId: settings.familyId,
      membersCount,
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
