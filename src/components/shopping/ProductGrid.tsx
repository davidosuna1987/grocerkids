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
    <div className="space-y-3">
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
