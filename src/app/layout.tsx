import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { cn } from '@/lib/utils';
import { FirebaseClientProvider } from '@/firebase/client-provider';

export const metadata: Metadata = {
  title: 'ShiraPay - Secure & Transparent Procurement',
  description:
    'ShiraPay eliminates cash-based fraud and manual reconciliation with a transparent, digitized, a three-party e-invoicing and instant payment approval flow.',
  icons: {
    icon: 'https://firebasestorage.googleapis.com/v0/b/canonic-erp.appspot.com/o/shirapay_favicon-removebg-preview.png?alt=media&token=962f56a3-aa97-4b25-865d-523ada1fea15',
  },
  openGraph: {
    title: 'ShiraPay - Secure & Transparent Procurement',
    description:
      'ShiraPay eliminates cash-based fraud and manual reconciliation with a transparent, digitized, a three-party e-invoicing and instant payment approval flow.',
    images: [
      {
        url: 'https://firebasestorage.googleapis.com/v0/b/canonic-erp.appspot.com/o/Image_fx%20(67).png?alt=media&token=6c4daf8b-ddf8-408f-bd03-3d91a507dd61',
        alt: 'ShiraPay — secure procurement',
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className={cn('min-h-screen bg-background font-body antialiased')}
        suppressHydrationWarning
      >
        <FirebaseClientProvider>
            {children}
        </FirebaseClientProvider>
        <Toaster />
      </body>
    </html>
  );
}
