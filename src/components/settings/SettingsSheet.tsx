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
import { useSettings } from '@/contexts/SettingsContext';
import { IMAGE_PROVIDERS_MAP, VIEW_TYPES_MAP, type ImageProvider, type ViewType } from '@/types';

type SettingsSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export default function SettingsSheet({
  open,
  onOpenChange,
}: SettingsSheetProps) {
  const { provider, viewType, setProvider, setViewType } = useSettings();

  const handleProviderChange = (value: ImageProvider) => {
    console.log("Selected provider:", value);
    setProvider(value);
  };

  const handleViewTypeChange = (value: ViewType) => {
    setViewType(value);
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
            <div className="flex flex-col gap-2">
                 <Label htmlFor="image-provider" className="col-span-1">Proveedor de imágenes</Label>
                 <Select
                    value={provider}
                    onValueChange={handleProviderChange}
                 >
                    <SelectTrigger id="image-provider" className="col-span-2">
                        <SelectValue placeholder="Seleccionar proveedor" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value={IMAGE_PROVIDERS_MAP.pexels}>Pexels</SelectItem>
                        <SelectItem value={IMAGE_PROVIDERS_MAP.pixabay}>Pixabay</SelectItem>
                    </SelectContent>
                 </Select>
            </div>
            
            <div className="flex flex-col gap-2">
                 <Label htmlFor="view-type" className="col-span-1">Tipo de vista</Label>
                 <Select
                    value={viewType}
                    onValueChange={handleViewTypeChange}
                 >
                    <SelectTrigger id="view-type" className="col-span-2">
                        <SelectValue placeholder="Seleccionar vista" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value={VIEW_TYPES_MAP.list}>Lista</SelectItem>
                        <SelectItem value={VIEW_TYPES_MAP.grid}>Cuadrícula</SelectItem>
                    </SelectContent>
                 </Select>
            </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
