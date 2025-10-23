
'use client';

import { useState, useRef, type FormEvent, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, Plus, X } from 'lucide-react';
import { useFoodImage } from '@/hooks/use-food-image';
import Image from 'next/image';
import { AnimatePresence, motion } from 'framer-motion';
import ProviderSelector from '../settings/provider-selector';
import { Separator } from '../ui/separator';

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
      className="absolute top-full mt-2 w-full bg-card border rounded-lg shadow-lg z-100 p-4"
    >
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-semibold">Elige una imagen</h3>
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-2 max-h-72 overflow-y-auto">
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
              <Image src={img} alt="Sugerencia de producto" fill sizes="150px" className="object-cover" unoptimized />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      <Separator className="mt-4 mb-3" />
      <ProviderSelector />
    </motion.div>
  );
};


export default function ProductSearchForm({ addProduct }: ProductSearchFormProps) {
  const [itemName, setItemName] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [_, setSuggestionsLoading] = useState(false);
  const { getProductImages } = useFoodImage();

  const showSuggestions = suggestions.length > 0

  const handleAddSuggestions = (images: string[]) => {
    setSuggestions(images);
    document.body.classList.add('overflow-hidden');
  };

  const handleRemoveSuggestions = () => {
    setSuggestions([]);
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    inputRef.current?.focus();
    document.body.classList.remove('overflow-hidden');
  };

  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (itemName.trim().length < 3) {
      handleRemoveSuggestions();
      return;
    }

    debounceTimerRef.current = setTimeout(async () => {
      setSuggestionsLoading(true);
      const images = await getProductImages(itemName.trim());
      handleAddSuggestions(images);
      setSuggestionsLoading(false);
    }, 300);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [itemName, getProductImages]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (itemName.trim() && !isAdding) {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      handleRemoveSuggestions(); // Cierra la caja de sugerencias inmediatamente
      setIsAdding(true);
      await (addProduct as (name: string) => Promise<void>)(itemName.trim());
      setItemName('');
      setIsAdding(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  };

  const handleSuggestionSelect = async (imageUrl: string) => {
    if (itemName.trim() && !isAdding) {
      setIsAdding(true);
      await (addProduct as (name: string, image?: string) => Promise<void>)(itemName.trim(), imageUrl);
      setItemName('');
      handleRemoveSuggestions();
      setIsAdding(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  };

  return (
    <>
      {showSuggestions && (
        <div 
          className="fixed top-0 left-0 w-[100dvw] h-[100dvh] bg-black/80"
          onClick={handleRemoveSuggestions}
        />
      )}
      <div className="relative" onKeyDown={(e) => {
        if (e.key === 'Escape') {
          e.preventDefault();
          handleRemoveSuggestions();
        }
      }}>
        <form onSubmit={handleSubmit} className="flex w-full items-center relative z-100">
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
          {showSuggestions && (
            <ImageSuggestionBox
              images={suggestions}
              onSelect={handleSuggestionSelect}
              onClose={() => setSuggestions([])}
            />
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
