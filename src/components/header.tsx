'use client';

import { ThemeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';
import { useUserData } from '@/hooks/use-user-data';
import { SignInButton, SignUpButton, UserButton, useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';

export function Header() {
  const { isSignedIn } = useUser();
  const { isSaving, saveError } = useUserData();
  const router = useRouter();

  // Handle navigation
  const handleNavigation = (href: string) => {
    router.push(href);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center space-x-2"></div>

        <div className="flex items-center space-x-4 mr-5">
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
