'use client';
import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Activity,
  BarChart2,
  FileText,
  Home,
  ScanLine,
  Settings,
  ShieldCheck,
  Users,
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

// Mock user role
const USER_ROLE = 'admin' as 'admin' | 'agent' | 'vendor';

const adminNav = [
  { href: '/dashboard', label: 'Home', icon: Home },
  { href: '/dashboard/admin', label: 'Approvals', icon: ShieldCheck },
  { href: '/dashboard/admin/analytics', label: 'Analytics', icon: BarChart2 },
  { href: '/dashboard/admin/history', label: 'History', icon: Activity },
];

const agentNav = [
  { href: '/dashboard', label: 'Home', icon: Home },
  { href: '/dashboard/agent', label: 'Scan Invoice', icon: ScanLine },
  { href: '/dashboard/agent/history', label: 'My History', icon: Activity },
];

const vendorNav = [
  { href: '/dashboard', label: 'Home', icon: Home },
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
  const currentNav = navItems[USER_ROLE];
  const { isMobile } = useSidebar();
  
  return (
    <SidebarMenu>
      {currentNav.map((item) => (
        <SidebarMenuItem key={item.label}>
          <Link href={item.href} passHref legacyBehavior>
            <SidebarMenuButton
              isActive={pathname === item.href}
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
  const [userRole, setUserRole] = React.useState(USER_ROLE);

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
            {userRole} Dashboard
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
