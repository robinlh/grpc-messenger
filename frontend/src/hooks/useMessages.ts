import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MessagingService } from '../services/messaging';
import { useAuth } from './useAuth';

export const useMessages = (threadId: number | null) => {
  const { token } = useAuth();

  return useQuery({
    queryKey: ['messages', threadId],
    queryFn: () => MessagingService.getMessages(token!, threadId!),
    enabled: !!token && !!threadId,
    staleTime: 1000 * 60 * 2, // Consider data stale after 2 minutes
  });
};

export const useSendMessage = () => {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ threadId, content }: { threadId: number; content: string }) =>
      MessagingService.sendMessage(token!, threadId, content),
    onSuccess: (newMessage, variables) => {
      // Optimistically update the messages cache
      queryClient.setQueryData(['messages', variables.threadId], (old: any) => {
        if (!old) return [newMessage];
        return [...old, newMessage];
      });
      
      // Refetch threads to update last message
      queryClient.invalidateQueries({ queryKey: ['threads'] });
    },
  });
};