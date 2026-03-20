import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import { ClerkProvider } from '@clerk/nextjs';
import { AuthLoaderProvider } from '@/components/auth-loader-provider';
import { Toaster } from 'sonner';
import { NavigationLoader } from '@/components/navigation-loader';
import { QueryProvider } from '@/components/query-provider';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Subscription Tracker',
  description: 'Track your subscriptions effortlessly',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
      afterSignOutUrl="/"
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
    >
      <AuthLoaderProvider>
        <html lang="en" suppressHydrationWarning>
          <body
            className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}
          >
            <ThemeProvider>
              <QueryProvider>
                <Toaster
                  toastOptions={{
                    style: {
                      background: 'var(--card)',
                      color: 'var(--card-foreground)',
                      border: '1px solid var(--border)',
                    },
                    classNames: {
                      success: 'bg-green-500 text-white border-green-600',
                      error: 'bg-red-500 text-white border-red-600',
                    },
                  }}
                />
                <NavigationLoader />
                {children}
              </QueryProvider>
            </ThemeProvider>
          </body>
        </html>
      </AuthLoaderProvider>
    </ClerkProvider>
  );
}
