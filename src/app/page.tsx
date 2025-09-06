'use client';

import * as React from 'react';
import { useShoppingList } from '@/hooks/useShoppingList';
import Header from '@/components/layout/Header';
import ProductSearchForm from '@/components/shopping/ProductSearchForm';
import ProductGrid from '@/components/shopping/ProductGrid';
import UploadListDialog from '@/components/shopping/UploadListDialog';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import Image from 'next/image';
import { Confetti } from '@/components/effects/Confetti';
import { useConfetti } from '@/hooks/useConfetti';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle } from 'lucide-react';

export default function Home() {
  const {
    products,
    isLoading,
    addProduct,
    addMultipleProducts,
    toggleProductBought,
    deleteProduct,
    clearList,
  } = useShoppingList();
  const { toast } = useToast();

  const allProductsBought = products.length > 0 && products.every(p => p.bought);
  const { showConfetti, confettiTrigger } = useConfetti(allProductsBought);
  
  const [celebrationToastShown, setCelebrationToastShown] = React.useState(false);

  React.useEffect(() => {
    confettiTrigger();
    if (allProductsBought && !celebrationToastShown) {
      toast({
        duration: 5000,
        className: 'border-green-500 bg-green-50 dark:bg-green-900/50',
        children: (
          <div className="flex items-start gap-4 w-full">
            <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400 mt-1" />
            <div className="flex-grow">
              <p className="font-headline font-bold text-lg text-green-700 dark:text-green-300">¡Enhorabuena!</p>
              <p className="text-green-600 dark:text-green-400">¡Has encontrado todos los productos!</p>
            </div>
          </div>
        ),
      });
      setCelebrationToastShown(true);
    } else if (!allProductsBought && celebrationToastShown) {
      setCelebrationToastShown(false);
    }
  }, [allProductsBought, confettiTrigger, toast, celebrationToastShown]);


  return (
    <div className="flex min-h-screen w-full flex-col">
       {showConfetti && <Confetti />}
      <Header>
        <div className="flex items-center gap-2">
          <UploadListDialog addMultipleProducts={addMultipleProducts} />
          <Button
            variant="destructive"
            size="sm"
            onClick={clearList}
            disabled={products.length === 0}
            aria-label="Clear all items from the list"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Clear
          </Button>
        </div>
      </Header>
      <main className="flex-1 container mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl">
          <ProductSearchForm addProduct={addProduct} />
        </div>
        <div className="mt-8">
          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="flex flex-col gap-2">
                  <Skeleton className="aspect-square w-full rounded-xl" />
                  <Skeleton className="h-5 w-3/4" />
                </div>
              ))}
            </div>
          ) : products.length > 0 ? (
            <ProductGrid
                products={products}
                onToggleBought={toggleProductBought}
                onDelete={deleteProduct}
              />
          ) : (
            <div className="text-center py-16 px-4">
              <div className="relative mx-auto h-40 w-40 text-muted-foreground">
                 <Image src="https://picsum.photos/200/200" alt="Empty grocery basket" data-ai-hint="grocery basket" layout="fill" className="opacity-50 rounded-full" />
              </div>
              <h2 className="mt-6 text-2xl font-headline font-semibold text-foreground">
                Your List is Empty!
              </h2>
              <p className="mt-2 text-muted-foreground">
                Add items using the search bar above or upload a photo of your list.
              </p>
            </div>
          )}
        </div>
      </main>
      <footer className="py-4 text-center text-sm text-muted-foreground">
        <p>Made with ❤️ for little shoppers.</p>
      </footer>
    </div>
  );
}
