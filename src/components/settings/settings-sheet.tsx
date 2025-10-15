
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
import { FormEvent, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Share2, LogOut, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

type SettingsSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateFamilyClick: () => void;
  onlyFamily?: boolean;
};

export default function SettingsSheet({
  open,
  onOpenChange,
  onCreateFamilyClick,
  onlyFamily = false,
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
        try {
          await navigator.clipboard.writeText(`¡Únete a la lista "${familyName}" en Grocer Kids!\n\n${joinFamilyLink.url}`);
          toast({ title: '¡Copiado!', description: 'El enlace para unirse a la lista se ha copiado al portapapeles.' });
        } catch (error) {
          toast({
            variant: 'destructive',
            title: 'Error',
            description: 'No se pudo copiar el enlace al portapapeles.',
          });
          return;
        } 
      }
    }
  };

  const handleCopyCodeToClipboard = async () => {
    if (familyId) {
      try {
        await navigator.clipboard.writeText(`¡Únete a la lista "${familyName}" en Grocer Kids con este código!\n\n${familyId}`);
        toast({ title: '¡Copiado!', description: 'El código para unirse a la lista se ha copiado al portapapeles.' });
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'No se pudo copiar el código al portapapeles.',
        });
        return;
      } 
    }
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      handleJoinFamily();
    };
  
  const isLastMember = membersCount <= 1;
  const leaveButtonText = isLastMember ? 'Eliminar lista' : 'Abandonar lista';
  const familyCodeText = isConfirmingLeave 
    ? (isLastMember ? '¿Seguro que quieres eliminar la lista?' : '¿Seguro que quieres abandonar la lista?') 
    : `Estás en la lista: ${familyName || '...'}`;
  const LeaveIcon = isLastMember ? Trash2 : LogOut;

  const title = onlyFamily ? 'Sincronizar lista de la compra' : 'Ajustes'
  const description = onlyFamily ? undefined : 'Personaliza tu experiencia en Grocer Kids.'


  return (
    <Sheet open={open} onOpenChange={(isOpen) => {
      onOpenChange(isOpen);
      if (!isOpen) {
        setIsConfirmingLeave(false); // Reset on close
      }
    }}>
      <SheetContent side="bottom" className="rounded-t-2xl">
        <SheetHeader className="text-center">
          <SheetTitle className="-mb-2">{title}</SheetTitle>
          {!!description && <SheetDescription>{description}</SheetDescription>}
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
              {!onlyFamily && <h3 className="font-semibold text-center">Sincronizar lista de la compra</h3>}
              <form onSubmit={handleSubmit} className="space-y-2">
                <Label htmlFor="join-family">Unirse a una lista existente</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="join-family"
                    placeholder="Introduce el código de la lista"
                    value={familyIdInput}
                    onChange={(e) => setFamilyIdInput(e.target.value)}
                    disabled={isJoining}
                  />
                  <Button onClick={handleJoinFamily} className="relative" disabled={isJoining || !familyIdInput.trim()}>
                    <div className='absolute'>
                      <Loader2 className={cn(["animate-spin", {
                        "hidden": !isJoining,
                      }])} />
                    </div>
                    <span className={cn([{
                        "opacity-0": isJoining,
                      }])}>Unirse</span>
                  </Button>
                </div>
              </form>
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

          {!onlyFamily &&
            <>
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
            </>
          }
        </div>
      </SheetContent>
    </Sheet>
  );
}
