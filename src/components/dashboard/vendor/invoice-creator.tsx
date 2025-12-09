'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Sparkles, QrCode, Share2, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { enhanceInvoiceDescription } from '@/ai/flows/invoice-description-enhancement';
import QRCode from 'react-qr-code';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useUser, useFirestore } from '@/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';


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
  const { user, userProfile } = useUser();
  const firestore = useFirestore();

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
    if (!user || !userProfile) {
        toast({ title: 'Authentication Error', description: 'You must be logged in to create an invoice.', variant: 'destructive' });
        return;
    }
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
        toast({ title: 'Invalid Amount', description: 'Please enter a valid positive number for the amount.', variant: 'destructive' });
        return;
    }
    if(!description.trim()) {
        toast({ title: 'Missing Description', description: 'Please provide a description.', variant: 'destructive' });
        return;
    }
    setIsGenerating(true);
    setIsPaid(false);
    
    try {
        const newTransactionRef = await addDoc(collection(firestore, "transactions"), {
            amount: numericAmount,
            description: description,
            vendorId: user.uid,
            status: "CREATED",
            organizationId: userProfile.organizationId,
            createdAt: serverTimestamp(),
        });
        
        const newInvoice: GeneratedInvoice = {
            id: newTransactionRef.id,
            amount: numericAmount,
            description: description,
            shareLink: `${window.location.origin}/invoice/${newTransactionRef.id}`
        };

        setGeneratedInvoice(newInvoice);

    } catch (error: any) {
        console.error("Invoice creation failed: ", error);
        toast({ title: 'Invoice Creation Failed', description: error.message || "Could not create the invoice in Firestore.", variant: 'destructive' });
    } finally {
        setIsGenerating(false);
    }
  }

  const resetForm = () => {
      setAmount('');
      setDescription('');
      setGeneratedInvoice(null);
      setIsPaid(false);
  }

  if (generatedInvoice) {
    return (
      <Card className="w-full max-w-md mx-auto text-center shadow-md">
        {isPaid ? (
             <CardContent className="pt-6 flex flex-col items-center justify-center">
                <CheckCircle className="w-24 h-24 text-green-500 mb-4 animate-in fade-in zoom-in-50 duration-500" />
                <h2 className="text-2xl font-bold text-primary">Payment Received!</h2>
                <p className="text-muted-foreground">${generatedInvoice.amount.toFixed(2)} has been successfully paid.</p>
                <Button onClick={resetForm} className="mt-6 w-full">Create New Invoice</Button>
             </CardContent>
        ) : (
            <>
            <CardHeader className="text-center">
                <CardTitle className="text-primary text-2xl">Share Invoice</CardTitle>
                <CardDescription>Present this QR code or link to the agent to get paid.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-4">
                <div className="bg-white p-4 rounded-lg border shadow-sm">
                    <QRCode value={generatedInvoice.shareLink} size={220} />
                </div>
                <div className='text-center space-y-2'>
                    <p className="font-bold text-4xl text-primary">${generatedInvoice.amount.toFixed(2)}</p>
                    <p className="text-muted-foreground text-base max-w-xs mx-auto">{generatedInvoice.description}</p>
                    <p className="font-mono text-sm pt-2 text-muted-foreground bg-muted p-1.5 rounded-md inline-block">ID: {generatedInvoice.id}</p>
                </div>
                <div className="flex items-center space-x-2 pt-4">
                    <p className="text-sm font-medium text-yellow-600">Waiting for agent to scan...</p>
                    <Loader2 className="h-4 w-4 animate-spin text-yellow-600" />
                </div>
            </CardContent>
            <CardFooter className="flex-col gap-3 pt-4">
                 <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full">
                            <Share2 className="mr-2 h-4 w-4" /> Share Link
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto">
                        <div className="flex items-center gap-2">
                            <Input value={generatedInvoice.shareLink} readOnly className="flex-grow" />
                            <Button size="sm" onClick={() => {
                                navigator.clipboard.writeText(generatedInvoice.shareLink);
                                toast({ title: "Copied!", description: "Share link copied to clipboard." });
                            }}>Copy</Button>
                        </div>
                    </PopoverContent>
                </Popover>
                 <Button onClick={resetForm} variant="ghost" className="w-full">Cancel</Button>
            </CardFooter>
            </>
        )}
      </Card>
    );
  }


  return (
    <Card className="w-full max-w-lg mx-auto shadow-md">
      <CardHeader>
        <CardTitle className="text-primary text-2xl">Create New Invoice</CardTitle>
        <CardDescription>Enter the amount and description to generate a unique payment code.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-2 relative">
          <Label htmlFor="amount" className="text-base">Amount</Label>
          <span className="absolute left-3 bottom-2 text-2xl text-muted-foreground">$</span>
          <Input 
            id="amount" 
            type="number" 
            placeholder="0.00" 
            value={amount} 
            onChange={e => setAmount(e.target.value)} 
            className="text-4xl h-16 pl-10 font-bold"
            inputMode='decimal'
          />
        </div>
        <div className="grid gap-2">
          <div className="flex justify-between items-center">
            <Label htmlFor="description" className="text-base">Description</Label>
            <Button variant="ghost" size="sm" onClick={handleEnhanceDescription} disabled={isEnhancing}>
              {isEnhancing ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="mr-2 h-4 w-4 text-yellow-400" />
              )}
              Enhance with AI
            </Button>
          </div>
          <Textarea 
            id="description" 
            placeholder="e.g., Office lunch catering, software license, etc." 
            value={description} 
            onChange={e => setDescription(e.target.value)}
            className="min-h-[100px] text-base"
          />
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          className="w-full h-12 text-base font-semibold bg-accent text-accent-foreground hover:bg-accent/90" 
          onClick={handleGenerateInvoice} 
          disabled={isGenerating}
        >
          {isGenerating ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <QrCode className="mr-2 h-5 w-5" />}
          Generate Payment Code
        </Button>
      </CardFooter>
    </Card>
  );
}
