import sys
from datetime import datetime, timedelta, UTC

from messenger.config.database import get_db_session
from messenger.models.user import User
from messenger.models.thread import Thread, ThreadParticipant
from messenger.models.message import Message

def create_test_users(db):
    users = [
        {"username": "alice", "password_hash": "password123"},
        {"username": "bob", "password_hash": "password123"},
        {"username": "charlie", "password_hash": "password123"},
        {"username": "diana", "password_hash": "password123"},
    ]
    
    created_users = []
    for user_data in users:
        existing_user = db.query(User).filter(User.username == user_data["username"]).first()
        if existing_user:
            print(f"  User {user_data['username']} already exists, skipping...")
            created_users.append(existing_user)
            continue
            
        user = User(**user_data)
        db.add(user)
        created_users.append(user)
        print(f"  Created user: {user_data['username']}")
    
    db.commit()
    return created_users

def create_test_threads_and_messages(db, users):
    alice, bob, charlie, diana = users
    
    thread1 = Thread(name=None)  # DM thread (no name)
    db.add(thread1)
    db.commit()
    
    db.add(ThreadParticipant(thread_id=thread1.id, user_id=alice.id))
    db.add(ThreadParticipant(thread_id=thread1.id, user_id=bob.id))
    
    messages1 = [
        Message(content="Hey Bob! How's it going?", sender_id=alice.id, thread_id=thread1.id, 
                created_at=datetime.now(UTC) - timedelta(hours=2)),
        Message(content="Hi Alice! I'm doing well, thanks for asking. How about you?", 
                sender_id=bob.id, thread_id=thread1.id, 
                created_at=datetime.now(UTC) - timedelta(hours=1, minutes=30)),
        Message(content="Pretty good! Just working on this new messaging app", 
                sender_id=alice.id, thread_id=thread1.id, 
                created_at=datetime.now(UTC) - timedelta(minutes=45)),
        Message(content="That sounds exciting! What tech stack are you using?", 
                sender_id=bob.id, thread_id=thread1.id, 
                created_at=datetime.now(UTC) - timedelta(minutes=30)),
        Message(content="React + TypeScript on the frontend, Python + gRPC on the backend", 
                sender_id=alice.id, thread_id=thread1.id, 
                created_at=datetime.now(UTC) - timedelta(minutes=15)),
    ]

    for msg in messages1:
        db.add(msg)
    
    # group thread
    thread2 = Thread(name="Project Planning")
    db.add(thread2)
    db.commit()
    
    db.add(ThreadParticipant(thread_id=thread2.id, user_id=alice.id))
    db.add(ThreadParticipant(thread_id=thread2.id, user_id=charlie.id))
    db.add(ThreadParticipant(thread_id=thread2.id, user_id=diana.id))
    
    messages2 = [
        Message(content="Hey team! Ready to plan our next sprint?", 
                sender_id=alice.id, thread_id=thread2.id, 
                created_at=datetime.utcnow() - timedelta(hours=1)),
        Message(content="Absolutely! I've got some ideas for the UI improvements", 
                sender_id=charlie.id, thread_id=thread2.id, 
                created_at=datetime.utcnow() - timedelta(minutes=50)),
        Message(content="Great! I've been working on the backend optimizations", 
                sender_id=diana.id, thread_id=thread2.id, 
                created_at=datetime.utcnow() - timedelta(minutes=40)),
        Message(content="Perfect! Let's sync up tomorrow morning", 
                sender_id=alice.id, thread_id=thread2.id, 
                created_at=datetime.utcnow() - timedelta(minutes=20)),
    ]
    
    for msg in messages2:
        db.add(msg)
    
    db.commit()
    print(f"  Created {len(messages1)} messages in Alice-Bob thread")
    print(f"  Created {len(messages2)} messages in Project Planning thread")

def main():
    try:
        print("Seeding database with test data...")
        db = get_db_session()
        
        print("Creating test users...")
        users = create_test_users(db)
        
        print("Creating test threads and messages...")
        create_test_threads_and_messages(db, users)
        
        db.close()
        print("✅ Database seeded successfully!")
        print("\nTest users created:")
        print("  - alice (password: password123)")
        print("  - bob (password: password123)")  
        print("  - charlie (password: password123)")
        print("  - diana (password: password123)")
        
    except Exception as e:
        print(f"❌ Error seeding database: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()