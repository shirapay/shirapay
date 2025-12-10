'use client';
import { useMemo } from 'react';
import { useUser, useFirestore, useCollection } from '@/firebase';
import { collection, query, where, orderBy, limit } from 'firebase/firestore';
import type { Transaction } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Loader2, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

const statusColors: { [key in Transaction['status']]: string } = {
    PAID: "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/50 dark:text-green-300 dark:border-green-700",
    PENDING_APPROVAL: "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/50 dark:text-yellow-300 dark:border-yellow-700",
    REJECTED: "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/50 dark:text-red-300 dark:border-red-700",
    CREATED: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/50 dark:text-blue-300 dark:border-blue-700",
    SCANNED: "bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-900/50 dark:text-indigo-300 dark:border-indigo-700"
};

export function RecentInvoices() {
  const { user } = useUser();
  const firestore = useFirestore();

  const recentQuery = useMemo(() => {
    if (!user) return null;
    return query(
      collection(firestore, 'transactions'),
      where('vendorId', '==', user.uid),
      orderBy('createdAt', 'desc'),
      limit(5)
    );
  }, [user, firestore]);

  const { data: transactions, loading } = useCollection<Transaction>(recentQuery);

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
            <div>
                <CardTitle>Recent Invoices</CardTitle>
                <CardDescription>Your 5 most recent invoices.</CardDescription>
            </div>
             <Button variant="outline" asChild>
                <Link href="/dashboard/vendor/history">View All <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <div className="space-y-4">
            {transactions && transactions.length > 0 ? (
              transactions.map((tx) => (
                <div key={tx.id} className="flex justify-between items-center p-3 rounded-lg border bg-card">
                  <div>
                    <p className="font-semibold">₦{tx.amount.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                    <p className="text-sm text-muted-foreground truncate max-w-[200px] sm:max-w-sm">{tx.description}</p>
                    <p className="text-xs text-muted-foreground">{new Date(tx.createdAt?.seconds * 1000).toLocaleString()}</p>
                  </div>
                  <Badge className={cn("border", statusColors[tx.status])}>
                    {tx.status.replace('_', ' ')}
                  </Badge>
                </div>
              ))
            ) : (
              <p className="text-center text-muted-foreground py-8">No recent invoices found.</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
