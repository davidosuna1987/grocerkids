'use client';

import * as React from 'react';
import { useShoppingList } from '@/hooks/useShoppingList';
import Header from '@/components/layout/Header';
import ProductSearchForm from '@/components/shopping/ProductSearchForm';
import ProductGrid from '@/components/shopping/ProductGrid';
import UploadListDialog from '@/components/shopping/UploadListDialog';
import { Button } from '@/components/ui/button';
import {
  Trash2,
  List,
  Grid,
  AlertTriangle,
  Camera,
  PartyPopper,
  ShoppingCart,
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Confetti } from '@/components/effects/Confetti';
import { useConfetti } from '@/hooks/useConfetti';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '@/components/ui/sheet';
import SettingsSheet from '@/components/settings/SettingsSheet';
import { useSettings } from '@/hooks/useSettings';

type ViewMode = 'list' | 'grid';

export default function Home() {
  const { provider } = useSettings();
  const {
    products,
    isLoading,
    addProduct,
    addMultipleProducts,
    toggleProductBought,
    deleteProduct,
    clearList,
  } = useShoppingList();
  const [viewMode, setViewMode] = React.useState<ViewMode>('list');
  const [isUploadDialogOpen, setUploadDialogOpen] = React.useState(false);
  const [isClearListSheetOpen, setClearListSheetOpen] = React.useState(false);
  const [isCelebrationSheetOpen, setCelebrationSheetOpen] =
    React.useState(false);
  const [isSettingsSheetOpen, setSettingsSheetOpen] = React.useState(false);

  const allProductsBought =
    products.length > 0 && products.every(p => p.bought);
  const { showConfetti, confettiTrigger } = useConfetti(allProductsBought);

  React.useEffect(() => {
    confettiTrigger();
    if (allProductsBought) {
      setCelebrationSheetOpen(true);
    }
  }, [allProductsBought, confettiTrigger]);

  const handleClearList = () => {
    clearList();
    setClearListSheetOpen(false);
    setCelebrationSheetOpen(false); // Also close celebration sheet if open
  };

  const handleCloseCelebration = () => {
    setCelebrationSheetOpen(false);
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      {showConfetti && <Confetti />}
      <UploadListDialog
        open={isUploadDialogOpen}
        onOpenChange={setUploadDialogOpen}
        addMultipleProducts={addMultipleProducts}
      />
      <SettingsSheet
        open={isSettingsSheetOpen}
        onOpenChange={setSettingsSheetOpen}
      />
      <Sheet open={isClearListSheetOpen} onOpenChange={setClearListSheetOpen}>
        <SheetContent side="bottom" className="rounded-t-2xl">
          <SheetHeader className="text-center">
            <div className="mx-auto bg-destructive/10 p-2 rounded-full w-fit">
              <AlertTriangle className="size-6 text-destructive" />
            </div>
            <SheetTitle>¿Estás seguro?</SheetTitle>
            <SheetDescription>
              Esta acción no se puede deshacer. Se eliminarán todos los
              productos de tu lista.
            </SheetDescription>
          </SheetHeader>
          <SheetFooter className="mt-6 flex-col-reverse sm:flex-col-reverse gap-2">
            <Button
              variant="outline"
              onClick={() => setClearListSheetOpen(false)}
            >
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleClearList}>
              Vaciar Cesta
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <Sheet
        open={isCelebrationSheetOpen}
        onOpenChange={setCelebrationSheetOpen}
      >
        <SheetContent side="bottom" className="rounded-t-2xl">
          <SheetHeader className="text-center">
            <div className="mx-auto bg-primary/10 p-2 rounded-full w-fit">
              <PartyPopper className="size-6 text-primary" />
            </div>
            <SheetTitle>¡Enhorabuena!</SheetTitle>
            <SheetDescription>
              ¡Has encontrado todos los productos de tu lista! ¿Qué quieres
              hacer ahora?
            </SheetDescription>
          </SheetHeader>
          <SheetFooter className="mt-6 flex-col-reverse sm:flex-col-reverse gap-2">
            <Button variant="outline" onClick={handleCloseCelebration}>
              Cerrar
            </Button>
            <Button onClick={handleClearList}>Vaciar Cesta</Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <Header onSettingsClick={() => setSettingsSheetOpen(true)} />

      <main className="flex flex-col flex-1 container mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex-1">
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
          )}
        </div>
        <div className="w-full max-w-2xl mb-8">
          <ProductSearchForm addProduct={addProduct} />
        </div>
      </main>

      <footer className="sticky bottom-0 bg-card shadow-[0_-2px_5px_rgba(0,0,0,0.05)] rounded-t-2xl">
        <nav className="flex justify-around items-center h-20 px-4 max-w-2xl mx-auto">
          <Button
            variant="ghost"
            className="flex flex-col items-center text-muted-foreground h-auto hover:bg-transparent [&:hover>span]:text-primary [&:hover>svg]:text-primary"
            onClick={() => setViewMode(viewMode === 'list' ? 'grid' : 'list')}
          >
            {viewMode === 'list' ? (
              <Grid className="!size-7" />
            ) : (
              <List className="!size-7" />
            )}
          </Button>

          <Button
            variant="ghost"
            className="text-card-foreground h-auto hover:bg-transparent"
            onClick={() => setUploadDialogOpen(true)}
          >
            <div className="flex justify-center items-center size-24 bg-primary rounded-full text-primary-foreground -mt-8 shadow-lg shadow-primary/30">
              <Camera className='!size-10' />
            </div>
          </Button>

          <Button
            variant="ghost"
            className="flex flex-col items-center text-muted-foreground h-auto hover:bg-transparent [&:hover>span]:text-primary [&:hover>svg]:text-primary"
            onClick={() => setClearListSheetOpen(true)}
            disabled={products.length === 0}
          >
            <Trash2 className='!size-7' />
          </Button>
        </nav>
      </footer>
    </div>
  );
}
