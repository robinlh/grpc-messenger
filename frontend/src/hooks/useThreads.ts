import { useQuery } from '@tanstack/react-query';
import { MessagingService } from '../services/messaging';
import { useAuth } from './useAuth';

export const useThreads = () => {
  const { token } = useAuth();

  return useQuery({
    queryKey: ['threads'],
    queryFn: () => MessagingService.getThreads(token!),
    enabled: !!token,
    staleTime: 1000 * 60 * 5, // Consider data stale after 5 minutes
    refetchOnWindowFocus: true
  });
};