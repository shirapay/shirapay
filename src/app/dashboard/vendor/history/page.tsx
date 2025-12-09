'use client';
import { useMemo } from 'react';
import { TransactionHistoryTable } from "@/components/shared/transaction-history-table";
import { useUser, useFirestore, useCollection } from "@/firebase";
import { collection, query, where, orderBy } from 'firebase/firestore';
import type { Transaction } from "@/lib/types";
import { Loader2 } from "lucide-react";

export default function VendorHistoryPage() {
    const { user } = useUser();
    const firestore = useFirestore();

    const transactionsQuery = useMemo(() => {
        if (!user) return null;
        return query(
            collection(firestore, 'transactions'),
            where('vendorId', '==', user.uid),
            orderBy('createdAt', 'desc')
        );
    }, [user, firestore]);

    const { data: transactions, loading } = useCollection<Transaction>(transactionsQuery);

  return (
    <div className="space-y-6">
       <div>
        <h2 className="text-2xl font-bold tracking-tight">My Invoice History</h2>
        <p className="text-muted-foreground">
          A record of all invoices you have generated.
        </p>
      </div>
      {loading ? (
        <div className="flex justify-center items-center h-48">
            <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : (
         <TransactionHistoryTable transactions={transactions || []} currentUserRole="vendor" />
      )}
    </div>
  );
}
