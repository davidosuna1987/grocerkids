'use client';

import type { Product } from '@/types';
import ProductListItem from './product-list-item';
import { useSettings } from '@/contexts/settings-context';
import { AnimatePresence, motion } from 'framer-motion';

type ProductListProps = {
  products: Product[];
  onToggleBought: (id: string) => void;
  onDelete: (id: string) => void;
  onToggleFavorite: (product: Product) => void;
  isFavorite: (productId: string) => boolean;
};

export default function ProductList({
  products,
  onToggleBought,
  onDelete,
  onToggleFavorite,
  isFavorite
}: ProductListProps) {
  const { viewType } = useSettings();
  return (
    <motion.div
      layout
      className={
        viewType === 'list'
          ? 'space-y-3'
          : 'grid grid-cols-2 gap-4'
      }
    >
      <AnimatePresence>
        {products.map((product) => (
            <motion.div key={product.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <ProductListItem
                product={product}
                onToggleBought={onToggleBought}
                onDelete={onDelete}
                onToggleFavorite={onToggleFavorite}
                isFavorite={isFavorite(product.id)}
                viewMode={viewType}
              />
            </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  );
}
