import { AnalyticsDashboard } from "@/components/dashboard/admin/analytics-dashboard";

export default function AdminAnalyticsPage() {
  return (
    <div className="space-y-6">
       <div>
        <h2 className="text-2xl font-bold tracking-tight">Spending Analytics</h2>
        <p className="text-muted-foreground">
          Analyze spending patterns across your organization.
        </p>
      </div>
      <div className="space-y-4">
        <AnalyticsDashboard />
      </div>
    </div>
  );
}
