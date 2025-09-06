'use server';

/**
 * @fileOverview Convierte una imagen de una lista de la compra en una lista de nombres de productos.
 *
 * - imageToListConversion - Una función que gestiona el proceso de conversión de imagen a lista.
 * - ImageToListConversionInput - El tipo de entrada para la función imageToListConversion.
 * - ImageToListConversionOutput - El tipo de retorno para la función imageToListConversion.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ImageToListConversionInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "Una foto de una lista de la compra manuscrita, como un URI de datos que debe incluir un tipo MIME y usar codificación Base64. Formato esperado: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type ImageToListConversionInput = z.infer<
  typeof ImageToListConversionInputSchema
>;

const ImageToListConversionOutputSchema = z.object({
  productNames: z
    .array(z.string())
    .describe('Un array de nombres de productos identificados en la imagen.'),
});
export type ImageToListConversionOutput = z.infer<
  typeof ImageToListConversionOutputSchema
>;

export async function imageToListConversion(
  input: ImageToListConversionInput
): Promise<ImageToListConversionOutput> {
  return imageToListConversionFlow(input);
}

const ocrTool = ai.defineTool(
  {
    name: 'ocrTool',
    description: 'Extrae texto de una imagen de una lista de la compra usando OCR.',
    inputSchema: z.object({
      photoDataUri: z
        .string()
        .describe(
          "Una foto de una lista de la compra manuscrita, como un URI de datos que debe incluir un tipo MIME y usar codificación Base64. Formato esperado: 'data:<mimetype>;base64,<encoded_data>'."
        ),
    }),
    outputSchema: z.string(),
  },
  async function (input) {
    const Tesseract = (await import('tesseract.js')).default;
    const worker = await Tesseract.createWorker();
    await worker.loadLanguage('eng');
    await worker.initialize('eng');
    const {data} = await worker.recognize(input.photoDataUri);
    await worker.terminate();
    return data.text;
  }
);

const extractProductNamesPrompt = ai.definePrompt({
  name: 'extractProductNamesPrompt',
  tools: [ocrTool],
  input: {schema: ImageToListConversionInputSchema},
  output: {schema: ImageToListConversionOutputSchema},
  prompt: `Eres un asistente útil diseñado para extraer nombres de productos de una lista de la compra.

  Primero, utiliza la herramienta ocrTool para extraer el texto de la imagen proporcionada por el usuario.
  Luego, extrae los nombres de los productos del texto extraído.

  Aquí tienes la imagen de la lista de la compra: {{media url=photoDataUri}}

  Devuelve los nombres de los productos como un array de strings.
  `,
});

const imageToListConversionFlow = ai.defineFlow(
  {
    name: 'imageToListConversionFlow',
    inputSchema: ImageToListConversionInputSchema,
    outputSchema: ImageToListConversionOutputSchema,
  },
  async input => {
    const {output} = await extractProductNamesPrompt(input);
    return output!;
  }
);
