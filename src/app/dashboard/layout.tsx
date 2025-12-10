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
  User,
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


const orgAdminNav = [
  { href: '/dashboard/org-admin', label: 'Approvals', icon: ShieldCheck },
  { href: '/dashboard/org-admin/analytics', label: 'Analytics', icon: BarChart2 },
  { href: '/dashboard/org-admin/history', label: 'History', icon: Activity },
];

const agentStaffNav = [
  { href: '/dashboard/agent', label: 'Scan Invoice', icon: ScanLine },
  { href: '/dashboard/agent/history', label: 'My History', icon: Activity },
];

const vendorAdminNav = [
    { href: '/dashboard/vendor-admin', label: 'Dashboard', icon: BarChart2 },
    { href: '/dashboard/vendor-admin/invoices', label: 'Create Invoice', icon: FileText },
    { href: '/dashboard/vendor-admin/history', label: 'History', icon: Activity },
];

const vendorStaffNav = [
  { href: '/dashboard/vendor', label: 'Create Invoice', icon: FileText },
  { href: '/dashboard/vendor/history', label: 'My History', icon: Activity },
];

const navItems = {
  org_admin: orgAdminNav,
  agent_staff: agentStaffNav,
  vendor_admin: vendorAdminNav,
  vendor_staff: vendorStaffNav,
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
          <Link href="/dashboard">
            <SidebarMenuButton
              isActive={pathname === '/dashboard'}
              tooltip="Home"
              
            >
              <Home />
              <span>Home</span>
            </SidebarMenuButton>
          </Link>
        </SidebarMenuItem>
      {currentNav.map((item) => (
        <SidebarMenuItem key={item.label}>
          <Link href={item.href}>
            <SidebarMenuButton
              isActive={pathname.startsWith(item.href)}
              tooltip={item.label}
              
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
           <Link href="/dashboard/profile">
             <SidebarMenuItem>
                <SidebarMenuButton>
                  <User />
                  <span>My Profile</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
           </Link>
           <Link href="/dashboard/profile">
             <SidebarMenuItem>
                <SidebarMenuButton>
                  <Settings />
                  <span>Settings</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
           </Link>
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
  const pathname = usePathname();

  React.useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
      return;
    }

    if (userProfile) {
      // Guard for pending approval
      if (userProfile.approvalStatus === 'PENDING') {
          if (pathname !== '/pending-approval') {
              router.push('/pending-approval');
          }
          return; // Stop further checks if pending
      } else {
         if (pathname === '/pending-approval') {
            router.push('/dashboard');
            return;
         }
      }

      // Guard for org_admin setup
      if (userProfile.role === 'org_admin' && !userProfile.organizationId) {
        if (pathname !== '/setup') {
          router.push('/setup');
        }
        return;
      }
    }
  }, [user, userProfile, loading, router, pathname]);

  if (loading || !userProfile || userProfile.approvalStatus === 'PENDING' || (userProfile.role === 'org_admin' && !userProfile.organizationId && pathname !== '/setup') ) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }
  
  const getPageTitle = () => {
    if (pathname.startsWith('/dashboard/profile')) return "Profile";

    const allNavs = [...orgAdminNav, ...agentStaffNav, ...vendorAdminNav, ...vendorStaffNav];
    const currentNavItem = allNavs.find(item => pathname.startsWith(item.href) && item.href !== '/dashboard');

    if(currentNavItem) return currentNavItem.label;

    if(pathname === '/dashboard') return "Home";

    return userProfile.role;
  }

  return (
    <SidebarProvider>
      <Sidebar variant="inset" collapsible="icon">
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
              <Link href="/dashboard/profile">
                <SidebarMenuItem>
                  <SidebarMenuButton tooltip="Settings">
                    <Settings />
                    <span>Settings</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </Link>
            </SidebarMenu>
          </div>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-14 w-full items-center gap-4 border-b bg-background/95 px-4 backdrop-blur sm:px-6">
          <SidebarTrigger className="md:hidden" />
          <h1 className="text-lg font-semibold capitalize md:text-xl">
            {getPageTitle()}
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
