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
import { ArrowRight, BarChart2, FileText, ScanLine, Loader2, ShieldCheck, Activity } from "lucide-react";
import { useUser } from "@/firebase";

const roleBasedInfo = {
  admin: {
    title: "Welcome, Administrator",
    description: "Review pending requests, analyze spending, and manage your organization's procurement flow.",
    actions: [
      {
        title: "Review Approvals",
        description: "View and act on pending invoices.",
        href: "/dashboard/admin",
        icon: ShieldCheck
      },
      {
        title: "Spending Analytics",
        description: "Analyze spending patterns across the organization.",
        href: "/dashboard/admin/analytics",
        icon: BarChart2
      },
       {
        title: "Transaction History",
        description: "View a complete audit trail of all transactions.",
        href: "/dashboard/admin/history",
        icon: Activity
      }
    ]
  },
  agent: {
    title: "Ready to make a purchase?",
    description: "Scan an invoice QR code to get started or view your past requests.",
    actions: [
        {
          title: "Scan New Invoice",
          description: "Start a new payment request by scanning a vendor's code.",
          href: "/dashboard/agent",
          icon: ScanLine
        },
        {
          title: "My Request History",
          description: "Track the status of all your past and present requests.",
          href: "/dashboard/agent/history",
          icon: Activity
        },
    ]
  },
  vendor: {
    title: "Welcome to your Vendor Dashboard",
    description: "Create new invoices to get paid instantly and track your transaction history.",
    actions: [
      {
        title: "Create New Invoice",
        description: "Generate a unique QR code for a customer to scan.",
        href: "/dashboard/vendor",
        icon: FileText
      },
      {
        title: "My Invoice History",
        description: "View a record of all invoices you have generated.",
        href: "/dashboard/vendor/history",
        icon: Activity
      }
    ]
  }
};


export default function DashboardPage() {
    const { userProfile, loading } = useUser();

    if (loading || !userProfile) {
        return <div className="flex h-full w-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>
    }

    const info = roleBasedInfo[userProfile.role];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">{info.title}</h2>
        <p className="text-muted-foreground mt-1 text-lg">{info.description}</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {info.actions.map((action) => (
          <Link key={action.title} href={action.href} className="group">
            <Card className="h-full transition-all group-hover:shadow-lg group-hover:-translate-y-1 group-hover:border-primary">
              <CardHeader className="pb-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                     <action.icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">{action.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{action.description}</p>
              </CardContent>
               <CardContent>
                  <span className="font-semibold text-primary flex items-center">
                    Go <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </span>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
