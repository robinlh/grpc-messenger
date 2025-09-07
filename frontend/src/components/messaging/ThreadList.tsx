import React from 'react';
import { Thread } from '../../types/messaging';
import { useAuth } from '../../hooks/useAuth';

interface ThreadListProps {
  threads: Thread[];
  selectedThreadId: number | null;
  onThreadSelect: (thread: Thread) => void;
  onNewThread: () => void;
}

export const ThreadList: React.FC<ThreadListProps> = ({
  threads,
  selectedThreadId,
  onThreadSelect,
  onNewThread
}) => {
  const { user } = useAuth();

  const getThreadDisplayName = (thread: Thread): string => {
    if (thread.name) {
      return thread.name;
    }
    
    // For DMs, show the other participant's name
    const otherParticipants = thread.participants.filter(p => p.id !== user?.id);
    if (otherParticipants.length === 1) {
      return otherParticipants[0].username;
    }
    
    // For group chats without names
    return thread.participants
      .filter(p => p.id !== user?.id)
      .map(p => p.username)
      .slice(0, 2)
      .join(', ') + (thread.participants.length > 3 ? '...' : '');
  };

  const formatTimestamp = (timestamp: number): string => {
    const date = new Date(timestamp * 1000);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    
    if (diffMinutes < 1) return 'now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString();
  };

  return (
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Messages</h2>
          <button
            onClick={onNewThread}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
            title="New Thread"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </button>
        </div>
      </div>

      {/* Thread List */}
      <div className="flex-1 overflow-y-auto">
        {threads.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            <p>No conversations yet</p>
            <button
              onClick={onNewThread}
              className="mt-2 text-blue-600 hover:text-blue-700"
            >
              Start a new conversation
            </button>
          </div>
        ) : (
          threads.map(thread => (
            <div
              key={thread.id}
              onClick={() => onThreadSelect(thread)}
              className={`
                p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors
                ${selectedThreadId === thread.id ? 'bg-blue-50 border-blue-200' : ''}
              `}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-gray-900 truncate">
                      {getThreadDisplayName(thread)}
                    </h3>
                    {thread.lastMessage && (
                      <span className="text-xs text-gray-500 ml-2">
                        {formatTimestamp(thread.lastMessage.createdAt)}
                      </span>
                    )}
                  </div>
                  
                  {thread.lastMessage && (
                    <p className="text-sm text-gray-600 truncate mt-1">
                      <span className="font-medium">
                        {thread.lastMessage.senderUsername}:
                      </span>{' '}
                      {thread.lastMessage.content}
                    </p>
                  )}
                  
                  {!thread.lastMessage && (
                    <p className="text-sm text-gray-400 mt-1">No messages yet</p>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};