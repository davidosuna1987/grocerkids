
'use client';

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Product } from '@/types';
import Image from 'next/image';
import { Button } from '../ui/button';
import { Star, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';

type FavoritesSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  favorites: Product[];
  onToggleFavorite: (product: Product) => void;
  onAddProduct: (name: string, image: string) => void;
};

export default function FavoritesSheet({
  open,
  onOpenChange,
  favorites,
  onToggleFavorite,
  onAddProduct
}: FavoritesSheetProps) {

  const handleAddProduct = (product: Product) => {
    onAddProduct(product.name, product.image);
    // toast({
    //   title: 'Producto añadido',
    //   description: `${product.name} se ha añadido a tu lista de la compra.`,
    // });
  }
  
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-2xl max-h-[80vh] flex flex-col">
        <SheetHeader className="text-center">
          <SheetTitle>Productos Favoritos</SheetTitle>
          <SheetDescription>
            Tus productos guardados. Haz clic en uno para añadirlo a la lista.
          </SheetDescription>
        </SheetHeader>
        {favorites.length > 0 ? (
          <div className="flex-1 overflow-y-auto py-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-4">
              {favorites.map((product) => (
                <div key={product.id} className="relative group aspect-square">
                  <div 
                    className="w-full h-full rounded-xl overflow-hidden cursor-pointer"
                    onClick={() => handleAddProduct(product)}
                  >
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      sizes="(max-width: 640px) 50vw, (max-width: 768px) 25vw, 20vw"
                      className="object-cover transition-transform group-hover:scale-105"
                      unoptimized
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <p className="text-white text-center font-semibold p-2">{product.name}</p>
                    </div>
                  </div>
                  <Button
                    size="icon"
                    variant="destructive"
                    className="absolute top-2 right-2 h-7 w-7 opacity-80 group-hover:opacity-100"
                    onClick={() => onToggleFavorite(product)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-center py-16">
            <div className="mx-auto flex items-center justify-center size-24 rounded-full bg-muted text-muted-foreground">
              <Star className="size-12" />
            </div>
            <h3 className="mt-4 text-lg font-semibold">Sin favoritos</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Marca productos con la estrella para añadirlos aquí.
            </p>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
