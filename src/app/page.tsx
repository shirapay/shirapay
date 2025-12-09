'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  ArrowRight,
  ShieldCheck,
  Zap,
  Users,
  ScanLine,
  FileText,
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { ShiraPayLogo } from '@/components/icons';
import { placeholderImages } from '@/lib/placeholder-images';
import { cn } from '@/lib/utils';

const userRoles = [
  {
    icon: <FileText className="size-10 text-accent" />,
    title: 'For Vendors',
    description: 'Generate digital invoices in seconds. Get paid instantly and securely without sharing bank details.',
    link: '/#',
    feature: 'Real-Time Listener Success Animation',
  },
  {
    icon: <ScanLine className="size-10 text-accent" />,
    title: 'For Agents',
    description: 'Make purchases without cash advances. Scan a QR code, verify, and route for approval effortlessly.',
    link: '/#',
    feature: 'One-tap QR Code Scanning',
  },
  {
    icon: <Users className="size-10 text-accent" />,
    title: 'For Admins',
    description: 'Approve or reject payments from a central dashboard. Get full audit trails and spending analytics.',
    link: '/#',
    feature: 'Approval Center & Auditing',
  },
];


export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  const heroImage = placeholderImages.find(p => p.id === "hero-new");

  return (
    <div className="flex min-h-dvh flex-col bg-background text-primary">
       <header className={cn(
        "sticky top-0 z-50 w-full transition-colors duration-300",
        scrolled ? "bg-primary text-primary-foreground shadow-md" : "bg-transparent"
      )}>
        <div className="container mx-auto flex h-16 items-center px-4 md:px-6">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <ShiraPayLogo className={cn("h-7 w-7", scrolled ? "text-white" : "text-primary")} />
            <span className={cn("font-bold text-lg", scrolled ? "text-white" : "text-primary")}>ShiraPay</span>
          </Link>
          <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
             <Link href="#features" className={cn("transition-colors hover:text-accent", scrolled ? "text-primary-foreground/80 hover:text-accent" : "text-primary/80")}>Features</Link>
             <Link href="#security" className={cn("transition-colors hover:text-accent", scrolled ? "text-primary-foreground/80 hover:text-accent" : "text-primary/80")}>Security</Link>
          </nav>
          <div className="flex flex-1 items-center justify-end space-x-2">
             <Button variant="outline" asChild className={cn(scrolled ? "border-white/50 text-white hover:bg-white/10 hover:text-white" : "border-primary/50 text-primary hover:bg-primary/5 hover:text-primary")}>
                <Link href="/login">Login</Link>
              </Button>
              <Button className="bg-accent text-accent-foreground hover:bg-accent/90" asChild>
                <Link href="/login">Get Started</Link>
              </Button>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <section className="w-full">
           <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center py-16">
              <div className="container mx-auto flex flex-col items-center justify-center space-y-8 px-4 text-center md:px-6">
                <div className="space-y-6">
                  <h1 className="text-4xl font-heavy tracking-tighter text-primary sm:text-6xl md:text-7xl lg:text-8xl">
                    Eliminate Cash Fraud.
                    <br />
                    Digitize Corporate Procurement.
                  </h1>
                  <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                    ShiraPay replaces opaque cash advances with a secure, real-time, three-party e-invoicing and payment approval flow.
                  </p>
                  <div className="flex w-full flex-col gap-2 min-[400px]:flex-row justify-center">
                    <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90" asChild>
                      <Link href="/login">
                        Get Started <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                    <Button size="lg" variant="outline" asChild>
                      <Link href="/login">
                        Login
                      </Link>
                    </Button>
                  </div>
                </div>
                <div className="relative mx-auto w-full max-w-3xl pt-8">
                    {heroImage && (
                      <Image
                          src={heroImage.imageUrl}
                          alt={heroImage.description}
                          data-ai-hint={heroImage.imageHint}
                          width={1200}
                          height={675}
                          className="object-contain"
                          priority
                      />
                      )}
                  </div>
              </div>
           </div>
        </section>
        
        <section id="features" className="w-full py-12 md:py-24 lg:py-32 bg-background">
          <div className="container mx-auto px-4 md:px-6">
            <div className="mx-auto grid max-w-5xl items-start gap-8 sm:grid-cols-2 md:gap-12 lg:grid-cols-3 lg:max-w-none">
               {userRoles.map((role, i) => (
                 <div key={i} className="flex flex-col gap-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/10">
                          {role.icon}
                      </div>
                      <h3 className="text-xl font-bold text-primary">{role.title}</h3>
                    </div>
                    <p className="text-muted-foreground">{role.description}</p>
                    <Link href={role.link} className="font-semibold text-accent hover:underline flex items-center gap-2">
                        Learn More <ArrowRight className="h-4 w-4" />
                    </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="security" className="w-full bg-primary text-primary-foreground py-24 md:py-32">
          <div className="container mx-auto px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-6 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full border-4 border-accent/50 bg-primary">
                <ShieldCheck className="h-8 w-8 text-accent" />
              </div>
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">
                Trust & Security Comes First
              </h2>
              <div className="grid max-w-3xl gap-x-8 gap-y-4 sm:grid-cols-2">
                <div className="flex flex-col items-center gap-2 sm:items-start sm:text-left">
                  <h3 className="font-semibold">Regulated & Protected</h3>
                  <p className="text-primary-foreground/70">
                    Built on Firebase Security Rules for granular, role-based access control.
                  </p>
                </div>
                <div className="flex flex-col items-center gap-2 sm:items-start sm:text-left">
                  <h3 className="font-semibold">Instant & Secure Payments</h3>
                  <p className="text-primary-foreground/70">
                    Powered by enterprise-grade Paystack API integration for every transaction.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container mx-auto px-4 md:px-6">
            <div className="grid items-center justify-center gap-4 text-center">
              <div className="space-y-3">
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
                  Ready to Digitize Your Procurement?
                </h2>
                <p className="mx-auto max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Join ShiraPay today and bring trust, transparency, and
                  efficiency to your organization's spending.
                </p>
              </div>
              <div className="mx-auto w-full max-w-sm space-y-2">
                 <Button size="lg" className="w-full bg-accent text-accent-foreground hover:bg-accent/90" asChild>
                      <Link href="/login">
                        Sign Up Now
                      </Link>
                    </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} ShiraPay. All rights reserved.
        </p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link
            href="/#"
            className="text-xs hover:underline underline-offset-4"
            prefetch={false}
          >
            Terms of Service
          </Link>
          <Link
            href="/#"
            className="text-xs hover:underline underline-offset-4"
            prefetch={false}
          >
            Privacy
          </Link>
        </nav>
      </footer>
    </div>
  );
}
