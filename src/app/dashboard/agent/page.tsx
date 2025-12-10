'use client';
import { ScanForm } from "@/components/dashboard/agent/scan-form";
import { useUser } from "@/firebase";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";


export default function AgentScanPage() {
  const { userProfile, loading } = useUser();
  const router = useRouter();

   if (loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (userProfile && userProfile.role !== 'agent') {
      router.push('/dashboard');
      return null;
  }

  return (
    <div className="space-y-6">
      <ScanForm />
    </div>
  );
}
