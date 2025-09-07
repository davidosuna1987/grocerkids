'use client';

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useSettings } from '@/hooks/useSettings';
import type { ImageProvider } from '@/types';

type SettingsSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export default function SettingsSheet({
  open,
  onOpenChange,
}: SettingsSheetProps) {
  const { provider, setProvider } = useSettings();

  const handleProviderChange = (value: string) => {
    setProvider(value as ImageProvider);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-2xl">
        <SheetHeader className="text-center">
          <SheetTitle>Ajustes</SheetTitle>
          <SheetDescription>
            Personaliza tu experiencia en Grocer Kids.
          </SheetDescription>
        </SheetHeader>
        <div className="py-6 space-y-6 max-w-sm mx-auto">
            <div className="flex flex-col gap-1">
                 <Label htmlFor="image-provider" className="col-span-1">Proveedor de imágenes</Label>
                 <Select
                    value={provider}
                    onValueChange={handleProviderChange}
                 >
                    <SelectTrigger id="image-provider" className="col-span-2">
                        <SelectValue placeholder="Seleccionar proveedor" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="pexels">Pexels</SelectItem>
                        <SelectItem value="pixabay">Pixabay</SelectItem>
                    </SelectContent>
                 </Select>
            </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
