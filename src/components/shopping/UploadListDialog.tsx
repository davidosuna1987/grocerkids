'use client';

import { useState, useRef, type ChangeEvent, useEffect } from 'react';
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
import { FileUp, Loader2, Camera, CircleDot } from 'lucide-react';
import { generateListFromImage } from '@/actions/shopping';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

type UploadListDialogProps = {
  addMultipleProducts: (names: string[]) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export default function UploadListDialog({
  addMultipleProducts,
  open,
  onOpenChange,
}: UploadListDialogProps) {
  const [isPending, setIsPending] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('upload');
  const [hasCameraPermission, setHasCameraPermission] = useState<
    boolean | undefined
  >(undefined);
  const streamRef = useRef<MediaStream | null>(null);

  const getCameraPermission = async () => {
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error('La cámara no es compatible con este navegador.');
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      streamRef.current = stream;
      setHasCameraPermission(true);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('Error al acceder a la cámara:', error);
      setHasCameraPermission(false);
      toast({
        variant: 'destructive',
        title: 'Acceso a la cámara denegado',
        description:
          'Por favor, activa los permisos de la cámara en los ajustes de tu navegador para usar esta función.',
      });
    }
  };

  useEffect(() => {
    if (open && activeTab === 'camera' && !preview) {
      getCameraPermission();
    } else {
      // Stop camera stream when sheet is closed or tab is switched
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
        if(videoRef.current) videoRef.current.srcObject = null;
      }
    }
    // Cleanup function
    return () => {
       if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
        if(videoRef.current) videoRef.current.srcObject = null;
      }
    };
  }, [open, activeTab, preview, toast]);
  
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
        const dataUri = canvas.toDataURL('image/jpeg');
        setPreview(dataUri);
      }
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
      await (addMultipleProducts as (names: string[]) => Promise<void>)(
        result.data
      );
      toast({
        title: '¡Éxito!',
        description: `Se han añadido ${result.data.length} productos a tu lista.`,
      });
    } else {
      setIsPending(false);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
  };
  
  const resetPreview = () => {
    setPreview(null);
    if(activeTab === 'camera') {
      getCameraPermission();
    }
  };

  const handleExited = () => {
    setPreview(null);
    setIsPending(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
    // setActiveTab('upload');
  };

  const renderContent = () => {
    if (preview) {
      return (
        <div className="space-y-4">
          <div className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg">
            <Image
              src={preview}
              alt="Vista previa de la lista"
              width={150}
              height={150}
              className="object-contain h-full w-full p-2"
            />
          </div>
          <Button variant="outline" onClick={resetPreview} disabled={isPending}>
            Hacer otra foto
          </Button>
        </div>
      );
    }

    return (
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="upload" disabled={isPending}>
            <FileUp className="mr-2 h-4 w-4" /> Subir archivo
          </TabsTrigger>
          <TabsTrigger value="camera" disabled={isPending}>
            <Camera className="mr-2 h-4 w-4" /> Cámara
          </TabsTrigger>
        </TabsList>
        <TabsContent value="upload">
          <div className="py-4">
            <Label
              htmlFor="picture-upload"
              className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted"
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <FileUp className="w-8 h-8 mb-4 text-muted-foreground" />
                <p className="mb-2 text-sm text-muted-foreground">
                  <span className="font-semibold">Haz clic para subir</span> o
                  arrastra y suelta
                </p>
                <p className="text-xs text-muted-foreground">
                  PNG, JPG o WEBP
                </p>
              </div>
              <Input
                id="picture-upload"
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
                ref={fileInputRef}
                disabled={isPending}
              />
            </Label>
          </div>
        </TabsContent>
        <TabsContent value="camera">
          <div className="py-4 space-y-4">
            <div className="relative w-full aspect-video bg-muted rounded-lg overflow-hidden flex items-center justify-center">
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                autoPlay
                muted
                playsInline
              />
              <canvas ref={canvasRef} className="hidden" />
              {hasCameraPermission === false && (
                 <Alert variant="destructive">
                    <AlertTitle>Acceso a la cámara denegado</AlertTitle>
                    <AlertDescription>
                        Habilita el acceso en tu navegador para continuar.
                    </AlertDescription>
                </Alert>
              )}
               {hasCameraPermission === undefined && <Loader2 className="h-8 w-8 animate-spin" />}
            </div>
            <Button onClick={handleCapture} disabled={!hasCameraPermission || isPending} className="w-full">
              <CircleDot className="mr-2 h-4 w-4" /> Hacer Foto
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    );
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="rounded-t-2xl"
        onTransitionEnd={!open ? handleExited : undefined}
      >
        <SheetHeader className="text-center">
          <SheetTitle>Subir una lista de la compra</SheetTitle>
          <SheetDescription>
            ¡Haz una foto de tu lista manuscrita y nosotros añadiremos los
            productos por ti!
          </SheetDescription>
        </SheetHeader>
        
        {renderContent()}
        
        {preview && (
          <SheetFooter className="flex-col-reverse sm:flex-col-reverse gap-2 mt-4">
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
        )}

      </SheetContent>
    </Sheet>
  );
}
