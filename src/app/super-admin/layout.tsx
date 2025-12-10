'use client';
import * as React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Activity,
  LayoutDashboard,
  BadgeCent,
  UserCheck,
  Users,
  Settings,
  User,
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
import { useUser } from '@/firebase/auth/use-user';

const superAdminNav = [
  { href: '/super-admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/super-admin/kyc', label: 'KYC Management', icon: UserCheck },
  { href: '/super-admin/finance', label: 'Financials', icon: BadgeCent },
  { href: '/super-admin/users', label: 'Users & Orgs', icon: Users },
  { href: '/super-admin/transactions', label: 'Transactions', icon: Activity },
];


function MainNav() {
  const pathname = usePathname();
  const { isMobile } = useSidebar();
  
  return (
    <SidebarMenu>
      {superAdminNav.map((item) => (
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
           <Link href="/dashboard/profile">
             <SidebarMenuItem>
                <SidebarMenuButton>
                  <User />
                  <span>My Profile</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
           </Link>
          </>
        )}
    </SidebarMenu>
  );
}

export default function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, userProfile, loading } = useUser();
  const router = useRouter();

  React.useEffect(() => {
    if (!loading) {
        if (!user) {
            router.push('/login');
            return;
        }
        if (userProfile?.role !== 'super_admin') {
            router.push('/dashboard');
        }
    }
  }, [user, userProfile, loading, router]);

  if (loading || !userProfile || userProfile.role !== 'super_admin') {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }
  
  return (
    <SidebarProvider>
      <Sidebar variant="inset" collapsible="icon">
        <SidebarHeader>
          <Button variant="ghost" className="h-10 w-full justify-start px-2">
            <ShiraPayLogo className="mr-2 h-10 w-36 object-contain shrink-0" />
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
            Super Admin
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
