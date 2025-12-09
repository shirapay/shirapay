'use server';

/**
 * @fileOverview Automatically suggests the most appropriate department for invoice approval based on the vendor and description.
 *
 * - suggestDepartment - A function that suggests the department for approval.
 * - SuggestDepartmentInput - The input type for the suggestDepartment function.
 * - SuggestDepartmentOutput - The return type for the suggestDepartment function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestDepartmentInputSchema = z.object({
  vendor: z.string().describe('The name of the vendor.'),
  description: z.string().describe('The description of the invoice.'),
});

export type SuggestDepartmentInput = z.infer<typeof SuggestDepartmentInputSchema>;

const SuggestDepartmentOutputSchema = z.object({
  department: z.string().describe('The suggested department for approval.'),
  reason: z.string().describe('The reason for suggesting this department.'),
});

export type SuggestDepartmentOutput = z.infer<typeof SuggestDepartmentOutputSchema>;

export async function suggestDepartment(input: SuggestDepartmentInput): Promise<SuggestDepartmentOutput> {
  return suggestDepartmentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestDepartmentPrompt',
  input: {schema: SuggestDepartmentInputSchema},
  output: {schema: SuggestDepartmentOutputSchema},
  prompt: `You are an AI assistant that suggests the most appropriate department for invoice approval.

  Given the vendor name and invoice description, determine which department should approve the invoice.
  Your response should contain the 'department' and a brief 'reason' for your suggestion.

  Vendor: {{{vendor}}}
  Description: {{{description}}}

  Department Suggestion:`,
});

const suggestDepartmentFlow = ai.defineFlow(
  {
    name: 'suggestDepartmentFlow',
    inputSchema: SuggestDepartmentInputSchema,
    outputSchema: SuggestDepartmentOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
