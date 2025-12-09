'use server';

/**
 * @fileOverview Enhances a brief invoice description using AI to create a more detailed and professional description.
 *
 * - enhanceInvoiceDescription - A function that takes a short description and returns an enhanced version.
 * - EnhanceInvoiceDescriptionInput - The input type for the enhanceInvoiceDescription function.
 * - EnhanceInvoiceDescriptionOutput - The return type for the enhanceInvoiceDescription function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const EnhanceInvoiceDescriptionInputSchema = z.object({
  briefDescription: z
    .string()
    .describe('A brief description of the invoice item or service.'),
});
export type EnhanceInvoiceDescriptionInput = z.infer<
  typeof EnhanceInvoiceDescriptionInputSchema
>;

const EnhanceInvoiceDescriptionOutputSchema = z.object({
  enhancedDescription: z
    .string()
    .describe('A detailed and professional description of the invoice item or service.'),
});
export type EnhanceInvoiceDescriptionOutput = z.infer<
  typeof EnhanceInvoiceDescriptionOutputSchema
>;

export async function enhanceInvoiceDescription(
  input: EnhanceInvoiceDescriptionInput
): Promise<EnhanceInvoiceDescriptionOutput> {
  return enhanceInvoiceDescriptionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'enhanceInvoiceDescriptionPrompt',
  input: {schema: EnhanceInvoiceDescriptionInputSchema},
  output: {schema: EnhanceInvoiceDescriptionOutputSchema},
  prompt: `You are an AI assistant designed to enhance brief invoice descriptions into more detailed and professional versions.

  Given the following brief description, please create a more detailed and professional description suitable for an invoice.

  Brief Description: {{{briefDescription}}}

  Enhanced Description:`,
});

const enhanceInvoiceDescriptionFlow = ai.defineFlow(
  {
    name: 'enhanceInvoiceDescriptionFlow',
    inputSchema: EnhanceInvoiceDescriptionInputSchema,
    outputSchema: EnhanceInvoiceDescriptionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
