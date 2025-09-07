import * as jspb from 'google-protobuf'



export class User extends jspb.Message {
  getId(): number;
  setId(value: number): User;

  getUsername(): string;
  setUsername(value: string): User;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): User.AsObject;
  static toObject(includeInstance: boolean, msg: User): User.AsObject;
  static serializeBinaryToWriter(message: User, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): User;
  static deserializeBinaryFromReader(message: User, reader: jspb.BinaryReader): User;
}

export namespace User {
  export type AsObject = {
    id: number,
    username: string,
  }
}

export class Message extends jspb.Message {
  getId(): number;
  setId(value: number): Message;

  getContent(): string;
  setContent(value: string): Message;

  getSenderId(): number;
  setSenderId(value: number): Message;

  getSenderUsername(): string;
  setSenderUsername(value: string): Message;

  getCreatedAt(): number;
  setCreatedAt(value: number): Message;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Message.AsObject;
  static toObject(includeInstance: boolean, msg: Message): Message.AsObject;
  static serializeBinaryToWriter(message: Message, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Message;
  static deserializeBinaryFromReader(message: Message, reader: jspb.BinaryReader): Message;
}

export namespace Message {
  export type AsObject = {
    id: number,
    content: string,
    senderId: number,
    senderUsername: string,
    createdAt: number,
  }
}

export class Thread extends jspb.Message {
  getId(): number;
  setId(value: number): Thread;

  getName(): string;
  setName(value: string): Thread;

  getParticipantsList(): Array<User>;
  setParticipantsList(value: Array<User>): Thread;
  clearParticipantsList(): Thread;
  addParticipants(value?: User, index?: number): User;

  getLastMessage(): Message | undefined;
  setLastMessage(value?: Message): Thread;
  hasLastMessage(): boolean;
  clearLastMessage(): Thread;

  getUpdatedAt(): number;
  setUpdatedAt(value: number): Thread;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Thread.AsObject;
  static toObject(includeInstance: boolean, msg: Thread): Thread.AsObject;
  static serializeBinaryToWriter(message: Thread, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Thread;
  static deserializeBinaryFromReader(message: Thread, reader: jspb.BinaryReader): Thread;
}

export namespace Thread {
  export type AsObject = {
    id: number,
    name: string,
    participantsList: Array<User.AsObject>,
    lastMessage?: Message.AsObject,
    updatedAt: number,
  }
}

export class GetThreadsRequest extends jspb.Message {
  getToken(): string;
  setToken(value: string): GetThreadsRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GetThreadsRequest.AsObject;
  static toObject(includeInstance: boolean, msg: GetThreadsRequest): GetThreadsRequest.AsObject;
  static serializeBinaryToWriter(message: GetThreadsRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): GetThreadsRequest;
  static deserializeBinaryFromReader(message: GetThreadsRequest, reader: jspb.BinaryReader): GetThreadsRequest;
}

export namespace GetThreadsRequest {
  export type AsObject = {
    token: string,
  }
}

export class GetThreadsResponse extends jspb.Message {
  getThreadsList(): Array<Thread>;
  setThreadsList(value: Array<Thread>): GetThreadsResponse;
  clearThreadsList(): GetThreadsResponse;
  addThreads(value?: Thread, index?: number): Thread;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GetThreadsResponse.AsObject;
  static toObject(includeInstance: boolean, msg: GetThreadsResponse): GetThreadsResponse.AsObject;
  static serializeBinaryToWriter(message: GetThreadsResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): GetThreadsResponse;
  static deserializeBinaryFromReader(message: GetThreadsResponse, reader: jspb.BinaryReader): GetThreadsResponse;
}

export namespace GetThreadsResponse {
  export type AsObject = {
    threadsList: Array<Thread.AsObject>,
  }
}

export class GetMessagesRequest extends jspb.Message {
  getToken(): string;
  setToken(value: string): GetMessagesRequest;

  getThreadId(): number;
  setThreadId(value: number): GetMessagesRequest;

  getLimit(): number;
  setLimit(value: number): GetMessagesRequest;

  getOffset(): number;
  setOffset(value: number): GetMessagesRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GetMessagesRequest.AsObject;
  static toObject(includeInstance: boolean, msg: GetMessagesRequest): GetMessagesRequest.AsObject;
  static serializeBinaryToWriter(message: GetMessagesRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): GetMessagesRequest;
  static deserializeBinaryFromReader(message: GetMessagesRequest, reader: jspb.BinaryReader): GetMessagesRequest;
}

export namespace GetMessagesRequest {
  export type AsObject = {
    token: string,
    threadId: number,
    limit: number,
    offset: number,
  }
}

export class GetMessagesResponse extends jspb.Message {
  getMessagesList(): Array<Message>;
  setMessagesList(value: Array<Message>): GetMessagesResponse;
  clearMessagesList(): GetMessagesResponse;
  addMessages(value?: Message, index?: number): Message;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GetMessagesResponse.AsObject;
  static toObject(includeInstance: boolean, msg: GetMessagesResponse): GetMessagesResponse.AsObject;
  static serializeBinaryToWriter(message: GetMessagesResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): GetMessagesResponse;
  static deserializeBinaryFromReader(message: GetMessagesResponse, reader: jspb.BinaryReader): GetMessagesResponse;
}

export namespace GetMessagesResponse {
  export type AsObject = {
    messagesList: Array<Message.AsObject>,
  }
}

export class SendMessageRequest extends jspb.Message {
  getToken(): string;
  setToken(value: string): SendMessageRequest;

  getThreadId(): number;
  setThreadId(value: number): SendMessageRequest;

  getContent(): string;
  setContent(value: string): SendMessageRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): SendMessageRequest.AsObject;
  static toObject(includeInstance: boolean, msg: SendMessageRequest): SendMessageRequest.AsObject;
  static serializeBinaryToWriter(message: SendMessageRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): SendMessageRequest;
  static deserializeBinaryFromReader(message: SendMessageRequest, reader: jspb.BinaryReader): SendMessageRequest;
}

export namespace SendMessageRequest {
  export type AsObject = {
    token: string,
    threadId: number,
    content: string,
  }
}

export class SendMessageResponse extends jspb.Message {
  getSuccess(): boolean;
  setSuccess(value: boolean): SendMessageResponse;

  getMessage(): string;
  setMessage(value: string): SendMessageResponse;

  getSentMessage(): Message | undefined;
  setSentMessage(value?: Message): SendMessageResponse;
  hasSentMessage(): boolean;
  clearSentMessage(): SendMessageResponse;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): SendMessageResponse.AsObject;
  static toObject(includeInstance: boolean, msg: SendMessageResponse): SendMessageResponse.AsObject;
  static serializeBinaryToWriter(message: SendMessageResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): SendMessageResponse;
  static deserializeBinaryFromReader(message: SendMessageResponse, reader: jspb.BinaryReader): SendMessageResponse;
}

export namespace SendMessageResponse {
  export type AsObject = {
    success: boolean,
    message: string,
    sentMessage?: Message.AsObject,
  }
}

export class CreateThreadRequest extends jspb.Message {
  getToken(): string;
  setToken(value: string): CreateThreadRequest;

  getParticipantUsernamesList(): Array<string>;
  setParticipantUsernamesList(value: Array<string>): CreateThreadRequest;
  clearParticipantUsernamesList(): CreateThreadRequest;
  addParticipantUsernames(value: string, index?: number): CreateThreadRequest;

  getName(): string;
  setName(value: string): CreateThreadRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): CreateThreadRequest.AsObject;
  static toObject(includeInstance: boolean, msg: CreateThreadRequest): CreateThreadRequest.AsObject;
  static serializeBinaryToWriter(message: CreateThreadRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): CreateThreadRequest;
  static deserializeBinaryFromReader(message: CreateThreadRequest, reader: jspb.BinaryReader): CreateThreadRequest;
}

export namespace CreateThreadRequest {
  export type AsObject = {
    token: string,
    participantUsernamesList: Array<string>,
    name: string,
  }
}

export class CreateThreadResponse extends jspb.Message {
  getSuccess(): boolean;
  setSuccess(value: boolean): CreateThreadResponse;

  getMessage(): string;
  setMessage(value: string): CreateThreadResponse;

  getThread(): Thread | undefined;
  setThread(value?: Thread): CreateThreadResponse;
  hasThread(): boolean;
  clearThread(): CreateThreadResponse;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): CreateThreadResponse.AsObject;
  static toObject(includeInstance: boolean, msg: CreateThreadResponse): CreateThreadResponse.AsObject;
  static serializeBinaryToWriter(message: CreateThreadResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): CreateThreadResponse;
  static deserializeBinaryFromReader(message: CreateThreadResponse, reader: jspb.BinaryReader): CreateThreadResponse;
}

export namespace CreateThreadResponse {
  export type AsObject = {
    success: boolean,
    message: string,
    thread?: Thread.AsObject,
  }
}

export class JoinThreadRequest extends jspb.Message {
  getToken(): string;
  setToken(value: string): JoinThreadRequest;

  getThreadId(): number;
  setThreadId(value: number): JoinThreadRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): JoinThreadRequest.AsObject;
  static toObject(includeInstance: boolean, msg: JoinThreadRequest): JoinThreadRequest.AsObject;
  static serializeBinaryToWriter(message: JoinThreadRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): JoinThreadRequest;
  static deserializeBinaryFromReader(message: JoinThreadRequest, reader: jspb.BinaryReader): JoinThreadRequest;
}

export namespace JoinThreadRequest {
  export type AsObject = {
    token: string,
    threadId: number,
  }
}

export class JoinThreadResponse extends jspb.Message {
  getSuccess(): boolean;
  setSuccess(value: boolean): JoinThreadResponse;

  getMessage(): string;
  setMessage(value: string): JoinThreadResponse;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): JoinThreadResponse.AsObject;
  static toObject(includeInstance: boolean, msg: JoinThreadResponse): JoinThreadResponse.AsObject;
  static serializeBinaryToWriter(message: JoinThreadResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): JoinThreadResponse;
  static deserializeBinaryFromReader(message: JoinThreadResponse, reader: jspb.BinaryReader): JoinThreadResponse;
}

export namespace JoinThreadResponse {
  export type AsObject = {
    success: boolean,
    message: string,
  }
}

export class LeaveThreadRequest extends jspb.Message {
  getToken(): string;
  setToken(value: string): LeaveThreadRequest;

  getThreadId(): number;
  setThreadId(value: number): LeaveThreadRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): LeaveThreadRequest.AsObject;
  static toObject(includeInstance: boolean, msg: LeaveThreadRequest): LeaveThreadRequest.AsObject;
  static serializeBinaryToWriter(message: LeaveThreadRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): LeaveThreadRequest;
  static deserializeBinaryFromReader(message: LeaveThreadRequest, reader: jspb.BinaryReader): LeaveThreadRequest;
}

export namespace LeaveThreadRequest {
  export type AsObject = {
    token: string,
    threadId: number,
  }
}

export class LeaveThreadResponse extends jspb.Message {
  getSuccess(): boolean;
  setSuccess(value: boolean): LeaveThreadResponse;

  getMessage(): string;
  setMessage(value: string): LeaveThreadResponse;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): LeaveThreadResponse.AsObject;
  static toObject(includeInstance: boolean, msg: LeaveThreadResponse): LeaveThreadResponse.AsObject;
  static serializeBinaryToWriter(message: LeaveThreadResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): LeaveThreadResponse;
  static deserializeBinaryFromReader(message: LeaveThreadResponse, reader: jspb.BinaryReader): LeaveThreadResponse;
}

export namespace LeaveThreadResponse {
  export type AsObject = {
    success: boolean,
    message: string,
  }
}

export class StreamThreadMessagesRequest extends jspb.Message {
  getToken(): string;
  setToken(value: string): StreamThreadMessagesRequest;

  getThreadId(): number;
  setThreadId(value: number): StreamThreadMessagesRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): StreamThreadMessagesRequest.AsObject;
  static toObject(includeInstance: boolean, msg: StreamThreadMessagesRequest): StreamThreadMessagesRequest.AsObject;
  static serializeBinaryToWriter(message: StreamThreadMessagesRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): StreamThreadMessagesRequest;
  static deserializeBinaryFromReader(message: StreamThreadMessagesRequest, reader: jspb.BinaryReader): StreamThreadMessagesRequest;
}

export namespace StreamThreadMessagesRequest {
  export type AsObject = {
    token: string,
    threadId: number,
  }
}

export class MessageStreamResponse extends jspb.Message {
  getNewMessage(): Message | undefined;
  setNewMessage(value?: Message): MessageStreamResponse;
  hasNewMessage(): boolean;
  clearNewMessage(): MessageStreamResponse;

  getError(): string;
  setError(value: string): MessageStreamResponse;

  getStatus(): ConnectionStatus | undefined;
  setStatus(value?: ConnectionStatus): MessageStreamResponse;
  hasStatus(): boolean;
  clearStatus(): MessageStreamResponse;

  getResponseCase(): MessageStreamResponse.ResponseCase;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): MessageStreamResponse.AsObject;
  static toObject(includeInstance: boolean, msg: MessageStreamResponse): MessageStreamResponse.AsObject;
  static serializeBinaryToWriter(message: MessageStreamResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): MessageStreamResponse;
  static deserializeBinaryFromReader(message: MessageStreamResponse, reader: jspb.BinaryReader): MessageStreamResponse;
}

export namespace MessageStreamResponse {
  export type AsObject = {
    newMessage?: Message.AsObject,
    error: string,
    status?: ConnectionStatus.AsObject,
  }

  export enum ResponseCase { 
    RESPONSE_NOT_SET = 0,
    NEW_MESSAGE = 1,
    ERROR = 2,
    STATUS = 3,
  }
}

export class ConnectionStatus extends jspb.Message {
  getConnected(): boolean;
  setConnected(value: boolean): ConnectionStatus;

  getMessage(): string;
  setMessage(value: string): ConnectionStatus;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ConnectionStatus.AsObject;
  static toObject(includeInstance: boolean, msg: ConnectionStatus): ConnectionStatus.AsObject;
  static serializeBinaryToWriter(message: ConnectionStatus, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ConnectionStatus;
  static deserializeBinaryFromReader(message: ConnectionStatus, reader: jspb.BinaryReader): ConnectionStatus;
}

export namespace ConnectionStatus {
  export type AsObject = {
    connected: boolean,
    message: string,
  }
}

