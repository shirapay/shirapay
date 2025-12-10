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

export default function OrgAdminHistoryPage() {
  const { userProfile } = useUser();
  const firestore = useFirestore();
  const [enrichedTransactions, setEnrichedTransactions] = useState<EnrichedTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const transactionsQuery = useMemo(() => {
    if (!userProfile?.organizationId) return null;
    return query(
      collection(firestore, 'transactions'),
      where('organizationId', '==', userProfile.organizationId),
      orderBy('createdAt', 'desc')
    );
  }, [userProfile, firestore]);

  const { data: transactions, loading: collectionLoading } = useCollection<Transaction>(transactionsQuery);

  useEffect(() => {
    if (collectionLoading) {
      setIsLoading(true);
      return;
    }
    if (transactions) {
      if (transactions.length === 0) {
        setEnrichedTransactions([]);
        setIsLoading(false);
        return;
      }

      const enrichData = async () => {
        setIsLoading(true);
        const uniqueUserIds = new Set<string>();
        transactions.forEach(tx => {
            if (tx.agentId) uniqueUserIds.add(tx.agentId);
        });

        const userProfiles = new Map<string, UserProfile>();
        for (const userId of uniqueUserIds) {
            if (!userProfiles.has(userId)) {
                const userDoc = await getDoc(doc(firestore, 'users', userId));
                if (userDoc.exists()) {
                    userProfiles.set(userId, userDoc.data() as UserProfile);
                }
            }
        }
        
        const enriched = transactions.map(tx => {
            const agentName = tx.agentId ? userProfiles.get(tx.agentId)?.name : undefined;
            // Vendor name is already on the transaction from the scan step
            const vendorName = tx.vendorName || 'Unknown Vendor';
            
            return { ...tx, agentName, vendorName };
          });

        setEnrichedTransactions(enriched);
        setIsLoading(false);
      };
      enrichData();
    } else {
        setIsLoading(false);
    }
  }, [transactions, firestore, collectionLoading]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Full Transaction History</h2>
        <p className="text-muted-foreground">
          View and audit all transactions across the organization.
        </p>
      </div>
      {isLoading ? (
        <div className="flex justify-center items-center h-48">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <TransactionHistoryTable transactions={enrichedTransactions} currentUserRole="org_admin" />
      )}
    </div>
  );
}
