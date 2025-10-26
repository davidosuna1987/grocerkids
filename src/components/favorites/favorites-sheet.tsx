
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
import { motion } from 'framer-motion';

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
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
              {favorites.map((product, index) => (
                <motion.div
                  key={`${index}-${product.id}-${product.name.replace(/\s+/g, '-')}`}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => handleAddProduct(product)}
                  className="aspect-square relative rounded-md overflow-hidden cursor-pointer hover:opacity-80 transition-opacity relative"
                >
                  <Image src={product.image} alt={product.name} fill sizes="150px" className="object-cover" unoptimized />
                  <Button
                    size="icon"
                    variant="destructive"
                    className="rounded-full transition-none h-8 w-8 absolute top-1 right-1"
                    onClick={() => onToggleFavorite(product)}
                    aria-label={`Eliminar ${product.name} de favoritos`}
                  >
                    <Trash2 className="h-5 w-5" />
                  </Button>
                </motion.div>
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
