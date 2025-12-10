'use server';

/**
 * @fileOverview Securely initializes a payment transfer via Paystack.
 *
 * SECURITY-CRITICAL: This flow runs on the server and is designed to handle
 * sensitive operations. It uses a secret key from environment variables and
* MUST NOT expose it to the client.
 *
 * - initializePayment - A function that triggers the payment process.
 * - InitializePaymentInput - The input type for the function.
 * - InitializePaymentOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Note on Security:
// The PAYSTACK_SECRET_KEY must be stored in your environment variables.
// For local development, create a `.env.local` file in the root of your project
// and add the following line:
// PAYSTACK_SECRET_KEY="sk_your_secret_key"
// This file is ignored by git and keeps your key safe.

const InitializePaymentInputSchema = z.object({
  transactionId: z.string().describe('The unique ID of the transaction to be paid.'),
  amount: z.number().positive().describe('The amount to be paid in Naira (NGN).'),
  // In a real implementation, you would fetch recipient details on the server
  // using the transactionId to avoid passing sensitive info from the client.
  recipientEmail: z.string().email().describe("The vendor's email for the transfer."),
});

export type InitializePaymentInput = z.infer<typeof InitializePaymentInputSchema>;

const InitializePaymentOutputSchema = z.object({
  status: z.enum(['success', 'failure']).describe('The status of the payment initiation.'),
  message: z.string().describe('A message detailing the outcome.'),
  paystackReference: z.string().optional().describe('The reference ID from Paystack if successful.'),
});

export type InitializePaymentOutput = z.infer<typeof InitializePaymentOutputSchema>;

export async function initializePayment(input: InitializePaymentInput): Promise<InitializePaymentOutput> {
  return initializePaymentFlow(input);
}

const initializePaymentFlow = ai.defineFlow(
  {
    name: 'initializePaymentFlow',
    inputSchema: InitializePaymentInputSchema,
    outputSchema: InitializePaymentOutputSchema,
  },
  async (input) => {
    const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY;

    if (!paystackSecretKey) {
      console.error('Paystack secret key is not configured.');
      // IMPORTANT: Return a structured error, don't throw, so the client can handle it.
      return {
        status: 'failure',
        message: 'Payment provider is not configured on the server. Please contact support.',
      };
    }
    
    // In a real-world scenario, you would fetch the vendor's bank details (recipient code)
    // from your database using the transactionId instead of relying on client-sent data.
    // This is a placeholder for that secure server-side lookup.
    const recipientCode = "RCP_XXXXXXXXXXXXX"; // Placeholder

    try {
        // This is a placeholder for the actual Paystack API call.
        // You would use `fetch` to make a POST request to Paystack's transfer endpoint.
        console.log(`Simulating Paystack API call for tx: ${input.transactionId}`);
        console.log(`Amount: ${input.amount} NGN`);
        console.log(`Recipient Code: ${recipientCode}`);
        
        // Example of what the fetch call would look like:
        /*
        const response = await fetch('https://api.paystack.co/transfer', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${paystackSecretKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                source: 'balance', // Or your desired source
                amount: input.amount * 100, // Paystack expects amount in kobo
                recipient: recipientCode,
                reason: `Payment for invoice ${input.transactionId}`,
            }),
        });

        const data = await response.json();

        if (!response.ok || !data.status) {
            throw new Error(data.message || 'Failed to initiate transfer with Paystack.');
        }
        
        return {
            status: 'success',
            message: data.message,
            paystackReference: data.data.reference,
        };
        */

        // Simulate a successful API call for now.
        const mockPaystackReference = `MOCK_${Date.now()}`;
        
        return {
            status: 'success',
            message: 'Payment transfer has been successfully initiated.',
            paystackReference: mockPaystackReference,
        };

    } catch (error: any) {
      console.error('Paystack API call failed:', error);
      return {
        status: 'failure',
        message: error.message || 'An unknown error occurred while processing the payment.',
      };
    }
  }
);
