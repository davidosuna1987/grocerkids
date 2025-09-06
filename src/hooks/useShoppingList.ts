'use client';

import type { Product } from '@/types';
import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'grocerkids-list';

export function useShoppingList() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load from localStorage on initial client-side render
  useEffect(() => {
    try {
      const storedProducts = window.localStorage.getItem(STORAGE_KEY);
      if (storedProducts) {
        setProducts(JSON.parse(storedProducts));
      }
    } catch (error) {
      console.error('Failed to load products from localStorage', error);
    }
    // Artificial delay to show loading state
    setTimeout(() => setIsLoading(false), 500); 
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

  const addProduct = useCallback((name: string, image?: string) => {
    if (!name.trim()) return;

    const newProduct: Product = {
      id: crypto.randomUUID(),
      name: name.trim(),
      image: image || `https://picsum.photos/400/400?random=${crypto.randomUUID()}`,
      bought: false,
    };
    setProducts((prev) => [newProduct, ...prev]);
  }, []);

  const addMultipleProducts = useCallback((names: string[]) => {
    const newProducts: Product[] = names
      .filter(name => name && name.trim())
      .map(name => ({
        id: crypto.randomUUID(),
        name: name.trim(),
        image: `https://picsum.photos/400/400?random=${crypto.randomUUID()}`,
        bought: false,
      }));
    
    if (newProducts.length > 0) {
      setProducts(prev => [...newProducts, ...prev]);
    }
  }, []);

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
