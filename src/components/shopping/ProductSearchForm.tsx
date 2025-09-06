'use client';

import { useState, type FormEvent } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, PlusCircle } from 'lucide-react';

type ProductSearchFormProps = {
  addProduct: (name: string, image?: string) => void;
};

export default function ProductSearchForm({ addProduct }: ProductSearchFormProps) {
  const [itemName, setItemName] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (itemName.trim() && !isAdding) {
      setIsAdding(true);
      await (addProduct as (name: string) => Promise<void>)(itemName.trim());
      setItemName('');
      setIsAdding(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex w-full items-center">
      <Input
        type="text"
        placeholder="e.g., Bananas, Milk, Bread..."
        value={itemName}
        onChange={(e) => setItemName(e.target.value)}
        className="h-12 flex-grow text-lg shadow-inner rounded-r-none"
        aria-label="Product name"
        disabled={isAdding}
      />
      <Button
        type="submit"
        className="h-12 bg-primary hover:bg-primary/90 rounded-l-none p-2"
        disabled={!itemName.trim() || isAdding}
        aria-label="Add product"
      >
        {isAdding ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <PlusCircle className="h-5 w-5" />
        )}
      </Button>
    </form>
  );
}
