'use client';

import { useState, useRef, type FormEvent } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, Plus } from 'lucide-react';

type ProductSearchFormProps = {
  addProduct: (name: string, image?: string) => void;
};

export default function ProductSearchForm({ addProduct }: ProductSearchFormProps) {
  const [itemName, setItemName] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (itemName.trim() && !isAdding) {
      setIsAdding(true);
      await (addProduct as (name: string) => Promise<void>)(itemName.trim());
      setItemName('');
      setIsAdding(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex w-full items-center">
      <Input
        ref={inputRef}
        type="text"
        placeholder="Ej: Plátanos, Leche, Pan..."
        value={itemName}
        onChange={(e) => setItemName(e.target.value)}
        className="h-12 flex-grow text-lg shadow-inner rounded-r-none"
        aria-label="Nombre del producto"
        disabled={isAdding}
      />
      <Button
        type="submit"
        className="h-12 bg-primary hover:bg-primary/90 rounded-l-none px-4"
        disabled={!itemName.trim() || isAdding}
        aria-label="Añadir producto"
      >
        {isAdding ? (
          <Loader2 className="!size-6 animate-spin text-primary-foreground" />
        ) : (
          <Plus className="!size-6 text-primary-foreground" />
        )}
      </Button>
    </form>
  );
}
