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
  viewMode?: 'list' | 'grid';
};

export default function ProductCard({ product, onToggleBought, onDelete, viewMode = 'list' }: ProductCardProps) {
  const uniqueId = `item-${product.id}`;
  return (
    <div className={cn(
      "bg-card rounded-2xl shadow-sm transition-all duration-300 relative group",
      viewMode === 'list' ? 'flex items-center gap-4 p-3' : 'flex flex-col p-4 gap-2'
    )}>
       <input 
        id={uniqueId}
        type="checkbox" 
        className={cn("item-checkbox shrink-0 appearance-none rounded-lg border-2 border-input bg-transparent focus:ring-0 focus:ring-offset-0 cursor-pointer",
          viewMode === 'list' ? 'size-6' : 'absolute top-3 left-3 size-6 z-10'
        )}
        checked={product.bought}
        onChange={() => onToggleBought(product.id)}
      />
      <label htmlFor={uniqueId} className={cn("item-content w-full cursor-pointer", viewMode === 'list' ? 'flex items-center gap-4' : 'flex flex-col gap-3')}>
        <div className={cn("relative aspect-square bg-cover rounded-xl shrink-0", viewMode === 'list' ? 'size-16' : 'w-full')}>
          <Image
            src={product.image}
            alt={product.name}
            data-ai-hint={product.name}
            fill
            sizes="(max-width: 768px) 50vw, 33vw"
            className="object-cover rounded-xl"
          />
        </div>
        <div className={cn( "flex-grow", viewMode === 'grid' ? 'text-center' : '')}>
          <p className="font-semibold text-foreground">{product.name}</p>
          {viewMode === 'list' && <p className="text-sm text-muted-foreground">Frutas y verduras</p>}
        </div>
      </label>
       <div className={cn("absolute opacity-0 group-hover:opacity-100 transition-opacity", viewMode === 'list' ? 'top-1 right-1' : 'top-2 right-2')}>
          <Button
            size="icon"
            variant="destructive"
            className="h-8 w-8 rounded-full"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(product.id);
            }}
            aria-label={`Eliminar ${product.name}`}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
    </div>
  );
}
