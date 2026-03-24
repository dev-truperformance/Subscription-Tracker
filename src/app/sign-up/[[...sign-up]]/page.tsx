'use client';

import { SignUp, useUser } from '@clerk/nextjs';
import { useEffect } from 'react';

export default function SignUpPage() {
  const { isSignedIn, user } = useUser();

  const syncUserToDatabase = async (clerkUser: any) => {
    try {
      const response = await fetch('/api/user/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
      } else {
        const errorData = await response.text();
        console.error(
          '❌ Failed to sync user to database:',
          response.status,
          errorData
        );
      }
    } catch (error) {
      console.error('❌ Error syncing user to database:', error);
    }
  };

  useEffect(() => {
    if (isSignedIn && user) {
      syncUserToDatabase(user);
    }
  }, [isSignedIn, user]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <SignUp
        signInUrl="/sign-in"
        appearance={{
          elements: {
            rootBox: 'mx-auto',
            card: 'shadow-lg',
          },
        }}
      />
    </div>
  );
}
