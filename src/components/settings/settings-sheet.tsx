
'use client';

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator'
import { JoinFamilyLink, useSettings } from '@/contexts/settings-context';
import { IMAGE_PROVIDERS_MAP, type ImageProvider } from '@/types';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Share2, LogOut, Trash2 } from 'lucide-react';

type SettingsSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateFamilyClick: () => void;
};

export default function SettingsSheet({
  open,
  onOpenChange,
  onCreateFamilyClick,
}: SettingsSheetProps) {
  const {
    provider,
    familyId,
    familyName,
    membersCount,
    setProvider,
    joinFamily,
    leaveFamily,
    generateJoinFamilyLink
  } = useSettings();
  const [familyIdInput, setFamilyIdInput] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const [isConfirmingLeave, setIsConfirmingLeave] = useState(false);
  const { toast } = useToast();

  const handleJoinFamily = async () => {
    if (!familyIdInput.trim()) return;
    setIsJoining(true);
    const success = await joinFamily(familyIdInput.trim());
    if (success) {
      onOpenChange(false);
    }
    setIsJoining(false);
  };

  const handleLeaveFamily = async () => {
    setIsLeaving(true);
    await leaveFamily();
    setIsLeaving(false);
    setIsConfirmingLeave(false);
  };

  const handleCopyToClipboard = async () => {
    if (familyId) {
      const joinFamilyLink: JoinFamilyLink | null = generateJoinFamilyLink(familyId);
      if (joinFamilyLink) {
        await navigator.clipboard.writeText(`¡Únete a la lista "${familyName}" en Grocer Kids!\n\n${joinFamilyLink.url}`);
        toast({ title: '¡Copiado!', description: 'El enlace para unirse a la lista se ha copiado al portapapeles.' });
      }
    }
  };

  const handleCopyCodeToClipboard = async () => {
    if (familyId) {
        await navigator.clipboard.writeText(`¡Únete a la lista "${familyName}" en Grocer Kids con este código!\n\n${familyId}`);
        toast({ title: '¡Copiado!', description: 'El código para unirse a la lista se ha copiado al portapapeles.' });
    }
  };
  
  const isLastMember = membersCount <= 1;
  const leaveButtonText = isLastMember ? 'Eliminar lista' : 'Abandonar lista';
  const familyCodeText = isConfirmingLeave 
    ? (isLastMember ? '¿Seguro que quieres eliminar la lista?' : '¿Seguro que quieres abandonar la lista?') 
    : `Estás en la lista: ${familyName || '...'}`;
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
          <SheetTitle className="-mb-2">Ajustes</SheetTitle>
          <SheetDescription>
            Personaliza tu experiencia en Grocer Kids.
          </SheetDescription>
        </SheetHeader>
        <div className="py-6 space-y-6 max-w-sm mx-auto">
        {familyId ? (
            <div className="space-y-2">
              <Label>{familyCodeText}</Label>
              {isConfirmingLeave ? (
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button variant="destructive" onClick={handleLeaveFamily} disabled={isLeaving} className="w-full">
                    {isLeaving ? <Loader2 className="animate-spin" /> : leaveButtonText}
                  </Button>
                  <Button variant="outline" onClick={() => setIsConfirmingLeave(false)} disabled={isLeaving} className="w-full">
                    Cancelar
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                   <Button size="icon" variant="ghost" onClick={() => setIsConfirmingLeave(true)} className="hover:bg-destructive border hover:border-destructive">
                    <LeaveIcon className="h-5 w-5" />
                  </Button>
                  <Input value={`Copiar código: ${familyId}`} readOnly className="font-mono text-center flex-grow cursor-pointer hover:border-primary" onClick={handleCopyCodeToClipboard} />
                  <Button size="icon" variant="ghost" onClick={handleCopyToClipboard} className="border hover:border-primary">
                    <Share2 className="h-5 w-5" />
                  </Button>
                </div>
              )}
              <p className="text-xs text-muted-foreground text-center">
                {isLastMember 
                  ? 'Eres la única persona en esta lista.' 
                  : `Hay ${membersCount} personas en esta lista.`
                }
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <h3 className="font-semibold text-center">Compartir lista de la compra</h3>
              <div className="space-y-2">
                <Label htmlFor="join-family">Unirse a una lista existente</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="join-family"
                    placeholder="Introduce el código de la lista"
                    value={familyIdInput}
                    onChange={(e) => setFamilyIdInput(e.target.value)}
                    disabled={isJoining}
                  />
                  <Button onClick={handleJoinFamily} disabled={isJoining || !familyIdInput.trim()}>
                    {isJoining ? <Loader2 className="animate-spin" /> : 'Unirse'}
                  </Button>
                </div>
              </div>
              <div className="relative flex items-center">
                <div className="flex-grow border-t"></div>
                <span className="flex-shrink mx-4 text-muted-foreground text-xs">O</span>
                <div className="flex-grow border-t"></div>
              </div>
              <Button onClick={onCreateFamilyClick} className="w-full">
                Crear una nueva lista familiar
              </Button>
            </div>
          )}

          <Separator />

          <div className="flex flex-col gap-2">
            <Label>Proveedor de imágenes</Label>
            <div className='grid grid-cols-3 gap-2'>
                <Button 
                    variant={provider === IMAGE_PROVIDERS_MAP.google ? 'default' : 'ghost'} 
                    onClick={() => setProvider(IMAGE_PROVIDERS_MAP.google)}
                    className='border'
                >
                    Google
                </Button>
                <Button 
                    variant={provider === IMAGE_PROVIDERS_MAP.pexels ? 'default' : 'ghost'} 
                    onClick={() => setProvider(IMAGE_PROVIDERS_MAP.pexels)}
                    className='border'
                >
                    Pexels
                </Button>
                <Button 
                    variant={provider === IMAGE_PROVIDERS_MAP.pixabay ? 'default' : 'ghost'} 
                    onClick={() => setProvider(IMAGE_PROVIDERS_MAP.pixabay)}
                    className='border'
                >
                    Pixabay
                </Button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
