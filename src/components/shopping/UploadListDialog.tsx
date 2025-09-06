'use client';

import { useState, useRef, type ChangeEvent } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FileUp, Loader2 } from 'lucide-react';
import { generateListFromImage } from '@/actions/shopping';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';

type UploadListDialogProps = {
  addMultipleProducts: (names: string[]) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export default function UploadListDialog({ addMultipleProducts, open, onOpenChange }: UploadListDialogProps) {
  const [isPending, setIsPending] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleGenerate = async () => {
    if (!preview) return;

    setIsPending(true);
    const formData = new FormData();
    formData.append('photoDataUri', preview);

    const result = await generateListFromImage(formData);

    if (result.error) {
      toast({
        variant: 'destructive',
        title: '¡Oh, no! Algo salió mal.',
        description: result.error,
      });
      setIsPending(false);
    } else if (result.data) {
      handleClose();
      await (addMultipleProducts as (names: string[]) => Promise<void>)(result.data);
      toast({
        title: '¡Éxito!',
        description: `Se han añadido ${result.data.length} productos a tu lista.`,
      });
      setIsPending(false);
    } else {
        setIsPending(false);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
  };
  
  const handleExited = () => {
      setPreview(null);
      setFile(null);
      if(fileInputRef.current) fileInputRef.current.value = "";
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-2xl" onTransitionEnd={!open ? handleExited : undefined}>
        <SheetHeader className='text-center'>
          <SheetTitle>Subir una lista de la compra</SheetTitle>
          <SheetDescription>
            ¡Haz una foto de tu lista manuscrita y nosotros añadiremos los productos por ti!
          </SheetDescription>
        </SheetHeader>
        <div className="py-4">
          <Label
            htmlFor="picture-upload"
            className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted"
          >
            {preview ? (
              <Image src={preview} alt="Vista previa de la lista" width={150} height={150} className="object-contain h-full w-full p-2" />
            ) : (
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <FileUp className="w-8 h-8 mb-4 text-muted-foreground" />
                <p className="mb-2 text-sm text-muted-foreground">
                  <span className="font-semibold">Haz clic para subir</span> o arrastra y suelta
                </p>
                <p className="text-xs text-muted-foreground">PNG, JPG o WEBP</p>
              </div>
            )}
            <Input id="picture-upload" type="file" className="hidden" accept="image/*" onChange={handleFileChange} ref={fileInputRef} disabled={isPending}/>
          </Label>
        </div>
        <SheetFooter className="flex-col-reverse sm:flex-col-reverse gap-2">
          <Button variant="outline" onClick={handleClose} disabled={isPending}>
            Cancelar
          </Button>
          <Button onClick={handleGenerate} disabled={!preview || isPending}>
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generando...
              </>
            ) : (
              'Generar Lista'
            )}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
