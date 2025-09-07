import { useEffect, useCallback, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { MessageStreamingService } from '../services/messageStreaming';
import { useAuth } from './useAuth';
import { Message } from '../types/messaging';

export const useMessageStream = (threadId: number | null) => {
  const [isConnected, setIsConnected] = useState(false);
  const { token } = useAuth();
  const queryClient = useQueryClient();

  const handleNewMessage = useCallback((message: Message) => {
    // Add the new message to the React Query cache
    queryClient.setQueryData(['messages', threadId], (oldMessages: Message[] | undefined) => {
      if (!oldMessages) return [message];
      
      // Check if message already exists to avoid duplicates
      const messageExists = oldMessages.some(msg => msg.id === message.id);
      if (messageExists) return oldMessages;
      
      // Add new message and sort by creation time
      const updatedMessages = [...oldMessages, message];
      return updatedMessages.sort((a, b) => a.createdAt - b.createdAt);
    });

    // Update the threads cache to reflect the latest message
    queryClient.setQueryData(['threads'], (oldThreads: any[] | undefined) => {
      if (!oldThreads) return oldThreads;
      
      return oldThreads.map(thread => {
        if (thread.id === threadId) {
          return {
            ...thread,
            lastMessage: message,
            updatedAt: message.createdAt
          };
        }
        return thread;
      });
    });
  }, [threadId, queryClient]);

  const handleConnectionStatus = useCallback((connected: boolean, message?: string) => {
    console.log(`[Hook] Connection status for thread ${threadId}: ${connected} - ${message}`);
    setIsConnected(connected);
  }, [threadId]);

  const handleStreamError = useCallback((error: string) => {
    console.error('Streaming error:', error);
    setIsConnected(false);
    // Could show a toast notification here
  }, []);

  useEffect(() => {
    if (!token || !threadId) {
      setIsConnected(false);
      return;
    }

    console.log(`[Hook] Setting up streaming for thread ${threadId}`);
    
    const connection = MessageStreamingService.startStreaming(
      token,
      threadId,
      handleNewMessage,
      handleConnectionStatus,
      handleStreamError
    );

    return () => {
      console.log(`[Hook] Cleaning up streaming for thread ${threadId}`);
      setIsConnected(false);
      connection.stop();
    };
  }, [token, threadId, handleNewMessage, handleConnectionStatus, handleStreamError]);

  // Cleanup all streaming when component unmounts or auth changes
  useEffect(() => {
    return () => {
      MessageStreamingService.stopAllStreaming();
    };
  }, [token]);

  return { isConnected };
};