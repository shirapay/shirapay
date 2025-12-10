'use client';
import { useState, useMemo, useEffect } from 'react';
import type { Transaction, UserProfile } from '@/lib/types';
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
import { Check, X, Loader2, ShieldCheck } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useUser, useFirestore, useCollection } from '@/firebase';
import { collection, query, where, doc, updateDoc, getDoc, serverTimestamp } from 'firebase/firestore';

interface EnrichedTransaction extends Transaction {
  agentName?: string;
  vendorName?: string;
}

function TransactionCard({ transaction, onApprove, onReject, isProcessing }: { transaction: EnrichedTransaction, onApprove: (id: string) => void, onReject: (id: string, reason: string) => void, isProcessing: boolean }) {
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
                    ₦{transaction.amount.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
            {new Date(transaction.createdAt?.seconds * 1000).toLocaleString()}
        </p>
      </CardContent>
      <CardFooter className="flex justify-end gap-2">
        <Button variant="outline" className="text-red-600 hover:bg-red-50 hover:text-red-700 border-red-300 hover:border-red-400" onClick={() => setIsRejecting(true)} disabled={isProcessing}>
            <X className="mr-2 h-4 w-4"/> Reject
        </Button>
        <Button className="bg-green-600 hover:bg-green-700" onClick={handleApprove} disabled={isProcessing}>
            {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4"/>}
            Approve & Pay
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
  const { userProfile } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState<string | null>(null);

  const pendingQuery = useMemo(() => {
    if (!userProfile?.organizationId) return null;
    return query(
      collection(firestore, 'transactions'),
      where('organizationId', '==', userProfile.organizationId),
      where('status', '==', 'PENDING_APPROVAL')
    );
  }, [userProfile, firestore]);

  const { data: pendingTransactions, loading } = useCollection<Transaction>(pendingQuery);
  
  const [enrichedTransactions, setEnrichedTransactions] = useState<EnrichedTransaction[]>([]);

  useEffect(() => {
    if (pendingTransactions) {
      const enrichData = async () => {
        const enriched = await Promise.all(
          pendingTransactions.map(async (tx) => {
            let agentName = 'N/A';
            let vendorName = 'N/A';
            if (tx.agentId) {
              const agentDoc = await getDoc(doc(firestore, 'users', tx.agentId));
              if (agentDoc.exists()) {
                agentName = (agentDoc.data() as UserProfile).name;
              }
            }
            // The vendor name is already on the transaction from the agent scan step
            vendorName = tx.vendorName || 'Unknown Vendor';
            
            return { ...tx, agentName, vendorName };
          })
        );
        setEnrichedTransactions(enriched);
      };
      enrichData();
    }
  }, [pendingTransactions, firestore]);


  const handleApprove = async (id: string) => {
    if (!userProfile) return;
    setIsProcessing(id);
    try {
        const txRef = doc(firestore, 'transactions', id);
        await updateDoc(txRef, {
            status: 'PAID',
            adminId: userProfile.uid,
            paidAt: serverTimestamp(),
        });
        toast({
            title: "Transaction Approved",
            description: `Transaction has been approved and paid.`,
        });
    } catch(e: any) {
        toast({ title: "Approval Failed", description: e.message, variant: 'destructive' });
    } finally {
        setIsProcessing(null);
    }
  }

  const handleReject = async (id: string, reason: string) => {
    if (!userProfile) return;
    setIsProcessing(id);
    try {
        const txRef = doc(firestore, 'transactions', id);
        await updateDoc(txRef, {
            status: 'REJECTED',
            adminId: userProfile.uid,
            rejectionReason: reason,
        });
        toast({
            title: "Transaction Rejected",
            description: `Reason: ${reason}`,
            variant: "destructive",
        });
    } catch(e: any) {
        toast({ title: "Rejection Failed", description: e.message, variant: 'destructive' });
    } finally {
        setIsProcessing(null);
    }
  }

  if (loading) {
      return (
          <div className="flex justify-center items-center h-48">
              <Loader2 className="h-8 w-8 animate-spin" />
          </div>
      )
  }

  if (enrichedTransactions.length === 0) {
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
      {enrichedTransactions.map((transaction) => (
        <TransactionCard 
            key={transaction.id} 
            transaction={transaction} 
            onApprove={handleApprove} 
            onReject={handleReject} 
            isProcessing={isProcessing === transaction.id}
        />
      ))}
    </div>
  );
}
