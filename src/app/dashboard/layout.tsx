'use client';
import * as React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Activity,
  BarChart2,
  FileText,
  Home,
  ScanLine,
  Settings,
  ShieldCheck,
  Users,
  Loader2
} from 'lucide-react';

import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarTrigger,
  SidebarInset,
  useSidebar,
} from '@/components/ui/sidebar';
import { ShiraPayLogo } from '@/components/icons';
import { UserNav } from '@/components/layout/user-nav';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useUser } from '@/firebase/auth/use-user';


const adminNav = [
  { href: '/dashboard/admin', label: 'Approvals', icon: ShieldCheck },
  { href: '/dashboard/admin/analytics', label: 'Analytics', icon: BarChart2 },
  { href: '/dashboard/admin/history', label: 'History', icon: Activity },
];

const agentNav = [
  { href: '/dashboard/agent', label: 'Scan Invoice', icon: ScanLine },
  { href: '/dashboard/agent/history', label: 'My History', icon: Activity },
];

const vendorNav = [
  { href: '/dashboard/vendor', label: 'Create Invoice', icon: FileText },
  { href: '/dashboard/vendor/history', label: 'My History', icon: Activity },
];

const navItems = {
  admin: adminNav,
  agent: agentNav,
  vendor: vendorNav,
};

function MainNav() {
  const pathname = usePathname();
  const { userProfile } = useUser();
  const { isMobile } = useSidebar();
  
  if (!userProfile) return null;

  const currentNav = navItems[userProfile.role] || [];
  
  return (
    <SidebarMenu>
       <SidebarMenuItem>
          <Link href="/dashboard" passHref legacyBehavior>
            <SidebarMenuButton
              isActive={pathname === '/dashboard'}
              tooltip="Home"
              as="a"
            >
              <Home />
              <span>Home</span>
            </SidebarMenuButton>
          </Link>
        </SidebarMenuItem>
      {currentNav.map((item) => (
        <SidebarMenuItem key={item.label}>
          <Link href={item.href} passHref legacyBehavior>
            <SidebarMenuButton
              isActive={pathname.startsWith(item.href)}
              tooltip={item.label}
              as="a"
            >
              <item.icon />
              <span>{item.label}</span>
            </SidebarMenuButton>
          </Link>
        </SidebarMenuItem>
      ))}
       {isMobile && (
          <>
          <Separator className="my-2" />
           <SidebarMenuItem>
              <SidebarMenuButton>
                <Settings />
                <span>Settings</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
             <SidebarMenuItem>
              <SidebarMenuButton>
                <Users />
                <span>My Profile</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </>
        )}
    </SidebarMenu>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, userProfile, loading } = useUser();
  const router = useRouter();

  React.useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }

    if (userProfile) {
      if (userProfile.role === 'admin' && !userProfile.organizationId) {
        router.push('/setup');
      }
    }
  }, [user, userProfile, loading, router]);

  if (loading || !userProfile) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <Button variant="ghost" className="h-10 w-full justify-start px-2">
            <ShiraPayLogo className="mr-2 size-5 shrink-0" />
            <span className="text-md font-medium">ShiraPay</span>
          </Button>
        </SidebarHeader>
        <SidebarContent>
          <MainNav />
        </SidebarContent>
        <SidebarFooter>
          <div className="hidden flex-col gap-2 p-2 md:flex">
             <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton tooltip="Settings">
                  <Settings />
                  <span>Settings</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </div>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-14 w-full items-center gap-4 border-b bg-background/95 px-4 backdrop-blur sm:px-6">
          <SidebarTrigger />
          <h1 className="text-lg font-semibold capitalize md:text-xl">
            {userProfile.role} Dashboard
          </h1>
          <div className="ml-auto flex items-center gap-4">
            <UserNav />
          </div>
        </header>
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
