'use server';

/**
 * @fileOverview Converts an image of a shopping list into a list of product names.
 *
 * - imageToListConversion - A function that handles the image to list conversion process.
 * - ImageToListConversionInput - The input type for the imageToListConversion function.
 * - ImageToListConversionOutput - The return type for the imageToListConversion function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ImageToListConversionInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a handwritten shopping list, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type ImageToListConversionInput = z.infer<
  typeof ImageToListConversionInputSchema
>;

const ImageToListConversionOutputSchema = z.object({
  productNames: z
    .array(z.string())
    .describe('An array of product names identified from the image.'),
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
    description: 'Extracts text from an image of a shopping list using OCR.',
    inputSchema: z.object({
      photoDataUri: z
        .string()
        .describe(
          "A photo of a handwritten shopping list, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
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
  prompt: `You are a helpful assistant designed to extract product names from a shopping list.

  First, use the ocrTool to extract the text from the image provided by the user.
  Then, extract the product names from the extracted text.

  Here is the image of the shopping list: {{media url=photoDataUri}}

  Return the product names as an array of strings.
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
