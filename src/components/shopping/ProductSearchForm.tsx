'use client';

import { useState, type FormEvent } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';

type ProductSearchFormProps = {
  addProduct: (name: string, image?: string) => void;
};

export default function ProductSearchForm({ addProduct }: ProductSearchFormProps) {
  const [itemName, setItemName] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (itemName.trim()) {
      addProduct(itemName.trim());
      setItemName('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex w-full items-center gap-2">
      <Input
        type="text"
        placeholder="e.g., Bananas, Milk, Bread..."
        value={itemName}
        onChange={(e) => setItemName(e.target.value)}
        className="h-12 flex-grow text-lg shadow-inner"
        aria-label="Product name"
      />
      <Button
        type="submit"
        size="lg"
        className="h-12 bg-accent hover:bg-accent/90 text-accent-foreground"
        disabled={!itemName.trim()}
      >
        <PlusCircle className="mr-2 h-5 w-5" />
        <span className="font-bold">Add</span>
      </Button>
    </form>
  );
}
