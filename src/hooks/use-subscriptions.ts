import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

// Types for subscription data
export interface Subscription {
  id: number;
  userId: string;
  name: string;
  email: string;
  functions: string;
  payment: string;
  dueDate: string;
  frequency: string;
  reminderHistory?: string[];
  lastReminderAt?: string;
  status?: string;
  createdAt: string;
  updatedAt: string;
  // Optional user details for organization subscriptions
  user?: {
    firstName: string | null;
    lastName: string | null;
    email: string;
  };
}

export interface NewSubscription {
  name: string;
  email: string;
  functions: string;
  payment: string;
  frequency: string;
  dueDate?: string | null;
}

// GET subscriptions hook
export function useSubscriptions() {
  return useQuery({
    queryKey: ['subscriptions'],
    queryFn: async () => {
      const response = await fetch('/api/subscriptions');
      if (!response.ok) {
        throw new Error('Failed to fetch subscriptions');
      }
      const result = await response.json();
      return result.data as Subscription[];
    },
    staleTime: 60 * 1000, // 1 minute
  });
}

// POST subscription hook
export function useCreateSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (subscriptionData: NewSubscription) => {
      const response = await fetch('/api/subscriptions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(subscriptionData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create subscription');
      }

      const result = await response.json();
      return result.data as Subscription;
    },
    onSuccess: () => {
      // Invalidate and refetch subscriptions
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
    },
  });
}

// PUT subscription hook
export function useUpdateSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: number;
      data: Partial<NewSubscription>;
    }) => {
      const response = await fetch(`/api/subscriptions/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update subscription');
      }

      const result = await response.json();
      return result.data as Subscription;
    },
    onSuccess: () => {
      // Invalidate and refetch subscriptions
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
    },
  });
}

// DELETE subscription hook
export function useDeleteSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/subscriptions/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete subscription');
      }

      return id;
    },
    onSuccess: () => {
      // Invalidate and refetch subscriptions
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
    },
  });
}
