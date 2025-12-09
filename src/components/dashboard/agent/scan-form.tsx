'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, ScanLine, Send } from 'lucide-react';
import { suggestDepartment } from '@/ai/flows/automated-department-routing';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useUser, useFirestore } from '@/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import type { Transaction, Organization } from '@/lib/types';


export function ScanForm() {
  const [invoiceId, setInvoiceId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [departments, setDepartments] = useState<string[]>([]);
  
  const { toast } = useToast();
  const { user, userProfile } = useUser();
  const firestore = useFirestore();

 useEffect(() => {
    if (userProfile && userProfile.organizationId) {
      const fetchOrgData = async () => {
        const orgDocRef = doc(firestore, 'organizations', userProfile.organizationId!);
        const orgDoc = await getDoc(orgDocRef);
        if (orgDoc.exists()) {
          const orgData = orgDoc.data() as Organization;
          setDepartments(orgData.departments || []);
        }
      };
      fetchOrgData();
    }
  }, [userProfile, firestore]);

  const handleScan = async () => {
    if (!invoiceId.trim()) {
      toast({ title: 'Please enter a Transaction ID.', variant: 'destructive' });
      return;
    }
    setIsLoading(true);
    setTransaction(null);
    setSelectedDepartment('');

    try {
        const transactionRef = doc(firestore, 'transactions', invoiceId.trim());
        const transactionDoc = await getDoc(transactionRef);

        if (!transactionDoc.exists()) {
            toast({ title: 'Invoice Not Found', description: 'No invoice with this ID could be found.', variant: 'destructive' });
            return;
        }
        
        const fetchedTransaction = { id: transactionDoc.id, ...transactionDoc.data() } as Transaction;

        if (fetchedTransaction.status !== 'CREATED') {
            toast({ title: 'Invoice Already Processed', description: 'This invoice has already been scanned or paid.', variant: 'destructive' });
            return;
        }

        // Fetch vendor name
        if (fetchedTransaction.vendorId) {
            const vendorRef = doc(firestore, 'users', fetchedTransaction.vendorId);
            const vendorDoc = await getDoc(vendorRef);
            if (vendorDoc.exists()) {
                fetchedTransaction.vendorName = vendorDoc.data().name;
            }
        }
        
        setTransaction(fetchedTransaction);
        
        // AI Suggestion
        setIsLoadingAi(true);
        try {
            const suggestion = await suggestDepartment({ vendor: fetchedTransaction.vendorName ?? 'Unknown', description: fetchedTransaction.description });
            if (departments.includes(suggestion.department)) {
                setSelectedDepartment(suggestion.department);
                toast({ title: "AI Suggestion", description: `We suggest the '${suggestion.department}' department. Reason: ${suggestion.reason}` });
            } else {
                 toast({ title: "AI Suggestion", description: `AI suggested '${suggestion.department}', but it's not a valid option for your organization.` });
            }
        } catch (error) {
            console.error("AI suggestion failed:", error);
            toast({ title: "AI Suggestion Failed", description: "Could not get an AI suggestion for the department.", variant: 'default' });
        } finally {
            setIsLoadingAi(false);
        }

    } catch (error: any) {
        console.error("Error fetching transaction:", error);
        toast({ title: 'Error', description: error.message || 'An error occurred while fetching the invoice.', variant: 'destructive' });
    } finally {
        setIsLoading(false);
    }
  };
  
  const handleRequestApproval = async () => {
      if(!transaction || !selectedDepartment || !user) {
          toast({ title: 'Missing Information', description: 'Please select a department before submitting.', variant: 'destructive' });
          return;
      }
      setIsSubmitting(true);
      try {
        const transactionRef = doc(firestore, 'transactions', transaction.id);
        await updateDoc(transactionRef, {
            status: 'PENDING_APPROVAL',
            department: selectedDepartment,
            agentId: user.uid,
        });

        toast({
            title: 'Request Sent!',
            description: `Invoice ${transaction.id} has been sent to the ${selectedDepartment} department for approval.`,
        });
        
        // Reset state
        setTransaction(null);
        setInvoiceId('');
        setSelectedDepartment('');

      } catch (error: any) {
          console.error("Error submitting for approval:", error);
          toast({ title: 'Submission Failed', description: error.message || 'Could not submit for approval.', variant: 'destructive' });
      } finally {
          setIsSubmitting(false);
      }
  }

  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader>
        <CardTitle>Scan Invoice</CardTitle>
        <CardDescription>Enter the Transaction ID from the vendor's QR code to fetch invoice details.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-end gap-2">
          <div className="flex-grow grid gap-2">
            <Label htmlFor="invoice-id">Transaction ID</Label>
            <Input
              id="invoice-id"
              placeholder="Enter Transaction ID..."
              value={invoiceId}
              onChange={(e) => setInvoiceId(e.target.value)}
              disabled={isLoading || isSubmitting}
            />
          </div>
          <Button onClick={handleScan} disabled={!invoiceId || isLoading || isSubmitting}>
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ScanLine className="h-4 w-4" />}
            <span className="ml-2">Fetch</span>
          </Button>
        </div>

        {transaction && (
          <Card className="bg-muted/50">
            <CardHeader>
                <CardTitle>${transaction.amount.toFixed(2)}</CardTitle>
                <CardDescription>From: {transaction.vendorName ?? 'Unknown'}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p><strong>Description:</strong> {transaction.description}</p>
              <div className="grid gap-2">
                <Label htmlFor="department">Approving Department</Label>
                <div className="flex items-center gap-2">
                   <Select value={selectedDepartment} onValueChange={setSelectedDepartment} disabled={isSubmitting || departments.length === 0}>
                    <SelectTrigger id="department">
                      <SelectValue placeholder={departments.length > 0 ? "Select a department..." : "No departments found"} />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map(dep => (
                        <SelectItem key={dep} value={dep}>{dep}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {isLoadingAi && <Loader2 className="h-5 w-5 animate-spin text-primary" />}
                </div>
                 {departments.length === 0 && <p className="text-xs text-destructive">No departments are configured for your organization.</p>}
              </div>
            </CardContent>
            <CardFooter>
                 <Button className="w-full" onClick={handleRequestApproval} disabled={!selectedDepartment || isSubmitting}>
                    {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4"/>}
                    Request Approval
                 </Button>
            </CardFooter>
          </Card>
        )}
      </CardContent>
    </Card>
  );
}
