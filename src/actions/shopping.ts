'use server';

import { imageToListConversion } from '@/ai/flows/image-to-list-conversion';
import { z } from 'zod';

const imageSchema = z.object({
  photoDataUri: z.string().startsWith('data:image/'),
});

export async function generateListFromImage(formData: FormData) {
  const photoDataUri = formData.get('photoDataUri') as string;

  const validation = imageSchema.safeParse({ photoDataUri });

  if (!validation.success) {
    return { error: 'Datos de imagen no válidos. Por favor, sube un archivo de imagen válido.' };
  }

  try {
    const result = await imageToListConversion({ photoDataUri });
    if (result && result.productNames) {
      return { data: result.productNames };
    }
    return { error: 'No se pudieron extraer productos de la imagen. Prueba con una imagen más clara.' };
  } catch (error) {
    console.error('La conversión con IA ha fallado:', error);
    return { error: 'Ha ocurrido un error inesperado. Por favor, inténtalo de nuevo más tarde.' };
  }
}
