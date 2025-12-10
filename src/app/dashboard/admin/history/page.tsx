'use client';
import { useState, useMemo, useEffect } from 'react';
import { TransactionHistoryTable } from "@/components/shared/transaction-history-table";
import { useUser, useFirestore, useCollection } from "@/firebase";
import { collection, query, where, orderBy, doc, getDoc } from 'firebase/firestore';
import type { Transaction, UserProfile } from '@/lib/types';
import { Loader2 } from 'lucide-react';

interface EnrichedTransaction extends Transaction {
  agentName?: string;
  vendorName?: string;
}

export default function AdminHistoryPage() {
  const { userProfile } = useUser();
  const firestore = useFirestore();
  const [enrichedTransactions, setEnrichedTransactions] = useState<EnrichedTransaction[]>([]);

  const transactionsQuery = useMemo(() => {
    if (!userProfile?.organizationId) return null;
    return query(
      collection(firestore, 'transactions'),
      where('organizationId', '==', userProfile.organizationId),
      orderBy('createdAt', 'desc')
    );
  }, [userProfile, firestore]);

  const { data: transactions, loading } = useCollection<Transaction>(transactionsQuery);

  useEffect(() => {
    if (transactions) {
      const enrichData = async () => {
        const enriched = await Promise.all(
          transactions.map(async (tx) => {
            let agentName = 'N/A';
            if (tx.agentId) {
              const agentDoc = await getDoc(doc(firestore, 'users', tx.agentId));
              if (agentDoc.exists()) {
                agentName = (agentDoc.data() as UserProfile).name;
              }
            }
            // Vendor name is already on the transaction from the scan step
            const vendorName = tx.vendorName || 'Unknown Vendor';
            
            return { ...tx, agentName, vendorName };
          })
        );
        setEnrichedTransactions(enriched);
      };
      enrichData();
    }
  }, [transactions, firestore]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Full Transaction History</h2>
        <p className="text-muted-foreground">
          View and audit all transactions across the organization.
        </p>
      </div>
      {loading ? (
        <div className="flex justify-center items-center h-48">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <TransactionHistoryTable transactions={enrichedTransactions} currentUserRole="admin" />
      )}
    </div>
  );
}
