import grpc
import time
import threading
from messenger.generated import auth_pb2, auth_pb2_grpc, messaging_pb2, messaging_pb2_grpc

def get_token(username, password):
    channel = grpc.insecure_channel('localhost:50051')
    auth_stub = auth_pb2_grpc.AuthServiceStub(channel)
    
    response = auth_stub.Login(auth_pb2.LoginRequest(
        username=username,
        password=password
    ))
    
    if response.success:
        print(f"✓ Logged in as {response.username} (ID: {response.user_id})")
        return response.token
    else:
        print(f"✗ Login failed: {response.message}")
        return None

def send_message(token, thread_id, content):
    channel = grpc.insecure_channel('localhost:50051')
    messaging_stub = messaging_pb2_grpc.MessagingServiceStub(channel)
    
    response = messaging_stub.SendMessage(messaging_pb2.SendMessageRequest(
        token=token,
        thread_id=thread_id,
        content=content
    ))
    
    if response.success:
        print(f"✓ Message sent: {response.sent_message.content}")
    else:
        print(f"✗ Failed to send message: {response.message}")

def stream_messages(username, token, thread_id):
    channel = grpc.insecure_channel('localhost:50051')
    messaging_stub = messaging_pb2_grpc.MessagingServiceStub(channel)
    
    def generate_requests():
        yield messaging_pb2.StreamMessageRequest(
            join=messaging_pb2.JoinStream(token=token, thread_id=thread_id)
        )
        
        while True:
            time.sleep(1)
    
    try:
        print(f"[{username}] 🔗 Connecting to stream for thread {thread_id}...")
        
        response_stream = messaging_stub.StreamMessages(generate_requests())
        
        for response in response_stream:
            if response.HasField('new_message'):
                msg = response.new_message
                print(f"[{username}] Received: '{msg.content}' from {msg.sender_username}")
            elif response.HasField('error'):
                print(f"[{username}] Stream error: {response.error}")
                break
                
    except grpc.RpcError as e:
        print(f"[{username}] Stream connection error: {e}")
    except KeyboardInterrupt:
        print(f"[{username}] Stream connection closed")

def demo_real_time_messaging():
    print("=== Real-time Messaging Demo ===\n")
    
    alice_token = get_token("alice", "password123")
    bob_token = get_token("bob", "password123")
    
    if not alice_token or not bob_token:
        print("Failed to get tokens, exiting")
        return
    
    print()
    
    thread_id = 1
    
    bob_thread = threading.Thread(
        target=stream_messages, 
        args=("Bob", bob_token, thread_id),
        daemon=True
    )
    bob_thread.start()
    
    alice_thread = threading.Thread(
        target=stream_messages, 
        args=("Alice", alice_token, thread_id),
        daemon=True
    )
    alice_thread.start()
    
    time.sleep(2)
    print()
    
    print("Alice sending messages...")
    send_message(alice_token, thread_id, "Hey Bob! Testing real-time messaging")
    time.sleep(1)
    
    send_message(alice_token, thread_id, "This should appear instantly on your stream!")
    time.sleep(1)
    
    print("\nBob replying...")
    send_message(bob_token, thread_id, "Wow, I got that immediately!")
    time.sleep(1)
    
    send_message(bob_token, thread_id, "Real-time messaging works perfectly!")
    
    print(f"\nKeeping streams active for 10 seconds...")
    print("   (Both Alice and Bob should see each other's messages instantly)")
    time.sleep(10)
    
    print("\nDemo complete! Real-time messaging is working.")

if __name__ == "__main__":
    demo_real_time_messaging()