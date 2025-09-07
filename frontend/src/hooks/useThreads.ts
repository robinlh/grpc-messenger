import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MessagingService } from '../services/messaging';
import { useAuth } from './useAuth';

export const useThreads = () => {
  const { token } = useAuth();

  return useQuery({
    queryKey: ['threads'],
    queryFn: () => MessagingService.getThreads(token!),
    enabled: !!token,
    staleTime: 1000 * 60 * 2, // Consider data stale after 2 minutes (compromise)
    refetchInterval: 1000 * 60, // Background refetch every 1 minute  
    refetchOnWindowFocus: true, // Immediate refresh on tab focus
    refetchOnMount: true, // Fresh data when component mounts
  });
};

export const useCreateThread = () => {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ participantUsernames, name }: { participantUsernames: string[]; name?: string }) =>
      MessagingService.createThread(token!, participantUsernames, name),
    onSuccess: (newThread) => {
      // Add the new thread to the threads cache
      queryClient.setQueryData(['threads'], (oldThreads: any[] | undefined) => {
        if (!oldThreads) return [newThread];
        return [newThread, ...oldThreads]; // Add to beginning (most recent)
      });
    },
  });
};