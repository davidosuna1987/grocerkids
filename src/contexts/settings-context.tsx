'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { AppSettings, ImageProvider, IMAGE_PROVIDERS_MAP, ViewType, VIEW_TYPES_MAP, THEMES_MAP, Theme, IMAGE_PROVIDERS, VIEW_TYPES, THEMES } from '@/types';
import { useTheme } from 'next-themes';
import { doc, setDoc, getDoc, onSnapshot, runTransaction, increment } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { useToast } from '@/hooks/use-toast';

const SETTINGS_KEY = 'grocerkids-settings';
const DEFAULT_SETTINGS: AppSettings = {
  provider: IMAGE_PROVIDERS_MAP.google,
  viewType: VIEW_TYPES_MAP.list,
  theme: THEMES_MAP.system,
  familyId: null,
};

export interface JoinFamilyLink {
  title: string;
  text: string;
  url: string;
}

interface SettingsContextType {
  provider: ImageProvider;
  viewType: ViewType;
  theme: Theme;
  familyId: string | null | undefined;
  familyName: string | null;
  membersCount: number;
  setProvider: (provider: ImageProvider) => void;
  setViewType: (viewType: ViewType) => void;
  setTheme: (theme: Theme) => void;
  createNewFamily: (currentProducts: any[], familyName: string) => Promise<string | null>;
  joinFamily: (familyId: string) => Promise<boolean>;
  leaveFamily: () => Promise<{ success: boolean; wasLastMember: boolean }>;
  generateJoinFamilyLink: (familyId: string | null | undefined) => JoinFamilyLink | null;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

interface SettingsProviderProps {
  children: ReactNode;
}

export function SettingsProvider({ children }: SettingsProviderProps) {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [membersCount, setMembersCount] = useState<number>(0);
  const [familyName, setFamilyName] = useState<string | null>(null);
  const { setTheme: setNextTheme } = useTheme();
  const firestore = useFirestore();
  const { toast } = useToast();

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
  
  const setFamilyId = useCallback((familyId: string | null) => {
    setSettings(prev => ({ ...prev, familyId }));
    if (!familyId) {
      setFamilyName(null);
      setMembersCount(0);
    }
  }, []);

  useEffect(() => {
    if (settings.familyId && firestore) {
      const familyRef = doc(firestore, 'families', settings.familyId);
      const unsubscribe = onSnapshot(familyRef, (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          setMembersCount(data.members || 0);
          setFamilyName(data.name || null);
        } else {
          // If doc is deleted from another client, reset local state
          setFamilyId(null);
        }
      }, (error) => {
        console.error("Error with family snapshot:", error);
        setFamilyId(null);
      });
      return () => unsubscribe();
    } else {
        setFamilyId(null);
    }
  }, [settings.familyId, firestore, setFamilyId]);

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

  const generateJoinFamilyLink = useCallback((familyId: string | null | undefined): JoinFamilyLink | null => {
    return familyId ? { 
      title: 'Grocer Kids: Lista de la compra compartida',
      text: familyId ? `¡Únete a mi lista de la compra en Grocer Kids! Usa este código: ${familyId}` : '',
      url: familyId ? `${window.location.origin}/join-family/${familyId}` : ''
    } : null;
  }, []);

  const leaveFamily = useCallback(async (): Promise<{ success: boolean; wasLastMember: boolean }> => {
    if (!settings.familyId || !firestore) return { success: false, wasLastMember: false };
    
    const familyRef = doc(firestore, 'families', settings.familyId);
    let wasLastMember = false;

    try {
        await runTransaction(firestore, async (transaction) => {
            const familyDoc = await transaction.get(familyRef);
            if (!familyDoc.exists()) {
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

        toast({
          title: wasLastMember ? 'Lista familiar eliminada' : 'Has abandonado la lista',
          description: wasLastMember ? 'La lista ha sido eliminada permanentemente.' : 'Tu lista ahora es local.'
        });

        setFamilyId(null);
        return { success: true, wasLastMember };
    } catch (error) {
        console.error("Error leaving/deleting family:", error);
        toast({ variant: 'destructive', title: 'Error', description: 'No se pudo abandonar la lista.' });
        return { success: false, wasLastMember: false };
    }
  }, [settings.familyId, firestore, setFamilyId, toast]);

  const joinFamily = useCallback(async (familyIdToJoin: string) => {
    if (!firestore) return false;
    if (settings.familyId === familyIdToJoin) {
      toast({ title: 'Ya estás en esta lista', description: 'No es necesario que te unas de nuevo.' });
      return true;
    }

    const familyRef = doc(firestore, 'families', familyIdToJoin);
    try {
      const familyDoc = await getDoc(familyRef);
      if (familyDoc.exists()) {
        if(settings.familyId) {
          await leaveFamily();
        }
        await setDoc(familyRef, { members: increment(1) }, { merge: true });
        setFamilyId(familyIdToJoin);
        toast({ title: '¡Te has unido a la lista!', description: `Ahora estás en la lista "${familyDoc.data().name}".` });
        return true;
      } else {
        toast({ variant: 'destructive', title: 'Error', description: 'El código de la lista no es válido o no existe.' });
        return false;
      }
    } catch (error) {
      console.error("Error joining family:", error);
      toast({ variant: 'destructive', title: 'Error', description: 'No se pudo unirse a la lista.' });
      return false;
    }
  }, [firestore, settings.familyId, setFamilyId, toast, leaveFamily]);

  const createNewFamily = useCallback(async (currentProducts: any[], familyName: string) => {
    if (!firestore || !familyName.trim()) return null;
    const newFamilyId = crypto.randomUUID().split('-')[0];
    const familyRef = doc(firestore, 'families', newFamilyId);
    try {
      if(settings.familyId) {
        await leaveFamily();
      }
      await setDoc(familyRef, { id: newFamilyId, name: familyName.trim(), shoppingList: currentProducts, members: 1 });
      setFamilyId(newFamilyId);
      return newFamilyId;
    } catch (error) {
      console.error("Error creating new family:", error);
      return null;
    }
  }, [firestore, setFamilyId, settings.familyId, leaveFamily]);

  return (
    <SettingsContext.Provider value={{
      provider: settings.provider,
      viewType: settings.viewType,
      theme: settings.theme,
      familyId: settings.familyId,
      familyName,
      membersCount,
      setProvider,
      setViewType,
      setTheme,
      createNewFamily,
      joinFamily,
      leaveFamily,
      generateJoinFamilyLink,
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
