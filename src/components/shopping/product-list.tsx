'use client';

import type { Product } from '@/types';
import ProductListItem from './product-list-item';
import { useSettings } from '@/contexts/SettingsContext';

type ProductListProps = {
  products: Product[];
  onToggleBought: (id: string) => void;
  onDelete: (id: string) => void;
};

export default function ProductList({
  products,
  onToggleBought,
  onDelete,
}: ProductListProps) {
  const { viewType } = useSettings();
  return (
    <div
      className={
        viewType === 'list'
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
          viewMode={viewType}
        />
      ))}
    </div>
  );
}
