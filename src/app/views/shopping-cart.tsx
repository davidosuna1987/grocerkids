'use client';

import * as React from 'react';
import { useShoppingList } from '@/hooks/useShoppingList';
import ProductSearchForm from '@/components/shopping/product-search-form';
import ProductList from '@/components/shopping/product-list';
import UploadListSheet from '@/components/shopping/upload-list-sheet';
import ClearListSheet from '@/components/shopping/clear-list-sheet';
import CelebrationSheet from '@/components/shopping/celebration-sheet';
import EmptyState from '@/components/shopping/empty-state';
import LoadingSkeleton from '@/components/shopping/loading-skeleton';
import BottomNavigation from '@/components/shopping/bottom-navigation';
import { Confetti } from '@/components/effects/Confetti';
import { useConfetti } from '@/hooks/useConfetti';
import SettingsSheet from '@/components/settings/SettingsSheet';
import { useSettings } from '@/contexts/SettingsContext';
import NavbarTop from '@/components/layout/navbar-top';

export default function ShoppingCart() {
  const {
    products,
    isLoading,
    addProduct,
    addMultipleProducts,
    toggleProductBought,
    deleteProduct,
    clearList,
  } = useShoppingList();
  const { viewType } = useSettings();
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

      <UploadListSheet
        open={isUploadDialogOpen}
        onOpenChange={setUploadDialogOpen}
        addMultipleProducts={addMultipleProducts}
      />

      <SettingsSheet
        open={isSettingsSheetOpen}
        onOpenChange={setSettingsSheetOpen}
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

      <NavbarTop onSettingsClick={() => setSettingsSheetOpen(true)} />

      <main className="flex-1 w-full max-w-3xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="w-full mb-4 mx-auto">
          <ProductSearchForm addProduct={addProduct} />
        </div>
        <div>
          {isLoading ? (
            <LoadingSkeleton viewMode={viewType} />
          ) : products.length > 0 ? (
            <ProductList
              products={products}
              onToggleBought={toggleProductBought}
              onDelete={deleteProduct}
            />
          ) : (
            <EmptyState />
          )}
        </div>
      </main>

      <BottomNavigation
        onUploadClick={() => setUploadDialogOpen(true)}
        onClearClick={() => setClearListSheetOpen(true)}
        hasProducts={products.length > 0}
      />
    </div>
  );
}
