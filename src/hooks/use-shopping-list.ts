'use client';

import type { Product } from '@/types';
import { useState, useEffect, useCallback, useRef } from 'react';
import { useFoodImage } from './use-food-image';
import { useSettings } from '@/contexts/settings-context';
import { useFirestore } from '@/firebase';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';

const STORAGE_KEY = 'grocerkids-list';

export function useShoppingList() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { getProductImage } = useFoodImage();
  const { familyId } = useSettings();
  const firestore = useFirestore();
  const unsubscribeRef = useRef<() => void | undefined>();

  // Helper to update state and localStorage
  const updateLocalProducts = (newProducts: Product[]) => {
    const sorted = newProducts.sort((a, b) => (a.bought === b.bought ? 0 : a.bought ? 1 : -1));
    setProducts(sorted);
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(sorted));
    } catch (error) {
      console.error('Failed to save products to localStorage', error);
    }
  };
  
  // Load from localStorage on initial client-side render
  useEffect(() => {
    try {
      const storedProducts = window.localStorage.getItem(STORAGE_KEY);
      if (storedProducts) {
        const parsedProducts: Product[] = JSON.parse(storedProducts);
        updateLocalProducts(parsedProducts);
      }
    } catch (error) {
      console.error('Failed to load products from localStorage', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Effect to sync with Firestore
  useEffect(() => {
    if (familyId && firestore) {
      setIsLoading(true);
      const familyRef = doc(firestore, 'families', familyId);

      unsubscribeRef.current = onSnapshot(familyRef, (docSnap) => {
        if (docSnap.exists()) {
          const firestoreProducts = docSnap.data().shoppingList as Product[];
          updateLocalProducts(firestoreProducts);
        } else {
          // Family document doesn't exist, maybe it was just created
          // Write the local list to Firestore
           setDoc(familyRef, { id: familyId, shoppingList: products });
        }
        setIsLoading(false);
      }, (error) => {
        console.error("Error listening to family updates:", error);
        setIsLoading(false);
      });

      return () => {
        if (unsubscribeRef.current) {
          unsubscribeRef.current();
        }
      };
    } else {
      // Not in a family or firestore not ready, stop listening
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = undefined;
      }
    }
  }, [familyId, firestore]);
  
  // Debounced function to update Firestore
  const debouncedUpdateFirestore = useCallback(
    debounce(async (newProducts: Product[], fid: string) => {
      if (!firestore || !fid) return;
      try {
        const familyRef = doc(firestore, 'families', fid);
        await setDoc(familyRef, { id: fid, shoppingList: newProducts }, { merge: true });
      } catch (error) {
        console.error("Error updating Firestore:", error);
      }
    }, 500),
    [firestore]
  );

  const updateProducts = (newProducts: Product[]) => {
    updateLocalProducts(newProducts);
    if (familyId) {
      debouncedUpdateFirestore(newProducts, familyId);
    }
  };

  const addProduct = useCallback(
    async (name: string, image?: string) => {
      if (!name.trim()) return;

      const imageUrl = image || (await getProductImage(name.trim()));

      const newProduct: Product = {
        id: crypto.randomUUID(),
        name: name.trim(),
        image: imageUrl,
        bought: false,
      };
      updateProducts([newProduct, ...products]);
    },
    [products, getProductImage, familyId, updateProducts]
  );

  const addMultipleProducts = useCallback(
    async (names: string[]) => {
      const validNames = names.filter(name => name && name.trim());
      if (validNames.length === 0) return;

      setIsLoading(true);
      const newProducts: Product[] = await Promise.all(
        validNames.map(async name => {
          const imageUrl = await getProductImage(name.trim());
          return {
            id: crypto.randomUUID(),
            name: name.trim(),
            image: imageUrl,
            bought: false,
          };
        })
      );

      if (newProducts.length > 0) {
        updateProducts([...newProducts, ...products]);
      }
      setIsLoading(false);
    },
    [products, getProductImage, familyId, updateProducts]
  );

  const toggleProductBought = useCallback((id: string) => {
    const newProducts = products.map(p => (p.id === id ? { ...p, bought: !p.bought } : p));
    updateProducts(newProducts);
  }, [products, familyId, updateProducts]);

  const deleteProduct = useCallback((id: string) => {
    const newProducts = products.filter(p => p.id !== id);
    updateProducts(newProducts);
  }, [products, familyId, updateProducts]);

  const clearList = useCallback(() => {
    updateProducts([]);
  }, [familyId, updateProducts]);

  return {
    products,
    isLoading,
    addProduct,
    addMultipleProducts,
    toggleProductBought,
    deleteProduct,
    clearList,
  };
}

function debounce<F extends (...args: any[]) => any>(func: F, waitFor: number) {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return (...args: Parameters<F>): void => {
    if (timeout !== null) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(() => func(...args), waitFor);
  };
}
