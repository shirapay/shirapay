import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Activity,
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

const heroImage = placeholderImages.find(p => p.id === "hero");

const featureCards = [
  {
    icon: <Zap className="size-8 text-primary" />,
    title: 'Instant Payments',
    description: 'Vendors receive payments instantly upon approval, improving cash flow.',
  },
  {
    icon: <ShieldCheck className="size-8 text-primary" />,
    title: 'Fraud Prevention',
    description: 'Eliminate cash-based fraud with a fully digitized and traceable transaction flow.',
  },
  {
    icon: <Activity className="size-8 text-primary" />,
    title: 'Real-Time Tracking',
    description: 'All parties have real-time visibility into the invoice lifecycle from creation to settlement.',
  },
];

const userRoles = [
  {
    icon: <FileText className="size-10 text-accent" />,
    title: 'For Vendors',
    description: 'Generate digital invoices in seconds. Get paid instantly and securely without sharing bank details.',
    link: '/#',
    image: placeholderImages.find(p => p.id === "vendor-feature"),
  },
  {
    icon: <ScanLine className="size-10 text-accent" />,
    title: 'For Agents',
    description: 'Make purchases without cash advances. Scan a QR code, verify, and route for approval effortlessly.',
    link: '/#',
    image: placeholderImages.find(p => p.id === "agent-feature"),
  },
  {
    icon: <Users className="size-10 text-accent" />,
    title: 'For Admins',
    description: 'Approve or reject payments from a central dashboard. Get full audit trails and spending analytics.',
    link: '/#',
    image: placeholderImages.find(p => p.id === "admin-feature"),
  },
];

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <ShiraPayLogo className="h-6 w-6 text-primary" />
            <span className="font-bold sm:inline-block">ShiraPay</span>
          </Link>
          <div className="flex flex-1 items-center justify-end space-x-4">
            <nav className="flex items-center space-x-2">
              <Button variant="ghost" asChild>
                <Link href="/login">Login</Link>
              </Button>
              <Button asChild>
                <Link href="/login">Sign Up Free</Link>
              </Button>
            </nav>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <section className="py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 xl:gap-16">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none font-headline">
                    Transparent Procurement,
                    <br />
                    <span className="text-primary">Instantly Settled.</span>
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    ShiraPay replaces opaque cash advances with a secure,
                    three-party e-invoicing and payment approval flow. Track
                    every transaction in real-time.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Button size="lg" asChild>
                    <Link href="/login">
                      Get Started <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
              <div className="relative h-64 md:h-auto">
                {heroImage && (
                  <Image
                    src={heroImage.imageUrl}
                    alt={heroImage.description}
                    data-ai-hint={heroImage.imageHint}
                    fill
                    className="rounded-xl object-cover shadow-lg"
                    priority
                  />
                )}
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="w-full py-12 md:py-24 lg:py-32 bg-muted/50">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-secondary px-3 py-1 text-sm">
                  Core Features
                </div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline">
                  Why Choose ShiraPay?
                </h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Our platform is built from the ground up to provide security,
                  transparency, and efficiency for your entire procurement
                  process.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-start gap-8 sm:grid-cols-2 md:gap-12 lg:grid-cols-3 lg:max-w-none mt-12">
              {featureCards.map((feature, i) => (
                <Card key={i} className="text-center">
                  <CardHeader>
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-secondary mb-4">
                      {feature.icon}
                    </div>
                    <CardTitle>{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section id="roles" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container grid items-center gap-6 px-4 md:px-6 lg:grid-cols-1 lg:gap-10">
            <div className="space-y-4 text-center">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight font-headline">
                A Tailored Experience for Everyone
              </h2>
              <p className="max-w-[600px] mx-auto text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Whether you're a vendor, an agent on the ground, or an admin
                overseeing budgets, ShiraPay simplifies your role.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
              {userRoles.map((role, i) => (
                 <Card key={i} className="overflow-hidden">
                   {role.image && (
                      <div className="h-48 relative w-full">
                        <Image
                          src={role.image.imageUrl}
                          alt={role.image.description}
                          data-ai-hint={role.image.imageHint}
                          fill
                          className="object-cover"
                        />
                      </div>
                   )}
                  <CardHeader>
                      <div className="flex items-center gap-4">
                          {role.icon}
                          <CardTitle className="text-xl font-bold">{role.title}</CardTitle>
                      </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{role.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 lg:py-32 border-t bg-muted/50">
          <div className="container grid items-center justify-center gap-4 px-4 text-center md:px-6">
            <div className="space-y-3">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight font-headline">
                Ready to Digitize Your Procurement?
              </h2>
              <p className="mx-auto max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Join ShiraPay today and bring trust, transparency, and
                efficiency to your organization's spending.
              </p>
            </div>
            <div className="mx-auto w-full max-w-sm space-y-2">
               <Button size="lg" className="w-full" asChild>
                    <Link href="/login">
                      Sign Up Now
                    </Link>
                  </Button>
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
