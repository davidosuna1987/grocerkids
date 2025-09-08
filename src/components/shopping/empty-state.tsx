'use client';

import { ShoppingCart } from 'lucide-react';

export default function EmptyState() {
  return (
    <div className="text-center py-16 px-4">
      <div className="mx-auto flex items-center justify-center size-32 rounded-full bg-primary/20 text-primary">
        <ShoppingCart className="size-16" />
      </div>
      <h2 className="mt-6 text-2xl font-headline font-semibold text-foreground">
        ¡Tu lista está vacía!
      </h2>
      <p className="mt-2 text-muted-foreground">
        Añade productos usando el buscador o sube una foto de tu lista.
      </p>
    </div>
  );
}
