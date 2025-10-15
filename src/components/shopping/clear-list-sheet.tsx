'use client';

import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '@/components/ui/sheet';

type ClearListSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
};

export default function ClearListSheet({
  open,
  onOpenChange,
  onConfirm,
}: ClearListSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-2xl">
        <SheetHeader className="text-center">
          <div className="mx-auto bg-destructive/10 p-2 rounded-full w-fit">
            <AlertTriangle className="size-6 text-destructive" />
          </div>
          <SheetTitle>¿Estás seguro?</SheetTitle>
          <SheetDescription>
            Esta acción no se puede deshacer. Se eliminarán todos los
            productos de tu lista.
          </SheetDescription>
        </SheetHeader>
        <SheetFooter className="mt-6 !flex-col-reverse gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancelar
          </Button>
          <Button variant="destructive" className="!ml-0" onClick={onConfirm}>
            Vaciar Cesta
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
