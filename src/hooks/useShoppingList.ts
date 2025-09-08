'use client';

import type { Product } from '@/types';
import { useState, useEffect, useCallback } from 'react';
import { useFoodImage } from './useFoodImage';

const STORAGE_KEY = 'grocerkids-list';

export function useShoppingList() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { getProductImage } = useFoodImage();

  // Load from localStorage on initial client-side render
  useEffect(() => {
    try {
      const storedProducts = window.localStorage.getItem(STORAGE_KEY);
      if (storedProducts) {
        setProducts(JSON.parse(storedProducts));
      }
    } catch (error) {
      console.error('Failed to load products from localStorage', error);
    } finally {
      setIsLoading(false)
    }
    // Artificial delay to show loading state
    // setTimeout(() => setIsLoading(false), 500);
  }, []);

  // Save to localStorage whenever products change
  useEffect(() => {
    if (!isLoading) {
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
      } catch (error) {
        console.error('Failed to save products to localStorage', error);
      }
    }
  }, [products, isLoading]);

  const addProduct = useCallback(async (name: string, image?: string) => {
    if (!name.trim()) return;

    const imageUrl = image || await getProductImage(name.trim());

    const newProduct: Product = {
      id: crypto.randomUUID(),
      name: name.trim(),
      image: imageUrl,
      bought: false,
    };
    setProducts((prev) => [newProduct, ...prev]);
  }, [getProductImage]);

  const addMultipleProducts = useCallback(async (names: string[]) => {
    const validNames = names.filter(name => name && name.trim());
    if (validNames.length === 0) return;

    setIsLoading(true);
    const newProducts: Product[] = await Promise.all(
      validNames.map(async (name) => {
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
      setProducts(prev => [...newProducts, ...prev]);
    }
    setIsLoading(false);
  }, [getProductImage]);

  const toggleProductBought = useCallback((id: string) => {
    setProducts((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, bought: !p.bought } : p
      )
    );
  }, []);

  const deleteProduct = useCallback((id:string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const clearList = useCallback(() => {
    setProducts([]);
  }, []);

  return { products, isLoading, addProduct, addMultipleProducts, toggleProductBought, deleteProduct, clearList };
}
