'use client';

import type { Product } from '@/types';
import ProductListItem from './product-list-item';

type ProductListProps = {
  products: Product[];
  onToggleBought: (id: string) => void;
  onDelete: (id: string) => void;
  viewMode: 'list' | 'grid';
};

export default function ProductList({
  products,
  onToggleBought,
  onDelete,
  viewMode,
}: ProductListProps) {
  return (
    <div
      className={
        viewMode === 'list'
          ? 'space-y-3'
          : 'grid grid-cols-2 gap-4'
      }
    >
      {products.map((product) => (
        <ProductListItem
          key={product.id}
          product={product}
          onToggleBought={onToggleBought}
          onDelete={onDelete}
          viewMode={viewMode}
        />
      ))}
    </div>
  );
}
