'use client';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, BarChart2, FileText, ScanLine, Loader2 } from "lucide-react";
import { useUser } from "@/firebase";

const roleBasedInfo = {
  admin: {
    title: "Welcome to your Approval Center",
    description: "Review pending requests, analyze spending, and manage your organization's procurement flow.",
    actions: [
      {
        title: "Review Approvals",
        description: "View and act on pending invoices.",
        href: "/dashboard/admin",
        icon: FileText
      },
      {
        title: "View Analytics",
        description: "Analyze spending patterns.",
        href: "/dashboard/admin/analytics",
        icon: BarChart2
      }
    ]
  },
  agent: {
    title: "Ready to make a purchase?",
    description: "Scan an invoice QR code to get started or view your past requests.",
    actions: [
        {
          title: "Scan New Invoice",
          description: "Start a new payment request.",
          href: "/dashboard/agent",
          icon: ScanLine
        },
    ]
  },
  vendor: {
    title: "Welcome to your Vendor Dashboard",
    description: "Create new invoices to get paid instantly and track your transaction history.",
    actions: [
      {
        title: "Create New Invoice",
        description: "Generate a QR code for a customer.",
        href: "/dashboard/vendor",
        icon: FileText
      }
    ]
  }
};


export default function DashboardPage() {
    const { userProfile, loading } = useUser();

    if (loading || !userProfile) {
        return <div className="flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>
    }

    const info = roleBasedInfo[userProfile.role];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">{info.title}</h2>
        <p className="text-muted-foreground">{info.description}</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {info.actions.map((action) => (
          <Card key={action.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div className="space-y-1">
                <CardTitle className="text-lg">{action.title}</CardTitle>
                <CardDescription>{action.description}</CardDescription>
              </div>
              <action.icon className="h-6 w-6 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline">
                <Link href={action.href}>
                  Go <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
