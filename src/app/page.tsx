'use client';

import * as React from 'react';
import { useShoppingList } from '@/hooks/useShoppingList';
import Header from '@/components/layout/Header';
import ProductSearchForm from '@/components/shopping/ProductSearchForm';
import ProductGrid from '@/components/shopping/ProductGrid';
import UploadListDialog from '@/components/shopping/UploadListDialog';
import { Button } from '@/components/ui/button';
import { Trash2, List, Plus, Grid } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import Image from 'next/image';
import { Confetti } from '@/components/effects/Confetti';
import { useConfetti } from '@/hooks/useConfetti';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle } from 'lucide-react';

type ViewMode = 'list' | 'grid';

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
  const [viewMode, setViewMode] = React.useState<ViewMode>('list');
  const [isUploadDialogOpen, setUploadDialogOpen] = React.useState(false);

  const allProductsBought =
    products.length > 0 && products.every(p => p.bought);
  const { showConfetti, confettiTrigger } = useConfetti(allProductsBought);

  const [celebrationToastShown, setCelebrationToastShown] =
    React.useState(false);

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
              <p className="font-headline font-bold text-lg text-green-700 dark:text-green-300">
                ¡Enhorabuena!
              </p>
              <p className="text-green-600 dark:text-green-400">
                ¡Has encontrado todos los productos!
              </p>
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
    <div className="flex min-h-screen w-full flex-col bg-background">
      {showConfetti && <Confetti />}
      <UploadListDialog
        open={isUploadDialogOpen}
        onOpenChange={setUploadDialogOpen}
        addMultipleProducts={addMultipleProducts}
      />

      <Header />

      <main className="flex-1 container mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl">
          <ProductSearchForm addProduct={addProduct} />
        </div>
        <div className="mt-8">
          {isLoading ? (
            <div
              className={
                viewMode === 'list'
                  ? 'space-y-3'
                  : 'grid grid-cols-2 gap-4'
              }
            >
              {[...Array(viewMode === 'list' ? 3 : 4)].map((_, i) => (
                <div
                  key={i}
                  className="flex items-center gap-4 bg-card p-3 rounded-2xl shadow-sm"
                >
                  <Skeleton className="size-6 shrink-0 rounded-lg" />
                  <Skeleton className="size-16 rounded-xl" />
                  <div className="flex-grow space-y-2">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : products.length > 0 ? (
            <ProductGrid
              products={products}
              onToggleBought={toggleProductBought}
              onDelete={deleteProduct}
              viewMode={viewMode}
            />
          ) : (
            <div className="text-center py-16 px-4">
              <div className="relative mx-auto h-40 w-40 text-muted-foreground">
                <Image
                  src="https://picsum.photos/200/200"
                  alt="Empty grocery basket"
                  data-ai-hint="grocery basket"
                  layout="fill"
                  className="opacity-50 rounded-full"
                />
              </div>
              <h2 className="mt-6 text-2xl font-headline font-semibold text-foreground">
                Your List is Empty!
              </h2>
              <p className="mt-2 text-muted-foreground">
                Add items using the search bar above or upload a photo of your
                list.
              </p>
            </div>
          )}
        </div>
      </main>

      <footer className="sticky bottom-0 bg-card shadow-[0_-2px_5px_rgba(0,0,0,0.05)] rounded-t-2xl">
        <nav className="flex justify-around items-center h-20 px-4 max-w-2xl mx-auto">
          <Button
            variant="ghost"
            className="flex flex-col items-center gap-1 text-muted-foreground h-auto hover:bg-transparent hover:text-primary"
            onClick={() => setViewMode(viewMode === 'list' ? 'grid' : 'list')}
          >
            {viewMode === 'list' ? (
              <Grid className="size-7" />
            ) : (
              <List className="size-7" />
            )}
            <span className="text-xs font-semibold">
              {viewMode === 'list' ? 'Grid' : 'List'}
            </span>
          </Button>

          <Button
            variant="ghost"
            className="text-card-foreground h-auto hover:bg-transparent"
            onClick={() => setUploadDialogOpen(true)}
          >
            <div className="bg-primary p-3 rounded-full text-primary-foreground -mt-8 shadow-lg shadow-primary/30">
              <Plus className="size-10" />
            </div>
          </Button>

          <Button
            variant="ghost"
            className="flex flex-col items-center gap-1 text-muted-foreground h-auto hover:bg-transparent hover:text-primary"
            onClick={clearList}
            disabled={products.length === 0}
          >
            <Trash2 className="size-7" />
            <span className="text-xs font-semibold">Clear</span>
          </Button>
        </nav>
      </footer>
    </div>
  );
}
