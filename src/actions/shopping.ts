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
    return { error: 'Invalid image data. Please upload a valid image file.' };
  }

  try {
    const result = await imageToListConversion({ photoDataUri });
    if (result && result.productNames) {
      return { data: result.productNames };
    }
    return { error: 'Could not extract any products from the image. Try a clearer picture.' };
  } catch (error) {
    console.error('AI conversion failed:', error);
    return { error: 'An unexpected error occurred. Please try again later.' };
  }
}
