'use client';

import { useState, useRef, type ChangeEvent } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
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
        title: 'Oh no! Something went wrong.',
        description: result.error,
      });
      setIsPending(false);
    } else if (result.data) {
      handleClose();
      await (addMultipleProducts as (names: string[]) => Promise<void>)(result.data);
      toast({
        title: 'Success!',
        description: `Added ${result.data.length} items to your list.`,
      });
      setIsPending(false);
    } else {
        setIsPending(false);
    }
  };

  const handleClose = () => {
    setPreview(null);
    setFile(null);
    if(fileInputRef.current) fileInputRef.current.value = "";
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]" onInteractOutside={(e) => { if(!isPending) e.preventDefault()}} onCloseAutoFocus={handleClose}>
        <DialogHeader>
          <DialogTitle>Upload a Shopping List</DialogTitle>
          <DialogDescription>
            Take a picture of your handwritten list and we&apos;ll add the items for you!
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Label
            htmlFor="picture-upload"
            className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted"
          >
            {preview ? (
              <Image src={preview} alt="List preview" width={150} height={150} className="object-contain h-full w-full" />
            ) : (
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <FileUp className="w-8 h-8 mb-4 text-muted-foreground" />
                <p className="mb-2 text-sm text-muted-foreground">
                  <span className="font-semibold">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-muted-foreground">PNG, JPG, or WEBP</p>
              </div>
            )}
            <Input id="picture-upload" type="file" className="hidden" accept="image/*" onChange={handleFileChange} ref={fileInputRef} disabled={isPending}/>
          </Label>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isPending}>
            Cancel
          </Button>
          <Button onClick={handleGenerate} disabled={!preview || isPending}>
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              'Generate List'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}