'use client';
import { useState } from 'react';
import { transactions as allTransactions } from '@/lib/data';
import type { Transaction } from '@/lib/types';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RejectionDialog } from './rejection-dialog';
import { Check, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

function TransactionCard({ transaction, onApprove, onReject }: { transaction: Transaction, onApprove: (id: string) => void, onReject: (id: string, reason: string) => void }) {
  const [isRejecting, setIsRejecting] = useState(false);

  const handleApprove = () => {
    onApprove(transaction.id);
  }

  const handleReject = (reason: string) => {
    onReject(transaction.id, reason);
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
            <div>
                 <CardTitle className="text-2xl font-bold">
                    ${transaction.amount.toFixed(2)}
                </CardTitle>
                <CardDescription>From: {transaction.vendorName ?? 'Unknown Vendor'}</CardDescription>
            </div>
            <Badge variant="secondary">{transaction.department}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          <strong>Description:</strong> {transaction.description}
        </p>
        <p className="text-sm text-muted-foreground mt-2">
          <strong>Requested by:</strong> {transaction.agentName ?? 'Unknown Agent'}
        </p>
         <p className="text-xs text-muted-foreground mt-2">
            {new Date(transaction.createdAt).toLocaleString()}
        </p>
      </CardContent>
      <CardFooter className="flex justify-end gap-2">
        <Button variant="outline" className="text-red-600 hover:bg-red-50 hover:text-red-700" onClick={() => setIsRejecting(true)}>
            <X className="mr-2 h-4 w-4"/> Reject
        </Button>
        <Button className="bg-green-600 hover:bg-green-700" onClick={handleApprove}>
            <Check className="mr-2 h-4 w-4"/> Approve & Pay
        </Button>
      </CardFooter>
      <RejectionDialog
        isOpen={isRejecting}
        onClose={() => setIsRejecting(false)}
        onConfirm={handleReject}
      />
    </Card>
  );
}


export function PendingApprovals() {
  const pending = allTransactions.filter((t) => t.status === 'PENDING_APPROVAL');
  const [pendingTransactions, setPendingTransactions] = useState(pending);
  const { toast } = useToast();

  const handleApprove = (id: string) => {
    setPendingTransactions(current => current.filter(t => t.id !== id));
    toast({
        title: "Transaction Approved",
        description: `Transaction ${id} has been approved and paid.`,
    });
  }

  const handleReject = (id: string, reason: string) => {
    setPendingTransactions(current => current.filter(t => t.id !== id));
     toast({
        title: "Transaction Rejected",
        description: `Reason: ${reason}`,
        variant: "destructive",
    });
  }

  if (pendingTransactions.length === 0) {
    return (
        <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-12 text-center">
            <ShieldCheck className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">All Clear!</h3>
            <p className="mt-2 text-sm text-muted-foreground">There are no pending approvals at this time.</p>
        </div>
    )
  }

  return (
    <div className="space-y-4">
      {pendingTransactions.map((transaction) => (
        <TransactionCard key={transaction.id} transaction={transaction} onApprove={handleApprove} onReject={handleReject} />
      ))}
    </div>
  );
}
