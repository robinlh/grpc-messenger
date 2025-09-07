#!/usr/bin/env python3
"""
Test client for the new streaming architecture.
Tests JoinThread, LeaveThread, and StreamThreadMessages RPCs.
"""

import grpc
import time
import threading
from messenger.generated import messaging_pb2, messaging_pb2_grpc
from messenger.generated import auth_pb2, auth_pb2_grpc

def test_streaming():
    # Connect to the gRPC server
    channel = grpc.insecure_channel('localhost:50051')
    stub = messaging_pb2_grpc.MessagingServiceStub(channel)
    
    # You'll need valid tokens - get these from login first
    # For testing, you can use the existing test tokens or login first
    token1 = "your_token_here"  # Replace with actual token
    token2 = "another_token_here"  # Replace with actual token
    thread_id = 1  # Replace with actual thread ID
    
    print("=== Testing New Streaming Architecture ===")
    
    # Test 1: JoinThread
    print("\n1. Testing JoinThread...")
    try:
        join_request = messaging_pb2.JoinThreadRequest(
            token=token1,
            thread_id=thread_id
        )
        join_response = stub.JoinThread(join_request)
        print(f"JoinThread response: success={join_response.success}, message='{join_response.message}'")
    except grpc.RpcError as e:
        print(f"JoinThread failed: {e}")
    
    # Test 2: Start streaming in background thread
    print("\n2. Starting StreamThreadMessages...")
    streaming_active = True
    
    def stream_messages():
        try:
            stream_request = messaging_pb2.StreamThreadMessagesRequest(
                token=token1,
                thread_id=thread_id
            )
            
            print("Starting message stream...")
            for response in stub.StreamThreadMessages(stream_request):
                if not streaming_active:
                    break
                    
                if response.HasField('new_message'):
                    msg = response.new_message
                    print(f"Received message: [{msg.sender_username}] {msg.content}")
                elif response.HasField('error'):
                    print(f"Stream error: {response.error}")
                elif response.HasField('status'):
                    status = response.status
                    print(f"Connection status: connected={status.connected}, message='{status.message}'")
        except grpc.RpcError as e:
            print(f"Streaming failed: {e}")
    
    # Start streaming in background
    stream_thread = threading.Thread(target=stream_messages)
    stream_thread.daemon = True
    stream_thread.start()
    
    # Wait a bit for connection
    time.sleep(2)
    
    # Test 3: Send a message to trigger streaming
    print("\n3. Sending test message...")
    try:
        send_request = messaging_pb2.SendMessageRequest(
            token=token1,
            thread_id=thread_id,
            content="Test message for new streaming architecture!"
        )
        send_response = stub.SendMessage(send_request)
        print(f"SendMessage response: success={send_response.success}, message='{send_response.message}'")
    except grpc.RpcError as e:
        print(f"SendMessage failed: {e}")
    
    # Wait to see if message is received via stream
    print("\nWaiting 5 seconds to see streamed messages...")
    time.sleep(5)
    
    # Test 4: LeaveThread
    print("\n4. Testing LeaveThread...")
    try:
        leave_request = messaging_pb2.LeaveThreadRequest(
            token=token1,
            thread_id=thread_id
        )
        leave_response = stub.LeaveThread(leave_request)
        print(f"LeaveThread response: success={leave_response.success}, message='{leave_response.message}'")
    except grpc.RpcError as e:
        print(f"LeaveThread failed: {e}")
    
    # Stop streaming
    streaming_active = False
    time.sleep(1)
    
    print("\n=== Test Complete ===")

def test_streaming_with_token(token):
    channel = grpc.insecure_channel('localhost:50051')
    stub = messaging_pb2_grpc.MessagingServiceStub(channel)
    
    # First get threads to find a valid thread_id
    try:
        threads_request = messaging_pb2.GetThreadsRequest(token=token)
        threads_response = stub.GetThreads(threads_request)
        
        if not threads_response.threads:
            print("No threads found. Creating a test thread...")
            create_request = messaging_pb2.CreateThreadRequest(
                token=token,
                participant_usernames=["alice"],
                name="Test Thread"
            )
            create_response = stub.CreateThread(create_request)
            if create_response.success:
                thread_id = create_response.thread.id
                print(f"Created test thread with ID: {thread_id}")
            else:
                print("Failed to create test thread")
                return
        else:
            thread_id = threads_response.threads[0].id
            print(f"Using existing thread ID: {thread_id}")
        
        # Now test the new streaming methods
        print("\n=== Testing New Streaming Architecture ===")
        
        # Test 1: JoinThread
        print("\n1. Testing JoinThread...")
        join_request = messaging_pb2.JoinThreadRequest(
            token=token,
            thread_id=thread_id
        )
        join_response = stub.JoinThread(join_request)
        print(f"JoinThread: success={join_response.success}, message='{join_response.message}'")
        
        # Test 2: Start streaming
        print("\n2. Starting StreamThreadMessages...")
        streaming_active = True
        
        def stream_messages():
            try:
                stream_request = messaging_pb2.StreamThreadMessagesRequest(
                    token=token,
                    thread_id=thread_id
                )
                
                for response in stub.StreamThreadMessages(stream_request):
                    if not streaming_active:
                        break
                        
                    if response.HasField('new_message'):
                        msg = response.new_message
                        print(f"📨 Streamed message: [{msg.sender_username}] {msg.content}")
                    elif response.HasField('error'):
                        print(f"❌ Stream error: {response.error}")
                    elif response.HasField('status'):
                        status = response.status
                        print(f"🔗 Status: connected={status.connected}, message='{status.message}'")
                        
            except grpc.RpcError as e:
                print(f"❌ Streaming failed: {e}")
        
        # Start streaming in background
        stream_thread = threading.Thread(target=stream_messages)
        stream_thread.daemon = True
        stream_thread.start()
        
        time.sleep(2)  # Wait for connection
        
        # Test 3: Send message
        print("\n3. Sending test message...")
        send_request = messaging_pb2.SendMessageRequest(
            token=token,
            thread_id=thread_id,
            content="🚀 Test message for new streaming architecture!"
        )
        send_response = stub.SendMessage(send_request)
        print(f"SendMessage: success={send_response.success}")
        
        # Wait to see streamed response
        print("\n⏳ Waiting 3 seconds for streamed message...")
        time.sleep(3)
        
        # Test 4: LeaveThread
        print("\n4. Testing LeaveThread...")
        leave_request = messaging_pb2.LeaveThreadRequest(
            token=token,
            thread_id=thread_id
        )
        leave_response = stub.LeaveThread(leave_request)
        print(f"LeaveThread: success={leave_response.success}, message='{leave_response.message}'")
        
        # Stop streaming
        streaming_active = False
        time.sleep(1)
        
        print("\n✅ Test complete!")
        
    except grpc.RpcError as e:
        print(f"❌ Test failed: {e}")

if __name__ == "__main__":
    # Quick login test first to get tokens
    print("First, let's get a valid token by logging in...")
    
    channel = grpc.insecure_channel('localhost:50051')
    auth_stub = auth_pb2_grpc.AuthServiceStub(channel)
    
    try:
        login_request = auth_pb2.LoginRequest(
            username="alice",  # Use existing test user
            password="password123"
        )
        login_response = auth_stub.Login(login_request)
        
        if login_response.success:
            token = login_response.token
            print(f"Login successful! Token: {token[:20]}...")
            
            # Now test streaming with this token
            test_streaming_with_token(token)
        else:
            print(f"Login failed: {login_response.message}")
            print("Please make sure the backend is running and test users exist.")
            
    except grpc.RpcError as e:
        print(f"Login RPC failed: {e}")
        print("Please make sure the backend is running on localhost:50051")