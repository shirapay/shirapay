'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { transactions as allTransactions } from '@/lib/data';
import type { Transaction } from '@/lib/types';
import { Loader2, ScanLine, Send } from 'lucide-react';
import { suggestDepartment } from '@/ai/flows/automated-department-routing';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const departments = ["Marketing", "IT/Hardware", "Office Management", "Design", "Human Resources", "Finance"];

export function ScanForm() {
  const [invoiceId, setInvoiceId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const { toast } = useToast();

  const handleScan = async () => {
    setIsLoading(true);
    setTransaction(null);
    setSelectedDepartment('');

    // Simulate API call to fetch invoice
    await new Promise(resolve => setTimeout(resolve, 1000));
    const foundTransaction = allTransactions.find(t => t.id === invoiceId && t.status === 'CREATED');

    if (foundTransaction) {
      setTransaction(foundTransaction);
      setIsLoading(false);
      setIsLoadingAi(true);
      try {
        const suggestion = await suggestDepartment({ vendor: foundTransaction.vendorName ?? 'Unknown', description: foundTransaction.description });
        setSelectedDepartment(suggestion.department);
        toast({ title: "AI Suggestion", description: `We suggest the '${suggestion.department}' department. Reason: ${suggestion.reason}` });
      } catch (error) {
        console.error("AI suggestion failed:", error);
        toast({ title: "AI Suggestion Failed", description: "Could not get an AI suggestion for the department.", variant: 'destructive' });
      } finally {
        setIsLoadingAi(false);
      }
    } else {
      setTransaction(null);
      toast({
        title: 'Invoice Not Found',
        description: 'Could not find a valid, scannable invoice with that ID.',
        variant: 'destructive',
      });
      setIsLoading(false);
    }
  };
  
  const handleRequestApproval = () => {
      if(!transaction || !selectedDepartment) return;
      
      toast({
          title: 'Request Sent!',
          description: `Invoice ${transaction.id} has been sent to the ${selectedDepartment} department for approval.`,
      });
      setTransaction(null);
      setInvoiceId('');
      setSelectedDepartment('');
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
              placeholder="e.g., txn-006"
              value={invoiceId}
              onChange={(e) => setInvoiceId(e.target.value)}
              disabled={isLoading}
            />
          </div>
          <Button onClick={handleScan} disabled={!invoiceId || isLoading}>
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
                  <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                    <SelectTrigger id="department">
                      <SelectValue placeholder="Select a department..." />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map(dep => (
                        <SelectItem key={dep} value={dep}>{dep}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {isLoadingAi && <Loader2 className="h-5 w-5 animate-spin text-primary" />}
                </div>
              </div>
            </CardContent>
            <CardFooter>
                 <Button className="w-full" onClick={handleRequestApproval} disabled={!selectedDepartment}>
                    <Send className="mr-2 h-4 w-4"/> Request Approval
                 </Button>
            </CardFooter>
          </Card>
        )}
      </CardContent>
    </Card>
  );
}
