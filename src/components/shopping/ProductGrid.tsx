'use client';

import type { Product } from '@/types';
import ProductCard from './ProductCard';

type ProductGridProps = {
  products: Product[];
  onToggleBought: (id: string) => void;
  onDelete: (id: string) => void;
};

export default function ProductGrid({ products, onToggleBought, onDelete }: ProductGridProps) {
  const sortedProducts = [...products].sort((a, b) => {
    if (a.bought === b.bought) return 0;
    return a.bought ? 1 : -1;
  });

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
      {sortedProducts.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onToggleBought={onToggleBought}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
