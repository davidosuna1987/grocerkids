'use client';

import type { Product } from '@/types';
import ProductCard from './ProductCard';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

type ProductGridProps = {
  products: Product[];
  onToggleBought: (id: string) => void;
  onDelete: (id: string) => void;
  viewMode?: 'list' | 'grid';
};

export default function ProductGrid({ products, onToggleBought, onDelete, viewMode = 'list' }: ProductGridProps) {
  const sortedProducts = [...products].sort((a, b) => {
    if (a.bought === b.bought) return 0;
    return a.bought ? 1 : -1;
  });

  return (
    <motion.div
      layout
      className={cn({
        'space-y-3 w-full mx-auto': viewMode === 'list',
        'grid grid-cols-2 lg:grid-cols-3 gap-4 w-full mx-auto': viewMode === 'grid',
      })}
    >
      <AnimatePresence>
        {sortedProducts.map((product) => (
          <motion.div
            key={product.id}
            layout
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.3 }}
          >
            <ProductCard
              product={product}
              onToggleBought={onToggleBought}
              onDelete={onDelete}
              viewMode={viewMode}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  );
}
