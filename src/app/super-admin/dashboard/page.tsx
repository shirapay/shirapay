'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BadgeCent, Building, Cpu, DollarSign, UserCheck } from 'lucide-react';

export default function SuperAdminDashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Platform Overview</h2>
        <p className="text-muted-foreground text-lg">
          An executive summary of ShiraPay's health and key metrics.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Volume Processed (TVP)
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₦0.00</div>
            <p className="text-xs text-muted-foreground">
              Coming Soon
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Platform Commission Earned
            </CardTitle>
            <BadgeCent className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₦0.00</div>
            <p className="text-xs text-muted-foreground">
              Coming Soon
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Organizations
            </CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              Coming Soon
            </p>
          </CardContent>
        </Card>
         <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Verified Vendors
            </CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              Coming Soon
            </p>
          </CardContent>
        </Card>
      </div>

       <div className="grid gap-6 md:grid-cols-2">
           <Card>
                <CardHeader>
                    <CardTitle>Platform Health</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                     <div className="flex items-center justify-between p-3 rounded-lg border">
                        <div>
                            <p className="font-semibold">Pending KYC Reviews</p>
                            <p className="text-sm text-muted-foreground">Vendors awaiting verification</p>
                        </div>
                        <div className="text-xl font-bold">0</div>
                    </div>
                     <div className="flex items-center justify-between p-3 rounded-lg border">
                        <div>
                            <p className="font-semibold">System Latency</p>
                            <p className="text-sm text-muted-foreground">Avg. function execution time</p>
                        </div>
                        <div className="text-xl font-bold flex items-center gap-2">
                            <Cpu className="h-5 w-5 text-muted-foreground" />
                            <span>-- ms</span>
                        </div>
                    </div>
                </CardContent>
           </Card>
           <Card>
                <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                 <CardContent className="flex items-center justify-center h-40 text-muted-foreground">
                    <p>Activity log coming soon.</p>
                </CardContent>
           </Card>
       </div>
    </div>
  );
}
