'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Sparkles, FileText, Share2, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { enhanceInvoiceDescription } from '@/ai/flows/invoice-description-enhancement';
import QRCode from 'react-qr-code';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface GeneratedInvoice {
  id: string;
  amount: number;
  description: string;
  shareLink: string;
}

export function InvoiceCreator() {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [generatedInvoice, setGeneratedInvoice] = useState<GeneratedInvoice | null>(null);
  const [isPaid, setIsPaid] = useState(false);
  const { toast } = useToast();

  const handleEnhanceDescription = async () => {
    if (!description.trim()) {
      toast({ title: 'Please enter a brief description first.', variant: 'destructive' });
      return;
    }
    setIsEnhancing(true);
    try {
      const result = await enhanceInvoiceDescription({ briefDescription: description });
      setDescription(result.enhancedDescription);
      toast({ title: 'Description Enhanced!', description: 'The invoice description has been updated with AI.' });
    } catch (error) {
      toast({ title: 'Enhancement Failed', description: 'Could not enhance description.', variant: 'destructive' });
    } finally {
      setIsEnhancing(false);
    }
  };
  
  const handleGenerateInvoice = async () => {
    if(!amount || !description) {
        toast({ title: 'Missing Information', description: 'Please provide both an amount and a description.', variant: 'destructive' });
        return;
    }
    setIsGenerating(true);
    setIsPaid(false);
    //Simulate invoice creation
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const newInvoice: GeneratedInvoice = {
        id: `txn-${Math.random().toString(36).substring(2, 8)}`,
        amount: parseFloat(amount),
        description: description,
        shareLink: `${window.location.origin}/invoice/${`txn-${Math.random().toString(36).substring(2, 8)}`}`
    };

    setGeneratedInvoice(newInvoice);
    setIsGenerating(false);
    
    // Mock real-time listener for payment
    setTimeout(() => {
        setIsPaid(true);
        toast({ title: "Payment Received!", description: `Invoice ${newInvoice.id} has been paid.` });
    }, 10000); // Simulate payment after 10 seconds
  }

  const resetForm = () => {
      setAmount('');
      setDescription('');
      setGeneratedInvoice(null);
      setIsPaid(false);
  }

  if (generatedInvoice) {
    return (
      <Card className="w-full max-w-lg mx-auto text-center">
        {isPaid ? (
             <CardContent className="pt-6 flex flex-col items-center justify-center">
                <CheckCircle className="w-24 h-24 text-green-500 mb-4 animate-in fade-in zoom-in-50 duration-500" />
                <h2 className="text-2xl font-bold">Payment Received!</h2>
                <p className="text-muted-foreground">${generatedInvoice.amount.toFixed(2)} has been successfully paid.</p>
                <Button onClick={resetForm} className="mt-6">Create New Invoice</Button>
             </CardContent>
        ) : (
            <>
            <CardHeader>
                <CardTitle>Invoice Generated</CardTitle>
                <CardDescription>Share this QR code or link with the agent.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-4">
                <div className="bg-white p-4 rounded-lg">
                    <QRCode value={generatedInvoice.shareLink} size={192} />
                </div>
                <div className='text-center'>
                    <p className="font-bold text-3xl">${generatedInvoice.amount.toFixed(2)}</p>
                    <p className="text-muted-foreground text-sm max-w-xs mx-auto">{generatedInvoice.description}</p>
                    <p className="font-mono text-xs mt-2 bg-muted p-1 rounded">ID: {generatedInvoice.id}</p>
                </div>
                <div className="flex items-center space-x-2 pt-2">
                    <p className="text-sm text-muted-foreground">Waiting for payment...</p>
                    <Loader2 className="h-4 w-4 animate-spin" />
                </div>
            </CardContent>
            <CardFooter className="flex-col gap-4">
                 <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full">
                            <Share2 className="mr-2 h-4 w-4" /> Share Link
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto">
                        <div className="flex items-center gap-2">
                            <Input value={generatedInvoice.shareLink} readOnly className="flex-grow" />
                            <Button size="sm" onClick={() => navigator.clipboard.writeText(generatedInvoice.shareLink)}>Copy</Button>
                        </div>
                    </PopoverContent>
                </Popover>
                 <Button onClick={resetForm} variant="ghost">Cancel</Button>
            </CardFooter>
            </>
        )}
      </Card>
    );
  }


  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader>
        <CardTitle>Create Invoice</CardTitle>
        <CardDescription>Enter the amount and description to generate a new invoice.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-2">
          <Label htmlFor="amount">Amount ($)</Label>
          <Input id="amount" type="number" placeholder="e.g., 49.99" value={amount} onChange={e => setAmount(e.target.value)} />
        </div>
        <div className="grid gap-2">
          <div className="flex justify-between items-center">
            <Label htmlFor="description">Description</Label>
            <Button variant="ghost" size="sm" onClick={handleEnhanceDescription} disabled={isEnhancing}>
              {isEnhancing ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="mr-2 h-4 w-4 text-yellow-400" />
              )}
              Enhance with AI
            </Button>
          </div>
          <Textarea id="description" placeholder="e.g., Office lunch catering" value={description} onChange={e => setDescription(e.target.value)} />
        </div>
      </CardContent>
      <CardFooter>
        <Button className="w-full" onClick={handleGenerateInvoice} disabled={isGenerating}>
          {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileText className="mr-2 h-4 w-4" />}
          Generate Invoice
        </Button>
      </CardFooter>
    </Card>
  );
}
