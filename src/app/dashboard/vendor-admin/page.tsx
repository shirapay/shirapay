'use client';
import { useUser } from "@/firebase";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { StaffApprovalQueue } from "@/components/dashboard/admin/staff-approval-queue";
import { Separator } from "@/components/ui/separator";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { DollarSign, Users } from "lucide-react";

export default function VendorAdminDashboardPage() {
    const { userProfile, loading } = useUser();
    const router = useRouter();

    if (loading) {
        return (
          <div className="flex min-h-dvh items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        );
    }

    if (userProfile && userProfile.role !== 'vendor_admin') {
        router.push('/dashboard');
        return null;
    }

  return (
    <div className="space-y-6">
       <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₦0.00</div>
            <p className="text-xs text-muted-foreground">
              Analytics coming soon
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Staff</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              Analytics coming soon
            </p>
          </CardContent>
        </Card>
      </div>

      <Separator />

       <div>
        <h2 className="text-2xl font-bold tracking-tight">Vendor Staff Management</h2>
        <p className="text-muted-foreground">
          Approve or reject new staff members who want to join your business.
        </p>
      </div>
      <StaffApprovalQueue adminRole="vendor_admin" />
    </div>
  );
}
