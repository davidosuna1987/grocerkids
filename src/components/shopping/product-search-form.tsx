'use client';

import { useState, useRef, type FormEvent, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, Plus, X } from 'lucide-react';
import { useFoodImage } from '@/hooks/use-food-image';
import Image from 'next/image';
import { AnimatePresence, motion } from 'framer-motion';

type ProductSearchFormProps = {
  addProduct: (name: string, image?: string) => void;
};

const ImageSuggestionBox = ({
  images,
  onSelect,
  onClose,
}: {
  images: string[];
  onSelect: (imageUrl: string) => void;
  onClose: () => void;
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="absolute top-full mt-2 w-full bg-card border rounded-lg shadow-lg z-50 p-4"
    >
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-sm font-semibold">Elige una imagen</h3>
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
        <AnimatePresence>
          {images.map((img, index) => (
            <motion.div
              key={img}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => onSelect(img)}
              className="aspect-square relative rounded-md overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
            >
              <Image src={img} alt="Sugerencia de producto" fill sizes="150px" className="object-cover" unoptimized/>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};


export default function ProductSearchForm({ addProduct }: ProductSearchFormProps) {
  const [itemName, setItemName] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isSuggestionsLoading, setSuggestionsLoading] = useState(false);
  const { getProductImages } = useFoodImage();

  useEffect(() => {
    if (itemName.trim().length < 3) {
      setSuggestions([]);
      return;
    }

    const handler = setTimeout(async () => {
      setSuggestionsLoading(true);
      const images = await getProductImages(itemName.trim());
      setSuggestions(images);
      setSuggestionsLoading(false);
    }, 300);

    return () => {
      clearTimeout(handler);
      setSuggestionsLoading(false);
    };
  }, [itemName, getProductImages]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (itemName.trim() && !isAdding) {
      setIsAdding(true);
      await (addProduct as (name: string) => Promise<void>)(itemName.trim());
      setItemName('');
      setSuggestions([]);
      setIsAdding(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  };

  const handleSuggestionSelect = async (imageUrl: string) => {
    if (itemName.trim() && !isAdding) {
      setIsAdding(true);
      await (addProduct as (name: string, image?: string) => Promise<void>)(itemName.trim(), imageUrl);
      setItemName('');
      setSuggestions([]);
      setIsAdding(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  };

  return (
    <div className="relative">
      <form onSubmit={handleSubmit} className="flex w-full items-center">
        <Input
          ref={inputRef}
          type="text"
          placeholder="Ej: Plátanos, Leche, Pan..."
          value={itemName}
          onChange={(e) => setItemName(e.target.value)}
          className="h-12 flex-grow text-lg shadow-inner rounded-r-none"
          aria-label="Nombre del producto"
          disabled={isAdding}
          autoComplete="off"
        />
        <Button
          type="submit"
          className="h-12 bg-primary hover:bg-primary/90 rounded-l-none px-4"
          disabled={!itemName.trim() || isAdding}
          aria-label="Añadir producto"
        >
          {isAdding ? (
            <Loader2 className="!size-6 animate-spin text-primary-foreground" />
          ) : (
            <Plus className="!size-6 text-primary-foreground" />
          )}
        </Button>
      </form>
      <AnimatePresence>
        {suggestions.length > 0 && (
          <ImageSuggestionBox
            images={suggestions}
            onSelect={handleSuggestionSelect}
            onClose={() => setSuggestions([])}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
