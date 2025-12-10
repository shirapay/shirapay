

'use client';

import { AnalyticsDashboard } from "@/components/dashboard/admin/analytics-dashboard";
import { useUser } from "@/firebase";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function OrgAdminAnalyticsPage() {
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
        <h2 className="text-2xl font-bold tracking-tight">Spending Analytics</h2>
        <p className="text-muted-foreground">
          Filter and analyze spending patterns across your organization.
        </p>
      </div>
      <AnalyticsDashboard />
    </div>
  );
}
