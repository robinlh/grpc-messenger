import { MessagingServiceClient } from '../generated/MessagingServiceClientPb';
import { 
  GetThreadsRequest,
  GetMessagesRequest,
  SendMessageRequest,
  CreateThreadRequest
} from '../generated/messaging_pb';
import { Thread, Message } from '../types/messaging';

const MESSAGING_CLIENT = new MessagingServiceClient('http://localhost:8080');

export class MessagingService {
  static async getThreads(token: string): Promise<Thread[]> {
    const request = new GetThreadsRequest();
    request.setToken(token);

    try {
      const response = await MESSAGING_CLIENT.getThreads(request);
      const threads = response.getThreadsList();
      
      return threads.map(thread => ({
        id: thread.getId(),
        name: thread.getName() || undefined,
        participants: thread.getParticipantsList().map(user => ({
          id: user.getId(),
          username: user.getUsername()
        })),
        lastMessage: thread.getLastMessage() ? {
          id: thread.getLastMessage()!.getId(),
          content: thread.getLastMessage()!.getContent(),
          senderId: thread.getLastMessage()!.getSenderId(),
          senderUsername: thread.getLastMessage()!.getSenderUsername(),
          createdAt: thread.getLastMessage()!.getCreatedAt()
        } : undefined,
        updatedAt: thread.getUpdatedAt()
      }));
    } catch (error) {
      console.error('Error fetching threads:', error);
      throw new Error('Failed to fetch threads');
    }
  }

  static async getMessages(token: string, threadId: number, limit = 50, offset = 0): Promise<Message[]> {
    const request = new GetMessagesRequest();
    request.setToken(token);
    request.setThreadId(threadId);
    request.setLimit(limit);
    request.setOffset(offset);

    try {
      const response = await MESSAGING_CLIENT.getMessages(request);
      const messages = response.getMessagesList();
      
      // Reverse to show chronological order (oldest first)
      return messages.reverse().map(message => ({
        id: message.getId(),
        content: message.getContent(),
        senderId: message.getSenderId(),
        senderUsername: message.getSenderUsername(),
        createdAt: message.getCreatedAt()
      }));
    } catch (error) {
      console.error('Error fetching messages:', error);
      throw new Error('Failed to fetch messages');
    }
  }

  static async sendMessage(token: string, threadId: number, content: string): Promise<Message> {
    const request = new SendMessageRequest();
    request.setToken(token);
    request.setThreadId(threadId);
    request.setContent(content);

    try {
      const response = await MESSAGING_CLIENT.sendMessage(request);
      
      if (response.getSuccess() && response.getSentMessage()) {
        const message = response.getSentMessage()!;
        return {
          id: message.getId(),
          content: message.getContent(),
          senderId: message.getSenderId(),
          senderUsername: message.getSenderUsername(),
          createdAt: message.getCreatedAt()
        };
      } else {
        throw new Error(response.getMessage() || 'Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      throw new Error('Failed to send message');
    }
  }

  static async createThread(token: string, participantUsernames: string[], name?: string): Promise<Thread> {
    const request = new CreateThreadRequest();
    request.setToken(token);
    request.setParticipantUsernamesList(participantUsernames);
    if (name) {
      request.setName(name);
    }

    try {
      const response = await MESSAGING_CLIENT.createThread(request);
      
      if (response.getSuccess() && response.getThread()) {
        const thread = response.getThread()!;
        return {
          id: thread.getId(),
          name: thread.getName() || undefined,
          participants: thread.getParticipantsList().map(user => ({
            id: user.getId(),
            username: user.getUsername()
          })),
          lastMessage: thread.getLastMessage() ? {
            id: thread.getLastMessage()!.getId(),
            content: thread.getLastMessage()!.getContent(),
            senderId: thread.getLastMessage()!.getSenderId(),
            senderUsername: thread.getLastMessage()!.getSenderUsername(),
            createdAt: thread.getLastMessage()!.getCreatedAt()
          } : undefined,
          updatedAt: thread.getUpdatedAt()
        };
      } else {
        throw new Error(response.getMessage() || 'Failed to create thread');
      }
    } catch (error) {
      console.error('Error creating thread:', error);
      throw new Error('Failed to create thread');
    }
  }
}