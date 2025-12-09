'use client';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  type User,
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import type { UserProfile, UserRole } from './types';

export const createAndSaveUser = async (user: User, name: string, role: UserRole) => {
  const firestore = useFirestore();
  const userProfile: UserProfile = {
    uid: user.uid,
    name,
    email: user.email!,
    role,
    organizationId: null,
    isVerified: role === 'admin', // Admins are verified by default of creating an org.
    createdAt: new Date(), // Managed by serverTimestamp on write
  };

  const userDocRef = doc(firestore, 'users', user.uid);
  
  await setDoc(userDocRef, {
      ...userProfile,
      createdAt: serverTimestamp(),
  });
  
  return userProfile;
};
