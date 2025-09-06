'use client';

import type { Product } from '@/types';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { Button } from '../ui/button';
import { Trash2 } from 'lucide-react';

type ProductCardProps = {
  product: Product;
  onToggleBought: (id: string) => void;
  onDelete: (id: string) => void;
};

export default function ProductCard({ product, onToggleBought, onDelete }: ProductCardProps) {
  const uniqueId = `item-${product.id}`;
  return (
    <div className="flex items-center gap-4 bg-card p-3 rounded-2xl shadow-sm transition-all duration-300 relative group">
       <input 
        id={uniqueId}
        type="checkbox" 
        className="item-checkbox size-6 shrink-0 appearance-none rounded-lg border-2 border-input bg-transparent focus:ring-0 focus:ring-offset-0 cursor-pointer"
        checked={product.bought}
        onChange={() => onToggleBought(product.id)}
      />
      <label htmlFor={uniqueId} className="item-content flex items-center gap-4 w-full cursor-pointer">
        <div className="relative aspect-square bg-cover rounded-xl size-16 shrink-0">
          <Image
            src={product.image}
            alt={product.name}
            data-ai-hint={product.name}
            fill
            sizes="64px"
            className="object-cover rounded-xl"
          />
        </div>
        <div className="flex-grow">
          <p className="text-lg font-semibold text-foreground">{product.name}</p>
          <p className="text-sm text-muted-foreground">Produce</p>
        </div>
      </label>
       <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            size="icon"
            variant="destructive"
            className="h-8 w-8 rounded-full"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(product.id);
            }}
            aria-label={`Delete ${product.name}`}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
    </div>
  );
}
