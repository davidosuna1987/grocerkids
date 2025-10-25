'use client';

import type { Product } from '@/types';
import { useState, useEffect, useCallback, useRef } from 'react';
import { useFoodImage } from './use-food-image';
import { useSettings } from '@/contexts/settings-context';
import { useFirestore } from '@/firebase';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { useToast } from './use-toast';

const STORAGE_KEY = 'grocerkids-list';

export function useShoppingList(favorites: Product[]) {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { getProductImage } = useFoodImage();
  const { familyId } = useSettings();
  const firestore = useFirestore();
  const unsubscribeRef = useRef<() => void | undefined>();
  const { toast } = useToast();

  // Helper to update state and localStorage
  const updateLocalProducts = (newProducts: Product[]) => {
    const sorted = newProducts.sort((a, b) => (a.bought === b.bought ? 0 : a.bought ? 1 : -1));
    setProducts(sorted);
    if (!familyId) {
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(sorted));
      } catch (error) {
        console.error('Failed to save products to localStorage', error);
      }
    }
  };
  
  // Load from localStorage on initial client-side render, ONLY if not in a family
  useEffect(() => {
    if (!familyId) {
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
    }
  }, [familyId]);


  // Effect to sync with Firestore
  useEffect(() => {
    if (familyId && firestore) {
      setIsLoading(true);
      const familyRef = doc(firestore, 'families', familyId);

      unsubscribeRef.current = onSnapshot(familyRef, (docSnap) => {
        if (docSnap.exists()) {
          const firestoreProducts = docSnap.data().shoppingList as Product[];
          setProducts(firestoreProducts || []);
        } else {
           setDoc(familyRef, { id: familyId, shoppingList: products, members: 1, name: "Mi Lista", favorites: [] }, { merge: true });
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
      setIsLoading(false);
    }
  }, [familyId, firestore]);
  
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
    const sorted = newProducts.sort((a, b) => (a.bought === b.bought ? 0 : a.bought ? 1 : -1));
    setProducts(sorted);
    if (familyId) {
      debouncedUpdateFirestore(sorted, familyId);
    } else {
      updateLocalProducts(sorted);
    }
  };

  const addProduct = useCallback(
    async (name: string, image?: string) => {
      if (!name.trim()) return;

      const trimmedName = name.trim();
      const productExists = products.some(p => p.name.toLowerCase() === trimmedName.toLowerCase());

      if (productExists) {
        toast({
          title: 'Producto duplicado',
          description: `"${trimmedName}" ya está en tu lista de la compra.`,
        });
        return;
      }

      const existingFavorite = favorites.find(fav => fav.name.toLowerCase() === trimmedName.toLowerCase());

      const imageUrl = image || existingFavorite?.image || (await getProductImage(trimmedName));

      const newProduct: Product = {
        id: existingFavorite?.id || crypto.randomUUID(),
        name: trimmedName,
        image: imageUrl,
        bought: false,
      };
      updateProducts([newProduct, ...products]);
    },
    [products, getProductImage, updateProducts, favorites, toast]
  );

  const addMultipleProducts = useCallback(
    async (names: string[]) => {
      const validNames = names.filter(name => name && name.trim());
      if (validNames.length === 0) return;

      setIsLoading(true);
      
      const newProductsToAdd: Product[] = [];
      const namesToAdd = new Set<string>();

      for (const name of validNames) {
        const trimmedName = name.trim();
        const isDuplicateInList = products.some(p => p.name.toLowerCase() === trimmedName.toLowerCase());
        const isDuplicateInBatch = Array.from(namesToAdd).some(n => n.toLowerCase() === trimmedName.toLowerCase());
        
        if (!isDuplicateInList && !isDuplicateInBatch) {
          namesToAdd.add(trimmedName);
        }
      }

      const productsFromNames = await Promise.all(
        Array.from(namesToAdd).map(async name => {
          const existingFavorite = favorites.find(fav => fav.name.toLowerCase() === name.toLowerCase());
          const imageUrl = existingFavorite?.image || await getProductImage(name);
          return {
            id: existingFavorite?.id || crypto.randomUUID(),
            name: name,
            image: imageUrl,
            bought: false,
          };
        })
      );
      
      if (productsFromNames.length > 0) {
        updateProducts([...productsFromNames, ...products]);
      }
      setIsLoading(false);
    },
    [products, getProductImage, updateProducts, favorites]
  );

  const toggleProductBought = useCallback((id: string) => {
    const newProducts = products.map(p => (p.id === id ? { ...p, bought: !p.bought } : p));
    updateProducts(newProducts);
  }, [products, updateProducts]);

  const deleteProduct = useCallback((id: string) => {
    const newProducts = products.filter(p => p.id !== id);
    updateProducts(newProducts);
  }, [products, updateProducts]);

  const clearList = useCallback(() => {
    updateProducts([]);
  }, [updateProducts]);

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
