'use client';
import { useMemo } from 'react';
import { TransactionHistoryTable } from '@/components/shared/transaction-history-table';
import { useUser, useFirestore, useCollection } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import type { Transaction } from '@/lib/types';
import { Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

export default function SuperAdminTransactionsPage() {
  const firestore = useFirestore();

  const transactionsQuery = useMemo(() => {
    return query(
      collection(firestore, 'transactions'),
      orderBy('createdAt', 'desc')
    );
  }, [firestore]);

  const { data: transactions, loading } = useCollection<Transaction>(transactionsQuery);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
             <div className="flex items-start justify-between gap-4">
                <div>
                    <CardTitle>Global Transaction Log</CardTitle>
                    <CardDescription>
                        A complete, read-only audit log of every transaction on the platform.
                    </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                    <Input placeholder="Search by ID or Reference..." className="w-64" />
                    <Button variant="outline" size="sm" disabled>
                        <Download className="mr-2 h-4 w-4" />
                        Export CSV
                    </Button>
                </div>
            </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex h-48 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <TransactionHistoryTable
              transactions={transactions || []}
              currentUserRole="super_admin"
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
