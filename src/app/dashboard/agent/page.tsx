'use client';
import { ScanForm } from "@/components/dashboard/agent/scan-form";
import { useUser } from "@/firebase";
import { useRouter } from "next/navigation";

export default function AgentScanPage() {
  const { userProfile } = useUser();
  const router = useRouter();

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
