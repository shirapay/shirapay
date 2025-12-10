'use client';
import { useMemo, useState } from 'react';
import { useFirestore, useCollection } from '@/firebase';
import { collection, query, where, doc, updateDoc, orderBy } from 'firebase/firestore';
import type { UserProfile } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Check, X, Loader2, ShieldQuestion } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

export default function KycManagementPage() {
    const firestore = useFirestore();
    const { toast } = useToast();
    const [processingId, setProcessingId] = useState<string | null>(null);

    const pendingKycQuery = useMemo(() => {
        return query(
            collection(firestore, 'users'),
            where('kycStatus', '==', 'PENDING'),
            orderBy('createdAt', 'desc')
        );
    }, [firestore]);

    const { data: pendingUsers, loading } = useCollection<UserProfile>(pendingKycQuery);

    const handleKycAction = async (userId: string, action: 'VERIFIED' | 'REJECTED') => {
        setProcessingId(userId);
        const userRef = doc(firestore, 'users', userId);
        try {
            await updateDoc(userRef, { kycStatus: action });
            toast({
                title: `KYC ${action === 'VERIFIED' ? 'Approved' : 'Rejected'}`,
                description: `The user's KYC status has been updated.`,
                variant: action === 'REJECTED' ? 'destructive' : 'default',
            });
        } catch (error: any) {
            toast({
                title: 'Update Failed',
                description: error.message || 'Could not update KYC status.',
                variant: 'destructive',
            });
        } finally {
            setProcessingId(null);
        }
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><ShieldQuestion /> KYC Review Queue</CardTitle>
                    <CardDescription>
                        Review and approve or reject pending KYC submissions from new vendors.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="rounded-lg border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>User</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead>Submitted</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading && (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-24 text-center">
                                        <Loader2 className="mx-auto h-6 w-6 animate-spin" />
                                    </TableCell>
                                </TableRow>
                            )}
                            {!loading && (!pendingUsers || pendingUsers.length === 0) && (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                                        The KYC review queue is empty.
                                    </TableCell>
                                </TableRow>
                            )}
                            {!loading && pendingUsers && pendingUsers.length > 0 && (
                                pendingUsers.map((user) => (
                                    <TableRow key={user.uid}>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <Avatar>
                                                    <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="font-semibold">{user.name}</p>
                                                    <p className="text-sm text-muted-foreground">{user.email}</p>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline">{user.role}</Badge>
                                        </TableCell>
                                        <TableCell>
                                            {user.createdAt ? new Date(user.createdAt.seconds * 1000).toLocaleDateString() : 'N/A'}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="text-red-600 hover:bg-red-50 hover:text-red-700"
                                                    onClick={() => handleKycAction(user.uid, 'REJECTED')}
                                                    disabled={processingId === user.uid}
                                                >
                                                    <X className="h-4 w-4 mr-1" /> Reject
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    className="bg-green-600 hover:bg-green-700"
                                                    onClick={() => handleKycAction(user.uid, 'VERIFIED')}
                                                    disabled={processingId === user.uid}
                                                >
                                                    {processingId === user.uid ? (
                                                        <Loader2 className="h-4 w-4 animate-spin" />
                                                    ) : (
                                                        <Check className="h-4 w-4 mr-1" />
                                                    )}
                                                    Approve
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
