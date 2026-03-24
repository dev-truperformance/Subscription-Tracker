import { useQuery } from '@tanstack/react-query';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { users } from '@/lib/db/user-schema';
import { organizationMembers } from '@/lib/db/organization-schema';
import { eq } from 'drizzle-orm';

interface AdminCheckResult {
  isAdmin: boolean;
  organizationId: string | null;
}

export function useIsAdmin() {
  return useQuery({
    queryKey: ['user-admin-status'],
    queryFn: async (): Promise<AdminCheckResult> => {
      // This would need to be called from a client component
      // For now, we'll make a client-side check
      const response = await fetch('/api/user/admin-status');
      if (!response.ok) {
        return { isAdmin: false, organizationId: null };
      }
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
