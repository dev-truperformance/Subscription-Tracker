import { useUser } from '@clerk/nextjs';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';

// GET user by clerkId hook
export function useUserByClerkId(clerkId: string) {
  return useQuery({
    queryKey: ['user', clerkId],
    queryFn: async () => {
      const response = await fetch(`/api/users?clerkId=${clerkId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch user');
      }
      const result = await response.json();
      return result.data;
    },
    enabled: !!clerkId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// POST user hook
export function useCreateUser() {
  return useMutation({
    mutationFn: async (userData: {
      clerkId: string;
      email: string;
      firstName: string;
      lastName: string;
      avatar: string;
    }) => {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create user');
      }

      const result = await response.json();
      return result.data;
    },
  });
}

export function useUserData() {
  const { user, isLoaded } = useUser();
  const [saveError, setSaveError] = useState<string | null>(null);
  const hasSavedRef = useRef(false);

  const { data: existingUser, isLoading: isCheckingUser } = useUserByClerkId(
    user?.id || ''
  );
  const createUser = useCreateUser();

  useEffect(() => {
    // Only run if user is loaded, user exists, not currently checking, and hasn't saved yet
    if (!isLoaded || !user || isCheckingUser || hasSavedRef.current) return;

    const saveUserToDatabase = async () => {
      setSaveError(null);

      try {
        const userData = {
          clerkId: user.id,
          email: user.emailAddresses[0]?.emailAddress || '',
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          avatar: user.imageUrl || '',
        };

        console.log('🔄 Attempting to save user data:', userData.email);

        // Check if user already exists
        if (existingUser) {
          console.log(
            '✅ User already exists in database:',
            existingUser.email
          );

          // Check if user data needs updating
          const needsUpdate =
            existingUser.email !== userData.email ||
            existingUser.firstName !== userData.firstName ||
            existingUser.lastName !== userData.lastName ||
            existingUser.avatar !== userData.avatar;

          if (needsUpdate) {
            console.log('🔄 Updating user data with latest Clerk info...');
            const result = await createUser.mutateAsync(userData);
            console.log('✅ User data updated in database:', userData.email);
            console.log('📊 Updated user data:', result);
          } else {
            console.log('✅ User data is already up to date');
          }

          hasSavedRef.current = true; // Mark as processed
          return;
        }

        // If user doesn't exist, create new user
        const result = await createUser.mutateAsync(userData);
        console.log('✅ User data saved to database:', userData.email);
        console.log('📊 Saved user data:', result);
        hasSavedRef.current = true; // Mark as successfully saved
      } catch (error) {
        console.error('Error saving user data:', error);
        setSaveError(
          error instanceof Error ? error.message : 'Failed to save user data'
        );
      }
    };

    saveUserToDatabase();
  }, [user, isLoaded, isCheckingUser, existingUser, createUser]);

  // Reset the saved flag when user changes (new login/signup)
  useEffect(() => {
    if (user) {
      hasSavedRef.current = false;
    }
  }, [user?.id]); // Only reset when user ID changes

  const isSaving = createUser.isPending || isCheckingUser;

  return { user, isLoaded, isSaving, saveError };
}
