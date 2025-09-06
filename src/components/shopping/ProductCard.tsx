'use client';

import type { Product } from '@/types';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, Trash2 } from 'lucide-react';
import Image from 'next/image';

type ProductCardProps = {
  product: Product;
  onToggleBought: (id: string) => void;
  onDelete: (id: string) => void;
};

export default function ProductCard({ product, onToggleBought, onDelete }: ProductCardProps) {
  return (
    <Card
      className={cn(
        'group relative overflow-hidden rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl',
        product.bought && 'shadow-sm hover:shadow-md'
      )}
    >
      <CardContent className="p-0">
        <div
          className={cn(
            'relative aspect-square w-full transition-opacity duration-500',
            product.bought && 'opacity-40 grayscale'
          )}
        >
          <Image
            src={product.image}
            alt={product.name}
            data-ai-hint={product.name}
            fill
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
            className="object-cover"
          />
        </div>

        <div
          className={cn(
            'absolute inset-0 flex items-center justify-center bg-primary/70 checked',
            !product.bought && 'hidden'
          )}
        >
          <Check className="h-16 w-16 text-primary-foreground check-icon" />
        </div>
        
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

        <button
          onClick={() => onToggleBought(product.id)}
          className="absolute inset-0 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-xl"
          aria-label={`Mark ${product.name} as ${product.bought ? 'not bought' : 'bought'}`}
        />
      </CardContent>
      <div
        className={cn(
          'p-3 text-center transition-colors',
          product.bought ? 'bg-muted/80' : 'bg-card'
        )}
      >
        <p
          className={cn(
            'font-headline font-semibold text-foreground truncate',
            product.bought && 'text-muted-foreground line-through'
          )}
        >
          {product.name}
        </p>
      </div>
    </Card>
  );
}
