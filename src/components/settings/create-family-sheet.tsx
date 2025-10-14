
'use client';

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '@/components/ui/sheet';
import { Label } from '@/components/ui/label';
import { useSettings } from '@/contexts/settings-context';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { FormEvent, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useShoppingList } from '@/hooks/use-shopping-list';
import { Loader2 } from 'lucide-react';

type CreateFamilySheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export default function CreateFamilySheet({ open, onOpenChange }: CreateFamilySheetProps) {
  const { createNewFamily } = useSettings();
  const { products } = useShoppingList();
  const [isCreating, setIsCreating] = useState(false);
  const [newFamilyName, setNewFamilyName] = useState('');
  const { toast } = useToast();

  const handleCreateFamily = async () => {
    if (!newFamilyName.trim()) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Por favor, dale un nombre a tu lista.',
      });
      return;
    }

    setIsCreating(true);
    const newFamilyId = await createNewFamily(products, newFamilyName);
    if (newFamilyId) {
      toast({
        title: '¡Lista familiar creada!',
        description: `Ya puedes compartirla con el código o el enlace.`,
      });
      setNewFamilyName('');
      onOpenChange(false);
    } else {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se pudo crear la lista familiar.',
      });
    }
    setIsCreating(false);
  };
  
  const handleSheetOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setNewFamilyName('');
      setIsCreating(false);
    }
    onOpenChange(isOpen);
  };
  
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    handleCreateFamily();
  };


  return (
    <Sheet open={open} onOpenChange={handleSheetOpenChange}>
      <SheetContent side="bottom" className="rounded-t-2xl">
        <SheetHeader className="text-center">
          <SheetTitle>Crear una nueva lista familiar</SheetTitle>
          <SheetDescription>
            Dale un nombre a tu lista para poder compartirla con otros.
          </SheetDescription>
        </SheetHeader>
        <form onSubmit={handleSubmit} className="py-6 max-w-sm mx-auto space-y-4">
          <div className="space-y-2">
            <Label htmlFor="create-family" className="sr-only">Nombre de la lista</Label>
            <div className="flex flex-col gap-2">
              <Input
                id="create-family"
                value={newFamilyName}
                placeholder="Nombre de la lista (ej: Compra Semanal)"
                className="font-sans text-center flex-grow h-12 text-base"
                onChange={(e) => setNewFamilyName(e.target.value)}
                disabled={isCreating}
              />
            </div>
          </div>
          <SheetFooter className="max-w-sm mx-auto">
            <Button type="submit" disabled={isCreating || !newFamilyName.trim()} className="w-full">
              {isCreating ? <Loader2 className="animate-spin mr-2" /> : null}
              Crear y compartir
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
