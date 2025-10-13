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
import { Separator } from '@/components/ui/separator'
import { useSettings } from '@/contexts/settings-context';
import { IMAGE_PROVIDERS_MAP, type ImageProvider } from '@/types';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useShoppingList } from '@/hooks/use-shopping-list';
import { Loader2, Copy, LogOut, Trash2 } from 'lucide-react';

type SettingsSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export default function SettingsSheet({
  open,
  onOpenChange,
}: SettingsSheetProps) {
  const { provider, familyId, membersCount, setProvider, createNewFamily, joinFamily, leaveFamily } = useSettings();
  const { products } = useShoppingList();
  const [familyIdInput, setFamilyIdInput] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const [isConfirmingLeave, setIsConfirmingLeave] = useState(false);
  const { toast } = useToast();

  const handleCreateFamily = async () => {
    setIsCreating(true);
    const newFamilyId = await createNewFamily(products);
    if (newFamilyId) {
      toast({ title: '¡Lista familiar creada!', description: `El código de tu lista es ${newFamilyId}` });
    } else {
      toast({ variant: 'destructive', title: 'Error', description: 'No se pudo crear la lista familiar.' });
    }
    setIsCreating(false);
  };

  const handleJoinFamily = async () => {
    if (!familyIdInput.trim()) return;
    setIsJoining(true);
    const success = await joinFamily(familyIdInput.trim());
    if (success) {
      toast({ title: '¡Te has unido a la lista!', description: 'Tu lista de la compra se ha sincronizado.' });
      onOpenChange(false);
    } else {
      toast({ variant: 'destructive', title: 'Error', description: 'El código no es válido o no existe.' });
    }
    setIsJoining(false);
  };

  const handleLeaveFamily = async () => {
    setIsLeaving(true);
    const { success, wasLastMember } = await leaveFamily();
    if (success) {
      toast({
        title: wasLastMember ? 'Lista familiar eliminada' : 'Has abandonado la lista familiar',
        description: wasLastMember ? 'La lista ha sido eliminada permanentemente.' : 'Tu lista ahora es local.'
      });
    } else {
      toast({ variant: 'destructive', title: 'Error', description: 'No se pudo realizar la operación.' });
    }
    setIsLeaving(false);
    setIsConfirmingLeave(false);
  };

  const handleCopyToClipboard = () => {
    if (familyId) {
      navigator.clipboard.writeText(familyId);
      toast({ title: '¡Copiado!', description: 'Código de lista copiado al portapapeles.' });
    }
  };
  
  const isLastMember = membersCount <= 1;
  const leaveButtonText = isLastMember ? 'Eliminar lista' : 'Abandonar lista';
  const LeaveIcon = isLastMember ? Trash2 : LogOut;


  return (
    <Sheet open={open} onOpenChange={(isOpen) => {
      onOpenChange(isOpen);
      if (!isOpen) {
        setIsConfirmingLeave(false); // Reset on close
      }
    }}>
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
              <Label>El código de tu lista familiar</Label>
              {isConfirmingLeave ? (
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button variant="destructive" onClick={handleLeaveFamily} disabled={isLeaving} className="w-full">
                    {isLeaving ? <Loader2 className="animate-spin" /> : <><LeaveIcon className="mr-2 h-4 w-4" />{leaveButtonText}</>}
                  </Button>
                  <Button variant="outline" onClick={() => setIsConfirmingLeave(false)} disabled={isLeaving} className="w-full">
                    Cancelar
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                   <Button size="icon" variant="ghost" onClick={() => setIsConfirmingLeave(true)} className="text-muted-foreground hover:text-destructive">
                    <LeaveIcon className="h-5 w-5" />
                  </Button>
                  <Input value={familyId} readOnly className="font-mono text-center flex-grow" />
                  <Button size="icon" variant="ghost" onClick={handleCopyToClipboard} className="text-muted-foreground hover:text-primary">
                    <Copy className="h-5 w-5" />
                  </Button>
                </div>
              )}
              <p className="text-xs text-muted-foreground text-center px-2">
                {isLastMember 
                  ? 'Eres el último miembro. Si eliminas la lista, se borrará para siempre.' 
                  : `Comparte este código para usar la misma lista. Hay ${membersCount} miembros.`
                }
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <h3 className="font-semibold text-center">Compartir lista de la compra</h3>
              <div className="space-y-2">
                <Label htmlFor="join-family">Unirse a una lista familiar</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="join-family"
                    placeholder="Introduce el código de la lista"
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
                Crear una nueva lista familiar
              </Button>
            </div>
          )}

          <Separator />

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
        </div>
      </SheetContent>
    </Sheet>
  );
}
