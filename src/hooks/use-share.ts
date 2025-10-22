import { useCallback } from "react";
import { useNativePlatform } from "@/hooks/use-native-platform";
import { toast } from "./use-toast";

type ShareOptions = {
    text: string;
    title?: string;
    successMessage?: string;
    errorMessage?: string;
};

export function useShare() {
    const { isNative } = useNativePlatform();

    const share = useCallback(async ({ text, title, successMessage, errorMessage }: ShareOptions) => {
        const toastTitle = title ?? "¡Copiado!";
        const toastSuccess = successMessage ?? "El enlace para unirse a la lista se ha copiado al portapapeles.";
        const toastError = errorMessage ?? "No se pudo copiar el enlace.";

        const handleCopy = async () => {
            try {
                if(navigator.clipboard) {
                    await navigator.clipboard.writeText(text);
                    toast({
                        title: toastTitle,
                        description: toastSuccess,
                    });
                } else {
                    throw new Error("La API de portapapeles no está disponible.");
                }
            } catch (err) {
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: toastError,
                });
            }
        }

        const handleShare = async () => {
            try {
                if (navigator.share) {
                    await navigator.share({ title: toastTitle, text });
                } else {
                    throw new Error("La API de compartir no está disponible.");
                }
            } catch (err) {
                toast({
                    variant: "destructive",
                    title: "Error al intentar compartir",
                    description: toastError,
                });

                handleCopy();
            }
        }

        isNative ? handleShare() : handleCopy();
    }, [isNative]);

    return { share };
}
