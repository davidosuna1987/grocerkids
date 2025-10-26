'use client';

import * as React from 'react';
import { useShoppingList } from '@/hooks/use-shopping-list';
import ProductSearchForm from '@/components/shopping/product-search-form';
import ProductList from '@/components/shopping/product-list';
import UploadListSheet from '@/components/shopping/upload-list-sheet';
import ClearListSheet from '@/components/shopping/clear-list-sheet';
import CelebrationSheet from '@/components/shopping/celebration-sheet';
import EmptyState from '@/components/shopping/empty-state';
import LoadingSkeleton from '@/components/shopping/loading-skeleton';
import BottomNavigation from '@/components/shopping/bottom-navigation';
import { useConfetti } from '@/hooks/use-confetti';
import SettingsSheet from '@/components/settings/settings-sheet';
import CreateFamilySheet from '@/components/settings/create-family-sheet';
import { useSettings } from '@/contexts/settings-context';
import NavbarTop from '@/components/layout/navbar-top';
import { Confetti } from '@/components/effects/confetti';
import { toast } from '@/hooks/use-toast';
import FavoritesSheet from '@/components/favorites/favorites-sheet';
import { useFavorites } from '@/hooks/use-favorites';

export default function ShoppingCart() {
  const { favorites, toggleFavorite, isFavorite } = useFavorites();
  const {
    products,
    isLoading,
    addProduct,
    addMultipleProducts,
    toggleProductBought,
    deleteProduct,
    clearList,
  } = useShoppingList(favorites);
  const { viewType } = useSettings();
  const [isUploadDialogOpen, setUploadDialogOpen] = React.useState(false);
  const [isClearListSheetOpen, setClearListSheetOpen] = React.useState(false);
  const [isCelebrationSheetOpen, setCelebrationSheetOpen] =
    React.useState(false);
  const [isSettingsSheetOpen, setSettingsSheetOpen] = React.useState(false);
  const [isCreateFamilySheetOpen, setCreateFamilySheetOpen] = React.useState(false);
  const [isFavoritesSheetOpen, setFavoritesSheetOpen] = React.useState(false);

  const allProductsBought =
    products.length > 0 && products.every(p => p.bought);
  const { showConfetti, confettiTrigger } = useConfetti(allProductsBought);

  React.useEffect(() => {
    confettiTrigger();
    if (allProductsBought) {
      setCelebrationSheetOpen(true);
    }
  }, [allProductsBought, confettiTrigger]);

  const showEmptyListToast = () => 
    toast({
      title: 'Tu lista está vacía',
      description: 'Añade productos usando el buscador o sube una foto de tu lista.',
    });

  const handleClearClick = () => {
    if(!products.length) {
      showEmptyListToast();
      return;
    }
    
    setClearListSheetOpen(true);
  }

  const handleClearList = () => {
    clearList();
    setClearListSheetOpen(false);
    setCelebrationSheetOpen(false);
    showEmptyListToast();
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      {showConfetti && <Confetti />}

      <NavbarTop />

      <UploadListSheet
        open={isUploadDialogOpen}
        onOpenChange={setUploadDialogOpen}
        addMultipleProducts={addMultipleProducts}
      />

      <SettingsSheet
        open={isSettingsSheetOpen}
        onOpenChange={setSettingsSheetOpen}
        onCreateFamilyClick={() => {
          setSettingsSheetOpen(false);
          setCreateFamilySheetOpen(true);
        }}
      />
      
      <CreateFamilySheet
        open={isCreateFamilySheetOpen}
        onOpenChange={setCreateFamilySheetOpen}
      />

      <ClearListSheet
        open={isClearListSheetOpen}
        onOpenChange={setClearListSheetOpen}
        onConfirm={handleClearList}
      />

      <CelebrationSheet
        open={isCelebrationSheetOpen}
        onOpenChange={setCelebrationSheetOpen}
        onClearList={handleClearList}
      />

      <FavoritesSheet
        products={products}
        open={isFavoritesSheetOpen}
        onOpenChange={setFavoritesSheetOpen}
        favorites={favorites}
        onToggleFavorite={toggleFavorite}
        onAddProduct={addProduct}
      />
      
      <div className="sticky top-16 z-30 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-[0_2px_5px_rgba(0,0,0,0.05)]">
        <div className="w-full max-w-3xl mx-auto p-4 sm:p-6 lg:px-8">
            <ProductSearchForm addProduct={addProduct} />
        </div>
      </div>

      <main className="flex-1 w-full max-w-3xl mx-auto p-4 sm:p-6 lg:p-8">
        <div>
          {isLoading ? (
            <LoadingSkeleton viewMode={viewType} />
          ) : products.length > 0 ? (
            <ProductList
              products={products}
              onToggleBought={toggleProductBought}
              onDelete={deleteProduct}
              onToggleFavorite={toggleFavorite}
              isFavorite={isFavorite}
            />
          ) : (
            <EmptyState onAddFromFavorites={() => setFavoritesSheetOpen(true)} />
          )}
        </div>
      </main>

      <BottomNavigation
        onUploadClick={() => setUploadDialogOpen(true)}
        onClearClick={handleClearClick}
        onSettingsClick={() => setSettingsSheetOpen(true)}
        onFavoritesClick={() => setFavoritesSheetOpen(true)}
      />
    </div>
  );
}
