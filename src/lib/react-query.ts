import { useQuery } from '@tanstack/react-query';

export function useApiQuery<T>(
  queryKey: any[],
  url: string,
  options?: {
    enabled?: boolean;
    [key: string]: any;
  }
) {
  return useQuery<T>({
    queryKey,
    queryFn: async () => {
      if (!url) return null;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }
      return response.json();
    },
    ...options,
  });
}
