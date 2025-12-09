import { PendingApprovals } from "@/components/dashboard/admin/pending-approvals";

export default function AdminApprovalPage() {
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
