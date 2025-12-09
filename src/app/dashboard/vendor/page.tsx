'use client';
import { InvoiceCreator } from "@/components/dashboard/vendor/invoice-creator";
import { RecentInvoices } from "@/components/dashboard/vendor/recent-invoices";
import { useUser } from "@/firebase";
import { useRouter } from "next/navigation";
import { Separator } from "@/components/ui/separator";

export default function VendorCreatePage() {
  const { userProfile } = useUser();
  const router = useRouter();

  if (userProfile && userProfile.role !== 'vendor') {
      router.push('/dashboard');
      return null;
  }
  
  return (
    <div className="space-y-8">
      <InvoiceCreator />
      <Separator />
      <RecentInvoices />
    </div>
  );
}
