import { useQuery } from '@tanstack/react-query';

interface OrganizationMember {
  id: number;
  firstName: string | null;
  lastName: string | null;
  email: string;
  role: string;
  joinedAt: string;
}

export function useOrganizationMembers(organizationId: string | null) {
  return useQuery({
    queryKey: ['organization-members', organizationId],
    queryFn: async (): Promise<OrganizationMember[]> => {
      if (!organizationId) return [];

      const response = await fetch(
        `/api/organizations/${organizationId}/members`
      );
      if (!response.ok) {
        throw new Error('Failed to fetch organization members');
      }
      const result = await response.json();
      return result.members as OrganizationMember[];
    },
    enabled: !!organizationId,
  });
}
