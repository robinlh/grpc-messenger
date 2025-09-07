import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuth } from '../../hooks/useAuth';
import { useThreads } from '../../hooks/useThreads';
import { useMessages, useSendMessage } from '../../hooks/useMessages';
import { ThreadList } from './ThreadList';
import { ChatView } from './ChatView';
import { Thread } from '../../types/messaging';

const queryClient = new QueryClient();

const ChatPageContent: React.FC = () => {
  const { user, logout } = useAuth();
  const [selectedThread, setSelectedThread] = useState<Thread | null>(null);
  
  const { data: threads = [], isLoading: isLoadingThreads, error: threadsError } = useThreads();
  const { data: messages = [], isLoading: isLoadingMessages } = useMessages(selectedThread?.id || null);
  const sendMessageMutation = useSendMessage();

  const handleThreadSelect = (thread: Thread) => {
    setSelectedThread(thread);
  };

  const handleSendMessage = async (content: string) => {
    if (!selectedThread) return;
    
    try {
      await sendMessageMutation.mutateAsync({
        threadId: selectedThread.id,
        content
      });
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleNewThread = () => {
    // TODO: Implement new thread creation modal
    alert('New thread creation coming soon!');
  };

  if (threadsError) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Conversations</h2>
          <p className="text-gray-600 mb-4">Failed to load your conversations. Please try refreshing.</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Refresh
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Thread List */}
      <ThreadList
        threads={threads}
        selectedThreadId={selectedThread?.id || null}
        onThreadSelect={handleThreadSelect}
        onNewThread={handleNewThread}
      />

      {/* Chat View */}
      <div className="flex-1 flex flex-col">
        {selectedThread ? (
          <ChatView
            thread={selectedThread}
            messages={messages}
            isLoadingMessages={isLoadingMessages}
            onSendMessage={handleSendMessage}
            isSending={sendMessageMutation.isPending}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Welcome to Messenger</h3>
              <p className="text-gray-500 mb-4">
                {isLoadingThreads ? 'Loading conversations...' : 'Select a conversation to start messaging'}
              </p>
              {!isLoadingThreads && threads.length === 0 && (
                <button
                  onClick={handleNewThread}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Start New Conversation
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* User Menu */}
      <div className="absolute top-4 right-4">
        <div className="flex items-center space-x-3">
          <span className="text-sm text-gray-600">Welcome, {user?.username}</span>
          <button
            onClick={logout}
            className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export const ChatPage: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ChatPageContent />
    </QueryClientProvider>
  );
};