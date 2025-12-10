'use client';
import { PendingApprovals } from "@/components/dashboard/admin/pending-approvals";
import { useUser } from "@/firebase";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { StaffApprovalQueue } from "@/components/dashboard/admin/staff-approval-queue";
import { Separator } from "@/components/ui/separator";

export default function OrgAdminDashboardPage() {
    const { userProfile, loading } = useUser();
    const router = useRouter();

    if (loading) {
        return (
          <div className="flex min-h-dvh items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        );
    }

    if (userProfile && userProfile.role !== 'org_admin') {
        router.push('/dashboard');
        return null;
    }

  return (
    <div className="space-y-6">
       <div>
        <h2 className="text-2xl font-bold tracking-tight">Agent Staff Management</h2>
        <p className="text-muted-foreground">
          Approve or reject new agents joining your organization.
        </p>
      </div>
      <StaffApprovalQueue adminRole="org_admin" />

      <Separator className="my-8" />
      
       <div>
        <h2 className="text-2xl font-bold tracking-tight">Pending Payment Approvals</h2>
        <p className="text-muted-foreground">
          Review and act on the following payment requests from your agents.
        </p>
      </div>
      <PendingApprovals />
    </div>
  );
}
