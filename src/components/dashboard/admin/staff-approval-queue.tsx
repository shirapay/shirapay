'use client';
import { useMemo, useState } from 'react';
import { useUser, useFirestore, useCollection } from '@/firebase';
import { collection, query, where, doc, updateDoc } from 'firebase/firestore';
import type { UserProfile, UserRole } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Check, X, Loader2, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface StaffApprovalQueueProps {
    adminRole: 'org_admin' | 'vendor_admin';
}

export function StaffApprovalQueue({ adminRole }: StaffApprovalQueueProps) {
    const { userProfile } = useUser();
    const firestore = useFirestore();
    const { toast } = useToast();
    const [processingId, setProcessingId] = useState<string | null>(null);

    const targetRole: UserRole = adminRole === 'org_admin' ? 'agent_staff' : 'vendor_staff';
    const linkingField = adminRole === 'org_admin' ? 'organizationId' : 'linkedAdminId';
    const linkingValue = adminRole === 'org_admin' ? userProfile?.organizationId : userProfile?.uid;

    const pendingStaffQuery = useMemo(() => {
        if (!linkingValue) return null;
        return query(
            collection(firestore, 'users'),
            where('role', '==', targetRole),
            where(linkingField, '==', linkingValue),
            where('approvalStatus', '==', 'PENDING')
        );
    }, [firestore, targetRole, linkingField, linkingValue]);

    const { data: pendingStaff, loading } = useCollection<UserProfile>(pendingStaffQuery);

    const handleApproval = async (staffId: string, action: 'VERIFIED' | 'REJECTED') => {
        setProcessingId(staffId);
        const staffRef = doc(firestore, 'users', staffId);
        try {
            await updateDoc(staffRef, { approvalStatus: action });
            toast({
                title: `Staff ${action === 'VERIFIED' ? 'Approved' : 'Rejected'}`,
                description: `The staff member's status has been updated.`,
                variant: action === 'REJECTED' ? 'destructive' : 'default',
            });
        } catch (error: any) {
            toast({
                title: 'Update Failed',
                description: error.message || 'Could not update staff status.',
                variant: 'destructive',
            });
        } finally {
            setProcessingId(null);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Users /> Staff Approval Queue</CardTitle>
                <CardDescription>
                    Review and approve or reject pending requests from new staff members.
                </CardDescription>
            </CardHeader>
            <CardContent>
                {loading && (
                    <div className="flex justify-center items-center h-24">
                        <Loader2 className="h-6 w-6 animate-spin" />
                    </div>
                )}
                {!loading && (!pendingStaff || pendingStaff.length === 0) && (
                    <div className="text-center text-muted-foreground py-8">
                        <p>There are no pending staff requests at this time.</p>
                    </div>
                )}
                {!loading && pendingStaff && pendingStaff.length > 0 && (
                    <div className="space-y-3">
                        {pendingStaff.map((staff) => (
                            <div key={staff.uid} className="flex items-center justify-between p-3 rounded-lg border bg-background">
                                <div className="flex items-center gap-3">
                                    <Avatar>
                                        <AvatarFallback>{staff.name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="font-semibold">{staff.name}</p>
                                        <p className="text-sm text-muted-foreground">{staff.email}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                     <Button
                                        size="sm"
                                        variant="outline"
                                        className="text-red-600 hover:bg-red-50 hover:text-red-700"
                                        onClick={() => handleApproval(staff.uid, 'REJECTED')}
                                        disabled={processingId === staff.uid}
                                    >
                                        <X className="h-4 w-4 mr-1" /> Reject
                                    </Button>
                                    <Button
                                        size="sm"
                                        className="bg-green-600 hover:bg-green-700"
                                        onClick={() => handleApproval(staff.uid, 'VERIFIED')}
                                        disabled={processingId === staff.uid}
                                    >
                                        {processingId === staff.uid ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <Check className="h-4 w-4 mr-1" />
                                        )}
                                        Approve
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
