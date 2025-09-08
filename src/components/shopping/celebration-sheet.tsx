'use client';

import { Button } from '@/components/ui/button';
import { PartyPopper } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '@/components/ui/sheet';

type CelebrationSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onClearList: () => void;
};

export default function CelebrationSheet({
  open,
  onOpenChange,
  onClearList,
}: CelebrationSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-2xl">
        <SheetHeader className="text-center">
          <div className="mx-auto bg-primary/10 p-2 rounded-full w-fit">
            <PartyPopper className="size-6 text-primary" />
          </div>
          <SheetTitle>¡Enhorabuena!</SheetTitle>
          <SheetDescription>
            ¡Has encontrado todos los productos de tu lista! ¿Qué quieres
            hacer ahora?
          </SheetDescription>
        </SheetHeader>
        <SheetFooter className="mt-6 flex-col-reverse sm:flex-col-reverse gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cerrar
          </Button>
          <Button onClick={onClearList}>Vaciar Cesta</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
