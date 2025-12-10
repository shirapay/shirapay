
'use client';

import { ShiraPayLogo } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth, useUser } from "@/firebase";
import { signOut } from "firebase/auth";
import { Loader2, Mail, Hourglass } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React from "react";

export default function PendingApprovalPage() {
    const { userProfile, loading } = useUser();
    const auth = useAuth();
    const router = useRouter();

    React.useEffect(() => {
        if (!loading && userProfile && userProfile.approvalStatus !== 'PENDING') {
            router.push('/dashboard');
        }
    }, [userProfile, loading, router]);
    
    const handleLogout = async () => {
        await signOut(auth);
        router.push('/login');
    }

    if (loading || !userProfile) {
        return (
             <div className="flex min-h-dvh w-full items-center justify-center bg-muted p-4">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        )
    }

    return (
        <div className="flex min-h-dvh w-full items-center justify-center bg-muted p-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-6">
                    <Link href="/" className="inline-flex items-center gap-2">
                        <ShiraPayLogo className="h-8 w-8 text-primary" />
                        <span className="text-2xl font-bold text-primary">ShiraPay</span>
                    </Link>
                </div>
                 <Card className="shadow-md">
                    <CardHeader className="items-center text-center">
                        <div className="p-4 bg-yellow-100 rounded-full inline-block mb-4">
                            <Hourglass className="h-10 w-10 text-yellow-600"/>
                        </div>
                        <CardTitle className="text-2xl">Account Pending Approval</CardTitle>
                        <CardDescription>
                            Welcome, {userProfile.name}! Your account has been created successfully, but requires administrator approval before you can access the dashboard.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="text-center text-muted-foreground text-sm">
                        <p>An approval request has been sent to your administrator. You will be notified via email once your account has been verified.</p>
                        <p className="mt-2">If you have any questions, please contact your manager.</p>
                    </CardContent>
                    <CardFooter>
                        <Button variant="outline" className="w-full" onClick={handleLogout}>
                            Logout
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </div>
    )
}
