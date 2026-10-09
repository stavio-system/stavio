import type { Metadata } from 'next';
import { Geist } from 'next/font/google';
import './globals.css';

import { Toaster } from 'react-hot-toast';
import { Providers } from '@/components/layout/providers';
import { Navbar } from '../components/layout/Navbar';

const geist = Geist({
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Stavio',
  description: 'USDC rentals on the Stellar Network',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="color-scheme" content="light dark" />
        <meta
          httpEquiv="Permissions-Policy"
          content="identity-credentials-get=(), publickey-credentials-get=()"
        />
        <script src="https://accounts.google.com/gsi/client" async defer />
      </head>
      <body className={`${geist.className} bg-background min-h-screen antialiased text-foreground`}>
        <div id="theme-portal-root" />
        <Providers>
          <Navbar />
          <main className="flex-1 flex flex-col min-w-0 pt-14">{children}</main>
          <Toaster position="top-right" />
        </Providers>
      </body>
    </html>
  );
}
