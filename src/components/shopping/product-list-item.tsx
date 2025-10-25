'use client';

import type { Product } from '@/types';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { Button } from '../ui/button';
import { Star, Trash2 } from 'lucide-react';

type ProductCardProps = {
  product: Product;
  onToggleBought: (id: string) => void;
  onDelete: (id: string) => void;
  onToggleFavorite: (product: Product) => void;
  isFavorite: boolean;
  viewMode?: 'list' | 'grid';
};

export default function ProductCard({ product, onToggleBought, onDelete, onToggleFavorite, isFavorite, viewMode = 'list' }: ProductCardProps) {
  const uniqueId = `item-${product.id}`;
  return (
    <div className={cn(
      "bg-card rounded-2xl shadow-sm relative group overflow-hidden",
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
            unoptimized
          />
        </div>
        <div className={cn( "flex-grow", viewMode === 'grid' ? 'text-center' : '')}>
          <p className="font-semibold text-foreground">{product.name}</p>
        </div>
      </label>
       <div className={cn("absolute flex", viewMode === 'grid' ? 'top-2 right-2' : 'inset-y-0 right-0')}>
          <Button
            size={viewMode === 'list' ? 'default' : 'icon'}
            variant="ghost"
            className={cn(
              'rounded-full transition-none',
              viewMode === 'list' 
                ? 'h-full w-14 rounded-none text-yellow-500 hover:text-yellow-600'
                : 'h-8 w-8 text-yellow-500'
            )}
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(product);
            }}
            aria-label={`Marcar ${product.name} como favorito`}
          >
            <Star className={cn('h-5 w-5', isFavorite && 'fill-current')} />
          </Button>
          <Button
            size={viewMode === 'list' ? 'default' : 'icon'}
            variant="destructive"
            className={cn(
              'rounded-full transition-none',
              viewMode === 'list' 
                ? 'h-full w-14 rounded-l-none rounded-r-xl'
                : 'h-8 w-8'
            )}
            onClick={(e) => {
              e.stopPropagation();
              onDelete(product.id);
            }}
            aria-label={`Eliminar ${product.name}`}
          >
            <Trash2 className="h-5 w-5" />
          </Button>
        </div>
    </div>
  );
}
