import React, { useState } from 'react';
import { useCreateThread } from '../../hooks/useThreads';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

interface CreateThreadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onThreadCreated?: (threadId: number) => void;
}

export const CreateThreadModal: React.FC<CreateThreadModalProps> = ({
  isOpen,
  onClose,
  onThreadCreated
}) => {
  const [participants, setParticipants] = useState('');
  const [threadName, setThreadName] = useState('');
  const [threadType, setThreadType] = useState<'dm' | 'group'>('dm');
  
  const createThreadMutation = useCreateThread();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const participantUsernames = participants
      .split(',')
      .map(username => username.trim())
      .filter(username => username.length > 0);

    if (participantUsernames.length === 0) {
      alert('Please enter at least one participant username');
      return;
    }

    // For DMs, ensure only 1 participant (the other person)
    if (threadType === 'dm' && participantUsernames.length > 1) {
      alert('Direct messages can only have one other participant');
      return;
    }

    // For group threads, require a name
    if (threadType === 'group' && !threadName.trim()) {
      alert('Group conversations must have a name');
      return;
    }

    try {
      const thread = await createThreadMutation.mutateAsync({
        participantUsernames,
        name: threadType === 'group' ? threadName.trim() : undefined
      });

      // Reset form
      setParticipants('');
      setThreadName('');
      setThreadType('dm');
      
      // Close modal and optionally select the new thread
      onClose();
      onThreadCreated?.(thread.id);
      
    } catch (error) {
      console.error('Failed to create thread:', error);
      alert('Failed to create conversation. Please try again.');
    }
  };

  const handleCancel = () => {
    // Reset form
    setParticipants('');
    setThreadName('');
    setThreadType('dm');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Start New Conversation
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Thread Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Conversation Type
            </label>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="threadType"
                  value="dm"
                  checked={threadType === 'dm'}
                  onChange={(e) => setThreadType(e.target.value as 'dm' | 'group')}
                  className="mr-2"
                />
                Direct Message
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="threadType"
                  value="group"
                  checked={threadType === 'group'}
                  onChange={(e) => setThreadType(e.target.value as 'dm' | 'group')}
                  className="mr-2"
                />
                Group Chat
              </label>
            </div>
          </div>

          {/* Group Name (only for group chats) */}
          {threadType === 'group' && (
            <div>
              <label htmlFor="threadName" className="block text-sm font-medium text-gray-700 mb-1">
                Group Name
              </label>
              <Input
                id="threadName"
                value={threadName}
                onChange={(e) => setThreadName(e.target.value)}
                placeholder="Enter group name..."
                className="w-full"
              />
            </div>
          )}

          {/* Participants */}
          <div>
            <label htmlFor="participants" className="block text-sm font-medium text-gray-700 mb-1">
              {threadType === 'dm' ? 'Username' : 'Participants'}
            </label>
            <Input
              id="participants"
              value={participants}
              onChange={(e) => setParticipants(e.target.value)}
              placeholder={
                threadType === 'dm' 
                  ? 'Enter username...' 
                  : 'Enter usernames separated by commas...'
              }
              className="w-full"
            />
            <p className="text-xs text-gray-500 mt-1">
              {threadType === 'dm' 
                ? 'Enter the username of the person you want to message'
                : 'Separate multiple usernames with commas (e.g., jacob, jakob, joachim)'
              }
            </p>
          </div>

          {/* Buttons */}
          <div className="flex space-x-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={handleCancel}
              className="flex-1"
              disabled={createThreadMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              className="flex-1"
              isLoading={createThreadMutation.isPending}
            >
              Create
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};