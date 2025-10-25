'use client';

import { ShoppingCart, Star } from 'lucide-react';
import { Button } from '../ui/button';

type EmptyStateProps = {
  onAddFromFavorites: () => void;
};

export default function EmptyState({ onAddFromFavorites }: EmptyStateProps) {
  return (
    <div className="text-center py-16 px-4">
      <div className="mx-auto flex items-center justify-center size-32 rounded-full bg-primary/20 text-primary">
        <ShoppingCart className="size-16" />
      </div>
      <h2 className="mt-6 text-2xl font-headline font-semibold text-foreground">
        ¡Tu lista está vacía!
      </h2>
      <p className="mt-2 text-muted-foreground">
        Añade productos usando el buscador, sube una foto de tu lista o...
      </p>
      <Button variant="ghost" onClick={onAddFromFavorites} className='mt-4'>
        <Star className='mr-2 size-4 fill-yellow-400 text-yellow-500' />
        Añadir desde favoritos
      </Button>
    </div>
  );
}
