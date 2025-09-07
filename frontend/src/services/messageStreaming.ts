import { MessagingServiceClient } from '../generated/MessagingServiceClientPb';
import { 
  JoinThreadRequest, 
  JoinThreadResponse,
  LeaveThreadRequest,
  StreamThreadMessagesRequest,
  MessageStreamResponse
} from '../generated/messaging_pb';
import { Message } from '../types/messaging';

export interface StreamingConnection {
  stop: () => void;
}

export class MessageStreamingService {
  private static client = new MessagingServiceClient('http://localhost:8080');
  private static activeStreams = new Map<number, StreamingConnection>();

  static startStreaming(
    token: string,
    threadId: number,
    onNewMessage: (message: Message) => void,
    onConnectionStatus: (connected: boolean, message?: string) => void,
    onError?: (error: string) => void
  ): StreamingConnection {
    // Stop existing streaming for this thread
    this.stopStreaming(threadId);

    console.log(`[Streaming] Starting stream for thread ${threadId}`);

    let isActive = true;
    let stream: any = null;

    const startStream = async () => {
      try {
        // Step 1: Join thread (verify permissions)
        const joinRequest = new JoinThreadRequest();
        joinRequest.setToken(token);
        joinRequest.setThreadId(threadId);

        const joinResponse = await new Promise<JoinThreadResponse>((resolve, reject) => {
          this.client.joinThread(joinRequest, {}, (err, response) => {
            if (err) reject(err);
            else resolve(response);
          });
        });

        if (!joinResponse.getSuccess()) {
          throw new Error(`Failed to join thread: ${joinResponse.getMessage()}`);
        }

        console.log(`[Streaming] Successfully joined thread ${threadId}: ${joinResponse.getMessage()}`);

        // Step 2: Start streaming messages
        if (!isActive) return; // Check if we should still be running

        const streamRequest = new StreamThreadMessagesRequest();
        streamRequest.setToken(token);
        streamRequest.setThreadId(threadId);

        stream = this.client.streamThreadMessages(streamRequest, {});

        stream.on('data', (response: MessageStreamResponse) => {
          if (!isActive) return;

          const responseCase = response.getResponseCase();
          
          if (responseCase === MessageStreamResponse.ResponseCase.NEW_MESSAGE) {
            const msg = response.getNewMessage()!;
            const message: Message = {
              id: msg.getId(),
              content: msg.getContent(),
              senderId: msg.getSenderId(),
              senderUsername: msg.getSenderUsername(),
              createdAt: msg.getCreatedAt()
            };
            console.log(`[Streaming] Received message in thread ${threadId}: ${message.content}`);
            onNewMessage(message);
            
          } else if (responseCase === MessageStreamResponse.ResponseCase.ERROR) {
            const errorMsg = response.getError();
            console.error(`[Streaming] Stream error for thread ${threadId}: ${errorMsg}`);
            onError?.(errorMsg);
            
          } else if (responseCase === MessageStreamResponse.ResponseCase.STATUS) {
            const status = response.getStatus()!;
            const connected = status.getConnected();
            const message = status.getMessage();
            console.log(`[Streaming] Connection status for thread ${threadId}: connected=${connected}, message=${message}`);
            onConnectionStatus(connected, message);
          }
        });

        stream.on('error', (error: any) => {
          if (!isActive) return;
          console.error(`[Streaming] Stream error for thread ${threadId}:`, error);
          onError?.(`Stream error: ${error.message}`);
          // Try to reconnect after a delay
          if (isActive) {
            setTimeout(() => {
              if (isActive) {
                console.log(`[Streaming] Reconnecting stream for thread ${threadId}`);
                startStream();
              }
            }, 3000);
          }
        });

        stream.on('end', () => {
          console.log(`[Streaming] Stream ended for thread ${threadId}`);
          onConnectionStatus(false, 'Stream ended');
        });

      } catch (error: any) {
        console.error(`[Streaming] Failed to start stream for thread ${threadId}:`, error);
        onError?.(`Failed to start streaming: ${error.message}`);
      }
    };

    // Start the stream
    startStream();

    const connection: StreamingConnection = {
      stop: async () => {
        console.log(`[Streaming] Stopping stream for thread ${threadId}`);
        isActive = false;
        
        if (stream) {
          stream.cancel();
        }

        // Leave thread (clean disconnect)
        try {
          const leaveRequest = new LeaveThreadRequest();
          leaveRequest.setToken(token);
          leaveRequest.setThreadId(threadId);

          await new Promise<void>((resolve, reject) => {
            this.client.leaveThread(leaveRequest, {}, (err, response) => {
              if (err) {
                console.warn(`[Streaming] Error leaving thread ${threadId}:`, err);
              } else {
                console.log(`[Streaming] Left thread ${threadId}: ${response.getMessage()}`);
              }
              resolve(); // Always resolve, leaving is best-effort
            });
          });
        } catch (error) {
          console.warn(`[Streaming] Error leaving thread ${threadId}:`, error);
        }

        this.activeStreams.delete(threadId);
      }
    };

    this.activeStreams.set(threadId, connection);
    return connection;
  }

  static stopStreaming(threadId: number): void {
    const connection = this.activeStreams.get(threadId);
    if (connection) {
      connection.stop();
    }
  }

  static stopAllStreaming(): void {
    console.log('[Streaming] Stopping all active streams');
    Array.from(this.activeStreams.values()).forEach(connection => {
      connection.stop();
    });
    this.activeStreams.clear();
  }

  static isStreaming(threadId: number): boolean {
    return this.activeStreams.has(threadId);
  }
}