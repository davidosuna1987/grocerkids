
'use client';

import type { Product, FamilyData } from '@/types';
import { useState, useEffect, useCallback, useRef } from 'react';
import { useSettings } from '@/contexts/settings-context';
import { useFirestore } from '@/firebase';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';

const FAVORITES_STORAGE_KEY = 'grocerkids-favorites';

export function useFavorites() {
  const [favorites, setFavorites] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { familyId } = useSettings();
  const firestore = useFirestore();
  const unsubscribeRef = useRef<() => void | undefined>();

  const updateLocalFavorites = (newFavorites: Product[]) => {
    setFavorites(newFavorites);
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(newFavorites));
      }
    } catch (error) {
      console.error('Failed to save favorites to localStorage', error);
    }
  };

  useEffect(() => {
    if (familyId && firestore) {
      // Firestore logic
      setIsLoading(true);
      const familyRef = doc(firestore, 'families', familyId);
      
      unsubscribeRef.current = onSnapshot(familyRef, (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data() as FamilyData;
          const firestoreFavorites = data.favorites || [];
          setFavorites(firestoreFavorites);
          // Sync local storage as well for seamless offline/online transition
          updateLocalFavorites(firestoreFavorites);
        }
        setIsLoading(false);
      });
      
      return () => {
        if (unsubscribeRef.current) {
          unsubscribeRef.current();
        }
      };
    } else {
      // LocalStorage logic
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = undefined;
      }
      try {
        const storedFavorites = window.localStorage.getItem(FAVORITES_STORAGE_KEY);
        if (storedFavorites) {
          setFavorites(JSON.parse(storedFavorites));
        }
      } catch (error) {
        console.error('Failed to load favorites from localStorage', error);
      } finally {
        setIsLoading(false);
      }
    }
  }, [familyId, firestore]);

  const updateFirestoreFavorites = useCallback(
    async (newFavorites: Product[]) => {
      if (!firestore || !familyId) return;
      try {
        const familyRef = doc(firestore, 'families', familyId);
        await updateDoc(familyRef, { favorites: newFavorites });
      } catch (error) {
        console.error("Error updating Firestore favorites:", error);
      }
    },
    [firestore, familyId]
  );
  
  const toggleFavorite = useCallback((product: Product) => {
    const productWithId = { ...product, id: product.id || crypto.randomUUID() };
    const isCurrentlyFavorite = favorites.some(fav => fav.id === productWithId.id);
    let newFavorites;

    if (isCurrentlyFavorite) {
      newFavorites = favorites.filter(fav => fav.id !== productWithId.id);
    } else {
      const favoriteProduct = { ...productWithId, bought: false }; // Favorites are never "bought"
      newFavorites = [...favorites, favoriteProduct];
    }
    
    setFavorites(newFavorites); // Optimistic update for UI

    if (familyId) {
      updateFirestoreFavorites(newFavorites);
    } else {
      updateLocalFavorites(newFavorites);
    }
  }, [favorites, familyId, updateFirestoreFavorites]);

  const isFavorite = useCallback((productId: string) => {
    return favorites.some(fav => fav.id === productId);
  }, [favorites]);

  return { favorites, isLoading, toggleFavorite, isFavorite };
}
