export interface Message {
  id: number;
  content: string;
  senderId: number;
  senderUsername: string;
  createdAt: number; // Unix timestamp
}

export interface User {
  id: number;
  username: string;
}

export interface Thread {
  id: number;
  name?: string; // null for DMs
  participants: User[];
  lastMessage?: Message;
  updatedAt: number; // Unix timestamp
}

export interface MessagingState {
  threads: Thread[];
  currentThread: Thread | null;
  messages: Message[];
  isLoading: boolean;
  error: string | null;
}