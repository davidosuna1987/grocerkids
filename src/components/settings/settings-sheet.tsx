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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useSettings } from '@/contexts/settings-context';
import { IMAGE_PROVIDERS_MAP, VIEW_TYPES_MAP, THEMES_MAP, type ImageProvider, type ViewType, type Theme } from '@/types';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useShoppingList } from '@/hooks/use-shopping-list';
import { Loader2, Copy } from 'lucide-react';

type SettingsSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export default function SettingsSheet({
  open,
  onOpenChange,
}: SettingsSheetProps) {
  const { provider, viewType, theme, familyId, setProvider, setViewType, setTheme, createNewFamily, joinFamily } = useSettings();
  const { products } = useShoppingList();
  const [familyIdInput, setFamilyIdInput] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const { toast } = useToast();

  const handleCreateFamily = async () => {
    setIsCreating(true);
    const newFamilyId = await createNewFamily(products);
    if (newFamilyId) {
      toast({ title: '¡Familia creada!', description: `Tu código de familia es ${newFamilyId}` });
    } else {
      toast({ variant: 'destructive', title: 'Error', description: 'No se pudo crear la familia.' });
    }
    setIsCreating(false);
  };

  const handleJoinFamily = async () => {
    if (!familyIdInput.trim()) return;
    setIsJoining(true);
    const success = await joinFamily(familyIdInput.trim());
    if (success) {
      toast({ title: '¡Te has unido a la familia!', description: 'Tu lista se ha sincronizado.' });
      onOpenChange(false);
    } else {
      toast({ variant: 'destructive', title: 'Error', description: 'El código de familia no es válido o no existe.' });
    }
    setIsJoining(false);
  };

  const handleCopyToClipboard = () => {
    if (familyId) {
      navigator.clipboard.writeText(familyId);
      toast({ title: '¡Copiado!', description: 'Código de familia copiado al portapapeles.' });
    }
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
          {familyId ? (
            <div className="space-y-2">
              <Label>Tu código de familia</Label>
              <div className="flex items-center gap-2">
                <Input value={familyId} readOnly className="font-mono text-center" />
                <Button size="icon" variant="outline" onClick={handleCopyToClipboard}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">Comparte este código con tu familia para usar la misma lista.</p>
            </div>
          ) : (
            <div className="p-4 border rounded-lg space-y-4">
              <h3 className="font-semibold text-center">Compartir lista de la compra</h3>
              <div className="space-y-2">
                <Label htmlFor="join-family">Unirse a una familia existente</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="join-family"
                    placeholder="Introduce el código"
                    value={familyIdInput}
                    onChange={(e) => setFamilyIdInput(e.target.value)}
                    disabled={isJoining || isCreating}
                  />
                  <Button onClick={handleJoinFamily} disabled={isJoining || isCreating || !familyIdInput.trim()}>
                    {isJoining ? <Loader2 className="animate-spin" /> : 'Unirse'}
                  </Button>
                </div>
              </div>
              <div className="relative flex items-center">
                <div className="flex-grow border-t"></div>
                <span className="flex-shrink mx-4 text-muted-foreground text-xs">O</span>
                <div className="flex-grow border-t"></div>
              </div>
              <Button onClick={handleCreateFamily} disabled={isJoining || isCreating} className="w-full">
                {isCreating ? <Loader2 className="animate-spin mr-2" /> : null}
                Crear una nueva familia
              </Button>
            </div>
          )}

          <div className="flex flex-col gap-2">
            <Label htmlFor="image-provider">Proveedor de imágenes</Label>
            <Select
              value={provider}
              onValueChange={(value: ImageProvider) => setProvider(value)}
            >
              <SelectTrigger id="image-provider">
                <SelectValue placeholder="Seleccionar proveedor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={IMAGE_PROVIDERS_MAP.google}>Google</SelectItem>
                <SelectItem value={IMAGE_PROVIDERS_MAP.pexels}>Pexels</SelectItem>
                <SelectItem value={IMAGE_PROVIDERS_MAP.pixabay}>Pixabay</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="view-type">Tipo de vista</Label>
            <Select
              value={viewType}
              onValueChange={(value: ViewType) => setViewType(value)}
            >
              <SelectTrigger id="view-type">
                <SelectValue placeholder="Seleccionar vista" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={VIEW_TYPES_MAP.list}>Lista</SelectItem>
                <SelectItem value={VIEW_TYPES_MAP.grid}>Cuadrícula</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="theme">Tema de la app</Label>
            <Select
              value={theme}
              onValueChange={(value: Theme) => setTheme(value)}
            >
              <SelectTrigger id="theme">
                <SelectValue placeholder="Seleccionar tema" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={THEMES_MAP.light}>Claro</SelectItem>
                <SelectItem value={THEMES_MAP.dark}>Oscuro</SelectItem>
                <SelectItem value={THEMES_MAP.system}>Sistema</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
