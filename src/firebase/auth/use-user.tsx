'use client';
import { useState, useEffect } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { useAuth, useFirestore } from '../provider';
import type { UserProfile } from '@/lib/types';

export interface AuthState {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  error: Error | null;
}

export function useUser() {
  const auth = useAuth();
  const firestore = useFirestore();
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    userProfile: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setAuthState({ user, userProfile: null, loading: true, error: null });

      if (user) {
        try {
          const userDocRef = doc(firestore, 'users', user.uid);
          const userDoc = await getDoc(userDocRef);

          if (userDoc.exists()) {
            setAuthState({
              user,
              userProfile: userDoc.data() as UserProfile,
              loading: false,
              error: null,
            });
          } else {
             setAuthState({ user, userProfile: null, loading: false, error: new Error("User profile not found.") });
          }
        } catch (error) {
          setAuthState({
            user,
            userProfile: null,
            loading: false,
            error: error instanceof Error ? error : new Error(String(error)),
          });
        }
      } else {
        setAuthState({ user: null, userProfile: null, loading: false, error: null });
      }
    });

    return () => unsubscribe();
  }, [auth, firestore]);

  return authState;
}
