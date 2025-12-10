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
  Loader2,
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
           <Link href="/dashboard/settings">
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
    if (loading) return;

    if (!user) {
      router.push('/login');
      return;
    }

    if (userProfile) {
      const isPendingUser = userProfile.approvalStatus === 'PENDING';
      const isOrgAdminNeedingSetup = userProfile.role === 'org_admin' && !userProfile.organizationId;

      // Rule 1: If user is pending and not on the pending page, redirect there.
      if (isPendingUser && pathname !== '/pending-approval') {
        router.push('/pending-approval');
        return;
      }
      
      // Rule 2: If user is an org admin needing setup and not on the setup page, redirect there.
      if (isOrgAdminNeedingSetup && pathname !== '/setup') {
        router.push('/setup');
        return;
      }

      // Rule 3: If user is fully set up but is on a setup/pending page, redirect to the main dashboard.
      const isOnRestrictedPage = pathname === '/pending-approval' || pathname === '/setup';
      if (!isPendingUser && !isOrgAdminNeedingSetup && isOnRestrictedPage) {
          router.push('/dashboard');
          return;
      }
    }
  }, [user, userProfile, loading, router, pathname]);

  // Determine if the content should be hidden and a loader shown
  const showLoader = loading || !userProfile || 
    (userProfile?.approvalStatus === 'PENDING' && pathname !== '/pending-approval') || 
    (userProfile?.role === 'org_admin' && !userProfile.organizationId && pathname !== '/setup');

  if (showLoader) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }
  
  const getPageTitle = () => {
    if (pathname.startsWith('/dashboard/profile')) return "Profile";

    const allNavs = [...orgAdminNav, ...agentStaffNav, ...vendorAdminNav, ...vendorStaffNav];
    // Find a nav item where the current path starts with the item's href,
    // but also make sure it's not the generic '/dashboard' which has its own title.
    const currentNavItem = allNavs.find(item => pathname.startsWith(item.href) && item.href !== '/dashboard' && item.href.split('/').length > 2);
    
    if(currentNavItem) return currentNavItem.label;

    // Handle nested admin routes that don't have their own nav item e.g. /dashboard/vendor-admin/invoices
    if (pathname.includes('org-admin')) return 'Org Admin';
    if (pathname.includes('vendor-admin')) return 'Vendor Admin';

    if(pathname === '/dashboard') return "Home";

    // Fallback to a readable version of the user's role
    return userProfile.role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
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
