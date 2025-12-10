// This file is for server-side Firebase initialization (e.g., API Routes, Server Actions)
// It uses the Firebase Admin SDK for privileged operations.

import { initializeApp, getApps, App, cert } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { getAuth, Auth } from 'firebase-admin/auth';

// IMPORTANT: You must download your service account key JSON file from the
// Firebase console and place it in your project.
// For security, it's best to store the contents of the JSON file in an
// environment variable.

let firebaseApp: App;
let auth: Auth;
let firestore: Firestore;

function initializeFirebase() {
  if (!getApps().length) {
    const serviceAccountString = process.env.FIREBASE_SERVICE_ACCOUNT;
    if (!serviceAccountString) {
      throw new Error('FIREBASE_SERVICE_ACCOUNT environment variable is not set. Download it from your Firebase project settings.');
    }
    
    const serviceAccount = JSON.parse(serviceAccountString);

    firebaseApp = initializeApp({
      credential: cert(serviceAccount),
    });
    auth = getAuth(firebaseApp);
    firestore = getFirestore(firebaseApp);
  } else {
    firebaseApp = getApps()[0];
    auth = getAuth(firebaseApp);
    firestore = getFirestore(firebaseApp);
  }
  return { firebaseApp, auth, firestore };
}

export { initializeFirebase };
