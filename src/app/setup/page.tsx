'use client';

import * as React from 'react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { doc, writeBatch, serverTimestamp } from 'firebase/firestore';
import { Loader2, Plus, Trash2, Building } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ShiraPayLogo } from '@/components/icons';
import { useToast } from '@/hooks/use-toast';
import { useUser, useFirestore } from '@/firebase';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

const setupSchema = z.object({
  legalName: z.string().min(2, { message: 'Organization name must be at least 2 characters.' }),
  primaryContactEmail: z.string().email({ message: 'Please enter a valid email.' }),
  departments: z
    .array(
      z.object({
        name: z.string().min(1, { message: 'Department name cannot be empty.' }),
      })
    )
    .min(1, { message: 'You must add at least one department.' }),
});

type SetupFormValues = z.infer<typeof setupSchema>;

export default function SetupPage() {
  const { user, userProfile, loading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [departmentInput, setDepartmentInput] = useState('');

  const form = useForm<SetupFormValues>({
    resolver: zodResolver(setupSchema),
    defaultValues: {
      legalName: '',
      primaryContactEmail: userProfile?.email || '',
      departments: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'departments',
  });

  React.useEffect(() => {
    if (!loading) {
      if (!userProfile || userProfile.role !== 'admin') {
        router.push('/dashboard');
      }
      if (userProfile?.organizationId) {
        router.push('/dashboard/admin');
      }
    }
  }, [user, userProfile, loading, router]);

  const handleAddDepartment = () => {
    if (departmentInput.trim()) {
      // Check for duplicates
      if (fields.some(field => field.name.toLowerCase() === departmentInput.trim().toLowerCase())) {
        toast({
          title: 'Duplicate Department',
          description: 'This department name already exists.',
          variant: 'destructive',
        });
      } else {
        append({ name: departmentInput.trim() });
        setDepartmentInput('');
      }
    }
  };

  const onSubmit = async (data: SetupFormValues) => {
    if (!user) {
      toast({ title: 'You must be logged in.', variant: 'destructive' });
      return;
    }
    setIsSubmitting(true);
    
    const batch = writeBatch(firestore);

    // 1. Create a new organization document ref to get a unique ID
    const orgRef = doc(firestore, 'organizations', doc(firestore, 'organizations').id);

    // 2. Set the organization data
    batch.set(orgRef, {
      orgId: orgRef.id,
      legalName: data.legalName,
      primaryContactEmail: data.primaryContactEmail,
      departments: data.departments.map(d => d.name),
      adminUids: [user.uid],
      createdAt: serverTimestamp(),
    });

    // 3. Update the user's profile with the new organization ID
    const userRef = doc(firestore, 'users', user.uid);
    batch.update(userRef, {
      organizationId: orgRef.id,
      isVerified: true, // Admin is now fully verified
    });

    try {
      await batch.commit();
      toast({
        title: 'Organization Created!',
        description: `${data.legalName} has been set up successfully.`,
      });
      router.push('/dashboard/admin');
    } catch (error: any) {
      console.error("Error creating organization:", error);
      toast({
        title: 'Setup Failed',
        description: error.message || 'Could not create your organization. Please try again.',
        variant: 'destructive',
      });
      setIsSubmitting(false);
    }
  };

  if (loading || !userProfile || userProfile.organizationId) {
    return (
      <div className="flex h-dvh items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh w-full items-center justify-center bg-muted p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-6">
          <Link href="/" className="inline-flex items-center gap-2">
            <ShiraPayLogo className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold text-primary">ShiraPay</span>
          </Link>
        </div>

        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
                <Building className="h-6 w-6" /> Organization Setup
            </CardTitle>
            <CardDescription>
              Welcome! Let's get your organization set up to start using ShiraPay.
            </CardDescription>
          </CardHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="legalName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Organization Legal Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Acme Corporation" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="primaryContactEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Primary Contact Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="e.g., contact@acme.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div>
                   <FormLabel>Departments</FormLabel>
                   <FormDescription className="mb-2">
                    Add the departments that will approve invoices (e.g., Marketing, IT, Logistics).
                  </FormDescription>
                  <div className="flex items-start gap-2">
                    <Input
                      value={departmentInput}
                      onChange={(e) => setDepartmentInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddDepartment();
                        }
                      }}
                      placeholder="Enter a department name"
                    />
                    <Button type="button" variant="outline" onClick={handleAddDepartment}>
                      <Plus className="h-4 w-4 mr-2" /> Add
                    </Button>
                  </div>
                  {form.formState.errors.departments && (
                      <p className="text-sm font-medium text-destructive mt-2">{form.formState.errors.departments.message}</p>
                  )}
                  <div className="flex flex-wrap gap-2 mt-3">
                    {fields.map((field, index) => (
                      <Badge key={field.id} variant="secondary" className="flex items-center gap-2">
                        {field.name}
                        <button type="button" onClick={() => remove(index)} className="rounded-full hover:bg-muted-foreground/20 p-0.5">
                           <Trash2 className="h-3 w-3" />
                           <span className="sr-only">Remove {field.name}</span>
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>

              </CardContent>
              <CardFooter>
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create Organization & Proceed
                </Button>
              </CardFooter>
            </form>
          </Form>
        </Card>
      </div>
    </div>
  );
}
