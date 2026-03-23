import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Organization, NewOrganization } from '@/lib/db/organization-schema';

// Mock API functions - replace with actual API calls
const fetchOrganizations = async (): Promise<Organization[]> => {
  // TODO: Replace with actual API call
  return [];
};

const createOrganization = async (
  orgData: NewOrganization
): Promise<Organization> => {
  // TODO: Replace with actual API call
  const response = await fetch('/api/organizations', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(orgData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create organization');
  }

  const result = await response.json();
  return result.data as Organization;
};

const joinOrganization = async (organizationId: string): Promise<void> => {
  // TODO: Replace with actual API call
  const response = await fetch(`/api/organizations/${organizationId}/join`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to join organization');
  }
};

// Hooks
export function useOrganizations() {
  return useQuery({
    queryKey: ['organizations'],
    queryFn: fetchOrganizations,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useCreateOrganization() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createOrganization,
    onSuccess: () => {
      // Invalidate and refetch organizations
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
    },
  });
}

export function useJoinOrganization() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: joinOrganization,
    onSuccess: () => {
      // Invalidate and refetch organizations
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
    },
  });
}
