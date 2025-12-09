'use client';
import { useState, useEffect } from 'react';
import { onSnapshot, doc, DocumentReference, DocumentData } from 'firebase/firestore';
import { useFirestore } from '../provider';

export function useDoc<T>(path: string, docId: string) {
  const firestore = useFirestore();
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const docRef = doc(firestore, path, docId) as DocumentReference<T>;

    const unsubscribe = onSnapshot(
      docRef,
      (snapshot) => {
        if (snapshot.exists()) {
          setData({ ...snapshot.data() as DocumentData, id: snapshot.id } as T);
        } else {
          setData(null);
        }
        setLoading(false);
      },
      (err) => {
        console.error(err);
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [firestore, path, docId]);

  return { data, loading, error };
}
