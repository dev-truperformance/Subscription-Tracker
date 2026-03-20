'use client';

import React from 'react';
import { SignInButton, SignUpButton, UserButton, useUser } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';
import Link from 'next/link';
import { useUserData } from '@/hooks/use-user-data';
import { useAuthLoader } from '@/components/auth-loader-provider';
import { useRouter } from 'next/navigation';

export function Header() {
  const { isSignedIn } = useUser();
  const { isSaving, saveError } = useUserData();
  const { showLoader, hideLoader } = useAuthLoader();
  const router = useRouter();

  // Show/hide loader based on saving state
  React.useEffect(() => {
    if (isSaving) {
      showLoader('Setting up your account...');
    } else {
      hideLoader();
    }
  }, [isSaving, showLoader, hideLoader]);

  // Handle navigation with loading state
  const handleNavigation = (href: string) => {
    showLoader('Loading...');
    router.push(href);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center space-x-2">
          <Link
            href="/"
            className="text-xl font-bold hover:text-primary transition-colors"
          >
            Subscription Tracker
          </Link>
        </div>

        <div className="flex items-center space-x-4 mr-5">
          {saveError && (
            <div className="text-xs text-red-500 max-w-xs truncate">
              {saveError}
            </div>
          )}
          <ThemeToggle />

          {isSignedIn ? (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleNavigation('/dashboard')}
              >
                Dashboard
              </Button>
              <UserButton />
            </>
          ) : (
            <div className="flex items-center space-x-2">
              <SignInButton>
                <Button variant="ghost" size="sm">
                  Sign In
                </Button>
              </SignInButton>
              <SignUpButton>
                <Button size="sm">Sign Up</Button>
              </SignUpButton>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
