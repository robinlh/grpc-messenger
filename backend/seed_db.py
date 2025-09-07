import sys
from datetime import datetime, UTC

import bcrypt

from messenger.config.database import get_db_session
from messenger.models.message import Message
from messenger.models.thread import Thread, ThreadParticipant
from messenger.models.user import User


def hash_password(password: str) -> str:
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')

def create_test_users(db):
    users = [
        {"username": "jacob", "password_hash": hash_password("password123")},
        {"username": "jakob", "password_hash": hash_password("password123")},
        {"username": "joachim", "password_hash": hash_password("password123")},
        {"username": "erik", "password_hash": hash_password("password123")},
        {"username": "zino", "password_hash": hash_password("password123")},
        {"username": "robin", "password_hash": hash_password("password123")},
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
    jacob, jakob, joachim, erik, zino, robin = users
    
    team_thread = Thread(name="Team Legora")
    db.add(team_thread)
    db.commit()
    
    for user in users:
        db.add(ThreadParticipant(thread_id=team_thread.id, user_id=user.id))
    
    message = Message(
        content="Hello team Legora!", 
        sender_id=robin.id, 
        thread_id=team_thread.id, 
        created_at=datetime.now(UTC)
    )
    db.add(message)
    
    db.commit()
    print(f"  Created Team Legora thread with 1 message from Robin")

def main():
    try:
        print("Seeding database with test data...")
        db = get_db_session()
        
        print("Creating test users...")
        users = create_test_users(db)
        
        print("Creating test threads and messages...")
        create_test_threads_and_messages(db, users)
        
        db.close()
        print("Database seeded successfully!")
        print("\nTeam Legora users created:")
        print("  - jacob (password: password123)")
        print("  - jakob (password: password123)")
        print("  - joachim (password: password123)")
        print("  - erik (password: password123)")
        print("  - zino (password: password123)")
        print("  - robin (password: password123)")
        
    except Exception as e:
        print(f"Error seeding database: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()