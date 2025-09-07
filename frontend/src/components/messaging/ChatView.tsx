import React, { useEffect, useRef } from 'react';
import { Thread, Message } from '../../types/messaging';
import { useAuth } from '../../hooks/useAuth';
import { useMessageStream } from '../../hooks/useMessageStream';
import { MessageInput } from './MessageInput';
import { ConnectionStatus } from '../ui/ConnectionStatus';

interface ChatViewProps {
  thread: Thread;
  messages: Message[];
  isLoadingMessages: boolean;
  onSendMessage: (content: string) => void;
  isSending: boolean;
}

export const ChatView: React.FC<ChatViewProps> = ({
  thread,
  messages,
  isLoadingMessages,
  onSendMessage,
  isSending
}) => {
  const { user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Set up real-time streaming for this thread
  const { isConnected } = useMessageStream(thread.id);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getThreadDisplayName = (): string => {
    if (thread.name) {
      return thread.name;
    }
    
    // For DMs, show the other participant's name
    const otherParticipants = thread.participants.filter(p => p.id !== user?.id);
    if (otherParticipants.length === 1) {
      return otherParticipants[0].username;
    }
    
    return thread.participants
      .filter(p => p.id !== user?.id)
      .map(p => p.username)
      .join(', ');
  };

  const formatMessageTime = (timestamp: number): string => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (isLoadingMessages) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-500 mt-2">Loading messages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <h2 className="text-lg font-semibold text-gray-900">
              {getThreadDisplayName()}
            </h2>
            <div className="ml-3 text-sm text-gray-500">
              {thread.participants.length} participant{thread.participants.length > 1 ? 's' : ''}
            </div>
          </div>
          <ConnectionStatus isConnected={isConnected} />
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 mt-8">
            <p>No messages yet in this conversation.</p>
            <p className="text-sm mt-1">Send a message to get started!</p>
          </div>
        ) : (
          messages.map((message) => {
            const isOwnMessage = message.senderId === user?.id;
            
            return (
              <div
                key={message.id}
                className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`
                    max-w-xs lg:max-w-md px-4 py-2 rounded-lg
                    ${isOwnMessage
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-900 border border-gray-200'
                    }
                  `}
                >
                  {!isOwnMessage && (
                    <div className="text-xs font-medium mb-1 text-gray-600">
                      {message.senderUsername}
                    </div>
                  )}
                  <div className="text-sm">{message.content}</div>
                  <div
                    className={`text-xs mt-1 ${
                      isOwnMessage ? 'text-blue-100' : 'text-gray-500'
                    }`}
                  >
                    {formatMessageTime(message.createdAt)}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <MessageInput onSendMessage={onSendMessage} disabled={isSending} />
    </div>
  );
};