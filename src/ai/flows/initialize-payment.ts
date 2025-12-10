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
import { initializeFirebase } from '@/firebase/server';

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
      if (!paystackSecretKey || paystackSecretKey.includes("your_paystack_secret_key")) {
        console.error('Paystack secret key is not configured.');
        return {
          status: 'failure',
          message: 'Payment provider is not configured on the server. Please contact support.',
        };
      }

      // Server-side: lookup the recipient code from Firestore using the vendor's email.
      // This expects vendor user documents to include a `paystackRecipientCode` field.
      let recipientCode: string | undefined;
      try {
        const { firestore } = initializeFirebase();
        // Use the Admin SDK query to find the user by email.
        const usersQuery = firestore.collection('users').where('email', '==', input.recipientEmail).limit(1);
        const usersSnapshot = await usersQuery.get();
        if (usersSnapshot.empty) {
          return {
            status: 'failure',
            message: 'Vendor not found. Ensure the vendor has a user record in Firestore.',
          };
        }
        const vendorDoc = usersSnapshot.docs[0];
        const vendorData: any = vendorDoc.data();
        recipientCode = vendorData.paystackRecipientCode || vendorData.recipientCode || undefined;

        if (!recipientCode) {
          return {
            status: 'failure',
            message: 'Paystack recipient is not configured for this vendor. Ask the vendor (or admin) to configure a Paystack recipient code in their user profile.',
          };
        }
      } catch (err: any) {
        console.error('Error looking up vendor recipient code:', err);
        return {
          status: 'failure',
          message: 'Failed to lookup vendor recipient data. Please try again later.',
        };
      }

    try {
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
                reason: `Payment for ShiraPay invoice ${input.transactionId}`,
                // We add a reference to link the transfer back to our transaction
                reference: `SHIRAPAY_${input.transactionId}_${Date.now()}`
            }),
        });

        const data = await response.json();

        if (!response.ok || !data.status) {
            console.error('Paystack API error:', data);
            throw new Error(data.message || 'Failed to initiate transfer with Paystack.');
        }
        
        // The transfer is initiated. We now wait for the webhook to confirm the final status.
        return {
            status: 'success',
            message: data.message, // "Transfer has been queued"
            paystackReference: data.data.reference,
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
