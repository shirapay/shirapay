'use client';
import { PendingApprovals } from "@/components/dashboard/admin/pending-approvals";
import { useUser } from "@/firebase";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function AdminApprovalPage() {
    const { userProfile, loading } = useUser();
    const router = useRouter();

    if (loading) {
        return (
          <div className="flex min-h-dvh items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        );
    }

    if (userProfile && userProfile.role !== 'admin') {
        router.push('/dashboard');
        return null;
    }

  return (
    <div className="space-y-6">
       <div>
        <h2 className="text-2xl font-bold tracking-tight">Pending Approvals</h2>
        <p className="text-muted-foreground">
          Review and act on the following payment requests.
        </p>
      </div>
      <PendingApprovals />
    </div>
  );
}
