'use client';
import { InvoiceCreator } from "@/components/dashboard/vendor/invoice-creator";
import { useUser } from "@/firebase";
import { useRouter } from "next/navigation";

export default function VendorCreatePage() {
  const { userProfile } = useUser();
  const router = useRouter();

  if (userProfile && userProfile.role !== 'vendor') {
      router.push('/dashboard');
      return null;
  }
  
  return (
    <div className="space-y-6">
      <InvoiceCreator />
    </div>
  );
}
