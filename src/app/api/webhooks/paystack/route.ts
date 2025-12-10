import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { initializeFirebase } from '@/firebase/server';
import { doc, updateDoc, serverTimestamp, getDocs, collection, query, where } from 'firebase/firestore';

/**
 * This is the webhook handler for Paystack events.
 * It listens for transfer status updates and updates the corresponding transaction in Firestore.
 *
 * To use this, you must:
 * 1. Set your Paystack Webhook URL in the Paystack Dashboard to:
 *    https://shirapay.vercel.app/api/webhooks/paystack
 * 2. Set the PAYSTACK_WEBHOOK_SECRET in your environment variables.
 */
export async function POST(request: Request) {
  const paystackSecret = process.env.PAYSTACK_WEBHOOK_SECRET;

  if (!paystackSecret) {
    console.error('Paystack webhook secret is not set.');
    return NextResponse.json({ message: 'Server configuration error.' }, { status: 500 });
  }

  const signature = request.headers.get('x-paystack-signature');
  const body = await request.text();

  // Verify the webhook signature
  const hash = crypto.createHmac('sha512', paystackSecret).update(body).digest('hex');

  if (hash !== signature) {
    console.warn('Invalid Paystack webhook signature received.');
    return NextResponse.json({ message: 'Invalid signature' }, { status: 401 });
  }

  const event = JSON.parse(body);
  const { firestore } = initializeFirebase();

  try {
    const reference = event.data?.reference;
    if (!reference) {
        console.log('Webhook received without a reference.', event);
        return NextResponse.json({ status: 'ok', message: 'Webhook received, but no reference found.' });
    }
    
    // Find the transaction by the paystackReferenceId
    const q = query(collection(firestore, "transactions"), where("paystackReferenceId", "==", reference));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
        console.warn(`Webhook received for unknown reference: ${reference}`);
        return NextResponse.json({ status: 'ok', message: `Transaction with reference ${reference} not found.` });
    }
    
    const transactionDoc = querySnapshot.docs[0];
    const transactionRef = doc(firestore, 'transactions', transactionDoc.id);

    // Handle different transfer events
    if (event.event === 'transfer.success') {
      await updateDoc(transactionRef, {
        status: 'PAID',
        paidAt: serverTimestamp(),
        paymentError: null, // Clear any previous errors
      });
      console.log(`Transaction ${transactionDoc.id} marked as PAID.`);
    } else if (event.event === 'transfer.failed') {
      await updateDoc(transactionRef, {
        status: 'PAYMENT_FAILED',
        paymentError: event.data?.reason || 'Transfer failed for an unknown reason.',
      });
      console.log(`Transaction ${transactionDoc.id} marked as PAYMENT_FAILED.`);
    } else if (event.event === 'transfer.reversed') {
      await updateDoc(transactionRef, {
        status: 'PAYMENT_FAILED', // Or a new 'REVERSED' status if you add it
        paymentError: 'Payment was reversed by Paystack.',
      });
      console.log(`Transaction ${transactionDoc.id} marked as REVERSED.`);
    }

    return NextResponse.json({ status: 'success' }, { status: 200 });

  } catch (error: any) {
    console.error('Error processing Paystack webhook:', error);
    return NextResponse.json({ message: 'Internal Server Error', error: error.message }, { status: 500 });
  }
}

// Create a server-side equivalent of the initializeFirebase function
// to be used in server components and API routes.
// We can't use the client-side one because it might not have been initialized.
// This is a simplified version for server-only use.
// In a real app, you might share this logic better.
const serverInitializeFirebase = () => {
    // This is a conceptual placeholder. In a real Next.js app with server components,
    // you would initialize the Firebase Admin SDK. Since we're in a mixed environment,
    // we'll create a lightweight server-only firebase config.
    const { initializeFirebase: initAdmin } = require('@/firebase/server');
    return initAdmin();
}
